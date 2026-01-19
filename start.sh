#!/bin/bash

echo "🚀 Invoice Chaser - Local Development Setup"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
  if [ $? -ne 0 ]; then
    echo "❌ npm install failed. Try:"
    echo "   - sudo npm install"
    echo "   - Or use nvm: nvm use 18 && npm install"
    echo "   - Or use yarn: yarn install"
    exit 1
  fi
else
  echo "✅ Dependencies already installed"
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
  echo "⚠️  .env.local not found. Creating with placeholder values..."
  cat > .env.local << EOF
# Supabase - Replace with your actual values
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder_anon_key
SUPABASE_SERVICE_ROLE_KEY=placeholder_service_role_key

# Stripe - Replace with your actual values
STRIPE_SECRET_KEY=sk_test_placeholder
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder

# Email (Resend) - Replace with your actual values
RESEND_API_KEY=re_placeholder
EMAIL_FROM=noreply@example.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cron (for reminder scheduler)
CRON_SECRET=local_dev_secret_key
EOF
  echo "✅ Created .env.local with placeholder values"
  echo "⚠️  Update .env.local with your actual Supabase/Stripe keys to use full features"
else
  echo "✅ .env.local exists"
fi

echo ""
echo "🎉 Starting development server..."
echo "   Open http://localhost:3000 in your browser"
echo ""

npm run dev
