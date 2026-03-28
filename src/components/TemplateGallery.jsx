// Template Gallery — modal for selecting pre-built architecture templates
import React, { useState, useMemo } from 'react';
import { diagramTemplates, templateCategories } from '../utils/diagramTemplates';
import './TemplateGallery.css';

const TemplateGallery = ({ isOpen, onClose, onSelectTemplate }) => {
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

  const handleSelect = (template) => {
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
          <button className="template-close-btn" onClick={onClose}>✕</button>
        </div>

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
          {filtered.map(template => (
            <div
              key={template.id}
              className={`template-card ${hoveredTemplate === template.id ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredTemplate(template.id)}
              onMouseLeave={() => setHoveredTemplate(null)}
              onClick={() => handleSelect(template)}
            >
              <div className="template-card-icon">{template.icon}</div>
              <h3 className="template-card-title">{template.name}</h3>
              <p className="template-card-desc">{template.description}</p>
              <div className="template-card-meta">
                <span>{templateMeta[template.id]?.itemCount || 0} services</span>
                <span>{templateMeta[template.id]?.connCount || 0} connections</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplateGallery;
