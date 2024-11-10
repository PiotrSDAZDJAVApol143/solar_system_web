// earth.js

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169/build/three.module.js';
import * as TWEEN from 'https://cdn.jsdelivr.net/npm/@tweenjs/tween.js@18.6.4/dist/tween.esm.js';
import { createSceneCameraAndRenderer } from '../../src/components/controls/createSceneCameraAndRenderer.js';
import { createPlanet } from '../../src/models/createPlanet.js';
import { addSunAndLight } from '../../src/animations/getLightSun.js';
import { createSpaceHorizon } from '../../src/scenes/createSpaceHorizon.js';
import getStarfield from '../../src/scenes/getStarfield.js';
import { handleWindowResize } from '../../src/scenes/handleWindowResize.js';
import { disposeScene } from '../../src/utils/disposeScene.js';
import { loader } from '../../src/models/createPlanet.js';
import { getFresnelMat } from "../../src/utils/getFresnelMat.js";
import { initializeGUI } from '../../src/components/controls/guiControls.js';
import { initializeLabelRenderer } from '../../src/utils/labelUtils.js';
//import { OrbitTail } from '../../src/utils/orbitTail.js';
import { focusOnObject } from '../../src/utils/focusOnObject.js';
import { resetCamera } from '../../src/utils/resetCamera.js';
import { Moon } from '../../src/models/moon.js'; // Import klasy Moon
import { setMeshProperties } from '../../src/utils/planetUtils.js'; // Import funkcji pomocniczej

// Zmienne globalne dla modułu
let scene, camera, renderer, controls, container, animateId;
let earthPlanet;
let earthMesh, cloudsMesh, earthAtNight, glowMesh;
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

const planetRadius = 10;
const axialTilt = -23.4;
const cameraPosition = planetRadius * 2;
const flarePower = 350;
const earthDay = 30;  // Pełny obrót Ziemi w 30 sekund
const sunOrbitDuration = 10957.5;  // Pełna orbita Słońca w 10957,5 sekund (365,25 dni)
const sunRadius = 1093;
const sunDistance = 234800;
const spaceHorizonDistance = 500000;
const ambientLightPower = 3.5;
const rotationAngle = 60;
const earthTexturePath = "../../assets/textures/earth/8k_earth_daymap.jpg";
const earthNightTexturePath = "../../assets/textures/earth/8k_earth_nightmap.jpg";
const earthBumpMapPath = "../../assets/textures/earth/earthbump10k.jpg";
const earthCloudTexturePath = "../../assets/textures/earth/clouds_8k.jpg";

// Dane księżyców
const moonsData = [
    {
        name: 'Moon',
        radius: 2.73,
        texturePath: "../../assets/textures/earth/Moon/8k_moon.jpg",
        orbitDuration: 819.6,
        rotationDuration: 819.6,
        distance: 603,
        orbitTilt: 5.145,
        rotationTilt: 1.54,
        isGLTF: false, // Jeśli księżyc jest w formacie GLTF, ustaw na true
    },
];

let guiParams = {
    showObjectNames: false,
    showOrbitTails: false, // Przełącznik dla ogonów orbity
};

let raycaster = new THREE.Raycaster();

export function initializeEarthScene(containerElement) {
    container = containerElement;

    if (scene) {
        disposeEarthScene();
    }

    raycaster = new THREE.Raycaster();
    raycaster.params.Points.threshold = 0;

    const w = container.clientWidth;
    const h = container.clientHeight;

    const result = createSceneCameraAndRenderer(container, w, h, cameraPosition, planetRadius, rotationAngle);
    scene = result.scene;
    camera = result.camera;
    renderer = result.renderer;
    controls = result.controls;

    initialCameraPosition = camera.position.clone();
    initialControlsTarget = controls.target.clone();
    controls.addEventListener('start', () => { userIsInteracting = true; });
    controls.addEventListener('end', () => { userIsInteracting = false; });

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    earthPlanet = new THREE.Group();
    earthPlanet.rotation.z = axialTilt * Math.PI / 180;
    scene.add(earthPlanet);

    earthMesh = createPlanet(planetRadius, earthTexturePath, 10, earthBumpMapPath, 5);
    earthMesh.receiveShadow = true;
    earthPlanet.add(earthMesh);
    occlusionObjects.push(earthMesh);

    const lightsAtNight = new THREE.MeshBasicMaterial({
        map: loader.load(earthNightTexturePath),
        blending: THREE.AdditiveBlending,
    });
    earthAtNight = new THREE.Mesh(earthMesh.geometry, lightsAtNight);
    earthPlanet.add(earthAtNight);

    const cloudsMat = new THREE.MeshStandardMaterial({
        map: loader.load(earthCloudTexturePath),
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
    });

    cloudsMesh = new THREE.Mesh(earthMesh.geometry, cloudsMat);
    cloudsMesh.scale.setScalar(1.015);
    earthPlanet.add(cloudsMesh);

    const fresnelMat = getFresnelMat();
    glowMesh = new THREE.Mesh(earthMesh.geometry, fresnelMat);
    glowMesh.scale.setScalar(1.025);
    earthPlanet.add(glowMesh);

    // Przypisanie promienia do userData
    setMeshProperties(earthMesh, "Earth", planetRadius);

    createSpaceHorizon(scene, spaceHorizonDistance);
    const sunResult = addSunAndLight(scene, sunDistance, sunRadius, flarePower, ambientLightPower);
    sunMesh = sunResult.sunMesh;
    sunLight = sunResult.sunLight;
    sunPivot = sunResult.sunPivot;
    ambientLight = sunResult.ambientLight;

    const stars = getStarfield({ numStars: 500 });
    scene.add(stars);

    controls.minDistance = planetRadius + planetRadius * 0.2;
    controls.maxDistance = 350;
    initialMinDistance = controls.minDistance;
    initialMaxDistance = controls.maxDistance;

    labelRenderer = initializeLabelRenderer(container);

    // Inicjalizacja księżyców
    for (const moonData of moonsData) {
        moonData.parentPlanet = earthPlanet;
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

    animate();
}

export function disposeEarthScene() {
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
    earthPlanet = null;
    earthMesh = null;
    earthAtNight = null;
    cloudsMesh = null;
    glowMesh = null;
    sunMesh = null;
    sunLight = null;
    sunPivot = null;
    ambientLight = null;
    raycaster = null;
    occlusionObjects = [];
}

function animate() {
    animateId = requestAnimationFrame(animate);
    //controls.update();
    TWEEN.update();

    const deltaTime = 1; // Możesz użyć zegara, jeśli chcesz mieć dokładny deltaTime

    if (earthMesh) {
        earthMesh.rotation.y += (2 * Math.PI) / (earthDay * 60) * deltaTime;
    }
    if (earthAtNight) {
        earthAtNight.rotation.y += (2 * Math.PI) / (earthDay * 60) * deltaTime;
    }
    if (glowMesh) {
        glowMesh.rotation.y += (2 * Math.PI) / (earthDay * 50) * deltaTime;
    }
    if (cloudsMesh) {
        cloudsMesh.rotation.y += (2 * Math.PI) / (earthDay * 50) * deltaTime;
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
        // Jeśli nie śledzimy obiektu, normalnie aktualizuj kontrole
        controls.update();
    }

    // Okrągła orbita Słońca (przeciwnie do wskazówek zegara)
    const time = (Date.now() / 1000) / sunOrbitDuration * Math.PI * 2;
    sunMesh.position.x = Math.cos(-time) * sunDistance;
    sunMesh.position.z = Math.sin(-time) * sunDistance;
    sunLight.position.set(sunMesh.position.x, sunMesh.position.y, sunMesh.position.z);

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

function toggleObjectNames(show) {
    for (const moon of moons) {
        if (moon.label) moon.label.visible = show;
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
        if (name === 'Moon') {
            planetInfoDiv.innerHTML = `
                <h2>Informacje o Księżycu</h2>
                <p>Księżyc jest naturalnym satelitą Ziemi...</p>
            `;
        } else if (name === 'Earth') {
            planetInfoDiv.innerHTML = `
                <h2>Informacje o Ziemi</h2>
                <p>Ziemia jest 3 planetą od Słońca...</p>
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
    updatePlanetInfo('Earth');
};
