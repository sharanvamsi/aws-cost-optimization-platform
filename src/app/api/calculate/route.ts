import { NextResponse } from 'next/server';

type PricingInfo = {
  baseCost: number;
  costPerUser: number;
};

type RegionPricing = {
  [key: string]: PricingInfo;
};

type ProjectPricing = {
  [key: string]: RegionPricing;
};

// Mock pricing data - in a real application, this would come from AWS Pricing API
const pricingData: ProjectPricing = {
  'Web Application': {
    'US East (N. Virginia)': { baseCost: 50, costPerUser: 0.5 },
    'US West (Oregon)': { baseCost: 55, costPerUser: 0.55 },
    'EU (Ireland)': { baseCost: 60, costPerUser: 0.6 },
    'Asia Pacific (Tokyo)': { baseCost: 65, costPerUser: 0.65 },
    'Asia Pacific (Singapore)': { baseCost: 63, costPerUser: 0.63 },
  },
  'Mobile Application': {
    'US East (N. Virginia)': { baseCost: 40, costPerUser: 0.4 },
    'US West (Oregon)': { baseCost: 45, costPerUser: 0.45 },
    'EU (Ireland)': { baseCost: 50, costPerUser: 0.5 },
    'Asia Pacific (Tokyo)': { baseCost: 55, costPerUser: 0.55 },
    'Asia Pacific (Singapore)': { baseCost: 53, costPerUser: 0.53 },
  },
  'Data Analytics': {
    'US East (N. Virginia)': { baseCost: 100, costPerUser: 1.0 },
    'US West (Oregon)': { baseCost: 110, costPerUser: 1.1 },
    'EU (Ireland)': { baseCost: 120, costPerUser: 1.2 },
    'Asia Pacific (Tokyo)': { baseCost: 130, costPerUser: 1.3 },
    'Asia Pacific (Singapore)': { baseCost: 125, costPerUser: 1.25 },
  },
  'Machine Learning': {
    'US East (N. Virginia)': { baseCost: 200, costPerUser: 2.0 },
    'US West (Oregon)': { baseCost: 220, costPerUser: 2.2 },
    'EU (Ireland)': { baseCost: 240, costPerUser: 2.4 },
    'Asia Pacific (Tokyo)': { baseCost: 260, costPerUser: 2.6 },
    'Asia Pacific (Singapore)': { baseCost: 250, costPerUser: 2.5 },
  },
  'IoT Solution': {
    'US East (N. Virginia)': { baseCost: 75, costPerUser: 0.75 },
    'US West (Oregon)': { baseCost: 82, costPerUser: 0.82 },
    'EU (Ireland)': { baseCost: 90, costPerUser: 0.9 },
    'Asia Pacific (Tokyo)': { baseCost: 97, costPerUser: 0.97 },
    'Asia Pacific (Singapore)': { baseCost: 95, costPerUser: 0.95 },
  },
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { users, projectType, location } = body;

    if (!users || !projectType || !location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const numUsers = parseInt(users);
    if (isNaN(numUsers) || numUsers < 0) {
      return NextResponse.json(
        { error: 'Invalid number of users' },
        { status: 400 }
      );
    }

    const pricing = pricingData[projectType]?.[location];
    if (!pricing) {
      return NextResponse.json(
        { error: 'Invalid project type or location' },
        { status: 400 }
      );
    }

    const monthlyCost = pricing.baseCost + (numUsers * pricing.costPerUser);
    const yearlyCost = monthlyCost * 12;

    return NextResponse.json({
      monthlyCost: monthlyCost.toFixed(2),
      yearlyCost: yearlyCost.toFixed(2),
      currency: 'USD',
      breakdown: {
        baseCost: pricing.baseCost,
        costPerUser: pricing.costPerUser,
        numberOfUsers: numUsers,
      },
    });
  } catch (error) {
    console.error('Error calculating costs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 