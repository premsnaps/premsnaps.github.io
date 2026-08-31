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

// Load website content from Sveltia CMS
async function loadCMSContent() {
  try {
    const response = await fetch("/content/pages/home.md", {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("CMS content could not be loaded");
    }

    const markdown = await response.text();

    // Remove YAML front matter
    const content = markdown
      .replace(/^---[\s\S]*?---\s*/, "")
      .trim();

    const lines = content
      .split("\n")
      .map(line => line.trim())
      .filter(Boolean);

    // Find the main heading
    const heading = lines.find(line => line.startsWith("# "));

    // Find normal text paragraphs
    const paragraphs = lines.filter(line =>
      !line.startsWith("#") &&
      !line.startsWith("---")
    );

    // Update the intro section without changing the design
    const introSection = document.querySelector(".intro-section");

    if (introSection && heading) {
      const h2 = introSection.querySelector("h2");

      if (h2) {
        h2.textContent = heading.replace(/^# /, "");
      }
    }

    // Update intro paragraph if CMS has one
    if (introSection && paragraphs.length > 0) {
      const paragraph = introSection.querySelector("p");

      if (paragraph) {
        paragraph.textContent = paragraphs[0];
      }
    }

    console.log("Sveltia CMS content loaded successfully.");
  } catch (error) {
    console.log("CMS content not loaded:", error.message);
  }
}

loadCMSContent();
