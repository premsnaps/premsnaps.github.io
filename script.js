// PREMSNAPS — Sveltia CMS Content Loader

// Automatic copyright year
const year = document.getElementById("year");
if (year) {
  year.textContent = new Date().getFullYear();
}

// Mobile menu
const menu = document.querySelector(".menu");
const nav = document.querySelector("nav");

if (menu && nav) {
  menu.addEventListener("click", () => {
    nav.style.display = nav.style.display === "flex" ? "none" : "flex";

    if (window.innerWidth <= 800 && nav.style.display === "flex") {
      nav.style.position = "absolute";
      nav.style.top = "70px";
      nav.style.left = "0";
      nav.style.right = "0";
      nav.style.padding = "22px";
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

    // Load directly from GitHub.
    // This avoids problems caused by the custom domain cache.
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

    // ----------------------------------------------
    // Read YAML front matter
    // ----------------------------------------------

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


    // ----------------------------------------------
    // Helper
    // ----------------------------------------------

    function setText(selector, value) {

      if (!value) return;

      const element = document.querySelector(selector);

      if (element) {
        element.textContent = value;
      }
    }


    // ----------------------------------------------
    // HERO
    // ----------------------------------------------

    setText(".hero-eyebrow", data.hero_eyebrow);
    setText(".hero-title", data.hero_title);
    setText(".hero-title-highlight", data.hero_title_highlight);
    setText(".hero-copy", data.hero_description);


    // ----------------------------------------------
    // INTRO
    // ----------------------------------------------

    setText(".intro-section h2", data.intro_title);
    setText(".intro-section p", data.intro_description);


    // ----------------------------------------------
    // GALLERY
    // ----------------------------------------------

    setText("#work .section-label", data.gallery_title);


    // ----------------------------------------------
    // SERVICES
    // ----------------------------------------------

    setText("#services .section-label", data.services_title);


    // ----------------------------------------------
    // ABOUT
    // ----------------------------------------------

    setText("#about .section-label", data.about_title);
    setText("#about .about-copy p", data.about_description);


    // ----------------------------------------------
    // CONTACT
    // ----------------------------------------------

    setText("#contact .eyebrow", data.contact_eyebrow);
    setText("#contact h2", data.contact_title);
    setText("#contact .contact-copy p", data.contact_description);


    // Contact email
    if (data.contact_email) {

      const emailLinks = document.querySelectorAll(
        '#contact a[href^="mailto:"]'
      );

      emailLinks.forEach(link => {

        link.href = "mailto:" + data.contact_email;

        // Only replace visible email text,
        // not the button label.
        if (
          link.textContent.includes("@") ||
          link.textContent.includes("hello")
        ) {
          link.textContent = data.contact_email;
        }

      });
    }


    console.log("PREMSNAPS CMS content applied successfully.");

  } catch (error) {

    console.error(
      "PREMSNAPS CMS content could not be loaded:",
      error
    );

  }
}


// Run after page loads
loadCMSContent();
