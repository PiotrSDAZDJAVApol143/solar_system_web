import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/controls/OrbitControls.js';
import { getFresnelMat } from "../src/getFresnelMat.js";
import { Lensflare, LensflareElement } from 'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/objects/Lensflare.js';
import getStarfield from "../src/getStarfield.js";
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/loaders/GLTFLoader.js';
const container = document.getElementById('neptune-container');

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
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const neptunePlanet = new THREE.Group();
neptunePlanet.rotation.z = -28.32 * Math.PI / 180;  // Nachylenie osi 
scene.add(neptunePlanet);

const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 39;
controls.maxDistance = 350;

const radius = 38.65; // Promień Planety
const widthSegments = 64; // Więcej segmentów, aby zwiększyć jakość
const heightSegments = 64; // Więcej segmentów, aby uzyskać gładszą kulę

const loader = new THREE.TextureLoader();
const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
const material = new THREE.MeshPhongMaterial({
    map: loader.load("../textures/neptune/2k_neptune.jpg"),
    shininess: 30  // Blask dla realizmu
});


const neptuneMesh = new THREE.Mesh(geometry, material);
neptuneMesh.castShadow = true;
neptuneMesh.receiveShadow = true;
neptunePlanet.add(neptuneMesh);

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

const spaceTexture = loader.load('../textures/8k_stars_milky_way.jpg'); // Załaduj 8k teksturę kosmosu
const spaceGeometry = new THREE.SphereGeometry(250000, 50, 50);
const spaceMaterial = new THREE.MeshBasicMaterial({
    map: spaceTexture,
    side: THREE.BackSide  // Odwrócenie normalnych, żeby tekstura była widoczna od wewnątrz
});
const spaceSphere = new THREE.Mesh(spaceGeometry, spaceMaterial);
scene.add(spaceSphere);

const sunLight = new THREE.DirectionalLight(0xffffff, 3.5);
sunLight.position.set(150000, 0, 0);  // Ustawienie Słońca z odległością
sunLight.castShadow = true;  // Cieniowanie
scene.add(sunLight);


// Słońce
const sunRadius = 54.5;
const sunDistance = 224750;
const sunTexture = loader.load("../textures/stars/8k_sun.jpg")
const sunGeo = new THREE.SphereGeometry(sunRadius, 32, 32);
const sunMat = new THREE.MeshBasicMaterial({ map: sunTexture });
const sunMesh = new THREE.Mesh(sunGeo, sunMat);
sunMesh.position.set(sunDistance, 0, 0);  // Znowu ustawiamy pozycję Słońca
scene.add(sunMesh);


// Dodajemy efekt rozbłysku
const flareTexture = loader.load('../textures/stars/lensflare0.png');
const lensflare = new Lensflare();
lensflare.addElement(new LensflareElement(flareTexture, 50, 0));
sunMesh.add(lensflare);

// Orbita Słońca
const sunPivot = new THREE.Object3D();
scene.add(sunPivot);
sunPivot.add(sunMesh);
sunPivot.add(sunLight);

// Gwiazdy
const stars = getStarfield({ numStars: 200 });
scene.add(stars);

const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

//ksieżyce:
let naiadMesh, thalassaMesh, despinaMesh, galateaMesh, larissaMesh, hippocampMesh, proteusMesh, tritonMesh, nereidMesh, halimedeMesh, saoMesh, laomedeiaMesh, psamatheMesh, nesoMesh,s2002m5Mesh, s2021m1Mesh;
const naiadPivot = new THREE.Object3D();
const thalassaPivot = new THREE.Object3D();
const despinaPivot = new THREE.Object3D();
const galateaPivot = new THREE.Object3D();
const larissaPivot = new THREE.Object3D();
const hippocampPivot = new THREE.Object3D();
const tritonPivot = new THREE.Object3D();
const nereidPivot = new THREE.Object3D();
const halimedePivot = new THREE.Object3D();
const proteusPivot = new THREE.Object3D();
const saoPivot = new THREE.Object3D();
const laomedeiaPivot = new THREE.Object3D();
const psamathePivot = new THREE.Object3D();
const nesoPivot = new THREE.Object3D();
const s2002m5Pivot = new THREE.Object3D();
const s2021m1Pivot = new THREE.Object3D();







//informacje odnośnie orbit w skali 30sec = 1 dzień ziemski
const neptuneDay = 20;
const sunOrbitDuration = 403600;



// Animacja
function animate() {
    requestAnimationFrame(animate);

    // Rotacja Planety
    neptuneMesh.rotation.y += (2 * Math.PI) / (neptuneDay * 60);
   

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