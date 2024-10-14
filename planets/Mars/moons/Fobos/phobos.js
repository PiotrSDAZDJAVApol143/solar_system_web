import * as THREE from 'three';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/loaders/GLTFLoader.js';
import { createSceneCameraAndRenderer } from '../../../src/createSceneCameraAndRenderer.js';

// Tablica zmiennych
const container = document.getElementById('phobos-container');
const w = window.innerWidth;
const h = window.innerHeight;

const ambientLightPower = 5;
const bodyRadius = 0.018;
const planetRadius = bodyRadius;
const cameraPosition = planetRadius * 30;  // Kamera dalej od modelu
let phobosMesh;

// Inicjalizacja sceny, kamery i renderera
const { scene, camera, renderer, controls } = createSceneCameraAndRenderer(container, w, h, cameraPosition, planetRadius);

controls.minDistance = 0.4;

// Tworzenie grupy dla Księżyca
const moon = new THREE.Group();
scene.add(moon);

// Dodanie oświetlenia
const ambientLight = new THREE.AmbientLight(0xffffff, ambientLightPower);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Ustawienie tła na czarne
scene.background = new THREE.Color(0x000000);

// Załaduj model 3D
const loader3d = new GLTFLoader();
loader3d.load('../../../textures/3D_models/24878_Phobos_1_1000.glb', function (gltf) {
    phobosMesh = gltf.scene;
    const fobosScale = 0.0176;
    phobosMesh.scale.set(fobosScale, fobosScale, fobosScale);
    phobosMesh.position.set(0, 0, 0);  // Ustawienie na środku sceny
    phobosMesh.rotation.z = THREE.MathUtils.degToRad(1.07);
    moon.add(phobosMesh);
});

// Animacja
function animate() {
    requestAnimationFrame(animate);
    if (phobosMesh) {
        phobosMesh.rotation.y += 0.01;  // Prosta animacja dla testów
    }
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