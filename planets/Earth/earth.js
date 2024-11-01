//earth.js

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
import { initializeLabelRenderer, createLabel, updateLabelVisibility } from '../../src/utils/labelUtils.js';
import { OrbitTail } from '../../src/utils/orbitTail.js';
import { focusOnObject } from '../../src/utils/focusOnObject.js';
import { resetCamera } from '../../src/utils/resetCamera.js';

// Zmienne globalne dla modułu
let scene, camera, renderer, controls, container, animateId;
let earthPlanet, moonPivot;
let earthMesh, cloudsMesh, earthAtNight, glowMesh, moonMesh, moonLabel;
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

const planetRadius = 10;
const axialTilt = -23.4;
const cameraPosition = planetRadius * 2;
const flarePower = 350;
const earthDay = 30;  // Pełny obrót Ziemi w 30 sekund
const moonOrbitDuration = 819.6;  // Pełna orbita Księżyca w 819,6 sekund (27,32 dni)
const sunOrbitDuration = 10957.5;  // Pełna orbita Słońca w 10957,5 sekund (365,25 dni)
const sunRadius = 1093;
const sunDistance = 234800;
const spaceHorizonDistance = 500000;
const ambientLightPower = 3.5;
const rotationAngle = 60;
const moonRadius = 2.73;
const moonDistance = 603;
const earthTexturePath = "../../assets/textures/earth/8k_earth_daymap.jpg";
const earthNightTexturePath = "../../assets/textures/earth/8k_earth_nightmap.jpg";
const earthBumpMapPath = "../../assets/textures/earth/earthbump10k.jpg";
const earthCloudTexturePath = "../../assets/textures/earth/clouds_8k.jpg";
const moonTexturePath = "../../assets/textures/earth/Moon/8k_moon.jpg";

const resetCameraCallback = () => resetCamera(
    camera,
    controls,
    state,
    initialCameraPosition,
    initialControlsTarget,
    initialMinDistance,
    initialMaxDistance
);

// Parametry GUI
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

    earthMesh = createPlanet(planetRadius, earthTexturePath, 10, earthBumpMapPath, 5); //
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
        transparent: false,
        opacity: 1.2,
        blending: THREE.AdditiveBlending,
    });

    cloudsMesh = new THREE.Mesh(earthMesh.geometry, cloudsMat); // Przypisanie do globalnej zmiennej
    cloudsMesh.scale.setScalar(1.015);
    earthPlanet.add(cloudsMesh);

    const fresnelMat = getFresnelMat();
    glowMesh = new THREE.Mesh(earthMesh.geometry, fresnelMat);
    glowMesh.scale.setScalar(1.025);
    earthPlanet.add(glowMesh);

    // Przypisanie promienia do userData
    earthMesh.userData.radius = planetRadius;
    earthMesh.name = "Earth";

    createSpaceHorizon(scene, spaceHorizonDistance);
    const sunResult = addSunAndLight(scene, sunDistance, sunRadius, flarePower, ambientLightPower);
    sunMesh = sunResult.sunMesh;
    sunLight = sunResult.sunLight;
    sunPivot = sunResult.sunPivot;
    ambientLight = sunResult.ambientLight;

    // Gwiazdy
    const stars = getStarfield({ numStars: 500 });
    scene.add(stars);

    controls.minDistance = planetRadius + planetRadius * 0.2;
    controls.maxDistance = 350;
    initialMinDistance = controls.minDistance;
    initialMaxDistance = controls.maxDistance;

    labelRenderer = initializeLabelRenderer(container);

    moonPivot = new THREE.Object3D();  // Przegub dla orbity Księżyca
    earthPlanet.add(moonPivot);  // Dodaj przegub do Ziemi
    moonPivot.rotation.x = THREE.MathUtils.degToRad(5.145);
    moonMesh = createPlanet(moonRadius, moonTexturePath, 15)
    moonMesh.castShadow = true;
    moonMesh.receiveShadow = true;
    moonMesh.position.set(moonDistance, 0, 0);
    moonMesh.rotation.z = THREE.MathUtils.degToRad(1.54);
    moonPivot.add(moonMesh);
    occlusionObjects.push(moonMesh);

    setMeshProperties(moonMesh, "Moon", moonRadius);
    moonMesh.userData.radius = moonRadius;
    moonMesh.name = "Moon";

    moonLabel = createLabel("Moon");
    moonMesh.add(moonLabel);
    moonLabel.visible = guiParams.showObjectNames;

    moonLabel.element.addEventListener('click', (event) => {
        event.stopPropagation();
        focusOnObject(moonMesh, camera, controls, state);
    });

    const moonMaxPoints = calculateMaxPoints(moonOrbitDuration);
    const moonOrbitTail = new OrbitTail(moonMesh, scene, moonMaxPoints, { color: 0xcccccc, opacity: 0.5 });
    moonOrbitTail.hide();
    orbitTails.push(moonOrbitTail);

    gui = initializeGUI(guiParams, toggleObjectNames, orbitTails, resetCameraCallback);
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
    // Usuwanie ogonów orbity
    orbitTails.forEach(tail => tail.dispose());
    orbitTails = [];

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
    moonPivot = null;
    moonMesh = null;
    moonLabel = null;
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
    controls.update();
    TWEEN.update();

    if (earthMesh) {
        earthMesh.rotation.y += (2 * Math.PI) / (earthDay * 60);
    }
    if (earthAtNight) {
        earthAtNight.rotation.y += (2 * Math.PI) / (earthDay * 60);
    }
    if (glowMesh) {
        glowMesh.rotation.y += (2 * Math.PI) / (earthDay * 50);
    }
    if (cloudsMesh) {
        cloudsMesh.rotation.y += (2 * Math.PI) / (earthDay * 50);
    }
    if (moonMesh) {
        moonMesh.rotation.y += (2 * Math.PI) / (moonOrbitDuration * 60); // Rotacja Księżyca
    }

    if (moonPivot) {
        moonPivot.rotation.y += (2 * Math.PI) / (moonOrbitDuration * 60); // Obrót dla orbity Księżyca
    }
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);

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
    const time = (Date.now() / 1000) / sunOrbitDuration * Math.PI * 2; // Obliczamy czas dla pełnej orbity w 10957,5 sekund
    sunMesh.position.x = Math.cos(-time) * sunDistance;  // Ujemny czas dla odwrotnej orbity
    sunMesh.position.z = Math.sin(-time) * sunDistance;
    sunLight.position.set(sunMesh.position.x, sunMesh.position.y, sunMesh.position.z);
    //  renderer.render(scene, camera);
    //  labelRenderer.render(scene, camera);

    if (moonMesh) {
        updateLabelVisibility(moonLabel, moonMesh, camera, raycaster, occlusionObjects, guiParams);
    }
    if (guiParams.showOrbitTails) {
        if (moonMesh) {
            orbitTails.forEach(tail => {
                if (tail.moon === moonMesh) {
                    tail.update();
                }
            });
        }

    }
}
function toggleObjectNames(show) {
    if (moonLabel) moonLabel.visible = show;
}
function calculateMaxPoints(orbitDuration) {
    return Math.round(0.6 * orbitDuration * 60);
}

function onDocumentMouseDown(event) {
    event.preventDefault();

    if (state.isFollowingObject) return;
}

function setMeshProperties(object, name, radius) {
    object.name = name;
    object.userData.radius = radius;
    object.traverse(function (child) {
        if (child.isMesh) {
            child.name = name;
            child.userData.radius = radius;
        }
    });
}