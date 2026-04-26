#!/bin/bash

# Fix permissions for AI_ATS_JobScraper project

echo "Fixing permissions for node_modules..."
sudo chown -R $(whoami) /Users/rituraj/Documents/AI_ATS_JobScraper/node_modules

echo "Cleaning Vite cache..."
rm -rf /Users/rituraj/Documents/AI_ATS_JobScraper/node_modules/.vite*

echo "Done! Now run: npm run dev"
