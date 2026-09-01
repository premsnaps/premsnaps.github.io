/* =========================================================
   PREMSNAPS - GOOGLE DRIVE GALLERY
   Photos + Videos
   ========================================================= */


/* ================= GOOGLE DRIVE SETTINGS ================= */

const DRIVE_API_KEY = "AIzaSyBYk83Ua9JRRmV_oPwl89I6O74EXflH9sw";

const DRIVE_FOLDER_ID =
    "1GhS35bFfeKQNENi81UcZ4WgX-vh2TlNe";


/* ================= ELEMENTS ================= */

const gallery =
    document.getElementById("drive-gallery");

const galleryCount =
    document.getElementById("gallery-count");

const lightbox =
    document.getElementById("lightbox");

const lightboxContent =
    document.getElementById("lightbox-content");

const lightboxClose =
    document.getElementById("lightbox-close");


/* ================= PAGE YEAR ================= */

const year =
    document.getElementById("year");

if(year){
    year.textContent =
        new Date().getFullYear();
}


/* ================= DRIVE API ================= */

async function loadDriveGallery(){

    if(
        !DRIVE_API_KEY ||
        DRIVE_API_KEY === "PASTE_YOUR_API_KEY_HERE"
    ){

        gallery.innerHTML = `
            <div class="drive-loading">
                Google Drive API key is missing.
            </div>
        `;

        galleryCount.textContent =
            "API KEY REQUIRED";

        return;
    }


    try{

        const query =
            `'${DRIVE_FOLDER_ID}' in parents and trashed = false`;


        const url =
            "https://www.googleapis.com/drive/v3/files" +
            "?q=" + encodeURIComponent(query) +
            "&pageSize=1000" +
            "&orderBy=createdTime desc" +
            "&fields=files(id,name,mimeType,thumbnailLink,createdTime,size)" +
            "&key=" + encodeURIComponent(DRIVE_API_KEY);


        const response =
            await fetch(url);


        if(!response.ok){

            throw new Error(
                "Google Drive API error: " +
                response.status
            );

        }


        const data =
            await response.json();


        console.log(
            "PREMSNAPS DRIVE FILES:",
            data
        );


        const files =
            data.files || [];


        if(files.length === 0){

            gallery.innerHTML = `
                <div class="drive-loading">
                    No photos or videos found.
                </div>
            `;

            galleryCount.textContent =
                "0 STORIES";

            return;
        }


        gallery.innerHTML = "";


        let photoCount = 0;
        let videoCount = 0;


        files.forEach(file => {

            const mime =
                file.mimeType || "";


            /* ================= IMAGE ================= */

            if(mime.startsWith("image/")){

                photoCount++;


                const card =
                    document.createElement("figure");


                card.className =
                    "drive-card";


                const img =
                    document.createElement("img");


                /*
                   Google Drive thumbnail.
                   This is much faster than downloading
                   the original image.
                */

                img.src =
                    "https://drive.google.com/thumbnail?id=" +
                    encodeURIComponent(file.id) +
                    "&sz=w1400";


                img.alt =
                    file.name || "PREMSNAPS Wedding";


                img.loading =
                    "lazy";


                img.addEventListener(
                    "click",
                    () => openImage(file)
                );


                const name =
                    document.createElement("div");


                name.className =
                    "file-name";


                name.textContent =
                    file.name || "";


                card.appendChild(img);

                card.appendChild(name);

                gallery.appendChild(card);

            }


            /* ================= VIDEO ================= */

            else if(mime.startsWith("video/")){

                videoCount++;


                const card =
                    document.createElement("figure");


                card.className =
                    "drive-card video-card";


                /*
                   Google Drive gives us a thumbnail
                   for videos too.
                */

                const img =
                    document.createElement("img");


                img.src =
                    "https://drive.google.com/thumbnail?id=" +
                    encodeURIComponent(file.id) +
                    "&sz=w1400";


                img.alt =
                    file.name || "PREMSNAPS Film";


                img.loading =
                    "lazy";


                const play =
                    document.createElement("div");


                play.className =
                    "video-play";


                play.innerHTML =
                    "▶";


                const name =
                    document.createElement("div");


                name.className =
                    "file-name";


                name.textContent =
                    file.name || "";


                card.appendChild(img);

                card.appendChild(play);

                card.appendChild(name);


                card.addEventListener(
                    "click",
                    () => openVideo(file)
                );


                gallery.appendChild(card);

            }

        });


        const total =
            photoCount + videoCount;


        galleryCount.textContent =
            `${total} STORIES • ${photoCount} PHOTOS • ${videoCount} FILMS`;


        if(total === 0){

            gallery.innerHTML = `
                <div class="drive-loading">
                    No supported photos or videos found.
                </div>
            `;

        }

    }

    catch(error){

        console.error(
            "PREMSNAPS DRIVE ERROR:",
            error
        );


        gallery.innerHTML = `
            <div class="drive-loading">
                Unable to load our stories.
                <br><br>
                <small>
                    Please check the Google Drive API key
                    and folder permissions.
                </small>
            </div>
        `;


        galleryCount.textContent =
            "GALLERY ERROR";

    }

}


/* ================= IMAGE LIGHTBOX ================= */

function openImage(file){

    lightboxContent.innerHTML = "";


    const img =
        document.createElement("img");


    img.src =
        "https://drive.google.com/thumbnail?id=" +
        encodeURIComponent(file.id) +
        "&sz=w2400";


    img.alt =
        file.name || "PREMSNAPS";


    lightboxContent.appendChild(img);


    lightbox.classList.add("active");


    document.body.style.overflow =
        "hidden";

}


/* ================= VIDEO PLAYER ================= */

function openVideo(file){

    lightboxContent.innerHTML = "";


    const video =
        document.createElement("video");


    /*
       Google Drive API media endpoint.
       This allows the browser to request
       the actual video file.
    */

    video.src =
        "https://www.googleapis.com/drive/v3/files/" +
        encodeURIComponent(file.id) +
        "?alt=media&key=" +
        encodeURIComponent(DRIVE_API_KEY);


    video.controls =
        true;


    video.autoplay =
        true;


    video.playsInline =
        true;


    video.preload =
        "metadata";


    video.setAttribute(
        "aria-label",
        file.name || "PREMSNAPS Wedding Film"
    );


    lightboxContent.appendChild(video);


    lightbox.classList.add("active");


    document.body.style.overflow =
        "hidden";

}


/* ================= CLOSE LIGHTBOX ================= */

function closeLightbox(){

    lightbox.classList.remove(
        "active"
    );


    lightboxContent.innerHTML =
        "";


    document.body.style.overflow =
        "";

}


lightboxClose.addEventListener(
    "click",
    closeLightbox
);


lightbox.addEventListener(
    "click",
    event => {

        if(event.target === lightbox){

            closeLightbox();

        }

    }
);


/* ================= ESC KEY ================= */

document.addEventListener(
    "keydown",
    event => {

        if(
            event.key === "Escape" &&
            lightbox.classList.contains("active")
        ){

            closeLightbox();

        }

    }
);


/* ================= START ================= */

loadDriveGallery();
