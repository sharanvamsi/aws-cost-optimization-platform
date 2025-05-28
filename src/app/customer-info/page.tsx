'use client';

import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import ProgressIndicator from '../components/ProgressIndicator';
import BackButton from '../components/BackButton';

const LICENSE_OPTIONS = [
  'Core Lab',
  'Pathology Lab',
  'Point of Care Lab',
  'Molecular Lab',
];

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

export default function CustomerInfoPage() {
  const router = useRouter();
  const [customerData, setCustomerData] = useState({
    name: '',
    country: '',
    cityState: '', // Optional
    licenses: [] as string[], // Changed from licenseInfo to licenses
    customerType: '', // Recommended, not strictly required
  });
  const [formError, setFormError] = useState<string | null>(null);

  // On mount, clear formData.customer and formData.extra, but keep formData.files
  useEffect(() => {
    const formData = getFormData();
    delete formData.customer;
    delete formData.extra;
    setFormData(formData);
  }, []);

  // Load previously entered data on component mount
  useEffect(() => {
    const formData = getFormData();
    const storedData = formData.customer;
    if (storedData) {
      try {
        setCustomerData({
          ...storedData,
          licenses: Array.isArray(storedData.licenses)
            ? storedData.licenses
            : typeof storedData.licenses === 'string' && storedData.licenses
              ? [storedData.licenses]
              : [],
        });
      } catch (error) {
        console.error('Error restoring customer data:', error);
      }
    }
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, multiple, options } = e.target as HTMLInputElement & HTMLSelectElement;
    if (name === 'licenses' && multiple) {
      // Multi-select handling
      const selected: string[] = [];
      for (let i = 0; i < options.length; i++) {
        if (options[i].selected) selected.push(options[i].value);
      }
      setCustomerData(prev => ({ ...prev, licenses: selected }));
    } else {
      setCustomerData(prev => ({ ...prev, [name]: value }));
    }
    setFormError(null); // Clear error when user starts typing
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!customerData.name || !customerData.country || customerData.licenses.length === 0) {
      setFormError('Please fill in all required fields: Name, Country, and License Info.');
      return;
    }
    // Store customer data in formData.customer in localStorage
    const formData = getFormData();
    formData.customer = customerData;
    setFormData(formData);
    // Navigate to the extra info page
    router.push('/extra-info');
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <ProgressIndicator currentPath="/customer-info" />
        <BackButton href="/" />
        <h1 className={styles.title}>Customer Information</h1>
        <p className={styles.subtitle}>
          Please provide the following details for the customer.
        </p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="name">Name <span className={styles.required}>*</span></label>
            <input
              type="text"
              id="name"
              name="name"
              value={customerData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="country">Country <span className={styles.required}>*</span></label>
            <input
              type="text"
              id="country"
              name="country"
              value={customerData.country}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="cityState">City/State (Optional)</label>
            <input
              type="text"
              id="cityState"
              name="cityState"
              value={customerData.cityState}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="licenses">License Info (Which labs they use) <span className={styles.required}>*</span></label>
            <select
              id="licenses"
              name="licenses"
              multiple
              value={customerData.licenses}
              onChange={handleInputChange}
              required
              size={LICENSE_OPTIONS.length}
            >
              {LICENSE_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <div className={styles.helperText}>
              Hold Ctrl (Windows) or Command (Mac) to select multiple.
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="customerType">Type of Customer (e.g., Hospital, Lab - Recommended)</label>
            <input
              type="text"
              id="customerType"
              name="customerType"
              value={customerData.customerType}
              onChange={handleInputChange}
              placeholder="e.g., Hospital, Private Lab, Research Institute"
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
          >
            Proceed to Additional Info
          </button>
        </form>
      </div>
    </main>
  );
} 