/* =========================================================
   PREMSNAPS
   CMS + RECURSIVE GOOGLE DRIVE GALLERY
   ========================================================= */


/* =========================================================
   GOOGLE DRIVE SETTINGS
   ========================================================= */

const DRIVE_API_KEY = "AIzaSyBYk83Ua9JRRmV_oPwl89I6O74EXflH9sw";

const DRIVE_ROOT_FOLDER_ID =
  "1GhS35bFfeKQNENi81UcZ4WgX-vh2TlNe";


/* =========================================================
   AUTOMATIC YEAR
   ========================================================= */

const year = document.getElementById("year");

if (year) {
  year.textContent = new Date().getFullYear();
}


/* =========================================================
   MOBILE MENU
   ========================================================= */

const menu = document.querySelector(".menu");
const nav = document.querySelector(".nav nav");

if (menu && nav) {

  menu.addEventListener("click", () => {

    nav.style.display =
      nav.style.display === "flex"
        ? "none"
        : "flex";

    if (
      window.innerWidth <= 800 &&
      nav.style.display === "flex"
    ) {

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


/* =========================================================
   SVELTIA CMS
   ========================================================= */

async function loadCMSContent() {

  try {

    const cmsURL =
      "https://raw.githubusercontent.com/premsnaps/premsnaps.github.io/main/content/pages/home.md?cb=" +
      Date.now();

    const response =
      await fetch(cmsURL, {
        cache: "no-store"
      });

    if (!response.ok) {
      throw new Error("CMS file could not be loaded");
    }

    const markdown =
      await response.text();

    console.log(
      "PREMSNAPS CMS file loaded."
    );


    const match =
      markdown.match(/^---\s*([\s\S]*?)\s*---/);

    if (!match) {
      console.error(
        "CMS YAML front matter not found."
      );
      return;
    }


    const yaml =
      match[1];

    const data = {};


    yaml.split("\n").forEach(line => {

      const separator =
        line.indexOf(":");

      if (separator === -1) return;

      const key =
        line.slice(0, separator).trim();

      let value =
        line.slice(separator + 1).trim();


      if (
        (value.startsWith('"') &&
         value.endsWith('"')) ||
        (value.startsWith("'") &&
         value.endsWith("'"))
      ) {

        value =
          value.slice(1, -1);

      }


      data[key] = value;

    });


    function setText(selector, value) {

      if (!value) return;

      const element =
        document.querySelector(selector);

      if (element) {
        element.textContent = value;
      }

    }


    /* HERO */

    setText(
      ".hero .eyebrow",
      data.hero_eyebrow
    );


    const heroTitle =
      document.querySelector(
        ".hero-content h1"
      );


    if (heroTitle) {

      const title =
        data.hero_title || "";

      const highlight =
        data.hero_title_highlight || "";


      if (highlight) {

        heroTitle.innerHTML =
          escapeHTML(title) +
          "<br><em>" +
          escapeHTML(highlight) +
          "</em>";

      } else {

        heroTitle.textContent =
          title;

      }

    }


    setText(
      ".hero-copy",
      data.hero_description
    );


    /* INTRO */

    const introTitle =
      document.querySelector(
        ".intro h2"
      );


    if (
      introTitle &&
      data.intro_title &&
      data.intro_highlight
    ) {

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


    /* GALLERY */

    setText(
      ".gallery .section-label",
      data.gallery_title
    );


    /* SERVICES */

    setText(
      ".services .section-label",
      data.services_title
    );


    /* ABOUT */

    setText(
      ".about .section-label",
      data.about_title
    );


    setText(
      ".about .about-copy p",
      data.about_description
    );


    /* CONTACT */

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


    /* EMAIL */

    if (data.contact_email) {

      const emailLinks =
        document.querySelectorAll(
          'a[href^="mailto:"]'
        );


      emailLinks.forEach(link => {

        link.href =
          "mailto:" +
          data.contact_email;


        if (
          link.textContent.includes("@") ||
          link.textContent
            .toLowerCase()
            .includes("hello")
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


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHTML(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* =========================================================
   GOOGLE DRIVE API
   ========================================================= */

async function getDriveChildren(folderId) {

  let files = [];
  let pageToken = "";


  do {

    const params =
      new URLSearchParams({

        q:
          `'${folderId}' in parents and trashed = false`,

        pageSize: "1000",

        fields:
          "nextPageToken,files(id,name,mimeType,createdTime,modifiedTime)",

        orderBy:
          "createdTime desc",

        key:
          DRIVE_API_KEY

      });


    if (pageToken) {
      params.set(
        "pageToken",
        pageToken
      );
    }


    const response =
      await fetch(
        "https://www.googleapis.com/drive/v3/files?" +
        params.toString()
      );


    if (!response.ok) {

      throw new Error(
        "Google Drive API error: " +
        response.status
      );

    }


    const data =
      await response.json();


    if (data.files) {

      files =
        files.concat(data.files);

    }


    pageToken =
      data.nextPageToken || "";


  } while (pageToken);


  return files;

}


/* =========================================================
   RECURSIVE FOLDER SCANNER
   ========================================================= */

async function getAllDriveMedia() {

  const media = [];

  const foldersToScan = [
    DRIVE_ROOT_FOLDER_ID
  ];


  while (foldersToScan.length > 0) {

    const currentFolder =
      foldersToScan.shift();


    const children =
      await getDriveChildren(
        currentFolder
      );


    children.forEach(file => {

      /* FOLDER */

      if (
        file.mimeType ===
        "application/vnd.google-apps.folder"
      ) {

        foldersToScan.push(
          file.id
        );

        return;

      }


      /* IMAGE */

      if (
        file.mimeType &&
        file.mimeType.startsWith("image/")
      ) {

        media.push(file);

        return;

      }


      /* VIDEO */

      if (
        file.mimeType &&
        file.mimeType.startsWith("video/")
      ) {

        media.push(file);

      }

    });

  }


  return media;

}


/* =========================================================
   DRIVE GALLERY
   ========================================================= */

async function loadDriveGallery() {

  const gallery =
    document.getElementById(
      "drive-gallery"
    );


  if (!gallery) return;


  if (
    !DRIVE_API_KEY ||
    DRIVE_API_KEY ===
      "PASTE_YOUR_API_KEY_HERE"
  ) {

    gallery.innerHTML =
      '<div class="drive-loading">' +
      "Google Drive API key is missing." +
      "</div>";

    return;

  }


  try {

    gallery.innerHTML =
      '<div class="drive-loading">' +
      "Loading our stories..." +
      "</div>";


    console.log(
      "PREMSNAPS: Scanning Google Drive..."
    );


    const files =
      await getAllDriveMedia();


    console.log(
      "PREMSNAPS: Media found:",
      files
    );


    gallery.innerHTML = "";


    if (!files.length) {

      gallery.innerHTML =
        '<div class="drive-loading">' +
        "No photos or videos found." +
        "</div>";

      return;

    }


    let photos = 0;
    let videos = 0;


    files.forEach(file => {

      const item =
        document.createElement(
          "figure"
        );


      item.className =
        "card drive-card";


      /* =================================================
         PHOTO
         ================================================= */

      if (
        file.mimeType.startsWith(
          "image/"
        )
      ) {

        photos++;


        const img =
          document.createElement(
            "img"
          );


        img.src =
          "https://drive.google.com/thumbnail?id=" +
          encodeURIComponent(file.id) +
          "&sz=w1600";


        img.alt =
          file.name ||
          "PREMSNAPS Wedding Photography";


        img.loading =
          "lazy";


        item.appendChild(img);


        item.addEventListener(
          "click",
          () => openPhoto(file)
        );

      }


      /* =================================================
         VIDEO
         ================================================= */

      else if (
        file.mimeType.startsWith(
          "video/"
        )
      ) {

        videos++;


        const wrapper =
          document.createElement(
            "div"
          );


        wrapper.style.position =
          "relative";


        const thumbnail =
          document.createElement(
            "img"
          );


        thumbnail.src =
          "https://drive.google.com/thumbnail?id=" +
          encodeURIComponent(file.id) +
          "&sz=w1600";


        thumbnail.alt =
          file.name ||
          "PREMSNAPS Cinematic Film";


        thumbnail.loading =
          "lazy";


        wrapper.appendChild(
          thumbnail
        );


        const play =
          document.createElement(
            "div"
          );


        play.innerHTML =
          "▶";


        play.style.position =
          "absolute";


        play.style.left =
          "50%";


        play.style.top =
          "50%";


        play.style.transform =
          "translate(-50%,-50%)";


        play.style.width =
          "65px";


        play.style.height =
          "65px";


        play.style.border =
          "1px solid rgba(255,255,255,.8)";


        play.style.borderRadius =
          "50%";


        play.style.display =
          "flex";


        play.style.alignItems =
          "center";


        play.style.justifyContent =
          "center";


        play.style.color =
          "#fff";


        play.style.background =
          "rgba(0,0,0,.35)";


        wrapper.appendChild(
          play
        );


        item.appendChild(
          wrapper
        );


        item.addEventListener(
          "click",
          () => openVideo(file)
        );

      }


      gallery.appendChild(
        item
      );

    });


    console.log(
      `PREMSNAPS: ${photos} photos, ${videos} videos`
    );

  }

  catch(error) {

    console.error(
      "PREMSNAPS DRIVE ERROR:",
      error
    );


    gallery.innerHTML =
      '<div class="drive-loading">' +
      "Unable to load our stories." +
      "<br><br>" +
      "<small>" +
      "Please check the Google Drive API key " +
      "and folder sharing." +
      "</small>" +
      "</div>";

  }

}


/* =========================================================
   PHOTO VIEW
   ========================================================= */

function openPhoto(file) {

  const overlay =
    document.createElement(
      "div"
    );


  overlay.style.position =
    "fixed";

  overlay.style.inset =
    "0";

  overlay.style.zIndex =
    "99999";

  overlay.style.background =
    "rgba(0,0,0,.96)";

  overlay.style.display =
    "flex";

  overlay.style.alignItems =
    "center";

  overlay.style.justifyContent =
    "center";

  overlay.style.padding =
    "30px";

  overlay.style.cursor =
    "zoom-out";


  const img =
    document.createElement(
      "img"
    );


  img.src =
    "https://drive.google.com/thumbnail?id=" +
    encodeURIComponent(file.id) +
    "&sz=w2400";


  img.alt =
    file.name || "";


  img.style.maxWidth =
    "95vw";

  img.style.maxHeight =
    "92vh";

  img.style.objectFit =
    "contain";


  overlay.appendChild(
    img
  );


  overlay.addEventListener(
    "click",
    () => {

      overlay.remove();

      document.body.style.overflow =
        "";

    }
  );


  document.body.appendChild(
    overlay
  );


  document.body.style.overflow =
    "hidden";

}


/* =========================================================
   VIDEO VIEW
   ========================================================= */

function openVideo(file) {

  const overlay =
    document.createElement(
      "div"
    );


  overlay.style.position =
    "fixed";

  overlay.style.inset =
    "0";

  overlay.style.zIndex =
    "99999";

  overlay.style.background =
    "rgba(0,0,0,.97)";

  overlay.style.display =
    "flex";

  overlay.style.alignItems =
    "center";

  overlay.style.justifyContent =
    "center";

  overlay.style.padding =
    "20px";


  const video =
    document.createElement(
      "video"
    );


  video.src =
    "https://www.googleapis.com/drive/v3/files/" +
    encodeURIComponent(file.id) +
    "?alt=media&key=" +
    encodeURIComponent(
      DRIVE_API_KEY
    );


  video.controls =
    true;

  video.autoplay =
    true;

  video.playsInline =
    true;

  video.preload =
    "metadata";


  video.style.maxWidth =
    "95vw";

  video.style.maxHeight =
    "92vh";


  overlay.appendChild(
    video
  );


  overlay.addEventListener(
    "click",
    event => {

      if (
        event.target === overlay
      ) {

        video.pause();

        overlay.remove();

        document.body.style.overflow =
          "";

      }

    }
  );


  document.body.appendChild(
    overlay
  );


  document.body.style.overflow =
    "hidden";

}


/* =========================================================
   ESC CLOSE VIDEO / PHOTO
   ========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape"
    ) {

      const overlays =
        document.querySelectorAll(
          'body > div[style*="99999"]'
        );


      overlays.forEach(
        overlay => overlay.remove()
      );


      document.body.style.overflow =
        "";

    }

  }
);


/* =========================================================
   START EVERYTHING
   ========================================================= */

loadCMSContent();

loadDriveGallery();
