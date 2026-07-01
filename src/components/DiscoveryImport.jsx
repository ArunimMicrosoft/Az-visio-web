// Full-screen Discovery Import modal.
// Accepts ARM, Bicep, Terraform, TF state, Resource Graph, Az CLI, PowerShell,
// .ccd, and generic inventory exports. Shows live 11-step progress.

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { runDiscovery } from '../utils/discovery/engine';
import { getDiscoveryStatus, recordDiscoveryUse, DISCOVERY_LIMITS } from '../utils/authSecurity';
import { useAuth } from '../contexts/AuthContext';
import './DiscoveryImport.css';

const STEP_TITLES = [
  '1. Identify import type',
  '2. Parse resources',
  '3. Discover relationships',
  '4. Discover network flows',
  '5. Generate layout',
  '6. Group into containers',
  '7. Best-practice analysis',
  '8. Identify issues',
  '9. Assemble diagram',
  '10. Generate documentation',
  '11. Output graph',
];

export default function DiscoveryImport({ open, onClose, onImport, onUpgrade }) {
  const { user, refreshUser } = useAuth();
  const [steps, setSteps] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | processing | done | error | blocked
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [fileName, setFileName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Live quota state — recomputed every render from user object
  const quota = useMemo(() => getDiscoveryStatus(user), [user]);
  const blocked = !quota.allowed;

  const reset = () => {
    setSteps([]);
    setStatus('idle');
    setError(null);
    setResult(null);
    setFileName('');
  };

  const handleClose = () => { reset(); onClose?.(); };

  const process = useCallback(async (text, name) => {
    // Re-check quota at the moment of running (in case user opened the modal
    // days ago and their cycle expired or plan changed since).
    const currentQuota = getDiscoveryStatus(user);
    if (!currentQuota.allowed) {
      setStatus('blocked');
      return;
    }

    setStatus('processing');
    setSteps([]);
    setError(null);
    setResult(null);
    setFileName(name);

    try {
      const res = await runDiscovery(text, {
        filename: name,
        onStep: (step, all) => {
          setSteps(() => {
            const map = new Map();
            for (const s of all) map.set(s.index, s);
            return [...map.values()].sort((a, b) => a.index - b.index);
          });
        },
      });
      setResult(res);
      setStatus('done');

      // Record the successful use — increments counter in DB, then refresh user
      const record = await recordDiscoveryUse(user);
      if (record.needsMigration) {
        console.warn('Discovery counter not tracked — DB migration pending.');
      }
      try { await refreshUser?.(); } catch { /* ignore */ }
    } catch (err) {
      console.error('Discovery error:', err);
      setError(err.message || 'Discovery failed.');
      setStatus('error');
    }
  }, [user, refreshUser]);

  const handleFile = (file) => {
    if (!file) return;
    if (blocked) { setStatus('blocked'); return; }
    const reader = new FileReader();
    reader.onload = (e) => process(e.target.result, file.name);
    reader.onerror = () => setError('Could not read file.');
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const handleImportToCanvas = () => {
    if (!result) return;
    onImport?.(result);
    handleClose();
  };

  const [pastedText, setPastedText] = useState('');

  if (!open) return null;

  return (
    <div className="discovery-overlay" role="dialog" aria-modal="true">
      <div className="discovery-modal">
        {/* Header */}
        <div className="discovery-header">
          <div>
            <div className="discovery-title">🧭 Architecture Discovery</div>
            <div className="discovery-subtitle">
              Upload an Azure export — IaC or a live-environment snapshot — and we&apos;ll build the diagram, score it, and flag issues.
            </div>
          </div>
          <div className="discovery-header-actions">
            <QuotaPill quota={quota} />
            <button className="discovery-close" onClick={handleClose} aria-label="Close">✕</button>
          </div>
        </div>

        {/* Body */}
        <div className="discovery-body">
          {/* LEFT — Input panel */}
          <div className="discovery-input">
            {blocked || status === 'blocked' ? (
              <QuotaBlocked quota={quota} onUpgrade={onUpgrade} />
            ) : status === 'idle' ? (
              <>
                <div
                  className={`discovery-drop ${dragActive ? 'discovery-drop--active' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="discovery-drop-icon">📥</div>
                  <div className="discovery-drop-title">Drop a file here or click to browse</div>
                  <div className="discovery-drop-sub">
                    Supported: ARM · Bicep · Terraform · TF State · Resource Graph · Az CLI · PowerShell · .ccd
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,.bicep,.tf,.tfstate,.ccd,.txt"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                    style={{ display: 'none' }}
                  />
                </div>

                <HowToExportHelp />

                <div className="discovery-or">— or paste content below —</div>

                <textarea
                  className="discovery-paste"
                  placeholder={'Paste JSON (ARM / Resource Graph / Az CLI), HCL, or Bicep here…'}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  spellCheck={false}
                />

                <button
                  className="discovery-btn-run"
                  disabled={!pastedText.trim()}
                  onClick={() => process(pastedText, 'pasted-input')}
                >
                  ▶ Run Discovery
                </button>
              </>
            ) : (
              <div className="discovery-file-summary">
                <div className="discovery-file-icon">📄</div>
                <div className="discovery-file-name">{fileName}</div>
                <div className="discovery-file-status">
                  {status === 'processing' && 'Processing…'}
                  {status === 'done'       && '✅ Discovery complete'}
                  {status === 'error'      && '❌ Failed'}
                </div>
                {status !== 'processing' && (
                  <button className="discovery-btn-restart" onClick={reset}>↺ Start over</button>
                )}
              </div>
            )}
          </div>

          {/* RIGHT — Live progress + results */}
          <div className="discovery-output">
            {status === 'idle' ? (
              <div className="discovery-idle">
                <div className="discovery-idle-title">What happens next</div>
                <ol className="discovery-idle-list">
                  {STEP_TITLES.map((t) => <li key={t}>{t.replace(/^\d+\.\s/, '')}</li>)}
                </ol>
              </div>
            ) : (
              <>
                <div className="discovery-steps-title">Processing pipeline</div>
                <ol className="discovery-steps">
                  {STEP_TITLES.map((title, idx) => {
                    const step = steps.find(s => s.index === idx + 1);
                    const state = step?.status || 'pending';
                    return (
                      <li key={idx} className={`discovery-step discovery-step--${state}`}>
                        <span className="discovery-step-marker">
                          {state === 'done'     && '✓'}
                          {state === 'running'  && <span className="discovery-spinner" />}
                          {state === 'error'    && '✕'}
                          {state === 'pending'  && '·'}
                        </span>
                        <div className="discovery-step-body">
                          <div className="discovery-step-title">{title}</div>
                          {step?.detail && <div className="discovery-step-detail">{step.detail}</div>}
                        </div>
                      </li>
                    );
                  })}
                </ol>

                {status === 'error' && (
                  <div className="discovery-error-panel">
                    <div className="discovery-error-title">Discovery failed</div>
                    <div className="discovery-error-msg">{error}</div>
                  </div>
                )}

                {status === 'done' && result && (
                  <div className="discovery-result">
                    <div className="discovery-result-title">Discovery report</div>
                    <div className="discovery-metrics">
                      <Metric label="Resources"     value={result.items.length} />
                      <Metric label="Connections"   value={result.connections.length} />
                      <Metric label="Boundaries"    value={result.boundaries.length} />
                      <Metric label="Flows"         value={result.flows.length} />
                      <Metric label="Issues"        value={result.warnings.length}
                              tone={result.warnings.some(i => i.severity === 'high') ? 'warn' : 'ok'} />
                    </div>

                    <div className="discovery-scores">
                      <Score label="Overall"     value={result.scores.overall}     />
                      <Score label="Security"    value={result.scores.security}    />
                      <Score label="Reliability" value={result.scores.reliability} />
                      <Score label="Cost"        value={result.scores.cost}        />
                      <Score label="Performance" value={result.scores.performance} />
                      <Score label="Operations"  value={result.scores.operations}  />
                    </div>

                    <details className="discovery-details">
                      <summary>Executive summary</summary>
                      <p dangerouslySetInnerHTML={{ __html: bold(result.documentation.executive) }} />
                    </details>

                    {result.warnings.length > 0 && (
                      <details className="discovery-details" open>
                        <summary>Top issues ({result.warnings.length})</summary>
                        <ul className="discovery-issue-list">
                          {result.warnings.slice(0, 10).map((w, i) => (
                            <li key={i} className={`discovery-issue discovery-issue--${w.severity}`}>
                              <span className="discovery-issue-badge">{w.severity}</span>
                              <span>{w.message}</span>
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}

                    {result.flows.length > 0 && (
                      <details className="discovery-details">
                        <summary>Traffic flows ({result.flows.length})</summary>
                        <ul className="discovery-flow-list">
                          {result.flows.slice(0, 10).map((f, i) => (
                            <li key={i}>{f.label}</li>
                          ))}
                        </ul>
                      </details>
                    )}

                    <button className="discovery-btn-import" onClick={handleImportToCanvas}>
                      ➜ Open in Canvas
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Quota-related UI pieces
───────────────────────────────────────────────────────────── */

function QuotaPill({ quota }) {
  if (!quota) return null;
  if (quota.isUnlimited) {
    return (
      <div className="discovery-quota-pill discovery-quota-pill--unlimited" title="No usage limit">
        <span className="discovery-quota-pill-icon">∞</span>
        <span className="discovery-quota-pill-text">Unlimited</span>
      </div>
    );
  }
  const tone = quota.remaining === 0 ? 'red'
             : quota.remaining <= Math.max(1, Math.round(quota.limit * 0.2)) ? 'amber'
             : 'green';
  const periodLabel = quota.period === 'lifetime' ? 'total' : 'this cycle';
  return (
    <div
      className={`discovery-quota-pill discovery-quota-pill--${tone}`}
      title={`Plan: ${quota.tier}. ${quota.used}/${quota.limit} discoveries used ${periodLabel}.`}
    >
      <span className="discovery-quota-pill-icon">
        {quota.remaining === 0 ? '🔒' : '⚡'}
      </span>
      <span className="discovery-quota-pill-text">
        {quota.remaining}/{quota.limit} left {quota.period === 'monthly' && '· 30-day'}
      </span>
    </div>
  );
}

function QuotaBlocked({ quota, onUpgrade }) {
  const isTrial = quota.tier === 'trial';
  const isMonthlyReset = quota.period === 'monthly' && quota.resetAt;

  // Build tier-specific copy
  let title, body, ctaLabel;
  if (isTrial) {
    title = 'Free trial limit reached';
    body  = `You've used all ${quota.limit} Discovery runs on the free trial. Upgrade to keep visualizing your Azure infrastructure — Starter gives you ${DISCOVERY_LIMITS.starter.limit} runs every 30 days, Professional gives you ${DISCOVERY_LIMITS.professional.limit}.`;
    ctaLabel = 'Upgrade to unlock more →';
  } else if (isMonthlyReset) {
    const resetDate = new Date(quota.resetAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });
    title = `${humanTier(quota.tier)} plan limit reached`;
    body  = `You've used all ${quota.limit} Discovery runs in this 30-day cycle. Your quota resets on ${resetDate}, or you can upgrade now for a higher limit.`;
    ctaLabel = 'Upgrade plan →';
  } else {
    title = 'Discovery limit reached';
    body  = `You've hit the maximum number of Discovery runs for your plan. Upgrade to continue.`;
    ctaLabel = 'Upgrade plan →';
  }

  return (
    <div className="discovery-blocked-block">
      <div className="discovery-blocked-icon">🔒</div>
      <div className="discovery-blocked-title">{title}</div>
      <div className="discovery-blocked-stats">
        <div className="discovery-blocked-stat">
          <div className="discovery-blocked-stat-value">{quota.used}</div>
          <div className="discovery-blocked-stat-label">Used</div>
        </div>
        <div className="discovery-blocked-stat">
          <div className="discovery-blocked-stat-value">{quota.limit ?? '∞'}</div>
          <div className="discovery-blocked-stat-label">Limit</div>
        </div>
        <div className="discovery-blocked-stat">
          <div className="discovery-blocked-stat-value discovery-blocked-stat-value--zero">0</div>
          <div className="discovery-blocked-stat-label">Remaining</div>
        </div>
      </div>
      <div className="discovery-blocked-text">{body}</div>

      {/* Show the plan ladder so users see what they get by upgrading */}
      <div className="discovery-blocked-ladder">
        <PlanRow name="Starter"      price="₹499"   runs={DISCOVERY_LIMITS.starter.limit}      period="per 30 days" active={quota.tier === 'starter'} />
        <PlanRow name="Professional" price="₹1,200" runs={DISCOVERY_LIMITS.professional.limit} period="per 30 days" active={quota.tier === 'professional'} highlight />
        <PlanRow name="Enterprise"   price="₹6,699" runs="Unlimited" period=""                  active={quota.tier === 'enterprise'} />
      </div>

      <button className="discovery-btn-upgrade" onClick={onUpgrade}>{ctaLabel}</button>
    </div>
  );
}

function PlanRow({ name, price, runs, period, active, highlight }) {
  return (
    <div className={`disc-plan-row ${highlight ? 'disc-plan-row--highlight' : ''} ${active ? 'disc-plan-row--active' : ''}`}>
      <div className="disc-plan-row-name">
        {name}
        {active && <span className="disc-plan-row-badge">CURRENT</span>}
      </div>
      <div className="disc-plan-row-runs">{runs} {period}</div>
      <div className="disc-plan-row-price">{price}<span>/mo</span></div>
    </div>
  );
}

function humanTier(tier) {
  return String(tier || '').replace(/^./, c => c.toUpperCase());
}

function HowToExportHelp() {
  const [tab, setTab] = React.useState('portal');
  const tabs = [
    { id: 'portal',     label: 'Portal (ARM)' },
    { id: 'cli',        label: 'Azure CLI' },
    { id: 'graph',      label: 'Resource Graph' },
    { id: 'powershell', label: 'PowerShell' },
    { id: 'iac',        label: 'Terraform / Bicep' },
  ];
  return (
    <details className="discovery-howto">
      <summary>
        <span className="discovery-howto-icon">💡</span>
        <span>How do I get my Azure IaC file?</span>
      </summary>

      <div className="discovery-howto-tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`discovery-howto-tab ${tab === t.id ? 'discovery-howto-tab--active' : ''}`}
            onClick={() => setTab(t.id)}
            type="button"
          >{t.label}</button>
        ))}
      </div>

      {tab === 'portal' && (
        <div className="discovery-howto-body">
          <p className="discovery-howto-lead">Fastest — no CLI required.</p>
          <ol className="discovery-howto-steps">
            <li>Sign in to <b>portal.azure.com</b></li>
            <li>Open the <b>Resource Group</b> (or single resource) you want to diagram</li>
            <li>Left menu → <b>Automation → Export template</b></li>
            <li>Click <b>Download</b> — you get a <code>template.json</code></li>
            <li>Drop it above ⤴</li>
          </ol>
          <p className="discovery-howto-tip">
            💡 <b>Tip:</b> To export an entire subscription, use the CLI tab.
          </p>
        </div>
      )}

      {tab === 'cli' && (
        <div className="discovery-howto-body">
          <p className="discovery-howto-lead">
            Snapshot your <b>live, currently deployed</b> Azure resources — no IaC needed. Requires <a href="https://learn.microsoft.com/cli/azure/install-azure-cli" target="_blank" rel="noopener noreferrer">Azure CLI</a> installed and <code>az login</code>.
          </p>
          <p className="discovery-howto-label">Export a whole subscription:</p>
          <pre className="discovery-howto-code">{`az account set --subscription "<sub-id-or-name>"
az resource list > resources.json`}</pre>

          <p className="discovery-howto-label">Export a single resource group:</p>
          <pre className="discovery-howto-code">{`az resource list -g <resource-group> > rg.json`}</pre>

          <p className="discovery-howto-label">Export as ARM template:</p>
          <pre className="discovery-howto-code">{`az group export -n <resource-group> > template.json`}</pre>
        </div>
      )}

      {tab === 'graph' && (
        <div className="discovery-howto-body">
          <p className="discovery-howto-lead">Best for very large or multi-subscription tenants.</p>
          <p className="discovery-howto-label">Install the graph extension (one time):</p>
          <pre className="discovery-howto-code">az extension add --name resource-graph</pre>

          <p className="discovery-howto-label">Query and save:</p>
          <pre className="discovery-howto-code">{`az graph query -q "Resources | project id,name,type,location,resourceGroup,subscriptionId,properties,identity,sku,tags" --first 1000 > graph.json`}</pre>
          <p className="discovery-howto-tip">
            💡 Use <code>--first N</code> to increase page size; Discovery consumes the returned rows directly.
          </p>
        </div>
      )}

      {tab === 'powershell' && (
        <div className="discovery-howto-body">
          <p className="discovery-howto-lead">Requires the <code>Az</code> PowerShell module and <code>Connect-AzAccount</code>.</p>
          <p className="discovery-howto-label">Export all resources:</p>
          <pre className="discovery-howto-code">{`Get-AzResource | ConvertTo-Json -Depth 20 > resources.json`}</pre>

          <p className="discovery-howto-label">Scope to a resource group:</p>
          <pre className="discovery-howto-code">{`Get-AzResource -ResourceGroupName "<rg-name>" | ConvertTo-Json -Depth 20 > rg.json`}</pre>

          <p className="discovery-howto-label">Export an ARM template:</p>
          <pre className="discovery-howto-code">{`Export-AzResourceGroup -ResourceGroupName "<rg-name>" -Path .\\template.json`}</pre>
        </div>
      )}

      {tab === 'iac' && (
        <div className="discovery-howto-body">
          <p className="discovery-howto-lead">
            Already have Terraform or Bicep code? Just upload it — no export step needed.
          </p>
          <ul className="discovery-howto-list">
            <li><b>Terraform HCL:</b> upload your <code>main.tf</code> (or paste the content above).</li>
            <li><b>Terraform state:</b> upload <code>terraform.tfstate</code> — we&apos;ll read the current live resources.</li>
            <li><b>Bicep:</b> upload your <code>*.bicep</code> file. For most accuracy, compile first:
              <pre className="discovery-howto-code" style={{ marginTop: 6 }}>az bicep build --file main.bicep {'>'} template.json</pre>
              then upload the JSON.</li>
            <li><b>ARM Export from Portal:</b> works out of the box.</li>
          </ul>
          <p className="discovery-howto-tip">
            🔒 Parsing happens in your browser. Files are never uploaded to any external service.
          </p>
        </div>
      )}
    </details>
  );
}

function Metric({ label, value, tone = 'ok' }) {
  return (
    <div className={`discovery-metric discovery-metric--${tone}`}>
      <div className="discovery-metric-value">{value}</div>
      <div className="discovery-metric-label">{label}</div>
    </div>
  );
}

function Score({ label, value }) {
  const tone = value >= 80 ? 'green' : value >= 60 ? 'amber' : 'red';
  return (
    <div className={`discovery-score discovery-score--${tone}`}>
      <div className="discovery-score-value">{value}</div>
      <div className="discovery-score-label">{label}</div>
    </div>
  );
}

// Convert **bold** markers to <strong> — safe: only wraps text between ** markers.
function bold(str = '') {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}
