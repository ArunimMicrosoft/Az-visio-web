// Region Cost Comparison — side-by-side cost comparison across Azure regions
import React, { useState, useEffect } from 'react';
import { calculateCost, formatCost, azureRegions, currencies } from '../utils/costCalculator';
import './RegionCompare.css';

const DEFAULT_COMPARE_REGIONS = ['eastus', 'westeurope', 'southeastasia', 'centralindia'];

const RegionCompare = ({ isOpen, onClose, items, currency = 'USD' }) => {
  const [selectedRegions, setSelectedRegions] = useState(DEFAULT_COMPARE_REGIONS);
  const [results, setResults] = useState([]);
  const [pricingMode, setPricingMode] = useState('payg'); // payg | reserved1y | reserved3y

  useEffect(() => {
    if (!isOpen || !items || items.length === 0) return;

    const regionResults = selectedRegions.map(regionKey => {
      const cost = calculateCost(items, regionKey, currency);
      const multiplier = pricingMode === 'reserved1y' ? 0.62 : pricingMode === 'reserved3y' ? 0.40 : 1;
      return {
        region: regionKey,
        name: azureRegions[regionKey]?.name || regionKey,
        monthly: cost.totalMonthly * multiplier,
        yearly: cost.totalYearly * multiplier,
      };
    });

    regionResults.sort((a, b) => a.monthly - b.monthly);
    setResults(regionResults);
  }, [isOpen, items, selectedRegions, currency, pricingMode]);

  if (!isOpen) return null;

  const cheapest = results[0]?.monthly || 0;

  const toggleRegion = (region) => {
    setSelectedRegions(prev =>
      prev.includes(region)
        ? prev.filter(r => r !== region)
        : prev.length < 6 ? [...prev, region] : prev
    );
  };

  return (
    <div className="region-compare-overlay" onClick={onClose}>
      <div className="region-compare-modal" onClick={e => e.stopPropagation()}>
        <div className="rc-header">
          <h2>🌍 Region Cost Comparison</h2>
          <button className="rc-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="rc-controls">
          <div className="rc-pricing-toggle">
            <button className={`rc-mode-btn ${pricingMode === 'payg' ? 'active' : ''}`} onClick={() => setPricingMode('payg')}>Pay-as-you-go</button>
            <button className={`rc-mode-btn ${pricingMode === 'reserved1y' ? 'active' : ''}`} onClick={() => setPricingMode('reserved1y')}>1yr Reserved</button>
            <button className={`rc-mode-btn ${pricingMode === 'reserved3y' ? 'active' : ''}`} onClick={() => setPricingMode('reserved3y')}>3yr Reserved</button>
          </div>
          <div className="rc-region-selector">
            <span className="rc-label">Regions (max 6):</span>
            <div className="rc-region-chips">
              {Object.entries(azureRegions).slice(0, 20).map(([key, region]) => (
                <button
                  key={key}
                  className={`rc-chip ${selectedRegions.includes(key) ? 'active' : ''}`}
                  onClick={() => toggleRegion(key)}
                >
                  {region.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rc-results">
          {items.length === 0 ? (
            <div className="rc-empty">Add services to the canvas to compare costs</div>
          ) : (
            results.map((r, i) => {
              const diff = cheapest > 0 ? ((r.monthly - cheapest) / cheapest * 100).toFixed(0) : 0;
              const barWidth = cheapest > 0 ? (r.monthly / (results[results.length - 1]?.monthly || 1)) * 100 : 0;
              return (
                <div key={r.region} className={`rc-row ${i === 0 ? 'cheapest' : ''}`}>
                  <div className="rc-row-info">
                    <span className="rc-region-name">
                      {i === 0 && <span className="rc-badge">💚 Cheapest</span>}
                      {r.name}
                    </span>
                    <span className="rc-cost">{formatCost(r.monthly, currency)}/mo</span>
                    <span className="rc-yearly">{formatCost(r.yearly, currency)}/yr</span>
                    {i > 0 && <span className="rc-diff">+{diff}%</span>}
                  </div>
                  <div className="rc-bar-track">
                    <div className="rc-bar" style={{ width: `${barWidth}%` }} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default RegionCompare;
