#!/bin/bash
echo "=== Deployment Debug Info ==="
echo "Current directory: $(pwd)"
echo "Files in current directory:"
ls -la
echo "Package.json exists here: $(test -f package.json && echo 'YES' || echo 'NO')"
echo "============================="

# Change to parent directory where package.json is located
cd ..
echo "=== After changing to parent directory ==="
echo "New current directory: $(pwd)"
echo "Files in parent directory:"
ls -la
echo "Package.json exists in parent: $(test -f package.json && echo 'YES' || echo 'NO')"
echo "============================="

# Install dependencies
npm install

# Build the application
npm run build

echo "Build completed successfully!" 