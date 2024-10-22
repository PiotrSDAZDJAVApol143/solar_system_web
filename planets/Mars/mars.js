// mars.js

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.169/examples/jsm/loaders/GLTFLoader.js';
import { createSceneCameraAndRenderer } from '../../src/components/controls/createSceneCameraAndRenderer.js';
import { createPlanet } from '../../src/models/createPlanet.js';
import { addSunAndLight } from '../../src/animations/getLightSun.js';
import { createSpaceHorizon } from '../../src/scenes/createSpaceHorizon.js';
import getStarfield from '../../src/scenes/getStarfield.js';
import { cleanMaterial } from '../../src/utils/cleanMaterial.js';
import { handleWindowResize } from '../../src/scenes/handleWindowResize.js';
import { initializeGUI } from '../../src/components/controls/guiControls.js';
import { disposeScene } from '../../src/utils/disposeScene.js';
import { initializeLabelRenderer, createLabel, updateLabelVisibility } from '../../src/utils/labelUtils.js';

// Zmienne globalne dla modułu
let scene, camera, renderer, controls, animateId;
let marsPlanet, phobosPivot, deimosPivot;
let marsMesh, phobosMesh, deimosMesh, phobosLabel, deimosLabel;
let sunMesh, sunLight, sunPivot, ambientLight;
let container, labelRenderer;
let onWindowResize;
let gui;
let guiParams = {
    showObjectNames: false,
};
let raycaster = new THREE.Raycaster();
let occlusionObjects = [];

// Parametry planety i innych obiektów
const planetRadius = 5.32;
const axialTilt = -25.19;
const cameraPosition = planetRadius * 2;
const flarePower = 300;
const marsDay = 30.75;
const sunOrbitDuration = 20610;
const sunRadius = 1093;
const sunDistance = 357790;
const phobosOrbitDuration = 9.5;
const phobosRotationDuration = 9.5;
const deimosOrbitDuration = 37.9;
const deimosRotationDuration = 37.9;
const spaceHorizonDistance = 500000;
const ambientLightPower = 3;
const rotationAngle = 260;


export function initializeMarsScene(containerElement) {
    container = containerElement;

    // Sprawdź, czy scena już istnieje
    if (scene) {
        disposeMarsScene();
    }
    raycaster = new THREE.Raycaster();
    raycaster.params.Points.threshold = 0;
    
    console.log("Wymiary mars-container:", container.clientWidth, container.clientHeight);
    const w = container.clientWidth;
    const h = container.clientHeight;

    // Tworzenie sceny, kamery i renderera
    const result = createSceneCameraAndRenderer(container, w, h, cameraPosition, planetRadius, rotationAngle);
    scene = result.scene;
    camera = result.camera;
    renderer = result.renderer;
    controls = result.controls;


    // Włącz obsługę cieni w rendererze
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    console.log("Renderer domElement: ", renderer.domElement);
    renderer.render(scene, camera);
    console.log("Rendering completed.");

    marsPlanet = new THREE.Group();
    marsPlanet.rotation.z = axialTilt * Math.PI / 180;  // Nachylenie osi 
    scene.add(marsPlanet);

    // Tworzenie planety Mars
    marsMesh = createPlanet(planetRadius, "../../assets/textures/mars/8k_mars.jpg", 5);
    marsMesh.receiveShadow = true;
    marsPlanet.add(marsMesh);
    occlusionObjects.push(marsMesh);

    // Horyzont kosmosu
    createSpaceHorizon(scene, spaceHorizonDistance);

    // Słońce i światło
    const sunResult = addSunAndLight(scene, sunDistance, sunRadius, flarePower, ambientLightPower);
    sunMesh = sunResult.sunMesh;
    sunLight = sunResult.sunLight;
    sunPivot = sunResult.sunPivot;
    ambientLight = sunResult.ambientLight;

    // Gwiazdy
    const stars = getStarfield({ numStars: 500 });
    scene.add(stars);

    // Ładowanie Fobosa i Deimosa
    phobosPivot = new THREE.Object3D();
    deimosPivot = new THREE.Object3D();
    marsPlanet.add(phobosPivot);
    marsPlanet.add(deimosPivot);

    // Inicjalizacja CSS2DRenderer
    labelRenderer = initializeLabelRenderer(container);

    const loader3d = new GLTFLoader();
    loader3d.load('../../assets/textures/3D_models/24878_Phobos_1_1000.glb', function (gltf) {
        phobosMesh = gltf.scene;
        const phobosScale = 0.0176;  // Skala Fobosa
        phobosMesh.scale.set(phobosScale, phobosScale, phobosScale);
        phobosMesh.position.set(14.7, 0, 0);  // Odległość od Marsa
        phobosMesh.rotation.z = THREE.MathUtils.degToRad(1.07);
        phobosMesh.shininess = 10;
        phobosMesh.castShadow = true;
        phobosPivot.add(phobosMesh);
        occlusionObjects.push(phobosMesh);
        phobosLabel = createLabel("Fobos");
        phobosMesh.add(phobosLabel);
        phobosLabel.visible = guiParams.showObjectNames;
    });


    loader3d.load('../../assets/textures/3D_models/24879_Deimos_1_1000.glb', function (gltf) {
        deimosMesh = gltf.scene;
        console.log("Deimos załadowany:", deimosMesh);
        const deimosScale = 0.0097;  // Skala Deimosa
        deimosMesh.scale.set(deimosScale, deimosScale, deimosScale);
        deimosMesh.shininess = 10;
        deimosMesh.position.set(36.8, 0, 0);  // Odległość od Marsa
        deimosMesh.rotation.z = THREE.MathUtils.degToRad(1.78);
        deimosMesh.castShadow = true;
        deimosPivot.add(deimosMesh);
        occlusionObjects.push(deimosMesh);
        deimosLabel = createLabel("Deimos");
        deimosMesh.add(deimosLabel);
        deimosLabel.visible = guiParams.showObjectNames;
    });
    onWindowResize = function () {
        handleWindowResize(camera, renderer, container, labelRenderer);
    };
    // Inicjalizacja GUI
    gui = initializeGUI(guiParams, toggleObjectNames);
    container.appendChild(gui.domElement);

    // Rozpoczęcie animacji
    window.addEventListener('resize', onWindowResize, false);
    animate();
}
export function disposeMarsScene() {
    disposeScene({
        scene,
        renderer,
        controls,
        gui,
        labelRenderer,
        animateId,
        container,
        onWindowResize,
    });

    // Resetuj zmienne
    scene = null;
    renderer = null;
    controls = null;
    gui = null;
    labelRenderer = null;
    animateId = null;
    container = null;
    onWindowResize = null;
    marsPlanet = null;
    phobosPivot = null;
    deimosPivot = null;
    marsMesh = null;
    phobosMesh = null;
    deimosMesh = null;
    phobosLabel = null;
    deimosLabel = null;
    sunMesh = null;
    sunLight = null;
    sunPivot = null;
    ambientLight = null;
    raycaster = null;
    occlusionObjects = [];
}
function animate() {
    animateId = requestAnimationFrame(animate);
    controls.update();

    // Rotacja Planety
    marsMesh.rotation.y += (2 * Math.PI) / (marsDay * 60);

    if (deimosMesh) {
        deimosPivot.rotation.y += (2 * Math.PI) / (deimosOrbitDuration * 60);  // Orbita
        deimosMesh.rotation.x += (2 * Math.PI) / (deimosRotationDuration * 60);  // Rotacja synchroniczna
    }

    if (phobosMesh) {
        phobosPivot.rotation.y += (2 * Math.PI) / (phobosOrbitDuration * 60);  // Orbita
        phobosMesh.rotation.x += (2 * Math.PI) / (phobosRotationDuration * 60);  // Rotacja synchroniczna
    }

    // Orbita Słońca
    const time = (Date.now() / 1000) / sunOrbitDuration * Math.PI * 2;
    sunMesh.position.x = Math.cos(-time) * sunDistance;
    sunMesh.position.z = Math.sin(-time) * sunDistance;
    sunLight.position.copy(sunMesh.position);
    //sunLight.position.set(sunMesh.position.x, sunMesh.position.y, sunMesh.position.z);
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
    // Aktualizacja widoczności etykiet księżyców
    if (phobosMesh && phobosLabel) {
        updateLabelVisibility(phobosLabel, phobosMesh, camera, raycaster, occlusionObjects, guiParams);
    }

    if (deimosMesh && deimosLabel) {
        updateLabelVisibility(deimosLabel, deimosMesh, camera, raycaster, occlusionObjects, guiParams);
    }
    console.log("Animacja działa");
}
function toggleObjectNames(show) {
    if (phobosLabel) phobosLabel.visible = show;
    if (deimosLabel) deimosLabel.visible = show;
}
console.log("mars.js załadowany!");