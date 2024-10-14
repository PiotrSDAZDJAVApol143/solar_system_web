import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/controls/OrbitControls.js';
import { getFresnelMat } from "../../src/utils/getFresnelMat.js";
import { Lensflare, LensflareElement } from 'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/objects/Lensflare.js';
import getStarfield from "../../src/scenes/getStarfield.js";
const container = document.getElementById("three-container");

const w = window.innerWidth;
const h = window.innerHeight;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 250000);
camera.position.z = 50;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(w, h);
container.appendChild(renderer.domElement);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Opcjonalnie dla miękkich cieni



// Grupa reprezentująca Ziemię
const earthPlanet = new THREE.Group();
earthPlanet.rotation.z = -23.4 * Math.PI / 180;  // Nachylenie osi Ziemi
scene.add(earthPlanet);

const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 11;
controls.maxDistance = 350;

// Ziemia
const detail = 16;
const loader = new THREE.TextureLoader();
const geometry = new THREE.IcosahedronGeometry(10, detail);
const material = new THREE.MeshPhongMaterial({
    map: loader.load("../../assets/textures/earth/8k_earth_daymap.jpg"),
    shininess: 10  // Dodajemy blask dla realizmu
});
const earthMesh = new THREE.Mesh(geometry, material);
earthMesh.castShadow = true;
earthMesh.receiveShadow = true;
earthPlanet.add(earthMesh);

// Księżyc
const moonRadius = 2.72;
const moonDistance = 300;
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



const lightsAtNight = new THREE.MeshBasicMaterial({
    map: loader.load("../../assets/textures/earth/8k_earth_nightmap.jpg"),
    blending: THREE.AdditiveBlending,
});
const earthAtNight = new THREE.Mesh(geometry, lightsAtNight);
earthPlanet.add(earthAtNight);

const cloudsMat = new THREE.MeshStandardMaterial({
    map: loader.load("../../assets/textures/earth/clouds_8k.jpg"),
    transparent: false,
    opacity: 1.2,
    blending: THREE.AdditiveBlending,
    //alphaMap: loader.load('./textures/8k_earth_clouds.jpg'),
});
const cloudsMesh = new THREE.Mesh(geometry, cloudsMat);
cloudsMesh.scale.setScalar(1.003);
earthPlanet.add(cloudsMesh);

const fresnelMat = getFresnelMat();
const glowMesh = new THREE.Mesh(geometry, fresnelMat);
glowMesh.scale.setScalar(1.0157);
earthPlanet.add(glowMesh);



// Światło otoczenia dla
const ambientLight = new THREE.AmbientLight(0x404040, 3.5);  
scene.add(ambientLight);

const spaceTexture = loader.load('./textures/8k_stars_milky_way.jpg'); // Załaduj 8k teksturę kosmosu
//const spaceTexture = loader.load('./textures/space2.jpeg'); // Załaduj 6k teksturę kosmosu
const spaceGeometry = new THREE.SphereGeometry(250000, 50, 50);
const spaceMaterial = new THREE.MeshBasicMaterial({
    map: spaceTexture,
    side: THREE.BackSide  // Odwrócenie normalnych, żeby tekstura była widoczna od wewnątrz
});

const spaceSphere = new THREE.Mesh(spaceGeometry, spaceMaterial);
scene.add(spaceSphere);

// Dodajemy światło od Słońca
const sunLight = new THREE.DirectionalLight(0xffffff, 3.0);
sunLight.position.set(150000, 0, 0);  // Ustawienie Słońca z odległością
sunLight.castShadow = true;  // Cieniowanie
scene.add(sunLight);

// Słońce
const sunRadius = 1090;
const sunGeo = new THREE.SphereGeometry(sunRadius, 32, 32);
const sunMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sunMesh = new THREE.Mesh(sunGeo, sunMat);
sunMesh.position.set(150000, 0, 0);  // Znowu ustawiamy pozycję Słońca
scene.add(sunMesh);

// Dodajemy efekt rozbłysku
const flareTexture = loader.load('./textures/stars/lensflare0.png');
const lensflare = new Lensflare();
lensflare.addElement(new LensflareElement(flareTexture, 300, 0));
sunMesh.add(lensflare);
// Orbita Słońca
const sunPivot = new THREE.Object3D();
scene.add(sunPivot);
sunPivot.add(sunMesh);
sunPivot.add(sunLight);

// Gwiazdy
const stars = getStarfield({ numStars: 200 });
scene.add(stars);

// Czasy rotacji i orbity (w sekundach, przeskalowane do animacji)
const earthDay = 30;  // Pełny obrót Ziemi w 30 sekund
const moonOrbitDuration = 819.6;  // Pełna orbita Księżyca w 819,6 sekund (27,32 dni)
const sunOrbitDuration = 10957.5;  // Pełna orbita Słońca w 10957,5 sekund (365,25 dni)



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
    const sunDistance = 150000;  // Stała odległość Słońca

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
