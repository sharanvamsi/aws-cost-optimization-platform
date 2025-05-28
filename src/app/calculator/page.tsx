'use client';

import { useState } from 'react';
import styles from './page.module.css'; // Adjusted path for styles

type CostResult = {
  monthlyCost: string;
  yearlyCost: string;
  currency: string;
  breakdown: {
    baseCost: number;
    costPerUser: number;
    numberOfUsers: number;
  };
};

export default function CalculatorPage() { // Renamed component for clarity
  const [formData, setFormData] = useState({
    users: '',
    projectType: '',
    location: '',
  });

  const [result, setResult] = useState<CostResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const projectTypes = [
    'Web Application',
    'Mobile Application',
    'Data Analytics',
    'Machine Learning',
    'IoT Solution',
  ];

  const locations = [
    'US East (N. Virginia)',
    'US West (Oregon)',
    'EU (Ireland)',
    'Asia Pacific (Tokyo)',
    'Asia Pacific (Singapore)',
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/calculate', { // API path remains the same
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to calculate costs');
      }

      setResult(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>AWS Cost Calculator</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="users">Number of Users</label>
            <input
              type="number"
              id="users"
              name="users"
              value={formData.users}
              onChange={handleInputChange}
              placeholder="Enter number of users"
              required
              min="0"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="projectType">Project Type</label>
            <select
              id="projectType"
              name="projectType"
              value={formData.projectType}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a project type</option>
              {projectTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="location">AWS Region</label>
            <select
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a region</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Calculating...' : 'Calculate Cost'}
          </button>
        </form>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        {result && (
          <div className={styles.result}>
            <h2>Estimated Costs</h2>
            <div className={styles.costBreakdown}>
              <div className={styles.costItem}>
                <span>Monthly Cost:</span>
                <span>{result.currency} {result.monthlyCost}</span>
              </div>
              <div className={styles.costItem}>
                <span>Yearly Cost:</span>
                <span>{result.currency} {result.yearlyCost}</span>
              </div>
              <div className={styles.breakdown}>
                <h3>Cost Breakdown</h3>
                <p>Base Cost: {result.currency} {result.breakdown.baseCost}</p>
                <p>Cost per User: {result.currency} {result.breakdown.costPerUser}</p>
                <p>Number of Users: {result.breakdown.numberOfUsers}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 