import React, { useState, useEffect } from 'react';
import { calculateCost, formatCost, getCostCategory, getCostOptimizations } from '../utils/costCalculator';
import './CostSummary.css';

const CostSummary = ({ items }) => {
  const [costData, setCostData] = useState(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showOptimizations, setShowOptimizations] = useState(false);

  useEffect(() => {
    if (items && items.length > 0) {
      const cost = calculateCost(items);
      setCostData(cost);
    } else {
      setCostData(null);
    }
  }, [items]);

  if (!costData || items.length === 0) {
    return (
      <div className="cost-summary empty">
        <div className="cost-icon">💰</div>
        <p>Add services to see cost estimate</p>
      </div>
    );
  }

  const costCategory = getCostCategory(costData.totalMonthly);
  const optimizations = getCostOptimizations(items);

  return (
    <div className="cost-summary">
      <div className="cost-header">
        <h3>💰 Cost Estimate</h3>
        <span className="cost-region">{costData.region}</span>
      </div>

      <div className="cost-total">
        <div className="cost-monthly">
          <span className="cost-label">Monthly</span>
          <span className="cost-value" style={{ color: costCategory.color }}>
            {formatCost(costData.totalMonthly)}
          </span>
          <span className={`cost-badge ${costCategory.category.toLowerCase()}`}>
            {costCategory.category}
          </span>
        </div>
        
        <div className="cost-yearly">
          <span className="cost-label">Yearly</span>
          <span className="cost-value">
            {formatCost(costData.totalYearly)}
          </span>
        </div>
      </div>

      <div className="cost-actions">
        <button 
          className="cost-toggle-btn"
          onClick={() => setShowBreakdown(!showBreakdown)}
        >
          {showBreakdown ? '▼' : '►'} Cost Breakdown ({costData.breakdown.length} services)
        </button>
      </div>

      {showBreakdown && (
        <div className="cost-breakdown">
          <table className="cost-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Type</th>
                <th>Monthly Cost</th>
              </tr>
            </thead>
            <tbody>
              {costData.breakdown.map((item, index) => (
                <tr key={index}>
                  <td className="service-name">{item.name}</td>
                  <td className="service-type">{item.serviceType}</td>
                  <td className="service-cost">{formatCost(item.cost)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="2"><strong>Total</strong></td>
                <td className="total-cost"><strong>{formatCost(costData.totalMonthly)}</strong></td>
              </tr>
            </tfoot>
          </table>

          <div className="cost-details-note">
            <small>
              💡 <strong>Note:</strong> Estimates based on standard configurations in {costData.region}. 
              Actual costs may vary based on usage, region, and specific configurations.
            </small>
          </div>
        </div>
      )}

      {optimizations.length > 0 && (
        <>
          <div className="cost-actions">
            <button 
              className="cost-toggle-btn optimization-btn"
              onClick={() => setShowOptimizations(!showOptimizations)}
            >
              {showOptimizations ? '▼' : '►'} 💡 Cost Optimizations ({optimizations.length})
            </button>
          </div>

          {showOptimizations && (
            <div className="cost-optimizations">
              {optimizations.map((opt, index) => (
                <div key={index} className="optimization-card">
                  <div className="optimization-header">
                    <span className="optimization-service">🎯 {opt.service}</span>
                    <span className="optimization-savings">{opt.potentialSavings}</span>
                  </div>
                  <p className="optimization-suggestion">{opt.suggestion}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <div className="cost-footer">
        <small>Pricing as of {costData.pricingDate}</small>
      </div>
    </div>
  );
};

export default CostSummary;
