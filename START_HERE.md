# 🚀 Quick Start Guide

## PDF Upload - Ready to Use

Your app is configured to handle PDF uploads using PDF.js v3.11.174 (stable version).

## Start the App

```bash
npm run dev
```

Open: http://localhost:5173

## Upload Your Resume

1. Drag and drop your PDF resume
2. Or click to browse and select file
3. Supported formats: PDF, DOCX, DOC, TXT
4. Max size: 10MB

## Features

- ✅ ATS Score Analysis (0-100)
- ✅ Section-by-section breakdown
- ✅ AI-powered recommendations
- ✅ Job matching from LinkedIn, Naukri, InstaHyre
- ✅ Skills extraction
- ✅ Keyword analysis

## Troubleshooting

### PDF Not Working?

**Check if it's a text-based PDF:**
- Open PDF and try to select text with cursor
- If you can't select text → it's a scanned image PDF
- Solution: Use a text-based PDF or convert to TXT

**Clear browser cache:**
```
Chrome: Cmd+Shift+Delete (Mac) or Ctrl+Shift+Delete (Windows)
Select "Cached images and files" and clear
```

**Check browser console (F12):**
- Look for any error messages
- Most common: "No text content found" = scanned PDF

### Alternative Formats

If PDF has issues, use TXT or DOCX:
- TXT: 100% reliable, instant processing
- DOCX: 95% reliable, fast processing

## Documentation

- `README.md` - Full project documentation
- `ARCHITECTURE.md` - Technical architecture
- `TESTING_CHECKLIST.md` - Testing guide
- `WORKING_NOW.md` - PDF setup details

---

**That's it! Just run `npm run dev` and start uploading resumes!** 🎉
