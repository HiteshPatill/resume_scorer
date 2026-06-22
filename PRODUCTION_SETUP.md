# Production Deployment Guide

## Overview
ResumeScore is now ready for production deployment. This guide covers everything needed to run the app in production with the Gemini API.

## Prerequisites

- **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Node.js** 18+ and npm/pnpm
- **Environment** to host (Vercel, AWS, Azure, etc.)

## Setup Instructions

### 1. Set Environment Variables

Create a `.env.local` file (or configure in your hosting platform):

```bash
GEMINI_API_KEY=your_actual_gemini_api_key_here
NODE_ENV=production
```

**Important**: Never commit `.env.local` to version control.

### 2. Install Dependencies

```bash
pnpm install
# or npm install
```

### 3. Build for Production

```bash
pnpm run build
# or npm run build
```

This will:
- ✅ Check TypeScript types (no longer ignored)
- ✅ Validate all required environment variables
- ✅ Optimize bundles for production
- ✅ Pre-render static pages where possible

### 4. Run Production Server

**Locally:**
```bash
pnpm run start
# or npm start
```

The app will be available at `http://localhost:3000`

**On Vercel:**
```bash
vercel deploy --prod
```

**On other platforms:**
Follow your platform's deployment guide. Ensure:
- `GEMINI_API_KEY` is set as an environment variable
- Node.js runtime is available
- The app runs on port 3000 (or your configured port)

## Configuration Reference

### Environment Variables

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | ✅ Yes | `AIza...` | Your Gemini API key from Google AI Studio |
| `NODE_ENV` | ❌ No | `production` | Set to `production` for production deployments |

### File Upload Limits

- **Maximum file size**: 5 MB
- **Maximum resume length**: 50,000 characters (~10 pages)
- **Maximum job description**: 10,000 characters
- **Supported formats**: PDF (text-based), TXT

### PDF Requirements

- PDFs must be **text-based** (not scanned/image PDFs)
- Maximum **50 pages** per PDF
- Content must be extractable as plain text

## Features Included in Production

✅ **AI-Powered Analysis** - Gemini API integration  
✅ **Input Validation** - File size, text length, format checks  
✅ **Error Handling** - Comprehensive error messages  
✅ **Security** - Input sanitization, API key protection  
✅ **Performance** - Optimized builds, async processing  
✅ **Monitoring** - Error logging for debugging  

## Troubleshooting

### "GEMINI_API_KEY is not configured"

**Problem**: The app can't find your API key.

**Solution**:
1. Check that `GEMINI_API_KEY` is set in your environment
2. For local testing: Create `.env.local` with the key
3. For production: Set the environment variable in your hosting platform's dashboard
4. Restart the application

### "File size exceeds 5MB limit"

**Problem**: User uploaded a file larger than allowed.

**Solution**: Resume files are limited to 5MB. Advise users to:
- Convert PDF to TXT if possible (smaller file)
- Remove images/graphics
- Use a shorter version of their resume

### "No text found in PDF"

**Problem**: PDF is a scanned image, not text-based.

**Solution**: The user needs to:
- Use OCR to convert the scanned PDF to text
- Export as PDF from Word/Google Docs instead
- Provide a TXT version of their resume

### "Failed to analyze resume"

**Problem**: Gemini API failed to respond.

**Possible Causes**:
1. API key is invalid or quota exceeded
2. Network connectivity issue
3. Gemini API is temporarily unavailable

**Solution**:
1. Verify `GEMINI_API_KEY` is correct
2. Check [Google AI Studio](https://aistudio.google.com/app/apikey) for quota usage
3. Try again in a few seconds
4. Check application logs for detailed error messages

## Performance & Optimization

### Response Times
- Typical analysis: **2-5 seconds**
- Large resumes (50K+ chars): **5-10 seconds**
- Limited by Gemini API response time

### Scaling
For high traffic, consider:
1. **Caching** - Store frequent analyses (requires database)
2. **Rate limiting** - Add request throttling (currently unlimited)
3. **Queue system** - Process analyses asynchronously
4. **CDN** - Serve static assets from CDN

## Security Notes

1. **API Key Protection**
   - Store `GEMINI_API_KEY` securely
   - Never expose in client-side code
   - Rotate keys if compromised

2. **Input Validation**
   - All inputs are validated for size and format
   - File uploads limited to 5MB
   - Text inputs limited to 50,000 characters

3. **CORS**
   - API only accepts requests from your domain
   - No credentials exposed in client code

## Monitoring & Logging

The app logs errors to the server console. For production deployments:

1. **Vercel**: Check logs in Vercel dashboard
2. **AWS**: Use CloudWatch
3. **Azure**: Use Application Insights
4. **Other**: Check your platform's logging service

Key events logged:
- Missing environment variables
- File extraction errors
- API failures
- Invalid inputs

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review application logs
3. Verify environment configuration
4. Test with sample resumes

---

**Last Updated**: 2026-06-22  
**Version**: 1.0.0 Production Ready
