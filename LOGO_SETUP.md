# 🎨 Logo Setup Instructions

## Adding Your Logo

To use your logo image in the Ravens TimeSheet application:

### 1. Prepare Your Logo Image
- **Format**: PNG, JPG, or SVG (PNG recommended for best quality)
- **Size**: Recommended 280px × 80px or similar aspect ratio
- **Background**: Transparent or white background works best
- **File Name**: `ravens-logo.png`

### 2. Add the Logo File
1. Copy your logo image file
2. Paste it into the `public/` folder
3. Rename it to `ravens-logo.png` (if not already named)

### 3. Verify Placement
Your logo will now appear in:
- ✅ **Homepage** - Replaces the big "RAVENS" button
- ✅ **All Page Headers** - Shows in the top-left corner during timesheet processing
- ✅ **Folders Page** - Above the "Saved Folders" title
- ✅ **Job Management Page** - Above the "Job Management Dashboard" title  
- ✅ **Attendance Page** - Above the "Employee Attendance" title

### 4. Fallback System
If the logo image fails to load, the application will automatically show the original "RAVENS" text button as a fallback.

### 5. Logo Styling
The logo is automatically:
- **Resized** to fit the design (max 280px × 80px)
- **Centered** in all locations
- **Styled** with subtle shadows and hover effects
- **Responsive** for different screen sizes

## File Structure
```
ravenstimesheet/
├── public/
│   └── ravens-logo.png  ← Add your logo here
├── src/
│   ├── App.jsx          ← Logo in main header
│   ├── components/
│   │   ├── WelcomeScreen.jsx    ← Logo on homepage
│   │   ├── FoldersView.jsx      ← Logo in folders page
│   │   ├── JobManagement.jsx    ← Logo in job management
│   │   └── Attendance.jsx       ← Logo in attendance page
│   └── App.css          ← Logo styling
```

## Troubleshooting

### Logo Not Showing
1. Check that the file is named exactly `ravens-logo.png`
2. Verify it's in the `public/` folder
3. Check browser console for any errors
4. The fallback "RAVENS" text should appear if image fails

### Logo Too Big/Small
- The logo automatically resizes to fit
- For best results, use an image around 280px × 80px
- The aspect ratio will be maintained

### Logo Looks Blurry
- Use a higher resolution image (2x or 3x the display size)
- PNG format provides better quality than JPG
- Ensure the original image is clear and sharp

## Customization

If you want to adjust the logo styling, you can modify the CSS in `src/App.css`:

```css
.ravens-logo-image {
  max-width: 280px;    /* Adjust maximum width */
  max-height: 80px;    /* Adjust maximum height */
  /* Other styling properties */
}
```

---

✅ **Your logo is now integrated throughout the application!**

The logo will appear consistently across all pages while maintaining the existing design and functionality. 