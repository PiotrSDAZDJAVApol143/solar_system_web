//app.js
import { loadNavbar } from '../src/components/layout/navbar.js';
import { loadFooter } from '../src/components/layout/footer.js';
import { initializeMarsScene, disposeMarsScene } from '../planets/Mars/mars.js';
import { initializeMercuryScene, disposeMercuryScene } from '../planets/Mercury/mercury.js';
import { initializeVenusScene, disposeVenusScene } from '../planets/Venus/venus.js';
import { initializeEarthScene, disposeEarthScene } from '../planets/Earth/earth.js';
import { initializeJupiterScene, disposeJupiterScene } from '../planets/Jupiter/jupiter.js';
import { initializeStarfieldMainScene, pauseStarfield, resumeStarfield  } from '../src/scenes/starfieldMainScene.js';

let starfieldInitialized = false;

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

function disposeCurrentScene(callback) {
  const content = document.getElementById("content");
  const contentWrapper = content.querySelector('.content-wrapper');

  if (contentWrapper) {
    contentWrapper.classList.add('fade-out', 'fade');

    setTimeout(() => {
      // Nie usuwamy starfield
      disposeMarsScene();
      disposeMercuryScene();
      disposeVenusScene();
      disposeEarthScene();
      disposeJupiterScene();

      content.innerHTML = "";
      if (callback) {
        callback();
      }
    }, 1500);
  } else {
    if (callback) {
      callback();
    }
  }
}


function loadHome() {
  disposeCurrentScene(() => {
    const content = document.getElementById("content");
    content.innerHTML = `
      <div class="content-wrapper">
        <div class="container-fluid">
          <div class="row">
            <div class="col-md-12"  style="height: 80vh; position: relative;">
              <div class="overlay-text">
                <h1>UKŁAD SŁONECZNY I JEGO TAJEMNICE</h1>
                <p>Na tej stronie dowiesz się o faktach i śmiesznych ciekawostkach związanych z naszym Układem Słonecznym.</p>
                <p>Model Układu Słonecznego wygenerowany został w skali, aby odwzorować realizm.</p>
                <p>Wciąż pracuję nad udoskonaleniem strony, aby dawała przyjemność z nabywania wiedzy :)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const contentWrapper = content.querySelector('.content-wrapper');
    contentWrapper.classList.add('fade-in');

    requestAnimationFrame(() => {
      contentWrapper.classList.add('show');
    });

    showStarfield();

    setActiveLink("home-link");
  });
}


function loadAboutMe() {
  disposeCurrentScene(() => {
    const content = document.getElementById("content");
    content.innerHTML = `
      <div class="content-wrapper">
        <div class="container-fluid">
          <div class="row">
            <div class="col-md-12"  style="height: 80vh; position: relative;">
              <div class="overlay-text">
                <h1>O MNIE</h1>
          <p>
Cześć! Mam na imię Piotr i jestem początkującym programistą, który stawia pierwsze kroki w świecie kodowania. W 2024 roku ukończyłem kurs "Backend Java od podstaw" w Software Development Academy, co pozwoliło mi zyskać solidne fundamenty w programowaniu. Moja przygoda z programowaniem rozpoczęła się jednak wcześniej, w 2023 roku, kiedy zacząłem uczyć się samodzielnie 
z różnych źródeł, takich jak kursy na YouTube i Udemy oraz książki.

Od kilku miesięcy zgłębiam JavaScript, Three.js oraz podstawy modelowania w Blenderze, co pozwala mi rozwijać się w kierunku tworzenia interaktywnych wizualizacji i animacji 3D. Zawodowo jestem magistrem Ekonomii i pracuję jako spedytor od 13 lat, ale programowanie stało się moją prawdziwą pasją, którą realizuję z entuzjazmem i zaangażowaniem.</p>
          
          </div>
        </div>
      </div>
    </div>
  `;
  
  const contentWrapper = content.querySelector('.content-wrapper');
  contentWrapper.classList.add('fade-in');

  requestAnimationFrame(() => {
    contentWrapper.classList.add('show');
  });

  showStarfield();

  setActiveLink("about-link");
});
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
  disposeCurrentScene(() => {
    const content = document.getElementById("content");
    content.innerHTML = `
      <div class="content-wrapper">
        <div class="container-fluid">
          <div class="row">
            <div class="col-md-12"  style="height: 80vh; position: relative;">
              <div class="overlay-text">
            <h1 id="library_content_title">Biblioteka Astralna</h1>
            <div class="grid-container">
              <a href="#" class="planet-button" id="sun-link">Słońce</a>
              <a href="#" class="planet-button" id="mercury-link">Merkury</a>
              <a href="#" class="planet-button" id="venus-link">Wenus</a>
              <a href="#" class="planet-button" id="earth-link">Ziemia</a>
              <a href="#" class="planet-button" id="mars-link">Mars</a>
              <a href="#" class="planet-button" id="jupiter-link">Jowisz</a>
              <a href="#" class="planet-button" id="saturn-link">Saturn</a>
              <a href="#" class="planet-button" id="uranus-link">Uran</a>
              <a href="#" class="planet-button" id="neptun-link">Neptun</a>
          </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  `;
  const contentWrapper = content.querySelector('.content-wrapper');
    contentWrapper.classList.add('fade-in');
    
    requestAnimationFrame(() => {
      contentWrapper.classList.add('show');
    });
    
    showStarfield();
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
});
}

function loadFunAndFacts() {
  const content = document.getElementById("content");
  content.innerHTML = `
   <div class="container-fluid">
      <div class="row">
        <div class="col-md-12"  style="height: 80vh; position: relative;">
          <div class="overlay-text">
    <h1> Tu będą informacje naukowe i śmieszne ciekawostki </h1>
          </div>
        </div>
      </div>
    </div>
  `;
  showStarfield();
  setActiveLink("fun-facts-link");
}

function loadContact() {
  disposeCurrentScene(() => {
    const content = document.getElementById("content");
    content.innerHTML = `
      <div class="content-wrapper">
        <div class="container-fluid">
          <div class="row">
            <div class="col-md-12"  style="height: 80vh; position: relative;">
              <div class="overlay-text">
    <h1> Tu się wklei jakiś kontakt </h1>
     </div>
        </div>
      </div>
    </div>
    </div>
  `;
  
  const contentWrapper = content.querySelector('.content-wrapper');
  contentWrapper.classList.add('fade-in');

  requestAnimationFrame(() => {
    contentWrapper.classList.add('show');
  });

  showStarfield();

  setActiveLink("contact-link");
});
}


function loadMars() {
  hideStarfield();
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
      <p> Dane będą zaciągane z backendu z bazy danych</p>
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
  hideStarfield();
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
      <p> Dane będą zaciągane z backendu z bazy danych</p>
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
  hideStarfield();
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
  hideStarfield();
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
  hideStarfield();
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
function showStarfield() {
  const starfieldContainer = document.getElementById('starfield-container');
  starfieldContainer.style.display = 'block';

  if (!starfieldInitialized) {
    initializeStarfieldMainScene(starfieldContainer);
    starfieldInitialized = true;
  } else {
    resumeStarfield();
  }
}

function hideStarfield() {
  const starfieldContainer = document.getElementById('starfield-container');
  starfieldContainer.style.display = 'none';
  pauseStarfield();
}