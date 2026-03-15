import React, { useState, useEffect } from 'react';
import { calculateCost, formatCost, getCostCategory, getCostOptimizations, azureRegions, currencies } from '../utils/costCalculator';
import { getArchitecturePricingSummary } from '../utils/azureRetailPricesAPI';
import './CostSummary.css';

const CostSummary = ({ items, onRegionChange, onCurrencyChange, useRealTimeAPI = false }) => {
  const [costData, setCostData] = useState(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showOptimizations, setShowOptimizations] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('eastus');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [useRealTimePricing, setUseRealTimePricing] = useState(useRealTimeAPI);
  const [loadingRealTime, setLoadingRealTime] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    console.log('🔍 CostSummary received items:', items);
    console.log('🔍 Items count:', items?.length || 0);
    console.log('🔍 UseRealTimePricing:', useRealTimePricing);

    if (!items || items.length === 0) {
      console.log('⚠️ No items to calculate cost for');
      setCostData(null);
      return;
    }

    if (useRealTimePricing) {
      console.log('🌐 Fetching LIVE pricing from Azure API...');
      console.log('   Items to price:', items.map(i => ({ id: i.id, name: i.name, type: i.serviceType || i.type })));
      setLoadingRealTime(true);

      getArchitecturePricingSummary(items, selectedRegion, selectedCurrency)
        .then(realTimeCost => {
          console.log('✅ Azure API Response:', realTimeCost);
          if (!cancelled) {
            if (realTimeCost.totalMonthly === 0 || realTimeCost.pricedItemCount === 0) {
              console.warn('⚠️ Azure API returned $0 or no priced items. Falling back to static pricing.');
              const staticCost = calculateCost(items, selectedRegion, selectedCurrency);
              setCostData({ ...staticCost, dataSource: 'Static Estimates (API returned $0)' });
              setLoadingRealTime(false);
              return;
            }
            setCostData({
              totalMonthly: realTimeCost.totalMonthly,
              totalYearly: realTimeCost.totalMonthly * 12,
              breakdown: realTimeCost.serviceBreakdown.map(s => ({
                name: s.name,
                serviceType: s.serviceType,
                cost: s.monthlyEstimate,
                isRetired: s.isRetired || false,
                retiredInfo: s.retiredInfo || null,
                isNotMapped: s.isNotMapped || false,
                isNotAvailable: s.isNotAvailable || false,
                isFree: s.isFree || false,
                freeInfo: s.freeInfo || null,
                message: s.message || null
              })),
              region: realTimeCost.region,
              dataSource: 'Azure Retail Prices API (Official)',
              pricedItemCount: realTimeCost.pricedItemCount || 0,
              freeItemCount: realTimeCost.freeItemCount || 0,
              notAvailableItemCount: realTimeCost.notAvailableItemCount || 0,
              retiredItemCount: realTimeCost.retiredItemCount || 0,
              notMappedItemCount: realTimeCost.notMappedItemCount || 0
            });
            setLoadingRealTime(false);
          }
        })
        .catch(error => {
          if (!cancelled) {
            console.error('❌ Error fetching real-time pricing:', error);
            const cost = calculateCost(items, selectedRegion, selectedCurrency);
            setCostData({ ...cost, dataSource: 'Static Estimates (API Error)' });
            setLoadingRealTime(false);
          }
        });
    } else {
      const cost = calculateCost(items, selectedRegion, selectedCurrency);
      if (!cancelled) setCostData(cost);
    }

    return () => { cancelled = true; };
  }, [items, selectedRegion, selectedCurrency, useRealTimePricing]);

  const handleRegionChange = (region) => {
    setSelectedRegion(region);
    if (onRegionChange) onRegionChange(region);
  };

  const handleCurrencyChange = (currency) => {
    setSelectedCurrency(currency);
    if (onCurrencyChange) onCurrencyChange(currency);
  };

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
    <div className={`cost-summary${isCollapsed ? ' cost-summary-collapsed' : ''}`}>
      {/* Collapse toggle — always visible */}
      <button
        className="cost-collapse-btn"
        onClick={() => setIsCollapsed(c => !c)}
        title={isCollapsed ? 'Expand cost panel' : 'Collapse cost panel'}
      >
        {isCollapsed ? '◀' : '▶'}
      </button>

      {!isCollapsed && (
        <div className="cost-inner">
          <div className="cost-header">
            <h3>💰 Cost Estimate</h3>
            <button
              className={`real-time-toggle ${useRealTimePricing ? 'active' : ''}`}
              onClick={() => setUseRealTimePricing(!useRealTimePricing)}
              title={useRealTimePricing ? 'Using Azure Retail Prices API' : 'Using estimated pricing'}
              disabled={loadingRealTime}
            >
              {loadingRealTime ? '⏳' : useRealTimePricing ? '🌐 Live' : '📊 Est'}
            </button>
            <div className="cost-selectors">
              <select
                value={selectedRegion}
                onChange={(e) => handleRegionChange(e.target.value)}
                className="region-selector"
                title="Select Azure Region"
              >
                {Object.entries(azureRegions).map(([key, region]) => (
                  <option key={key} value={key}>{region.name}</option>
                ))}
              </select>
              <select
                value={selectedCurrency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="currency-selector"
                title="Select Currency"
              >
                {Object.entries(currencies).map(([key, curr]) => (
                  <option key={key} value={key}>{curr.symbol} {key}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="cost-total">
            <div className="cost-monthly">
              <span className="cost-label">Monthly</span>
              <span className="cost-value" style={{ color: costCategory.color }}>
                {formatCost(costData.totalMonthly, selectedCurrency)}
              </span>
              <span className={`cost-badge ${costCategory.category.toLowerCase()}`}>
                {costCategory.category}
              </span>
            </div>
            <div className="cost-yearly">
              <span className="cost-label">Yearly</span>
              <span className="cost-value">
                {formatCost(costData.totalYearly, selectedCurrency)}
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
              {/* Status Summary */}
              {useRealTimePricing && (costData.retiredItemCount > 0 || costData.notMappedItemCount > 0) && (
                <div className="pricing-status-summary">
                  <div className="status-summary-header">
                    <span className="status-icon">ℹ️</span>
                    <span className="status-title">Pricing Status</span>
                  </div>
                  <div className="status-summary-items">
                    {costData.pricedItemCount > 0 && (
                      <div className="status-item success">
                        <span className="status-badge">✅</span>
                        <span className="status-text">{costData.pricedItemCount} service{costData.pricedItemCount !== 1 ? 's' : ''} priced successfully</span>
                      </div>
                    )}
                    {costData.freeItemCount > 0 && (
                      <div className="status-item success">
                        <span className="status-badge">💚</span>
                        <span className="status-text">{costData.freeItemCount} free resource{costData.freeItemCount !== 1 ? 's' : ''} (no charge)</span>
                      </div>
                    )}
                    {costData.notAvailableItemCount > 0 && (
                      <div className="status-item info">
                        <span className="status-badge">ℹ️</span>
                        <span className="status-text">{costData.notAvailableItemCount} service{costData.notAvailableItemCount !== 1 ? 's' : ''} with no API pricing data</span>
                      </div>
                    )}
                    {costData.retiredItemCount > 0 && (
                      <div className="status-item warning">
                        <span className="status-badge">🚫</span>
                        <span className="status-text">{costData.retiredItemCount} retired/deprecated service{costData.retiredItemCount !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {costData.notMappedItemCount > 0 && (
                      <div className="status-item info">
                        <span className="status-badge">⚠️</span>
                        <span className="status-text">{costData.notMappedItemCount} service{costData.notMappedItemCount !== 1 ? 's' : ''} not yet mapped</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

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
                    <React.Fragment key={index}>
                      <tr className={item.isRetired ? 'service-retired' : item.isFree ? 'service-free' : item.isNotAvailable ? 'service-not-available' : item.isNotMapped ? 'service-unmapped' : ''}>
                        <td className="service-name">
                          {item.isRetired && <span className="service-status-icon" title="Retired Service">🚫</span>}
                          {item.isFree && <span className="service-status-icon" title="Free Resource">💚</span>}
                          {item.isNotAvailable && <span className="service-status-icon" title="No API Data">ℹ️</span>}
                          {item.isNotMapped && <span className="service-status-icon" title="Not Mapped">⚠️</span>}
                          {item.name}
                        </td>
                        <td className="service-type">{item.serviceType}</td>
                        <td className="service-cost">{formatCost(item.cost, selectedCurrency)}</td>
                      </tr>
                      {item.isRetired && item.retiredInfo && (
                        <tr className="service-warning-row">
                          <td colSpan="3">
                            <div className="service-warning retired">
                              <div className="warning-header">
                                <span className="warning-icon">🚫</span>
                                <span className="warning-title">{item.retiredInfo.status}: {item.retiredInfo.name}</span>
                              </div>
                              <div className="warning-body">
                                <p className="warning-message">{item.retiredInfo.message}</p>
                                <div className="warning-details">
                                  <span className="warning-detail"><strong>Status:</strong> {item.retiredInfo.status}</span>
                                  <span className="warning-detail"><strong>Date:</strong> {item.retiredInfo.retiredDate}</span>
                                  <span className="warning-detail"><strong>Replacement:</strong> {item.retiredInfo.replacement}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                      {item.isNotAvailable && item.message && (
                        <tr className="service-warning-row">
                          <td colSpan="3">
                            <div className="service-warning not-available">
                              <div className="warning-header">
                                <span className="warning-icon">ℹ️</span>
                                <span className="warning-title">No Pricing Data in API</span>
                              </div>
                              <div className="warning-body">
                                <p className="warning-message">{item.message}</p>
                                <p className="warning-hint"><strong>Note:</strong> This service may use indirect billing (charged through parent resources) or may not be available in the selected region.</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                      {item.isNotMapped && item.message && (
                        <tr className="service-warning-row">
                          <td colSpan="3">
                            <div className="service-warning not-mapped">
                              <div className="warning-header">
                                <span className="warning-icon">⚠️</span>
                                <span className="warning-title">Pricing Not Available</span>
                              </div>
                              <div className="warning-body">
                                <p className="warning-message">{item.message}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="2"><strong>Total</strong></td>
                    <td className="total-cost"><strong>{formatCost(costData.totalMonthly, selectedCurrency)}</strong></td>
                  </tr>
                </tfoot>
              </table>

              <div className="cost-details-note">
                <small>
                  💡 <strong>Note:</strong> Estimates based on standard configurations in {costData.region}.
                  Actual costs may vary based on usage, region, and specific configurations.
                </small>
              </div>

              {/* Enterprise API Information Panel */}
              <div className={`api-info-panel ${useRealTimePricing ? 'live' : 'static'}`}>
                <div className="api-info-header">
                  <span className="api-icon">{useRealTimePricing ? '🌐' : '📊'}</span>
                  <span className="api-status">
                    {useRealTimePricing ? 'LIVE PRICING' : 'STATIC ESTIMATES'}
                  </span>
                </div>
                <div className="api-info-body">
                  {useRealTimePricing ? (
                    <>
                      <div className="api-info-row">
                        <span className="api-label">Data Source:</span>
                        <span className="api-value">Microsoft Azure Retail Prices API</span>
                      </div>
                      <div className="api-info-row">
                        <span className="api-label">Endpoint:</span>
                        <span className="api-value-small">prices.azure.com/api/retail/prices</span>
                      </div>
                      <div className="api-info-row">
                        <span className="api-label">Update Frequency:</span>
                        <span className="api-value">Real-time (Cached 1hr)</span>
                      </div>
                      <div className="api-info-row">
                        <span className="api-label">Pricing Type:</span>
                        <span className="api-value">Pay-as-you-go / Consumption</span>
                      </div>
                      <div className="api-info-badge">
                        <span className="badge-icon">✓</span>
                        <span className="badge-text">Official Microsoft Pricing</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="api-info-row">
                        <span className="api-label">Data Source:</span>
                        <span className="api-value">Static Price Estimates</span>
                      </div>
                      <div className="api-info-row">
                        <span className="api-label">Based On:</span>
                        <span className="api-value">Standard Azure SKUs</span>
                      </div>
                      <div className="api-info-note">
                        💡 Enable "Live" mode for real-time Microsoft Azure pricing
                      </div>
                    </>
                  )}
                </div>
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
            <small>Pricing as of {new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}</small>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostSummary;
