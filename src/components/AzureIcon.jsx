import React from 'react';
import './AzureIcon.css';

const AzureIcon = ({ icon, onDragStart }) => {
  const handleDragStart = (e) => {
    e.dataTransfer.setData('azureIcon', JSON.stringify(icon));
    if (onDragStart) onDragStart(icon);
  };

  return (
    <div
      className="azure-icon"
      draggable
      onDragStart={handleDragStart}
      title={icon.name}
    >
      <div className="icon-symbol">
        <img src={icon.path} alt={icon.name} className="icon-image" />
      </div>
      <span className="icon-label">{icon.name}</span>
    </div>
  );
};

export default AzureIcon;
