// PREMSNAPS — Sveltia CMS Content Loader

// Automatic copyright year
const year = document.getElementById("year");

if (year) {
  year.textContent = new Date().getFullYear();
}


// Mobile menu
const menu = document.querySelector(".menu");
const nav = document.querySelector(".nav nav");

if (menu && nav) {
  menu.addEventListener("click", () => {
    nav.style.display = nav.style.display === "flex" ? "none" : "flex";

    if (window.innerWidth <= 800 && nav.style.display === "flex") {
      nav.style.position = "absolute";
      nav.style.top = "70px";
      nav.style.left = "0";
      nav.style.right = "0";
      nav.style.padding = "22px 7vw";
      nav.style.background = "#f5f2ed";
      nav.style.flexDirection = "column";
      nav.style.alignItems = "flex-start";
    }
  });
}


// Escape HTML
function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// Read YAML front matter from Sveltia CMS
function parseCmsContent(markdown) {
  const match = markdown.match(/^---\s*([\s\S]*?)\s*---/);

  if (!match) {
    return {};
  }

  const frontMatter = match[1];
  const data = {};

  frontMatter.split("\n").forEach(line => {
    const match = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);

    if (match) {
      let value = match[2].trim();

      // Remove surrounding quotes if present
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      data[match[1]] = value;
    }
  });

  return data;
}


// Load website content from Sveltia CMS
async function loadCmsContent() {

  try {

    const response = await fetch("/content/pages/home.md", {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("CMS content could not be loaded");
    }

    const markdown = await response.text();
    const content = parseCmsContent(markdown);


    // Page title
    if (content.title) {
      document.title = `${content.title} | Wedding Photography & Films`;
    }


    // HERO
    const heroEyebrow = document.querySelector(".hero .eyebrow");
    const heroTitle = document.querySelector(".hero h1");
    const heroDescription = document.querySelector(".hero-copy");

    if (heroEyebrow && content.hero_eyebrow) {
      heroEyebrow.textContent = content.hero_eyebrow;
    }

    if (heroTitle && content.hero_title) {
      heroTitle.innerHTML =
        `${escapeHtml(content.hero_title)}<br>` +
        `<em>${escapeHtml(content.hero_title_highlight || "")}</em>`;
    }

    if (heroDescription && content.hero_description) {
      heroDescription.textContent = content.hero_description;
    }


    // INTRO
    const introSection = document.querySelector(".intro");
    const introTitle = introSection?.querySelector("h2");
    const introDescription = introSection?.querySelector("p");

    if (introTitle) {
      introTitle.innerHTML =
        `${escapeHtml(content.intro_title || "")}<br>` +
        `<em>${escapeHtml(content.intro_highlight || "")}</em>`;
    }

    if (introDescription && content.intro_description) {
      introDescription.textContent = content.intro_description;
    }


    // GALLERY
    const galleryLabel = document.querySelector(".gallery .section-label");

    if (galleryLabel && content.gallery_title) {
      galleryLabel.textContent = `02 — ${content.gallery_title}`;
    }


    // SERVICES
    const servicesLabel = document.querySelector(".services .section-label");

    if (servicesLabel && content.services_title) {
      servicesLabel.textContent = `03 — ${content.services_title}`;
    }


    // ABOUT
    const aboutSection = document.querySelector(".about");
    const aboutLabel = aboutSection?.querySelector(".section-label");
    const aboutDescription = aboutSection?.querySelector(".about-copy p");

    if (aboutLabel && content.about_title) {
      aboutLabel.textContent = `04 — ${content.about_title}`;
    }

    if (aboutDescription && content.about_description) {
      aboutDescription.textContent = content.about_description;
    }


    // CONTACT
    const contactSection = document.querySelector(".contact");
    const contactEyebrow = contactSection?.querySelector(".eyebrow");
    const contactTitle = contactSection?.querySelector("h2");
    const contactDescription = contactSection?.querySelector(
      ".contact-inner > p:not(.eyebrow):not(.small-note)"
    );
    const contactEmailButton = contactSection?.querySelector(
      'a[href^="mailto:"]'
    );

    if (contactEyebrow && content.contact_eyebrow) {
      contactEyebrow.textContent = content.contact_eyebrow;
    }

    if (contactTitle && content.contact_title) {
      contactTitle.textContent = content.contact_title;
    }

    if (contactDescription && content.contact_description) {
      contactDescription.textContent = content.contact_description;
    }

    if (contactEmailButton && content.contact_email) {
      contactEmailButton.href =
        `mailto:${content.contact_email}?subject=Wedding%20Photography%20Enquiry`;
    }

    // Hide the old developer note
    const smallNote = contactSection?.querySelector(".small-note");

    if (smallNote) {
      smallNote.style.display = "none";
    }


    console.log("PREMSNAPS CMS content loaded successfully.");

  } catch (error) {

    console.error("CMS content not loaded:", error);

  }

}


// Start CMS loader
loadCmsContent();
