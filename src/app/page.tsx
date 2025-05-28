'use client';

import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const ACCEPTED_FILE_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const ACCEPTED_FILE_EXTENSION = '.xlsx';

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

export default function FileUploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<{
    regionalCostFile: File | null;
    productCostFile: File | null;
    customerListFile: File | null;
  }> ({
    regionalCostFile: null,
    productCostFile: null,
    customerListFile: null,
  });

  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [hasPreloadedFiles, setHasPreloadedFiles] = useState(false);

  // Load previously uploaded files on component mount
  useEffect(() => {
    const formData = getFormData();
    const filesData = formData.files || {};
    
    // Also check old localStorage keys for backward compatibility
    const loadStoredFiles = async () => {
      // Try formData.files first, then fall back to old localStorage keys
      const regionalData = filesData.regionalCostData || localStorage.getItem('regionalCostData');
      const productData = filesData.productCostData || localStorage.getItem('productCostData');
      const customerData = filesData.customerListData || localStorage.getItem('customerListData');
      
      let filesLoaded = false;
      
      if (regionalData) {
        try {
          const file = await base64ToFile(regionalData, 'regional_cost_breakdown.xlsx');
          setFiles(prev => ({ ...prev, regionalCostFile: file }));
          filesLoaded = true;
        } catch (error) {
          console.error('Error restoring regional cost file:', error);
        }
      }
      if (productData) {
        try {
          const file = await base64ToFile(productData, 'product_cost_breakdown.xlsx');
          setFiles(prev => ({ ...prev, productCostFile: file }));
          filesLoaded = true;
        } catch (error) {
          console.error('Error restoring product cost file:', error);
        }
      }
      if (customerData) {
        try {
          const file = await base64ToFile(customerData, 'customer_list.xlsx');
          setFiles(prev => ({ ...prev, customerListFile: file }));
          filesLoaded = true;
        } catch (error) {
          console.error('Error restoring customer list file:', error);
        }
      }
      
      if (filesLoaded) {
        setHasPreloadedFiles(true);
      }
    };
    loadStoredFiles();
  }, []);

  // Helper function to convert base64 back to File
  const base64ToFile = async (base64: string, fileName: string): Promise<File> => {
    const response = await fetch(`data:${ACCEPTED_FILE_TYPE};base64,${base64}`);
    const blob = await response.blob();
    return new File([blob], fileName, { type: ACCEPTED_FILE_TYPE });
  };

  const nameToFileLabel = (name: string): string => {
    if (name === 'regionalCostFile') return 'Regional Cost Breakdown';
    if (name === 'productCostFile') return 'Product Cost Breakdown';
    if (name === 'customerListFile') return 'Customer List';
    return '';
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, files: inputFiles } = e.target;
    let currentErrors = [...fileErrors];
    const fileLabel = nameToFileLabel(name);
    currentErrors = currentErrors.filter(err => !err.includes(fileLabel));
    if (inputFiles && inputFiles.length > 0) {
      const file = inputFiles[0];
      if (file.type === ACCEPTED_FILE_TYPE || file.name.toLowerCase().endsWith(ACCEPTED_FILE_EXTENSION)) {
        setFiles(prev => ({ ...prev, [name]: file }));
      } else {
        currentErrors.push(`Invalid file type for ${fileLabel}. Please upload an ${ACCEPTED_FILE_EXTENSION} file.`);
        setFiles(prev => ({ ...prev, [name]: null }));
        e.target.value = '';
      }
    } else {
      setFiles(prev => ({ ...prev, [name]: null }));
    }
    setFileErrors(currentErrors);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const currentSubmitErrors: string[] = [];
    if (!files.regionalCostFile) currentSubmitErrors.push('Please upload the Regional Cost Breakdown file (.xlsx).');
    if (!files.productCostFile) currentSubmitErrors.push('Please upload the Product Cost Breakdown file (.xlsx).');
    if (!files.customerListFile) currentSubmitErrors.push('Please upload the Customer List file (.xlsx).');
    const typeErrorMessages = fileErrors.filter(err => err.includes('Invalid file type'));
    const allErrors = [...new Set([...currentSubmitErrors, ...typeErrorMessages])];
    setFileErrors(allErrors);
    if (allErrors.length === 0) {
      try {
        // Convert files to base64
        const regionalCostData = await fileToBase64(files.regionalCostFile!);
        const productCostData = await fileToBase64(files.productCostFile!);
        const customerListData = await fileToBase64(files.customerListFile!);
        
        // Store the data in formData.files in localStorage
        const formData = getFormData();
        formData.files = {
          regionalCostData,
          productCostData,
          customerListData,
        };
        setFormData(formData);
        
        // Also store in old localStorage keys for backward compatibility with API
        localStorage.setItem('regionalCostData', regionalCostData);
        localStorage.setItem('productCostData', productCostData);
        localStorage.setItem('customerListData', customerListData);
        
        router.push('/customer-info');
      } catch (error) {
        console.error('Error processing files:', error);
        setFileErrors(['Error processing files. Please try again.']);
      }
    }
  };

  // Helper function to convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  // Function to clear all files and start fresh
  const clearAllFiles = () => {
    setFiles({
      regionalCostFile: null,
      productCostFile: null,
      customerListFile: null,
    });
    setHasPreloadedFiles(false);
    setFileErrors([]);
    
    // Clear from localStorage as well
    localStorage.removeItem('regionalCostData');
    localStorage.removeItem('productCostData');
    localStorage.removeItem('customerListData');
    
    // Clear from formData
    const formData = getFormData();
    delete formData.files;
    setFormData(formData);
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Upload Your Cost Data</h1>
        <p className={styles.subtitle}>
          Please upload the following files to proceed to the AWS Cost Calculator.
          All files must be in {ACCEPTED_FILE_EXTENSION} format.
        </p>
        
        {hasPreloadedFiles && (
          <div className={styles.infoContainer}>
            <p className={styles.infoMessage}>
              ✓ Previously uploaded files have been restored. You can proceed directly or upload new files to replace them.
            </p>
            <button 
              type="button" 
              onClick={clearAllFiles}
              className={styles.clearButton}
            >
              Clear All Files & Start Fresh
            </button>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fileInputGroup}>
            <label htmlFor="regionalCostFile">1. Regional Cost Breakdown ({ACCEPTED_FILE_EXTENSION})</label>
            <input
              type="file"
              id="regionalCostFile"
              name="regionalCostFile"
              onChange={handleFileChange}
              className={styles.fileInput}
              accept={ACCEPTED_FILE_EXTENSION}
            />
            {files.regionalCostFile && <span className={styles.fileName}>{files.regionalCostFile.name}</span>}
          </div>

          <div className={styles.fileInputGroup}>
            <label htmlFor="productCostFile">2. Product Cost Breakdown ({ACCEPTED_FILE_EXTENSION})</label>
            <input
              type="file"
              id="productCostFile"
              name="productCostFile"
              onChange={handleFileChange}
              className={styles.fileInput}
              accept={ACCEPTED_FILE_EXTENSION}
            />
            {files.productCostFile && <span className={styles.fileName}>{files.productCostFile.name}</span>}
          </div>

          <div className={styles.fileInputGroup}>
            <label htmlFor="customerListFile">3. Customer List ({ACCEPTED_FILE_EXTENSION})</label>
            <input
              type="file"
              id="customerListFile"
              name="customerListFile"
              onChange={handleFileChange}
              className={styles.fileInput}
              accept={ACCEPTED_FILE_EXTENSION}
            />
            {files.customerListFile && <span className={styles.fileName}>{files.customerListFile.name}</span>}
          </div>

          {fileErrors.length > 0 && (
            <div className={styles.errorContainer}>
              {fileErrors.map((error, index) => (
                <p key={index} className={styles.errorMessage}>{error}</p>
              ))}
            </div>
          )}

          <button
            type="submit"
            className={styles.submitButton}
          >
            Proceed to Customer Info
          </button>
        </form>
        
        <div className={styles.alternativeSection}>
          <div className={styles.orDivider}>
            <span>or</span>
          </div>
          <button 
            type="button"
            onClick={() => router.push('/new-customer-forecast')} 
            className={styles.newCustomerButton}
          >
            Quick Forecast for New Customer
          </button>
        </div>
        </div>
      </main>
  );
}
