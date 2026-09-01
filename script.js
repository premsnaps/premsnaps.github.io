/* =========================================================
   PREMSNAPS.IN
   GOOGLE DRIVE + ANIMATIONS + GALLERY
   ========================================================= */


/* =========================================================
   SETTINGS
========================================================= */

const CONFIG = {

  /*
    IMPORTANT:
    Paste your NEW restricted Google Drive API key here.
  */

  apiKey: "AIzaSyBYk83Ua9JRRmV_oPwl89I6O74EXflH9sw",

  /*
    Your Wedding Google Drive root folder
  */

  rootFolderId:
    "1GhS35bFfeKQNENi81UcZ4WgX-vh2TlNe",

  /*
    WhatsApp
  */

  whatsapp:
    "919989368077"

};


/* =========================================================
   START
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    initMenu();

    initRevealAnimations();

    loadGoogleDrive();

    initLightbox();

    setYear();

  }
);


/* =========================================================
   YEAR
========================================================= */

function setYear() {

  const year =
    document.getElementById("year");

  if (year) {

    year.textContent =
      new Date().getFullYear();

  }

}


/* =========================================================
   MOBILE MENU
========================================================= */

function initMenu() {

  const button =
    document.getElementById("menuBtn");

  const navigation =
    document.getElementById("navigation");


  if (!button || !navigation) {
    return;
  }


  button.addEventListener(
    "click",
    function () {

      navigation.classList.toggle(
        "open"
      );

    }
  );


  navigation
    .querySelectorAll("a")
    .forEach(function (link) {

      link.addEventListener(
        "click",
        function () {

          navigation.classList.remove(
            "open"
          );

        }
      );

    });

}


/* =========================================================
   SCROLL REVEAL
========================================================= */

function initRevealAnimations() {

  const elements =
    document.querySelectorAll(
      ".reveal"
    );


  if (
    !("IntersectionObserver" in window)
  ) {

    elements.forEach(
      function (element) {

        element.classList.add(
          "show"
        );

      }
    );

    return;

  }


  const observer =
    new IntersectionObserver(

      function (entries) {

        entries.forEach(
          function (entry) {

            if (
              entry.isIntersecting
            ) {

              entry.target.classList.add(
                "show"
              );

              observer.unobserve(
                entry.target
              );

            }

          }
        );

      },

      {
        threshold: 0.12
      }

    );


  elements.forEach(
    function (element) {

      observer.observe(
        element
      );

    }
  );

}


/* =========================================================
   GOOGLE DRIVE API
========================================================= */

async function driveRequest(
  query
) {


  if (
    !CONFIG.apiKey ||
    CONFIG.apiKey.includes(
      "PASTE_NEW_"
    )
  ) {

    throw new Error(
      "Google Drive API key is missing."
    );

  }


  let files = [];

  let pageToken = "";


  do {


    const parameters =
      new URLSearchParams({

        q: query,

        key:
          CONFIG.apiKey,

        pageSize:
          "1000",

        fields:
          "nextPageToken,files(id,name,mimeType,createdTime,modifiedTime)",

        orderBy:
          "createdTime desc"

      });


    if (pageToken) {

      parameters.set(
        "pageToken",
        pageToken
      );

    }


    const response =
      await fetch(

        "https://www.googleapis.com/drive/v3/files?" +
        parameters.toString()

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
        files.concat(
          data.files
        );

    }


    pageToken =
      data.nextPageToken || "";


  }

  while (pageToken);


  return files;

}


/* =========================================================
   GET DIRECT ROOT FILES
========================================================= */

async function getRootFiles() {

  return await driveRequest(

    `'${CONFIG.rootFolderId}' in parents and trashed = false`

  );

}


/* =========================================================
   FIND FOLDER BY NAME
========================================================= */

async function findFolder(
  folderName
) {

  const files =
    await getRootFiles();


  return files.find(

    function (file) {

      return (
        file.mimeType ===
        "application/vnd.google-apps.folder"
        &&
        file.name
          .toLowerCase()
          .trim() ===
          folderName
            .toLowerCase()
            .trim()
      );

    }

  );

}


/* =========================================================
   GET FILES FROM FOLDER
========================================================= */

async function getFolderFiles(
  folderId
) {

  return await driveRequest(

    `'${folderId}' in parents and trashed = false`

  );

}


/* =========================================================
   RECURSIVE MEDIA SEARCH
========================================================= */

async function getAllMedia(
  folderId
) {

  const queue = [
    folderId
  ];

  const media = [];


  while (
    queue.length
  ) {


    const currentFolder =
      queue.shift();


    const files =
      await getFolderFiles(
        currentFolder
      );


    files.forEach(

      function (file) {


        /*
          Folder
        */

        if (

          file.mimeType ===
          "application/vnd.google-apps.folder"

        ) {

          queue.push(
            file.id
          );

          return;

        }


        /*
          Image
        */

        if (

          file.mimeType &&
          file.mimeType.startsWith(
            "image/"
          )

        ) {

          media.push(
            file
          );

          return;

        }


        /*
          Video
        */

        if (

          file.mimeType &&
          file.mimeType.startsWith(
            "video/"
          )

        ) {

          media.push(
            file
          );

        }

      }

    );

  }


  return media;

}


/* =========================================================
   DRIVE THUMBNAIL
========================================================= */

function driveThumbnail(
  fileId,
  width = 1800
) {

  return (

    "https://drive.google.com/thumbnail?id=" +

    encodeURIComponent(
      fileId
    ) +

    "&sz=w" +

    width

  );

}


/* =========================================================
   GOOGLE DRIVE MAIN PHOTO
========================================================= */

async function loadHeroPhoto() {

  const hero =
    document.getElementById(
      "heroImage"
    );


  if (!hero) {
    return;
  }


  try {


    /*
      ONLY direct files in root.

      Therefore:
      Main photo = root photo

      Photos inside Highlights
      will NOT become hero.
    */

    const rootFiles =
      await getRootFiles();


    const rootImage =
      rootFiles.find(

        function (file) {

          return (
            file.mimeType &&
            file.mimeType.startsWith(
              "image/"
            )
          );

        }

      );


    if (!rootImage) {

      console.warn(
        "No main photo found in Drive root."
      );

      return;

    }


    hero.style.backgroundImage =
      `url("${driveThumbnail(
        rootImage.id,
        2400
      )}")`;


    hero.classList.add(
      "loaded"
    );


  }

  catch (error) {

    console.error(
      "Hero image error:",
      error
    );

  }

}


/* =========================================================
   LOAD PHOTOS
========================================================= */

async function loadPhotos() {

  const homeGallery =
    document.getElementById(
      "homeGallery"
    );


  if (!homeGallery) {
    return;
  }


  try {


    const highlightsFolder =
      await findFolder(
        "Highlights"
      );


    let photos = [];


    /*
      Prefer Highlights folder.

      This keeps videos separate.
    */

    if (highlightsFolder) {

      const files =
        await getAllMedia(
          highlightsFolder.id
        );


      photos =
        files.filter(

          function (file) {

            return (
              file.mimeType &&
              file.mimeType.startsWith(
                "image/"
              )
            );

          }

        );

    }


    /*
      If Highlights folder does not exist,
      fall back to all root media images.
    */

    if (!photos.length) {

      const files =
        await getAllMedia(
          CONFIG.rootFolderId
        );


      photos =
        files.filter(

          function (file) {

            return (
              file.mimeType &&
              file.mimeType.startsWith(
                "image/"
              )
            );

          }

        );

    }


    renderPhotoGallery(
      homeGallery,
      photos
    );


    const count =
      document.getElementById(
        "photoCount"
      );


    if (count) {

      count.textContent =
        photos.length +
        " PHOTOGRAPHS";

    }


  }

  catch (error) {

    console.error(
      "Photo gallery error:",
      error
    );


    homeGallery.innerHTML =
      `
        <div class="gallery-loading">
          Unable to load photographs.
        </div>
      `;

  }

}


/* =========================================================
   RENDER PHOTOS
========================================================= */

function renderPhotoGallery(
  container,
  photos
) {


  container.innerHTML = "";


  if (!photos.length) {

    container.innerHTML =
      `
        <div class="gallery-loading">
          No photographs found.
        </div>
      `;

    return;

  }


  photos.forEach(

    function (photo, index) {


      const item =
        document.createElement(
          "figure"
        );


      item.className =
        "gallery-item";


      const image =
        document.createElement(
          "img"
        );


      image.src =
        driveThumbnail(
          photo.id,
          1800
        );


      image.alt =
        photo.name ||
        "PREMSNAPS Wedding Photography";


      image.loading =
        index < 6
          ? "eager"
          : "lazy";


      item.appendChild(
        image
      );


      /*
        Photo name
      */

      const name =
        document.createElement(
          "div"
        );


      name.className =
        "gallery-name";


      name.textContent =
        photo.name;


      item.appendChild(
        name
      );


      /*
        Fullscreen
      */

      item.addEventListener(
        "click",
        function () {

          openImage(
            driveThumbnail(
              photo.id,
              2400
            )
          );

        }
      );


      container.appendChild(
        item
      );


      /*
        Stagger animation
      */

      setTimeout(

        function () {

          item.classList.add(
            "visible"
          );

        },

        Math.min(
          index * 70,
          900
        )

      );

    }

  );

}


/* =========================================================
   LOAD FILMS
========================================================= */

async function loadFilms() {

  const filmContainer =
    document.getElementById(
      "homeFilms"
    );


  if (!filmContainer) {
    return;
  }


  try {


    const videosFolder =
      await findFolder(
        "Videos"
      );


    let videos = [];


    if (videosFolder) {

      const files =
        await getAllMedia(
          videosFolder.id
        );


      videos =
        files.filter(

          function (file) {

            return (
              file.mimeType &&
              file.mimeType.startsWith(
                "video/"
              )
            );

          }

        );

    }


    /*
      Fallback
    */

    if (!videos.length) {

      const files =
        await getAllMedia(
          CONFIG.rootFolderId
        );


      videos =
        files.filter(

          function (file) {

            return (
              file.mimeType &&
              file.mimeType.startsWith(
                "video/"
              )
            );

          }

        );

    }


    /*
      Home only shows first 3.
    */

    renderFilmPreview(
      filmContainer,
      videos.slice(0, 3)
    );


  }

  catch (error) {

    console.error(
      "Film loading error:",
      error
    );


    filmContainer.innerHTML =
      `
        <div class="gallery-loading">
          Unable to load films.
        </div>
      `;

  }

}


/* =========================================================
   RENDER FILM PREVIEW
========================================================= */

function renderFilmPreview(
  container,
  videos
) {


  container.innerHTML = "";


  if (!videos.length) {

    container.innerHTML =
      `
        <div class="gallery-loading">
          No films found yet.
        </div>
      `;

    return;

  }


  videos.forEach(

    function (video, index) {


      const card =
        document.createElement(
          "article"
        );


      card.className =
        "film-card";


      const image =
        document.createElement(
          "img"
        );


      image.src =
        driveThumbnail(
          video.id,
          1800
        );


      image.alt =
        video.name ||
        "PREMSNAPS Cinematic Wedding Film";


      image.loading =
        index === 0
          ? "eager"
          : "lazy";


      card.appendChild(
        image
      );


      /*
        Play button
      */

      const play =
        document.createElement(
          "div"
        );


      play.className =
        "play-button";


      play.textContent =
        "▶";


      card.appendChild(
        play
      );


      /*
        Title
      */

      const title =
        document.createElement(
          "div"
        );


      title.className =
        "film-title";


      title.textContent =
        video.name;


      card.appendChild(
        title
      );


      card.addEventListener(
        "click",
        function () {

          openVideo(
            video.id
          );

        }
      );


      container.appendChild(
        card
      );


      setTimeout(

        function () {

          card.classList.add(
            "visible"
          );

        },

        index * 180

      );

    }

  );

}


/* =========================================================
   PHOTOS PAGE
========================================================= */

async function loadPhotosPage() {

  const container =
    document.getElementById(
      "photosGallery"
    );


  if (!container) {
    return;
  }


  try {


    const highlightsFolder =
      await findFolder(
        "Highlights"
      );


    if (!highlightsFolder) {

      container.innerHTML =
        `
          <div class="gallery-loading">
            Highlights folder not found.
          </div>
        `;

      return;

    }


    const files =
      await getAllMedia(
        highlightsFolder.id
      );


    const photos =
      files.filter(

        function (file) {

          return (
            file.mimeType &&
            file.mimeType.startsWith(
              "image/"
            )
          );

        }

      );


    renderPhotoGallery(
      container,
      photos
    );


    const count =
      document.getElementById(
        "photoCount"
      );


    if (count) {

      count.textContent =
        photos.length +
        " PHOTOGRAPHS";

    }


  }

  catch (error) {

    console.error(
      error
    );

    container.innerHTML =
      `
        <div class="gallery-loading">
          Unable to load photographs.
        </div>
      `;

  }

}


/* =========================================================
   FILMS PAGE
========================================================= */

async function loadFilmsPage() {

  const container =
    document.getElementById(
      "filmsGallery"
    );


  if (!container) {
    return;
  }


  try {


    const videosFolder =
      await findFolder(
        "Videos"
      );


    if (!videosFolder) {

      container.innerHTML =
        `
          <div class="gallery-loading">
            Videos folder not found.
          </div>
        `;

      return;

    }


    const files =
      await getAllMedia(
        videosFolder.id
      );


    const videos =
      files.filter(

        function (file) {

          return (
            file.mimeType &&
            file.mimeType.startsWith(
              "video/"
            )
          );

        }

      );


    renderFilmPreview(
      container,
      videos
    );


    const count =
      document.getElementById(
        "filmCount"
      );


    if (count) {

      count.textContent =
        videos.length +
        " FILMS";

    }


  }

  catch (error) {

    console.error(
      error
    );

    container.innerHTML =
      `
        <div class="gallery-loading">
          Unable to load films.
        </div>
      `;

  }

}


/* =========================================================
   LIGHTBOX
========================================================= */

function initLightbox() {

  const lightbox =
    document.getElementById(
      "lightbox"
    );


  const close =
    document.getElementById(
      "lightboxClose"
    );


  if (close) {

    close.addEventListener(
      "click",
      closeLightbox
    );

  }


  if (lightbox) {

    lightbox.addEventListener(
      "click",
      function (event) {

        if (
          event.target ===
          lightbox
        ) {

          closeLightbox();

        }

      }
    );

  }


  document.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key ===
        "Escape"
      ) {

        closeLightbox();

      }

    }
  );

}


/* =========================================================
   OPEN IMAGE
========================================================= */

function openImage(
  source
) {

  const lightbox =
    document.getElementById(
      "lightbox"
    );


  const content =
    document.getElementById(
      "lightboxContent"
    );


  if (
    !lightbox ||
    !content
  ) {

    return;

  }


  content.innerHTML =
    "";


  const image =
    document.createElement(
      "img"
    );


  image.src =
    source;


  image.alt =
    "PREMSNAPS";


  content.appendChild(
    image
  );


  lightbox.classList.add(
    "open"
  );


  document.body.style.overflow =
    "hidden";

}


/* =========================================================
   OPEN VIDEO
========================================================= */

function openVideo(
  videoId
) {

  const lightbox =
    document.getElementById(
      "lightbox"
    );


  const content =
    document.getElementById(
      "lightboxContent"
    );


  if (
    !lightbox ||
    !content
  ) {

    return;

  }


  content.innerHTML =
    "";


  const iframe =
    document.createElement(
      "iframe"
    );


  iframe.src =
    `https://drive.google.com/file/d/${videoId}/preview`;


  iframe.allow =
    "autoplay; fullscreen";


  iframe.allowFullscreen =
    true;


  content.appendChild(
    iframe
  );


  lightbox.classList.add(
    "open"
  );


  document.body.style.overflow =
    "hidden";

}


/* =========================================================
   CLOSE LIGHTBOX
========================================================= */

function closeLightbox() {

  const lightbox =
    document.getElementById(
      "lightbox"
    );


  const content =
    document.getElementById(
      "lightboxContent"
    );


  if (lightbox) {

    lightbox.classList.remove(
      "open"
    );

  }


  if (content) {

    content.innerHTML =
      "";

  }


  document.body.style.overflow =
    "";

}


/* =========================================================
   DETECT PAGE
========================================================= */

async function loadGoogleDrive() {

  const page =
    document.body.dataset.page;


  /*
    HOME
  */

  if (
    page === "home"
  ) {

    await loadHeroPhoto();

    await loadPhotos();

    await loadFilms();

  }


  /*
    PHOTOS
  */

  if (
    page === "photos"
  ) {

    await loadPhotosPage();

  }


  /*
    FILMS
  */

  if (
    page === "films"
  ) {

    await loadFilmsPage();

  }

}
/* =========================================================
   PREMSNAPS — QUOTE CALCULATOR
========================================================= */

const QUOTE_DATA = [

  {
    title: "WHAT PHOTOGRAPHY DO YOU WANT?",
    multi: false,
    options: [
      {
        name: "Candid & Cinematic",
        price: 0
      },
      {
        name: "Traditional Photography",
        price: 0
      }
    ]
  },


  {
    title: "PRE-WEDDING SHOOT",
    multi: false,
    options: [
      {
        name: "Only Photos",
        price: 25000
      },
      {
        name: "Photos + Video",
        price: 45000
      }
    ]
  },


  {
    title: "ENGAGEMENT",
    multi: true,
    options: [
      {
        name: "Traditional Photo",
        price: 10000
      },
      {
        name: "Traditional Video",
        price: 15000
      },
      {
        name: "Candid Photo",
        price: 20000
      },
      {
        name: "Cinematic",
        price: 20000
      },
      {
        name: "Drone",
        price: 10000
      }
    ]
  },


  {
    title: "PELLIKODUKU",
    multi: true,
    options: [
      {
        name: "Traditional Photo",
        price: 10000
      },
      {
        name: "Traditional Video",
        price: 15000
      },
      {
        name: "Candid",
        price: 20000
      }
    ]
  },


  {
    title: "GROOM HALDI",
    multi: true,
    options: [
      {
        name: "Traditional Photo",
        price: 10000
      },
      {
        name: "Traditional Video",
        price: 15000
      },
      {
        name: "Candid Photo",
        price: 20000
      },
      {
        name: "Cinematic",
        price: 20000
      },
      {
        name: "Drone",
        price: 10000
      }
    ]
  },


  {
    title: "PELLIKUTHURU",
    multi: true,
    options: [
      {
        name: "Traditional Photo",
        price: 10000
      },
      {
        name: "Traditional Video",
        price: 15000
      },
      {
        name: "Candid",
        price: 20000
      }
    ]
  },


  {
    title: "BRIDE HALDI",
    multi: true,
    options: [
      {
        name: "Traditional Photo",
        price: 10000
      },
      {
        name: "Traditional Video",
        price: 15000
      },
      {
        name: "Candid Photo",
        price: 20000
      },
      {
        name: "Cinematic",
        price: 20000
      },
      {
        name: "Drone",
        price: 10000
      }
    ]
  },


  {
    title: "WEDDING",
    multi: true,
    options: [
      {
        name: "Traditional Photo",
        price: 10000
      },
      {
        name: "Traditional Video",
        price: 15000
      },
      {
        name: "Candid Photo",
        price: 25000
      },
      {
        name: "Cinematic",
        price: 25000
      },
      {
        name: "Drone",
        price: 10000
      }
    ]
  },


  {
    title: "RECEPTION",
    multi: true,
    options: [
      {
        name: "Traditional Photo",
        price: 10000
      },
      {
        name: "Traditional Video",
        price: 15000
      },
      {
        name: "Candid Photo",
        price: 20000
      },
      {
        name: "Cinematic",
        price: 20000
      },
      {
        name: "Drone",
        price: 10000
      }
    ]
  },


  {
    title: "VRATHAM",
    multi: true,
    options: [
      {
        name: "Traditional Photo",
        price: 10000
      },
      {
        name: "Traditional Video",
        price: 15000
      }
    ]
  },


  {
    title: "SANGEETH",
    multi: true,
    options: [
      {
        name: "Traditional Photo",
        price: 10000
      },
      {
        name: "Traditional Video",
        price: 15000
      },
      {
        name: "Candid Photo",
        price: 20000
      },
      {
        name: "Cinematic",
        price: 20000
      },
      {
        name: "Drone",
        price: 10000
      }
    ]
  },


  {
    title: "MEHANDI",
    multi: true,
    options: [
      {
        name: "Traditional Photo",
        price: 10000
      },
      {
        name: "Traditional Video",
        price: 15000
      }
    ]
  },


  {
    title: "ALBUMS",
    multi: true,
    options: [
      {
        name: "Pressbook",
        price: 25000
      },
      {
        name: "Royal Album",
        price: 35000
      }
    ]
  }

];


/* =========================================================
   QUOTE STATE
========================================================= */

let quoteStep = 0;

const quoteSelections = {};


/* =========================================================
   FORMAT PRICE
========================================================= */

function formatPrice(
  amount
) {

  return (
    "₹" +
    Number(amount).toLocaleString(
      "en-IN"
    ) +
    "/-"
  );

}


/* =========================================================
   CALCULATE TOTAL
========================================================= */

function calculateQuoteTotal() {

  let total = 0;


  Object.keys(
    quoteSelections
  ).forEach(

    function (step) {

      quoteSelections[step].forEach(

        function (selected) {

          total +=
            Number(
              selected.price
            );

        }

      );

    }

  );


  return total;

}


/* =========================================================
   UPDATE PRICE
========================================================= */

function updateQuotePrice() {

  const total =
    calculateQuoteTotal();


  const topPrice =
    document.getElementById(
      "quotePrice"
    );


  const summaryPrice =
    document.getElementById(
      "summaryPrice"
    );


  if (topPrice) {

    topPrice.textContent =
      formatPrice(total);

  }


  if (summaryPrice) {

    summaryPrice.textContent =
      formatPrice(total);

  }

}


/* =========================================================
   RENDER PROGRESS
========================================================= */

function renderQuoteProgress() {

  const progress =
    document.getElementById(
      "quoteProgress"
    );


  if (!progress) {
    return;
  }


  progress.innerHTML = "";


  QUOTE_DATA.forEach(

    function (_, index) {

      const dot =
        document.createElement(
          "span"
        );


      dot.className =
        "quote-dot";


      if (
        index === quoteStep
      ) {

        dot.classList.add(
          "active"
        );

      }


      if (
        index < quoteStep
      ) {

        dot.classList.add(
          "completed"
        );

      }


      dot.textContent =
        String(index + 1)
          .padStart(2, "0");


      progress.appendChild(
        dot
      );

    }

  );

}


/* =========================================================
   RENDER CURRENT STEP
========================================================= */

function renderQuoteStep() {

  const title =
    document.getElementById(
      "quoteTitle"
    );


  const options =
    document.getElementById(
      "quoteOptions"
    );


  const number =
    document.getElementById(
      "quoteStepNumber"
    );


  if (
    !title ||
    !options
  ) {

    return;

  }


  const current =
    QUOTE_DATA[
      quoteStep
    ];


  title.textContent =
    current.title;


  if (number) {

    number.textContent =
      String(
        quoteStep + 1
      ).padStart(2, "0") +
      " / " +
      String(
        QUOTE_DATA.length
      ).padStart(2, "0");

  }


  options.innerHTML = "";


  const selected =
    quoteSelections[
      quoteStep
    ] || [];


  current.options.forEach(

    function (option) {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "quote-option";


      const isSelected =
        selected.some(

          function (item) {

            return (
              item.name ===
              option.name
            );

          }

        );


      if (isSelected) {

        card.classList.add(
          "selected"
        );

      }


      card.innerHTML = `

        <div class="quote-option-check">
          ${isSelected ? "✓" : ""}
        </div>

        <div class="quote-option-name">
          ${option.name}
        </div>

        ${
          option.price > 0
          ? `
            <div class="quote-option-price">
              ${formatPrice(option.price)}
            </div>
          `
          : `
            <div class="quote-option-note">
              INCLUDED / PREFERENCE
            </div>
          `
        }

      `;


      card.addEventListener(
        "click",
        function () {

          selectQuoteOption(
            option
          );

        }
      );


      options.appendChild(
        card
      );

    }

  );


  updateQuotePrice();

  renderQuoteProgress();

  renderQuoteSummary();

  updateQuoteButtons();

}


/* =========================================================
   SELECT OPTION
========================================================= */

function selectQuoteOption(
  option
) {

  if (
    !quoteSelections[
      quoteStep
    ]
  ) {

    quoteSelections[
      quoteStep
    ] = [];

  }


  const selected =
    quoteSelections[
      quoteStep
    ];


  const existingIndex =
    selected.findIndex(

      function (item) {

        return (
          item.name ===
          option.name
        );

      }

    );


  /*
    SINGLE SELECT
  */

  if (
    !QUOTE_DATA[
      quoteStep
    ].multi
  ) {

    quoteSelections[
      quoteStep
    ] = [
      option
    ];

  }


  /*
    MULTIPLE SELECT
  */

  else {

    if (
      existingIndex >= 0
    ) {

      selected.splice(
        existingIndex,
        1
      );

    }

    else {

      selected.push(
        option
      );

    }

  }


  renderQuoteStep();

}


/* =========================================================
   NEXT
========================================================= */

function nextQuoteStep() {

  /*
    Require selection
    before moving forward.
  */

  const selected =
    quoteSelections[
      quoteStep
    ] || [];


  if (
    selected.length === 0
  ) {

    alert(
      "Please select at least one option before continuing."
    );

    return;

  }


  if (
    quoteStep <
    QUOTE_DATA.length - 1
  ) {

    quoteStep++;

    renderQuoteStep();

    window.scrollTo({

      top:
        document.getElementById(
          "quoteBuilder"
        )?.offsetTop - 100 || 0,

      behavior:
        "smooth"

    });

  }


  else {

    const details =
      document.getElementById(
        "quoteDetails"
      );


    if (details) {

      details.scrollIntoView({
        behavior: "smooth"
      });

    }

  }

}


/* =========================================================
   PREVIOUS
========================================================= */

function previousQuoteStep() {

  if (
    quoteStep > 0
  ) {

    quoteStep--;

    renderQuoteStep();

    window.scrollTo({

      top:
        document.getElementById(
          "quoteBuilder"
        )?.offsetTop - 100 || 0,

      behavior:
        "smooth"

    });

  }

}


/* =========================================================
   BUTTON STATE
========================================================= */

function updateQuoteButtons() {

  const previous =
    document.getElementById(
      "previousStep"
    );


  const next =
    document.getElementById(
      "nextStep"
    );


  if (previous) {

    previous.style.opacity =
      quoteStep === 0
        ? "0.35"
        : "1";

    previous.style.pointerEvents =
      quoteStep === 0
        ? "none"
        : "auto";

  }


  if (next) {

    next.textContent =
      quoteStep ===
      QUOTE_DATA.length - 1

        ? "GO TO DETAILS →"

        : "NEXT →";

  }

}


/* =========================================================
   SUMMARY
========================================================= */

function renderQuoteSummary() {

  const container =
    document.getElementById(
      "summaryItems"
    );


  if (!container) {
    return;
  }


  container.innerHTML = "";


  let hasSelection =
    false;


  QUOTE_DATA.forEach(

    function (step, index) {

      const selections =
        quoteSelections[
          index
        ] || [];


      if (
        selections.length === 0
      ) {

        return;

      }


      hasSelection = true;


      const heading =
        document.createElement(
          "div"
        );


      heading.className =
        "summary-event";


      heading.textContent =
        step.title;


      container.appendChild(
        heading
      );


      selections.forEach(

        function (item) {

          const row =
            document.createElement(
              "div"
            );


          row.className =
            "summary-row";


          row.innerHTML = `

            <span>
              ${item.name}
            </span>

            <strong>
              ${
                item.price > 0
                  ? formatPrice(item.price)
                  : "—"
              }
            </strong>

          `;


          container.appendChild(
            row
          );

        }

      );

    }

  );


  if (!hasSelection) {

    container.innerHTML =
      `
        <div class="summary-empty">
          Nothing selected yet.
        </div>
      `;

  }

}


/* =========================================================
   SEND QUOTE TO WHATSAPP
========================================================= */

function sendQuoteToWhatsApp(
  event
) {

  event.preventDefault();


  const form =
    document.getElementById(
      "quoteForm"
    );


  if (!form) {
    return;
  }


  const formData =
    new FormData(
      form
    );


  const coupleNames =
    formData.get(
      "coupleNames"
    );


  const weddingDate =
    formData.get(
      "weddingDate"
    );


  const location =
    formData.get(
      "location"
    );


  const phone =
    formData.get(
      "phone"
    );


  const email =
    formData.get(
      "email"
    );


  const message =
    formData.get(
      "message"
    );


  let whatsappMessage =
    "PREMSNAPS.IN — WEDDING QUOTE";


  whatsappMessage +=
    "\n\n" +
    "COUPLE DETAILS";


  whatsappMessage +=
    "\nCouple: " +
    coupleNames;


  whatsappMessage +=
    "\nWedding Date: " +
    weddingDate;


  whatsappMessage +=
    "\nLocation: " +
    location;


  whatsappMessage +=
    "\nPhone: " +
    phone;


  if (email) {

    whatsappMessage +=
      "\nEmail: " +
      email;

  }


  whatsappMessage +=
    "\n\nSELECTED SERVICES";


  QUOTE_DATA.forEach(

    function (step, index) {

      const selections =
        quoteSelections[
          index
        ] || [];


      if (
        selections.length === 0
      ) {

        return;

      }


      whatsappMessage +=
        "\n\n" +
        step.title;


      selections.forEach(

        function (item) {

          whatsappMessage +=
            "\n• " +
            item.name;


          if (
            item.price > 0
          ) {

            whatsappMessage +=
              " — " +
              formatPrice(
                item.price
              );

          }

        }

      );

    }

  );


  const total =
    calculateQuoteTotal();


  whatsappMessage +=
    "\n\n" +
    "ESTIMATED TOTAL: " +
    formatPrice(total);


  if (message) {

    whatsappMessage +=
      "\n\nNOTES:\n" +
      message;

  }


  whatsappMessage +=
    "\n\nThank you — PREMSNAPS.IN";


  const whatsappURL =
    "https://wa.me/" +
    CONFIG.whatsapp +
    "?text=" +
    encodeURIComponent(
      whatsappMessage
    );


  window.open(
    whatsappURL,
    "_blank"
  );

}


/* =========================================================
   INITIALIZE QUOTE
========================================================= */

function initQuoteCalculator() {

  const builder =
    document.getElementById(
      "quoteBuilder"
    );


  if (!builder) {
    return;
  }


  const next =
    document.getElementById(
      "nextStep"
    );


  const previous =
    document.getElementById(
      "previousStep"
    );


  if (next) {

    next.addEventListener(
      "click",
      nextQuoteStep
    );

  }


  if (previous) {

    previous.addEventListener(
      "click",
      previousQuoteStep
    );

  }


  const form =
    document.getElementById(
      "quoteForm"
    );


  if (form) {

    form.addEventListener(
      "submit",
      sendQuoteToWhatsApp
    );

  }


  renderQuoteStep();

}


/* =========================================================
   START QUOTE
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    initQuoteCalculator();

  }
);
