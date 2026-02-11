# 🚀 Somantha Manuranga's Portfolio Website - Complete Guide

## 📋 What You Have

**Hey Somantha!** 👋 Your portfolio website is ready and fully customized with all your information from your CV!

A complete, modern portfolio website featuring:
- ✅ Your actual work experience (KNSI Aviation, Ceylon Biscuits)
- ✅ Your education (Master's in AI at OTH Amberg-Weiden, Bachelor's in Mechanical Engineering)
- ✅ All your technical skills (PyTorch, Computer Vision, NLP, MongoDB, etc.)
- ✅ Your 6 amazing projects (Quantum Circuit Classification, Drag Prediction CNN, Hospital Digital Twin, etc.)
- ✅ Your interests (Football at FC Amberg, Languages, Industry 4.0)
- ✅ Your real contact info and LinkedIn/GitHub links
- ✅ Responsive design (works on all devices)
- ✅ Smooth animations and professional dark theme

## 📁 Files Structure

```
portfolio/
│
├── index.html          # Main HTML file (structure)
├── styles.css          # All styling (design)
├── script.js           # JavaScript (interactivity)
└── README.md          # This guide
```

## 🎯 How to Use This Portfolio

### Step 1: Add Your Photo (Most Important!)

**Everything else is already done!** Your CV information is already in the website. The main thing you need to do is add your professional photo.

#### How to add your photo:

1. Save your professional headshot photo in the same folder as `index.html`
2. Name it `profile.jpg` (or `profile.png`)
3. In `index.html`, find this code (around line 58):
```html
<div class="image-placeholder">
    <i class="fas fa-user"></i>
</div>
```

4. Replace it with:
```html
<img src="profile.jpg" alt="Somantha Manuranga" style="width: 350px; height: 350px; border-radius: 50%; object-fit: cover; box-shadow: 0 20px 60px rgba(59, 130, 246, 0.3);">
```

**That's it!** Your website is ready to go live.

### Step 2: Optional Customizations

Your content is already perfect! But if you want to make changes:

#### Want to update a project?
- Find the `<div class="project-card">` section in `index.html`
- Each project has a title, description, and tags
- Just edit the text directly

#### Want to add a new skill?
- In the Skills section, copy one `<div class="skill-item">` block
- Change the icon and skill name

#### Want to change colors?

In `styles.css` (lines 11-21), you can change the color scheme:

```css
:root {
    --primary-color: #3b82f6;      /* Main blue - change this */
    --secondary-color: #8b5cf6;    /* Purple accent - change this */
    --dark-bg: #0f172a;            /* Background color */
    --text-primary: #f1f5f9;       /* Main text color */
}
```

**Popular color combinations:**
- Green tech: `--primary-color: #10b981; --secondary-color: #059669;`
- Orange energy: `--primary-color: #f59e0b; --secondary-color: #d97706;`
- Red bold: `--primary-color: #ef4444; --secondary-color: #dc2626;`

## 🌐 How to Launch Your Website (Choose One - All FREE!)

### Option 1: GitHub Pages (FREE & RECOMMENDED)

1. **Create a GitHub account** at https://github.com
2. **Create a new repository** called `your-username.github.io`
3. **Upload your files:**
   - Click "uploading an existing file"
   - Drag `index.html`, `styles.css`, and `script.js`
   - Click "Commit changes"
4. **Your site is live at:** `https://your-username.github.io`

### Option 2: Netlify (FREE)

1. Go to https://netlify.com
2. Drag and drop your portfolio folder
3. Your site is live instantly!
4. You get a free URL like: `your-site-name.netlify.app`

### Option 3: Vercel (FREE)

1. Go to https://vercel.com
2. Import your GitHub repository or upload files
3. Deploy with one click
4. Free custom domain support

## 🎨 Customization Tips

### Add More Sections

To add a new section, use this template in `index.html`:

```html
<section id="new-section" class="new-section">
    <div class="container">
        <h2 class="section-title">New Section Title</h2>
        <p class="section-subtitle">Section description</p>
        
        <!-- Your content here -->
        
    </div>
</section>
```

Then add styling in `styles.css`:

```css
.new-section {
    padding: 100px 0;
    background: var(--light-bg); /* or var(--dark-bg) */
}
```

### Change Fonts

Add to the `<head>` section in `index.html`:

```html
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap" rel="stylesheet">
```

Then in `styles.css` (line 30), change:

```css
font-family: 'Poppins', sans-serif;
```

### Add Company Logos

1. Save logo images in your folder (e.g., `company-logo.png`)
2. Replace the icon in timeline items:

```html
<div class="company-logo">
    <img src="company-logo.png" alt="Company" style="width: 60px; height: 60px; object-fit: contain;">
</div>
```

## 📱 Testing Your Site

1. **Open `index.html` in your browser** - Just double-click the file
2. **Test responsiveness:**
   - Press F12 to open developer tools
   - Click the device icon to see mobile view
3. **Check all links work**
4. **Test on different browsers** (Chrome, Firefox, Safari)

## 🐛 Common Issues & Fixes

### Issue: Page looks broken
**Fix:** Make sure all three files (HTML, CSS, JS) are in the same folder

### Issue: Animations not working
**Fix:** Check that `script.js` is properly linked in `index.html` (line 495)

### Issue: Icons not showing
**Fix:** You need internet connection for Font Awesome icons to load

### Issue: Colors look weird
**Fix:** Check the CSS color variables in `styles.css`

## 🚀 Next Steps

1. **Add a blog section** - Share your thoughts
2. **Add testimonials** - Get recommendations from colleagues
3. **Add a contact form** - Let people reach you easily
4. **Add Google Analytics** - Track visitors
5. **SEO optimization** - Add meta tags for better search ranking

## 📝 Quick Checklist for Somantha

- [x] Changed name and title in hero section ✅ (Done!)
- [x] Updated all job experiences ✅ (Done!)
- [x] Added education details ✅ (Done!)
- [x] Listed all relevant skills ✅ (Done!)
- [x] Showcased best projects ✅ (Done!)
- [x] Added contact information ✅ (Done!)
- [x] Linked social media profiles ✅ (Done!)
- [ ] Add personal photo (Just need to do this!)
- [ ] Test on mobile
- [ ] Deploy to web hosting

## 💡 Tips for Success

1. **Keep it updated** - Regularly add new projects and experiences
2. **Be specific** - Use numbers and metrics in your experience
3. **Show personality** - The "Beyond Work" section makes you memorable
4. **Proofread** - Check for typos and grammar
5. **Get feedback** - Ask friends to review before publishing

## 🆘 Need Help?

If you get stuck:
1. Check the browser console (F12) for errors
2. Validate your HTML at https://validator.w3.org
3. Search for tutorials on YouTube: "HTML CSS portfolio tutorial"
4. Join web dev communities on Reddit or Discord

## 📄 License

Feel free to use this template for your personal portfolio!

---

**Good luck with your portfolio! 🎉**

Remember: Your portfolio is never "finished" - keep improving it as you grow!
