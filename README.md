# Benjamin Lai - Portfolio Website

A clean, standalone portfolio website built with vanilla HTML, CSS, and JavaScript. This site features smooth scroll animations, responsive design, and zero external dependencies.

## ✨ Features

- **Zero Dependencies**: No frameworks, no CDN scripts, completely standalone
- **Smooth Animations**: Scroll-triggered animations using Intersection Observer API
- **Fully Responsive**: Optimized for desktop, tablet, and mobile devices
- **Accessible**: Keyboard navigation, ARIA labels, and reduced motion support
- **SEO Optimized**: Semantic HTML5, meta tags, and Open Graph support
- **Fast Loading**: Minimal, optimized code with no external dependencies

## 📁 File Structure

```
Portfolio/
├── index.html          # Main HTML file
├── styles.css          # All styles (organized in sections)
├── script.js           # Vanilla JavaScript for animations
├── images/             # Local image assets
│   ├── profile.jpg
│   ├── favicon.png
│   ├── framerit-logo.png
│   ├── framer-logo.png
│   ├── framerit-preview.jpg
│   ├── framer-preview.jpg
│   ├── contra-preview.jpg
│   └── framerit-icon.png
└── README.md           # This file
```

## 🚀 Getting Started

### Viewing the Site

Simply open `index.html` in any modern web browser:

```bash
# On macOS
open index.html

# On Linux
xdg-open index.html

# On Windows
start index.html
```

Or use a local development server:

```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js (with npx)
npx serve

# Then visit http://localhost:8000
```

### Deployment

This is a static website with no build process required. Simply upload all files to any static hosting service:

- **GitHub Pages**: Push to a repository and enable GitHub Pages
- **Netlify**: Drag and drop the folder to Netlify
- **Vercel**: Deploy with `vercel`
- **Any static host**: FTP/SFTP the files to your server

## 🎨 Customization

### Changing Content

#### Personal Information

Edit the hero section in `index.html` (lines 40-95):

```html
<h1 class="heading-primary">
    <span class="word">Hey,</span>
    <span class="word">I'm</span>
    <span class="word">Your</span>
    <span class="word">Name.</span>
</h1>
```

#### Social Links

Update the social links in `index.html` (lines 97-112):

```html
<a href="YOUR_TWITTER_URL" target="_blank" rel="noopener" aria-label="X (Twitter)" class="social-link">
    <!-- SVG icon -->
</a>
```

#### Venture Cards

Modify the venture cards in `index.html` (lines 127-196). Each card has:
- Logo image
- Title
- Description
- Visit site button
- Preview image

### Changing Styles

All styles are in `styles.css`, organized in sections:

1. **Reset & Base Styles** (lines 1-48)
2. **CSS Variables** (lines 50-84) - Change colors, fonts, spacing here
3. **Typography** (lines 86-125)
4. **Layout** (lines 127-138)
5. **Components** (lines 140-380) - Styles for each component
6. **Animations** (lines 382-488)
7. **Responsive Media Queries** (lines 490-560)

#### Color Customization

Edit CSS variables in `styles.css` (lines 52-60):

```css
:root {
    --color-black: #000;
    --color-white: #fff;
    --color-light-gray: #eee;
    --color-bg: #f9f9f9;
    --color-text-secondary: rgba(0, 0, 0, 0.6);
}
```

#### Typography

Change fonts in `index.html` (line 28) and `styles.css` (lines 62-64):

```html
<!-- In index.html -->
<link href="https://fonts.googleapis.com/css2?family=YourFont:wght@400;500;700&display=swap" rel="stylesheet">
```

```css
/* In styles.css */
:root {
    --font-primary: 'YourFont', sans-serif;
}
```

### Replacing Images

All images are in the `/images` directory. Replace them with your own:

1. **Profile Image** (`profile.jpg`): 512x512px recommended
2. **Logos** (`*-logo.png`): 100x100px minimum
3. **Preview Images** (`*-preview.jpg`): 1024x768px recommended
4. **Favicon** (`favicon.png`): 64x64px minimum

**Image Sources:**
- Use your own photos/screenshots
- Free stock photos: [Unsplash](https://unsplash.com), [Pexels](https://pexels.com)
- Icons: [Simple Icons](https://simpleicons.org/), [Heroicons](https://heroicons.com/)

## 🔧 How It Works

### Animations

The site uses the **Intersection Observer API** for scroll-triggered animations:

- **Profile Image**: Fades in and moves up (0.2s delay)
- **Social Icons**: Staggered fade-in (0.7s-0.9s delays)
- **Heading Words**: Staggered word-by-word reveal
- **Tabs Section**: Scales and fades in (1.2s delay)
- **Venture Cards**: Individual fade-in as they enter viewport
- **Floating Button**: Fades in after page load (1.5s delay)

All animations respect the `prefers-reduced-motion` media query for accessibility.

### Tab Navigation

The tabs section allows switching between different content views. Currently only shows "Ventures", but you can extend it:

1. Add new tab panels to `index.html`
2. Add data attributes to tab buttons: `data-tab="your-tab-name"`
3. Update `handleTabClick()` in `script.js` to show/hide panels

### Responsive Design

Three breakpoints are defined:

- **Mobile**: ≤ 809px
- **Tablet**: 810px - 1199px
- **Desktop**: ≥ 1200px

The tabs section is hidden on mobile, and cards stack vertically.

## ♿ Accessibility

- **Semantic HTML**: Proper heading hierarchy, landmarks
- **ARIA Labels**: All interactive elements have labels
- **Keyboard Navigation**: Full keyboard support for tabs and links
- **Reduced Motion**: Respects `prefers-reduced-motion` preference
- **Focus States**: Clear focus indicators for keyboard users
- **Alt Text**: All images have descriptive alt text

## 🌐 Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

**Required features:**
- CSS Grid & Flexbox
- CSS Custom Properties
- Intersection Observer API
- ES6+ JavaScript

## 📊 Performance

- **No external dependencies**: Loads instantly
- **Minimal CSS**: ~11KB
- **Minimal JavaScript**: ~9KB
- **Works offline**: All assets are local
- **GPU-accelerated animations**: Using `transform` and `opacity`

## 🐛 Troubleshooting

### Animations not working

- Check browser console for JavaScript errors
- Ensure `script.js` is loading correctly
- Verify Intersection Observer is supported (all modern browsers)

### Images not loading

- Check file paths are correct (case-sensitive on Linux/macOS)
- Ensure images exist in `/images` directory
- Verify image file extensions match HTML references

### Styles not applying

- Clear browser cache and hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Check `styles.css` is linking correctly in `index.html`
- Verify no syntax errors in CSS

## 📝 License

This is a personal portfolio website. Feel free to use the code structure as inspiration for your own portfolio, but please:

- Replace all personal information with your own
- Replace all images with your own assets
- Customize the design to make it unique

## 🤝 Contributing

This is a personal portfolio, but suggestions and improvements are welcome:

1. Report issues on the repository
2. Suggest improvements via pull requests
3. Share your own adaptations!

## 📧 Contact

- **Email**: contact@benjaminlai.com
- **Twitter**: [@samar_jamil7](https://x.com/samar_jamil7)
- **LinkedIn**: [samarjamil7](https://www.linkedin.com/in/samarjamil7/)

---

**Built with ❤️ using vanilla HTML, CSS, and JavaScript**

*Zero frameworks, zero dependencies, 100% standalone*
