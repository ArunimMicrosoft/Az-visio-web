// Discovery Engine — orchestrates the 11-step pipeline described in the spec.
// Emits progress to a caller-provided onStep(step) callback so the UI can
// render live progress as processing happens.

import { detectFormat, detectScope, FORMAT } from './detectors.js';
import { parseByFormat } from './parsers.js';
import { discoverRelationships } from './relationships.js';
import { discoverFlows } from './flows.js';
import { buildLayout } from './layout.js';
import { analyzeArchitecture } from './analysis.js';
import { generateDocumentation } from './documentation.js';
import { mapAzureType } from './typeMap.js';

const yieldToBrowser = () => new Promise((r) => setTimeout(r, 30));

/**
 * Run the discovery pipeline against a raw text input.
 *
 * @param {string} rawText   File content (JSON / HCL / Bicep etc.)
 * @param {object} options   { filename, onStep }
 * @returns discovery result
 */
export async function runDiscovery(rawText, options = {}) {
  const { filename = '', onStep = () => {} } = options;
  const steps = [];

  const emit = (index, title, detail, status = 'done', extra = {}) => {
    const step = { index, title, detail, status, at: Date.now(), ...extra };
    steps.push(step);
    try { onStep(step, steps); } catch { /* consumer errors shouldn't kill pipeline */ }
  };

  // ── Step 1: Identify import type ──────────────────────────────────────
  emit(1, 'Identify import type', 'Scanning file signatures and headers…', 'running');
  const format = detectFormat(rawText, filename);
  if (format === FORMAT.UNKNOWN) {
    emit(1, 'Identify import type', 'Unable to detect a supported Azure export format.', 'error');
    throw new Error('Unsupported or unrecognized export format. Provide ARM, Bicep, Terraform, Terraform state, Azure Resource Graph, Az CLI JSON, PowerShell export, or a Discovery (.ccd) file.');
  }
  emit(1, 'Identify import type', `Detected format: ${formatLabel(format)}`, 'done', { format });
  await yieldToBrowser();

  // ── Step 2: Parse resources ───────────────────────────────────────────
  emit(2, 'Parse resources', 'Extracting resources from the file…', 'running');
  let resources = [];
  try {
    resources = await parseByFormat(format, rawText);
  } catch (err) {
    emit(2, 'Parse resources', `Parse error: ${err.message}`, 'error');
    throw err;
  }
  // Attach category/tier metadata
  for (const r of resources) {
    const meta = mapAzureType(r.azureType);
    if (meta) { r.category = meta.category; r.tier = meta.tier; }
  }
  if (resources.length === 0) {
    emit(2, 'Parse resources', 'No Azure resources were found in the input.', 'error');
    throw new Error('No Azure resources found. Verify the file contains resources with `type` and `id` fields.');
  }
  const scope = detectScope(resources);
  emit(2, 'Parse resources', `Parsed ${resources.length} resource(s). Scope: ${scope}`, 'done',
       { resourceCount: resources.length, scope });
  await yieldToBrowser();

  // ── Step 3: Discover relationships ────────────────────────────────────
  emit(3, 'Discover relationships', 'Inferring links between resources via IDs, subnets, backend pools, and identities…', 'running');
  const edges = discoverRelationships(resources);
  emit(3, 'Discover relationships', `Mapped ${edges.length} relationship(s).`, 'done', { edgeCount: edges.length });
  await yieldToBrowser();

  // ── Step 4: Discover network flows ────────────────────────────────────
  emit(4, 'Discover network flows', 'Tracing entry points → app tier → data tier…', 'running');
  const flows = discoverFlows(resources, edges);
  emit(4, 'Discover network flows', `Identified ${flows.length} traffic flow(s).`, 'done', { flowCount: flows.length });
  await yieldToBrowser();

  // ── Step 5: Generate layout ───────────────────────────────────────────
  emit(5, 'Generate layout', 'Arranging nodes top→down: Edge · Networking · Compute · Data · Monitoring…', 'running');
  const { items, connections, boundaries } = buildLayout(resources, edges);
  emit(5, 'Generate layout', `Positioned ${items.length} node(s) across tiered rows.`, 'done');
  await yieldToBrowser();

  // ── Step 6: Generate resource-group containers ────────────────────────
  emit(6, 'Group into containers',
       `Created ${boundaries.length} resource-group boundary/boundaries.`,
       'done', { boundaryCount: boundaries.length });
  await yieldToBrowser();

  // ── Step 7: Best practice analysis (WAF + CAF) ────────────────────────
  emit(7, 'Best-practice analysis', 'Scoring against WAF pillars: Security, Reliability, Cost, Performance, Operations…', 'running');
  const { scores, issues, recommendations } = analyzeArchitecture(resources, edges);
  emit(7, 'Best-practice analysis', `Overall score: ${scores.overall}/100.`, 'done', { scores });
  await yieldToBrowser();

  // ── Step 8: Identify issues ───────────────────────────────────────────
  const highIssues = issues.filter(i => i.severity === 'high').length;
  emit(8, 'Identify issues', `Found ${issues.length} issue(s) (${highIssues} high severity).`, 'done',
       { issueCount: issues.length, highIssues });
  await yieldToBrowser();

  // ── Step 9: Assemble diagram ──────────────────────────────────────────
  emit(9, 'Assemble diagram', 'Building canvas nodes with Azure icons, labels, and containers…', 'done');
  await yieldToBrowser();

  // ── Step 10: Generate documentation ───────────────────────────────────
  emit(10, 'Generate documentation', 'Producing per-domain and executive summaries…', 'running');
  const documentation = generateDocumentation(resources, edges, flows, scores, scope);
  emit(10, 'Generate documentation', 'Documentation ready.', 'done');
  await yieldToBrowser();

  // ── Step 11: Output graph JSON ────────────────────────────────────────
  emit(11, 'Output graph', 'Preparing renderable payload for Cloud Canvas Designer…', 'done');

  return {
    format,
    scope,
    resources,              // internal (for debug)
    items,                  // canvas items
    connections,            // canvas connections
    boundaries,             // canvas containers
    flows,
    warnings: issues,
    scores,
    recommendations,
    documentation,
    steps,
    metadata: {
      source: 'discovery',
      format,
      scope,
      resourceCount: resources.length,
      edgeCount: edges.length,
      flowCount: flows.length,
      issueCount: issues.length,
      generatedAt: new Date().toISOString(),
    },
  };
}

function formatLabel(format) {
  return ({
    'arm-template':       'ARM Template',
    'arm-export':         'ARM Export',
    'bicep':              'Bicep',
    'terraform':          'Terraform (HCL)',
    'terraform-state':    'Terraform State',
    'resource-graph':     'Azure Resource Graph',
    'azure-cli':          'Azure CLI JSON',
    'powershell':         'PowerShell Export',
    'discovery-ccd':      'Cloud Canvas Discovery (.ccd)',
    'inventory':          'Resource Inventory',
    'single-resource':    'Single Resource',
  })[format] || format;
}
