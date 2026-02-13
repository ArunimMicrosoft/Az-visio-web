import React, { useState } from 'react';
import AzureIcon from './AzureIcon';
import { azureIconCategories, categoryNames } from '../utils/azureIcons';
import './Toolbar.css';

const Toolbar = () => {
  // Track which categories are expanded (start with first category open)
  const [expandedCategories, setExpandedCategories] = useState(['compute']);
  // Track if toolbar is visible on mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Track if user is dragging an icon
  const [isDragging, setIsDragging] = useState(false);
  
  // Toggle a category's expanded state
  const toggleCategory = (category) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(cat => cat !== category)
        : [...prev, category]
    );
  };

  // Check if category is expanded
  const isCategoryExpanded = (category) => expandedCategories.includes(category);

  // Listen for drag events and close menu on mobile when dragging starts
  React.useEffect(() => {
    const handleTouchMoveGlobal = (e) => {
      if (e.target.closest('.azure-icon')) {
        setIsDragging(true);
        // Close mobile menu when user starts dragging an icon
        if (isMobileMenuOpen && window.innerWidth <= 768) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    const handleTouchEndGlobal = () => {
      setIsDragging(false);
    };

    document.addEventListener('touchmove', handleTouchMoveGlobal);
    document.addEventListener('touchend', handleTouchEndGlobal);
    
    return () => {
      document.removeEventListener('touchmove', handleTouchMoveGlobal);
      document.removeEventListener('touchend', handleTouchEndGlobal);
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button 
        className="mobile-menu-toggle"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle Azure Services Menu"
      >
        <span className="hamburger-icon">
          {isMobileMenuOpen ? '✕' : '☰'}
        </span>
        <span className="menu-text">Services</span>
      </button>      {/* Overlay for mobile - don't show if dragging */}
      {isMobileMenuOpen && !isDragging && (
        <div 
          className="mobile-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className={`toolbar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
      <div className="toolbar-header">
        <h3 className="toolbar-title">Azure Services</h3>
        <button 
          className="expand-all-btn"
          onClick={() => {
            if (expandedCategories.length === Object.keys(azureIconCategories).length) {
              setExpandedCategories([]);
            } else {
              setExpandedCategories(Object.keys(azureIconCategories));
            }
          }}
          title={expandedCategories.length === Object.keys(azureIconCategories).length ? "Collapse All" : "Expand All"}
        >
          {expandedCategories.length === Object.keys(azureIconCategories).length ? '⊟' : '⊞'}
        </button>
      </div>
      
      <div className="category-accordion">
        {Object.keys(azureIconCategories).map((category) => {
          const isExpanded = isCategoryExpanded(category);
          const iconCount = azureIconCategories[category].length;
          
          return (
            <div key={category} className="category-section">
              <button
                className={`category-header ${isExpanded ? 'expanded' : ''}`}
                onClick={() => toggleCategory(category)}
              >
                <span className="category-icon">{isExpanded ? '▼' : '▶'}</span>
                <span className="category-name">{categoryNames[category]}</span>
                <span className="category-count">{iconCount}</span>
              </button>
              
              {isExpanded && (
                <div className="category-content">
                  <div className="toolbar-icons">
                    {azureIconCategories[category].map((icon) => (
                      <AzureIcon key={icon.id} icon={icon} />
                    ))}
                  </div>
                </div>
              )}
            </div>          );
        })}
      </div>
    </div>
    </>
  );
};

export default Toolbar;
