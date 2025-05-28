'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import ProgressIndicator from '../components/ProgressIndicator';
import LoadingSpinner from '../components/LoadingSpinner';

type CalculationResult = {
  customerName: string;
  customerCountry: string;
  customerCityState?: string;
  customerLocation?: string | null;
  closestRegion?: string | null;
  message: string;
  llmRawResponse?: {
    closestRegion?: string | null;
  };
  // Enhanced results
  customerLicenses?: string[];
  licenseCosts?: Record<string, number>;
  totalProductCost?: number;
  regionalCostRatio?: number;
  customerCost?: number;
  calculationSteps?: string[];
  highlightedFinalCost?: string;
  keyMetrics?: {
    reportingPeriod: string;
    specificRegionTotalAWSCost: number;
    regionalCostRatio: number;
    customerProportionOfGroup: string;
    inputCustomerTotalProductCost: number;
    finalCost: number;
  };
  // New optimization data
  benchmarkAnalysis?: {
    overallEfficiencyScore: number;
    regionalPercentile: number;
    serviceEfficiencyBreakdown: Record<string, any>;
  };
  optimizationRecommendations?: {
    recommendations: string[];
    prioritizedActions: any[];
    estimatedSavings: number;
  };
  serviceBreakdown?: Record<string, number>;
};

// Map lab IDs to names for display
const labNames: Record<string, string> = {
  'lab1': 'Genomics Lab',
  'lab2': 'Proteomics Lab',
  'lab3': 'Imaging Lab',
  'lab4': 'Bioinformatics Lab',
  'lab5': 'Clinical Research Lab',
};

// Helper function to sanitize calculation steps
function sanitizeCalculationSteps(steps: string[], inputCustomerName: string): string[] {
  if (!steps) return [];
  const sanitizedSteps: string[] = [];

  const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
  const inputCustomerNameEscaped = escapeRegExp(inputCustomerName);

  const customerDetailPattern = new RegExp(
    '^\\s*-\\s+(?!' + inputCustomerNameEscaped + ')(\\w+\\s*\\w*)\\s*\\(.*?\\):.*?(?:beds|products|licenses|group).*(?:=|\\$)',
    'i'
  );
  const groupMembershipPattern = /^\s*-\s+(Initial members in this group|Using fallback group|Identified members in the customer's group|Processed customers in the group):/i;
  const specificCustomerValuePattern = new RegExp(
    '^\\s*-\\s+(?!' + inputCustomerNameEscaped + ')(\\w+\\s*\\w*)\'s calculated value:', 'i'
  );

  for (const step of steps) {
    if (step.startsWith('Step 0: Parsing customer list data')) {
      sanitizedSteps.push('Step 0: Parsing customer list data');
      sanitizedSteps.push('  - Processed uploaded list of other customers for grouping.');
      continue;
    }
    if (step.includes('Columns in customer list:') || step.includes('has no licenses specified, defaulting to') || step.includes('Product count for Reference Lab')){
      // Skip these detailed parsing logs for customer list
      continue;
    }

    if (customerDetailPattern.test(step) || specificCustomerValuePattern.test(step)) {
      // Replace with a generic message
      if (!sanitizedSteps.find(s => s.includes('Calculated value for other customers in the group'))) {
        sanitizedSteps.push('    - Calculated value for other customers in the group.');
      }
      continue;
    }
    if (groupMembershipPattern.test(step) && step.includes(':')) {
      const genericGroupStep = step.substring(0, step.indexOf(':') + 1) + " (details omitted for privacy).";
      if(!sanitizedSteps.includes(genericGroupStep)) {
        sanitizedSteps.push(genericGroupStep);
      }
      continue;
    }
    if(step.includes('Input customer details for value calc')) {
      // Keep this, but consider if any part of it needs to be generic if it exposes other customer data in future
      sanitizedSteps.push(step);
      continue;
    }

    // Keep steps related to the input customer, high-level steps, and general process logs
    sanitizedSteps.push(step);
  }
  return sanitizedSteps;
}

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSteps, setShowSteps] = useState(false);

  useEffect(() => {
    const storedResult = localStorage.getItem('calculationResult');
    if (!storedResult) {
      setError('No calculation results found. Please start over.');
      return;
    }

    try {
      const parsedResult: CalculationResult = JSON.parse(storedResult);
      console.log('Parsed result on ResultsPage:', parsedResult);
      setResult(parsedResult);
    } catch (e) {
      console.error('Error parsing result on ResultsPage:', e);
      setError('Error loading results. Please try again.');
    }
  }, []);

  const handleStartOver = () => {
    // Clear only customer-specific data, preserve uploaded files
    localStorage.removeItem('customerData');
    localStorage.removeItem('calculationResult');
    localStorage.removeItem('additionalNotes');
    localStorage.removeItem('formData');
    
    // Navigate back to the start
    router.push('/');
  };

  const toggleSteps = () => {
    setShowSteps(!showSteps);
  };

  // Helper function to format currency
  const formatCurrency = (amount: number): string => {
    return '$' + amount.toFixed(2);
  };

  // Helper function to get final cost display
  const getFinalCostDisplay = (result: CalculationResult): string => {
    if (result.highlightedFinalCost) {
      return result.highlightedFinalCost;
    }
    if (result.keyMetrics?.finalCost) {
      return formatCurrency(result.keyMetrics.finalCost);
    }
    return 'N/A';
  };

  // Helper function for percentile class
  const getPercentileClass = (percentile: number): string => {
    if (percentile >= 90) return 'high-cost';
    if (percentile >= 75) return 'above-average';
    if (percentile >= 25) return 'average';
    return 'efficient';
  };

  if (error) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <ProgressIndicator currentPath="/results" />
          <div className={styles.errorContainer}>
            <h2 className={styles.errorTitle}>Error</h2>
            <p className={styles.errorMessage}>{error}</p>
            <button onClick={handleStartOver} className={styles.submitButton}>
              Start Over
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!result) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <ProgressIndicator currentPath="/results" />
          <div className={styles.loadingContainer}>
            <LoadingSpinner message="Loading your results..." />
          </div>
        </div>
      </main>
    );
  }

  const finalCost = getFinalCostDisplay(result);
  const displaySteps = result.calculationSteps ? sanitizeCalculationSteps(result.calculationSteps, result.customerName) : [];

  // Enhanced methodology steps
  const methodologySteps = [
    'Your product list is analyzed to determine specific AWS service consumption patterns for each lab type.',
    'Regional pricing multipliers are applied based on your AWS region to calculate accurate service costs.',
    'Your company is benchmarked against similar customers in your region based on lab types and customer profile.',
    'An efficiency score is calculated comparing your costs to regional benchmarks across all AWS services.',
    'AI-powered optimization recommendations are generated based on your specific usage patterns and inefficiencies.',
    'Cost reduction opportunities are prioritized by potential savings and implementation difficulty.'
  ];

  const methodologyBlurb = ['The enhanced AWS cost estimation uses advanced multi-dimensional analysis:']
    .concat(methodologySteps.map((step, index) => String(index + 1) + '. ' + step))
    .concat(['Note: This analysis provides actionable insights for cost optimization. Actual savings may vary based on implementation and usage patterns.'])
    .join('\n    ');

  const formatPercentage = (value: string | number): string => {
    try {
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      return String((numValue * 100).toFixed(2)) + '%';
    } catch {
      return '0.00%';
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <ProgressIndicator currentPath="/results" />
        <h1 className={styles.title}>AWS Cost Analysis & Optimization</h1>
        
        {/* Enhanced Final Cost Display */}
        <div className={styles.finalCostSection}>
          <div className={styles.finalCostCard}>
            <h2 className={styles.finalCostLabel}>Your Current AWS Cost</h2>
            <div className={styles.finalCostValue}>{finalCost}</div>
            
            {/* Optimization Potential Display */}
            {result.optimizationRecommendations && (
              <div className={styles.optimizationPotential}>
                <div className={styles.savingsHighlight}>
                  <span className={styles.savingsLabel}>Potential Monthly Savings:</span>
                  <span className={styles.savingsAmount}>
                    {formatCurrency(result.optimizationRecommendations.estimatedSavings)}
                  </span>
                </div>
                <div className={styles.optimizedCost}>
                  <span className={styles.optimizedLabel}>Optimized Cost:</span>
                  <span className={styles.optimizedAmount}>
                    {formatCurrency((result.keyMetrics?.finalCost || 0) - result.optimizationRecommendations.estimatedSavings)}
                  </span>
                </div>
              </div>
            )}
            
            <div className={styles.customerInfo}>
              <span className={styles.customerName}>{result.customerName}</span>
              <span className={styles.customerRegion}>
                {result.closestRegion && result.closestRegion !== '**' 
                  ? result.closestRegion 
                  : result.llmRawResponse?.closestRegion || 'US West (Oregon)'}
              </span>
            </div>
          </div>
          
          {/* Show Steps Toggle Button */}
          {(displaySteps.length > 0) && (
            <button 
              onClick={toggleSteps} 
              className={styles.showStepsButton}
            >
              {showSteps ? 'Hide Calculation Details' : 'Show How This Was Calculated'}
            </button>
          )}
        </div>

        {/* Benchmarking Dashboard */}
        {result.benchmarkAnalysis && (
          <div className={styles.benchmarkSection}>
            <h3 className={styles.sectionTitle}>Performance Benchmarking</h3>
            <div className={styles.benchmarkGrid}>
              <div className={styles.benchmarkCard}>
                <h4>Efficiency Score</h4>
                <div className={styles.scoreDisplay}>
                  <div className={styles.scoreValue}>
                    {(result.benchmarkAnalysis.overallEfficiencyScore * 100).toFixed(1)}%
                  </div>
                  <div className={styles.scoreBar}>
                    <div 
                      className={styles.scoreProgress}
                      style={{ width: `${result.benchmarkAnalysis.overallEfficiencyScore * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              
              <div className={styles.benchmarkCard}>
                <h4>Regional Ranking</h4>
                <div className={styles.percentileDisplay}>
                  <span className={styles.percentileValue}>
                    {result.benchmarkAnalysis.regionalPercentile.toFixed(0)}th
                  </span>
                  <span className={styles.percentileLabel}>percentile</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Service Cost Breakdown */}
        {result.serviceBreakdown && (
          <div className={styles.serviceBreakdownSection}>
            <h3 className={styles.sectionTitle}>AWS Service Cost Breakdown</h3>
            <div className={styles.serviceGrid}>
              {Object.entries(result.serviceBreakdown).map(([service, cost]) => {
                const efficiency = result.benchmarkAnalysis?.serviceEfficiencyBreakdown[service];
                return (
                  <div key={service} className={styles.serviceCard}>
                    <div className={styles.serviceHeader}>
                      <span className={styles.serviceName}>{service}</span>
                      <span className={styles.serviceCost}>{formatCurrency(cost)}</span>
                    </div>
                    {efficiency && (
                      <div className={styles.serviceMetrics}>
                        <div className={styles.percentileIndicator}>
                          <span className={`${styles.percentileBadge} ${getPercentileClass(efficiency.benchmarkPercentile)}`}>
                            {efficiency.benchmarkPercentile.toFixed(0)}th percentile
                          </span>
                        </div>
                        {efficiency.optimizationPotential > 0.1 && (
                          <div className={styles.optimizationIndicator}>
                            <span className={styles.optimizationText}>
                              {(efficiency.optimizationPotential * 100).toFixed(0)}% optimization potential
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Cost Optimization Recommendations */}
        {result.optimizationRecommendations && (
          <div className={styles.optimizationSection}>
            <h3 className={styles.sectionTitle}>Cost Optimization Recommendations</h3>
            <div className={styles.recommendationsGrid}>
              {result.optimizationRecommendations.prioritizedActions.map((action, index) => (
                <div key={index} className={`${styles.recommendationCard} ${styles[action.priority]}`}>
                  <div className={styles.recommendationHeader}>
                    <h4 className={styles.recommendationTitle}>{action.title}</h4>
                    <div className={styles.recommendationMeta}>
                      <span className={styles.savingsAmount}>
                        Save {formatCurrency(action.estimatedSavings)}
                      </span>
                      <span className={styles.timeEstimate}>{action.timeToImplement}</span>
                    </div>
                  </div>
                  
                  <p className={styles.recommendationDescription}>
                    {action.description}
                  </p>
                  
                  <div className={styles.actionItems}>
                    <h5>Action Items:</h5>
                    <ul>
                      {action.actionItems.map((item: string, itemIndex: number) => (
                        <li key={itemIndex}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className={styles.recommendationFooter}>
                    <span className={`${styles.difficultyBadge} ${styles[action.difficulty]}`}>
                      {action.difficulty} difficulty
                    </span>
                    <span className={`${styles.priorityBadge} ${styles[action.priority]}`}>
                      {action.priority} priority
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calculation Steps Section - Collapsible */}
        {showSteps && (
          <>
            <div className={styles.methodologySection}>
              <h3 className={styles.sectionTitle}>Enhanced Methodology Overview</h3>
              <p className={styles.methodologyText}>{methodologyBlurb}</p>
            </div>

            {result.keyMetrics && (
              <div className={styles.keyMetricsSection}>
                <h3 className={styles.keyMetricsTitle}>Key Metrics Summary</h3>
                <div className={styles.metricsGrid}>
                  <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Reporting Period:</span>
                    <span className={styles.metricValue}>{result.keyMetrics.reportingPeriod}</span>
                  </div>
                  <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Total AWS Cost for {result.closestRegion || 'your region'}:</span>
                    <span className={styles.metricValue}>
                      {result.keyMetrics.specificRegionTotalAWSCost 
                        ? formatCurrency(result.keyMetrics.specificRegionTotalAWSCost)
                        : 'N/A'}
                    </span>
                  </div>
                  <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Your Regional Efficiency Percentile:</span>
                    <span className={styles.metricValue}>
                      {result.benchmarkAnalysis
                        ? `${result.benchmarkAnalysis.regionalPercentile.toFixed(0)}th percentile`
                        : 'N/A'}
                    </span>
                  </div>
                  <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Your Enhanced AWS Cost Calculation:</span>
                    <span className={styles.metricValue}>
                      {result.keyMetrics.inputCustomerTotalProductCost
                        ? formatCurrency(result.keyMetrics.inputCustomerTotalProductCost)
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {displaySteps.length > 0 && (
              <div className={styles.stepsSection}>
                <h3 className={styles.stepsSectionTitle}>Detailed Calculation Log</h3>
                <div className={styles.calculationSteps}>
                  {displaySteps.map((step, index) => (
                    <div key={index} className={styles.calculationStep}>
                      {step.startsWith('Step') || step.startsWith('  -') ? (
                        <h4 className={styles.stepTitle}>{step}</h4>
                      ) : (
                        <p className={styles.stepDetail}>{step}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {result.customerLicenses && result.customerLicenses.length > 0 && showSteps && (
          <div className={styles.licenseSection}>
            <h3 className={styles.licenseSectionTitle}>Your Licenses</h3>
            <div className={styles.licenseGrid}>
              {result.customerLicenses.map((license, index) => (
                <div key={index} className={styles.licenseItem}>
                  <span className={styles.licenseIcon}>✓</span>
                  <span className={styles.licenseName}>{license}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.actionSection}>
          <button 
            onClick={() => router.push('/forecast')} 
            className={styles.forecastButton}
          >
            View Cost Forecast
          </button>
          <button 
            onClick={() => router.push('/new-customer-forecast')} 
            className={styles.newCustomerButton}
          >
            Quick New Customer Forecast
          </button>
          <button onClick={handleStartOver} className={styles.submitButton}>
            Calculate for New Customer
          </button>
        </div>
      </div>
    </main>
  );
} 