import React, { useState } from 'react';
import AzureIcon from './AzureIcon';
import { azureIconCategories, categoryNames } from '../utils/azureIcons';
import './Toolbar.css';

const Toolbar = () => {
  const [selectedCategory, setSelectedCategory] = useState('compute');
  
  console.log('=== TOOLBAR RENDERING ===');
  console.log('Selected category:', selectedCategory);
  console.log('Icons for category:', azureIconCategories[selectedCategory]);

  return (
    <div className="toolbar">
      <h3 className="toolbar-title">Azure Services</h3>
      
      <div className="category-tabs">
        {Object.keys(azureIconCategories).map((category) => (
          <button
            key={category}
            className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {categoryNames[category]}
          </button>
        ))}
      </div>

      <div className="toolbar-icons">
        {azureIconCategories[selectedCategory].map((icon) => (
          <AzureIcon key={icon.id} icon={icon} />
        ))}
      </div>
    </div>
  );
};

export default Toolbar;
