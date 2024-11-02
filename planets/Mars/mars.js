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
import { initializeLabelRenderer, createLabel, updateLabelVisibility } from '../../src/utils/labelUtils.js';
import { OrbitTail } from '../../src/utils/orbitTail.js';
import { focusOnObject } from '../../src/utils/focusOnObject.js';
import { resetCamera } from '../../src/utils/resetCamera.js';

// Zmienne globalne dla modułu
let scene, camera, renderer, controls, animateId;
let marsPlanet, phobosPivot, deimosPivot;
let marsMesh, phobosMesh, deimosMesh, phobosLabel, deimosLabel;
let sunMesh, sunLight, sunPivot, ambientLight;
let container, labelRenderer;
let onWindowResize;
let gui;
let initialCameraPosition = null;
let initialControlsTarget = null;
let initialMinDistance = null;
let initialMaxDistance = null;
let userIsInteracting = false;
let raycaster = new THREE.Raycaster();

let state = {
    isTweening: false,
    isFollowingObject: false,
    currentTargetObject: null,
    previousTargetPosition: new THREE.Vector3()
};

let guiParams = {
    showObjectNames: false,
    showOrbitTails: false, // Przełącznik dla ogonów orbity
};

let orbitTails = [];
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
const phobosRadius = 0.017;
const deimosRadius = 0.0097;
const marsTexturePath = "../../assets/textures/mars/8k_mars.jpg";
const displacementMapPath = "../../assets/textures/mars/8k_mars_DISP.png";
const marsBumpMapPath = "../../assets/textures/mars/8k_mars_NRM.jpg";

const resetCameraCallback = () => resetCamera(
    camera,
    controls,
    state,
    initialCameraPosition,
    initialControlsTarget,
    initialMinDistance,
    initialMaxDistance
);


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

    initialCameraPosition = camera.position.clone();
    initialControlsTarget = controls.target.clone();
    controls.addEventListener('start', () => { userIsInteracting = true; });
    controls.addEventListener('end', () => { userIsInteracting = false; });

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
    marsMesh = createPlanet(planetRadius, marsTexturePath, 5, marsBumpMapPath, 2, displacementMapPath, 0.05);
    marsMesh.receiveShadow = true;
    marsPlanet.add(marsMesh);
    occlusionObjects.push(marsMesh);

    // Przypisanie promienia do userData
    marsMesh.userData.radius = planetRadius;
    marsMesh.name = "Mars";

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

    controls.minDistance = planetRadius + planetRadius * 0.2;
    controls.maxDistance = 350;
    initialMinDistance = controls.minDistance;
    initialMaxDistance = controls.maxDistance;

    // Ładowanie Fobosa i Deimosa
    phobosPivot = new THREE.Object3D();
    deimosPivot = new THREE.Object3D();
    marsPlanet.add(phobosPivot);
    marsPlanet.add(deimosPivot);

    // Inicjalizacja CSS2DRenderer
    labelRenderer = initializeLabelRenderer(container);

    const loader3d = new GLTFLoader();

    // Ładowanie Phobosa
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

        // Przypisz właściwości do Phobosa i jego dzieci
        setMeshProperties(phobosMesh, "Phobos", phobosRadius);

        phobosMesh.userData.radius = phobosRadius;
        phobosMesh.name = "Phobos";

        // Tworzenie etykiety dla Phobosa
        phobosLabel = createLabel("Phobos");
        phobosMesh.add(phobosLabel);
        phobosLabel.visible = guiParams.showObjectNames;

        // Dodaj nasłuchiwanie zdarzenia kliknięcia na etykietę Phobosa
        phobosLabel.element.addEventListener('click', (event) => {
            event.stopPropagation();
            focusOnObject(phobosMesh, camera, controls, state);
        });


        // Tworzenie ogona orbity dla Phobosa
        const phobosMaxPoints = calculateMaxPoints(phobosOrbitDuration);
        const phobosOrbitTail = new OrbitTail(phobosMesh, scene, phobosMaxPoints, { color: 0xcccccc, opacity: 0.5 });
        phobosOrbitTail.hide(); // Ukryj ogon na starcie
        orbitTails.push(phobosOrbitTail);
    });

    // Ładowanie Deimosa
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

        // Przypisz właściwości do Deimosa i jego dzieci
        setMeshProperties(deimosMesh, "Deimos", deimosRadius);

        deimosMesh.userData.radius = deimosScale;
        deimosMesh.name = "Deimos";

        // Tworzenie etykiety dla Deimosa
        deimosLabel = createLabel("Deimos");
        deimosMesh.add(deimosLabel);
        deimosLabel.visible = guiParams.showObjectNames;

        // Dodaj nasłuchiwanie zdarzenia kliknięcia na etykietę Deimosa
        deimosLabel.element.addEventListener('click', (event) => {
            event.stopPropagation();
            focusOnObject(deimosMesh, camera, controls, state);
        });
        // Tworzenie ogona orbity dla Deimosa
        const deimosMaxPoints = calculateMaxPoints(deimosOrbitDuration);
        const deimosOrbitTail = new OrbitTail(deimosMesh, scene, deimosMaxPoints, { color: 0xcccccc, opacity: 0.5 });
        deimosOrbitTail.hide(); // Ukryj ogon na starcie
        orbitTails.push(deimosOrbitTail);
    });

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
    TWEEN.update();

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

    // Aktualizacja ogonów orbity, jeśli są włączone
    if (guiParams.showOrbitTails) {
        // Phobos
        if (phobosMesh) {
            orbitTails.forEach(tail => {
                if (tail.moon === phobosMesh) {
                    tail.update();
                }
            });
        }

        // Deimos
        if (deimosMesh) {
            orbitTails.forEach(tail => {
                if (tail.moon === deimosMesh) {
                    tail.update();
                }
            });
        }
    }


}

function toggleObjectNames(show) {
    if (phobosLabel) phobosLabel.visible = show;
    if (deimosLabel) deimosLabel.visible = show;
}
function calculateMaxPoints(orbitDuration) {
    return Math.round(0.6 * orbitDuration * 60);
}
// Funkcja obsługi kliknięcia
function onDocumentMouseDown(event) {
    event.preventDefault();

    if (state.isFollowingObject) return;
}
// Funkcja wywoływana po kliknięciu na obiekt
//function onObjectClicked(object) {
//    if (object && object.userData && object.userData.radius && object.name) {
//        console.log('Kliknięto na obiekt:', object.name);
//
//        // Ustawienie kamery do śledzenia obiektu
//        focusOnObject(object);
//
//        // Jeśli kliknięto na Marsa, resetuj currentTargetObject
//        if (object.name === "Mars") {
//            currentTargetObject = null;
//        }
//    } else {
//        console.log('Kliknięty obiekt nie ma właściwości userData.radius lub name.');
//    }
//}
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
export { focusOnObject };