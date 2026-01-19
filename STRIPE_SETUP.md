# Stripe Setup - Quick Guide

## Option 1: Set Up Stripe Test Mode (Recommended - 5 minutes)

### Step 1: Create Stripe Account
1. Go to https://stripe.com
2. Sign up for a free account (or log in)
3. You'll automatically be in **Test Mode** (toggle in top right)

### Step 2: Get Your Test Keys
1. Go to: https://dashboard.stripe.com/test/apikeys
2. You'll see:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`) - Click "Reveal test key"

### Step 3: Update .env.local
Open `.env.local` and replace the Stripe placeholders:

```env
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_placeholder  # We'll set this up later
```

### Step 4: Restart Dev Server
```bash
# Stop server (Ctrl+C)
npm run dev
```

### Step 5: Test Subscription
1. Go to http://localhost:3000/app/billing
2. Click "Subscribe Now"
3. You'll be redirected to Stripe Checkout
4. Use test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Any ZIP code
5. Complete checkout
6. You'll be redirected back and have an active subscription!

---

## Option 2: Manual Test Subscription (Quick Workaround)

If you want to test the app **right now** without Stripe, you can manually add a subscription to your database:

### Step 1: Get Your User ID
1. Go to Supabase Dashboard
2. Go to **Authentication** → **Users**
3. Find your user and copy the **User ID** (UUID)

### Step 2: Add Subscription Manually
1. Go to Supabase Dashboard → **SQL Editor**
2. Run this SQL (replace `YOUR_USER_ID` with your actual user ID):

```sql
INSERT INTO subscriptions (
  user_id,
  stripe_subscription_id,
  stripe_customer_id,
  status,
  current_period_end
) VALUES (
  'YOUR_USER_ID',  -- Replace with your user ID
  'sub_test_manual',
  'cus_test_manual',
  'active',
  NOW() + INTERVAL '1 month'
);
```

### Step 3: Refresh the App
1. Go back to http://localhost:3000/app/invoices
2. You should now have access!

**Note:** This is just for testing. For real subscriptions, use Stripe (Option 1).

---

## Which Option Should You Use?

- **Option 1 (Stripe)**: Best for testing the full flow, including checkout
- **Option 2 (Manual)**: Quick way to test the app features right now

You can do both - use Option 2 to test immediately, then set up Stripe (Option 1) to test the full subscription flow!
