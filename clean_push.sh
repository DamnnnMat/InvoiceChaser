#!/bin/bash

# Script to create a clean commit without large files and push to GitHub

set -e

echo "🔄 Resetting to origin/main (keeping your changes)..."
git fetch origin
git reset --soft origin/main

echo "📦 Staging all files except Home V2 directory..."
git reset "Home V2"
git add -A

echo "📝 Creating clean commit with all changes..."
git commit -m "Add feedback system, beta ribbon, UI improvements, and rebrand to InvoiceSeen

- Add feedback system with migration
- Add beta ribbon to dashboard
- UI improvements and rebranding
- Update feedback migration to handle existing policies"

echo "🚀 Pushing to GitHub..."
git push --force-with-lease origin main

echo "✅ Done! Your changes are now on GitHub and will deploy to production."
