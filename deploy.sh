#!/bin/bash
echo "=== Deployment Debug Info ==="
echo "Current directory: $(pwd)"
echo "Files in current directory:"
ls -la
echo "Package.json exists: $(test -f package.json && echo 'YES' || echo 'NO')"
echo "============================="

# Install dependencies
npm install

# Build the application
npm run build

echo "Build completed successfully!" 