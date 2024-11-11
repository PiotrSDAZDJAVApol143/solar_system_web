// mars.js

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169/build/three.module.js';
import * as TWEEN from 'https://cdn.jsdelivr.net/npm/@tweenjs/tween.js@18.6.4/dist/tween.esm.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.169/examples/jsm/loaders/GLTFLoader.js';
import { createSceneCameraAndRenderer } from '../../src/components/controls/createSceneCameraAndRenderer.js';
import { createPlanet } from '../../src/models/createPlanet.js';
import { addSunAndLight } from '../../src/animations/getLightSun.js';
import { createSpaceHorizon } from '../../src/scenes/createSpaceHorizon.js';
import getStarfield from '../../src/scenes/getStarfield.js';
import { handleWindowResize } from '../../src/scenes/handleWindowResize.js';
import { initializeGUI } from '../../src/components/controls/guiControls.js';
import { disposeScene } from '../../src/utils/disposeScene.js';
import { initializeLabelRenderer } from '../../src/utils/labelUtils.js';
import { OrbitTail } from '../../src/utils/orbitTail.js';
import { focusOnObject } from '../../src/utils/focusOnObject.js';
import { resetCamera } from '../../src/utils/resetCamera.js';
import { Moon } from '../../src/models/moon.js'; // Import klasy Moon
import { setMeshProperties } from '../../src/utils/planetUtils.js'; // Import funkcji pomocniczej

// Zmienne globalne dla modułu
let scene, camera, renderer, controls, container, animateId;
let marsPlanet;
let marsMesh;
let sunMesh, sunLight, sunPivot, ambientLight;
let labelRenderer;
let onWindowResize;
let gui;
let initialCameraPosition = null;
let initialControlsTarget = null;
let initialMinDistance = null;
let initialMaxDistance = null;
let userIsInteracting = false;

let state = {
    isTweening: false,
    isFollowingObject: false,
    currentTargetObject: null,
    previousTargetPosition: new THREE.Vector3()
};

let occlusionObjects = [];
let orbitTails = [];
let moons = []; // Tablica do przechowywania księżyców

// Parametry planety i innych obiektów
const planetRadius = 5.32;
const axialTilt = -25.19;
const cameraPosition = planetRadius * 2;
const flarePower = 300;
const marsDay = 30.75;
const sunOrbitDuration = 20610;
const sunRadius = 1093;
const sunDistance = 357790;
const spaceHorizonDistance = 500000;
const ambientLightPower = 3;
const rotationAngle = 260;
const marsTexturePath = "./assets/textures/mars/8k_mars.jpg";
const displacementMapPath = "./assets/textures/mars/8k_mars_DISP.png";
const marsBumpMapPath = "./assets/textures/mars/8k_mars_NRM.jpg";

// Dane księżyców
const moonsData = [
    {
        name: 'Phobos',
        radius: 0.0176,
        modelPath: './assets/textures/3D_models/Fobos.glb',
        scale: 0.0352,
        orbitDuration: 9.5,
        rotationDuration: 9.5,
        distance: 14.7,
        orbitTilt: 1.07,
        rotationTilt: 0,
        isGLTF: true, // Phobos jest modelem GLTF
    },
    {
        name: 'Deimos',
        radius: 0.0097,
        modelPath: './assets/textures/3D_models/Deimos.glb',
        scale: 0.0194,
        orbitDuration: 37.9,
        rotationDuration: 37.9,
        distance: 36.8,
        orbitTilt: 1.78,
        rotationTilt: 0,
        isGLTF: true, // Deimos jest modelem GLTF
    },
];

let guiParams = {
    showObjectNames: false,
    showSmallMoons: false,
    showMediumMoons: false,
    showLargeMoons: false,
    showOrbitTails: false,
};

let raycaster = new THREE.Raycaster();

export function initializeMarsScene(containerElement) {
    container = containerElement;

    // Sprawdź, czy scena już istnieje
    if (scene) {
        disposeMarsScene();
    }

    raycaster = new THREE.Raycaster();
    raycaster.params.Points.threshold = 0;

    const w = container.clientWidth;
    const h = container.clientHeight;

    // Tworzenie sceny, kamery i renderera
    const result = createSceneCameraAndRenderer(container, w, h, cameraPosition, planetRadius, rotationAngle);
    scene = result.scene;
    camera = result.camera;
    renderer = result.renderer;
    controls = result.controls;

    initialCameraPosition = camera.position.clone();
    initialControlsTarget = controls.target.clone();
    controls.addEventListener('start', () => { userIsInteracting = true; });
    controls.addEventListener('end', () => { userIsInteracting = false; });

    // Włącz obsługę cieni w rendererze
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    marsPlanet = new THREE.Group();
    marsPlanet.rotation.z = axialTilt * Math.PI / 180;  // Nachylenie osi 
    scene.add(marsPlanet);

    // Tworzenie planety Mars
    marsMesh = createPlanet(planetRadius, marsTexturePath, 5, marsBumpMapPath, 2, displacementMapPath, 0.05);
    marsMesh.receiveShadow = true;
    marsPlanet.add(marsMesh);
    occlusionObjects.push(marsMesh);

    // Przypisanie promienia do userData
    setMeshProperties(marsMesh, "Mars", planetRadius);

    // Horyzont kosmosu
    createSpaceHorizon(scene, spaceHorizonDistance);

    // Słońce i światło
    const sunResult = addSunAndLight(scene, sunDistance, sunRadius, flarePower, ambientLightPower);
    sunMesh = sunResult.sunMesh;
    sunLight = sunResult.sunLight;
    sunPivot = sunResult.sunPivot;
    ambientLight = sunResult.ambientLight;

    // Gwiazdy
    const stars = getStarfield({ numStars: 1000 });
    scene.add(stars);

    controls.minDistance = planetRadius + planetRadius * 0.2;
    controls.maxDistance = 350;
    initialMinDistance = controls.minDistance;
    initialMaxDistance = controls.maxDistance;

    labelRenderer = initializeLabelRenderer(container);

    // Inicjalizacja księżyców
    for (const moonData of moonsData) {
        moonData.parentPlanet = marsPlanet;
        moonData.scene = scene;
        moonData.camera = camera;
        moonData.controls = controls;
        moonData.state = state;
        moonData.guiParams = guiParams;
        moonData.occlusionObjects = occlusionObjects;
        moonData.orbitTails = orbitTails;
        moonData.labelRenderer = labelRenderer;
        moonData.raycaster = raycaster;
        moonData.updatePlanetInfo = updatePlanetInfo;

        const moon = new Moon(moonData);
        moons.push(moon);
    }

    gui = initializeGUI(guiParams, toggleObjectNames, orbitTails, resetCameraCallback, container);
    container.appendChild(gui.domElement);

    // Dodanie nasłuchiwacza zmiany rozmiaru okna
    onWindowResize = function () {
        handleWindowResize(camera, renderer, container, labelRenderer);
    };
    window.addEventListener('resize', onWindowResize, false);

    renderer.domElement.addEventListener('mousedown', onDocumentMouseDown, false);

    // Rozpoczęcie animacji
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
        occlusionObjects,
    });

    orbitTails.forEach(tail => tail.dispose());
    orbitTails = [];
    moons = [];

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
    marsMesh = null;
    sunMesh = null;
    sunLight = null;
    sunPivot = null;
    ambientLight = null;
    raycaster = null;
    occlusionObjects = [];
}

function animate() {
    animateId = requestAnimationFrame(animate);
    TWEEN.update();

    const deltaTime = 1; // Możesz użyć zegara, jeśli chcesz mieć dokładny deltaTime

    if (marsMesh) {
        marsMesh.rotation.y += (2 * Math.PI) / (marsDay * 60) * deltaTime;
    }

    // Aktualizacja księżyców
    for (const moon of moons) {
        moon.update(deltaTime);
    }

    // Aktualizacja pozycji kamery, jeśli śledzimy obiekt i nie jesteśmy w trakcie animacji
    if (state.currentTargetObject && !state.isTweening) {
        const targetPosition = new THREE.Vector3();
        state.currentTargetObject.getWorldPosition(targetPosition);

        const deltaPosition = new THREE.Vector3().subVectors(targetPosition, state.previousTargetPosition);

        camera.position.add(deltaPosition);
        controls.target.add(deltaPosition);

        state.previousTargetPosition.copy(targetPosition);

        controls.update();
    } else {
        controls.update();
    }

    // Orbita Słońca
    const time = (Date.now() / 1000) / sunOrbitDuration * Math.PI * 2;
    sunMesh.position.x = Math.cos(-time) * sunDistance;
    sunMesh.position.z = Math.sin(-time) * sunDistance;
    sunLight.position.copy(sunMesh.position);

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

function toggleObjectNames(show) {
    for (const moon of moons) {
        if (moon.label) {
            const radius = moon.radius;

            let shouldShow = false;
            if (radius <= 0.008 && guiParams.showSmallMoons) {
                shouldShow = true;
            } else if (radius > 0.008 && radius < 0.25 && guiParams.showMediumMoons) {
                shouldShow = true;
            } else if (radius >= 0.25 && guiParams.showLargeMoons) {
                shouldShow = true;
            }

            moon.label.userData.shouldShow = guiParams.showObjectNames && shouldShow;
        }
    }
}

function onDocumentMouseDown(event) {
    event.preventDefault();

    if (state.isFollowingObject) return;

    const rect = renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = - ((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const clickableObjects = moons.map(moon => moon.mesh);

    const intersects = raycaster.intersectObjects(clickableObjects, true);

    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;

        focusOnObject(intersectedObject, camera, controls, state);
        updatePlanetInfo(intersectedObject.name);
    }
}

function updatePlanetInfo(name) {
    const planetInfoDiv = document.getElementById('planet-info');
    if (planetInfoDiv) {
        if (name === 'Phobos') {
            planetInfoDiv.innerHTML = `
                <h2>Informacje o Fobosie</h2>
                <p>Fobos jest większym z dwóch naturalnych satelitów Marsa...</p>
            `;
        } else if (name === 'Deimos') {
            planetInfoDiv.innerHTML = `
                <h2>Informacje o Deimosie</h2>
                <p>Deimos jest mniejszym z dwóch naturalnych satelitów Marsa...</p>
            `;
        } else if (name === 'Mars') {
            planetInfoDiv.innerHTML = `
                <h2>Informacje o Marsie</h2>
                <p>Mars jest czwartą planetą od Słońca w Układzie Słonecznym...</p>
            `;
        }
    }
}

const resetCameraCallback = () => {
    resetCamera(
        camera,
        controls,
        state,
        initialCameraPosition,
        initialControlsTarget,
        initialMinDistance,
        initialMaxDistance
    );

    // Aktualizuj planet-info
    updatePlanetInfo('Mars');
};