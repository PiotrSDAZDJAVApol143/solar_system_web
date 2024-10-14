import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js';
import getStarfield from "../../src/scenes/getStarfield.js";
import { createSceneCameraAndRenderer } from '../../src/components/controls/createSceneCameraAndRenderer.js';
import { createPlanet } from '../../src/models/createPlanet.js';
import { addSunAndLight } from '../../src/animations/getLightSun.js';
import { createSpaceHorizon } from '../../src/scenes/createSpaceHorizon.js';

// tablica zmiennych
const container = document.getElementById('mercury-container');
const w = window.innerWidth;
const h = window.innerHeight;
const planetRadius = 3.83;
const axialTilt = -0.034;
const cameraPosition = planetRadius*2;
const flarePower = 900;
const mercuryDay = 1765;
const sunOrbitDuration = 2638;
const sunRadius = 1093;
const sunDistance = 57900;
const spaceHorizonDistance = 500000;
const ambientLightPower = 5;

const { scene, camera, renderer, controls } = createSceneCameraAndRenderer(container, w, h, cameraPosition, planetRadius);

const mercuryPlanet = new THREE.Group();
mercuryPlanet.rotation.z = axialTilt * Math.PI / 180;  // Nachylenie osi 
scene.add(mercuryPlanet);

//generator tworzenia planety
const loader = new THREE.TextureLoader();
const mercuryMesh = createPlanet(planetRadius, "../../assets/textures/mercury/8k_mercury.jpg", 5);
mercuryPlanet.add(mercuryMesh);

//horyzont kosmosu
createSpaceHorizon(scene, spaceHorizonDistance);

//Słońce
const { sunMesh, sunLight, sunPivot, ambientLight} = addSunAndLight(scene, sunDistance, sunRadius, flarePower, ambientLightPower);

// Gwiazdy
const stars = getStarfield({ numStars: 500 });
scene.add(stars);

// Animacja
function animate() {
    requestAnimationFrame(animate);

    // Rotacja Planety
    mercuryMesh.rotation.y += (2 * Math.PI) / (mercuryDay * 60);

    // Okrągła orbita Słońca (przeciwnie do wskazówek zegara)
    const time = (Date.now() / 1000) / sunOrbitDuration * Math.PI * 2; // Obliczamy czas dla pełnej orbity w 10957,5 sekund
    sunMesh.position.x = Math.cos(-time) * sunDistance;  // Ujemny czas dla odwrotnej orbity
    sunMesh.position.z = Math.sin(-time) * sunDistance;
    sunLight.position.set(sunMesh.position.x, sunMesh.position.y, sunMesh.position.z);
    renderer.render(scene, camera);
}

animate();

// Obsługa zmiany rozmiaru okna
function handleWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleWindowResize, false);