# AWS Cost Analysis & Optimization Platform

A comprehensive Next.js application for analyzing and optimizing AWS costs for laboratory customers. This platform provides multi-dimensional cost calculations, regional benchmarking, AI-powered optimization recommendations, and future cost forecasting.

## 🌟 Features

### Core Functionality
- **Enhanced AWS Cost Calculations** - Multi-dimensional analysis incorporating regional pricing, lab-specific consumption patterns, and compliance overhead
- **Regional Benchmarking** - Compare efficiency against similar customers in your AWS region
- **AI-Powered Optimization** - LLM-generated cost reduction recommendations with prioritized action items
- **Cost Forecasting** - Project future costs with multiple growth scenarios (6 months to 5 years)
- **New Customer Forecasting** - Quick cost estimates for potential new customers

### Lab Types Supported
- Core Lab
- Molecular Lab
- Pathology Lab
- Point of Care Lab

### AWS Regions Supported
- US West (Oregon)
- US West (N. California)
- US East (N. Virginia)
- US East (Ohio)
- Europe (Frankfurt)
- Asia Pacific (Singapore)

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0 or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd aws-cost-optimization-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📋 Usage Guide

### 1. Basic Cost Analysis
1. Enter customer information (name, location)
2. Upload customer product list (Excel/CSV format)
3. Add any additional notes or requirements
4. Review results with optimization recommendations

### 2. Cost Forecasting
1. Complete basic analysis first
2. Navigate to "View Cost Forecast"
3. Configure growth scenarios and forecast period
4. Review monthly projections and total costs

### 3. New Customer Forecasting
1. Use "Quick New Customer Forecast" from results page
2. Select customer type, region, and organization size
3. Choose expected lab types and compliance requirements
4. Generate instant cost projections

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 15.3.2 with React 19
- **Styling**: Tailwind CSS 4.0
- **Language**: TypeScript 5
- **File Processing**: xlsx for Excel files, pdf-parse for PDFs
- **HTTP Client**: Axios for API requests
- **AI Integration**: OpenAI API (optional, with fallback recommendations)

### Project Structure
```
src/
├── app/
│   ├── components/          # Reusable UI components
│   ├── api/                 # API routes for backend processing
│   ├── results/             # Cost analysis results page
│   ├── forecast/            # Cost forecasting page
│   ├── new-customer-forecast/ # New customer estimation
│   └── extra-info/          # Additional information collection
├── static/                  # Static assets and data files
└── public/                  # Public assets
```

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file in the root directory:

```env
# Optional: OpenAI API key for enhanced recommendations
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Ollama endpoint for local LLM (fallback)
OLLAMA_ENDPOINT=http://localhost:11434
```

### Data Configuration
The application uses several configuration files in the `static/` directory:

- **Customer data**: Upload via Excel/CSV with columns for customer name, location, products
- **Regional pricing**: Configured in API routes (`src/app/api/map-customer-region/route.ts`)
- **Lab consumption profiles**: Defined in the same API route file

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t aws-cost-platform .
docker run -p 3000:3000 aws-cost-platform
```

### Vercel Deployment
1. Connect your repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on git push

### AWS/Cloud Deployment
For enterprise deployment on AWS:
1. Use AWS Amplify for automatic deployments
2. Or deploy to EC2 with Load Balancer
3. Configure CloudFront for global CDN
4. Set up RDS for customer data persistence (optional enhancement)

## 📊 Data Requirements

### Customer List Format
Excel/CSV file with columns:
- **Customer Name** (required)
- **Location** (city, state/country)
- **Products** (comma-separated list)
- **Bed Count** (for hospitals)
- **Lab Types** (optional)

### Example:
```csv
Customer Name,Location,Products,Bed Count,Lab Types
General Hospital,Boston MA,Product A,Product B,350,Core Lab,Pathology Lab
Research Labs Inc,San Francisco CA,Product C,Product D,,Molecular Lab
```

## 🔒 Security Considerations

### Data Privacy
- Customer data is processed locally and not permanently stored
- No sensitive data is sent to external APIs (except optional OpenAI for recommendations)
- All uploaded files are processed in-memory and cleared after analysis

### Access Control
For enterprise deployment, consider adding:
- User authentication (NextAuth.js)
- Role-based access control
- Audit logging
- Rate limiting

## 🤝 Customization

### Adding New AWS Regions
1. Update `regionalMultipliers` in `src/app/api/map-customer-region/route.ts`
2. Add region to dropdown in forecast pages

### Adding New Lab Types
1. Update `labBaselineCosts` in API routes
2. Add to available options in UI components
3. Update consumption profiles as needed

### Modifying Cost Calculations
- Core calculation logic is in `src/app/api/map-customer-region/route.ts`
- Regional benchmarking in `performBenchmarkAnalysis()` function
- Forecasting algorithms in forecast page components

## 📈 Monitoring & Analytics

### Performance Monitoring
- Next.js built-in performance monitoring
- Consider adding Vercel Analytics or Google Analytics
- Monitor API response times and error rates

### Usage Analytics
- Track popular features and user flows
- Monitor file upload success rates
- Analyze forecast accuracy over time

## 🆘 Support & Maintenance

### Common Issues
1. **File upload failures**: Check file format and size limits
2. **Calculation errors**: Verify customer data format
3. **Performance issues**: Monitor bundle size and optimize imports

### Updates & Maintenance
- Regularly update dependencies for security patches
- Review and update regional pricing multipliers
- Enhance AI recommendations based on user feedback

## 📄 License

This project is proprietary software. Modify the license terms as needed for your organization.

## 🤝 Contributing

For internal development:
1. Create feature branches from main
2. Follow TypeScript best practices
3. Test thoroughly before merging
4. Update documentation for new features

---

**Contact**: [Your Company Contact Information]
**Version**: 1.0.0
**Last Updated**: December 2024
