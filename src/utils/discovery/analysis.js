// WAF-based analysis: scores, issues, and recommendations.

const T = (r, x) => (r.azureType || '').toLowerCase() === x.toLowerCase();
const isType = (r, prefix) => (r.azureType || '').toLowerCase().startsWith(prefix.toLowerCase());

/**
 * Analyze a normalized resource set against Azure Well-Architected Framework
 * pillars and CAF landing-zone practices.
 *
 * @returns { scores, issues, recommendations }
 */
export function analyzeArchitecture(resources, edges) {
  const issues = [];
  const recs = [];

  const push = (severity, category, message, resource = null, rec = null) => {
    issues.push({ severity, category, message, resource: resource?.name, resourceId: resource?.resourceId });
    if (rec) recs.push({ category, message: rec, related: resource?.name });
  };

  // ── Public exposure checks ─────────────────────────────────────────────
  for (const r of resources) {
    // Storage account public access
    if (T(r, 'Microsoft.Storage/storageAccounts')) {
      const props = r.properties || {};
      if (props.allowBlobPublicAccess === true || props.publicNetworkAccess === 'Enabled') {
        push('high', 'security',
          `Storage account "${r.name}" allows public network access`,
          r,
          `Disable public network access and use Private Endpoints for "${r.name}"`);
      }
      if (props.minimumTlsVersion && props.minimumTlsVersion !== 'TLS1_2') {
        push('medium', 'security', `Storage "${r.name}" is not enforcing TLS 1.2`, r,
          `Set minimumTlsVersion=TLS1_2 on "${r.name}"`);
      }
      if (props.supportsHttpsTrafficOnly === false) {
        push('high', 'security', `Storage "${r.name}" allows unencrypted HTTP traffic`, r,
          `Enable supportsHttpsTrafficOnly on "${r.name}"`);
      }
    }

    // SQL public network access
    if (T(r, 'Microsoft.Sql/servers')) {
      const props = r.properties || {};
      if (props.publicNetworkAccess === 'Enabled') {
        push('high', 'security', `SQL Server "${r.name}" exposes public network access`, r,
          `Disable public network access and connect via Private Endpoint`);
      }
    }

    // Cosmos DB public exposure
    if (T(r, 'Microsoft.DocumentDB/databaseAccounts')) {
      const props = r.properties || {};
      if (props.publicNetworkAccess === 'Enabled') {
        push('medium', 'security', `Cosmos DB "${r.name}" is publicly reachable`, r,
          `Restrict Cosmos DB to Private Endpoint / IP allowlist`);
      }
    }

    // VM without Managed Identity
    if (T(r, 'Microsoft.Compute/virtualMachines') && !r.identity) {
      push('medium', 'identity', `VM "${r.name}" has no Managed Identity`, r,
        `Assign a Managed Identity to "${r.name}" to avoid stored credentials`);
    }

    // Public IP attached — flag if no NSG/firewall in path
    if (T(r, 'Microsoft.Network/publicIPAddresses')) {
      const props = r.properties || {};
      if (props.publicIPAllocationMethod && !props.ipConfiguration) {
        push('low', 'cost', `Public IP "${r.name}" is unattached (potential waste)`, r,
          `Delete unattached public IP "${r.name}"`);
      }
    }

    // Subnet without NSG
    if (T(r, 'Microsoft.Network/virtualNetworks/subnets')) {
      const props = r.properties || {};
      if (!props.networkSecurityGroup) {
        push('medium', 'security', `Subnet "${r.name}" has no NSG associated`, r,
          `Attach an NSG to subnet "${r.name}"`);
      }
    }

    // Availability — VM in single zone
    if (T(r, 'Microsoft.Compute/virtualMachines')) {
      const zones = r.raw?.zones;
      if (!zones || zones.length === 0) {
        push('low', 'reliability', `VM "${r.name}" not deployed to an availability zone`, r,
          `Deploy "${r.name}" across Availability Zones for high availability`);
      }
    }

    // Missing tags
    if (!r.tags || Object.keys(r.tags).length === 0) {
      if (isTaggable(r)) {
        push('low', 'operations', `Resource "${r.name}" has no tags`, r,
          `Apply tags (env, owner, cost-center) to "${r.name}"`);
      }
    }

    // Key Vault soft delete / purge protection
    if (T(r, 'Microsoft.KeyVault/vaults')) {
      const props = r.properties || {};
      if (props.enableSoftDelete === false) push('high', 'reliability',
        `Key Vault "${r.name}" has soft-delete disabled`, r,
        `Enable soft-delete and purge protection on "${r.name}"`);
      if (props.enablePurgeProtection !== true) push('medium', 'reliability',
        `Key Vault "${r.name}" does not have purge protection`, r,
        `Enable purge protection on "${r.name}"`);
    }

    // App Service without HTTPS-only
    if (T(r, 'Microsoft.Web/sites')) {
      const props = r.properties || {};
      if (props.httpsOnly === false) push('high', 'security',
        `App Service "${r.name}" allows HTTP traffic`, r,
        `Enable HTTPS-only on "${r.name}"`);
    }
  }

  // ── Backup / disaster recovery ─────────────────────────────────────────
  const hasRecoveryVault = resources.some(r => T(r, 'Microsoft.RecoveryServices/vaults') || T(r, 'Microsoft.DataProtection/backupVaults'));
  const hasVMs = resources.some(r => T(r, 'Microsoft.Compute/virtualMachines'));
  if (hasVMs && !hasRecoveryVault) {
    push('high', 'reliability', 'No Recovery Services Vault found — VMs are unprotected', null,
      'Deploy a Recovery Services Vault and enable Azure Backup for all VMs');
  }

  // ── Monitoring coverage ────────────────────────────────────────────────
  const hasLA = resources.some(r => T(r, 'Microsoft.OperationalInsights/workspaces'));
  if (!hasLA && resources.length >= 3) {
    push('high', 'operations', 'No Log Analytics workspace detected — no central telemetry', null,
      'Deploy a Log Analytics workspace and route diagnostic settings from all resources');
  }

  // ── Defender ───────────────────────────────────────────────────────────
  const hasDefender = resources.some(r => T(r, 'Microsoft.Security/pricings'));
  if (!hasDefender) {
    push('medium', 'security', 'Microsoft Defender for Cloud not detected in the export', null,
      'Enable Defender for Cloud plans for Servers, Storage, SQL, and Key Vault');
  }

  // ── Compute scores ─────────────────────────────────────────────────────
  const scores = computeScores(resources, issues);
  return { scores, issues, recommendations: dedupe(recs) };
}

function isTaggable(r) {
  const skip = ['microsoft.network/virtualnetworks/subnets', 'microsoft.resources/deployments'];
  return !skip.includes((r.azureType || '').toLowerCase());
}

function dedupe(arr) {
  const seen = new Set();
  return arr.filter(r => {
    const k = `${r.category}|${r.message}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function computeScores(resources, issues) {
  const weights = { high: 15, medium: 8, low: 3 };
  const pillars = ['security', 'reliability', 'cost', 'performance', 'operations', 'identity'];
  const base = {};
  for (const p of pillars) base[p] = 100;

  const catToPillars = {
    security: ['security'],
    identity: ['security', 'identity'],
    reliability: ['reliability'],
    cost: ['cost'],
    operations: ['operations'],
    performance: ['performance'],
  };

  for (const issue of issues) {
    const targets = catToPillars[issue.category] || [issue.category];
    for (const t of targets) {
      if (base[t] != null) base[t] -= (weights[issue.severity] || 5);
    }
  }

  // Clamp 0..100
  for (const k of Object.keys(base)) base[k] = Math.max(0, Math.min(100, base[k]));

  const overall = Math.round(
    (base.security + base.reliability + base.cost + base.performance + base.operations) / 5
  );

  return {
    overall,
    health: overall,
    security: base.security,
    reliability: base.reliability,
    cost: base.cost,
    performance: base.performance,
    operations: base.operations,
    identity: base.identity,
    resourceCount: resources.length,
  };
}
