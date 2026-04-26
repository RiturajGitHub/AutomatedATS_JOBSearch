#!/bin/bash

# PDF-Ready Setup Script
# This ensures your app is ready to handle PDF uploads

echo "🔧 Setting up PDF-ready configuration..."
echo ""

# Step 1: Fix permissions
echo "1️⃣ Fixing permissions..."
sudo chown -R $(whoami) node_modules 2>/dev/null || echo "   Permissions already OK"

# Step 2: Clear Vite cache
echo "2️⃣ Clearing Vite cache..."
rm -rf node_modules/.vite 2>/dev/null
echo "   ✅ Cache cleared"

# Step 3: Clear browser cache reminder
echo ""
echo "3️⃣ Clear your browser cache:"
echo "   Chrome/Edge: Cmd+Shift+Delete (Mac) or Ctrl+Shift+Delete (Windows)"
echo "   Select 'Cached images and files' and clear"
echo ""

# Step 4: Start server
echo "4️⃣ Starting dev server..."
echo ""
npm run dev
