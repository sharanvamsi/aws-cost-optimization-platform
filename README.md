# AWS Cost Optimization Platform

A sophisticated platform for calculating and optimizing AWS costs for laboratory customers, providing detailed analysis, benchmarking, and AI-powered recommendations.

## What This Application Does

This application helps laboratory businesses understand and optimize their Amazon Web Services (AWS) costs. It analyzes your current setup, compares it to similar organizations, and provides specific recommendations to reduce your cloud computing expenses.

**Key Benefits:**
- Calculate accurate AWS costs for your laboratory
- Compare your costs to similar organizations in your region
- Get AI-powered recommendations to reduce expenses
- Forecast future costs based on growth plans
- Identify the most impactful cost-saving opportunities

## Table of Contents
- [Complete Beginner's Setup Guide](#complete-beginners-setup-guide)
- [How to Use the Application](#how-to-use-the-application)
- [Understanding Your Results](#understanding-your-results)
- [Advanced Features](#advanced-features)
- [Troubleshooting](#troubleshooting)
- [Getting Help](#getting-help)

## Complete Beginner's Setup Guide

### What You'll Need Before Starting

Before we begin, understand that this is a web application that runs on your computer. You'll need:
- A computer with Windows, Mac, or Linux
- An internet connection
- About 30-60 minutes to set everything up
- Administrative access to install software

### Step 1: Understanding the Tools We'll Install

**What is a Terminal/Command Prompt?**
- A text-based interface to control your computer
- Think of it as a way to give your computer direct instructions
- Don't worry - we'll give you exact commands to type

**What is Git?**
- A tool that helps manage code and files
- Allows you to download and update the application
- Think of it like a sophisticated copy/paste system for code

**What is Node.js?**
- A program that allows JavaScript to run on your computer
- Required to run our web application
- Like installing Microsoft Office to open Word documents

**What is Visual Studio Code?**
- A text editor designed for code
- Has helpful features for working with web applications
- Free and widely used by developers

### Step 2: Installing Required Software

#### For Windows Users:

**Installing Git:**
1. Open your web browser (Chrome, Firefox, Edge, etc.)
2. Go to [https://git-scm.com/download/windows](https://git-scm.com/download/windows)
3. The download should start automatically. If not, click "Download for Windows"
4. Once downloaded, find the file (usually in your Downloads folder)
5. Double-click the installer file (it will be named something like `Git-2.x.x-64-bit.exe`)
6. When the installer opens:
   - Click "Next" on the welcome screen
   - Keep the default installation location unless you have a reason to change it
   - **Important:** On the "Select Components" screen, make sure "Git Bash Here" is checked
   - **Important:** When asked about the default editor, choose "Use Visual Studio Code as Git's default editor"
   - **Important:** When asked about PATH environment, select "Git from the command line and also from 3rd-party software"
   - For all other options, use the defaults by clicking "Next"
   - Click "Install" and wait for it to complete
   - Click "Finish"

**Installing Node.js:**
1. Go to [https://nodejs.org](https://nodejs.org)
2. You'll see two download buttons. Click the one labeled "LTS" (Long Term Support)
3. This downloads a file named something like `node-v18.x.x-x64.msi`
4. Double-click this file to start installation
5. Click "Next" through the installer:
   - Accept the license agreement
   - Keep the default installation location
   - **Important:** Make sure "Add to PATH" is checked
   - Click "Install"
6. You may be prompted to install additional tools - click "Yes" if asked
7. Wait for installation to complete and click "Finish"

**Installing Visual Studio Code:**
1. Go to [https://code.visualstudio.com](https://code.visualstudio.com)
2. Click the big "Download for Windows" button
3. This downloads a file like `VSCodeUserSetup-1.x.x.exe`
4. Double-click to install:
   - Accept the license agreement
   - **Important:** On the "Select Additional Tasks" screen, check ALL boxes:
     - "Add 'Open with Code' action to Windows Explorer file context menu"
     - "Add 'Open with Code' action to Windows Explorer directory context menu"
     - "Register Code as an editor for supported file types"
     - "Add to PATH"
   - Click "Install"
   - When finished, click "Finish"

#### For Mac Users:

**Installing Homebrew (Package Manager):**
1. Press `Cmd + Space` to open Spotlight search
2. Type "Terminal" and press Enter
3. A black window will open - this is the Terminal
4. Copy and paste this command (press `Cmd + V` to paste):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
5. Press Enter and follow the prompts
6. You may need to enter your computer password
7. Wait for installation to complete (this can take 10-15 minutes)

**Installing Git:**
1. In the same Terminal window, type:
   ```bash
   brew install git
   ```
2. Press Enter and wait for installation to complete

**Installing Node.js:**
1. In Terminal, type:
   ```bash
   brew install node
   ```
2. Press Enter and wait for installation to complete

**Installing Visual Studio Code:**
1. In Terminal, type:
   ```bash
   brew install --cask visual-studio-code
   ```
2. Press Enter and wait for installation to complete

#### For Linux Users (Ubuntu/Debian):

**Installing Git:**
1. Open Terminal (Ctrl + Alt + T)
2. Type these commands one at a time:
   ```bash
   sudo apt update
   sudo apt install git
   ```
3. Enter your password when prompted

**Installing Node.js:**
1. In Terminal, type:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install nodejs
   ```

**Installing Visual Studio Code:**
1. In Terminal, type these commands:
   ```bash
   wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
   sudo install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/trusted.gpg.d/
   sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/trusted.gpg.d/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
   sudo apt update
   sudo apt install code
   ```

### Step 3: Verifying Your Installation

Let's make sure everything installed correctly:

**Opening Terminal/Command Prompt:**
- **Windows:** Search for "Command Prompt" or "Git Bash" in the Start menu
- **Mac:** Press Cmd + Space, type "Terminal"
- **Linux:** Press Ctrl + Alt + T

**Testing Git:**
1. In your terminal, type: `git --version`
2. Press Enter
3. You should see something like: `git version 2.x.x`
4. If you see an error, Git isn't installed correctly

**Testing Node.js:**
1. Type: `node --version`
2. Press Enter
3. You should see something like: `v18.x.x`
4. Then type: `npm --version`
5. You should see something like: `9.x.x`

**Testing Visual Studio Code:**
1. Type: `code --version`
2. You should see version information
3. If it says "command not found," VS Code isn't in your PATH

### Step 4: Setting Up Visual Studio Code

**Opening VS Code:**
- **Windows:** Search for "Visual Studio Code" in Start menu
- **Mac:** Press Cmd + Space, type "Visual Studio Code"
- **Linux:** Type `code` in terminal or find it in applications menu

**Installing Essential Extensions:**
1. Look for the Extensions icon in the left sidebar (it looks like 4 squares)
2. Click it to open the Extensions panel
3. Install these extensions one by one by searching for them and clicking "Install":

   **ESLint** - Helps catch coding errors
   - Search for "ESLint"
   - Click the one by "Microsoft"
   - Click "Install"

   **Prettier** - Automatically formats your code to look nice
   - Search for "Prettier - Code formatter"
   - Click "Install"

   **GitLens** - Shows Git information in your code
   - Search for "GitLens"
   - Click "Install"

   **Auto Close Tag** - Automatically closes HTML tags
   - Search for "Auto Close Tag"
   - Click "Install"

   **Tailwind CSS IntelliSense** - Helps with CSS styling
   - Search for "Tailwind CSS IntelliSense"
   - Click "Install"

### Step 5: Getting the Application Code

**Creating a Project Folder:**
1. Open Terminal/Command Prompt
2. Navigate to your home directory:
   - **Windows:** Type `cd %USERPROFILE%`
   - **Mac/Linux:** Type `cd ~`
3. Create a new folder: `mkdir aws-cost-optimizer`
4. Enter the folder: `cd aws-cost-optimizer`

**Downloading the Code:**
1. Copy this command exactly:
   ```bash
   git clone https://github.com/sharanvamsi/aws-cost-optimization-platform.git .
   ```
2. Paste it in your terminal and press Enter
3. You should see messages about downloading files
4. This process downloads all the application files to your computer

### Step 6: Installing Application Dependencies

**Installing Dependencies:**
1. Make sure you're still in the project folder
2. Type this command: `npm install`
3. Press Enter and wait (this can take 5-10 minutes)
4. You'll see lots of text scrolling - this is normal
5. When it's done, you'll see a new prompt line

### Step 7: Setting Up Environment Variables

**Creating the Environment File:**
1. Open VS Code in your project folder: `code .`
2. Right-click in the file explorer and select "New File"
3. Name it `.env` (with the dot at the beginning)
4. Add these lines to the file:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3000
   # Optional: Add your OpenAI API key here for enhanced recommendations
   # OPENAI_API_KEY=your_key_here
   ```
5. Save the file

### Step 8: Running the Application

**Starting the Development Server:**
1. In your terminal, type: `npm run dev`
2. Press Enter
3. You should see output like:
   ```
   ▲ Next.js 15.x.x
   - Local:        http://localhost:3000
   
   ✓ Ready in 2.3s
   ```

**Accessing the Application:**
1. Open your web browser
2. Go to: `http://localhost:3000`
3. You should see the AWS Cost Optimization Platform homepage

## How to Use the Application

### Step-by-Step Usage Guide

#### Step 1: Starting a New Calculation

1. **Click "Calculate for New Customer"**
   - This takes you to the main input form

2. **Fill in Customer Information:**
   - **Customer Name:** Enter your laboratory name
   - **Customer Type:** Select from Hospital, Reference Lab, Research Institute, or Point of Care
   - **Country:** Enter your country
   - **City/State:** Enter your location

#### Step 2: Selecting Lab Types

Check all that apply to your facility:
- **Core Lab:** General chemistry, hematology, immunology
- **Molecular Lab:** PCR, sequencing, genetic testing
- **Pathology Lab:** Tissue analysis, digital pathology
- **Point of Care Lab:** Rapid testing, bedside diagnostics

#### Step 3: Getting Your Results

1. **Click "Calculate AWS Cost"**
2. **Review the Results:**
   - Your estimated monthly AWS cost
   - Regional comparison information
   - Service breakdown
   - Optimization recommendations

## Understanding Your Results

### Main Cost Display
- **Your Current AWS Cost:** Estimated monthly cost
- **Regional Information:** AWS region used for pricing
- **Efficiency Score:** How optimized your setup is

### Optimization Recommendations
- **AI-Powered Suggestions:** Specific actions to reduce costs
- **Implementation Information:** Difficulty and time estimates
- **Estimated Savings:** Potential cost reductions

## Troubleshooting

### Common Issues

**"Command not found" errors:**
- Re-install the missing software and ensure "Add to PATH" was selected

**Port 3000 already in use:**
- Use a different port: `npm run dev -- -p 3001`

**Page won't load:**
- Check that the development server is running
- Try refreshing the page
- Clear your browser cache

**Calculation errors:**
- Verify all required fields are filled out
- Check that your location is spelled correctly
- Ensure you've selected at least one lab type

## Getting Help

**Where to Get Help:**
- Check the GitHub repository: [https://github.com/sharanvamsi/aws-cost-optimization-platform](https://github.com/sharanvamsi/aws-cost-optimization-platform)
- Create an issue if your problem isn't listed
- Include your operating system, error messages, and steps to reproduce the problem

This completes the comprehensive setup and usage guide for complete beginners!
