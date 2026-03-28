# Deploy Shifa AI For Free

This guide shows how to put **Shifa AI** on the internet using the **free tier of Vercel** step by step.

We will go very slowly.

Imagine this app is made of 4 small boxes:

1. **GitHub** keeps your code
2. **Vercel** shows your website to the world
3. **Convex** runs the backend and database
4. **Google** lets people sign in with Google

We will connect the boxes one by one.

If you follow this in order, you should be okay even if this is your first deployment.

---

## Before You Start

Make sure you have these accounts:

- GitHub
- Vercel
- Convex
- Google Cloud Console
- Google AI Studio
- Apify
- Exa
- Telegram / BotFather

Also make sure your code is already in a GitHub repo.

---

## What You Are Building

When we finish, you will have:

- a live website like `https://your-project.vercel.app`
- Google sign-in working
- Convex backend working
- medicine search working
- OCR working
- price comparison working
- Exa search sources working
- optional Telegram bot webhook working

---

## Step 1: Make Sure The App Works On Your Computer

Open the project folder and run:

```bash
npm install
npx convex dev
npm run build
```

If these work, great.

If they do not work locally, fix that first.

Local success is the easiest sign that deployment will go smoothly.

---

## Step 2: Understand Where Each Secret Goes

This is the most important part.

Some keys go to **Vercel**.  
Some keys go to **Convex**.  
Some stay only on **your computer**.

### Put these in Vercel

These are used by the Next.js app:

```env
NEXTAUTH_URL=
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
CONVEX_DEPLOY_KEY=
NEXT_PUBLIC_CONVEX_URL=
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash-lite
APIFY_API_TOKEN=
EXA_API_KEY=
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=
```

### Put these in Convex Production

These are used by Convex actions:

```env
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash-lite
TELEGRAM_BOT_TOKEN=
```

### Put these only in `.env.local`

These stay on your computer:

```env
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=
NEXT_PUBLIC_CONVEX_SITE_URL=
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash-lite
APIFY_API_TOKEN=
EXA_API_KEY=
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=
```

Easy memory trick:

- **Vercel** = website secrets
- **Convex** = backend action secrets
- **.env.local** = only your own computer

Never push `.env.local` to GitHub.

---

## Step 3: Make A Strong `AUTH_SECRET`

Do not use:

```env
AUTH_SECRET=supersecretkey
```

That is not safe for production.

Make a real one with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the result.

Use it as:

```env
AUTH_SECRET=your-long-random-secret
```

---

## Step 4: Prepare Convex Production

Go to your **Convex dashboard**.

Then:

1. Open your project
2. Find the **production** deployment
3. Copy the **production URL**
4. Copy the **deploy key**

You will need both later.

They look like this:

```env
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
CONVEX_DEPLOY_KEY=your-secret-deploy-key
```

---

## Step 5: Add Convex Production Secrets

Open your terminal and run:

```bash
npx convex env set --prod GEMINI_API_KEY "YOUR_GEMINI_KEY"
npx convex env set --prod GEMINI_MODEL "gemini-2.5-flash-lite"
npx convex env set --prod TELEGRAM_BOT_TOKEN "YOUR_TELEGRAM_BOT_TOKEN"
```

Then check them:

```bash
npx convex env list --prod
```

You should see:

- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `TELEGRAM_BOT_TOKEN`

Important:

- Gemini is needed in **Convex**
- Telegram bot token is needed in **Convex**
- If they are missing, some features will silently fail

---

## Step 6: Create Google Login

Go to **Google Cloud Console**.

Then:

1. Open `APIs & Services`
2. Open `Credentials`
3. Click `Create Credentials`
4. Choose `OAuth client ID`
5. Choose `Web application`

Google will give you:

- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`

Keep that page open.

We still need to add URLs.

---

## Step 7: Add Google URLs

Google needs 2 things:

### 1. Authorized JavaScript origins

Add:

```text
http://localhost:3000
```

Later, after Vercel gives you your live URL, also add:

```text
https://your-project.vercel.app
```

### 2. Authorized redirect URIs

Add:

```text
http://localhost:3000/api/auth/callback/google
```

Later also add:

```text
https://your-project.vercel.app/api/auth/callback/google
```

Very important:

- **Origin** is only domain + port
- **Redirect URI** is the full callback path

If these are wrong, Google login will fail with `redirect_uri_mismatch`.

---

## Step 8: Push Your Code To GitHub

Before Vercel can deploy, your code must be on GitHub.

Make sure:

- your app code is committed
- `.env.local` is not committed
- real secrets are not committed

Good things to commit:

- app files
- Convex files
- `README.md`
- `DEPLOYMENT.md`
- `.env.example`

Bad things to commit:

- `.env.local`
- real API keys
- bot tokens
- Google secrets

---

## Step 9: Import The Repo Into Vercel

Go to **Vercel**.

Then:

1. Click `Add New`
2. Click `Project`
3. Import your GitHub repository
4. Let Vercel detect `Next.js`
5. Keep the root folder as the project root

Do not click deploy yet.

We still need to add settings.

---

## Step 10: Set The Build Command

In Vercel project settings, find the build settings.

Set the **Build Command** to:

```bash
npx convex deploy --cmd "npm run build"
```

Why?

Because this project needs:

- Convex backend deployed
- Next.js app built

This one command does both in the right order.

---

## Step 11: Add Environment Variables In Vercel

In Vercel, open:

`Project Settings -> Environment Variables`

Add these for **Production**:

```env
NEXTAUTH_URL=https://your-project.vercel.app
AUTH_SECRET=your-long-random-secret
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
CONVEX_DEPLOY_KEY=your-convex-deploy-key
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
GEMINI_API_KEY=your-gemini-key
GEMINI_MODEL=gemini-2.5-flash-lite
APIFY_API_TOKEN=your-apify-token
EXA_API_KEY=your-exa-key
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_WEBHOOK_SECRET=your-own-random-secret
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=your_bot_username
```

If you are using the free Vercel URL, `NEXTAUTH_URL` should look like:

```text
https://your-project.vercel.app
```

If you later connect a custom domain, use that instead.

---

## Step 12: Press Deploy

Now go back to Vercel and deploy the project.

Wait patiently.

When it finishes, Vercel will show your live website URL.

It will look something like:

```text
https://your-project.vercel.app
```

Copy it.

You still need it for Google and Telegram.

---

## Step 13: Finish Google Login With The Real Vercel URL

Go back to Google Cloud Console.

Now add your real live Vercel URL.

If your site is:

```text
https://shifa-ai.vercel.app
```

Then add:

### Authorized JavaScript origins

```text
https://shifa-ai.vercel.app
```

### Authorized redirect URIs

```text
https://shifa-ai.vercel.app/api/auth/callback/google
```

Save the Google settings.

Now Google login should work on the live site too.

---

## Step 14: Optional Telegram Bot Setup

If you want Telegram reminders, do this part too.

### In Vercel, make sure these exist

```env
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=
```

### In Convex, make sure this exists

```env
TELEGRAM_BOT_TOKEN=
```

### Register the webhook

Run this after your Vercel site is live:

```bash
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://your-project.vercel.app/api/telegram/webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>"
```

Replace:

- `<TOKEN>` with your Telegram bot token
- `https://your-project.vercel.app` with your real live site URL
- `<TELEGRAM_WEBHOOK_SECRET>` with the same secret you put into Vercel

Then verify:

```bash
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
```

If it looks correct, Telegram is connected.

---

## Step 15: Test The Live App

Open your live site and test these one by one:

1. Home page opens
2. Theme toggle works
3. Google sign-in works
4. After login, protected pages open
5. `/dashboard` opens
6. Medicine search works
7. Prescription upload works
8. Price comparison works
9. Exa search sources appear
10. `/appointments` opens
11. Telegram works if you set it up

If all of these work, you are live.

---

## Step 16: Troubleshooting

### Problem: Vercel build fails

Usually this means one of these is missing in Vercel:

- `CONVEX_DEPLOY_KEY`
- `NEXT_PUBLIC_CONVEX_URL`
- `GEMINI_API_KEY`

Also check that your build command is exactly:

```bash
npx convex deploy --cmd "npm run build"
```

### Problem: Google says `redirect_uri_mismatch`

The Google callback URL is wrong or missing.

It must match your real live site exactly:

```text
https://your-project.vercel.app/api/auth/callback/google
```

### Problem: Google sign-in button does not work

Check Vercel for:

- `NEXTAUTH_URL`
- `AUTH_SECRET`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`

### Problem: OCR or medicine explanation does not work

Check:

- `GEMINI_API_KEY` in Vercel
- `GEMINI_MODEL` in Vercel
- `GEMINI_API_KEY` in Convex
- `GEMINI_MODEL` in Convex

Gemini is needed in **both places** in this project.

### Problem: Price comparison does not work

Check Vercel for:

- `APIFY_API_TOKEN`

### Problem: Trusted search sources do not work

Check Vercel for:

- `EXA_API_KEY`

### Problem: Telegram does not work

Check:

- `TELEGRAM_BOT_TOKEN` in Vercel
- `TELEGRAM_BOT_TOKEN` in Convex
- `TELEGRAM_WEBHOOK_SECRET` in Vercel
- webhook URL is registered correctly

---

## Step 17: Super Simple Checklist

If you want the smallest possible checklist, do this:

1. Run the app locally
2. Create a strong `AUTH_SECRET`
3. Prepare Convex production
4. Put Gemini and Telegram bot token into Convex
5. Create Google OAuth credentials
6. Add localhost Google URLs
7. Push code to GitHub
8. Import repo into Vercel
9. Set build command
10. Add Vercel environment variables
11. Deploy
12. Add the real Vercel URL to Google
13. Test the live app
14. Optional: connect Telegram webhook

---

## Free-Tier Advice

To keep things simple and free:

- use **Vercel Hobby**
- use one **Convex production deployment**
- use one Google OAuth app
- use one Telegram bot
- start with the default `vercel.app` domain first

Do not try to make everything perfect on day one.

First make it work.

Then make it fancy.

---

## Official Docs

- Vercel: https://vercel.com/docs
- Convex: https://docs.convex.dev
- NextAuth: https://next-auth.js.org
- Google OAuth: https://developers.google.com/identity/protocols/oauth2
- Gemini API: https://ai.google.dev
- Apify: https://docs.apify.com
- Exa: https://docs.exa.ai
- Telegram Bot API: https://core.telegram.org/bots/api
