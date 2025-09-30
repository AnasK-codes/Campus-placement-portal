#!/bin/bash

# Campus Placement Portal - Development Setup Script
# This script sets up the development environment with Firebase Emulators

echo "🏫 Campus Placement Portal - Development Setup"
echo "=============================================="

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed."
    echo "   Please install it with: npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ You are not logged in to Firebase."
    echo "   Please run: firebase login"
    exit 1
fi

echo "✅ Firebase CLI is installed and you are logged in."

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Install Cloud Functions dependencies
echo ""
echo "📦 Installing Cloud Functions dependencies..."
cd functions
npm install
cd ..

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ Created .env file. Please update it with your Firebase configuration."
else
    echo "✅ .env file already exists."
fi

# Initialize Firebase project (if not already initialized)
if [ ! -f .firebaserc ]; then
    echo ""
    echo "🔥 Initializing Firebase project..."
    echo "   Please select your Firebase project when prompted."
    firebase init
else
    echo "✅ Firebase project already initialized."
fi

# Build Cloud Functions
echo ""
echo "🔨 Building Cloud Functions..."
cd functions
npm run build
cd ..

echo ""
echo "🎉 Development setup complete!"
echo ""
echo "📋 Next Steps:"
echo "   1. Update .env file with your Firebase configuration"
echo "   2. Start the development environment:"
echo "      npm run dev:emulators"
echo "   3. In another terminal, start the React app:"
echo "      npm run dev"
echo "   4. (Optional) Seed test accounts:"
echo "      npm run seed"
echo ""
echo "🌐 Development URLs:"
echo "   - React App: http://localhost:5173"
echo "   - Firebase Emulator UI: http://localhost:4000"
echo "   - Firestore Emulator: http://localhost:8080"
echo "   - Auth Emulator: http://localhost:9099"
echo "   - Functions Emulator: http://localhost:5001"
echo ""
echo "Happy coding! 🚀"
