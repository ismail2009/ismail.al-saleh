import { auth, db } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  updateDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { seedAll, DEFAULT_DATA } from "./seed-firebase.js";

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

// ==================== TAB NAVIGATION ====================
document.querySelectorAll(".admin-nav button[data-tab]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".admin-nav button")
      .forEach((b) => b.classList.remove("active"));
    document
      .querySelectorAll(".tab-panel")
      .forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

// ==================== AUTH ====================
const loginSection = document.getElementById("loginSection");
const dashboardSection = document.getElementById("dashboardSection");

onAuthStateChanged(auth, (user) => {
  if (user) {
    loginSection.classList.add("hidden");
    dashboardSection.classList.remove("hidden");
    loadAllData();
  } else {
    loginSection.classList.remove("hidden");
    dashboardSection.classList.add("hidden");
  }
});

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    await signInWithEmailAndPassword(
      auth,
      document.getElementById("loginEmail").value,
      document.getElementById("loginPassword").value,
    );
  } catch (err) {
    document.getElementById("loginError").textContent = err.message;
  }
});

document
  .getElementById("logoutBtn")
  .addEventListener("click", () => signOut(auth));

// ==================== LOAD ALL DATA ====================
async function loadAllData() {
  loadAbout();
  loadContact();
  loadSkills();
  loadProjects();
  loadReviews();
  loadSocials();
}

// ==================== ABOUT ====================
async function loadAbout() {
  try {
    const snap = await getDoc(doc(db, "settings", "about"));
    const data = snap.exists() ? snap.data() : DEFAULT_DATA.about;
    document.getElementById("aboutSubtitle").value = data.subtitle || "";
    document.getElementById("aboutDescription").value = data.description || "";
    // Pre-fill CV link if one is already saved
    if (data.cvUrl) {
      document.getElementById("cvUrl").value = data.cvDriveShare || "";
      showCvPreview(data.cvUrl, data.cvPreviewUrl);
    }
  } catch (e) {
    console.error(e);
  }
}

// ==================== CV — GOOGLE DRIVE ====================

// Extracts the file ID from any Google Drive share URL
function extractDriveId(url) {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

function showCvPreview(downloadUrl, previewUrl) {
  const wrap = document.getElementById("cvPreview");
  if (!wrap) return;
  document.getElementById("cvDownloadPreview").href = downloadUrl;
  document.getElementById("cvDownloadPreview").textContent = downloadUrl;
  document.getElementById("cvPreviewLink").href = previewUrl || downloadUrl;
  document.getElementById("cvPreviewLink").textContent =
    previewUrl || downloadUrl;
  wrap.style.display = "block";
}

// Live preview as the user types/pastes
document.getElementById("cvUrl").addEventListener("input", (e) => {
  const id = extractDriveId(e.target.value);
  if (id) {
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${id}`;
    const previewUrl = `https://drive.google.com/file/d/${id}/preview`;
    showCvPreview(downloadUrl, previewUrl);
  } else {
    const wrap = document.getElementById("cvPreview");
    if (wrap) wrap.style.display = "none";
  }
});

// Save to Firestore on submit
document.getElementById("cvUrlForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const shareUrl = document.getElementById("cvUrl").value.trim();
  const id = extractDriveId(shareUrl);

  let cvUrl, cvPreviewUrl;
  if (id) {
    cvUrl = `https://drive.google.com/uc?export=download&id=${id}`;
    cvPreviewUrl = `https://drive.google.com/file/d/${id}/preview`;
  } else {
    // Fallback: use the URL as-is if it's not a Drive link
    cvUrl = shareUrl;
    cvPreviewUrl = shareUrl;
  }

  // Merge into existing about doc so we don't overwrite subtitle/description
  const snap = await getDoc(doc(db, "settings", "about"));
  const existing = snap.exists() ? snap.data() : {};
  await setDoc(doc(db, "settings", "about"), {
    ...existing,
    cvDriveShare: shareUrl,
    cvUrl,
    cvPreviewUrl,
  });
  flash("cvUrlSuccess");
});

document.getElementById("aboutForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  await setDoc(doc(db, "settings", "about"), {
    subtitle: document.getElementById("aboutSubtitle").value,
    description: document.getElementById("aboutDescription").value,
  });
  flash("aboutSuccess");
});

// ==================== CONTACT ====================
async function loadContact() {
  try {
    const snap = await getDoc(doc(db, "settings", "contact"));
    const data = snap.exists() ? snap.data() : DEFAULT_DATA.contact;
    document.getElementById("contactEmail").value = data.email || "";
    document.getElementById("contactWhatsapp").value = data.whatsapp || "";
    document.getElementById("contactCalendly").value = data.calendly || "";
  } catch (e) {
    console.error(e);
  }
}

document.getElementById("contactForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  await setDoc(doc(db, "settings", "contact"), {
    email: document.getElementById("contactEmail").value,
    whatsapp: document.getElementById("contactWhatsapp").value,
    calendly: document.getElementById("contactCalendly").value,
  });
  flash("contactSuccess");
});

// ==================== SKILLS ====================
async function loadSkills() {
  const list = document.getElementById("skillList");
  list.innerHTML = "";
  try {
    const q = query(collection(db, "skills"), orderBy("order"));
    const snap = await getDocs(q);
    snap.forEach((d) => {
      const skill = d.data();
      const div = document.createElement("div");
      div.className = "list-item";
      div.innerHTML = `
                <div>
                    <strong>${escapeHTML(skill.category)}</strong>
                    <span style="display:block;">${escapeHTML((skill.tags || []).join(", "))}</span>
                </div>
                <div>
                    <button class="btn btn-secondary edit-btn" style="padding:0.25rem 0.5rem;font-size:0.75rem" data-id="${d.id}" data-item='${JSON.stringify(skill).replace(/'/g, "&#39;")}'>Edit</button>
                    <button class="danger-btn" data-id="${d.id}" data-col="skills">Delete</button>
                </div>`;
      list.appendChild(div);
    });
    attachDeleteListeners(list, loadSkills);
    attachEditListeners(list, {
      formId: "skillForm",
      editIdInput: "editSkillId",
      submitBtn: "submitSkillBtn",
      cancelBtn: "cancelSkillEditBtn",
      entityName: "Skill Category",
      fields: {
        category: "skillCategory",
        icon: "skillIcon",
        tags: "skillTags",
        order: "skillOrder",
      },
    });
  } catch (e) {
    console.error(e);
  }
}

document.getElementById("skillForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const editId = document.getElementById("editSkillId").value;
  const data = {
    category: document.getElementById("skillCategory").value,
    icon: document.getElementById("skillIcon").value,
    tags: document
      .getElementById("skillTags")
      .value.split(",")
      .map((t) => t.trim()),
    order: parseInt(document.getElementById("skillOrder").value) || 99,
  };

  if (editId) {
    await updateDoc(doc(db, "skills", editId), data);
    document.getElementById("cancelSkillEditBtn").click();
  } else {
    await addDoc(collection(db, "skills"), data);
    e.target.reset();
  }
  loadSkills();
});

// ==================== PROJECTS ====================
async function loadProjects() {
  const list = document.getElementById("adminProjectsList");
  list.innerHTML = "";
  try {
    const q = query(collection(db, "projects"), orderBy("createdAt"));
    const snap = await getDocs(q);
    snap.forEach((d) => {
      const proj = d.data();
      const div = document.createElement("div");
      div.className = "list-item";
      div.innerHTML = `
                <div>
                    <strong>${escapeHTML(proj.title)}</strong>
                    <span>${escapeHTML(proj.category)}</span>
                </div>
                <div>
                    <button class="btn btn-secondary edit-btn" style="padding:0.25rem 0.5rem;font-size:0.75rem" data-id="${d.id}" data-item='${JSON.stringify(proj).replace(/'/g, "&#39;")}'>Edit</button>
                    <button class="danger-btn" data-id="${d.id}" data-col="projects">Delete</button>
                </div>`;
      list.appendChild(div);
    });
    attachDeleteListeners(list, loadProjects);
    attachEditListeners(list, {
      formId: "projectForm",
      editIdInput: "editProjectId",
      submitBtn: "submitProjectBtn",
      cancelBtn: "cancelProjectEditBtn",
      entityName: "Project",
      fields: {
        title: "projTitle",
        image: "projImage",
        challenge: "projChallenge",
        result: "projResult",
        techStack: "projTech",
        link: "projLink",
        category: "projCategory",
      },
    });
  } catch (e) {
    console.error(e);
  }
}

document.getElementById("projectForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const editId = document.getElementById("editProjectId").value;
  const data = {
    title: document.getElementById("projTitle").value,
    image: document.getElementById("projImage").value,
    challenge: document.getElementById("projChallenge").value,
    result: document.getElementById("projResult").value,
    techStack: document
      .getElementById("projTech")
      .value.split(",")
      .map((t) => t.trim()),
    link: document.getElementById("projLink").value,
    category: document.getElementById("projCategory").value,
  };

  if (editId) {
    await updateDoc(doc(db, "projects", editId), data);
    document.getElementById("cancelProjectEditBtn").click();
  } else {
    data.createdAt = new Date();
    await addDoc(collection(db, "projects"), data);
    e.target.reset();
  }
  loadProjects();
});

// ==================== REVIEWS ====================
async function loadReviews() {
  const list = document.getElementById("reviewList");
  list.innerHTML = "";
  try {
    const snap = await getDocs(collection(db, "reviews"));
    snap.forEach((d) => {
      const r = d.data();
      const div = document.createElement("div");
      div.className = "list-item";
      div.innerHTML = `
                <div>
                    <strong>${escapeHTML(r.name)}</strong>
                    <span>${escapeHTML(r.role)} · ${"⭐".repeat(r.rating || 5)}</span>
                </div>
                <div>
                    <button class="btn btn-secondary edit-btn" style="padding:0.25rem 0.5rem;font-size:0.75rem" data-id="${d.id}" data-item='${JSON.stringify(r).replace(/'/g, "&#39;")}'>Edit</button>
                    <button class="danger-btn" data-id="${d.id}" data-col="reviews">Delete</button>
                </div>`;
      list.appendChild(div);
    });
    attachDeleteListeners(list, loadReviews);
    attachEditListeners(list, {
      formId: "reviewForm",
      editIdInput: "editReviewId",
      submitBtn: "submitReviewBtn",
      cancelBtn: "cancelReviewEditBtn",
      entityName: "Review",
      fields: {
        name: "reviewName",
        role: "reviewRole",
        avatar: "reviewAvatar",
        text: "reviewText",
        rating: "reviewRating",
        linkedinUrl: "reviewLinkedin",
      },
    });
  } catch (e) {
    console.error(e);
  }
}

document.getElementById("reviewForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const editId = document.getElementById("editReviewId").value;
  const data = {
    name: document.getElementById("reviewName").value,
    role: document.getElementById("reviewRole").value,
    avatar: document.getElementById("reviewAvatar").value,
    text: document.getElementById("reviewText").value,
    rating: parseInt(document.getElementById("reviewRating").value),
    linkedinUrl: document.getElementById("reviewLinkedin").value,
  };

  if (editId) {
    await updateDoc(doc(db, "reviews", editId), data);
    document.getElementById("cancelReviewEditBtn").click();
  } else {
    data.createdAt = new Date();
    await addDoc(collection(db, "reviews"), data);
    e.target.reset();
  }
  loadReviews();
});

// ==================== SOCIAL LINKS ====================
async function loadSocials() {
  const list = document.getElementById("socialList");
  if (!list) return;
  list.innerHTML = "";
  try {
    const q = query(collection(db, "socials"), orderBy("order"));
    const snap = await getDocs(q);
    snap.forEach((d) => {
      const s = d.data();
      const div = document.createElement("div");
      div.className = "list-item";
      div.innerHTML = `
                <div>
                    <strong>${escapeHTML(s.platform)}</strong>
                    <span>${escapeHTML(s.url)}</span>
                </div>
                <div>
                    <button class="btn btn-secondary edit-btn" style="padding:0.25rem 0.5rem;font-size:0.75rem" data-id="${d.id}" data-item='${JSON.stringify(s).replace(/'/g, "&#39;")}'>Edit</button>
                    <button class="danger-btn" data-id="${d.id}" data-col="socials">Delete</button>
                </div>`;
      list.appendChild(div);
    });
    attachDeleteListeners(list, loadSocials);
    attachEditListeners(list, {
      formId: "socialForm",
      editIdInput: "editSocialId",
      submitBtn: "submitSocialBtn",
      cancelBtn: "cancelSocialEditBtn",
      entityName: "Link",
      fields: {
        platform: "socialPlatform",
        url: "socialUrl",
        order: "socialOrder",
      },
    });
  } catch (e) {
    console.error(e);
  }
}

document.getElementById("socialForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const editId = document.getElementById("editSocialId").value;
  const data = {
    platform: document.getElementById("socialPlatform").value,
    url: document.getElementById("socialUrl").value,
    order: parseInt(document.getElementById("socialOrder").value) || 99,
  };

  if (editId) {
    await updateDoc(doc(db, "socials", editId), data);
    document.getElementById("cancelSocialEditBtn").click();
  } else {
    await addDoc(collection(db, "socials"), data);
    e.target.reset();
    document.getElementById("socialOrder").value = 1;
  }
  loadSocials();
});

// ==================== SEED ====================
document.getElementById("seedBtn").addEventListener("click", async () => {
  const statusEl = document.getElementById("seedStatus");
  const btn = document.getElementById("seedBtn");
  btn.disabled = true;
  await seedAll(statusEl);
  btn.disabled = false;
  loadAllData();
});

// ==================== UTILS ====================
function flash(id) {
  const el = document.getElementById(id);
  el.style.display = "inline";
  setTimeout(() => (el.style.display = "none"), 3000);
}

function attachDeleteListeners(container, reloadFn) {
  container.querySelectorAll(".danger-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (confirm("Delete this item?")) {
        await deleteDoc(doc(db, btn.dataset.col, btn.dataset.id));
        reloadFn();
      }
    });
  });
}

function attachEditListeners(container, config) {
  container.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = JSON.parse(btn.dataset.item);
      const id = btn.dataset.id;

      // Populate fields
      for (const [key, fieldId] of Object.entries(config.fields)) {
        const el = document.getElementById(fieldId);
        if (el) {
          if (Array.isArray(item[key])) {
            el.value = item[key].join(", ");
          } else {
            el.value = item[key] || "";
          }
        }
      }

      // Set hidden ID
      document.getElementById(config.editIdInput).value = id;

      // Switch buttons to Edit Mode
      document.getElementById(config.submitBtn).textContent =
        "Update " + config.entityName;
      const cancelBtn = document.getElementById(config.cancelBtn);
      cancelBtn.style.display = "inline-block";

      // Scroll to form smoothly
      document
        .getElementById(config.submitBtn)
        .scrollIntoView({ behavior: "smooth", block: "center" });

      // Cancel logic
      cancelBtn.onclick = () => {
        document.getElementById(config.formId).reset();
        document.getElementById(config.editIdInput).value = "";
        document.getElementById(config.submitBtn).textContent =
          "Add " + config.entityName;
        cancelBtn.style.display = "none";
      };
    });
  });
}
