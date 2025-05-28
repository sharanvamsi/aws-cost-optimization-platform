'use client';

import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import ProgressIndicator from '../components/ProgressIndicator';
import BackButton from '../components/BackButton';
import LoadingSpinner from '../components/LoadingSpinner';

function getFormData() {
  try {
    return JSON.parse(localStorage.getItem('formData') || '{}');
  } catch {
    return {};
  }
}

function setFormData(newData: any) {
  localStorage.setItem('formData', JSON.stringify(newData));
}

export default function ExtraInfoPage() {
  const router = useRouter();
  const [extraData, setExtraData] = useState({
    additionalNotes: '',
    // Enhanced structured data
    dataVolume: '',
    peakUsageHours: '',
    complianceRequirements: [] as string[],
    currentCloudUsage: '',
    budgetConstraints: '',
    performanceRequirements: '',
    dataRetentionPeriod: '',
    geographicDistribution: '',
    integrationRequirements: '',
    scalabilityNeeds: '',
    securityRequirements: '',
    backupFrequency: '',
    disasterRecoveryNeeds: ''
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customerLicenses, setCustomerLicenses] = useState<string[]>([]);
  const [customerType, setCustomerType] = useState<string>('');

  // On mount, load customer data and previously entered notes
  useEffect(() => {
    const formData = getFormData();
    
    // Get customer license info from previous page
    if (formData.customer && formData.customer.licenses) {
      setCustomerLicenses(formData.customer.licenses);
    }
    
    // Get customer type for contextual questions
    if (formData.customer && formData.customer.type) {
      setCustomerType(formData.customer.type);
    }
    
    // Load previously entered data
    if (formData.extra) {
      setExtraData(prev => ({ ...prev, ...formData.extra }));
    }
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setExtraData(prev => ({ ...prev, [name]: value }));
    setFormError(null);
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setExtraData(prev => ({
      ...prev,
      [name]: checked 
        ? [...(prev[name as keyof typeof prev] as string[]), value]
        : (prev[name as keyof typeof prev] as string[]).filter(item => item !== value)
    }));
    setFormError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);

    try {
      // Get the stored data from formData
      const formData = getFormData();
      const files = formData.files || {};
      const customer = formData.customer || {};
      
      const regionalCostData = files.regionalCostData;
      const productCostData = files.productCostData;
      const customerListData = files.customerListData;
      
      if (!regionalCostData || !productCostData || !customerListData) {
        throw new Error('Missing required file data (regional, product, or customer list). Please go back to the first step and ensure all files are uploaded.');
      }

      if (!customer.name || !customer.country || !customer.licenses || customer.licenses.length === 0) {
        throw new Error('Missing required customer information (name, country, or licenses). Please go back to the customer info page.');
      }
      
      // Ensure customer type, beds, and size have default values if not present
      const customerType = customer.type || 'Other';
      const customerBeds = customer.beds || 0;
      const customerSize = customer.size || 'Medium';

      // Store the enhanced additional data in formData.extra
      formData.extra = extraData;
      setFormData(formData);

      // Call the API to get region mapping and cost
      const response = await fetch('/api/map-customer-region', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: customer.name,
          customerCountry: customer.country,
          customerCityState: customer.cityState,
          customerLicenses: customer.licenses,
          regionalCostBreakdownData: regionalCostData,
          productCostData: productCostData,
          customerListData: customerListData,
          additionalNotes: extraData.additionalNotes,
          enhancedAdditionalData: extraData, // Pass all enhanced data
          customerType: customerType,
          customerBeds: customerBeds,
          customerSize: customerSize,
        }),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        console.error("API Error Response:", errorResult);
        throw new Error(errorResult.error || 'Failed to calculate costs. Status: ' + response.status);
      }

      const result = await response.json();
      
      // Debug the API response
      console.log('API Response:', result);
      
      // Ensure customerLocation is a string
      if (result.customerLocation && typeof result.customerLocation === 'object') {
        try {
          result.customerLocation = JSON.stringify(result.customerLocation);
        } catch (e) {
          result.customerLocation = "Sacramento, California, USA";
        }
      }
      
      // Store the result for the results page
      localStorage.setItem('calculationResult', JSON.stringify(result));
      
      // Navigate to the results page
      router.push('/results');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Get contextual questions based on customer type
  const getContextualQuestions = () => {
    const baseQuestions = [
      {
        id: 'dataVolume',
        label: 'Estimated Monthly Data Volume',
        type: 'select',
        options: [
          { value: '', label: 'Select data volume...' },
          { value: 'low', label: 'Low (< 1 TB)' },
          { value: 'medium', label: 'Medium (1-10 TB)' },
          { value: 'high', label: 'High (10-100 TB)' },
          { value: 'very-high', label: 'Very High (> 100 TB)' }
        ]
      },
      {
        id: 'peakUsageHours',
        label: 'Peak Usage Hours',
        type: 'select',
        options: [
          { value: '', label: 'Select peak hours...' },
          { value: 'business-hours', label: 'Business Hours (9 AM - 5 PM)' },
          { value: 'extended-hours', label: 'Extended Hours (7 AM - 7 PM)' },
          { value: 'round-the-clock', label: '24/7 Operations' },
          { value: 'batch-processing', label: 'Batch Processing (Off-hours)' }
        ]
      },
      {
        id: 'dataRetentionPeriod',
        label: 'Data Retention Requirements',
        type: 'select',
        options: [
          { value: '', label: 'Select retention period...' },
          { value: '1-year', label: '1 Year' },
          { value: '3-years', label: '3 Years' },
          { value: '5-years', label: '5 Years' },
          { value: '7-years', label: '7 Years' },
          { value: '10-years', label: '10+ Years' },
          { value: 'indefinite', label: 'Indefinite' }
        ]
      }
    ];

    const typeSpecificQuestions: Record<string, any[]> = {
      'Hospital': [
        {
          id: 'complianceRequirements',
          label: 'Compliance Requirements',
          type: 'checkbox',
          options: [
            { value: 'hipaa', label: 'HIPAA' },
            { value: 'hitech', label: 'HITECH' },
            { value: 'gdpr', label: 'GDPR' },
            { value: 'sox', label: 'SOX' },
            { value: 'fda-21-cfr-part-11', label: 'FDA 21 CFR Part 11' }
          ]
        },
        {
          id: 'performanceRequirements',
          label: 'Performance Requirements',
          type: 'select',
          options: [
            { value: '', label: 'Select performance level...' },
            { value: 'standard', label: 'Standard Performance' },
            { value: 'high', label: 'High Performance (Low Latency)' },
            { value: 'critical', label: 'Mission Critical (Real-time)' }
          ]
        }
      ],
      'Reference Lab': [
        {
          id: 'complianceRequirements',
          label: 'Compliance Requirements',
          type: 'checkbox',
          options: [
            { value: 'clia', label: 'CLIA' },
            { value: 'cap', label: 'CAP' },
            { value: 'iso-15189', label: 'ISO 15189' },
            { value: 'hipaa', label: 'HIPAA' },
            { value: 'gdpr', label: 'GDPR' }
          ]
        },
        {
          id: 'scalabilityNeeds',
          label: 'Expected Growth/Scalability',
          type: 'select',
          options: [
            { value: '', label: 'Select growth expectation...' },
            { value: 'stable', label: 'Stable (< 10% growth)' },
            { value: 'moderate', label: 'Moderate (10-25% growth)' },
            { value: 'high', label: 'High (25-50% growth)' },
            { value: 'rapid', label: 'Rapid (> 50% growth)' }
          ]
        }
      ],
      'Research': [
        {
          id: 'complianceRequirements',
          label: 'Compliance Requirements',
          type: 'checkbox',
          options: [
            { value: 'gcp', label: 'GCP (Good Clinical Practice)' },
            { value: 'glp', label: 'GLP (Good Laboratory Practice)' },
            { value: 'fda-21-cfr-part-11', label: 'FDA 21 CFR Part 11' },
            { value: 'gdpr', label: 'GDPR' },
            { value: 'institutional-review', label: 'Institutional Review Board' }
          ]
        },
        {
          id: 'performanceRequirements',
          label: 'Computational Requirements',
          type: 'select',
          options: [
            { value: '', label: 'Select computational needs...' },
            { value: 'basic', label: 'Basic Analysis' },
            { value: 'advanced', label: 'Advanced Analytics' },
            { value: 'hpc', label: 'High Performance Computing' },
            { value: 'ml-ai', label: 'Machine Learning/AI' }
          ]
        }
      ]
    };

    return [...baseQuestions, ...(typeSpecificQuestions[customerType] || [])];
  };

  const renderFormField = (question: any) => {
    switch (question.type) {
      case 'select':
        return (
          <div key={question.id} className={styles.inputGroup}>
            <label htmlFor={question.id}>{question.label}</label>
            <select
              id={question.id}
              name={question.id}
              value={extraData[question.id as keyof typeof extraData] as string}
              onChange={handleInputChange}
              className={styles.selectInput}
            >
              {question.options.map((option: any) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );
      
      case 'checkbox':
        return (
          <div key={question.id} className={styles.inputGroup}>
            <label className={styles.checkboxGroupLabel}>{question.label}</label>
            <div className={styles.checkboxGroup}>
              {question.options.map((option: any) => (
                <label key={option.value} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name={question.id}
                    value={option.value}
                    checked={(extraData[question.id as keyof typeof extraData] as string[]).includes(option.value)}
                    onChange={handleCheckboxChange}
                    className={styles.checkboxInput}
                  />
                  <span className={styles.checkboxText}>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <ProgressIndicator currentPath="/extra-info" />
        <BackButton href="/customer-info" />
        <h1 className={styles.title}>Additional Information</h1>
        <p className={styles.subtitle}>
          Please provide additional details to improve cost calculation accuracy. This information helps us better estimate your AWS usage patterns and requirements.
        </p>
        
        {isLoading ? (
          <div className={styles.loadingWrapper}>
            <LoadingSpinner message="Analyzing your requirements and calculating optimized AWS costs..." />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            {customerLicenses.length > 0 && (
              <div className={styles.licenseInfoSection}>
                <h3 className={styles.sectionTitle}>Customer License Information</h3>
                <div className={styles.licenseList}>
                  {customerLicenses.map((license, index) => (
                    <div key={index} className={styles.licenseItem}>
                      <span className={styles.licenseIcon}>✓</span>
                      <span className={styles.licenseName}>{license}</span>
                    </div>
                  ))}
                </div>
                <p className={styles.licenseNote}>
                  Cost calculations will be based on products associated with these licenses.
                </p>
              </div>
            )}

            {/* Enhanced structured questions */}
            <div className={styles.enhancedQuestionsSection}>
              <h3 className={styles.sectionTitle}>Usage & Requirements Analysis</h3>
              <p className={styles.sectionDescription}>
                These details help us provide more accurate cost estimates and optimization recommendations.
              </p>
              
              {getContextualQuestions().map(question => renderFormField(question))}

              {/* Additional contextual fields */}
              <div className={styles.inputGroup}>
                <label htmlFor="currentCloudUsage">Current Cloud Infrastructure</label>
                <select
                  id="currentCloudUsage"
                  name="currentCloudUsage"
                  value={extraData.currentCloudUsage}
                  onChange={handleInputChange}
                  className={styles.selectInput}
                >
                  <option value="">Select current setup...</option>
                  <option value="none">No cloud infrastructure</option>
                  <option value="aws-basic">Basic AWS usage</option>
                  <option value="aws-advanced">Advanced AWS usage</option>
                  <option value="multi-cloud">Multi-cloud environment</option>
                  <option value="on-premise">Primarily on-premise</option>
                  <option value="hybrid">Hybrid cloud setup</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="budgetConstraints">Budget Considerations</label>
                <select
                  id="budgetConstraints"
                  name="budgetConstraints"
                  value={extraData.budgetConstraints}
                  onChange={handleInputChange}
                  className={styles.selectInput}
                >
                  <option value="">Select budget priority...</option>
                  <option value="cost-optimized">Cost-optimized (lowest cost priority)</option>
                  <option value="balanced">Balanced (cost vs. performance)</option>
                  <option value="performance-first">Performance-first (cost secondary)</option>
                  <option value="enterprise">Enterprise (premium features)</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="geographicDistribution">Geographic Distribution</label>
                <select
                  id="geographicDistribution"
                  name="geographicDistribution"
                  value={extraData.geographicDistribution}
                  onChange={handleInputChange}
                  className={styles.selectInput}
                >
                  <option value="">Select distribution...</option>
                  <option value="single-location">Single location</option>
                  <option value="regional">Regional (same country/state)</option>
                  <option value="national">National</option>
                  <option value="international">International</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="backupFrequency">Backup & Recovery Requirements</label>
                <select
                  id="backupFrequency"
                  name="backupFrequency"
                  value={extraData.backupFrequency}
                  onChange={handleInputChange}
                  className={styles.selectInput}
                >
                  <option value="">Select backup frequency...</option>
                  <option value="daily">Daily backups</option>
                  <option value="real-time">Real-time/Continuous</option>
                  <option value="weekly">Weekly backups</option>
                  <option value="monthly">Monthly backups</option>
                  <option value="custom">Custom schedule</option>
                </select>
              </div>
            </div>

            {/* Free-form additional notes */}
            <div className={styles.inputGroup}>
              <label htmlFor="additionalNotes">Additional Notes & Special Requirements</label>
              <textarea
                id="additionalNotes"
                name="additionalNotes"
                value={extraData.additionalNotes}
                onChange={handleInputChange}
                rows={6}
                placeholder="Enter any additional information about specific requirements, constraints, or considerations that might affect AWS cost calculations..."
              />
            </div>

            {formError && (
              <div className={styles.errorContainer}>
                <p className={styles.errorMessage}>{formError}</p>
              </div>
            )}

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              Calculate Enhanced Cost Analysis
            </button>
          </form>
        )}
      </div>
    </main>
  );
} 