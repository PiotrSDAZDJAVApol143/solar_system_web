//app.js
import { loadNavbar } from '../src/components/layout/navbar.js';
import { loadFooter } from '../src/components/layout/footer.js';
import { initializeMarsScene, disposeMarsScene } from '../planets/Mars/mars.js';
import { initializeMercuryScene, disposeMercuryScene } from '../planets/Mercury/mercury.js';
import { initializeVenusScene, disposeVenusScene } from '../planets/Venus/venus.js';
import { initializeEarthScene, disposeEarthScene } from '../planets/Earth/earth.js';
import { initializeJupiterScene, disposeJupiterScene } from '../planets/Jupiter/jupiter.js';



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
  disposeMercuryScene();
  disposeVenusScene();
  disposeEarthScene();

}

function loadHome() {
  const content = document.getElementById("content");
  content.innerHTML = `
    <h1>Witamy na Stronie Głównej Astro-Friq</h1>
    <p>Znajdziesz tu różne informacje o kosmosie...</p>
  `;

  setActiveLink("home-link");
}

function loadAboutMe() {
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

function loadSolarSystem() {
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
      <li><a href="#" class="planet-container" id="sun-link">Słońce</a></li>
      <li><a href="#" class="planet-container" id="mercury-link">Merkury</a></li>
      <li><a href="#" class="planet-container" id="venus-link">Wenus</a></li>
      <li><a href="#" class="planet-container" id="earth-link">Ziemia</a></li>
      <li><a href="#" class="planet-container" id="mars-link">Mars</a></li>
      <li><a href="#" class="planet-container" id="jupiter-link">Jowisz</a></li>
      <li><a href="#" class="planet-container" id="saturn-link">Saturn</a></li>
      <li><a href="#" class="planet-container" id="uranus-link">Uran</a></li>
      <li><a href="#" class="planet-container" id="neptun-link">Neptun</a></li>
     
    </ul>
  `;
  setActiveLink("library-link");

  //document.getElementById("sun-link").addEventListener("click", loadSun);
  document.getElementById("mercury-link").addEventListener("click", loadMercury);
  document.getElementById("venus-link").addEventListener("click", loadVenus);
  document.getElementById("earth-link").addEventListener("click", loadEarth);
  document.getElementById("mars-link").addEventListener("click", loadMars);
  document.getElementById("jupiter-link").addEventListener("click", loadJupiter);
  // document.getElementById("saturn-link").addEventListener("click", loadSaturn);
  //document.getElementById("uranus-link").addEventListener("click", loadUranus);
  // document.getElementById("neptun-link").addEventListener("click", loadUranus);

}

function loadFunAndFacts() {
  const content = document.getElementById("content");
  content.innerHTML = `
    <h1> Tu będą informacje naukowe i śmieszne ciekawostki </h1>
  `;
  setActiveLink("fun-facts-link");
}

function loadContact() {
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
        <div class="col-md-6 planet-container" id="mars-container" style="height: 80vh;">
        </div>
        <!-- Prawa strona: informacje o Marsie -->
       <div class="col-md-3" id="planet-info">
      <h2>Informacje o Marsie</h2>
      <p>Mars jest czwartą planetą od Słońca...</p>
    </div>
      </div>
    </div>
  `;
  const container = document.getElementById('mars-container');
  console.log("Wymiary mars-container:", container.clientWidth, container.clientHeight);

  // Inicjalizuj scenę Marsa
  initializeMarsScene(container);
}

function loadMercury() {
  disposeMercuryScene();

  const content = document.getElementById("content");

  content.innerHTML = `
    <div class="container-fluid">
      <div class="row">
        <div class="col-md-6 planet-container" id="mercury-container" style="height: 80vh;">
        </div>

       <div class="col-md-3" id="planet-info">
      <h2>Informacje o Mercury</h2>
      <p>Mercury jest 1 planetą od Słońca...</p>
    </div>
      </div>
    </div>
  `;
  const container = document.getElementById('mercury-container');
  console.log("Wymiary mercury-container:", container.clientWidth, container.clientHeight);

  // Inicjalizuj scenę
  initializeMercuryScene(container);
}
function loadVenus() {
  disposeVenusScene();

  const content = document.getElementById("content");

  content.innerHTML = `
    <div class="container-fluid">
      <div class="row">
        <div class="col-md-6 planet-container" id="venus-container" style="height: 80vh;">
        </div>

       <div class="col-md-3" id="planet-info">
      <h2>Informacje o Venus</h2>
      <p>Wenus jest 2 planetą od Słońca...</p>
    </div>
      </div>
    </div>
  `;
  const container = document.getElementById('venus-container');
  console.log("Wymiary venus-container:", container.clientWidth, container.clientHeight);

  // Inicjalizuj scenę
  initializeVenusScene(container);
}

function loadEarth() {
  disposeEarthScene();
  const content = document.getElementById("content");

  content.innerHTML = `
    <div class="container-fluid">
      <div class="row">
        <div class="col-md-6 planet-container" id="earth-container" style="height: 80vh;">
        </div>

       <div class="col-md-3" id="planet-info">
      <h2>Informacje o Ziemi</h2>
      <p>Ziemia jest 3 planetą od Słońca...</p>
    </div>
      </div>
    </div>
  `;

  const container = document.getElementById('earth-container');
  console.log("Wymiary earth-container:", container.clientWidth, container.clientHeight);
  initializeEarthScene(container);
}

function loadJupiter() {
  disposeJupiterScene();
  const content = document.getElementById("content");
  content.innerHTML = `
    <div class="container-fluid">
      <div class="row">
        <div class="col-md-6 planet-container" id="jupiter-container" style="height: 80vh;">
        </div>

       <div class="col-md-3" id="planet-info">
      <h2>Informacje o Jowiszu</h2>
      <p>Największe gazowe bydle w Układzie Słonecznym</p>
    </div>
      </div>
    </div>
  `;

  const container = document.getElementById('jupiter-container');
  console.log("Wymiary jupiter-container:", container.clientWidth, container.clientHeight);
  initializeJupiterScene(container);

}


function setActiveLink(activeId) {
  const links = document.querySelectorAll(".navbar a");
  links.forEach(link => {
    link.classList.remove("active");
  });
  const activeLink = document.getElementById(activeId);
  activeLink.classList.add("active");
}
