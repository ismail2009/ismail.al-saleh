import { db } from "./firebase-config.js";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

// ============================================================
// FIREBASE: Load ALL dynamic content from Firestore
// ============================================================

// Utility to prevent XSS when using innerHTML
function escapeHTML(str) {
  if (str === null || str === undefined) return "";
  if (typeof str !== "string") str = String(str);
  return str.replace(
    /[&<>'"]/g,
    (tag) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[tag] || tag,
  );
}

// --- ABOUT ---
async function loadAboutSection() {
  try {
    const snap = await getDoc(doc(db, "settings", "about"));
    if (snap.exists()) {
      const d = snap.data();
      const subtitle = document.getElementById("hero-subtitle");
      const desc = document.getElementById("hero-description");
      if (subtitle && d.subtitle) subtitle.textContent = d.subtitle;
      if (desc && d.description) desc.textContent = d.description;

      // Update Download CV button
      if (d.cvUrl) {
        const dlBtn = document.getElementById("cv-download-btn");
        if (dlBtn) dlBtn.href = d.cvUrl;
      }

      // Show "View CV" button and hook up modal when preview URL exists
      if (d.cvPreviewUrl) {
        const previewBtn = document.getElementById("cv-preview-btn");
        if (previewBtn) {
          previewBtn.style.display = "inline-flex";
          previewBtn.addEventListener("click", () =>
            openCvModal(d.cvPreviewUrl, d.cvUrl),
          );
        }
      }
    }
  } catch (err) {
    console.warn("About unavailable:", err);
  }
}

// --- CV MODAL ---
function openCvModal(previewUrl, downloadUrl) {
  const modal = document.getElementById("cv-modal");
  const iframe = document.getElementById("cv-modal-iframe");
  const dlLink = document.getElementById("cv-modal-download");
  if (!modal || !iframe) return;

  iframe.src = previewUrl;
  if (dlLink && downloadUrl) dlLink.href = downloadUrl;

  modal.style.display = "flex";
  // Small delay so display:flex renders before the CSS transition fires
  requestAnimationFrame(() => modal.classList.add("open"));
  document.body.style.overflow = "hidden";
}

function closeCvModal() {
  const modal = document.getElementById("cv-modal");
  const iframe = document.getElementById("cv-modal-iframe");
  if (!modal) return;
  modal.classList.remove("open");
  // Wait for CSS transition to finish before hiding
  setTimeout(() => {
    modal.style.display = "none";
    if (iframe) iframe.src = "";
  }, 300);
  document.body.style.overflow = "";
}

// Close button
document
  .getElementById("cv-modal-close")
  ?.addEventListener("click", closeCvModal);

// Click outside modal content to close
document.getElementById("cv-modal")?.addEventListener("click", (e) => {
  if (e.target === document.getElementById("cv-modal")) closeCvModal();
});

// Escape key to close
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeCvModal();
});

// --- CONTACT ---
async function loadContactSection() {
  try {
    const snap = await getDoc(doc(db, "settings", "contact"));
    if (snap.exists()) {
      const d = snap.data();
      const emailEl = document.getElementById("contact-email");
      const whatsappEl = document.getElementById("contact-whatsapp");
      if (emailEl && d.email)
        emailEl.innerHTML = `<a href="mailto:${escapeHTML(d.email)}">${escapeHTML(d.email)}</a>`;
      if (whatsappEl && d.whatsapp) {
        whatsappEl.innerHTML = `<a href="${escapeHTML(d.whatsapp)}" target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a>`;
      }
      // Update Calendly buttons
      if (d.calendly) {
        document
          .querySelectorAll('a[href*="calendly.com"]')
          .forEach((a) => (a.href = d.calendly));
      }
    }
  } catch (err) {
    console.warn("Contact unavailable:", err);
  }
}

// --- SKILLS ---
async function loadSkillsSection() {
  const grid = document.getElementById("skills-grid");
  if (!grid) return;
  try {
    const q = query(collection(db, "skills"), orderBy("order"));
    const snap = await getDocs(q);
    if (snap.empty) return;
    grid.innerHTML = "";
    snap.forEach((d) => {
      const skill = d.data();
      const tags = (skill.tags || [])
        .map((t) => `<span class="skill-tag">${escapeHTML(t)}</span>`)
        .join("");
      grid.innerHTML += `
                <div class="skill-category">
                    <h3 class="category-title">
                        <i data-lucide="${escapeHTML(skill.icon || "code")}"></i>
                        ${escapeHTML(skill.category)}
                    </h3>
                    <div class="skill-tags">${tags}</div>
                </div>`;
    });
    lucide.createIcons(); // Re-run for dynamically added icons
  } catch (err) {
    console.warn("Skills unavailable:", err);
  }
}

// --- PROJECTS ---
function buildProjectCard(proj) {
  const tags = (proj.techStack || [])
    .map((t) => `<span class="tech-tag">${escapeHTML(t)}</span>`)
    .join("");
  return `
        <div class="project-card">
            <div class="project-image">
                <a href="${escapeHTML(proj.link || "#")}" target="_blank" rel="noopener noreferrer">
                    <img src="${escapeHTML(proj.image)}" alt="${escapeHTML(proj.title)}" />
                </a>
            </div>
            <div class="project-header"><h3>${escapeHTML(proj.title)}</h3></div>
            <p style="text-align:left;font-size:0.875rem;margin-bottom:1rem;">
                <strong>Challenge:</strong> ${escapeHTML(proj.challenge)}<br>
                <strong>Result:</strong> ${escapeHTML(proj.result)}
            </p>
            <div class="tech-stack" style="margin-bottom:1rem;">${tags}</div>
            <div class="project-links">
                <a href="${escapeHTML(proj.link || "#")}" target="_blank" rel="noopener noreferrer" class="project-link">View Project</a>
            </div>
        </div>`;
}

async function loadProjects() {
  const websitesGrid = document.getElementById("projects-websites-grid");
  const mobileGrid = document.getElementById("projects-mobile-grid");
  try {
    const q = query(collection(db, "projects"), orderBy("createdAt"));
    const snap = await getDocs(q);
    if (snap.empty) return;
    if (websitesGrid) websitesGrid.innerHTML = "";
    if (mobileGrid) mobileGrid.innerHTML = "";
    snap.forEach((d) => {
      const proj = d.data();
      const card = buildProjectCard(proj);
      if (proj.category === "Websites" && websitesGrid)
        websitesGrid.innerHTML += card;
      else if (mobileGrid) mobileGrid.innerHTML += card;
    });
  } catch (err) {
    console.warn("Projects unavailable:", err);
  }
}

// --- REVIEWS ---
async function loadReviewsSection() {
  const grid = document.getElementById("reviews-grid");
  if (!grid) return;
  try {
    const snap = await getDocs(collection(db, "reviews"));
    if (snap.empty) return;
    grid.innerHTML = "";
    snap.forEach((d) => {
      const r = d.data();
      const stars = "".padStart(r.rating || 5, "★").padEnd(5, "☆");
      const linkedinBtn = r.linkedinUrl
        ? `<a href="${escapeHTML(r.linkedinUrl)}" target="_blank" rel="noopener noreferrer" class="review-linkedin" title="View on LinkedIn">
                       <i class="fa fa-linkedin-square"></i>
                   </a>`
        : "";
      grid.innerHTML += `
                <div class="review-card">
                    <div class="review-header">
                        <div class="review-meta">
                            <div class="review-avatar">
                                <img src="${escapeHTML(r.avatar || "assets/img/client-1.jpeg")}" alt="${escapeHTML(r.name)}" />
                            </div>
                            <div class="review-meta-text">
                                <h4>${escapeHTML(r.name)}</h4>
                                <span>${escapeHTML(r.role)}</span>
                            </div>
                        </div>
                        ${linkedinBtn}
                    </div>
                    <div class="review-ratings" style="color:#f59e0b;letter-spacing:2px;">${stars}</div>
                    <div class="review-text"><p>"${escapeHTML(r.text)}"</p></div>
                </div>`;
    });
  } catch (err) {
    console.warn("Reviews unavailable:", err);
  }
}

// --- SOCIAL LINKS ---
const SOCIAL_ICONS = {
  LinkedIn: { class: "fa fa-linkedin" },
  GitHub: { class: "fa fa-github" },
  GitLab: { class: "fa fa-gitlab" },
  Facebook: { class: "fa fa-facebook" },
  Twitter: { class: "fa fa-twitter" },
  Instagram: { class: "fa fa-instagram" },
  YouTube: { class: "fa fa-youtube-play" },
  Website: { class: "fa fa-globe" },
  freeCodeCamp: { class: "fa fa-free-code-camp" },
  HackerRank: {
    svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="1em" height="1em"><title>HackerRank</title><path d="M11.983 0a12.016 12.016 0 00-11.98 12.019A12.016 12.016 0 0011.984 24a12.016 12.016 0 0011.98-12.019A12.016 12.016 0 0011.983 0zM12.4 17.5h-2.8v-4.1H6.8v4.1H4V6.5h2.8v4h2.8v-4h2.8v4.1h2.8v-4.1h2.8v11h-2.8v-4.1h-2.8v4.1z"/></svg>',
  },
  CodeWars: {
    svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="1em" height="1em"><title>Codewars</title><path d="M10.985 3.327a.936.936 0 0 0-.416.142l-6.735 4.316a.94.94 0 0 0-.276.32L.113 14.887a.938.938 0 0 0 .151.874l6.198 8.1c.141.185.39.261.6.17l5.228-2.261v-2.023l-3.921 1.696-5.234-6.84 2.87-5.599 5.093-3.262 5.092 3.262 2.87 5.599-5.234 6.84-3.92 1.696v2.022l5.227 2.262c.211.092.46.015.6-.17l6.198-8.1a.936.936 0 0 0 .151-.873L18.636 8.106a.938.938 0 0 0-.276-.32l-6.735-4.316a.932.932 0 0 0-.64-.143zM10.985 7.641a.938.938 0 0 0-.416.14l-3.328 2.133a.944.944 0 0 0-.276.321L5.27 13.567a.936.936 0 0 0 .15.875l3.228 4.218c.142.185.391.261.601.17l1.737-.751v-2.023l-.43.186-2.196-2.87 1.258-2.456 2.366-1.516 2.367 1.516 1.258 2.456-2.196 2.87-.43-.186v2.023l1.737.75c.21.092.46.016.601-.169l3.228-4.218a.936.936 0 0 0 .15-.875l-1.695-3.332a.935.935 0 0 0-.276-.32l-3.328-2.134a.93.93 0 0 0-.64-.143zM10.985 11.954a.937.937 0 0 0-.416.14l-.307.198a.938.938 0 0 0-.276.32l-.565 1.112a.937.937 0 0 0 .15.874l.582.76c.142.185.391.261.601.171l.23-.1v-2.024l-.161.071-.059-.078.204-.399.117-.075.117.075.204.399-.059.078-.16.071v2.023l.23.1c.21.09.46.014.601-.17l.582-.76a.937.937 0 0 0 .15-.875l-.565-1.111a.94.94 0 0 0-.276-.321l-.307-.197a.932.932 0 0 0-.64-.143z"/></svg>',
  },
  LeetCode: {
    svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="1em" height="1em"><title>LeetCode</title><path d="M16.102 17.93l-2.697 2.607c-.466.467-1.111.662-1.823.662s-1.357-.195-1.824-.662l-4.332-4.363c-.467-.467-.7-.946-.7-1.502s.233-1.035.7-1.502l6.23-6.079c.14-.14.33-.216.541-.216s.402.076.542.216l2.362 2.362c.14.14.216.33.216.542s-.076.402-.216.541l-4.382 4.275c-.14.14-.33.216-.541.216s-.402-.076-.542-.216l-1.02-1.02c-.14-.14-.216-.33-.216-.542s.076-.402.216-.541l2.541-2.481c.14-.14.33-.216.541-.216s.402.076.541.216l.462.462c.14.14.216.33.216.542s-.076.402-.216.541l-3.543 3.456c-.14.14-.33.216-.542.216s-.402-.076-.541-.216l1.96-1.91c.14-.14.33-.216.542-.216s.402.076.541.216l3.542 3.456c.14.14.216.33.216.542s-.076.402-.216.541zM20.25 10.603l-2.362-2.362c-.14-.14-.33-.216-.542-.216s-.402.076-.541.216l-6.23 6.079c-.467.467-1.112.662-1.824.662s-1.357-.195-1.824-.662l-1.02-1.02c-.467-.467-.7-.946-.7-1.502s.233-1.035.7-1.502l4.333-4.363c.466-.467 1.111-.662 1.823-.662s1.357.195 1.824.662l2.697 2.607c.467.467.7.946.7 1.502s-.233 1.035-.7 1.502z"/></svg>',
  },
};

async function loadSocialLinks() {
  const container = document.getElementById("dynamic-social-links");
  if (!container) return;
  try {
    const q = query(collection(db, "socials"), orderBy("order"));
    const snap = await getDocs(q);

    if (snap.empty) return;

    container.innerHTML = "";
    snap.forEach((d) => {
      const s = d.data();
      const iconData = SOCIAL_ICONS[s.platform] || SOCIAL_ICONS["Website"];

      const a = document.createElement("a");
      a.href = s.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.ariaLabel = s.platform;
      a.title = s.platform + " Profile";

      if (iconData.svg) {
        a.innerHTML = iconData.svg;
        // Make the SVG match the FontAwesome styling
        const svgElement = a.querySelector("svg");
        if (svgElement) {
          svgElement.style.fontSize = "1.5rem";
          svgElement.style.verticalAlign = "middle";
        }
      } else {
        a.innerHTML = `<i class="${escapeHTML(iconData.class)}"></i>`;
      }

      container.appendChild(a);
    });
  } catch (err) {
    console.warn("Socials unavailable:", err);
  }
}

// --- RUN ALL LOADERS ---
async function initializeApp() {
  await Promise.all([
    loadAboutSection(),
    loadContactSection(),
    loadSkillsSection(),
    loadProjects(),
    loadReviewsSection(),
    loadSocialLinks(),
  ]);

  // Initialize static icons first
  lucide.createIcons();

  // Now that dynamic content is in the DOM, observe it for scroll reveal
  if (typeof observeNewElements === "function") {
    observeNewElements();
  }
}

initializeApp();

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      const offsetTop = target.offsetTop - 80; // Account for fixed navbar
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  });
});

// Navbar background on scroll
window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar");
  if (window.scrollY > 100) {
    navbar.style.background = "rgba(255, 255, 255, 0.98)";
    navbar.style.boxShadow = "0 2px 20px rgba(0, 0, 0, 0.1)";
  } else {
    navbar.style.background = "rgba(255, 255, 255, 0.95)";
    navbar.style.boxShadow = "none";
  }
});

// Contact form handling
document.getElementById("contactForm").addEventListener("submit", function (e) {
  e.preventDefault();

  // Get form data
  const formData = new FormData(this);
  const name = formData.get("name");
  const email = formData.get("email");
  const subject = formData.get("subject");
  const message = formData.get("message");

  // Basic validation
  if (!name || !email || !subject || !message) {
    showNotification("Please fill in all fields", "error");
    return;
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showNotification("Please enter a valid email address", "error");
    return;
  }

  // Simulate form submission
  const submitButton = this.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  submitButton.textContent = "Sending...";
  submitButton.disabled = true;

  // Simulate API call
  setTimeout(() => {
    showNotification(
      "Thank you for your message! I'll get back to you soon.",
      "success",
    );
    this.reset();
    submitButton.textContent = originalText;
    submitButton.disabled = false;
  }, 2000);
});

// Notification system
function showNotification(message, type = "info") {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll(".notification");
  existingNotifications.forEach((notification) => notification.remove());

  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;

  // Add styles
  notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === "success" ? "#10B981" : type === "error" ? "#EF4444" : "#0057FF"};
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1001;
        max-width: 400px;
        transform: translateX(100%);
        transition: transform 0.3s ease-out;
    `;

  const content = notification.querySelector(".notification-content");
  content.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
    `;

  const closeButton = notification.querySelector(".notification-close");
  closeButton.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

  // Add to page
  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.style.transform = "translateX(0)";
  }, 100);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 300);
    }
  }, 5000);
}

// ============================================================
// SCROLL REVEAL — observes .reveal and .reveal-stagger elements
// ============================================================
const scrollObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        scrollObserver.unobserve(entry.target); // fire once
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
);

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".reveal, .reveal-stagger").forEach((el) => {
    scrollObserver.observe(el);
  });
});

// Also observe dynamically added elements (skills/projects loaded from Firestore)
function observeNewElements() {
  document
    .querySelectorAll(
      ".reveal:not(.is-visible), .reveal-stagger:not(.is-visible)",
    )
    .forEach((el) => {
      scrollObserver.observe(el);
    });
}

// Typing animation for hero title
function typeWriter(element, text, speed = 100) {
  let i = 0;
  element.innerHTML = "";

  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }

  type();
}

// Initialize typing animation
document.addEventListener("DOMContentLoaded", () => {
  const heroTitle = document.querySelector(".hero-title");
  if (heroTitle) {
    const originalText = heroTitle.textContent;
    setTimeout(() => {
      typeWriter(heroTitle, originalText, 80);
    }, 500);
  }
});

// Skill tags hover effects
document.addEventListener("DOMContentLoaded", () => {
  const skillTags = document.querySelectorAll(".skill-tag");

  skillTags.forEach((tag) => {
    tag.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-2px) scale(1.05)";
    });

    tag.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0) scale(1)";
    });
  });
});

// Timeline items counter animation
function animateCounter(element, target, duration = 2000) {
  let start = 0;
  const increment = target / (duration / 16);

  function updateCounter() {
    start += increment;
    if (start < target) {
      element.textContent = Math.floor(start);
      requestAnimationFrame(updateCounter);
    } else {
      element.textContent = target;
    }
  }

  updateCounter();
}

// Add scroll progress indicator
function createScrollProgress() {
  const progressBar = document.createElement("div");
  progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, #0057FF, #004AD8);
        z-index: 1002;
        transition: width 0.3s ease;
    `;
  document.body.appendChild(progressBar);

  window.addEventListener("scroll", () => {
    const scrolled =
      (window.scrollY /
        (document.documentElement.scrollHeight - window.innerHeight)) *
      100;
    progressBar.style.width = Math.min(scrolled, 100) + "%";
  });
}

// Initialize scroll progress
document.addEventListener("DOMContentLoaded", createScrollProgress);

// Mobile menu toggle
let mobileMenuBtn = null;

function createMobileMenu() {
  const navbar = document.querySelector(".navbar .container");
  const navLinks = document.querySelector(".nav-links");

  if (!mobileMenuBtn) {
    mobileMenuBtn = document.createElement("button");
    mobileMenuBtn.innerHTML = "☰";
    mobileMenuBtn.className = "mobile-menu-btn";
    mobileMenuBtn.style.cssText = `
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: var(--text-primary);
            display: none;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            z-index: 1001;
        `;

    mobileMenuBtn.setAttribute("aria-label", "Toggle mobile menu");
    mobileMenuBtn.setAttribute("aria-expanded", "false");

    const closeMenu = () => {
      navLinks.style.display = "none";
      mobileMenuBtn.innerHTML = "☰";
      mobileMenuBtn.setAttribute("aria-expanded", "false");
    };

    const openMenu = () => {
      navLinks.style.display = "flex";
      navLinks.style.flexDirection = "column";
      navLinks.style.position = "absolute";
      navLinks.style.top = "100%";
      navLinks.style.left = "0";
      navLinks.style.right = "0";
      navLinks.style.background = "rgba(255, 255, 255, 0.98)";
      navLinks.style.padding = "16px";
      navLinks.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
      navLinks.style.borderTop = "1px solid var(--border)";
      mobileMenuBtn.innerHTML = "✕";
      mobileMenuBtn.setAttribute("aria-expanded", "true");
    };

    mobileMenuBtn.addEventListener("click", () => {
      if (navLinks.style.display === "flex") {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close menu when clicking a link
    const links = navLinks.querySelectorAll("a");
    links.forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 768) {
          closeMenu();
        }
      });
    });

    const navRight = document.querySelector(".nav-right") || navbar;
    navRight.appendChild(mobileMenuBtn);
  }

  if (window.innerWidth <= 768) {
    mobileMenuBtn.style.display = "flex";
  } else {
    mobileMenuBtn.style.display = "none";
    // Reset styles for desktop
    navLinks.style.display = "";
    navLinks.style.flexDirection = "";
    navLinks.style.position = "";
    navLinks.style.top = "";
    navLinks.style.left = "";
    navLinks.style.right = "";
    navLinks.style.background = "";
    navLinks.style.padding = "";
    navLinks.style.boxShadow = "";
    navLinks.style.borderTop = "";
    mobileMenuBtn.innerHTML = "☰";
  }
}

// Initialize mobile menu on load and resize
document.addEventListener("DOMContentLoaded", createMobileMenu);
window.addEventListener("resize", createMobileMenu);

// Add loading animation
window.addEventListener("load", () => {
  document.body.style.opacity = "0";
  document.body.style.transition = "opacity 0.5s ease-in-out";

  setTimeout(() => {
    document.body.style.opacity = "1";
  }, 100);
});

// Add hover effects for cards
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(
    ".timeline-content, .project-card, .skill-category",
  );

  cards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-8px)";
      this.style.boxShadow = "0 12px 32px rgba(0, 87, 255, 0.15)";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)";
      this.style.boxShadow = "0 4px 12px rgba(17, 24, 39, 0.06)";
    });
  });
});

// Add click to copy email functionality
document.addEventListener("DOMContentLoaded", () => {
  const emailElements = document.querySelectorAll(
    ".contact-item span, .contact-detail span",
  );

  emailElements.forEach((element) => {
    if (element.textContent.includes("@")) {
      element.style.cursor = "pointer";
      element.title = "Click to copy email";

      element.addEventListener("click", () => {
        navigator.clipboard.writeText(element.textContent).then(() => {
          showNotification("Email copied to clipboard!", "success");
        });
      });
    }
  });
});

// Performance optimization: Lazy load images (if any are added later)
document.addEventListener("DOMContentLoaded", () => {
  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove("lazy");
          imageObserver.unobserve(img);
        }
      });
    });

    document.querySelectorAll("img[data-src]").forEach((img) => {
      imageObserver.observe(img);
    });
  }
});

// Add form field focus effects
document.addEventListener("DOMContentLoaded", () => {
  const formFields = document.querySelectorAll("input, textarea");

  formFields.forEach((field) => {
    field.addEventListener("focus", function () {
      this.parentElement.style.transform = "scale(1.02)";
    });

    field.addEventListener("blur", function () {
      this.parentElement.style.transform = "scale(1)";
    });
  });
});

console.log("Portfolio website loaded successfully! 🚀");
