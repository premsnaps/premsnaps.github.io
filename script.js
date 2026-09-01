// PREMSNAPS — Google Drive Gallery Test
const DRIVE_API_KEY = "AIzaSyBYk83Ua9JRRmV_oPwl89I6O74EXflH9sw";
const DRIVE_FOLDER_ID = "1GhS35bFfeKQNENi81UcZ4WgX-vh2TlNe";

async function testDriveGallery() {
  try {
    const params = new URLSearchParams({
      q: `'${DRIVE_FOLDER_ID}' in parents and trashed = false`,
      fields: "files(id,name,mimeType,thumbnailLink,webContentLink,modifiedTime)",
      pageSize: "100",
      key: DRIVE_API_KEY
    });

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`Google Drive API error: ${response.status}`);
    }

    const data = await response.json();

    console.log("PREMSNAPS DRIVE FILES:", data.files);

  } catch (error) {
    console.error("PREMSNAPS DRIVE ERROR:", error);
  }
}

testDriveGallery();
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


// --------------------------------------------------
// SVELTIA CMS LOADER
// --------------------------------------------------

async function loadCMSContent() {

  try {

    const cmsURL =
      "https://raw.githubusercontent.com/premsnaps/premsnaps.github.io/main/content/pages/home.md?cb=" +
      Date.now();

    const response = await fetch(cmsURL, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("CMS file could not be loaded");
    }

    const markdown = await response.text();

    console.log("PREMSNAPS CMS file loaded.");

    // -----------------------------------------------
    // Read YAML front matter
    // -----------------------------------------------

    const match = markdown.match(/^---\s*([\s\S]*?)\s*---/);

    if (!match) {
      console.error("CMS YAML front matter not found.");
      return;
    }

    const yaml = match[1];

    const data = {};

    yaml.split("\n").forEach(line => {

      const separator = line.indexOf(":");

      if (separator === -1) return;

      const key = line
        .slice(0, separator)
        .trim();

      let value = line
        .slice(separator + 1)
        .trim();

      // Remove surrounding quotes
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      data[key] = value;
    });


    // -----------------------------------------------
    // Helper
    // -----------------------------------------------

    function setText(selector, value) {

      if (!value) return;

      const element = document.querySelector(selector);

      if (element) {
        element.textContent = value;
      }

    }


    // -----------------------------------------------
    // HERO
    // -----------------------------------------------

    setText(
      ".hero .eyebrow",
      data.hero_eyebrow
    );

    const heroTitle = document.querySelector(".hero-content h1");

    if (heroTitle) {

      const title = data.hero_title || "";
      const highlight = data.hero_title_highlight || "";

      heroTitle.innerHTML =
        escapeHTML(title) +
        "<br><em>" +
        escapeHTML(highlight) +
        "</em>";

    }

    setText(
      ".hero-copy",
      data.hero_description
    );


    // -----------------------------------------------
    // INTRO
    // -----------------------------------------------

    const introTitle = document.querySelector(".intro h2");

    if (introTitle && data.intro_title && data.intro_highlight) {

      introTitle.innerHTML =
        escapeHTML(data.intro_title) +
        " <em>" +
        escapeHTML(data.intro_highlight) +
        "</em>";

    }

    setText(
      ".intro p",
      data.intro_description
    );


    // -----------------------------------------------
    // GALLERY
    // -----------------------------------------------

    setText(
      ".gallery .section-label",
      data.gallery_title
    );


    // -----------------------------------------------
    // SERVICES
    // -----------------------------------------------

    setText(
      ".services .section-label",
      data.services_title
    );


    // -----------------------------------------------
    // ABOUT
    // -----------------------------------------------

    setText(
      ".about .section-label",
      data.about_title
    );

    setText(
      ".about .about-copy p",
      data.about_description
    );


    // -----------------------------------------------
    // CONTACT
    // -----------------------------------------------

    setText(
      ".contact .eyebrow",
      data.contact_eyebrow
    );

    setText(
      ".contact h2",
      data.contact_title
    );

    setText(
      ".contact-inner > p:not(.eyebrow):not(.small-note)",
      data.contact_description
    );


    // -----------------------------------------------
    // CONTACT EMAIL
    // -----------------------------------------------

    if (data.contact_email) {

      const emailLinks =
        document.querySelectorAll(
          'a[href^="mailto:"]'
        );

      emailLinks.forEach(link => {

        link.href =
          "mailto:" + data.contact_email;

        if (
          link.textContent.includes("@") ||
          link.textContent.toLowerCase().includes("hello")
        ) {
          link.textContent =
            data.contact_email;
        }

      });

    }


    console.log(
      "PREMSNAPS CMS content applied successfully."
    );

  }

  catch (error) {

    console.error(
      "PREMSNAPS CMS content could not be loaded:",
      error
    );

  }

}


// -----------------------------------------------
// HTML escape helper
// -----------------------------------------------

function escapeHTML(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


// Run after page loads
loadCMSContent();
