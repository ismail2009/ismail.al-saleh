# Dynamic Portfolio CMS

A fully dynamic, high-performance portfolio website built with Vanilla JavaScript, HTML, CSS, and Firebase Firestore. This architecture allows you to update your entire portfolio instantly via a secure admin dashboard—without having to modify any code or redeploy.

## ✨ Key Features
- **Headless CMS Architecture**: All data (About, Contact, Skills, Projects, Reviews, Socials) is decoupled from the frontend and fetched asynchronously.
- **Zero-Cost Hosting**: Uses Firebase Auth & Firestore (generous free tier) and Google Drive instead of Firebase Storage for CV management to eliminate storage costs.
- **Dynamic Coding Profiles**: Custom SVG injection system perfectly renders complex icons (HackerRank, CodeWars, LeetCode) not supported by standard font libraries.
- **Professional Animations**: Implements Intersection Observers for smooth, scroll-triggered reveal animations.
- **Google Drive CV Integration**: Generates optimized download links and embedded iframe previews from a standard Google Drive share link.

## 📂 Project Structure
```text
.
├── assets/
│   ├── css/
│   │   └── styles.css          # Main styling, design system, and animations
│   ├── js/
│   │   ├── admin.js            # Dashboard CRUD logic & Auth
│   │   ├── script.js           # Public site dynamic loaders & observer logic
│   │   ├── firebase-config.js  # Firebase SDK initialization
│   │   └── seed-firebase.js    # Default data & wipe/reseed utility
│   ├── img/                    # Project screenshots and avatars
│   ├── font-awesome/           # Local font-awesome 4.7 library
│   └── docs/                   # (Optional) local documents
├── admin.html                  # Secure CMS dashboard UI
└── index.html                  # Public portfolio UI
```

## 🚀 Running Locally

1. **Clone the repository.**
2. **Start a local development server** (ES Modules require HTTP, do not open files directly):
   ```bash
   npx serve . --listen 3000
   ```
3. **View Public Site**: Open `http://localhost:3000`
4. **View Admin Dashboard**: Open `http://localhost:3000/admin.html`

## 🛠 Admin Dashboard & Seeding

The admin dashboard requires you to log in with your Firebase Auth credentials. 
Once logged in, you can add, edit, or delete items across all sections of your site.

### Seed Database Utility
If your Firestore database is ever wiped, you can rebuild it instantly using the built-in seed utility:
1. Go to the **⚡ Seed** tab in the admin dashboard.
2. Click **Seed Everything to Firebase**.
3. The script (`assets/js/seed-firebase.js`) will automatically wipe existing collections and repopulate them with your default data.

## 📦 Deployment
Because the frontend is static (HTML/CSS/JS), it can be deployed for free on **GitHub Pages**, **Vercel**, or **Netlify**.
Whenever you update content in your `/admin.html` dashboard, the live public site will update automatically on the next page load—no new deployments required!

## 🔐 Security Notes
- The Firebase SDK configuration (`firebase-config.js`) contains public API keys. This is standard and safe for client-side Firebase apps.
- Security is handled via **Firestore Security Rules** in the Firebase Console, which restrict write access to authenticated users only.
