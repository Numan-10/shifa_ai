# Shifa AI

**AI-powered medicine understanding for people who should never be left behind by language, handwriting, or medical jargon.**

Shifa means **healing** in Urdu.

Shifa AI was built around a real and painful problem:

A farmer in **Shopian** visits a government doctor and receives a prescription in English.  
He cannot understand what the medicines are, when to take them, or what to avoid.

That confusion can lead to:

- Wrong dosage
- Missed timing
- Dangerous side effects
- Serious health risks

Shifa AI exists to make medicine **understandable, searchable, and actionable**.

## 💔 The Problem

- Language barriers in rural healthcare are real
- Prescriptions are often written in English
- Patients may not understand medicine names or instructions
- Confusion around dosage and timing can become life-threatening

## ❤️ The Solution

Shifa AI helps a user:

- Upload a prescription image
- Extract medicine names with AI
- Search a medicine in English
- Understand dosage, precautions, and timing in a cleaner, simpler way
- Compare prices and access trusted reference sources
- Extend support through Telegram for accessibility beyond the web

Note:
The current product experience is in **English**, with the larger vision focused on breaking healthcare language barriers for underserved users.

## ⚡ 10-Second Demo

1. Upload prescription image
2. AI extracts medicine names
3. Search a medicine instantly
4. Shows dosage + precautions

## 🏆 Why This Project Stands Out

- Built with the realities of **rural Kashmir** in mind
- Focused on **language accessibility**, not just generic health-tech
- Solves a deeply human problem with real-world stakes
- Designed for users with **low digital literacy**
- Blends AI, OCR, search, pricing, and messaging into one flow

## ✨ What Shifa AI Does

### 1. Prescription Scanner

Users can upload a prescription image or PDF.  
Shifa AI extracts medicine names, dosage hints, and instructions from the prescription.

### 2. Medicine Search

Users can type the medicine name in English and instantly get:

- Uses
- Dosage guidance
- Side effects
- Precautions
- Timing guidance

### 3. Trusted Source Enrichment

Shifa AI pulls trusted supporting references using Exa so the result is not just AI-generated, but also grounded in real sources.

### 4. Price Comparison

Shifa AI compares medicine prices from real pharmacy sources to help users make practical decisions.

### 5. Appointments & Reminders

The app includes appointment and reminder flows to support patients beyond the first search.

### 6. Telegram Accessibility

Telegram integration helps extend reminders and support beyond the browser, making the product more accessible in low-friction environments.

## 🧩 Tech Stack

- **Next.js 14** for the frontend
- **Convex** for backend logic and data
- **Gemini API** for AI-powered medicine explanation and prescription understanding
- **OCR pipeline** for prescription reading
- **Exa API** for medical knowledge enrichment
- **Apify** for real-world pharmacy and pricing data
- **Telegram Bot** for accessibility beyond web

## 🏁 Hackathon Tracks

- 🧠 **AI**: Gemini API for medical explanations
- 🔍 **Exa API**: Drug information search
- 🕸️ **Apify**: Real-world pharmacy & pricing data
- ⚡ **Convex**: Realtime backend
- 🤖 **Cursor/Codex**: Rapid fullstack development

## 📸 Screenshots

Add real screenshots inside a `/screenshots` folder and keep these paths:

![Landing Page](./screenshots/landing.png)
![Dashboard](./screenshots/dashboard.png)
![Prescription Scanner](./screenshots/prescription.png)
![Results](./screenshots/results.png)

## 🚀 How To Run

```bash
npm install
npm run dev
npx convex dev
```

Open `http://localhost:3000`

## 🔐 Environment Setup

Create a local `.env.local` with the required keys for:

- Google Auth
- Convex
- Gemini
- Exa
- Apify
- Telegram

For deployment details, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## 🌍 Vision

Shifa AI aims to become a healthcare companion for the next billion users, breaking language barriers and making medicine understandable for everyone.

## Why It Feels Different

Most hackathon demos show technology.  
Shifa AI shows **consequence**.

This is not just about OCR, search, or APIs. It is about making sure a patient understands what they are putting into their body, when they should take it, and what could go wrong if they do not.

That is why this product matters.

Built with the belief that understanding your medicine should never depend on knowing English.
