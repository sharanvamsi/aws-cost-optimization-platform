import { NextResponse } from 'next/server';
import axios from 'axios';
import * as XLSX from 'xlsx';

// --- Enhanced Type Definitions ---
type CustomerFromList = {
  name: string;
  region: string;
  licenses: string[];
  type: string;
  beds?: number;
  productCount?: number;
  size?: string;
};

type CustomerForCalculation = CustomerFromList & {
  value?: number;
};

type EnhancedMappingResult = {
  productMappings: Record<string, string>;
  labServiceConsumption: Record<string, Record<string, number>>;
  totalEstimatedCost: number;
  calculationSteps: string[];
};

type CustomerBenchmarkAnalysis = {
  overallEfficiencyScore: number;
  regionalPercentile: number;
  serviceEfficiencyBreakdown: Record<string, {
    currentCost: number;
    benchmarkPercentile: number;
    optimizationPotential: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }>;
  costOptimizationOpportunities: OptimizationOpportunity[];
};

type OptimizationOpportunity = {
  category: string;
  service: string;
  currentCost: number;
  potentialSavings: number;
  implementationDifficulty: 'easy' | 'medium' | 'hard';
  timeToImplement: string;
  description: string;
  actionItems: string[];
};

type PrioritizedAction = {
  title: string;
  description: string;
  estimatedSavings: number;
  timeToImplement: string;
  difficulty: 'easy' | 'medium' | 'hard';
  actionItems: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
};

type MapProductsToLabsResult = {
  productLabMappings: Record<string, string>;
  licenseCosts: Record<string, number>;
  totalProductCost: number;
  totalProcessedProductCount: number;
  calculationSteps: string[];
};

type RegionalCostMetrics = {
  specificRegionTotalAWSCost: number;
  regionalCostRatio: number;
  mostRecentMonth: string;
  calculationSteps: string[];
};

// Enhanced consumption profiles with benchmarking data
const labAWSConsumptionProfiles = {
  'Core Lab': {
    services: {
      'EC2': { 
        baseUnits: 10, 
        costPerProduct: 2.5, 
        utilizationFactor: 0.8,
        benchmarks: { low: 8, median: 15, high: 25, optimal: 12 },
        optimizationPotential: 0.3
      },
      'S3': { 
        baseUnits: 100, 
        costPerProduct: 0.5, 
        utilizationFactor: 0.9,
        benchmarks: { low: 80, median: 150, high: 300, optimal: 120 },
        optimizationPotential: 0.25
      },
      'RDS': { 
        baseUnits: 5, 
        costPerProduct: 8.0, 
        utilizationFactor: 0.7,
        benchmarks: { low: 4, median: 8, high: 15, optimal: 6 },
        optimizationPotential: 0.4
      },
      'Lambda': { 
        baseUnits: 1000, 
        costPerProduct: 0.1, 
        utilizationFactor: 0.6,
        benchmarks: { low: 500, median: 1200, high: 2500, optimal: 800 },
        optimizationPotential: 0.35
      },
      'CloudWatch': { 
        baseUnits: 50, 
        costPerProduct: 0.3, 
        utilizationFactor: 1.0,
        benchmarks: { low: 30, median: 60, high: 120, optimal: 45 },
        optimizationPotential: 0.2
      }
    },
    efficiencyMetrics: {
      'dataRetentionDays': { current: 365, optimal: 90, impact: 'high' },
      'instanceRightSizing': { current: 0.6, optimal: 0.85, impact: 'very-high' },
      'reservedInstanceUsage': { current: 0.3, optimal: 0.7, impact: 'high' },
      'autoScalingEfficiency': { current: 0.5, optimal: 0.8, impact: 'medium' }
    }
  },
  'Molecular Lab': {
    services: {
      'EC2': { 
        baseUnits: 15, 
        costPerProduct: 4.0, 
        utilizationFactor: 0.9,
        benchmarks: { low: 12, median: 22, high: 40, optimal: 18 },
        optimizationPotential: 0.25
      },
      'S3': { 
        baseUnits: 500, 
        costPerProduct: 1.2, 
        utilizationFactor: 0.95,
        benchmarks: { low: 400, median: 750, high: 1500, optimal: 600 },
        optimizationPotential: 0.3
      },
      'SageMaker': { 
        baseUnits: 2, 
        costPerProduct: 25.0, 
        utilizationFactor: 0.5,
        benchmarks: { low: 1, median: 3, high: 8, optimal: 2.5 },
        optimizationPotential: 0.4
      },
      'Batch': { 
        baseUnits: 5, 
        costPerProduct: 15.0, 
        utilizationFactor: 0.7,
        benchmarks: { low: 3, median: 7, high: 15, optimal: 5 },
        optimizationPotential: 0.35
      }
    },
    efficiencyMetrics: {
      'spotInstanceUsage': { current: 0.2, optimal: 0.6, impact: 'very-high' },
      'dataLifecycleManagement': { current: 0.4, optimal: 0.8, impact: 'high' },
      'mlModelOptimization': { current: 0.5, optimal: 0.85, impact: 'high' },
      'batchJobScheduling': { current: 0.6, optimal: 0.9, impact: 'medium' }
    }
  },
  'Pathology Lab': {
    services: {
      'EC2': { 
        baseUnits: 12, 
        costPerProduct: 3.5, 
        utilizationFactor: 0.85,
        benchmarks: { low: 10, median: 18, high: 30, optimal: 15 },
        optimizationPotential: 0.25
      },
      'S3': { 
        baseUnits: 800, 
        costPerProduct: 2.0, 
        utilizationFactor: 0.9,
        benchmarks: { low: 600, median: 1200, high: 2000, optimal: 900 },
        optimizationPotential: 0.3
      },
      'RDS': { 
        baseUnits: 6, 
        costPerProduct: 10.0, 
        utilizationFactor: 0.75,
        benchmarks: { low: 5, median: 10, high: 18, optimal: 8 },
        optimizationPotential: 0.4
      },
      'Rekognition': { 
        baseUnits: 100, 
        costPerProduct: 5.0, 
        utilizationFactor: 0.6,
        benchmarks: { low: 80, median: 150, high: 300, optimal: 120 },
        optimizationPotential: 0.35
      }
    },
    efficiencyMetrics: {
      'imageCompressionRatio': { current: 0.5, optimal: 0.8, impact: 'high' },
      'archivalStrategy': { current: 0.3, optimal: 0.7, impact: 'high' },
      'aiModelEfficiency': { current: 0.6, optimal: 0.85, impact: 'medium' }
    }
  },
  'Point of Care Lab': {
    services: {
      'EC2': { 
        baseUnits: 8, 
        costPerProduct: 2.0, 
        utilizationFactor: 0.75,
        benchmarks: { low: 6, median: 12, high: 20, optimal: 10 },
        optimizationPotential: 0.3
      },
      'S3': { 
        baseUnits: 50, 
        costPerProduct: 0.3, 
        utilizationFactor: 0.8,
        benchmarks: { low: 40, median: 80, high: 150, optimal: 60 },
        optimizationPotential: 0.25
      },
      'Lambda': { 
        baseUnits: 500, 
        costPerProduct: 0.05, 
        utilizationFactor: 0.7,
        benchmarks: { low: 300, median: 600, high: 1200, optimal: 450 },
        optimizationPotential: 0.3
      },
      'IoT Core': { 
        baseUnits: 100, 
        costPerProduct: 1.0, 
        utilizationFactor: 0.9,
        benchmarks: { low: 80, median: 150, high: 250, optimal: 120 },
        optimizationPotential: 0.2
      }
    },
    efficiencyMetrics: {
      'edgeComputing': { current: 0.4, optimal: 0.8, impact: 'high' },
      'dataTransmissionOptimization': { current: 0.5, optimal: 0.85, impact: 'medium' }
    }
  }
};

// Regional efficiency benchmarks
const regionalEfficiencyBenchmarks = {
  'US East (N. Virginia)': {
    averageEfficiencyScore: 0.72,
    topPerformerThreshold: 0.85,
    costPerProductBenchmarks: {
      'Core Lab': { p25: 45, p50: 65, p75: 95, p90: 130 },
      'Molecular Lab': { p25: 120, p50: 180, p75: 250, p90: 350 },
      'Pathology Lab': { p25: 80, p50: 120, p75: 180, p90: 250 },
      'Point of Care Lab': { p25: 30, p50: 50, p75: 80, p90: 120 }
    }
  },
  'US West (Oregon)': {
    averageEfficiencyScore: 0.68,
    topPerformerThreshold: 0.82,
    costPerProductBenchmarks: {
      'Core Lab': { p25: 48, p50: 70, p75: 100, p90: 140 },
      'Molecular Lab': { p25: 125, p50: 190, p75: 265, p90: 370 },
      'Pathology Lab': { p25: 85, p50: 125, p75: 185, p90: 260 },
      'Point of Care Lab': { p25: 32, p50: 55, p75: 85, p90: 125 }
    }
  },
  'US West (N. California)': {
    averageEfficiencyScore: 0.70,
    topPerformerThreshold: 0.83,
    costPerProductBenchmarks: {
      'Core Lab': { p25: 50, p50: 75, p75: 105, p90: 145 },
      'Molecular Lab': { p25: 130, p50: 195, p75: 270, p90: 380 },
      'Pathology Lab': { p25: 88, p50: 130, p75: 190, p90: 265 },
      'Point of Care Lab': { p25: 35, p50: 58, p75: 88, p90: 130 }
    }
  },
  'US East (Ohio)': {
    averageEfficiencyScore: 0.69,
    topPerformerThreshold: 0.81,
    costPerProductBenchmarks: {
      'Core Lab': { p25: 47, p50: 68, p75: 98, p90: 135 },
      'Molecular Lab': { p25: 122, p50: 185, p75: 260, p90: 365 },
      'Pathology Lab': { p25: 82, p50: 122, p75: 182, p90: 255 },
      'Point of Care Lab': { p25: 31, p50: 52, p75: 82, p90: 122 }
    }
  }
};

// Regional service multipliers
const regionalServiceMultipliers = {
  'US East (N. Virginia)': {
    'EC2': 1.0, 'S3': 1.0, 'RDS': 1.0, 'Lambda': 1.0, 'SageMaker': 1.0, 'Rekognition': 1.0, 'Batch': 1.0, 'IoT Core': 1.0, 'CloudWatch': 1.0
  },
  'US West (Oregon)': {
    'EC2': 1.05, 'S3': 1.02, 'RDS': 1.08, 'Lambda': 1.03, 'SageMaker': 1.06, 'Rekognition': 1.04, 'Batch': 1.07, 'IoT Core': 1.03, 'CloudWatch': 1.02
  },
  'US West (N. California)': {
    'EC2': 1.15, 'S3': 1.08, 'RDS': 1.18, 'Lambda': 1.10, 'SageMaker': 1.15, 'Rekognition': 1.12, 'Batch': 1.16, 'IoT Core': 1.08, 'CloudWatch': 1.06
  },
  'US East (Ohio)': {
    'EC2': 1.03, 'S3': 1.01, 'RDS': 1.05, 'Lambda': 1.02, 'SageMaker': 1.04, 'Rekognition': 1.03, 'Batch': 1.05, 'IoT Core': 1.02, 'CloudWatch': 1.01
  }
};

// Product to service mapping
const productToServiceMapping = {
  'Sequencer': { primaryServices: ['EC2', 'S3', 'SageMaker'], computeIntensity: 'high', storageIntensity: 'very-high', costMultiplier: 2.5 },
  'Microscope': { primaryServices: ['EC2', 'S3', 'Rekognition'], computeIntensity: 'medium', storageIntensity: 'high', costMultiplier: 1.8 },
  'Analyzer': { primaryServices: ['EC2', 'RDS', 'Lambda'], computeIntensity: 'medium', storageIntensity: 'medium', costMultiplier: 1.5 },
  'PCR': { primaryServices: ['EC2', 'S3', 'Lambda'], computeIntensity: 'medium', storageIntensity: 'medium', costMultiplier: 1.6 },
  'Centrifuge': { primaryServices: ['EC2', 'Lambda'], computeIntensity: 'low', storageIntensity: 'low', costMultiplier: 1.2 },
  'Incubator': { primaryServices: ['EC2', 'IoT Core'], computeIntensity: 'low', storageIntensity: 'low', costMultiplier: 1.1 },
  'Spectrophotometer': { primaryServices: ['EC2', 'RDS'], computeIntensity: 'medium', storageIntensity: 'medium', costMultiplier: 1.4 },
  'Histology': { primaryServices: ['EC2', 'S3', 'Rekognition'], computeIntensity: 'medium', storageIntensity: 'high', costMultiplier: 1.7 },
  'Stainer': { primaryServices: ['EC2', 'S3'], computeIntensity: 'low', storageIntensity: 'medium', costMultiplier: 1.3 },
  'Microtome': { primaryServices: ['EC2', 'S3'], computeIntensity: 'low', storageIntensity: 'medium', costMultiplier: 1.2 },
  'POC': { primaryServices: ['Lambda', 'IoT Core'], computeIntensity: 'low', storageIntensity: 'low', costMultiplier: 1.0 },
  'Handheld': { primaryServices: ['Lambda', 'IoT Core'], computeIntensity: 'low', storageIntensity: 'low', costMultiplier: 0.9 },
  'Portable': { primaryServices: ['Lambda', 'IoT Core'], computeIntensity: 'low', storageIntensity: 'low', costMultiplier: 0.8 },
  'Mobile': { primaryServices: ['Lambda', 'IoT Core'], computeIntensity: 'low', storageIntensity: 'low', costMultiplier: 0.7 }
};

// Actual LLM interaction logic using Ollama's API
async function invokeLocalLLM(prompt: string): Promise<any> {
  try {
    console.log('Calling local Ollama API with Llama 3 8B');
    
    const response = await axios.post(
      'http://localhost:11434/api/generate',
      {
        model: "llama3:8b",
        prompt: prompt + "\n\nRemember to respond ONLY with a valid JSON object and nothing else.",
        stream: false,
        options: {
          temperature: 0.2, 
          num_predict: 1000
        }
      }
    );
    console.log('Ollama API response received');
    if (!response.data) throw new Error('Invalid response from Ollama API');

    const content = (response.data as { response: string }).response;
    console.log('Raw content from LLM:', content);
    
    try {
      const jsonMatches = content.match(/\{[\s\S]*?\}/g);
      if (jsonMatches && jsonMatches.length > 0) {
        for (const match of jsonMatches) {
          try {
            const parsedJson = JSON.parse(match);
            console.log('Successfully parsed JSON from LLM response:', parsedJson);
            if (parsedJson.closestRegion && typeof parsedJson.closestRegion === 'string' && parsedJson.closestRegion.includes('(')) {
              parsedJson.closestRegion = parsedJson.closestRegion.split('(')[0].trim();
            }
            return parsedJson;
          } catch (e) { /* ignore parsing errors for a specific match */ }
        }
      }
      console.log('No valid JSON found in LLM response, using manual extraction');
      return { customerLocation: extractLocation(content), closestRegion: extractRegion(content) };
    } catch (e) {
      console.error('Failed to parse LLM response as JSON:', e);
      return { customerLocation: extractLocation(content), closestRegion: extractRegion(content) };
    }
  } catch (error: any) {
    console.error('Error calling Ollama API:', error);
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
    }
    throw error;
  }
}

function extractLocation(text: string): string | null {
  const locationMatch = text.match(/customer(?:'s)?\s+location.*?(?:is|:)\s*["']?(.*?)["']?(?:\.|,|\n|$)/i);
  return locationMatch ? locationMatch[1].trim() : null;
}

function extractRegion(text: string): string | null {
  const patterns = [
    /closest\s+region\s+is\s*["']?(US\s+West\s+\(Oregon\))["']?/i,
    /closest\s+region\s+is\s*["']?(US\s+West\s+\(N\.\s+California\))["']?/i,
    /closest\s+region\s+is\s*["']?(US\s+East\s+\(N\.\s+Virginia\))["']?/i,
    /closest\s+region\s+is\s*["']?(US\s+East\s+\(Ohio\))["']?/i,
    /closest\s+region\s+is\s*["']?(Europe\s+\([^)]+\))["']?/i,
    /closest\s+region\s+is\s*["']?(Asia\s+Pacific\s+\([^)]+\))["']?/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) return match[1];
  }
  const regionMatch = text.match(/closest\s+region.*?(?:is|:)\s*["']?(.*?)["']?(?:\.|,|\n|$)/i);
  if (regionMatch) {
    let region = regionMatch[1].trim();
    if (region.includes('(')) region = region.split('(')[0].trim();
    const regionMappings: Record<string, string> = {
      'US West': 'US West (N. California)', 'US East': 'US East (N. Virginia)',
      'Europe': 'Europe (Frankfurt)', 'Asia Pacific': 'Asia Pacific (Tokyo)'
    };
    return regionMappings[region] || region;
  }
  if (text.toLowerCase().includes('sacramento') && text.toLowerCase().includes('california')) return 'US West (N. California)';
  return 'US West (N. California)'; // Default fallback
}

function parseXLSXToJSON(xlsxInput: string): any[] {
  try {
    const buffer = Buffer.from(xlsxInput, 'base64');
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
    console.log('First 3 rows of parsed XLSX data:', jsonData.slice(0, 3).map(row => JSON.stringify(row)));
    if (jsonData.length > 0) console.log('Available columns in generic XLSX:', Object.keys(jsonData[0] as Record<string, unknown>));
    return jsonData;
  } catch (error) {
    console.error('Error parsing XLSX data to JSON:', error);
    throw new Error('Failed to parse XLSX data to JSON');
  }
}

// --- New Customer List Parsing Function ---
function parseCustomerListXLSX(xlsxInput: string, calculationSteps: string[]): CustomerFromList[] {
  calculationSteps.push("Step 0: Parsing customer list data");
  try {
    const buffer = Buffer.from(xlsxInput, 'base64');
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json<any>(worksheet, { defval: '' });

    calculationSteps.push(`  - Found ${rawData.length} rows in customer list.`);
    if (rawData.length > 0) {
        calculationSteps.push(`  - Columns in customer list: ${Object.keys(rawData[0]).join(', ')}`);
    }

    return rawData.map((row, index) => {
      // Normalize column names (case-insensitive, space/underscore removal)
      const normalizedRow: Record<string, any> = {};
      for (const key in row) {
        normalizedRow[key.toLowerCase().replace(/[ \s_]+/g, '')] = row[key];
      }
      
      const name = normalizedRow['name'] || normalizedRow['customername'] || `Customer ${index + 1}`;
      const region = normalizedRow['region'] || normalizedRow['awsregion'] || 'US West (N. California)';
      
      let licenses: string[] = [];
      const licensesRaw = normalizedRow['licenses'] || normalizedRow['licensetypes'];
      if (typeof licensesRaw === 'string') {
        licenses = licensesRaw.split(',').map(l => l.trim()).filter(l => l);
      } else if (Array.isArray(licensesRaw)) {
        licenses = licensesRaw.map(l => String(l).trim()).filter(l => l);
      }
      if (licenses.length === 0) {
        licenses = ['Core Lab']; // Default if none provided
        calculationSteps.push(`  - Warning: Customer '${name}' has no licenses specified, defaulting to 'Core Lab'.`);
      }

      const type = normalizedRow['type'] || normalizedRow['customertype'] || 'Other';
      
      const bedsStr = String(normalizedRow['beds'] || normalizedRow['numberofbeds'] || '0');
      const beds = parseInt(bedsStr.replace(/[^0-9]/g, '')) || 0;
      
      const productCountStr = String(normalizedRow['productcount'] || normalizedRow['numberofproducts'] || '');
      let productCount = parseInt(productCountStr.replace(/[^0-9]/g, ''));
      if (isNaN(productCount)) {
          productCount = type === 'Reference Lab' ? (licenses.length * 5) : 0; // Fallback: 5 products per license for Ref Labs
          if (type === 'Reference Lab') calculationSteps.push(`  - Warning: Product count for Reference Lab '${name}' not found or invalid, defaulting to ${productCount}.`);
      }
      
      const size = normalizedRow['size'] || normalizedRow['customersize'] || 'Medium';

      return { name, region, licenses, type, beds, productCount, size };
    });
  } catch (error) {
    console.error('Error parsing Customer List XLSX data:', error);
    calculationSteps.push(`  - Error parsing customer list: ${error instanceof Error ? error.message : String(error)}. Proceeding with empty customer list.`);
    return [];
  }
}


// --- Helper Functions for Enhanced Calculations ---

function getProductType(productName: string): string {
  const productLower = productName.toLowerCase();
  for (const [type, mapping] of Object.entries(productToServiceMapping)) {
    if (productLower.includes(type.toLowerCase())) {
      return type;
    }
  }
  return 'Analyzer'; // Default fallback
}

function assignProductToLab(productName: string, customerLicenses: string[]): string | null {
  const manualMappings: Record<string, string> = {
    'Centrifuge': 'Core Lab', 'Microscope': 'Core Lab', 'Analyzer': 'Core Lab', 'Incubator': 'Core Lab',
    'Spectrophotometer': 'Core Lab', 'Histology': 'Pathology Lab', 'Stainer': 'Pathology Lab',
    'Microtome': 'Pathology Lab', 'Embedding': 'Pathology Lab', 'Processor': 'Pathology Lab',
    'POC': 'Point of Care Lab', 'Handheld': 'Point of Care Lab', 'Portable': 'Point of Care Lab',
    'Mobile': 'Point of Care Lab', 'PCR': 'Molecular Lab', 'Sequencer': 'Molecular Lab',
    'Thermal': 'Molecular Lab', 'DNA': 'Molecular Lab', 'RNA': 'Molecular Lab', 'Genetic': 'Molecular Lab',
    'Assay': 'Core Lab', 'Laboratory': 'Core Lab', 'Diagnostic': 'Core Lab', 'Imaging': 'Pathology Lab',
    'Pathology': 'Pathology Lab','Point of Care': 'Point of Care Lab', 'Molecular': 'Molecular Lab',
    'Development': 'Core Lab', 'Engineering': 'Core Lab', 'Software': 'Core Lab', 'Platform': 'Core Lab',
    'Data': 'Core Lab', 'API': 'Core Lab', 'Cloud': 'Core Lab', 'Service': 'Core Lab', 'Analytics': 'Core Lab', 'Management': 'Core Lab'
  };

  let assignedLab: string | null = null;
  for (const [keyword, lab] of Object.entries(manualMappings)) {
    if (productName.toLowerCase().includes(keyword.toLowerCase())) { 
      assignedLab = lab; 
      break; 
    }
  }
  if (!assignedLab) {
    for (const license of customerLicenses) {
      if (productName.toLowerCase().includes(license.toLowerCase().replace(/\s+lab$/i, '').trim())) {
        assignedLab = license; 
        break;
      }
    }
  }
  if (!assignedLab && customerLicenses.length > 0) assignedLab = customerLicenses[0];
  
  return assignedLab;
}

function getProductCountForLab(productData: any[], labType: string): number {
  let count = 0;
  productData.forEach((product: any) => {
    const productName = product.Product || product.ProductName || 'Unknown';
    const assignedLab = assignProductToLab(productName, [labType]);
    if (assignedLab === labType) count++;
  });
  return count;
}

function calculatePercentile(value: number, dataset: number[]): number {
  if (dataset.length === 0) return 50;
  const sorted = dataset.sort((a, b) => a - b);
  const rank = sorted.filter(v => v <= value).length;
  return (rank / sorted.length) * 100;
}

function getPriorityLevel(percentile: number, cost: number, optimizationPotential: number): 'low' | 'medium' | 'high' | 'critical' {
  if (percentile > 90 && optimizationPotential > 0.3) return 'critical';
  if (percentile > 75 && optimizationPotential > 0.2) return 'high';
  if (percentile > 50 && optimizationPotential > 0.1) return 'medium';
  return 'low';
}

function calculateOverallEfficiencyScore(serviceBreakdown: Record<string, any>): number {
  const scores = Object.values(serviceBreakdown).map((service: any) => {
    return Math.max(0, 1 - (service.benchmarkPercentile / 100));
  });
  return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0.5;
}

// Helper for normally distributed random numbers (Box-Muller transform)
function generateNormalRandom(mu: number, sigma: number): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  num = num * sigma + mu; // Scale and shift
  return Math.max(0.01, Math.min(0.99, num)); // Clamp to a practical range (1%-99% efficiency)
}

function calculateRegionalPercentile(
  efficiencyScore: number, // Input customer's overall efficiency score
  regionalCustomers: CustomerForCalculation[], // List of peer customers in the same region
  currentCustomerRegion: string,
  calculationSteps: string[]
): number {
  calculationSteps.push(`  - Step 5.1: Calculating regional percentile for efficiency score ${efficiencyScore.toFixed(3)} in region ${currentCustomerRegion}`);

  const regionalBenchmarkData = regionalEfficiencyBenchmarks[currentCustomerRegion as keyof typeof regionalEfficiencyBenchmarks];
  const avgEfficiency = regionalBenchmarkData ? regionalBenchmarkData.averageEfficiencyScore : 0.65; // Fallback regional average
  const stdDevEfficiency = 0.15; // Assumed standard deviation for regional efficiency scores

  calculationSteps.push(`    - Regional average efficiency: ${avgEfficiency.toFixed(3)}, assumed std dev: ${stdDevEfficiency}`);

  if (regionalCustomers.length === 0) {
    calculationSteps.push('    - No regional peers found for comparison. Comparing to regional average.');
    if (efficiencyScore >= avgEfficiency + stdDevEfficiency * 0.5) { // Clearly above average
        calculationSteps.push('    - Customer score significantly above regional average. Assigning 75th percentile.');
        return 75;
    }
    if (efficiencyScore >= avgEfficiency) { // At or slightly above average
        calculationSteps.push('    - Customer score at or above regional average. Assigning 60th percentile.');
        return 60;
    }
    if (efficiencyScore < avgEfficiency - stdDevEfficiency * 0.5) { // Clearly below average
        calculationSteps.push('    - Customer score significantly below regional average. Assigning 25th percentile.');
        return 25;
    }
    calculationSteps.push('    - Customer score somewhat below regional average. Assigning 40th percentile.');
    return 40;
  }

  const peerScores = regionalCustomers.map(() => generateNormalRandom(avgEfficiency, stdDevEfficiency));
  calculationSteps.push(`    - Generated ${peerScores.length} mock peer efficiency scores for comparison.`);

  const allScoresForRanking = [...peerScores, efficiencyScore];
  allScoresForRanking.sort((a, b) => a - b);

  let rank = 0;
  for (const score of allScoresForRanking) {
    if (score <= efficiencyScore) {
      rank++;
    }
  }
  
  const percentile = (rank / allScoresForRanking.length) * 100;
  calculationSteps.push(`    - Customer's rank (scores <= ${efficiencyScore.toFixed(3)}) is ${rank} out of ${allScoresForRanking.length}.`);
  calculationSteps.push(`    - Calculated regional percentile: ${percentile.toFixed(1)}th`);
  
  return percentile;
}

function getServiceCostForCustomer(customer: CustomerForCalculation, service: string): number {
  // Mock implementation - in real scenario, this would fetch actual service costs
  const baseCost = Math.random() * 100 + 50;
  return baseCost * (customer.licenses.length || 1);
}

// --- Enhanced Product Mapping with Service Consumption ---
async function mapProductsToLabsEnhanced(
  productData: any[],
  customerLicenses: string[],
  customerType: string,
  customerRegion: string,
  enhancedCostMultipliers: Record<string, number> // Added new parameter
): Promise<EnhancedMappingResult> {
  const calculationSteps: string[] = [];
  calculationSteps.push('Step 2: Enhanced product-to-lab mapping with AWS service consumption analysis');
  
  const labServiceConsumption: Record<string, Record<string, number>> = {};
  const productMappings: Record<string, string> = {};
  let totalEstimatedCost = 0;
  
  // Initialize lab consumption tracking
  customerLicenses.forEach(license => {
    labServiceConsumption[license] = {};
    const labProfile = labAWSConsumptionProfiles[license as keyof typeof labAWSConsumptionProfiles];
    if (labProfile) {
      Object.keys(labProfile.services).forEach(service => {
        labServiceConsumption[license][service] = 0;
      });
    }
  });
  
  // Process each product
  productData.forEach((product: any) => {
    const productName = product.Product || product.ProductName || 'Unknown';
    const assignedLab = assignProductToLab(productName, customerLicenses);
    
    if (assignedLab && labAWSConsumptionProfiles[assignedLab as keyof typeof labAWSConsumptionProfiles]) {
      productMappings[productName] = assignedLab;
      
      // Calculate AWS service consumption for this product
      const productType = getProductType(productName);
      const serviceMapping = productToServiceMapping[productType as keyof typeof productToServiceMapping];
      
      if (serviceMapping) {
        serviceMapping.primaryServices.forEach(service => {
          const labProfile = labAWSConsumptionProfiles[assignedLab as keyof typeof labAWSConsumptionProfiles];
          const serviceConfig = labProfile.services[service as keyof typeof labProfile.services];
          
          if (serviceConfig) {
            const productCost = serviceConfig.costPerProduct * serviceMapping.costMultiplier;
            const regionalMultiplier = (regionalServiceMultipliers[customerRegion as keyof typeof regionalServiceMultipliers] as any)?.[service] || 1.0;
            // Apply enhanced cost multiplier if available for the service
            const enhancedMultiplier = enhancedCostMultipliers[service] || 1.0;
            const finalCost = productCost * regionalMultiplier * serviceConfig.utilizationFactor * enhancedMultiplier;
            
            labServiceConsumption[assignedLab][service] += finalCost;
            totalEstimatedCost += finalCost;
          }
        });
      }
    }
  });
  
  // Add base consumption costs
  customerLicenses.forEach(license => {
    const labProfile = labAWSConsumptionProfiles[license as keyof typeof labAWSConsumptionProfiles];
    if (labProfile) {
      const scalingFactors = {
        'Hospital': 1.5,
        'Clinic': 1.0,
        'Reference Lab': 2.0,
        'Research': 1.8,
        'Other': 1.2
      };
      const scalingFactor = scalingFactors[customerType as keyof typeof scalingFactors] || 1.0;
      
      Object.entries(labProfile.services).forEach(([service, config]) => {
        const baseCost = config.baseUnits * scalingFactor;
        const regionalMultiplier = (regionalServiceMultipliers[customerRegion as keyof typeof regionalServiceMultipliers] as any)?.[service] || 1.0;
        // Apply enhanced cost multiplier if available for the service
        const enhancedMultiplier = enhancedCostMultipliers[service] || 1.0;
        const finalBaseCost = baseCost * regionalMultiplier * config.utilizationFactor * enhancedMultiplier;
        
        labServiceConsumption[license][service] += finalBaseCost;
        totalEstimatedCost += finalBaseCost;
      });
    }
  });
  
  calculationSteps.push(`  - Total estimated AWS cost based on enhanced methodology: $${totalEstimatedCost.toFixed(2)}`);
  
  return {
    productMappings,
    labServiceConsumption,
    totalEstimatedCost,
    calculationSteps
  };
}

// --- Benchmarking Analysis Function ---
function performBenchmarkAnalysis(
  customer: CustomerForCalculation,
  customerServiceCosts: Record<string, number>,
  regionalCustomers: CustomerForCalculation[],
  enhancedOptimizationFactors: Record<string, number>, // Added new parameter
  calculationSteps: string[]
): CustomerBenchmarkAnalysis {
  
  calculationSteps.push('Step 5: Performing regional benchmarking and efficiency analysis');
  
  const regionalBenchmark = regionalEfficiencyBenchmarks[customer.region as keyof typeof regionalEfficiencyBenchmarks];
  const serviceEfficiencyBreakdown: Record<string, any> = {};
  const optimizationOpportunities: OptimizationOpportunity[] = [];
  
  // Calculate service-level benchmarking
  Object.entries(customerServiceCosts).forEach(([service, cost]) => {
    const similarCustomers = regionalCustomers.filter(c => 
      c.type === customer.type && 
      c.licenses.some(l => customer.licenses.includes(l))
    );
    
    const serviceCosts = similarCustomers.map(c => getServiceCostForCustomer(c, service));
    const percentile = calculatePercentile(cost, serviceCosts);
    
    const labProfile = customer.licenses
      .map(license => labAWSConsumptionProfiles[license as keyof typeof labAWSConsumptionProfiles])
      .find(profile => profile?.services[service as keyof typeof profile.services]);
    
    const optimizationPotential = enhancedOptimizationFactors[service] || labProfile?.services[service as keyof typeof labProfile.services]?.optimizationPotential || 0;
    
    serviceEfficiencyBreakdown[service] = {
      currentCost: cost,
      benchmarkPercentile: percentile,
      optimizationPotential,
      priority: getPriorityLevel(percentile, cost, optimizationPotential)
    };
    
    // Generate optimization opportunities
    if (percentile > 75 || optimizationPotential > 0.2) {
      optimizationOpportunities.push(...generateServiceOptimizations(
        service, 
        cost, 
        optimizationPotential,
        customer
      ));
    }
  });
  
  const overallEfficiencyScore = calculateOverallEfficiencyScore(serviceEfficiencyBreakdown);
  const regionalPercentile = calculateRegionalPercentile(overallEfficiencyScore, regionalCustomers, customer.region, calculationSteps);
  
  calculationSteps.push(`  - Overall efficiency score: ${(overallEfficiencyScore * 100).toFixed(1)}%`);
  calculationSteps.push(`  - Regional percentile: ${regionalPercentile.toFixed(1)}th percentile`);
  calculationSteps.push(`  - Identified ${optimizationOpportunities.length} optimization opportunities`);
  
  return {
    overallEfficiencyScore,
    regionalPercentile,
    serviceEfficiencyBreakdown,
    costOptimizationOpportunities: optimizationOpportunities
  };
}

// --- Service Optimization Generator ---
function generateServiceOptimizations(
  service: string,
  currentCost: number,
  optimizationPotential: number,
  customer: CustomerForCalculation
): OptimizationOpportunity[] {
  const opportunities: OptimizationOpportunity[] = [];
  
  const serviceOptimizations: Record<string, any> = {
    'EC2': {
      category: 'Compute Optimization',
      description: 'Optimize EC2 instance sizing and utilization',
      actionItems: [
        'Implement auto-scaling policies',
        'Right-size instances based on actual usage',
        'Consider Reserved Instances for predictable workloads',
        'Use Spot Instances for non-critical batch processing'
      ],
      difficulty: 'medium',
      timeToImplement: '2-4 weeks'
    },
    'S3': {
      category: 'Storage Optimization',
      description: 'Optimize S3 storage costs and lifecycle management',
      actionItems: [
        'Implement intelligent tiering',
        'Set up lifecycle policies for old data',
        'Enable compression for stored files',
        'Review and optimize data retention policies'
      ],
      difficulty: 'easy',
      timeToImplement: '1-2 weeks'
    },
    'RDS': {
      category: 'Database Optimization',
      description: 'Optimize database performance and costs',
      actionItems: [
        'Enable automated backups with optimal retention',
        'Consider read replicas for read-heavy workloads',
        'Optimize database instance sizing',
        'Implement connection pooling'
      ],
      difficulty: 'medium',
      timeToImplement: '3-5 weeks'
    },
    'Lambda': {
      category: 'Serverless Optimization',
      description: 'Optimize Lambda function performance and costs',
      actionItems: [
        'Optimize memory allocation for functions',
        'Reduce cold start times',
        'Implement efficient error handling',
        'Use provisioned concurrency for critical functions'
      ],
      difficulty: 'easy',
      timeToImplement: '1-3 weeks'
    }
  };
  
  const optimization = serviceOptimizations[service];
  if (optimization) {
    opportunities.push({
      category: optimization.category,
      service: service,
      currentCost: currentCost,
      potentialSavings: currentCost * optimizationPotential,
      implementationDifficulty: optimization.difficulty,
      timeToImplement: optimization.timeToImplement,
      description: optimization.description,
      actionItems: optimization.actionItems
    });
  }
  
  return opportunities;
}

// --- LLM-Powered Optimization Recommendations ---
async function generateLLMOptimizationRecommendations(
  customer: CustomerForCalculation,
  benchmarkAnalysis: CustomerBenchmarkAnalysis,
  totalCost: number,
  enhancedComplianceRequirements: string[], // Added new parameter
  enhancedUsagePatterns: Record<string, any>, // Added new parameter
  calculationSteps: string[]
): Promise<{
  recommendations: string[];
  prioritizedActions: PrioritizedAction[];
  estimatedSavings: number;
}> {
  
  calculationSteps.push('Step 6: Generating AI-powered cost optimization recommendations');
  
  const optimizationPrompt = `
    You are an AWS cost optimization expert analyzing a ${customer.type} customer with the following profile:
    
    Customer Details:
    - Name: ${customer.name}
    - Type: ${customer.type}
    - Region: ${customer.region}
    - Lab Licenses: ${customer.licenses.join(', ')}
    - Total Monthly AWS Cost: $${totalCost.toFixed(2)}
    
    Additional Context:
    - Compliance Needs: ${enhancedComplianceRequirements.length > 0 ? enhancedComplianceRequirements.join(', ') : 'None specified'}
    - Usage Patterns: ${Object.entries(enhancedUsagePatterns).map(([k, v]) => `${k}: ${v}`).join(', ') || 'Standard'}
    
    Benchmarking Analysis:
    - Overall Efficiency Score: ${(benchmarkAnalysis.overallEfficiencyScore * 100).toFixed(1)}%
    - Regional Percentile: ${benchmarkAnalysis.regionalPercentile.toFixed(1)}th percentile
    
    Service Cost Breakdown and Benchmarks:
    ${Object.entries(benchmarkAnalysis.serviceEfficiencyBreakdown)
      .map(([service, data]) => 
        `- ${service}: $${data.currentCost.toFixed(2)} (${data.benchmarkPercentile.toFixed(1)}th percentile, ${(data.optimizationPotential * 100).toFixed(0)}% optimization potential)`
      ).join('\n')}
    
    Identified Optimization Opportunities:
    ${benchmarkAnalysis.costOptimizationOpportunities
      .map((opp, i) => 
        `${i + 1}. ${opp.category} - ${opp.description} (Potential savings: $${opp.potentialSavings.toFixed(2)}, Difficulty: ${opp.implementationDifficulty})`
      ).join('\n')}
    
    Please provide:
    1. Top 5 prioritized cost optimization recommendations
    2. Specific action items for each recommendation
    3. Expected timeline and difficulty for implementation
    4. Estimated cost savings for each recommendation
    5. Any industry-specific best practices for ${customer.type} organizations
    
    Format your response as JSON with the following structure:
    {
      "summary": "Brief overview of optimization potential",
      "prioritizedRecommendations": [
        {
          "title": "Recommendation title",
          "description": "Detailed description",
          "estimatedSavings": 1234.56,
          "timeToImplement": "2-4 weeks",
          "difficulty": "medium",
          "actionItems": ["Action 1", "Action 2"],
          "priority": "high"
        }
      ],
      "totalEstimatedSavings": 5678.90,
      "implementationRoadmap": "Suggested order of implementation"
    }
  `;
  
  try {
    const llmResponse = await invokeLocalLLM(optimizationPrompt);
    
    calculationSteps.push(`  - LLM generated ${llmResponse.prioritizedRecommendations?.length || 0} optimization recommendations`);
    calculationSteps.push(`  - Total estimated potential savings: $${llmResponse.totalEstimatedSavings?.toFixed(2) || '0.00'}`);

  return {
      recommendations: llmResponse.prioritizedRecommendations?.map((r: any) => r.description) || [],
      prioritizedActions: llmResponse.prioritizedRecommendations || [],
      estimatedSavings: llmResponse.totalEstimatedSavings || 0
    };
    
  } catch (error) {
    calculationSteps.push(`  - LLM optimization failed: ${error}. Using fallback recommendations.`);
    return generateFallbackRecommendations(benchmarkAnalysis, totalCost);
  }
}

// --- Enhanced Data Analysis Function ---
function analyzeEnhancedAdditionalData(
  enhancedData: any,
  calculationSteps: string[]
): {
  costMultipliers: Record<string, number>;
  optimizationFactors: Record<string, number>;
  complianceRequirements: string[];
  usagePatterns: Record<string, any>;
} {
  calculationSteps.push('Step 1.5: Analyzing enhanced additional data for improved accuracy');
  
  const costMultipliers: Record<string, number> = {};
  const optimizationFactors: Record<string, number> = {};
  const complianceRequirements: string[] = [];
  const usagePatterns: Record<string, any> = {};
  
  if (!enhancedData) {
    calculationSteps.push('  - No enhanced data provided, using default multipliers');
    return { costMultipliers, optimizationFactors, complianceRequirements, usagePatterns };
  }
  
  // Data volume impact on storage costs
  if (enhancedData.dataVolume) {
    const volumeMultipliers = {
      'low': 0.8,
      'medium': 1.0,
      'high': 1.5,
      'very-high': 2.2
    };
    costMultipliers['S3'] = volumeMultipliers[enhancedData.dataVolume as keyof typeof volumeMultipliers] || 1.0;
    calculationSteps.push(`  - Data volume (${enhancedData.dataVolume}) applied S3 cost multiplier: ${costMultipliers['S3']}`);
  }
  
  // Peak usage hours impact on compute costs
  if (enhancedData.peakUsageHours) {
    const usageMultipliers = {
      'business-hours': 0.9,
      'extended-hours': 1.1,
      'round-the-clock': 1.4,
      'batch-processing': 0.7
    };
    costMultipliers['EC2'] = usageMultipliers[enhancedData.peakUsageHours as keyof typeof usageMultipliers] || 1.0;
    usagePatterns['peakHours'] = enhancedData.peakUsageHours;
    calculationSteps.push(`  - Peak usage (${enhancedData.peakUsageHours}) applied EC2 cost multiplier: ${costMultipliers['EC2']}`);
  }
  
  // Performance requirements impact
  if (enhancedData.performanceRequirements) {
    const performanceMultipliers = {
      'standard': 1.0,
      'high': 1.3,
      'critical': 1.6,
      'basic': 0.8,
      'advanced': 1.2,
      'hpc': 2.0,
      'ml-ai': 2.5
    };
    const multiplier = performanceMultipliers[enhancedData.performanceRequirements as keyof typeof performanceMultipliers] || 1.0;
    costMultipliers['EC2'] = (costMultipliers['EC2'] || 1.0) * multiplier;
    costMultipliers['SageMaker'] = multiplier * 1.2;
    calculationSteps.push(`  - Performance requirements (${enhancedData.performanceRequirements}) applied compute multiplier: ${multiplier}`);
  }
  
  // Data retention impact on storage optimization
  if (enhancedData.dataRetentionPeriod) {
    const retentionOptimization = {
      '1-year': 0.3,
      '3-years': 0.25,
      '5-years': 0.2,
      '7-years': 0.15,
      '10-years': 0.1,
      'indefinite': 0.05
    };
    optimizationFactors['S3'] = retentionOptimization[enhancedData.dataRetentionPeriod as keyof typeof retentionOptimization] || 0.2;
    calculationSteps.push(`  - Data retention (${enhancedData.dataRetentionPeriod}) provides S3 optimization potential: ${optimizationFactors['S3'] * 100}%`);
  }
  
  // Compliance requirements impact
  if (enhancedData.complianceRequirements && Array.isArray(enhancedData.complianceRequirements)) {
    complianceRequirements.push(...enhancedData.complianceRequirements);
    const complianceMultiplier = 1 + (enhancedData.complianceRequirements.length * 0.1);
    costMultipliers['CloudWatch'] = complianceMultiplier;
    costMultipliers['CloudTrail'] = complianceMultiplier;
    calculationSteps.push(`  - Compliance requirements (${enhancedData.complianceRequirements.join(', ')}) applied monitoring multiplier: ${complianceMultiplier}`);
  }
  
  // Current cloud usage impact on optimization potential
  if (enhancedData.currentCloudUsage) {
    const optimizationPotentials = {
      'none': 0.4,
      'aws-basic': 0.3,
      'aws-advanced': 0.15,
      'multi-cloud': 0.25,
      'on-premise': 0.35,
      'hybrid': 0.2
    };
    const basePotential = optimizationPotentials[enhancedData.currentCloudUsage as keyof typeof optimizationPotentials] || 0.25;
    Object.keys(labAWSConsumptionProfiles).forEach(lab => {
      Object.keys(labAWSConsumptionProfiles[lab as keyof typeof labAWSConsumptionProfiles].services).forEach(service => {
        optimizationFactors[service] = basePotential;
      });
    });
    calculationSteps.push(`  - Current cloud usage (${enhancedData.currentCloudUsage}) sets base optimization potential: ${basePotential * 100}%`);
  }
  
  // Budget constraints impact on recommendations
  if (enhancedData.budgetConstraints) {
    usagePatterns['budgetPriority'] = enhancedData.budgetConstraints;
    const budgetMultipliers = {
      'cost-optimized': 0.85,
      'balanced': 1.0,
      'performance-first': 1.25,
      'enterprise': 1.5
    };
    const budgetMultiplier = budgetMultipliers[enhancedData.budgetConstraints as keyof typeof budgetMultipliers] || 1.0;
    Object.keys(costMultipliers).forEach(service => {
      costMultipliers[service] = (costMultipliers[service] || 1.0) * budgetMultiplier;
    });
    calculationSteps.push(`  - Budget constraints (${enhancedData.budgetConstraints}) applied overall multiplier: ${budgetMultiplier}`);
  }
  
  // Geographic distribution impact
  if (enhancedData.geographicDistribution) {
    const geoMultipliers = {
      'single-location': 1.0,
      'regional': 1.1,
      'national': 1.3,
      'international': 1.6
    };
    const geoMultiplier = geoMultipliers[enhancedData.geographicDistribution as keyof typeof geoMultipliers] || 1.0;
    costMultipliers['CloudFront'] = geoMultiplier;
    costMultipliers['DataTransfer'] = geoMultiplier;
    calculationSteps.push(`  - Geographic distribution (${enhancedData.geographicDistribution}) applied distribution multiplier: ${geoMultiplier}`);
  }
  
  // Backup frequency impact
  if (enhancedData.backupFrequency) {
    const backupMultipliers = {
      'daily': 1.2,
      'real-time': 2.0,
      'weekly': 1.0,
      'monthly': 0.8,
      'custom': 1.1
    };
    const backupMultiplier = backupMultipliers[enhancedData.backupFrequency as keyof typeof backupMultipliers] || 1.0;
    costMultipliers['S3'] = (costMultipliers['S3'] || 1.0) * backupMultiplier;
    calculationSteps.push(`  - Backup frequency (${enhancedData.backupFrequency}) applied storage multiplier: ${backupMultiplier}`);
  }
  
  // Scalability needs impact
  if (enhancedData.scalabilityNeeds) {
    const scalabilityMultipliers = {
      'stable': 1.0,
      'moderate': 1.15,
      'high': 1.35,
      'rapid': 1.6
    };
    const scalabilityMultiplier = scalabilityMultipliers[enhancedData.scalabilityNeeds as keyof typeof scalabilityMultipliers] || 1.0;
    costMultipliers['EC2'] = (costMultipliers['EC2'] || 1.0) * scalabilityMultiplier;
    costMultipliers['Lambda'] = (costMultipliers['Lambda'] || 1.0) * scalabilityMultiplier;
    calculationSteps.push(`  - Scalability needs (${enhancedData.scalabilityNeeds}) applied compute multiplier: ${scalabilityMultiplier}`);
  }
  
  calculationSteps.push(`  - Enhanced analysis complete. Applied ${Object.keys(costMultipliers).length} cost multipliers and ${Object.keys(optimizationFactors).length} optimization factors`);
  
  return { costMultipliers, optimizationFactors, complianceRequirements, usagePatterns };
}

// --- Fallback Recommendations ---
function generateFallbackRecommendations(
  benchmarkAnalysis: CustomerBenchmarkAnalysis,
  totalCost: number
): {
  recommendations: string[];
  prioritizedActions: PrioritizedAction[];
  estimatedSavings: number;
} {
  const fallbackActions: PrioritizedAction[] = [
    {
      title: "Implement Reserved Instances",
      description: "Purchase Reserved Instances for predictable EC2 workloads to reduce costs by up to 75%",
      estimatedSavings: totalCost * 0.15,
      timeToImplement: "1-2 weeks",
      difficulty: "easy",
      actionItems: [
        "Analyze EC2 usage patterns",
        "Purchase 1-year Reserved Instances for stable workloads",
        "Monitor and adjust reservations quarterly"
      ],
      priority: "high"
    },
    {
      title: "Optimize Storage Lifecycle",
      description: "Implement S3 lifecycle policies to automatically transition data to cheaper storage classes",
      estimatedSavings: totalCost * 0.12,
      timeToImplement: "2-3 weeks",
      difficulty: "medium",
      actionItems: [
        "Audit current S3 storage usage",
        "Create lifecycle policies for infrequently accessed data",
        "Enable intelligent tiering"
      ],
      priority: "medium"
    },
    {
      title: "Right-size Resources",
      description: "Analyze and optimize instance sizes based on actual utilization metrics",
      estimatedSavings: totalCost * 0.10,
      timeToImplement: "3-4 weeks",
      difficulty: "medium",
      actionItems: [
        "Install CloudWatch agent for detailed metrics",
        "Analyze CPU and memory utilization",
        "Downsize over-provisioned instances"
      ],
      priority: "high"
    }
  ];
  
  const totalSavings = fallbackActions.reduce((sum, action) => sum + action.estimatedSavings, 0);
  
  return {
    recommendations: fallbackActions.map(action => action.description),
    prioritizedActions: fallbackActions,
    estimatedSavings: totalSavings
  };
}

// --- Updated mapProductsToLabs ---
async function mapProductsToLabs(
  productData: any[],
  customerLicenses: string[]
): Promise<MapProductsToLabsResult> {
  const calculationSteps: string[] = [];
  calculationSteps.push('Step 2: Mapping products to labs and calculating costs for input customer');
  
  let productNameColumn = 'Product';
  let productCostColumn = 'Cost';
  let awsCostColumn = 'AWSCost';

  if (productData.length > 0) {
    const firstRow = productData[0];
    const keys = Object.keys(firstRow);
    const possibleProductColumns = ['Product Name', 'Product', 'ProductName', 'Name', 'Item', 'Description'];
    productNameColumn = possibleProductColumns.find(col => keys.includes(col)) || productNameColumn;
    const possibleCostColumns = ['Grand Total', 'Cost', 'Price', 'ProductCost', 'ItemCost', 'Total Cost'];
    productCostColumn = possibleCostColumns.find(col => keys.includes(col)) || productCostColumn;
    const possibleAWSColumns = ['AWS', 'AWSCost', 'AWS Cost', 'AWS_Cost', 'Cloud Cost', 'CloudCost'];
    awsCostColumn = possibleAWSColumns.find(col => keys.includes(col)) || awsCostColumn;
  }
  calculationSteps.push(`  - Using product columns: Name='${productNameColumn}', Cost='${productCostColumn}', AWS Cost='${awsCostColumn}'`);

  const productLabMappings: Record<string, string> = {};
  const licenseCosts: Record<string, number> = {};
  customerLicenses.forEach(license => { licenseCosts[license] = 0; });
  let totalProductCost = 0; // This is sum of AWS Costs for input customer's products
  let totalProcessedProductCount = 0;

  const manualMappings: Record<string, string> = {
    'Centrifuge': 'Core Lab', 'Microscope': 'Core Lab', 'Analyzer': 'Core Lab', 'Incubator': 'Core Lab',
    'Spectrophotometer': 'Core Lab', 'Histology': 'Pathology Lab', 'Stainer': 'Pathology Lab',
    'Microtome': 'Pathology Lab', 'Embedding': 'Pathology Lab', 'Processor': 'Pathology Lab',
    'POC': 'Point of Care Lab', 'Handheld': 'Point of Care Lab', 'Portable': 'Point of Care Lab',
    'Mobile': 'Point of Care Lab', 'PCR': 'Molecular Lab', 'Sequencer': 'Molecular Lab',
    'Thermal': 'Molecular Lab', 'DNA': 'Molecular Lab', 'RNA': 'Molecular Lab', 'Genetic': 'Molecular Lab',
    'Assay': 'Core Lab', 'Laboratory': 'Core Lab', 'Diagnostic': 'Core Lab', 'Imaging': 'Pathology Lab',
    'Pathology': 'Pathology Lab','Point of Care': 'Point of Care Lab', 'Molecular': 'Molecular Lab',
    'Development': 'Core Lab', 'Engineering': 'Core Lab', 'Software': 'Core Lab', 'Platform': 'Core Lab',
    'Data': 'Core Lab', 'API': 'Core Lab', 'Cloud': 'Core Lab', 'Service': 'Core Lab', 'Analytics': 'Core Lab', 'Management': 'Core Lab'
  };

  const labMetrics: Record<string, { totalAwsCost: number; productCount: number; }> = {};
  customerLicenses.forEach(license => { labMetrics[license] = { totalAwsCost: 0, productCount: 0 }; });

  productData.forEach((product: any) => {
    totalProcessedProductCount++;
    const productName = product[productNameColumn] || 'Unknown Product';
    const rawProductCost = product[productCostColumn]?.toString().replace(/[^0-9.-]+/g, '') || '0';
    const parsedProductCost = parseFloat(rawProductCost);
    
    let awsCost = parseFloat(product[awsCostColumn]?.toString().replace(/[^0-9.-]+/g, '') || '0');
    if (isNaN(awsCost) || awsCost === 0) { // Fallback AWS cost if not present or zero
        awsCost = parsedProductCost * 0.3; 
        calculationSteps.push(`  - Info: AWS cost for product '${productName}' not found or zero, falling back to 30% of product cost ($${parsedProductCost.toFixed(2)} * 0.3 = $${awsCost.toFixed(2)})`);
    }
    
    let assignedLab: string | null = null;
    for (const [keyword, lab] of Object.entries(manualMappings)) {
      if (productName.toLowerCase().includes(keyword.toLowerCase())) { assignedLab = lab; break; }
    }
    if (!assignedLab) {
      for (const license of customerLicenses) {
        if (productName.toLowerCase().includes(license.toLowerCase().replace(/\s+lab$/i, '').trim())) { // Match license name even without "Lab" suffix
          assignedLab = license; break;
        }
      }
    }
    if (!assignedLab && customerLicenses.length > 0) assignedLab = customerLicenses[0];

    if (assignedLab && customerLicenses.includes(assignedLab)) {
      licenseCosts[assignedLab] = (licenseCosts[assignedLab] || 0) + parsedProductCost;
      totalProductCost += awsCost;
      productLabMappings[productName] = assignedLab;
      if (labMetrics[assignedLab]) {
        labMetrics[assignedLab].totalAwsCost += awsCost;
        labMetrics[assignedLab].productCount += 1;
      }
    }
  });

  Object.entries(labMetrics).forEach(([lab, metrics]) => {
    calculationSteps.push(`  - ${lab}: ${metrics.productCount} products, total AWS cost contribution: $${metrics.totalAwsCost.toFixed(2)}`);
  });
  
  if (totalProductCost === 0 && productData.length > 0) {
    calculationSteps.push('  - Warning: Total AWS cost for input customer products is $0. Using fallback.');
    totalProductCost = 5000 * customerLicenses.length; // Simplified fallback
    calculationSteps.push(`  - Fallback total AWS cost: $5,000 × ${customerLicenses.length} licenses = $${totalProductCost.toFixed(2)}`);
  }
  calculationSteps.push(`  - Total processed product count for input customer: ${totalProcessedProductCount}`);
  calculationSteps.push(`  - Total AWS cost for input customer's products: $${totalProductCost.toFixed(2)}`);
  
  return { productLabMappings, licenseCosts, totalProductCost, totalProcessedProductCount, calculationSteps };
}

// --- Renamed and Updated getRegionalCostMetrics ---
function getRegionalCostMetrics(
  regionalData: any[], 
  closestRegion: string
): RegionalCostMetrics {
  const calculationSteps: string[] = [];
  calculationSteps.push('Step 3: Calculating Regional Cost Metrics');
  
  let currentClosestRegion = closestRegion;
  if (currentClosestRegion === 'US West') currentClosestRegion = 'US West (N. California)';
  else if (currentClosestRegion === 'US East') currentClosestRegion = 'US East (N. Virginia)';
  
  const totalRow = regionalData.find((row: any) => row.Region?.toString().toLowerCase().includes('total costs'));
  if (!totalRow) throw new Error('Could not find total costs row in regional data');
  
  const columns = Object.keys(totalRow);
  const monthColumns = columns.filter(col => /\d+\/\d+\/\d+/.test(col));
  const mostRecentMonth = monthColumns.sort((a,b) => new Date(b).getTime() - new Date(a).getTime())[0]; // Get the actual most recent month
  
  const grandTotalAWSCost = parseFloat(totalRow[mostRecentMonth]?.toString().replace(/[^0-9.-]+/g, '') || '0');
  calculationSteps.push(`  - Most recent month for reporting: ${mostRecentMonth}`);
  calculationSteps.push(`  - Grand total AWS cost (all regions) for ${mostRecentMonth}: $${grandTotalAWSCost.toFixed(2)}`);

  let regionRow = regionalData.find((row: any) => row.Region?.toString().includes(currentClosestRegion));
  if (!regionRow) {
    const regionVariations: Record<string, string[]> = {
      'US West (N. California)': ['US West (N. California)', 'US West (Northern California)', 'US West (N California)', 'US West'],
      'US West (Oregon)': ['US West (Oregon)', 'US West (OR)'],
      'US East (N. Virginia)': ['US East (N. Virginia)', 'US East (Northern Virginia)', 'US East (N Virginia)', 'US East'],
      'US East (Ohio)': ['US East (Ohio)', 'US East (OH)']
    };
    for (const [standardName, variations] of Object.entries(regionVariations)) {
      if (variations.includes(currentClosestRegion) || currentClosestRegion === standardName.split(' (')[0]) {
        for (const variation of variations) {
          regionRow = regionalData.find((row: any) => row.Region?.toString().includes(variation));
          if (regionRow) { currentClosestRegion = standardName; break; }
        }
      }
      if (regionRow) break;
    }
  }
  if (!regionRow) { // Final fallback if still not found
    calculationSteps.push(`  - Warning: Region '${closestRegion}' not found. Defaulting to 'US West (N. California)' data.`);
    currentClosestRegion = 'US West (N. California)'; // Ensure this is a standard name
    regionRow = regionalData.find((row: any) => row.Region?.toString().includes(currentClosestRegion) && !row.Region?.toString().includes('Oregon'));
    if (!regionRow) throw new Error(`Could not find cost data for region: ${currentClosestRegion} even after fallback.`);
  }
  
  const specificRegionTotalAWSCost = parseFloat(regionRow[mostRecentMonth]?.toString().replace(/[^0-9.-]+/g, '') || '0');
  calculationSteps.push(`  - ${currentClosestRegion} cost for ${mostRecentMonth}: $${specificRegionTotalAWSCost.toFixed(2)}`);
  
  const regionalCostRatio = grandTotalAWSCost > 0 ? (specificRegionTotalAWSCost / grandTotalAWSCost) : 0;
  calculationSteps.push(`  - Regional cost ratio (${currentClosestRegion} / Grand Total): $${specificRegionTotalAWSCost.toFixed(2)} / $${grandTotalAWSCost.toFixed(2)} = ${regionalCostRatio.toFixed(4)}`);
  
  return { specificRegionTotalAWSCost, regionalCostRatio, mostRecentMonth, calculationSteps };
}

// --- New Customer Value Calculation Function ---
function calculateCustomerValue(customer: CustomerForCalculation, calculationSteps: string[]): number {
  let value = 0;
  const customerType = customer.type || 'Other';
  const logPrefix = `    - ${customer.name} (${customerType})`;

  switch(customerType) {
    case 'Hospital':
      const beds = customer.beds || 0;
      value = 5000 + (1000 * beds);
      calculationSteps.push(`${logPrefix}: $5,000 + ($1,000 × ${beds} beds) = $${value.toFixed(2)}`);
      break;
      
    case 'Clinic':
      value = 10000;
      calculationSteps.push(`${logPrefix}: $10,000 base cost = $${value.toFixed(2)}`);
      break;
      
    case 'Reference Lab':
      const productCount = customer.productCount || 0; // productCount should be set on the customer object
      value = 15000 + (500 * productCount);
      calculationSteps.push(`${logPrefix}: $15,000 + ($500 × ${productCount} products) = $${value.toFixed(2)}`);
      break;
      
    case 'Research':
      value = 20000;
      calculationSteps.push(`${logPrefix}: $20,000 base cost = $${value.toFixed(2)}`);
      break;
      
    case 'Other':
    default:
      const numLicenses = customer.licenses.length > 0 ? customer.licenses.length : 1; // Avoid multiplying by zero licenses
      value = 10000 * (1 + numLicenses * 0.2);
      calculationSteps.push(`${logPrefix} (Other/Default): $10,000 × (1 + ${numLicenses} licenses × 0.2) = $${value.toFixed(2)}`);
  }
  return value;
}

// --- Updated Final Customer Cost Calculation ---
async function calculateFinalCustomerCost(
  inputCustomerName: string,
  closestRegion: string,
  inputCustomerLicenses: string[],
  inputCustomerType: string,
  inputCustomerBeds: number,
  inputCustomerSize: string,
  specificRegionTotalAWSCost: number, // Reverted: Actual cost for the region
  allOtherCustomersDataFromList: CustomerFromList[],
  inputCustomerTotalProcessedProductCount: number
): Promise<{
  finalCustomerCost: number;
  customerProportionOfGroup: number; // Reverted: for key metrics
  calculationSteps: string[];
}> {
  const calculationSteps: string[] = [];
  calculationSteps.push('Step 4: Calculating final customer cost (Methodology with Proportion)');
  
  try {
    const currentCustomer: CustomerForCalculation = {
      name: inputCustomerName,
      region: closestRegion,
      licenses: inputCustomerLicenses,
      type: inputCustomerType,
      beds: inputCustomerType === 'Hospital' ? inputCustomerBeds : undefined,
      productCount: inputCustomerType === 'Reference Lab' ? inputCustomerTotalProcessedProductCount : undefined,
      size: inputCustomerSize,
    };
    calculationSteps.push(`  - Input customer details for value calc: Type=${currentCustomer.type}, Beds=${currentCustomer.beds}, ProductCount=${currentCustomer.productCount}, Licenses=${currentCustomer.licenses.join('/')}`);

    const allCustomersForGrouping: CustomerForCalculation[] = [
        ...allOtherCustomersDataFromList,
        currentCustomer
    ];
    calculationSteps.push(`  - Total customers considered for grouping: ${allCustomersForGrouping.length}`);

    calculationSteps.push('  - Step 4.1: Grouping customers by AWS region and lab license combination');
    const customerGroups: Record<string, CustomerForCalculation[]> = {};
    allCustomersForGrouping.forEach(cust => {
      const sortedLicenses = [...cust.licenses].sort();
      const groupKey = `${cust.region}:${sortedLicenses.join(',')}`;
      if (!customerGroups[groupKey]) customerGroups[groupKey] = [];
      customerGroups[groupKey].push(cust);
    });

    const currentCustomerSortedLicenses = [...inputCustomerLicenses].sort();
    const currentGroupKey = `${closestRegion}:${currentCustomerSortedLicenses.join(',')}`;
    let currentCustomerGroup = customerGroups[currentGroupKey] || [currentCustomer];

    if (currentCustomerGroup.length === 0 && !customerGroups[currentGroupKey]) {
        customerGroups[currentGroupKey] = [currentCustomer];
        currentCustomerGroup = customerGroups[currentGroupKey];
        calculationSteps.push(`    - Current customer was not in any group, created new group ${currentGroupKey} solely for them.`);
    }
    
    calculationSteps.push(`    - Input customer's target group key: ${currentGroupKey}`);
    calculationSteps.push(`    - Initial members in this group: ${currentCustomerGroup.map(c => c.name).join(', ')} (${currentCustomerGroup.length} customers)`);

    if (currentCustomerGroup.length <= 1 && allCustomersForGrouping.length > 1) {
      calculationSteps.push(`    - Warning: Current customer's group has <= 1 member. Looking for a fallback group in region '${closestRegion}'.`);
      let bestFallbackGroup: CustomerForCalculation[] = [];
      let bestFallbackKey = "";
      Object.entries(customerGroups).forEach(([key, group]) => {
        if (key.startsWith(closestRegion) && group.length > bestFallbackGroup.length) {
          const groupLicenses = key.split(':')[1].split(',');
          if (inputCustomerLicenses.some(lic => groupLicenses.includes(lic)) || bestFallbackGroup.length === 0) {
            bestFallbackGroup = group;
            bestFallbackKey = key;
          }
        }
      });
      if (bestFallbackGroup.length > 0) {
        calculationSteps.push(`    - Using fallback group '${bestFallbackKey}' with ${bestFallbackGroup.length} customers: ${bestFallbackGroup.map(c=>c.name).join(', ')}`);
        if (!bestFallbackGroup.find(c => c.name === inputCustomerName)) {
            bestFallbackGroup.push(currentCustomer);
            calculationSteps.push(`    - Added input customer '${inputCustomerName}' to this fallback group.`);
        }
        currentCustomerGroup = bestFallbackGroup;
      } else {
         calculationSteps.push(`    - No suitable fallback group found. Proceeding with the original group.`);
      }
    }

    calculationSteps.push('  - Step 4.2: Applying value formula for each customer in the identified group');
    let totalGroupValue = 0;
    const customersWithValues = currentCustomerGroup.map(custInGroup => {
      const value = calculateCustomerValue(custInGroup, calculationSteps);
      totalGroupValue += value;
      return { ...custInGroup, value };
    });
    
    let currentCustomerWithValue = customersWithValues.find(c => c.name === inputCustomerName);
    if (!currentCustomerWithValue || typeof currentCustomerWithValue.value === 'undefined') {
      calculationSteps.push(`  - Error: Could not find input customer '${inputCustomerName}' with calculated value in the group. Using fallback value 0.`);
      currentCustomerWithValue = { ...currentCustomer, value: 0 };
    }
    const currentCustomerCalculatedValue = currentCustomerWithValue.value || 0;

    calculationSteps.push(`    - Total calculated value for all customers in group: $${totalGroupValue.toFixed(2)}`);
    calculationSteps.push(`    - Input customer '${inputCustomerName}' calculated value: $${currentCustomerCalculatedValue.toFixed(2)}`);

    let customerProportionOfGroup = 0;
    if (totalGroupValue > 0) {
      customerProportionOfGroup = currentCustomerCalculatedValue / totalGroupValue;
    } else if (currentCustomerGroup.length === 1 && currentCustomerCalculatedValue > 0) {
      customerProportionOfGroup = 1.0;
      calculationSteps.push(`    - Input customer is only one in group with value > 0, proportion is 100%.`);
    } else {
      calculationSteps.push(`    - Warning: Total group value is $0. Customer proportion is 0.`);
    }
    calculationSteps.push(`    - Input customer's proportion of group value: ${customerProportionOfGroup.toFixed(4)} (${(customerProportionOfGroup * 100).toFixed(2)}%)`);

    calculationSteps.push('  - Step 4.3: Calculating final customer cost (Proportional Method)');
    const finalCustomerCost = customerProportionOfGroup * specificRegionTotalAWSCost;
    calculationSteps.push(`    - Final Customer Cost = Proportion (${customerProportionOfGroup.toFixed(4)}) × Specific Region's Total AWS Cost ($${specificRegionTotalAWSCost.toFixed(2)})`);
    calculationSteps.push(`    - Final Estimated AWS Cost for ${inputCustomerName}: $${finalCustomerCost.toFixed(2)}`);
    
    return { finalCustomerCost, customerProportionOfGroup, calculationSteps };

  } catch (error) {
    console.error('Error calculating final customer cost:', error);
    calculationSteps.push(`  - Error in final cost calculation: ${error instanceof Error ? error.message : String(error)}. Defaulting to region cost.`);
    return { finalCustomerCost: specificRegionTotalAWSCost, customerProportionOfGroup: 0, calculationSteps };
  }
}

// --- Main POST Handler ---
export async function POST(request: Request) {
  const overallCalculationSteps: string[] = ["Request received."];
  try {
    const body = await request.json();
    const {
      customerName,
      customerCountry,
      customerCityState,
      customerLicenses,
      regionalCostBreakdownData,
      productCostData,
      customerListData,
      additionalNotes,
      enhancedAdditionalData,
      customerType = 'Other',
      customerBeds = 0,
      customerSize = 'Medium'
    } = body;

    overallCalculationSteps.push("Request body parsed.");

    if (!customerName || !customerCountry || !regionalCostBreakdownData || !productCostData || !customerListData) {
      return NextResponse.json(
        { error: 'Missing required fields: customerName, customerCountry, regionalCostBreakdownData, productCostData, customerListData' },
        { status: 400 }
      );
    }
    if (!customerLicenses || !Array.isArray(customerLicenses) || customerLicenses.length === 0) {
      return NextResponse.json( { error: 'Missing or invalid required field: customerLicenses (must be a non-empty array)' }, { status: 400 });
    }
    overallCalculationSteps.push(`Input customer: ${customerName}, Licenses: ${customerLicenses.join(', ')}, Type: ${customerType}`);

    const allOtherCustomersFromList = parseCustomerListXLSX(customerListData, overallCalculationSteps);

    const step1Prompt = `
      You are an expert in geospatial mapping and AWS cost analysis.
      Given the customer: ${customerName}, ${customerCountry}, ${customerCityState || ''}, ${additionalNotes || ''}
      And AWS regions: US West (Oregon), US West (N. California), US East (N. Virginia), US East (Ohio), Europe (Frankfurt), etc.
      1. Approximate customer's location.
      2. Find the geographically closest AWS region.
      Output STRICTLY JSON: {"customerLocation": "...", "closestRegion": "..."}
    `;
    overallCalculationSteps.push("Step 1: Determining customer location and closest AWS region via LLM.");
    let llmResponse: any;
    let determinedCustomerLocation = '';
    let determinedClosestRegion = '';
    try {
      llmResponse = await invokeLocalLLM(step1Prompt);
      determinedCustomerLocation = llmResponse.customerLocation || `${customerCityState || customerCountry}`;
      determinedClosestRegion = llmResponse.closestRegion || 'US West (N. California)';
      if (determinedClosestRegion === 'US West') determinedClosestRegion = 'US West (N. California)';
      else if (determinedClosestRegion === 'US East') determinedClosestRegion = 'US East (N. Virginia)';
      overallCalculationSteps.push(`  - LLM determined location: ${determinedCustomerLocation}, Closest Region: ${determinedClosestRegion}`);
    } catch (llmError) {
      overallCalculationSteps.push(`  - LLM Error for Step 1: ${llmError instanceof Error ? llmError.message : String(llmError)}. Using defaults.`);
      determinedCustomerLocation = `${customerCityState || customerCountry}`;
      determinedClosestRegion = 'US West (N. California)';
    }
    
    // Analyze enhanced additional data
    const { 
      costMultipliers: enhancedCostMultipliers, 
      optimizationFactors: enhancedOptimizationFactors,
      complianceRequirements: enhancedComplianceRequirements,
      usagePatterns: enhancedUsagePatterns 
    } = analyzeEnhancedAdditionalData(enhancedAdditionalData, overallCalculationSteps);
    
    const regionalDataJSON = parseXLSXToJSON(regionalCostBreakdownData);
    const productDataJSON = parseXLSXToJSON(productCostData);

    // Enhanced product mapping with service consumption analysis
    const enhancedMappingResults = await mapProductsToLabsEnhanced(
      productDataJSON, 
      customerLicenses, 
      customerType, 
      determinedClosestRegion,
      enhancedCostMultipliers
    );
    overallCalculationSteps.push(...enhancedMappingResults.calculationSteps);

    const regionalMetrics = getRegionalCostMetrics(regionalDataJSON, determinedClosestRegion);
    overallCalculationSteps.push(...regionalMetrics.calculationSteps);
    
    // Create current customer object for benchmarking
    const currentCustomer: CustomerForCalculation = {
      name: customerName,
      region: determinedClosestRegion,
      licenses: customerLicenses,
      type: customerType,
      beds: customerType === 'Hospital' ? customerBeds : undefined,
      productCount: customerType === 'Reference Lab' ? productDataJSON.length : undefined,
      size: customerSize,
    };

    // Get service breakdown from enhanced mapping
    const serviceBreakdown: Record<string, number> = {};
    Object.entries(enhancedMappingResults.labServiceConsumption).forEach(([lab, services]) => {
      Object.entries(services).forEach(([service, cost]) => {
        serviceBreakdown[service] = (serviceBreakdown[service] || 0) + cost;
      });
    });

    // Perform regional benchmarking analysis
    const regionalCustomers = allOtherCustomersFromList.filter(c => c.region === determinedClosestRegion);
    
    const benchmarkAnalysis = performBenchmarkAnalysis(
      currentCustomer,
      serviceBreakdown,
      regionalCustomers,
      enhancedOptimizationFactors,
      overallCalculationSteps
    );

    // Generate LLM-powered optimization recommendations
    const optimizationRecommendations = await generateLLMOptimizationRecommendations(
      currentCustomer,
      benchmarkAnalysis,
      enhancedMappingResults.totalEstimatedCost,
      enhancedComplianceRequirements,
      enhancedUsagePatterns,
      overallCalculationSteps
    );

    const finalCost = enhancedMappingResults.totalEstimatedCost;
    const formattedFinalCost = new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2
    }).format(finalCost);

    return NextResponse.json({
      customerName,
      customerLocation: determinedCustomerLocation,
      closestRegion: determinedClosestRegion,
      keyMetrics: {
        reportingPeriod: regionalMetrics.mostRecentMonth,
        specificRegionTotalAWSCost: regionalMetrics.specificRegionTotalAWSCost,
        regionalCostRatio: regionalMetrics.regionalCostRatio,
        customerProportionOfGroup: benchmarkAnalysis.regionalPercentile / 100,
        inputCustomerTotalProductCost: enhancedMappingResults.totalEstimatedCost,
        finalCost: finalCost
      },
      highlightedFinalCost: formattedFinalCost,
      customerLicenses,
      serviceBreakdown,
      benchmarkAnalysis,
      optimizationRecommendations,
      calculationSteps: overallCalculationSteps,
      message: 'Enhanced cost calculation with optimization recommendations completed successfully.'
    });

  } catch (error) {
    console.error('Error in map-customer-region API:', error);
    overallCalculationSteps.push(`API Error: ${error instanceof Error ? error.message : String(error)}`);
    const errorMessage = error instanceof Error ? error.message : 'An internal server error occurred';
    return NextResponse.json({ 
        error: errorMessage, 
        stack: error instanceof Error ? error.stack : undefined,
        calculationSteps: overallCalculationSteps
    }, { status: 500 });
  }
} 