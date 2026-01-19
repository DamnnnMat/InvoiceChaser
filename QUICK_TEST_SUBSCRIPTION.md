# Quick Test Subscription - Get Access Now!

Since you don't have Stripe set up yet, you can manually add a test subscription to your database so you can use the app immediately.

## Step 1: Get Your User ID

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/qjzrifhbpoyrewilmwhl
2. Click **Authentication** in the left sidebar
3. Click **Users**
4. Find your user (the email you signed up with)
5. Copy the **User ID** (it's a UUID like `123e4567-e89b-12d3-a456-426614174000`)

## Step 2: Add Test Subscription

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Paste this SQL (replace `YOUR_USER_ID` with the UUID you copied):

```sql
INSERT INTO subscriptions (
  user_id,
  stripe_subscription_id,
  stripe_customer_id,
  status,
  current_period_end
) VALUES (
  'YOUR_USER_ID',  -- Replace this with your actual user ID
  'sub_test_manual_12345',
  'cus_test_manual_12345',
  'active',
  NOW() + INTERVAL '1 month'
);
```

4. Click **Run** (or press Cmd+Enter)

## Step 3: Refresh Your App

1. Go back to: http://localhost:3000/app/invoices
2. You should now have full access! 🎉

## What This Does

This creates a fake "active" subscription in your database so you can:
- ✅ Create invoices
- ✅ Edit templates
- ✅ Use all app features
- ✅ Test the entire app

**Note:** This is just for testing. When you're ready to test real payments, set up Stripe (see STRIPE_SETUP.md).

---

## To Remove This Test Subscription Later

When you want to test the real Stripe flow:

```sql
DELETE FROM subscriptions 
WHERE stripe_subscription_id = 'sub_test_manual_12345';
```

Then set up Stripe and go through the real checkout process.
