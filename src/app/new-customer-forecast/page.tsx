'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import ProgressIndicator from '../components/ProgressIndicator';
import BackButton from '../components/BackButton';

type CustomerType = 'Hospital' | 'Reference Lab' | 'Research Institute' | 'Point of Care' | 'Other';
type RegionType = 'US West (N. California)' | 'US West (Oregon)' | 'US East (N. Virginia)' | 'US East (Ohio)' | 'Europe (Frankfurt)' | 'Asia Pacific (Singapore)';
type SizeCategory = 'Small' | 'Medium' | 'Large' | 'Enterprise';

type NewCustomerData = {
  customerName: string;
  customerType: CustomerType;
  region: RegionType;
  sizeCategory: SizeCategory;
  estimatedBeds?: number;
  estimatedLabTypes: string[];
  dataVolume: 'Low' | 'Medium' | 'High' | 'Very High';
  complianceRequirements: string[];
  forecastPeriod: number;
};

type ForecastResult = {
  month: number;
  year: number;
  baseCost: number;
  projectedCost: number;
  growthFactor: number;
  cumulativeCost: number;
};

// Lab type consumption profiles (simplified for new customers)
const labBaselineCosts: Record<string, number> = {
  'Core Lab': 2500,
  'Molecular Lab': 4200,
  'Pathology Lab': 3800,
  'Point of Care Lab': 1800
};

// Regional multipliers
const regionalMultipliers: Record<RegionType, number> = {
  'US West (N. California)': 1.15,
  'US West (Oregon)': 1.0,
  'US East (N. Virginia)': 0.95,
  'US East (Ohio)': 0.92,
  'Europe (Frankfurt)': 1.08,
  'Asia Pacific (Singapore)': 1.12
};

// Size category multipliers
const sizeCategoryMultipliers: Record<SizeCategory, { base: number; growth: number; usage: number }> = {
  'Small': { base: 0.6, growth: 0.08, usage: 1.05 },
  'Medium': { base: 1.0, growth: 0.15, usage: 1.12 },
  'Large': { base: 1.8, growth: 0.22, usage: 1.18 },
  'Enterprise': { base: 3.2, growth: 0.30, usage: 1.25 }
};

// Data volume multipliers
const dataVolumeMultipliers = {
  'Low': 0.8,
  'Medium': 1.0,
  'High': 1.4,
  'Very High': 2.2
};

export default function NewCustomerForecastPage() {
  const router = useRouter();
  const [customerData, setCustomerData] = useState<NewCustomerData>({
    customerName: '',
    customerType: 'Hospital',
    region: 'US West (Oregon)',
    sizeCategory: 'Medium',
    estimatedLabTypes: [],
    dataVolume: 'Medium',
    complianceRequirements: [],
    forecastPeriod: 12
  });
  
  const [forecastResults, setForecastResults] = useState<ForecastResult[]>([]);
  const [estimatedMonthlyCost, setEstimatedMonthlyCost] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const availableLabTypes = [
    'Core Lab', 'Molecular Lab', 'Pathology Lab', 'Point of Care Lab'
  ];

  const availableCompliance = [
    'HIPAA', 'GDPR', 'CLIA', 'CAP', 'ISO 15189', 'FDA 21 CFR Part 11',
    'GLP', 'GCP', 'SOX', 'FISMA'
  ];

  const calculateNewCustomerForecast = () => {
    setIsCalculating(true);

    // Calculate base monthly cost
    let baseMonthlyCost = 0;
    
    // Add costs for selected lab types
    customerData.estimatedLabTypes.forEach(labType => {
      baseMonthlyCost += labBaselineCosts[labType] || 2000;
    });

    // Apply size category multiplier
    const sizeMultiplier = sizeCategoryMultipliers[customerData.sizeCategory];
    baseMonthlyCost *= sizeMultiplier.base;

    // Apply regional multiplier
    baseMonthlyCost *= regionalMultipliers[customerData.region];

    // Apply data volume multiplier
    baseMonthlyCost *= dataVolumeMultipliers[customerData.dataVolume];

    // Apply compliance overhead (2-5% per requirement)
    const complianceOverhead = 1 + (customerData.complianceRequirements.length * 0.03);
    baseMonthlyCost *= complianceOverhead;

    // Hospital bed scaling for hospitals
    if (customerData.customerType === 'Hospital' && customerData.estimatedBeds) {
      const bedScaling = Math.log10(customerData.estimatedBeds / 100 + 1) + 0.5;
      baseMonthlyCost *= bedScaling;
    }

    setEstimatedMonthlyCost(baseMonthlyCost);

    // Generate forecast
    const results: ForecastResult[] = [];
    let cumulativeCost = 0;
    
    for (let month = 1; month <= customerData.forecastPeriod; month++) {
      const yearFraction = month / 12;
      
      // Growth factors based on size category
      const growthFactor = Math.pow(1 + sizeMultiplier.growth, yearFraction);
      const usageFactor = Math.pow(sizeMultiplier.usage, yearFraction);
      const inflationFactor = Math.pow(1.03, yearFraction); // 3% inflation
      
      // Technology adoption factor (new customers start lower, ramp up faster)
      const techAdoptionFactor = Math.pow(1.15, yearFraction);
      
      const projectedCost = baseMonthlyCost * growthFactor * usageFactor * inflationFactor * techAdoptionFactor;
      cumulativeCost += projectedCost;
      
      results.push({
        month,
        year: new Date().getFullYear() + Math.floor((month - 1) / 12),
        baseCost: baseMonthlyCost * inflationFactor,
        projectedCost,
        growthFactor: growthFactor * usageFactor * techAdoptionFactor,
        cumulativeCost
      });
    }
    
    setForecastResults(results);
    setShowResults(true);
    setIsCalculating(false);
  };

  const handleLabTypeChange = (labType: string, checked: boolean) => {
    setCustomerData(prev => ({
      ...prev,
      estimatedLabTypes: checked 
        ? [...prev.estimatedLabTypes, labType]
        : prev.estimatedLabTypes.filter(lt => lt !== labType)
    }));
  };

  const handleComplianceChange = (requirement: string, checked: boolean) => {
    setCustomerData(prev => ({
      ...prev,
      complianceRequirements: checked
        ? [...prev.complianceRequirements, requirement]
        : prev.complianceRequirements.filter(req => req !== requirement)
    }));
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const finalResult = forecastResults[forecastResults.length - 1];
  const totalProjectedCost = finalResult?.cumulativeCost || 0;
  const projectedGrowth = finalResult ? ((finalResult.projectedCost / estimatedMonthlyCost - 1) * 100) : 0;

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <ProgressIndicator currentPath="/new-customer-forecast" />
        <BackButton href="/" />
        
        <h1 className={styles.title}>New Customer Forecast</h1>
        <p className={styles.subtitle}>
          Estimate AWS costs for a potential new Roche customer
        </p>

        {!showResults ? (
          <div className={styles.inputSection}>
            {/* Basic Information */}
            <div className={styles.formSection}>
              <h3>Customer Information</h3>
              <div className={styles.inputGrid}>
                <div className={styles.inputGroup}>
                  <label htmlFor="customerName">Customer Name</label>
                  <input
                    type="text"
                    id="customerName"
                    value={customerData.customerName}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="Enter customer name"
                    className={styles.textInput}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="customerType">Customer Type</label>
                  <select
                    id="customerType"
                    value={customerData.customerType}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, customerType: e.target.value as CustomerType }))}
                    className={styles.selectInput}
                  >
                    <option value="Hospital">Hospital</option>
                    <option value="Reference Lab">Reference Lab</option>
                    <option value="Research Institute">Research Institute</option>
                    <option value="Point of Care">Point of Care</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="region">AWS Region</label>
                  <select
                    id="region"
                    value={customerData.region}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, region: e.target.value as RegionType }))}
                    className={styles.selectInput}
                  >
                    <option value="US West (Oregon)">US West (Oregon)</option>
                    <option value="US West (N. California)">US West (N. California)</option>
                    <option value="US East (N. Virginia)">US East (N. Virginia)</option>
                    <option value="US East (Ohio)">US East (Ohio)</option>
                    <option value="Europe (Frankfurt)">Europe (Frankfurt)</option>
                    <option value="Asia Pacific (Singapore)">Asia Pacific (Singapore)</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="sizeCategory">Organization Size</label>
                  <select
                    id="sizeCategory"
                    value={customerData.sizeCategory}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, sizeCategory: e.target.value as SizeCategory }))}
                    className={styles.selectInput}
                  >
                    <option value="Small">Small (1-50 employees)</option>
                    <option value="Medium">Medium (51-500 employees)</option>
                    <option value="Large">Large (501-5000 employees)</option>
                    <option value="Enterprise">Enterprise (5000+ employees)</option>
                  </select>
                </div>

                {customerData.customerType === 'Hospital' && (
                  <div className={styles.inputGroup}>
                    <label htmlFor="estimatedBeds">Estimated Beds</label>
                    <input
                      type="number"
                      id="estimatedBeds"
                      value={customerData.estimatedBeds || ''}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, estimatedBeds: Number(e.target.value) }))}
                      placeholder="Number of hospital beds"
                      className={styles.numberInput}
                      min="1"
                      max="5000"
                    />
                  </div>
                )}

                <div className={styles.inputGroup}>
                  <label htmlFor="dataVolume">Expected Data Volume</label>
                  <select
                    id="dataVolume"
                    value={customerData.dataVolume}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, dataVolume: e.target.value as any }))}
                    className={styles.selectInput}
                  >
                    <option value="Low">Low (&lt; 1 TB/month)</option>
                    <option value="Medium">Medium (1-10 TB/month)</option>
                    <option value="High">High (10-100 TB/month)</option>
                    <option value="Very High">Very High (&gt; 100 TB/month)</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="forecastPeriod">Forecast Period</label>
                  <select
                    id="forecastPeriod"
                    value={customerData.forecastPeriod}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, forecastPeriod: Number(e.target.value) }))}
                    className={styles.selectInput}
                  >
                    <option value={6}>6 months</option>
                    <option value={12}>1 year</option>
                    <option value={24}>2 years</option>
                    <option value={36}>3 years</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Lab Types */}
            <div className={styles.formSection}>
              <h3>Expected Lab Types</h3>
              <div className={styles.checkboxGrid}>
                {availableLabTypes.map(labType => (
                  <label key={labType} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={customerData.estimatedLabTypes.includes(labType)}
                      onChange={(e) => handleLabTypeChange(labType, e.target.checked)}
                    />
                    <span>{labType}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Compliance Requirements */}
            <div className={styles.formSection}>
              <h3>Compliance Requirements</h3>
              <div className={styles.checkboxGrid}>
                {availableCompliance.map(requirement => (
                  <label key={requirement} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={customerData.complianceRequirements.includes(requirement)}
                      onChange={(e) => handleComplianceChange(requirement, e.target.checked)}
                    />
                    <span>{requirement}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Calculate Button */}
            <div className={styles.actionSection}>
              <button
                onClick={calculateNewCustomerForecast}
                disabled={!customerData.customerName || customerData.estimatedLabTypes.length === 0 || isCalculating}
                className={styles.calculateButton}
              >
                {isCalculating ? 'Calculating...' : 'Calculate Forecast'}
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.resultsSection}>
            {/* Results Summary */}
            <div className={styles.summarySection}>
              <h3>Forecast Summary for {customerData.customerName}</h3>
              <div className={styles.summaryGrid}>
                <div className={styles.summaryCard}>
                  <h4>Initial Monthly Cost</h4>
                  <div className={styles.summaryValue}>
                    {formatCurrency(estimatedMonthlyCost)}
                  </div>
                  <div className={styles.summarySubtext}>Month 1 estimate</div>
                </div>
                
                <div className={styles.summaryCard}>
                  <h4>Final Monthly Cost</h4>
                  <div className={styles.summaryValue}>
                    {formatCurrency(finalResult?.projectedCost || 0)}
                  </div>
                  <div className={styles.summarySubtext}>
                    Month {customerData.forecastPeriod} ({projectedGrowth > 0 ? '+' : ''}{projectedGrowth.toFixed(1)}% growth)
                  </div>
                </div>

                <div className={styles.summaryCard}>
                  <h4>Total Period Cost</h4>
                  <div className={styles.summaryValue}>
                    {formatCurrency(totalProjectedCost)}
                  </div>
                  <div className={styles.summarySubtext}>
                    {customerData.forecastPeriod} months cumulative
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Projection Table */}
            <div className={styles.tableSection}>
              <h4>Monthly Cost Projection</h4>
              <div className={styles.tableContainer}>
                <table className={styles.projectionTable}>
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Projected Cost</th>
                      <th>Growth Factor</th>
                      <th>Cumulative Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecastResults.map((result, index) => (
                      <tr key={index} className={index === 0 ? styles.firstRow : index === forecastResults.length - 1 ? styles.lastRow : ''}>
                        <td className={styles.monthCell}>
                          Month {result.month}
                        </td>
                        <td className={styles.costCell}>
                          {formatCurrency(result.projectedCost)}
                        </td>
                        <td className={styles.growthCell}>
                          {((result.growthFactor - 1) * 100).toFixed(1)}%
                        </td>
                        <td className={styles.cumulativeCell}>
                          {formatCurrency(result.cumulativeCost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Customer Details */}
            <div className={styles.detailsSection}>
              <h4>Customer Configuration</h4>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Type:</span>
                  <span className={styles.detailValue}>{customerData.customerType}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Region:</span>
                  <span className={styles.detailValue}>{customerData.region}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Size:</span>
                  <span className={styles.detailValue}>{customerData.sizeCategory}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Data Volume:</span>
                  <span className={styles.detailValue}>{customerData.dataVolume}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Lab Types:</span>
                  <span className={styles.detailValue}>{customerData.estimatedLabTypes.join(', ')}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Compliance:</span>
                  <span className={styles.detailValue}>
                    {customerData.complianceRequirements.length > 0 
                      ? customerData.complianceRequirements.join(', ')
                      : 'None specified'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={styles.actionSection}>
              <button
                onClick={() => setShowResults(false)}
                className={styles.secondaryButton}
              >
                Modify Parameters
              </button>
              <button
                onClick={() => router.push('/')}
                className={styles.primaryButton}
              >
                New Analysis
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 