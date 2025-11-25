# Favicon Generation Guide

## Current Setup

✅ **Logo file**: `logo.png` - Your original logo file
✅ **Web App Manifest**: `site.webmanifest` - PWA configuration  
✅ **Generation Script**: `../scripts/generate-favicons.js` - Automatic favicon generator

## Required Favicon Files

The following favicon files need to be generated from your logo.png:

- `favicon.ico` (32x32) - Main favicon for browsers
- `favicon-16x16.png` - Small browser icon  
- `favicon-32x32.png` - Standard browser icon
- `apple-touch-icon.png` (180x180) - iOS home screen icon
- `android-chrome-192x192.png` - Android app icon (small)
- `android-chrome-512x512.png` - Android app icon (large)

## How to Generate Favicons

### Option 1: Automatic Generation (Recommended)
```bash
# Install dependencies (if not already installed)
npm install

# Run the favicon generation script
npm run generate-favicons
```

### Option 2: Use the Setup Script
```bash
# Windows
setup-icons.bat

# This will install dependencies and generate all favicons automatically
```

### Option 3: Manual Generation
If the automatic script doesn't work, you can:

1. Use an online favicon generator like [favicon.io](https://favicon.io/) 
2. Upload your `logo.png` file
3. Download the generated favicon package
4. Replace the files in this directory

## What's Already Configured

✅ **HTML Head Tags**: All favicon references are already added to `app/layout.tsx`
✅ **PWA Manifest**: Site manifest is configured for mobile app installation
✅ **Brand Integration**: Logo is used in the navigation bar
✅ **Theme Colors**: Deep blue primary color (#2563eb) is set as theme color

## Verification

After generating favicons, you can verify they work by:

1. **Browser Tab**: Check if favicon appears in browser tab
2. **Bookmarks**: Favicon should appear when bookmarking the site  
3. **Mobile**: On mobile, you should be able to "Add to Home Screen"
4. **PWA**: The site should be installable as a Progressive Web App

## Troubleshooting

**Script fails?**
- Make sure `logo.png` exists in the `public/` directory
- Check that Node.js and npm are installed
- Verify Sharp package is installed: `npm list sharp`

**Favicons not showing?**
- Clear browser cache (Ctrl+F5)
- Check browser developer tools for 404 errors
- Ensure all favicon files exist in `public/` directory

**PWA not installing?**
- Check that `site.webmanifest` is accessible at `/site.webmanifest`
- Verify HTTPS is enabled (required for PWA)
- Check browser console for manifest errors
