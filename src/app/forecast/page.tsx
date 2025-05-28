'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import ProgressIndicator from '../components/ProgressIndicator';
import BackButton from '../components/BackButton';

type ForecastScenario = {
  id: string;
  name: string;
  description: string;
  growthRate: number;
  usageMultiplier: number;
  complianceImpact: number;
  technologyAdoption: number;
};

type ForecastResult = {
  month: number;
  year: number;
  baseCost: number;
  projectedCost: number;
  growthFactor: number;
  cumulativeCost: number;
  optimizationSavings: number;
  netCost: number;
};

type CustomerData = {
  customerName: string;
  currentMonthlyCost: number;
  serviceBreakdown: Record<string, number>;
  benchmarkAnalysis: any;
  optimizationRecommendations: any;
  customerLicenses: string[];
  customerType: string;
  closestRegion: string;
};

const forecastScenarios: ForecastScenario[] = [
  {
    id: 'conservative',
    name: 'Conservative Growth',
    description: 'Steady, predictable growth with gradual technology adoption',
    growthRate: 0.08, // 8% annual
    usageMultiplier: 1.05, // 5% usage increase annually
    complianceImpact: 1.02, // 2% compliance overhead
    technologyAdoption: 1.03 // 3% new tech adoption
  },
  {
    id: 'moderate',
    name: 'Moderate Growth',
    description: 'Balanced growth with typical market expansion',
    growthRate: 0.15, // 15% annual
    usageMultiplier: 1.12, // 12% usage increase annually
    complianceImpact: 1.05, // 5% compliance overhead
    technologyAdoption: 1.08 // 8% new tech adoption
  },
  {
    id: 'aggressive',
    name: 'Aggressive Growth',
    description: 'Rapid expansion with significant technology investment',
    growthRate: 0.25, // 25% annual
    usageMultiplier: 1.20, // 20% usage increase annually
    complianceImpact: 1.08, // 8% compliance overhead
    technologyAdoption: 1.15 // 15% new tech adoption
  },
  {
    id: 'rapid',
    name: 'Rapid Scale',
    description: 'High-growth startup or rapid market expansion',
    growthRate: 0.40, // 40% annual
    usageMultiplier: 1.35, // 35% usage increase annually
    complianceImpact: 1.12, // 12% compliance overhead
    technologyAdoption: 1.25 // 25% new tech adoption
  },
  {
    id: 'custom',
    name: 'Custom Scenario',
    description: 'Define your own growth parameters',
    growthRate: 0.10,
    usageMultiplier: 1.10,
    complianceImpact: 1.03,
    technologyAdoption: 1.05
  }
];

export default function ForecastPage() {
  const router = useRouter();
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<string>('moderate');
  const [forecastPeriod, setForecastPeriod] = useState<number>(12); // months
  const [customScenario, setCustomScenario] = useState<ForecastScenario>(forecastScenarios[4]);
  const [forecastResults, setForecastResults] = useState<ForecastResult[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [inflationRate, setInflationRate] = useState(0.03); // 3% annual inflation

  useEffect(() => {
    const storedResult = localStorage.getItem('calculationResult');
    if (!storedResult) {
      router.push('/results');
      return;
    }

    try {
      const parsedResult = JSON.parse(storedResult);
      const finalCost = parsedResult.keyMetrics?.finalCost || 
                       parsedResult.totalEstimatedCost || 
                       5000; // fallback

      setCustomerData({
        customerName: parsedResult.customerName || 'Unknown Customer',
        currentMonthlyCost: finalCost,
        serviceBreakdown: parsedResult.serviceBreakdown || {},
        benchmarkAnalysis: parsedResult.benchmarkAnalysis,
        optimizationRecommendations: parsedResult.optimizationRecommendations,
        customerLicenses: parsedResult.customerLicenses || [],
        customerType: parsedResult.customerType || 'Other',
        closestRegion: parsedResult.closestRegion || 'US West (N. California)'
      });
    } catch (error) {
      console.error('Error parsing customer data:', error);
      router.push('/results');
    }
  }, [router]);

  const calculateForecast = () => {
    if (!customerData) return;

    setIsCalculating(true);
    
    const scenario = selectedScenario === 'custom' ? customScenario : 
                    forecastScenarios.find(s => s.id === selectedScenario)!;
    
    const results: ForecastResult[] = [];
    let cumulativeCost = 0;
    
    // Calculate monthly forecast
    for (let month = 1; month <= forecastPeriod; month++) {
      const yearFraction = month / 12;
      
      // Compound growth calculation
      const growthFactor = Math.pow(1 + scenario.growthRate, yearFraction);
      const usageFactor = Math.pow(scenario.usageMultiplier, yearFraction);
      const complianceFactor = Math.pow(scenario.complianceImpact, yearFraction);
      const technologyFactor = Math.pow(scenario.technologyAdoption, yearFraction);
      const inflationFactor = Math.pow(1 + inflationRate, yearFraction);
      
      // Base projected cost
      const baseCost = customerData.currentMonthlyCost * inflationFactor;
      const projectedCost = baseCost * growthFactor * usageFactor * complianceFactor * technologyFactor;
      
      const netCost = projectedCost;
      cumulativeCost += netCost;
      
              results.push({
          month,
          year: new Date().getFullYear() + Math.floor((month - 1) / 12),
          baseCost,
          projectedCost,
          growthFactor: growthFactor * usageFactor * complianceFactor * technologyFactor,
          cumulativeCost,
          optimizationSavings: 0,
          netCost
        });
    }
    
    setForecastResults(results);
    setIsCalculating(false);
  };

  useEffect(() => {
    if (customerData) {
      calculateForecast();
    }
  }, [customerData, selectedScenario, forecastPeriod, inflationRate, customScenario]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getScenarioColor = (scenarioId: string): string => {
    const colors = {
      conservative: '#10b981',
      moderate: '#3b82f6',
      aggressive: '#f59e0b',
      rapid: '#ef4444',
      custom: '#8b5cf6'
    };
    return colors[scenarioId as keyof typeof colors] || '#6b7280';
  };

  if (!customerData) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.loading}>Loading customer data...</div>
        </div>
      </main>
    );
  }

  const totalProjectedCost = forecastResults[forecastResults.length - 1]?.cumulativeCost || 0;
  const finalResult = forecastResults[forecastResults.length - 1];
  const projectedGrowth = finalResult ? ((finalResult.netCost / customerData.currentMonthlyCost - 1) * 100) : 0;

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <ProgressIndicator currentPath="/forecast" />
        <BackButton href="/results" />
        
        <h1 className={styles.title}>Cost Forecasting</h1>
        <p className={styles.subtitle}>
          Predict future AWS costs for <strong>{customerData.customerName}</strong> based on growth scenarios
        </p>

        {/* Current State Summary */}
        <div className={styles.currentStateCard}>
          <h3>Current Monthly Cost</h3>
          <div className={styles.currentCost}>{formatCurrency(customerData.currentMonthlyCost)}</div>
          <div className={styles.customerInfo}>
            <span>{customerData.customerType}</span>
            <span>{customerData.closestRegion}</span>
            <span>{customerData.customerLicenses.join(', ')}</span>
          </div>
        </div>

        {/* Forecast Configuration */}
        <div className={styles.configSection}>
          <h3>Forecast Configuration</h3>
          
          <div className={styles.configGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="forecastPeriod">Forecast Period (months)</label>
              <select
                id="forecastPeriod"
                value={forecastPeriod}
                onChange={(e) => setForecastPeriod(Number(e.target.value))}
                className={styles.selectInput}
              >
                <option value={6}>6 months</option>
                <option value={12}>1 year</option>
                <option value={24}>2 years</option>
                <option value={36}>3 years</option>
                <option value={60}>5 years</option>
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="inflationRate">Annual Inflation Rate (%)</label>
              <input
                type="number"
                id="inflationRate"
                value={inflationRate * 100}
                onChange={(e) => setInflationRate(Number(e.target.value) / 100)}
                step="0.1"
                min="0"
                max="20"
                className={styles.numberInput}
              />
            </div>


          </div>
        </div>

        {/* Scenario Selection */}
        <div className={styles.scenarioSection}>
          <h3>Growth Scenarios</h3>
          <div className={styles.scenarioGrid}>
            {forecastScenarios.map((scenario) => (
              <div
                key={scenario.id}
                className={`${styles.scenarioCard} ${selectedScenario === scenario.id ? styles.selected : ''}`}
                onClick={() => setSelectedScenario(scenario.id)}
                style={{ borderColor: selectedScenario === scenario.id ? getScenarioColor(scenario.id) : undefined }}
              >
                <h4 style={{ color: getScenarioColor(scenario.id) }}>{scenario.name}</h4>
                <p>{scenario.description}</p>
                <div className={styles.scenarioMetrics}>
                  <span>Growth: {(scenario.growthRate * 100).toFixed(0)}%/year</span>
                  <span>Usage: +{((scenario.usageMultiplier - 1) * 100).toFixed(0)}%/year</span>
                </div>
              </div>
            ))}
          </div>

          {/* Custom Scenario Configuration */}
          {selectedScenario === 'custom' && (
            <div className={styles.customScenarioConfig}>
              <h4>Custom Scenario Parameters</h4>
              <div className={styles.customGrid}>
                <div className={styles.inputGroup}>
                  <label>Annual Growth Rate (%)</label>
                  <input
                    type="number"
                    value={customScenario.growthRate * 100}
                    onChange={(e) => setCustomScenario(prev => ({
                      ...prev,
                      growthRate: Number(e.target.value) / 100
                    }))}
                    step="1"
                    min="0"
                    max="100"
                    className={styles.numberInput}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Usage Multiplier (annual)</label>
                  <input
                    type="number"
                    value={customScenario.usageMultiplier}
                    onChange={(e) => setCustomScenario(prev => ({
                      ...prev,
                      usageMultiplier: Number(e.target.value)
                    }))}
                    step="0.01"
                    min="1"
                    max="3"
                    className={styles.numberInput}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Compliance Impact</label>
                  <input
                    type="number"
                    value={customScenario.complianceImpact}
                    onChange={(e) => setCustomScenario(prev => ({
                      ...prev,
                      complianceImpact: Number(e.target.value)
                    }))}
                    step="0.01"
                    min="1"
                    max="2"
                    className={styles.numberInput}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Technology Adoption</label>
                  <input
                    type="number"
                    value={customScenario.technologyAdoption}
                    onChange={(e) => setCustomScenario(prev => ({
                      ...prev,
                      technologyAdoption: Number(e.target.value)
                    }))}
                    step="0.01"
                    min="1"
                    max="2"
                    className={styles.numberInput}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Calculation Methodology */}
        <div className={styles.methodologySection}>
          <h3>How Forecasting Works</h3>
          <div className={styles.methodologyContent}>
            <div className={styles.methodologyCard}>
              <h4>🧮 Core Calculation Formula</h4>
              <div className={styles.formula}>
                <strong>Monthly Cost = Base Cost × Growth Factor × Usage Factor × Compliance Factor × Technology Factor × Inflation Factor</strong>
              </div>
              <p>Each factor is calculated using compound growth over the forecast period, ensuring realistic exponential scaling.</p>
            </div>
            
            <div className={styles.methodologyGrid}>
              <div className={styles.factorCard}>
                <h5>📈 Growth Factor</h5>
                <p>Business expansion rate (8%-40% annually) based on your selected scenario. Reflects market growth, customer acquisition, and business scaling.</p>
              </div>
              
              <div className={styles.factorCard}>
                <h5>⚡ Usage Multiplier</h5>
                <p>Increased AWS service consumption (5%-35% annually) due to higher data processing, more frequent analyses, and expanded operations.</p>
              </div>
              
              <div className={styles.factorCard}>
                <h5>🛡️ Compliance Impact</h5>
                <p>Additional overhead (2%-12% annually) from evolving regulatory requirements, enhanced security measures, and audit compliance.</p>
              </div>
              
              <div className={styles.factorCard}>
                <h5>🚀 Technology Adoption</h5>
                <p>New service adoption costs (3%-25% annually) for AI/ML tools, advanced analytics, cloud-native services, and innovative technologies.</p>
              </div>
              
              <div className={styles.factorCard}>
                <h5>💰 Inflation Factor</h5>
                <p>Annual price increases ({(inflationRate * 100).toFixed(1)}%) in AWS service costs due to general economic inflation and cloud market dynamics.</p>
              </div>
            </div>
            
            <div className={styles.methodologyNote}>
              <strong>Note:</strong> All factors use compound growth calculations: Factor = (1 + annual_rate)^(months/12). This provides more accurate long-term projections than simple linear growth.
            </div>
          </div>
        </div>

        {/* Forecast Results */}
        {forecastResults.length > 0 && (
          <div className={styles.resultsSection}>
            <h3>Forecast Results</h3>
            
            {/* Summary Cards */}
            <div className={styles.summaryGrid}>
              <div className={styles.summaryCard}>
                <h4>Projected Monthly Cost</h4>
                <div className={styles.summaryValue} style={{ color: getScenarioColor(selectedScenario) }}>
                  {formatCurrency(finalResult?.netCost || 0)}
                </div>
                <div className={styles.summarySubtext}>
                  {projectedGrowth > 0 ? '+' : ''}{projectedGrowth.toFixed(1)}% vs current
                </div>
              </div>
              
              <div className={styles.summaryCard}>
                <h4>Total Period Cost</h4>
                <div className={styles.summaryValue}>
                  {formatCurrency(totalProjectedCost)}
                </div>
                <div className={styles.summarySubtext}>
                  {forecastPeriod} months cumulative
                </div>
              </div>


            </div>

            {/* Monthly Breakdown Chart */}
            <div className={styles.chartSection}>
              <h4>Monthly Cost Projection</h4>
              <div className={styles.chartContainer}>
                <div className={styles.chartGrid}>
                  {forecastResults.map((result, index) => (
                    <div key={index} className={styles.chartBar}>
                      <div 
                        className={styles.bar}
                        style={{ 
                          height: `${(result.netCost / Math.max(...forecastResults.map(r => r.netCost))) * 100}%`,
                          backgroundColor: getScenarioColor(selectedScenario)
                        }}
                      />
                      <div className={styles.barLabel}>
                        M{result.month}
                      </div>
                      <div className={styles.barValue}>
                        {formatCurrency(result.netCost)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Detailed Table */}
            <div className={styles.tableSection}>
              <h4>Detailed Monthly Breakdown</h4>
              <div className={styles.tableContainer}>
                <table className={styles.forecastTable}>
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Base Cost</th>
                      <th>Projected Cost</th>
                      <th>Growth Factor</th>
                      <th>Net Cost</th>
                      <th>Cumulative</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecastResults.map((result, index) => (
                      <tr key={index} className={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                        <td>
                          <span className={styles.monthLabel}>
                            {new Date(result.year, (result.month - 1) % 12).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </span>
                        </td>
                        <td>{formatCurrency(result.baseCost)}</td>
                        <td>{formatCurrency(result.projectedCost)}</td>
                        <td>
                          <span className={styles.growthFactor}>
                            {(result.growthFactor * 100).toFixed(1)}%
                          </span>
                        </td>
                        <td>
                          <strong>{formatCurrency(result.netCost)}</strong>
                        </td>
                        <td>{formatCurrency(result.cumulativeCost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className={styles.actionSection}>
          <button
            onClick={() => router.push('/results')}
            className={styles.secondaryButton}
          >
            Back to Results
          </button>
          <button
            onClick={() => router.push('/')}
            className={styles.primaryButton}
          >
            New Analysis
          </button>
        </div>
      </div>
    </main>
  );
} 