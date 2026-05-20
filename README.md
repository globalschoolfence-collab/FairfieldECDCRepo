# Sunshine Daycare Website

A simple, professional website for a daycare center built with pure HTML, CSS, and JavaScript.

## Project Structure

```
daycare-website/
├── index.html              # Homepage
├── css/
│   └── styles.css          # Main stylesheet
├── js/
│   └── script.js           # JavaScript functionality
├── pages/
│   ├── about.html          # About Us page
│   ├── services.html       # Services & Programs page
│   ├── gallery.html        # Photo Gallery page
│   └── contact.html        # Contact page
└── images/                 # Folder for your images
```

## Features

- **Responsive Design** - Works on desktop, tablet, and mobile devices
- **Navigation Menu** - Easy navigation between all pages
- **Contact Form** - Simple form for inquiries
- **Modern Styling** - Clean, professional look with gradient colors
- **SEO Friendly** - Proper HTML structure for search engines

## Pages Included

1. **Homepage (index.html)** - Welcome section with key features
2. **About (about.html)** - Organization story and team information
3. **Services (services.html)** - Age groups, daily activities, and programs
4. **Gallery (gallery.html)** - Photo gallery placeholder
5. **Contact (contact.html)** - Contact form and information

## How to Use

1. Open `index.html` in your web browser
2. Click on navigation links to visit different pages
3. Fill out the contact form to test functionality

## Customization Tips

- **Colors**: Edit the gradient colors in `css/styles.css` (look for hex color codes like `#667eea`)
- **Content**: Replace "Sunshine Daycare" with your daycare name throughout the files
- **Images**: Add real photos to the `images/` folder and replace emoji placeholders
- **Contact Info**: Update address, phone, and email in `pages/contact.html`
- **Hours**: Modify hours in `pages/services.html` and `pages/contact.html`

## Adding Images

1. Place image files in the `images/` folder
2. Update the gallery items in `pages/gallery.html`:
   ```html
   <div class="gallery-item">
       <img src="../images/your-image.jpg" alt="Description">
   </div>
   ```

3. Update CSS for the gallery items to display images properly

## No Build Process Required

This is a simple static website - just open the HTML files in a browser. No npm, no build tools needed!

## Local Email Backend (Optional)

A Node.js backend has been added for secure email delivery from the contact and careers forms. To use it:

1. Copy `.env.example` to `.env`
2. Fill in your SMTP settings
3. Install dependencies with `npm install`
4. Start the server with `npm start`

The backend serves the form endpoints at `/api/contact` and `/api/careers`.

## Next Steps

- Replace placeholder content with your actual daycare information
- Add real photos to the gallery
- Deploy to a web hosting service (GitHub Pages, Netlify, or any web host)
