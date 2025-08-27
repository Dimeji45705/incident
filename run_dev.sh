#!/bin/bash

# Set environment variables for development mode
export NG_DEBUG=true
export DEBUG_AUTH=true

# Clear Angular cache
echo "Clearing Angular cache..."
rm -rf node_modules/.cache/angular

# Run the Angular application in development mode
echo "Starting application with debug mode enabled..."
ng serve --configuration development --verbose
