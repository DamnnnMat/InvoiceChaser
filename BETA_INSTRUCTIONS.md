# Private beta – access and waitlist

## Inviting a beta user

1. In **Supabase Dashboard** → **Table Editor**, open the table **`beta_allowlist`**.
2. Click **Insert row**.
3. Set:
   - **email**: the user’s email (e.g. `friend@company.com`)
   - **is_active**: `true`
   - **created_at**: leave default (or set to now)
4. Save.

The user can then go to **/signup**, enter that email (and a password), and sign up. They will be able to access the app.

## Optional: disable email confirmation (beta)

To avoid invite emails getting stuck or users having to confirm before using the app:

1. In **Supabase Dashboard** → **Authentication** → **Providers** → **Email**.
2. Turn **off** “Confirm email” (or equivalent).
3. Save.

Then signup will create the account and redirect straight to the app without requiring a confirmation link.

## Waitlist submissions

- Submissions from the homepage form are stored in **`beta_waitlist`**.
- To view them: use the Supabase **Table Editor** and open **`beta_waitlist`** (with a service-role / admin connection; RLS blocks public reads).
- To invite someone from the waitlist: add their **email** to **`beta_allowlist`** as above, then email them (outside the app) to tell them they can sign up.

## Summary

- **Homepage (/)** = waitlist only (email + optional role/notes). No account creation.
- **Signup (/signup)** = only emails in **`beta_allowlist`** can create an account; others see “Access required” and a link to request access.
- **App (/app/…)** = only logged-in users whose email is in **`beta_allowlist`** can access; others are redirected to **/private-beta**.
- **To invite someone:** add their email to **`beta_allowlist`** in Supabase.
