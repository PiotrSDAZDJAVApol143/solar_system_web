
import { loadNavbar } from '../src/components/layout/navbar.js';
import { loadFooter } from '../src/components/layout/footer.js';
import { initializeMarsScene, disposeMarsScene } from '../planets/Mars/mars.js';

document.addEventListener("DOMContentLoaded", () => {

  loadNavbar();
  loadFooter();

  document.getElementById("home-link").addEventListener("click", loadHome);
  document.getElementById("about-link").addEventListener("click", loadAboutMe);
  document.getElementById("solar-system-link").addEventListener("click", loadSolarSystem);
  document.getElementById("library-link").addEventListener("click", loadLibrary);
  document.getElementById("fun-facts-link").addEventListener("click", loadFunAndFacts);
  document.getElementById("contact-link").addEventListener("click", loadContact);
  loadHome(); /*domyślnie strona główna */
});

function disposeCurrentScene() {
  disposeMarsScene();
  // disposeEarthScene();
  // disposeMoonScene();
}

function loadHome() {
  const content = document.getElementById("content");
  content.innerHTML = `
    <h1>Witamy na Stronie Głównej Astro-Friq</h1>
    <p>Znajdziesz tu różne informacje o kosmosie...</p>
  `;
  
  setActiveLink("home-link");
}

function loadAboutMe(){
  const content = document.getElementById("content");
  content.innerHTML = `
    <h1> To sem ja :) </h1>
  `;
  setActiveLink("about-link");
}

function clearThree(obj) {
  while (obj.children.length > 0) {
    clearThree(obj.children[0]);
    obj.remove(obj.children[0]);
  }

  if (obj.geometry) obj.geometry.dispose();
  if (obj.material) {
    if (obj.material instanceof Array) {
      obj.material.forEach((mat) => mat.dispose());
    } else {
      obj.material.dispose();
    }
  }
}

function loadSolarSystem(){
  const content = document.getElementById("content");
  content.innerHTML = `
    <h1> Tu będzie interaktywny model układu słoneczego w skali w 3D ;O </h1>
  `;
  setActiveLink("solar-system-link");
}

function loadLibrary() {
  const content = document.getElementById("content");
  content.innerHTML = `
    <h1 id="library_content_title">Biblioteka Astralna</h1>
    <ul id="library-list">
      <li><a href="#" id="sun-link">Słońce</a></li>
      <li><a href="#" id="mercury-link">Merkury</a></li>
      <li><a href="#" id="venus-link">Wenus</a></li>
      <li><a href="#" id="earth-link">Ziemia</a></li>
      <li><a href="#" id="moon-link">Księżyc</a></li>
      <li><a href="#" id="mars-link">Mars</a></li>
      <li><a href="#" id="jupiter-link">Jowisz</a></li>
      <li><a href="#" id="saturn-link">Saturn</a></li>
      <li><a href="#" id="uranus-link">Uran</a></li>
      <li><a href="#" id="uranus-link">Neptun</a></li>
     
    </ul>
  `;
  setActiveLink("library-link");

  document.getElementById("mars-link").addEventListener("click", loadMars);
  document.getElementById("earth-link").addEventListener("click", loadEarth);
  document.getElementById("moon-link").addEventListener("click", loadMoon);
}

function loadFunAndFacts(){
  const content = document.getElementById("content");
  content.innerHTML = `
    <h1> Tu będą informacje naukowe i śmieszne ciekawostki </h1>
  `;
  setActiveLink("fun-facts-link");
}

function loadContact(){
  const content = document.getElementById("content");
  content.innerHTML = `
    <h1> Tu się wklei jakiś kontakt </h1>
  `;
  setActiveLink("contact-link");
}


function loadMars() {
  // Usuń poprzednią scenę, jeśli istnieje
  disposeMarsScene();

  const content = document.getElementById("content");
  content.innerHTML = `
    <div class="container-fluid">
      <div class="row">
        <!-- Lewa strona: grafika Marsa -->
        <div class="col-md-6" id="mars-container" style="height: 80vh;">
        </div>
        <!-- Prawa strona: informacje o Marsie -->
       <div class="col-md-3" id="mars-info">
      <h2>Informacje o Marsie</h2>
      <p>Mars jest czwartą planetą od Słońca...</p>
    </div>
      </div>
    </div>
  `;
  const container = document.getElementById('mars-container');
  console.log("Wymiary mars-container:", container.clientWidth, container.clientHeight);

  // Załaduj skrypt Three.js z animacją Marsa
 // const script = document.createElement("script");
 // script.type = "module";
 // script.src = "./planets/Mars/mars.js";  // Ścieżka do pliku Mars.js
 // document.body.appendChild(script);

 // Inicjalizuj scenę Marsa
 initializeMarsScene(container);
}


function loadEarth() {
  const content = document.getElementById("content");
  content.innerHTML = '<div id="mars-container" style="width: 60%; height: 60vh; position: relative; float: left;"></div>';
  const script = document.createElement("script");
  script.type = "module";
  script.src = "../planets/Earth/earth.js"; // Ścieżka do pliku Ziemi
  document.body.appendChild(script);
}

function loadMoon() {
  const content = document.getElementById("content");
  content.innerHTML = '<div id="moon-container" style="width: 60%; padding-top: 60%; position: relative;"></div>';
  const script = document.createElement("script");
  script.type = "module";
  script.src = "../planets/Earth/Moon/moon.js"; // Ścieżka do pliku Księżyca
  document.body.appendChild(script);
}
function setActiveLink(activeId) {
  const links = document.querySelectorAll(".navbar a");
  links.forEach(link => {
    link.classList.remove("active");
  });
  const activeLink = document.getElementById(activeId);
  activeLink.classList.add("active");
}
