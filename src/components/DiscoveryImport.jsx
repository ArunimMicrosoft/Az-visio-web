// Full-screen Discovery Import modal.
// Accepts ARM, Bicep, Terraform, TF state, Resource Graph, Az CLI, PowerShell,
// .ccd, and generic inventory exports. Shows live 11-step progress.

import React, { useCallback, useRef, useState } from 'react';
import { runDiscovery } from '../utils/discovery/engine';
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

export default function DiscoveryImport({ open, onClose, onImport, isTrial, onUpgrade }) {
  const [steps, setSteps] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | processing | done | error
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [fileName, setFileName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const reset = () => {
    setSteps([]);
    setStatus('idle');
    setError(null);
    setResult(null);
    setFileName('');
  };

  const handleClose = () => { reset(); onClose?.(); };

  const process = useCallback(async (text, name) => {
    setStatus('processing');
    setSteps([]);
    setError(null);
    setResult(null);
    setFileName(name);

    try {
      const res = await runDiscovery(text, {
        filename: name,
        onStep: (step, all) => {
          // Replace step by index (later 'done' overrides earlier 'running')
          setSteps(() => {
            const map = new Map();
            for (const s of all) map.set(s.index, s);
            return [...map.values()].sort((a, b) => a.index - b.index);
          });
        },
      });
      setResult(res);
      setStatus('done');
    } catch (err) {
      console.error('Discovery error:', err);
      setError(err.message || 'Discovery failed.');
      setStatus('error');
    }
  }, []);

  const handleFile = (file) => {
    if (!file) return;
    if (isTrial) { onUpgrade?.(); return; }
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
            <div className="discovery-title">🧭 AI Architecture Discovery</div>
            <div className="discovery-subtitle">
              Upload an Azure export — we&apos;ll build the diagram, score it, and flag issues.
            </div>
          </div>
          <button className="discovery-close" onClick={handleClose} aria-label="Close">✕</button>
        </div>

        {/* Body */}
        <div className="discovery-body">
          {/* LEFT — Input panel */}
          <div className="discovery-input">
            {isTrial ? (
              <div className="discovery-trial-block">
                <div className="discovery-lock">🔒</div>
                <div className="discovery-trial-title">Discovery is a Pro feature</div>
                <div className="discovery-trial-text">
                  Upgrade to import ARM, Bicep, Terraform, Resource Graph, Az CLI, PowerShell, or Discovery (.ccd) exports and auto-generate architecture diagrams with WAF scoring.
                </div>
                <button className="discovery-btn-upgrade" onClick={onUpgrade}>Upgrade Plan →</button>
              </div>
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
