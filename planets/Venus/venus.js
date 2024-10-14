import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js';
import getStarfield from "../../src/scenes/getStarfield.js";
import { getFresnelMat } from "../../src/utils/getFresnelMat.js";
import { createSceneCameraAndRenderer } from '../../src/components/controls/createSceneCameraAndRenderer.js';
import { createPlanet } from '../../src/models/createPlanet.js';
import { addSunAndLight } from '../../src/animations/getLightSun.js';
import { createSpaceHorizon } from '../../src/scenes/createSpaceHorizon.js';

//Tablica Zmiennych
const container = document.getElementById('venus-container');
const w = window.innerWidth;
const h = window.innerHeight;
const planetRadius = 9.5;
const axialTilt = -2.64;
const cameraPosition = planetRadius*2;
const flarePower = 700;
const venusDay = 7290;
const sunOrbitDuration = 6741;
const venusCloudRotationDuration = 120;
const sunRadius = 1093;
const sunDistance = 108000;
const spaceHorizonDistance = 250000;
const ambientLightPower = 4;

const { scene, camera, renderer, controls } = createSceneCameraAndRenderer(container, w, h, cameraPosition, planetRadius);

const venusPlanet = new THREE.Group();
venusPlanet.rotation.z = axialTilt * Math.PI / 180;  // Nachylenie osi 
scene.add(venusPlanet);

const loader = new THREE.TextureLoader();
const venusMesh = createPlanet(planetRadius, "../../assets/textures/venus/8k_venus_surface.jpg", 30)
venusPlanet.add(venusMesh);

const cloudsMat = new THREE.MeshStandardMaterial({
    map: loader.load("../../assets/textures/venus/4k_venus_atmosphere.jpg"),
    transparent: true,
    opacity: 0.95,
    blending: THREE.NormalBlending,
});

const cloudsMesh = new THREE.Mesh(venusMesh.geometry, cloudsMat);
cloudsMesh.scale.setScalar(1.035);
venusPlanet.add(cloudsMesh);

const fresnelMat = getFresnelMat({
    rimHex: 0xffcc99,   // Kolor poświaty Wenus
    facingHex: 0x000000,  // Kolor widoczny od frontu
    fresnelBias: 0.1,   // Większa intensywność efektu na krawędziach
    fresnelScale: 1.5,  // Mocniejszy efekt Fresnela
    fresnelPower: 1.0   // Większe rozciągnięcie efektu Fresnela
});
const glowMesh = new THREE.Mesh(venusMesh.geometry, fresnelMat);
glowMesh.scale.setScalar(1.041);
venusPlanet.add(glowMesh);

//horyzont kosmosu
createSpaceHorizon(scene, spaceHorizonDistance);

// Słońce
const { sunMesh, sunLight, sunPivot, ambientLight} = addSunAndLight(scene, sunDistance, sunRadius, flarePower, ambientLightPower);

// Gwiazdy
const stars = getStarfield({ numStars: 200 });
scene.add(stars);

// Animacja
function animate() {
    requestAnimationFrame(animate);

    // Rotacja Planety
    venusMesh.rotation.y += (2 * Math.PI) / (venusDay * 60);
    cloudsMesh.rotation.y += (2 * Math.PI) / (venusCloudRotationDuration * 60);

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