// Personalised blog recommender.
//
// Takes the user's activity signals (which Azure services they use, which
// categories dominate their diagrams, and profile gap counters) and ranks
// blog articles by relevance. Returns top N with human-readable "why" reasons
// so the dashboard can explain the recommendation.
//
// Pure function — no I/O, no side effects, no dependencies.

// Map a canvas-side category name (as tagged in diagramTemplates.js) to the
// blog category names used in blogArticles.js. Multi-value because e.g.
// "security" activity should pull both Security AND Identity content.
const CANVAS_TO_BLOG_CATEGORY = {
  compute:            ['Compute'],
  containers:         ['Compute', 'DevOps'],
  appservices:        ['Compute', 'Architecture'],
  networking:         ['Networking'],
  security:           ['Security', 'Identity'],
  identity:           ['Identity', 'Security'],
  databases:          ['Data'],
  storage:            ['Data'],
  analytics:          ['Data', 'Observability'],
  aimachinelearning:  ['Architecture', 'Data'],
  iot:                ['Architecture'],
  integration:        ['Architecture'],
  devops:             ['DevOps', 'Observability'],
  management:         ['Best Practices', 'Observability'],
  migration:          ['Migration'],
  hybrid:             ['Migration', 'Networking'],
};

// Keywords in an article title/excerpt that indicate a service focus.
// Matches against user's actual serviceTypes on the canvas.
const SERVICE_KEYWORDS = {
  virtualmachine:                     ['vm', 'virtual machine'],
  vmscalesets:                        ['vmss', 'scale set'],
  kubernetesservices:                 ['aks', 'kubernetes'],
  functionapps:                       ['function', 'serverless'],
  appservices:                        ['app service'],
  containerinstances:                 ['container'],
  containerregistries:                ['acr', 'container registry'],
  batchaccounts:                      ['batch'],
  sqldatabase:                        ['sql', 'azure sql'],
  sqlserver:                          ['sql server'],
  azurecosmosdb:                      ['cosmos'],
  azuredatabasemysqlserver:           ['mysql'],
  azuredatabasepostgresqlserver:      ['postgres', 'postgresql', 'pgvector'],
  cacheredis:                         ['redis'],
  storageaccounts:                    ['storage account', 'blob', 'grs', 'zrs'],
  keyvaults:                          ['key vault'],
  firewalls:                          ['firewall', 'nva'],
  applicationgateways:                ['waf', 'application gateway'],
  virtualnetworks:                    ['vnet', 'virtual network', 'hub-spoke'],
  virtualnetworkgateways:             ['vpn', 'gateway'],
  expressroutecircuits:               ['expressroute'],
  loadbalancers:                      ['load balancer'],
  frontdoorandcdnprofiles:            ['front door', 'cdn'],
  cdnprofiles:                        ['cdn'],
  trafficmanagerprofiles:             ['traffic manager'],
  networksecuritygroups:              ['nsg', 'network security'],
  dnszones:                           ['dns', 'private dns'],
  bastions:                           ['bastion'],
  azuresentinel:                      ['sentinel', 'siem'],
  microsoftdefenderforcloud:          ['defender', 'cspm'],
  applicationinsights:                ['app insights', 'application insights', 'opentelemetry'],
  loganalyticsworkspaces:             ['log analytics', 'kql'],
  eventhubs:                          ['event hub', 'streaming'],
  azureservicebus:                    ['service bus', 'queue'],
  eventgridtopics:                    ['event grid'],
  apimanagementservices:              ['apim', 'api management'],
  azureopenai:                        ['openai', 'llm', 'rag'],
  cognitivesearch:                    ['ai search', 'vector'],
  cognitiveservices:                  ['cognitive'],
  machinelearning:                    ['ml', 'machine learning'],
  azuredatabricks:                    ['databricks', 'delta lake'],
  datafactories:                      ['data factory', 'etl'],
  azuresynapseanalytics:              ['synapse', 'fabric'],
  azuredataexplorerclusters:          ['data explorer', 'adx', 'kql'],
  streamanalyticsjobs:                ['stream analytics'],
  iothub:                             ['iot', 'iot hub'],
  azuredevops:                        ['devops', 'pipelines'],
};

// ---- Public API ----

/**
 * @typedef {Object} RecommenderSignals
 * @property {string[]} serviceTypes - deduped list of serviceType strings from user's diagrams
 * @property {Record<string, number>} categoryCounts - canvas-side category → count of items
 * @property {Object} profile - user profile with counters (tf_exports, validations_run, ...)
 * @property {number} diagramCount
 * @property {string[]} viewedSlugs - optional, articles the user already viewed
 */

/**
 * Rank articles by relevance to the user.
 * @param {Array} articles - blogArticles metadata
 * @param {RecommenderSignals} signals
 * @param {number} limit
 * @returns {Array<{ article: any, score: number, reasons: string[] }>}
 */
export function recommendArticles(articles, signals, limit = 3) {
  const {
    serviceTypes = [],
    categoryCounts = {},
    profile = {},
    diagramCount = 0,
    viewedSlugs = [],
  } = signals || {};

  const now = Date.now();
  const viewed = new Set(viewedSlugs || []);

  // Top 3 canvas categories the user actually uses
  const topCanvasCats = Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([c]) => c);

  const scored = articles.map((a) => {
    let score = 0;
    const reasons = [];

    const title = (a.title || '').toLowerCase();
    const excerpt = (a.excerpt || '').toLowerCase();
    const haystack = `${title} ${excerpt}`;

    // 1) Category match — strongest signal
    for (const uc of topCanvasCats) {
      const blogCats = CANVAS_TO_BLOG_CATEGORY[uc] || [];
      if (blogCats.includes(a.category)) {
        score += 8;
        reasons.push(`Matches your ${humanCategory(uc)} usage`);
        break;
      }
    }

    // 2) Service-keyword match — direct hit on services the user actually uses
    for (const svc of serviceTypes) {
      const kws = SERVICE_KEYWORDS[svc] || [];
      let matched = false;
      for (const kw of kws) {
        if (haystack.includes(kw)) {
          score += 6;
          reasons.push(`You use ${humanService(svc)} on your canvas`);
          matched = true;
          break;
        }
      }
      if (matched) break; // one service-name reason per article is enough
    }

    // 3) Profile-gap signals — nudge users toward features they haven't tried
    if ((profile.validations_run || 0) === 0 && diagramCount > 0) {
      if (haystack.includes('waf') || haystack.includes('well-architected')) {
        score += 5;
        reasons.push("You haven't run WAF validation yet");
      }
    }
    if ((profile.tf_exports || 0) === 0 && diagramCount > 0) {
      if (haystack.includes('terraform') || haystack.includes('bicep') || haystack.includes('arm')) {
        score += 5;
        reasons.push('Learn IaC — you have not exported yet');
      }
    }
    if ((profile.templates_used || 0) === 0 && haystack.includes('template')) {
      score += 3;
      reasons.push('Discover templates');
    }
    if (diagramCount === 0 && a.slug === 'cloud-canvas-designer-sop') {
      score += 10;
      reasons.push('Start here — the complete SOP');
    }

    // 4) Recency — mild boost for anything under 3 months old
    const daysOld = (now - new Date(a.date).getTime()) / 86_400_000;
    if (daysOld < 30) score += 2;
    else if (daysOld < 90) score += 1;

    // 5) Penalty if user has already read this article
    if (viewed.has(a.slug)) score -= 6;

    // Deduplicate reasons and cap at 2 for UI compactness
    const uniqueReasons = Array.from(new Set(reasons)).slice(0, 2);

    return { article: a, score, reasons: uniqueReasons };
  });

  // If nothing scored, fall back to newest 3
  const anyScored = scored.some((s) => s.score > 0);
  if (!anyScored) {
    return [...articles]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit)
      .map((a) => ({ article: a, score: 0, reasons: ['Fresh from the blog'] }));
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

// ---- Signal extraction helpers ----

/**
 * Turn an array of loaded diagram objects into recommender signals.
 * Each diagram must have { items: [{ serviceType, category }, ...] } shape.
 */
export function buildSignals(diagrams, profile, viewedSlugs = []) {
  const serviceTypes = new Set();
  const categoryCounts = {};

  for (const d of diagrams || []) {
    const items = d.items || [];
    for (const it of items) {
      if (it.serviceType) serviceTypes.add(it.serviceType);
      const cat = it.category || 'unknown';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }
  }

  return {
    serviceTypes: Array.from(serviceTypes),
    categoryCounts,
    profile: profile || {},
    diagramCount: (diagrams || []).length,
    viewedSlugs,
  };
}

// ---- Small formatters ----

function humanCategory(canvasCat) {
  const map = {
    compute: 'Compute',
    containers: 'Container',
    appservices: 'App Service',
    networking: 'Networking',
    security: 'Security',
    identity: 'Identity',
    databases: 'Database',
    storage: 'Storage',
    analytics: 'Analytics',
    aimachinelearning: 'AI',
    iot: 'IoT',
    integration: 'Integration',
    devops: 'DevOps',
    management: 'Management',
    migration: 'Migration',
    hybrid: 'Hybrid',
  };
  return map[canvasCat] || canvasCat;
}

function humanService(svc) {
  const map = {
    virtualmachine: 'Virtual Machines',
    vmscalesets: 'VM Scale Sets',
    kubernetesservices: 'AKS',
    functionapps: 'Functions',
    appservices: 'App Service',
    sqldatabase: 'Azure SQL',
    azurecosmosdb: 'Cosmos DB',
    storageaccounts: 'Storage Accounts',
    keyvaults: 'Key Vault',
    firewalls: 'Azure Firewall',
    applicationgateways: 'Application Gateway',
    virtualnetworks: 'VNet',
    frontdoorandcdnprofiles: 'Front Door',
    expressroutecircuits: 'ExpressRoute',
    azureopenai: 'Azure OpenAI',
    cognitivesearch: 'AI Search',
    azuredatabricks: 'Databricks',
    datafactories: 'Data Factory',
    eventhubs: 'Event Hubs',
    applicationinsights: 'Application Insights',
    loganalyticsworkspaces: 'Log Analytics',
    azuresentinel: 'Sentinel',
    microsoftdefenderforcloud: 'Defender for Cloud',
  };
  return map[svc] || svc;
}
