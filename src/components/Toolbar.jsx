import React, { useState } from 'react';
import AzureIcon from './AzureIcon';
import { azureIconCategories, categoryNames } from '../utils/azureIcons';
import './Toolbar.css';

const Toolbar = () => {
  const [expandedCategories, setExpandedCategories] = useState(['compute']);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  
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

  // Filter icons based on search query
  const filterIcons = (icons) => {
    if (!searchQuery.trim()) return icons;
    const query = searchQuery.toLowerCase();
    return icons.filter(icon => 
      icon.name.toLowerCase().includes(query) || 
      icon.id.toLowerCase().includes(query)
    );
  };

  // Get filtered categories (only show categories that have matching icons)
  const getFilteredCategories = () => {
    if (!searchQuery.trim()) return Object.keys(azureIconCategories);
    
    return Object.keys(azureIconCategories).filter(category => {
      const filteredIcons = filterIcons(azureIconCategories[category]);
      return filteredIcons.length > 0;
    });
  };

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
        <span className="hamburger-icon">{isMobileMenuOpen ? '✕' : '☰'}</span>
        <span className="menu-text">Services</span>
      </button>

      {isMobileMenuOpen && !isDragging && (
        <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <div className={`toolbar ${isMobileMenuOpen ? 'mobile-open' : ''} ${isCollapsed ? 'toolbar-collapsed' : ''}`}>

        {/* Collapse toggle — always visible */}
        <button
          className="toolbar-collapse-btn"
          onClick={() => setIsCollapsed(c => !c)}
          title={isCollapsed ? 'Expand panel' : 'Collapse panel'}
        >
          {isCollapsed ? '▶' : '◀'}
        </button>

        {/* Full content — hidden when collapsed */}
        {!isCollapsed && (
          <>
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
                title={expandedCategories.length === Object.keys(azureIconCategories).length ? 'Collapse All' : 'Expand All'}
              >
                {expandedCategories.length === Object.keys(azureIconCategories).length ? '⊟' : '⊞'}
              </button>
            </div>

            {/* Search Box */}
            <div className="toolbar-search">
              <input
                type="text"
                className="search-input"
                placeholder="🔍 Search services..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim()) {
                    setExpandedCategories(getFilteredCategories());
                  }
                }}
                aria-label="Search Azure services"
              />
              {searchQuery && (
                <button className="search-clear-btn" onClick={() => setSearchQuery('')} title="Clear search">
                  ✕
                </button>
              )}
            </div>

            <div className="category-accordion">
              {getFilteredCategories().map((category) => {
                const isExpanded = isCategoryExpanded(category);
                const filteredIcons = filterIcons(azureIconCategories[category]);
                const iconCount = filteredIcons.length;
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
                          {filteredIcons.map((icon) => (
                            <AzureIcon key={icon.id} icon={icon} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Toolbar;
