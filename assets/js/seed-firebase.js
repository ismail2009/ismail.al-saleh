import { db } from "./firebase-config.js";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

// ============================================================
// DEFAULT DATA — matches your current hardcoded content
// ============================================================
export const DEFAULT_DATA = {
  about: {
    subtitle:
      "I build fast, scalable, and revenue-generating web & mobile applications.",
    description:
      "Senior Frontend Developer with 5+ years specializing in the React ecosystem. I help businesses transform their ideas into pixel-perfect, high-performance applications that users love. From complex TypeScript migrations to deploying full-stack mobile apps, I deliver code that scales and solves real business problems.",
  },
  contact: {
    email: "ismail.1996.1.9@gmail.com",
    whatsapp: "https://wa.me/970592742081",
    calendly: "https://calendly.com/ismail-alsaleh/30min",
  },
};

// ============================================================
// SKILLS DATA
// ============================================================
const SKILLS = [
  {
    category: "Frontend",
    icon: "monitor",
    order: 1,
    tags: [
      "React.js",
      "React Native",
      "Next.js",
      "Redux",
      "Mobx-state-tree",
      "Material-UI",
      "HTML5",
      "CSS3",
    ],
  },
  {
    category: "Backend",
    icon: "server",
    order: 2,
    tags: ["Node.js", "FeathersJS", "RESTful APIs", "Socket.IO"],
  },
  {
    category: "Databases",
    icon: "database",
    order: 3,
    tags: ["PostgreSQL", "MongoDB", "Firebase Realtime DB"],
  },
  {
    category: "Cloud & DevOps",
    icon: "cloud",
    order: 4,
    tags: [
      "AWS Amplify",
      "Firebase Cloud Storage",
      "Git",
      "GitLab",
      "Bitbucket",
    ],
  },
  {
    category: "Tools & Libraries",
    icon: "wrench",
    order: 5,
    tags: ["TypeScript", "Stripe API", "Google Maps API", "One Signal", "Jira"],
  },
  {
    category: "Other",
    icon: "settings",
    order: 6,
    tags: [
      "Agile Development",
      "Unit Testing",
      "Debugging",
      "Performance Optimization",
    ],
  },
];

// ============================================================
// REVIEWS DATA
// ============================================================
const REVIEWS = [
  {
    name: "Ahmad T.",
    role: "Senior Project Manager",
    avatar: "assets/img/client-1.jpeg",
    text: "Not only that Ismail is a knowledgeable in several aspects of app development, but he is also a hard worker and a pleasant person to work with. I wish him the best of luck.",
    rating: 5,
    linkedinUrl:
      "https://www.linkedin.com/in/ismail-alsaleh/details/recommendations/",
    createdAt: new Date("2023-01-01"),
  },
];

// ============================================================
// PROJECTS DATA
// ============================================================
const PROJECTS = [
  {
    category: "Websites",
    title: "Geo Location Data Analysis",
    image: "assets/img/pro-1.png",
    challenge: "Visualizing complex, real-time geolocation data efficiently.",
    result: "An interactive web dashboard with advanced mapping capabilities.",
    techStack: ["React", "Mapbox API"],
    link: "https://geolocationdataanalysis-app.herokuapp.com/",
    createdAt: new Date("2021-01-01"),
  },
  {
    category: "Websites",
    title: "Hawas Studio",
    image: "assets/img/pro-2.png",
    challenge: "Streamlining administrative tasks for studios.",
    result:
      "A complete management dashboard reducing admin time significantly.",
    techStack: ["React", "Node.js"],
    link: "https://hawas-studio-app.herokuapp.com",
    createdAt: new Date("2021-06-01"),
  },
  {
    category: "Websites",
    title: "Global Dental Gateway",
    image: "assets/img/pro-3.png",
    challenge: "Fragmented patient data management for dental clinics.",
    result: "A centralized platform improving booking and patient tracking.",
    techStack: ["React", "TypeScript"],
    link: "https://globaldentelgatway.herokuapp.com/doctor",
    createdAt: new Date("2022-01-01"),
  },
  {
    category: "Websites",
    title: "MyPickle",
    image: "assets/img/pro-4.png",
    challenge: "Building a modern, fast web application from scratch.",
    result:
      "A fully functional web application built with modern technologies.",
    techStack: ["React", "Node.js"],
    link: "https://MyPickle.netlify.com",
    createdAt: new Date("2022-06-01"),
  },
  {
    category: "Websites",
    title: "Casting Arabia",
    image: "assets/img/casting-arabia.png",
    challenge: "Creating a professional casting platform for the Arab market.",
    result: "A fully-featured casting website connecting talent and agencies.",
    techStack: ["React", "TypeScript"],
    link: "https://www.castingarabia.com/",
    createdAt: new Date("2023-01-01"),
  },
  {
    category: "React Native Mobile Apps",
    title: "Plutoo",
    image: "assets/img/plutoo.png",
    challenge: "Delivering a high-performance cross-platform social app.",
    result: "Scaled successfully to thousands of active users on both stores.",
    techStack: ["React Native", "Redux"],
    link: "https://play.google.com/store/apps/details?id=com.plutoo.plutoo",
    createdAt: new Date("2021-09-01"),
  },
  {
    category: "React Native Mobile Apps",
    title: "Seetah",
    image: "assets/img/Seetah.png",
    challenge: "Building a reliable and smooth Android mobile application.",
    result: "A polished app successfully deployed on Google Play Store.",
    techStack: ["React Native", "Firebase"],
    link: "https://play.google.com/store/apps/details?id=com.seetah",
    createdAt: new Date("2022-03-01"),
  },
  {
    category: "React Native Mobile Apps",
    title: "Al Obaidi Brothers",
    image: "assets/img/obaidi.png",
    challenge: "Digitizing a car dealership's catalog for mobile users.",
    result: "A sleek car browsing app live on the App Store.",
    techStack: ["React Native", "REST API"],
    link: "https://apps.apple.com/tt/app/al-obaidi-brothers-for-cars/id1613332241",
    createdAt: new Date("2022-07-01"),
  },
  {
    category: "React Native Mobile Apps",
    title: "Casting Arabia App",
    image: "assets/img/casting-arabia.png",
    challenge: "Bringing the casting platform experience to mobile devices.",
    result:
      "A full-featured mobile app live on both Google Play and App Store.",
    techStack: ["React Native", "Redux"],
    link: "https://apps.apple.com/tt/app/casting-arabia/id1606692901",
    createdAt: new Date("2023-02-01"),
  },
  {
    category: "React Native Mobile Apps",
    title: "Ruh",
    image: "assets/img/ruh-logo.png",
    challenge: "Creating a meaningful and engaging Android experience.",
    result: "Successfully deployed on Google Play with active users.",
    techStack: ["React Native", "Firebase"],
    link: "https://play.google.com/store/apps/details?id=com.myruh&hl=en&pli=1",
    createdAt: new Date("2023-06-01"),
  },
];

// ============================================================
// SOCIAL LINKS DATA
// ============================================================
const SOCIALS = [
  {
    platform: "Facebook",
    url: "https://www.facebook.com/ismail.salah.2009/",
    order: 1,
  },
  { platform: "GitHub", url: "https://github.com/ismail2009/", order: 2 },
  {
    platform: "LinkedIn",
    url: "https://www.linkedin.com/in/ismail-alsaleh/",
    order: 3,
  },
  { platform: "GitLab", url: "https://gitlab.com/ismail2009", order: 4 },
  {
    platform: "HackerRank",
    url: "https://www.hackerrank.com/profile/ismail_AlSaleh",
    order: 5,
  },
  {
    platform: "CodeWars",
    url: "https://www.codewars.com/users/ismail_alsaleh",
    order: 6,
  },
  {
    platform: "freeCodeCamp",
    url: "https://www.freecodecamp.org/ismail_alsaleh",
    order: 7,
  },
];

// ============================================================
// SEED ALL — wipes and rebuilds every collection
// ============================================================
async function clearCollection(colName) {
  const snap = await getDocs(collection(db, colName));
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
}

export async function seedAll(statusEl) {
  const update = (msg) => {
    if (statusEl) statusEl.textContent = msg;
  };

  update("Seeding About & Contact settings...");
  await setDoc(doc(db, "settings", "about"), DEFAULT_DATA.about);
  await setDoc(doc(db, "settings", "contact"), DEFAULT_DATA.contact);

  update("Clearing & seeding Skills...");
  await clearCollection("skills");
  for (const s of SKILLS) await addDoc(collection(db, "skills"), s);

  update("Clearing & seeding Projects...");
  await clearCollection("projects");
  for (const p of PROJECTS) await addDoc(collection(db, "projects"), p);

  update("Clearing & seeding Reviews...");
  await clearCollection("reviews");
  for (const r of REVIEWS) await addDoc(collection(db, "reviews"), r);

  update("Clearing & seeding Social Links...");
  await clearCollection("socials");
  for (const s of SOCIALS) await addDoc(collection(db, "socials"), s);

  update(
    `✅ Done! Seeded ${SKILLS.length} skill categories, ${PROJECTS.length} projects, ${REVIEWS.length} reviews, ${SOCIALS.length} social links.`,
  );
}
