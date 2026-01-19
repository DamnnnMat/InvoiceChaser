# How to Push Code to GitHub

## Step 1: Initialize Git Repository

Open your terminal in the project directory and run:

```bash
cd /Users/mattbaby/InvoiceChaser
git init
```

## Step 2: Verify .gitignore

Make sure `.env.local` is in `.gitignore` (it should be - we checked and it's there).

## Step 3: Add All Files

```bash
git add .
```

This stages all files except those in `.gitignore` (like `.env.local`).

## Step 4: Make Your First Commit

```bash
git commit -m "Initial commit: Invoice Chaser MVP"
```

## Step 5: Create GitHub Repository

1. Go to https://github.com
2. Click the **+** icon in the top right → **New repository**
3. Repository name: `InvoiceChaser` (or any name you prefer)
4. Description: "Invoice reminder automation micro-SaaS"
5. Choose **Public** or **Private** (your choice)
6. **DO NOT** initialize with README, .gitignore, or license (we already have files)
7. Click **Create repository**

## Step 6: Connect Local Repo to GitHub

GitHub will show you commands. Use these (replace `YOUR_USERNAME` with your GitHub username):

```bash
git remote add origin https://github.com/YOUR_USERNAME/InvoiceChaser.git
git branch -M main
git push -u origin main
```

If you're using SSH instead of HTTPS:

```bash
git remote add origin git@github.com:YOUR_USERNAME/InvoiceChaser.git
git branch -M main
git push -u origin main
```

## Step 7: Verify

Go to your GitHub repository page - you should see all your files!

## Troubleshooting

**If you get authentication errors:**
- For HTTPS: GitHub may ask for a Personal Access Token instead of password
- Create one at: https://github.com/settings/tokens
- Or use GitHub CLI: `gh auth login`

**If you get "remote origin already exists":**
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/InvoiceChaser.git
```

**To check what will be committed:**
```bash
git status
```

**To see what's in .gitignore:**
```bash
cat .gitignore
```

## Important: Never Commit Sensitive Files

Your `.env.local` file should **NOT** be committed (it's in `.gitignore`). 

**Before pushing, verify:**
```bash
git status
```

You should **NOT** see `.env.local` in the list of files to be committed.

## Next Steps After Pushing

Once code is on GitHub:
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import from GitHub
4. Select your repository
5. Configure environment variables in Vercel (don't forget to add all your `.env.local` values!)
