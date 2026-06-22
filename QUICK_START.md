# Quick Start - Production Ready

## 1. Set Your Gemini API Key

Create `.env.local` in the project root:

```bash
GEMINI_API_KEY=paste_your_key_here
```

Get your free API key: https://aistudio.google.com/app/apikey

## 2. Install & Run

```bash
# Install dependencies
pnpm install

# Development (with hot reload)
pnpm run dev

# Production build
pnpm run build

# Run production server
pnpm run start
```

## 3. Test the App

- Open http://localhost:3000
- Upload a resume (PDF or TXT)
- Optionally add a job description
- Click "Analyze" to get AI-powered insights

## What's Production-Ready

✅ File validation (5MB limit)  
✅ Input limits (50K chars for resume)  
✅ Error handling with user-friendly messages  
✅ TypeScript type safety (no ignored errors)  
✅ PDF text extraction with validation  
✅ Gemini API integration  

## Configuration

All limits defined in code:
- **Max file size**: 5 MB (ui/pdf-extractor.ts)
- **Max resume text**: 50,000 characters
- **Max job description**: 10,000 characters
- **Max PDF pages**: 50

## No Database Needed

The app is fully stateless - no database or user auth required. Each analysis is independent.

## Environment Variables

| Name | Required | Value |
|------|----------|-------|
| `GEMINI_API_KEY` | Yes | Your API key from Google AI Studio |
| `NODE_ENV` | Optional | Set to `production` for production |

---

For detailed setup, see [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)
