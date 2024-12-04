# Playwright Project Setup

This guide provides instructions for setting up the project environment with Node.js, Visual Studio Code, and Playwright.

## Prerequisites
    - Prepare the URLs inside the "urls.xlsx" file after pulling the code from the git command

## Step-by-Step Setup Instructions

### Step 1: Install Node.js and Visual Studio Code
1. Open **Software Center** from inside your VM.
2. Search for **Node.js** and **Visual Studio Code**, and install the latest versions of both.

### Step 2: Install Git Bash
1. Download [Git Bash](https://git-scm.com/downloads) and run the installer.
2. Follow the installation prompts to complete the setup.

### Step 3: Clone the Project Repository
1. Navigate to the location where you want to pull the project.
2. Open Git Bash in this location.
3. Initialize a Git repository and clone the project by running the following commands:
   ```bash
   git clone https://github.com/sabbir-aust/url-visual-comparison.git

### Step 4: Open the Project in Visual Studio Code
After cloning, open the project folder in Visual Studio Code.

### Step 5: Install Playwright
In the terminal (inside VS Code), run the following command to install Playwright:

    npm install @playwright/test

If prompted, select JavaScript as the language.
When asked for a directory, type tests instead of e2e, then press Enter to complete the installation.

### Step 6: Run the Test
After Playwright is installed, you can run a specific test by using the following command with headed mode which will pop up the browser and run the test:

    npx playwright test visualComparison.spec.js --project chromium --headed

If you want to run it in non-headed mode then run the following command which will not pop up any browser

    npx playwright test visualComparison.spec.js --project chromium

### Result
    - After run completes, Go to the screenshot folder to see the separate screenshots
    - Go to the Result folder from the root. You will get to see the results in a excel format
