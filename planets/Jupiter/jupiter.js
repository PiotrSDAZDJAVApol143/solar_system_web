//jupiter.js
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169/build/three.module.js';
import * as TWEEN from 'https://cdn.jsdelivr.net/npm/@tweenjs/tween.js@18.6.4/dist/tween.esm.js';
import { createSceneCameraAndRenderer } from '../../src/components/controls/createSceneCameraAndRenderer.js';
import { createPlanet } from '../../src/models/createPlanet.js';
import { addSunAndLight } from '../../src/animations/getLightSun.js';
import { createSpaceHorizon } from '../../src/scenes/createSpaceHorizon.js';
import getStarfield from '../../src/scenes/getStarfield.js';
import { handleWindowResize } from '../../src/scenes/handleWindowResize.js';
import { disposeScene } from '../../src/utils/disposeScene.js';
import { initializeGUI } from '../../src/components/controls/guiControls.js';
import { initializeLabelRenderer } from '../../src/utils/labelUtils.js';
import { focusOnObject } from '../../src/utils/focusOnObject.js';
import { resetCamera } from '../../src/utils/resetCamera.js';
import { Moon } from '../../src/models/moon.js'; 
import { setMeshProperties } from '../../src/utils/planetUtils.js';
import { createPlanetRings } from '../../src/models/createPlanetRings.js';

// Zmienne globalne dla modułu
let scene, camera, renderer, controls, container, animateId;
let jupiterPlanet;
let jupiterMesh;
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

const planetRadius = 112;
const axialTilt = -3.13;
const cameraPosition = planetRadius * 2;
const flarePower = 70;
const jupiterDay = 12.4;  // Pełny obrót Ziemi to 30 sekund
const sunOrbitDuration = 129864 / 4;  // Pełna orbita Słońca w 10957,5 sekund (365,25 dni)
const sunRadius = 1093 / 4;
const sunDistance = 1220960 / 4;
const spaceHorizonDistance = 500000;
const ambientLightPower = 3;
const rotationAngle = 60;
const jupiterTexturePath = "./assets/textures/jupiter/8k_jupiter.jpg";

const moonsData = [
    {
        name: 'Metis',
        radius: 0.0345,
        modelPath: "./assets/textures/3D_models/Metis.glb",
        scale: 0.068,
        orbitDuration: 8.8,
        rotationDuration: 8.8,
        distance: 201,
        orbitTilt: 0.02,
        rotationTilt: 0,
        isGLTF: true, 
        isPLY: false,
    },
    {
        name: 'Andrastea',
        radius: 0.0126,
        modelPath: "./assets/textures/3D_models/Adrastea2.glb",
        texturePath: "./assets/textures/jupiter/Metis.jpg",
        scale: 0.024,
        orbitDuration: 8.9,
        rotationDuration: 8.8,
        distance: 202.5,
        orbitTilt: 0.05,
        rotationTilt: 0.002,
        isGLTF: true, 
        isPLY: false,
    },
    {
        name: 'Amaltea',
        radius: 0.131,
        modelPath: "./assets/textures/3D_models/Amaltea.glb",
        scale: 0.262,
        orbitDuration: 12,
        rotationDuration: 12,
        distance: 284,
        orbitTilt: 0.38,
        rotationTilt: 0.002,
        isGLTF: true, 
        isPLY: false,
    },
    {
        name: 'IO',
        radius: 2.86,
        texturePath: "./assets/textures/jupiter/IO_texture.png",
        orbitDuration: 53.23,
        rotationDuration: 53.23,
        distance: 661,
        orbitTilt: 0.04,
        rotationTilt: 0,
        isGLTF: false, // Jeśli księżyc jest w formacie GLTF, ustaw na true
        isPLY: false,
    },
    {
        name: 'Europa',
        radius: 2.45,
        texturePath: "./assets/textures/jupiter/Europa_texture2.png",
        orbitDuration: 106.4,
        rotationDuration: 106.4,
        distance: 1054,
        orbitTilt: 0.1,
        rotationTilt: 0,
        isGLTF: false, // Jeśli księżyc jest w formacie GLTF, ustaw na true
        isPLY: false,
    },
    {
        name: 'Ganimedes',
        radius: 4.14,
        texturePath: "./assets/textures/jupiter/Galimedes.jpg",
        orbitDuration: 214.5,
        rotationDuration: 214.5,
        distance: 1679,
        orbitTilt: 0.2,
        rotationTilt: 0,
        isGLTF: false, // Jeśli księżyc jest w formacie GLTF, ustaw na true
        isPLY: false,
    },
    {
        name: 'Kalisto',
        radius: 3.78,
        texturePath: "./assets/textures/jupiter/Kalisto.jpg",
        orbitDuration: 500.5,
        rotationDuration: 500.5,
        distance: 2955,
        orbitTilt: 0.2,
        rotationTilt: 0,
        isGLTF: false, // Jeśli księżyc jest w formacie GLTF, ustaw na true
        isPLY: false,
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

export function initializeJupiterScene(containerElement) {
    container = containerElement;

    if (scene) {
        disposeJupiterScene();
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

    jupiterPlanet = new THREE.Group();
    jupiterPlanet.rotation.z = axialTilt * Math.PI / 180;
    scene.add(jupiterPlanet);

    jupiterMesh = createPlanet(planetRadius, jupiterTexturePath, 5);
    jupiterMesh.receiveShadow = true;
    jupiterMesh.castShadow = true;
    jupiterPlanet.add(jupiterMesh);
    occlusionObjects.push(jupiterMesh);

    // Przypisanie promienia do userData
    setMeshProperties(jupiterMesh, "Jupiter", planetRadius);

     // Tworzenie pierścieni Jowisza
     const ringParamsList = [
        {
        innerRadius: planetRadius * 1.02,
        outerRadius: planetRadius * 1.29,
        texturePath: './assets/textures/saturn/ring.jpg',
        opacity: 0.02,
       
    },
    {
        innerRadius: planetRadius * 1.3,
        outerRadius: planetRadius * 1.7,
        texturePath: './assets/textures/saturn/ring.jpg',
        opacity: 0.04,
    
    },
    {
        innerRadius: planetRadius * 1.71,
        outerRadius: planetRadius * 2.1,
        texturePath: './assets/textures/saturn/ring.jpg',
        opacity: 0.03,
    },
    {
        innerRadius: planetRadius * 2.2,
        outerRadius: planetRadius * 3.5,
        texturePath: './assets/textures/saturn/ring.jpg',
        opacity: 0.01,
    
    },


];
    ringParamsList.forEach(params => {
    const ring = createPlanetRings(params);
    jupiterPlanet.add(ring);
    //occlusionObjects.push(ring); // Opcjonalnie
});

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
        moonData.parentPlanet = jupiterPlanet;
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


export function disposeJupiterScene() {
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
    jupiterPlanet = null;
    jupiterMesh = null;
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

    if (jupiterMesh) {
        jupiterMesh.rotation.y += (2 * Math.PI) / (jupiterDay * 60) * deltaTime;
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

function toggleObjectNames() {
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
        if (name === 'Moon') {
            planetInfoDiv.innerHTML = `
                <h2>Informacje o Księżycu</h2>
                <p>Księżyc jest naturalnym satelitą Ziemi...</p>
            `;
        } else if (name === 'Jupiter') {
            planetInfoDiv.innerHTML = `
                <h2>Informacje o Jowiszu</h2>
                <p>Jowisz to największe gazowe bydle Układu Słonecznego</p>
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
    updatePlanetInfo('Jupiter');
};