/* =========================================================
   PREMSNAPS — GOOGLE DRIVE GALLERY
   ========================================================= */


/* =========================================================
   GOOGLE DRIVE SETTINGS
   ========================================================= */

/*
   ONLY CHANGE THESE 3 VALUES
*/

const DRIVE_API_KEY = "AIzaSyBYk83Ua9JRRmV_oPwl89I6O74EXflH9sw";

const DRIVE_ROOT_FOLDER_ID =
  "1GhS35bFfeKQNENi81UcZ4WgX-vh2TlNe";

const MAIN_PHOTO_FILE_ID =
  "1nAUw08AGlkzhIumIfIwDOq8RhBlHMLkD";


/*
   Your Google Drive structure should be:

   Wedding
   │
   ├── Highlights
   │     ├── photo1.jpg
   │     ├── photo2.jpg
   │     └── ...
   │
   └── Videos
         ├── video1.mp4
         ├── video2.mp4
         └── ...

*/


/* =========================================================
   PAGE LOADER
   ========================================================= */

document.body.classList.add("loading");

window.addEventListener("load", () => {

  setTimeout(() => {

    const loader = document.querySelector(".page-loader");

    if (loader) {
      loader.classList.add("hide");
    }

    document.body.classList.remove("loading");

  }, 700);

});


/* =========================================================
   YEAR
   ========================================================= */

const year = document.getElementById("year");

if (year) {
  year.textContent = new Date().getFullYear();
}


/* =========================================================
   MOBILE MENU
   ========================================================= */

const menuButton = document.querySelector(".menu-button");
const mobileMenu = document.querySelector(".mobile-menu");

if (menuButton && mobileMenu) {

  menuButton.addEventListener("click", () => {

    mobileMenu.classList.toggle("open");

  });

  mobileMenu.querySelectorAll("a").forEach(link => {

    link.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
    });

  });

}


/* =========================================================
   SCROLL REVEAL
   ========================================================= */

const revealObserver =
  new IntersectionObserver(
    entries => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {

          entry.target.classList.add("visible");

          revealObserver.unobserve(entry.target);

        }

      });

    },
    {
      threshold: 0.12
    }
  );


function initReveal() {

  document
    .querySelectorAll(".reveal, .reveal-line")
    .forEach(element => {

      revealObserver.observe(element);

    });

}


initReveal();


/* =========================================================
   HERO IMAGE FROM GOOGLE DRIVE
   ========================================================= */

function loadMainPhoto() {

  const hero = document.getElementById("hero-image");

  if (!hero) return;

  if (
    !MAIN_PHOTO_FILE_ID ||
    MAIN_PHOTO_FILE_ID.includes("PASTE_")
  ) {
    return;
  }

  hero.src =
    "https://drive.google.com/thumbnail?id=" +
    encodeURIComponent(MAIN_PHOTO_FILE_ID) +
    "&sz=w2400";

}


loadMainPhoto();


/* =========================================================
   GOOGLE DRIVE API
   ========================================================= */

async function driveRequest(url) {

  const response = await fetch(url);

  if (!response.ok) {

    const text = await response.text();

    throw new Error(
      "Google Drive API error: " +
      response.status +
      " " +
      text
    );

  }

  return response.json();

}


/* =========================================================
   FIND FOLDER
   ========================================================= */

async function findDriveFolder(folderName) {

  if (
    !DRIVE_API_KEY ||
    DRIVE_API_KEY.includes("PASTE_")
  ) {
    throw new Error("Google Drive API key not configured.");
  }

  if (
    !DRIVE_ROOT_FOLDER_ID ||
    DRIVE_ROOT_FOLDER_ID.includes("PASTE_")
  ) {
    throw new Error("Google Drive root folder ID not configured.");
  }


  const query =
    "'" +
    DRIVE_ROOT_FOLDER_ID +
    "' in parents and " +
    "name = '" +
    folderName.replace(/'/g, "\\'") +
    "' and " +
    "mimeType = 'application/vnd.google-apps.folder' and " +
    "trashed = false";


  const url =
    "https://www.googleapis.com/drive/v3/files" +
    "?q=" + encodeURIComponent(query) +
    "&fields=files(id,name)" +
    "&pageSize=20" +
    "&key=" + encodeURIComponent(DRIVE_API_KEY);


  const data = await driveRequest(url);

  if (!data.files || data.files.length === 0) {
    return null;
  }

  return data.files[0];

}


/* =========================================================
   GET FILES FROM FOLDER
   ========================================================= */

async function getDriveFiles(folderId, type) {

  let mimeQuery = "";

  if (type === "photos") {

    mimeQuery =
      "mimeType contains 'image/'";

  }

  if (type === "videos") {

    mimeQuery =
      "mimeType contains 'video/'";

  }


  const query =
    "'" +
    folderId +
    "' in parents and " +
    mimeQuery +
    " and trashed = false";


  const url =
    "https://www.googleapis.com/drive/v3/files" +
    "?q=" + encodeURIComponent(query) +
    "&orderBy=createdTime desc" +
    "&pageSize=100" +
    "&fields=files(id,name,mimeType,createdTime)" +
    "&key=" + encodeURIComponent(DRIVE_API_KEY);


  const data = await driveRequest(url);

  return data.files || [];

}


/* =========================================================
   DRIVE IMAGE URL
   ========================================================= */

function getDriveImage(fileId) {

  return (
    "https://drive.google.com/thumbnail?id=" +
    encodeURIComponent(fileId) +
    "&sz=w1800"
  );

}


/* =========================================================
   CREATE GALLERY CARD
   ========================================================= */

function createPhotoCard(file) {

  const figure =
    document.createElement("figure");

  figure.className = "gallery-card";


  const image =
    document.createElement("img");

  image.src = getDriveImage(file.id);

  image.alt = file.name;

  image.loading = "lazy";


  figure.appendChild(image);


  figure.addEventListener("click", () => {

    openLightbox(
      getDriveImage(file.id),
      file.name
    );

  });


  return figure;

}


/* =========================================================
   HOME GALLERY
   ========================================================= */

async function loadHomeGallery() {

  const gallery =
    document.getElementById("home-gallery");

  if (!gallery) return;


  try {

    const highlights =
      await findDriveFolder("Highlights");


    if (!highlights) {

      gallery.innerHTML =
        '<div class="gallery-loading">' +
        'Create a folder named "Highlights" inside your Wedding folder.' +
        '</div>';

      return;

    }


    const files =
      await getDriveFiles(
        highlights.id,
        "photos"
      );


    if (!files.length) {

      gallery.innerHTML =
        '<div class="gallery-loading">' +
        'No photos found in Highlights.' +
        '</div>';

      return;

    }


    gallery.innerHTML = "";


    /*
       Show maximum 6 on homepage.
       Full collection will be available
       on photos.html.
    */

    files
      .slice(0, 6)
      .forEach(file => {

        gallery.appendChild(
          createPhotoCard(file)
        );

      });


    initReveal();

  }
  catch (error) {

    console.error(
      "PREMSNAPS Drive Gallery:",
      error
    );


    gallery.innerHTML =
      '<div class="gallery-loading">' +
      'Gallery is temporarily unavailable.' +
      '</div>';

  }

}


/* =========================================================
   PHOTOS PAGE
   ========================================================= */

async function loadPhotosPage() {

  const gallery =
    document.getElementById("photos-gallery");

  if (!gallery) return;


  try {

    const folder =
      await findDriveFolder("Highlights");


    if (!folder) {

      gallery.innerHTML =
        '<div class="gallery-loading">' +
        'Highlights folder not found.' +
        '</div>';

      return;

    }


    const files =
      await getDriveFiles(
        folder.id,
        "photos"
      );


    if (!files.length) {

      gallery.innerHTML =
        '<div class="gallery-loading">' +
        'No photos found.' +
        '</div>';

      return;

    }


    gallery.innerHTML = "";


    files.forEach(file => {

      gallery.appendChild(
        createPhotoCard(file)
      );

    });

  }
  catch (error) {

    console.error(error);

    gallery.innerHTML =
      '<div class="gallery-loading">' +
      'Unable to load photos.' +
      '</div>';

  }

}


/* =========================================================
   VIDEOS
   ========================================================= */

function createVideoCard(file) {

  const wrapper =
    document.createElement("div");

  wrapper.className = "video-card";


  const video =
    document.createElement("video");

  video.controls = true;

  video.preload = "metadata";

  video.playsInline = true;


  /*
     Google Drive direct media URL
  */

  video.src =
    "https://www.googleapis.com/drive/v3/files/" +
    encodeURIComponent(file.id) +
    "?alt=media&key=" +
    encodeURIComponent(DRIVE_API_KEY);


  const title =
    document.createElement("div");

  title.className = "video-title";

  title.textContent = file.name;


  wrapper.appendChild(video);

  wrapper.appendChild(title);


  return wrapper;

}


/* =========================================================
   FILMS PAGE
   ========================================================= */

async function loadFilmsPage() {

  const gallery =
    document.getElementById("films-gallery");

  if (!gallery) return;


  try {

    const folder =
      await findDriveFolder("Videos");


    if (!folder) {

      gallery.innerHTML =
        '<div class="gallery-loading">' +
        'Videos folder not found.' +
        '</div>';

      return;

    }


    const files =
      await getDriveFiles(
        folder.id,
        "videos"
      );


    if (!files.length) {

      gallery.innerHTML =
        '<div class="gallery-loading">' +
        'No videos found.' +
        '</div>';

      return;

    }


    gallery.innerHTML = "";

    files.forEach(file => {

      gallery.appendChild(
        createVideoCard(file)
      );

    });

  }
  catch (error) {

    console.error(error);

    gallery.innerHTML =
      '<div class="gallery-loading">' +
      'Unable to load films.' +
      '</div>';

  }

}


/* =========================================================
   LIGHTBOX
   ========================================================= */

const lightbox =
  document.getElementById("lightbox");

const lightboxImage =
  document.getElementById("lightbox-image");

const lightboxCaption =
  document.getElementById("lightbox-caption");

const lightboxClose =
  document.getElementById("lightbox-close");


function openLightbox(image, caption) {

  if (!lightbox) return;

  lightboxImage.src = image;

  lightboxCaption.textContent =
    caption || "";

  lightbox.classList.add("open");

  document.body.style.overflow = "hidden";

}


function closeLightbox() {

  if (!lightbox) return;

  lightbox.classList.remove("open");

  document.body.style.overflow = "";

}


if (lightboxClose) {

  lightboxClose.addEventListener(
    "click",
    closeLightbox
  );

}


if (lightbox) {

  lightbox.addEventListener(
    "click",
    event => {

      if (event.target === lightbox) {
        closeLightbox();
      }

    }
  );

}


document.addEventListener(
  "keydown",
  event => {

    if (event.key === "Escape") {
      closeLightbox();
    }

  }
);


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadHomeGallery();

    loadPhotosPage();

    loadFilmsPage();

  }
);
