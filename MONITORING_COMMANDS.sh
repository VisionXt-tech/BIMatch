#!/bin/bash

# BIMatch - Monitoring & Maintenance Commands
# Run these regularly to keep the app healthy

echo "🔍 BIMatch Monitoring & Maintenance Toolkit"
echo "==========================================="
echo ""

# 1. Check for unused dependencies
echo "📦 Checking for unused dependencies..."
npx depcheck | head -20
echo ""

# 2. Check for outdated packages
echo "📦 Checking for outdated packages..."
npm outdated
echo ""

# 3. Security audit
echo "🔒 Running security audit..."
npm audit --production
echo ""

# 4. Bundle size analysis
echo "📊 Analyzing bundle size..."
if [ -d ".next" ]; then
  du -sh .next/static/chunks/* | sort -h | tail -10
else
  echo "Run 'npm run build' first"
fi
echo ""

# 5. Check for large files
echo "📁 Checking for large files in repo..."
find . -type f -size +1M -not -path "./node_modules/*" -not -path "./.next/*" -not -path "./.git/*" | head -10
echo ""

# 6. Count lines of code
echo "📝 Lines of code (TypeScript/TSX)..."
find src -name "*.ts" -o -name "*.tsx" | xargs wc -l | tail -1
echo ""

# 7. Git status
echo "🔄 Git status..."
git status --short
echo ""

# 8. Check .env files
echo "🔐 Checking environment files..."
ls -lh .env* 2>/dev/null || echo "No .env files found"
echo ""

# 9. Firebase project info
echo "🔥 Firebase project..."
firebase projects:list 2>/dev/null || echo "Run 'firebase login' first"
echo ""

# 10. Next.js info
echo "⚡ Next.js version..."
npm list next | grep next@
echo ""

echo "==========================================="
echo "✅ Monitoring check complete!"
echo ""
echo "💡 Quick commands:"
echo "  npm run build          - Build production"
echo "  npm run typecheck      - Check TypeScript"
echo "  npm run lint           - Run linter"
echo "  firebase deploy        - Deploy to production"
echo ""
