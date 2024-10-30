import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js';
import { getFresnelMat } from "../../src/utils/getFresnelMat.js";
import { createSceneCameraAndRenderer } from '../../src/components/controls/createSceneCameraAndRenderer.js';
import { createPlanet } from '../../src/models/createPlanet.js';
import getStarfield from "../../src/scenes/getStarfield.js";
import { addSunAndLight } from '../../src/animations/getLightSun.js';
import { createSpaceHorizon } from '../../src/scenes/createSpaceHorizon.js';


const container = document.getElementById("three-container");

const w = window.innerWidth;
const h = window.innerHeight;
const planetRadius = 10;
const axialTilt = -23.4 ;
const cameraPosition = planetRadius*2;
const flarePower = 350;
const earthDay = 30;  // Pełny obrót Ziemi w 30 sekund
const moonOrbitDuration = 819.6;  // Pełna orbita Księżyca w 819,6 sekund (27,32 dni)
const sunOrbitDuration = 10957.5;  // Pełna orbita Słońca w 10957,5 sekund (365,25 dni)
const sunRadius = 1093;
const sunDistance = 234800;
const spaceHorizonDistance = 500000;
const ambientLightPower = 3.5;
const rotationAngle = 60;


const { scene, camera, renderer, controls } = createSceneCameraAndRenderer(container, w, h, cameraPosition, planetRadius, rotationAngle);

// Grupa reprezentująca Ziemię
const earthPlanet = new THREE.Group();
earthPlanet.rotation.z = axialTilt * Math.PI / 180;  // Nachylenie osi Ziemi
scene.add(earthPlanet);

// Ziemia
const detail = 16;
const loader = new THREE.TextureLoader();
const geometry = new THREE.IcosahedronGeometry(planetRadius, detail);
const material = new THREE.MeshPhongMaterial({
    map: loader.load("../../assets/textures/earth/8k_earth_daymap.jpg"),
    shininess: 10  // Dodajemy blask dla realizmu
});
const earthMesh = new THREE.Mesh(geometry, material);
earthMesh.castShadow = true;
earthMesh.receiveShadow = true;
earthPlanet.add(earthMesh);

const lightsAtNight = new THREE.MeshBasicMaterial({
    map: loader.load("../../assets/textures/earth/8k_earth_nightmap.jpg"),
    blending: THREE.AdditiveBlending,
});
const earthAtNight = new THREE.Mesh(earthMesh.geometry, lightsAtNight);
earthPlanet.add(earthAtNight);

const cloudsMat = new THREE.MeshStandardMaterial({
    map: loader.load("../../assets/textures/earth/clouds_8k.jpg"),
    transparent: false,
    opacity: 1.2,
    blending: THREE.AdditiveBlending,
    //alphaMap: loader.load('./textures/8k_earth_clouds.jpg'),
});
const cloudsMesh = new THREE.Mesh(earthMesh.geometry, cloudsMat);
cloudsMesh.scale.setScalar(1.003);
earthPlanet.add(cloudsMesh);

const fresnelMat = getFresnelMat();
const glowMesh = new THREE.Mesh(earthMesh.geometry, fresnelMat);
glowMesh.scale.setScalar(1.0157);
earthPlanet.add(glowMesh);

// Księżyc
const moonRadius = 2.73;
const moonDistance = 603;
const moonPivot = new THREE.Object3D();  // Przegub dla orbity Księżyca
earthPlanet.add(moonPivot);  // Dodaj przegub do Ziemi

const createMoon = (r = moonRadius) => {
    const moonGeo = new THREE.SphereGeometry(r, 20, 20);
    const moonMat = new THREE.MeshPhongMaterial({
        map: loader.load("../../assets/textures/earth/Moon/8k_moon.jpg"),
        shininess: 15  // Blask Księżyca
       
    });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    moonMesh.position.set(moonDistance, 0, 0);  // Ustawienie pozycji Księżyca
    moonMesh.castShadow = true;
    moonMesh.receiveShadow = true;
    return moonMesh;
};
const moon = createMoon();
moonPivot.add(moon);  // Dodaj Księżyc do przegubu


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

    // Rotacja Ziemi
    earthMesh.rotation.y += (2 * Math.PI) / (earthDay * 60);
    earthAtNight.rotation.y += (2 * Math.PI) / (earthDay * 60);
    cloudsMesh.rotation.y += (2 * Math.PI) / (earthDay * 50);
    glowMesh.rotation.y += (2 * Math.PI) / (earthDay * 60);

    // Orbita Księżyca wokół Ziemi
    moonPivot.rotation.y += (2 * Math.PI) / (moonOrbitDuration * 60);
    moonPivot.rotation.x = THREE.MathUtils.degToRad(5.145);

    // Obrót Księżyca wokół własnej osi
    moon.rotation.y += 0.001;

    // Okrągła orbita Słońca (przeciwnie do wskazówek zegara)
    const time = (Date.now() / 1000) / sunOrbitDuration * Math.PI * 2; // Obliczamy czas dla pełnej orbity w 10957,5 sekund
    const sunDistance = 234800;  // Stała odległość Słońca

    sunMesh.position.x = Math.cos(-time) * sunDistance;  // Ujemny czas dla odwrotnej orbity
    sunMesh.position.z = Math.sin(-time) * sunDistance;
    sunLight.position.set(sunMesh.position.x, sunMesh.position.y, sunMesh.position.z);
    //console.log('Pozycja Księżyca:', moon.getWorldPosition(new THREE.Vector3()));
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
