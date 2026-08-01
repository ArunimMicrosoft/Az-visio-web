// Template Gallery — modal for selecting pre-built architecture templates.
// Now tier-aware: shows a locked/upgrade state for templates above the user's
// plan, and enforces per-tier total usage caps (trial = 2 templates total).
import React, { useState, useMemo } from 'react';
import { diagramTemplates, templateCategories } from '../utils/diagramTemplates';
import { canUseTemplate, TEMPLATE_LIMITS, isAdminUser } from '../utils/authSecurity';
import './TemplateGallery.css';

const TIER_META = {
  trial:        { label: 'Free',         color: '#059669', bg: '#d1fae5' },
  starter:      { label: 'Starter',      color: '#0369a1', bg: '#dbeafe' },
  professional: { label: 'Professional', color: '#7c3aed', bg: '#ede9fe' },
  enterprise:   { label: 'Enterprise',   color: '#b45309', bg: '#fef3c7' },
};

const TemplateGallery = ({ isOpen, onClose, onSelectTemplate, user, onUpgrade }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [hoveredTemplate, setHoveredTemplate] = useState(null);

  // Pre-compute item/connection counts for display (only when modal opens)
  const templateMeta = useMemo(() => {
    if (!isOpen) return {};
    const meta = {};
    diagramTemplates.forEach(t => {
      const data = t.build();
      meta[t.id] = { itemCount: data.items.length, connCount: data.connections.length };
    });
    return meta;
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = selectedCategory === 'All'
    ? diagramTemplates
    : diagramTemplates.filter(t => t.category === selectedCategory);

  // Trial usage counter
  const tier = user?.subscriptionTier || 'trial';
  const isAdmin = isAdminUser(user);
  const limits = TEMPLATE_LIMITS[tier] || TEMPLATE_LIMITS.trial;
  const templatesUsed = user?.templatesUsed || 0;
  const hasCap = !isAdmin && limits.total !== Infinity;
  const capReached = hasCap && templatesUsed >= limits.total;
  const remaining = hasCap ? Math.max(0, limits.total - templatesUsed) : Infinity;

  const handleSelect = (template) => {
    const gate = canUseTemplate(user, template);
    if (!gate.ok) {
      // Blocked — hand off to the app's UpgradeModal instead of loading
      if (typeof onUpgrade === 'function') {
        onUpgrade({
          reason: gate.message,
          feature: template.name,
          requiredTier: gate.requiredTier,
        });
      }
      return;
    }
    // Each template has a build() function that generates fresh items with unique IDs
    const data = template.build();
    onSelectTemplate(data);
    onClose();
  };

  return (
    <div className="template-overlay" onClick={onClose}>
      <div className="template-modal" onClick={e => e.stopPropagation()}>
        <div className="template-header">
          <h2>📐 Architecture Templates</h2>
          <button className="template-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {hasCap && (
          <div className={`template-usage-bar${capReached ? ' template-usage-bar-full' : ''}`}>
            <span className="template-usage-icon">
              {capReached ? '🔒' : '📊'}
            </span>
            <div className="template-usage-text">
              {capReached ? (
                <>
                  <strong>All {limits.total} template loads used on the {tier} plan.</strong>
                  {' '}Upgrade to unlock unlimited templates.
                </>
              ) : (
                <>
                  <strong>{templatesUsed} of {limits.total}</strong> template loads used on the {tier} plan
                  {' — '}<strong>{remaining} left</strong>
                </>
              )}
            </div>
            {capReached && typeof onUpgrade === 'function' && (
              <button
                className="template-usage-upgrade"
                onClick={() => onUpgrade({
                  reason: `${tier === 'trial' ? 'Trial' : 'Your'} plan lets you load ${limits.total} templates. Upgrade for unlimited.`,
                  feature: 'Unlimited Templates',
                  requiredTier: 'starter',
                })}
              >
                Upgrade →
              </button>
            )}
          </div>
        )}

        <div className="template-categories">
          <button
            className={`template-cat-btn ${selectedCategory === 'All' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('All')}
          >
            All
          </button>
          {templateCategories.map(cat => (
            <button
              key={cat}
              className={`template-cat-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="template-grid">
          {filtered.map(template => {
            const gate = canUseTemplate(user, template);
            const tierMeta = TIER_META[template.minTier || 'trial'] || TIER_META.trial;
            const locked = !gate.ok;
            const meta = templateMeta[template.id];
            return (
              <div
                key={template.id}
                className={`template-card ${hoveredTemplate === template.id ? 'hovered' : ''} ${locked ? 'template-card-locked' : ''}`}
                onMouseEnter={() => setHoveredTemplate(template.id)}
                onMouseLeave={() => setHoveredTemplate(null)}
                onClick={() => handleSelect(template)}
                title={locked ? gate.message : `Load ${template.name}`}
                role="button"
                tabIndex={0}
              >
                <div className="template-card-top">
                  <span className="template-card-icon">{template.icon}</span>
                  <span
                    className="template-card-tier"
                    style={{ background: tierMeta.bg, color: tierMeta.color }}
                    title={`Available from ${tierMeta.label} plan`}
                  >
                    {tierMeta.label}
                  </span>
                </div>
                <h3 className="template-card-title">{template.name}</h3>
                <p className="template-card-desc">{template.description}</p>
                <div className="template-card-meta">
                  <span>{meta?.itemCount || 0} services</span>
                  <span>{meta?.connCount || 0} connections</span>
                </div>
                {locked && (
                  <span className="template-card-lock" title={gate.message}>
                    🔒 {gate.requiredTier ? `Upgrade to ${gate.requiredTier}` : 'Locked'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TemplateGallery;
