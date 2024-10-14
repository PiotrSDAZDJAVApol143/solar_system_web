import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/controls/OrbitControls.js';
import { getFresnelMat } from "../src/getFresnelMat.js";
import { Lensflare, LensflareElement } from 'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/objects/Lensflare.js';
import getStarfield from "../src/getStarfield.js";
const container = document.getElementById('mercury-container');

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

const mercuryPlanet = new THREE.Group();
mercuryPlanet.rotation.z = -0.034 * Math.PI / 180;  // Nachylenie osi 
scene.add(mercuryPlanet);

const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 4;
controls.maxDistance = 350;

//const detail = 32;
//const loader = new THREE.TextureLoader();
//const geometry = new THREE.IcosahedronGeometry(3.83, detail);
//const material = new THREE.MeshPhongMaterial({
//    map: loader.load("../textures/mercury/8k_mercury.jpg"),
//    shininess: 10  // Dodajemy blask dla realizmu
//});
const radius = 3.83; // Promień Merkurego
const widthSegments = 64; // Więcej segmentów, aby zwiększyć jakość
const heightSegments = 64; // Więcej segmentów, aby uzyskać gładszą kulę

// Tworzenie bardziej idealnej kuli
const loader = new THREE.TextureLoader();
const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
const material = new THREE.MeshPhongMaterial({
    map: loader.load("../textures/mercury/8k_mercury.jpg"),
    shininess: 5  // Blask dla realizmu
});

const mercuryMesh = new THREE.Mesh(geometry, material);
mercuryMesh.castShadow = true;
mercuryMesh.receiveShadow = true;
mercuryPlanet.add(mercuryMesh);

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
const sunRadius = 1093;
const sunDistance = 57900;
const sunTexture = loader.load("../textures/stars/8k_sun.jpg")
const sunGeo = new THREE.SphereGeometry(sunRadius, 32, 32);
const sunMat = new THREE.MeshBasicMaterial({ map: sunTexture });
const sunMesh = new THREE.Mesh(sunGeo, sunMat);
sunMesh.position.set(sunDistance, 0, 0);  // Znowu ustawiamy pozycję Słońca
scene.add(sunMesh);

// Dodajemy efekt rozbłysku
const flareTexture = loader.load('../textures/stars/lensflare0.png');
const lensflare = new Lensflare();
lensflare.addElement(new LensflareElement(flareTexture, 900, 0));
sunMesh.add(lensflare);
// Orbita Słońca
const sunPivot = new THREE.Object3D();
scene.add(sunPivot);
sunPivot.add(sunMesh);
sunPivot.add(sunLight);

// Gwiazdy
const stars = getStarfield({ numStars: 200 });
scene.add(stars);

const ambientLight = new THREE.AmbientLight(0x404040, 5); // Ustawienie intensywności na 0.5
scene.add(ambientLight);



const mercuryDay = 1765;
const sunOrbitDuration = 2638;

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