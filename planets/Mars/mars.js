import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.169/examples/jsm/loaders/GLTFLoader.js';
import { createSceneCameraAndRenderer } from '../../src/components/controls/createSceneCameraAndRenderer.js';
import { createPlanet } from '../../src/models/createPlanet.js';
import { addSunAndLight } from '../../src/animations/getLightSun.js';
import { createSpaceHorizon } from '../../src/scenes/createSpaceHorizon.js';
import getStarfield from '../../src/scenes/getStarfield.js';

//Tablica zmiennych
const container = document.getElementById('mars-container');
const w = container.clientWidth;   // Prawidłowe pobieranie szerokości kontenera
const h = container.clientHeight;  // Prawidłowe pobieranie wysokości kontenera

const planetRadius = 5.32;
const axialTilt = -25.19;
const cameraPosition = planetRadius*2;
const flarePower = 300;
const marsDay = 30.75;
const sunOrbitDuration = 20610;
const sunRadius = 1093;
const sunDistance = 357790;
const fobosOrbitDuration = 9.5;
const fobosRotationDuration = 9.5;
const deimosOrbitDuration = 37.9;
const deimosRotationDuration = 37.9;
const spaceHorizonDistance = 500000;
const ambientLightPower = 3;
const rotationAngle = 260;


const { scene, camera, renderer, controls } = createSceneCameraAndRenderer(container, w, h, cameraPosition, planetRadius, rotationAngle);


const marsPlanet = new THREE.Group();
marsPlanet.rotation.z = axialTilt * Math.PI / 180;  // Nachylenie osi 
scene.add(marsPlanet);

//generator planety
const loader = new THREE.TextureLoader();
const marsMesh = createPlanet(planetRadius, "../../assets/textures/mars/8k_mars.jpg", 5);
marsPlanet.add(marsMesh);


//const fresnelMat = getFresnelMat({
//    rimHex: 0xff4500,   // Czerwonawo-pomarańczowa poświata Marsa
//    facingHex: 0x000000,  // Czarny kolor od frontu
//    fresnelBias: 0.02,   // Subtelna poświata atmosfery
//    fresnelScale: 0.5,   // Umiarkowany efekt Fresnela
//    fresnelPower: 2.0    // Rozciągnięcie efektu poświaty na większą powierzchnię
//});
//fresnelMat.transparent = true;
//fresnelMat.opacity = 0.05;
//const glowMesh = new THREE.Mesh(geometry, fresnelMat);
//glowMesh.scale.setScalar(1.005);
//marsPlanet.add(glowMesh);


//horyzont kosmosu
createSpaceHorizon(scene, spaceHorizonDistance);

//Słońce
const { sunMesh, sunLight, sunPivot, ambientLight} = addSunAndLight(scene, sunDistance, sunRadius, flarePower, ambientLightPower);

// Gwiazdy
const stars = getStarfield({ numStars: 500 });
scene.add(stars);


let phobosMesh, deimosMesh;
const phobosPivot = new THREE.Object3D();
const deimosPivot = new THREE.Object3D();
marsPlanet.add(phobosPivot);
marsPlanet.add(deimosPivot);

const loader3d = new GLTFLoader();
loader3d.load('../../assets/textures/3D_models/24878_Phobos_1_1000.glb', function (gltf) {
    phobosMesh = gltf.scene;
    // Ustawienie odpowiedniej skali dla Fobosa
    const fobosScale = 0.0176;  // Promień Fobosa względem Marsa
    phobosMesh.scale.set(fobosScale, fobosScale, fobosScale);
    phobosMesh.position.set(14.7, 0, 0);  // Ustawienie odległości od Marsa
    phobosMesh.rotation.z = THREE.MathUtils.degToRad(1.07);
    phobosMesh.shininess = 10;
    phobosPivot.add(phobosMesh);
});
//loader3d.load('http://127.0.0.1:5500/assets/textures/3D_models/24879_Deimos_1_1000.glb', function (gltf) {
loader3d.load('../../../assets/textures/3D_models/24879_Deimos_1_1000.glb', function (gltf) {
    deimosMesh = gltf.scene;
    console.log("Deimos załadowany:", deimosMesh);
    // Ustawienie odpowiedniej skali dla Deimos
    const deimosScale = 0.0097;  // Promień Fobosa względem Marsa
    deimosMesh.scale.set(deimosScale, deimosScale, deimosScale);
    deimosMesh.shininess = 10;
    deimosMesh.position.set(36.8, 0, 0);  // Ustawienie odległości od Marsa
    deimosMesh.rotation.z = THREE.MathUtils.degToRad(1.78);
    deimosPivot.add(deimosMesh);
});


// Animacja
function animate() {
    requestAnimationFrame(animate);

    // Rotacja Planety
    marsMesh.rotation.y += (2 * Math.PI) / (marsDay * 60);
    if (deimosMesh) {
        deimosPivot.rotation.y += (2 * Math.PI) / (deimosOrbitDuration * 60);  // Orbita
        deimosMesh.rotation.x += (2 * Math.PI) / (deimosRotationDuration * 60);  // Rotacja synchroniczna
    }
    // Orbita Fobosa wokół Marsa
    if (phobosMesh) {
        phobosPivot.rotation.y += (2 * Math.PI) / (fobosOrbitDuration * 60);  // Orbita
        phobosMesh.rotation.x += (2 * Math.PI) / (fobosRotationDuration * 60);  // Rotacja synchroniczna
    }

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