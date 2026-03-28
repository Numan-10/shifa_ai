# Shifa AI — Your Medicine, Understood.

**Shifa** (شفا) means *healing* in Urdu.

Shifa AI is an AI-powered medicine companion that helps you search, understand, and never miss your medications. It turns confusing prescriptions and medical jargon into clear, actionable information — and keeps you on track with smart reminders.

---

## Who Is This For?

Shifa AI serves anyone who has ever stood at a pharmacy counter confused about what they were holding. Specifically:

**Today, as the app stands, it works best for:**

| User | Why Shifa Helps |
|------|----------------|
| **Patients managing chronic conditions** | Diabetes, hypertension, arthritis — multiple meds, complex schedules. Shifa organizes them. |
| **The elderly** | Forget a dose? Missed yesterday's pill? Reminders on web and Telegram keep seniors on track. |
| **Caregivers** | Managing medications for an elderly parent or sick family member is hard. Shifa centralizes it. |
| **Anyone with a confusing prescription** | When a doctor writes in shorthand and you go home unsure — Shifa explains it in plain English. |
| **People intimidated by medical jargon** | Side effects, drug interactions, pregnancy safety — written for real people, not doctors. |

> **Honest note:** The app is currently English-only. Language localization (Urdu, Kashmiri, Hindi) is part of the vision, not yet implemented. The goal of serving rural, low-literacy users fully is aspirational — the foundation is being built.

---

## What Shifa AI Does (What's Actually Built)

### 1. 🔍 Medicine Search
Type any medicine name and instantly get:
- What it's for (uses and indications)
- Dosage guidance — adult, children, and maximum daily dose
- Side effects
- Precautions and what to avoid
- Drug interactions
- Pregnancy safety note
- Timing guidance

**How it works:** Common medicines (Paracetamol, Ibuprofen, Amoxicillin) are served instantly from a curated local database. For any other medicine, Gemini AI generates a careful analysis in real-time and caches it in Convex for future users.

---

### 2. 📷 Prescription Scanner (Gemini Vision OCR)
Upload a photo of your prescription — handwritten or printed.

Gemini Vision reads it and extracts:
- Medicine names
- Dosage instructions
- Doctor's notes

Each extracted medicine has a one-tap button to pull its full information immediately.

**Supported formats:** JPG, PNG, WebP, PDF

---

### 3. 💰 Price Comparison
After searching a medicine, Shifa fetches live prices from real pharmacy sources so you can compare costs and find the best option.

*Powered by Apify — pharmacy data fetched in real-time.*

---

### 4. 📚 Trusted Sources
Every medicine result is enriched with links to trusted medical references — so you're not just reading AI output, you're reading AI-summarized, source-backed information.

*Powered by Exa neural search.*

---

### 5. 💊 Medication Reminders
Set a reminder for each medicine — just the name, time, and frequency. The app tracks:
- Which doses you've taken today
- Which are remaining
- Your full daily schedule in a timeline view

Reminders persist in the cloud (Convex) — they survive browser restarts and work across sessions.

---

### 6. 📲 Telegram Notifications
Connect your Telegram account once (2 steps, under a minute). After that, reminders fire as Telegram messages at the exact time you set — so you get notified even when the browser is closed.

**This is the key accessibility unlock.** Telegram works on every phone, uses almost no data, and doesn't require a smart device. It's the bridge toward users who don't live on a web browser.

---

### 7. 🗓️ Appointment Booking (UI Demo)
Browse a list of doctors, pick a date on the calendar, select a time slot, and confirm a booking. The UI is fully functional as a demonstration — appointment persistence to a real doctor booking system is on the roadmap.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 + TypeScript |
| Styling | Tailwind CSS + custom design system |
| Animations | GSAP (GreenSock) |
| Backend / DB | Convex (real-time, serverless) |
| AI — Medicine analysis | Gemini API (gemini-2.5-flash-lite) |
| AI — Prescription OCR | Gemini Vision (multimodal) |
| Medical search enrichment | Exa API |
| Pharmacy pricing data | Apify |
| Notifications | Telegram Bot API |
| Authentication | NextAuth.js + Google OAuth |

---

## Running Locally

```bash
npm install
npm run dev
```

In a separate terminal:
```bash
npx convex dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=

CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash-lite   # optional, this is the default

EXA_API_KEY=
APIFY_API_KEY=

TELEGRAM_BOT_TOKEN=
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full deployment instructions.

---

## The Vision

Medicine is complicated. Labels are dense. Instructions are jargon.

And for too many people — elderly patients, caregivers juggling multiple family members, patients who just got a diagnosis and are overwhelmed — that complexity becomes a real risk.

Shifa AI's goal is to make medicine **understandable, searchable, and hard to forget.**

The English-first version serves that goal for the patients who can use it today. The next step is breaking the language barrier — Urdu, Kashmiri, Hindi — so the people who need this most can access it too.

---

*Built with the belief that understanding your medicine should never be scary.*
