# AWS Cost Optimization Platform

A sophisticated platform for calculating and optimizing AWS costs for laboratory customers, providing detailed analysis, benchmarking, and AI-powered recommendations.

## Table of Contents
- [Complete Setup Guide](#complete-setup-guide)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Detailed Usage Guide](#detailed-usage-guide)
- [Understanding Results](#understanding-results)
- [Cost Optimization](#cost-optimization)
- [Advanced Features](#advanced-features)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Complete Setup Guide

This section provides a step-by-step guide for setting up your development environment from scratch.

### 1. Development Environment Setup

#### For Windows:
1. **Install Windows Terminal (Optional but Recommended)**
   - Open the Microsoft Store
   - Search for "Windows Terminal"
   - Click "Install"
   - Once installed, you can open it from the Start menu

2. **Install Visual Studio Code**
   - Visit [Visual Studio Code](https://code.visualstudio.com/)
   - Download the Windows installer
   - Run the installer (VSCodeUserSetup-{version}.exe)
   - Follow the installation wizard
   - Check all the boxes in the "Select Additional Tasks" screen
   - Click "Install"

3. **Install Git**
   - Visit [Git for Windows](https://git-scm.com/download/windows)
   - Download the installer
   - Run the installer
   - Use the default options (or customize if you know what you're doing)
   - Choose "Use Visual Studio Code as Git's default editor"
   - Select "Git from the command line and also from 3rd-party software"

4. **Install Node.js**
   - Visit [Node.js](https://nodejs.org/)
   - Download the LTS version
   - Run the installer
   - Follow the installation wizard
   - Check the box to automatically install necessary tools

#### For macOS:
1. **Install Homebrew**
   - Open Terminal (Press Cmd + Space, type "Terminal")
   - Paste and run this command:
     ```bash
     /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
     ```
   - Follow the prompts

2. **Install Visual Studio Code**
   ```bash
   brew install --cask visual-studio-code
   ```

3. **Install Git**
   ```bash
   brew install git
   ```

4. **Install Node.js**
   ```bash
   brew install node
   ```

#### For Linux (Ubuntu/Debian):
1. **Install Visual Studio Code**
   ```bash
   sudo apt update
   sudo apt install software-properties-common apt-transport-https wget
   wget -q https://packages.microsoft.com/keys/microsoft.asc -O- | sudo apt-key add -
   sudo add-apt-repository "deb [arch=amd64] https://packages.microsoft.com/repos/vscode stable main"
   sudo apt update
   sudo apt install code
   ```

2. **Install Git**
   ```bash
   sudo apt update
   sudo apt install git
   ```

3. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt install nodejs
   ```

### 2. VS Code Configuration

1. **Install Essential Extensions**
   - Open VS Code
   - Click the Extensions icon in the sidebar (or press Ctrl+Shift+X)
   - Install these recommended extensions:
     - ESLint
     - Prettier
     - GitLens
     - npm Intellisense
     - Path Intellisense
     - Auto Close Tag
     - Auto Rename Tag
     - JavaScript (ES6) code snippets
     - Tailwind CSS IntelliSense

2. **Configure VS Code Settings**
   - Open Command Palette (Ctrl+Shift+P or Cmd+Shift+P on macOS)
   - Type "Open Settings (JSON)"
   - Add these recommended settings:
   ```json
   {
     "editor.formatOnSave": true,
     "editor.defaultFormatter": "esbenp.prettier-vscode",
     "editor.codeActionsOnSave": {
       "source.fixAll.eslint": true
     },
     "files.autoSave": "onFocusChange"
   }
   ```

### 3. Project Setup

1. **Create Project Directory**
   ```bash
   mkdir my-aws-cost-optimizer
   cd my-aws-cost-optimizer
   ```

2. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/aws-cost-optimization.git .
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Set Up Environment Variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3000
   # Add other required environment variables
   ```

### 4. Running the Application

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Access the Application**
   - Open your browser
   - Navigate to `http://localhost:3000`
   - You should see the application running

### 5. Development Workflow

1. **Create a New Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Open the project in VS Code
   - Make your changes
   - Save files (they will auto-format if you set up Prettier)

3. **Test Your Changes**
   ```bash
   npm run test
   npm run lint
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "Description of your changes"
   ```

5. **Push to GitHub**
   ```bash
   git push origin feature/your-feature-name
   ```

### 6. Troubleshooting Development Setup

1. **Node.js Issues**
   - Verify installation: `node --version`
   - Clear npm cache: `npm cache clean --force`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

2. **Git Issues**
   - Check git configuration: `git config --list`
   - Reset git credentials if needed: `git config --global --unset credential.helper`

3. **VS Code Issues**
   - Reload window: Ctrl+Shift+P (Cmd+Shift+P on macOS) → "Reload Window"
   - Reset VS Code settings: Delete settings.json and recreate
   - Reinstall extensions

4. **Common Error Solutions**
   - Port 3000 in use: Kill the process or use a different port
   - Module not found: Check package.json and reinstall dependencies
   - Git authentication: Set up SSH keys or use GitHub CLI

### 7. AI Components Setup

#### OpenAI Setup (Recommended)
1. **Get API Key**
   - Visit [OpenAI's platform](https://platform.openai.com)
   - Create an account or sign in
   - Navigate to API keys section
   - Create a new API key
   - Copy the key to your `.env` file:
     ```
     OPENAI_API_KEY=your_key_here
     ```

#### Ollama Setup (Alternative/Fallback)
1. **Install Ollama**
   
   For macOS:
   ```bash
   curl -fsSL https://ollama.com/install.sh | sh
   ```
   
   For Linux:
   ```bash
   curl -fsSL https://ollama.com/install.sh | sh
   ```
   
   For Windows:
   - Download the installer from [Ollama's website](https://ollama.com)
   - Run the installer
   - Follow the setup wizard

2. **Start Ollama Service**
   ```bash
   ollama serve
   ```

3. **Pull Required Model**
   ```bash
   ollama pull llama2
   ```

4. **Configure Environment**
   Add to your `.env` file:
   ```
   OLLAMA_ENDPOINT=http://localhost:11434
   OLLAMA_MODEL=llama2
   ```

5. **Verify Installation**
   ```bash
   curl http://localhost:11434/api/tags
   ```
   You should see a list of available models.

6. **Troubleshooting Ollama**
   - If Ollama service fails to start:
     ```bash
     sudo lsof -i :11434  # Check if port is in use
     sudo killall ollama  # Stop any running instances
     ollama serve         # Restart the service
     ```
   - If model pull fails:
     ```bash
     ollama rm llama2     # Remove existing model
     ollama pull llama2   # Try pulling again
     ```
   - Memory issues:
     - Ensure at least 8GB RAM available
     - Close memory-intensive applications
     - Consider using a smaller model

### AI Component Usage

The platform uses AI for:
1. **Cost Optimization Recommendations**
   - Analyzing usage patterns
   - Suggesting infrastructure changes
   - Providing implementation steps

2. **Regional Benchmarking**
   - Comparing costs with similar setups
   - Identifying efficiency opportunities
   - Generating customized reports

3. **Forecast Adjustments**
   - Fine-tuning growth predictions
   - Adjusting for seasonal variations
   - Incorporating industry trends

The system will automatically fall back to Ollama if OpenAI is not configured or unavailable.

## Features

- **Advanced Cost Calculation**: Precise AWS cost estimation based on customer type and lab profile
- **Regional Cost Analysis**: Location-aware pricing with regional cost multipliers
- **Lab-Specific Profiling**: Specialized calculations for different lab types:
  - Core Lab
  - Molecular Lab
  - Pathology Lab
  - Point of Care Lab
- **Benchmarking System**: Compare costs against similar customers in the region
- **AI-Powered Recommendations**: Get actionable cost optimization suggestions
- **Interactive Dashboard**: Beautiful, modern UI with detailed cost breakdowns
- **Forecasting Tools**: Predict future AWS costs and optimization potential

## Prerequisites

- Node.js (v16.0.0 or higher)
- npm (v7.0.0 or higher)
- Git
- A modern web browser (Chrome, Firefox, Safari, or Edge)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/aws-cost-optimization.git
   cd aws-cost-optimization
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration settings.

4. Start the development server:
   ```bash
   npm run dev
   ```

## Getting Started

1. **Initial Setup**
   - Open your browser and navigate to `http://localhost:3000`
   - Click "Calculate for New Customer" to begin

2. **Customer Information Entry**
   - Fill in basic customer details:
     - Customer Name
     - Customer Type (Hospital/Reference Lab/Research Institute/Point of Care)
     - Country and Location
   - Select applicable lab licenses
   - Add any relevant notes or special requirements

3. **Product Selection**
   - Choose the lab products being used
   - Specify quantities and usage patterns
   - Add any custom products if needed

## Detailed Usage Guide

### Step 1: Customer Profile Creation

1. **Basic Information**
   - Enter customer name exactly as it appears in official documents
   - Select the primary customer type
   - Provide precise location details for accurate regional pricing

2. **Lab Type Selection**
   - Choose all applicable lab types
   - For multiple lab types, prioritize based on usage volume
   - Consider future expansion plans when selecting lab types

3. **License Management**
   - Add all current licenses
   - Specify license durations and renewal dates
   - Note any special licensing arrangements

### Step 2: AWS Service Configuration

1. **Service Selection**
   - Review pre-populated services based on lab type
   - Add or remove services as needed
   - Adjust service levels based on actual usage

2. **Usage Patterns**
   - Specify peak usage hours
   - Define data processing volumes
   - Set storage requirements
   - Configure backup and redundancy needs

### Step 3: Cost Analysis

1. **Initial Calculation**
   - Review automatically calculated base costs
   - Verify regional pricing adjustments
   - Check service-specific cost breakdowns

2. **Benchmarking Review**
   - Compare costs against regional averages
   - Review efficiency scores by service
   - Identify cost outliers

### Step 4: Optimization

1. **Review Recommendations**
   - Examine AI-generated optimization suggestions
   - Prioritize recommendations by impact
   - Review implementation difficulty ratings

2. **Implementation Planning**
   - Create action items from recommendations
   - Schedule optimization tasks
   - Track potential savings

## Understanding Results

### Cost Breakdown
- **Total AWS Cost**: Your calculated monthly AWS spending
- **Regional Comparison**: How your costs compare to similar customers
- **Service-Level Analysis**: Detailed breakdown by AWS service
- **Efficiency Scores**: Performance metrics for each service

### Optimization Metrics
- **Potential Savings**: Estimated cost reduction opportunities
- **Implementation Timeline**: Suggested schedule for changes
- **ROI Calculations**: Expected return on optimization efforts

### Benchmarking Data
- **Regional Percentile**: Your standing among similar customers
- **Efficiency Ratings**: Service-specific performance scores
- **Industry Comparisons**: How you compare to industry standards

## Cost Optimization

### Immediate Actions
1. Review high-impact, low-effort recommendations
2. Implement suggested service-level adjustments
3. Apply regional optimization strategies

### Long-term Strategy
1. Monitor cost trends over time
2. Schedule regular optimization reviews
3. Track implementation progress
4. Measure actual savings against projections

## Advanced Features

### Forecasting Tools
- Use the "View Cost Forecast" feature for future cost predictions
- Analyze trend data for long-term planning
- Adjust forecasts based on planned changes

### Custom Analysis
- Export detailed reports for offline analysis
- Create custom benchmarking groups
- Set up specialized monitoring metrics

## Troubleshooting

### Common Issues

1. **Calculation Errors**
   - Verify all input data is correct
   - Check for missing required fields
   - Ensure valid license information

2. **Performance Issues**
   - Clear browser cache
   - Refresh the page
   - Check internet connection

3. **Data Discrepancies**
   - Verify customer information
   - Review service selections
   - Check regional settings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

For additional support or questions, please contact our support team or open an issue on GitHub.
