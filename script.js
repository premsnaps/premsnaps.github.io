document.getElementById("year").textContent = new Date().getFullYear();

const menu = document.querySelector(".menu");
const nav = document.querySelector(".nav nav");
menu?.addEventListener("click", () => {
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
