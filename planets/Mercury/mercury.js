//mercury.js

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169/build/three.module.js';
import * as TWEEN from 'https://cdn.jsdelivr.net/npm/@tweenjs/tween.js@18.6.4/dist/tween.esm.js';
import { createSceneCameraAndRenderer } from '../../src/components/controls/createSceneCameraAndRenderer.js';
import { createPlanet } from '../../src/models/createPlanet.js';
import { addSunAndLight } from '../../src/animations/getLightSun.js';
import { createSpaceHorizon } from '../../src/scenes/createSpaceHorizon.js';
import getStarfield from '../../src/scenes/getStarfield.js';
import { handleWindowResize } from '../../src/scenes/handleWindowResize.js';
import { disposeScene } from '../../src/utils/disposeScene.js';

// Zmienne globalne dla modułu
let scene, camera, renderer, controls, container, animateId;
let mercuryPlanet, mercuryMesh;
let sunMesh, sunLight, sunPivot, ambientLight;
let onWindowResize;
let occlusionObjects = [];

const planetRadius = 3.83;
const axialTilt = -0.034;
const cameraPosition = planetRadius * 2;
const flarePower = 900;
const mercuryDay = 1765;
const sunOrbitDuration = 2638;
const sunRadius = 1093;
const sunDistance = 90890;
const spaceHorizonDistance = 500000;
const ambientLightPower = 5;
const rotationAngle = -180;
const mercuryTexturePath = "../../assets/textures/mercury/16k_mercury_texture.jpg";
const mercuryBumpMapPath = "../../assets/textures/mercury/mercury_bump3.jpg";

let raycaster = new THREE.Raycaster();

export function initializeMercuryScene(containerElement) {
    container = containerElement;

    if (scene) {
        disposeMercuryScene();
    }

    const w = container.clientWidth;
    const h = container.clientHeight;

    const result = createSceneCameraAndRenderer(container, w, h, cameraPosition, planetRadius, rotationAngle);
    scene = result.scene;
    camera = result.camera;
    renderer = result.renderer;
    controls = result.controls;

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mercuryPlanet = new THREE.Group();
    mercuryPlanet.rotation.z = axialTilt * Math.PI / 180;
    scene.add(mercuryPlanet);

    mercuryMesh = createPlanet(planetRadius, mercuryTexturePath, 5, mercuryBumpMapPath, 1 ); //
    mercuryMesh.receiveShadow = true;
    mercuryPlanet.add(mercuryMesh);

    createSpaceHorizon(scene, spaceHorizonDistance);
    const sunResult = addSunAndLight(scene, sunDistance, sunRadius, flarePower, ambientLightPower);
    sunMesh = sunResult.sunMesh;
    sunLight = sunResult.sunLight;
    sunPivot = sunResult.sunPivot;
    ambientLight = sunResult.ambientLight;

    // Gwiazdy
    const stars = getStarfield({ numStars: 500 });
    scene.add(stars);

    window.addEventListener('resize', handleWindowResize, false);

    animate();
}

export function disposeMercuryScene() {
    disposeScene({
        scene,
        renderer,
        controls,
        animateId,
        container,
        onWindowResize,
        occlusionObjects,
    });

    // Resetuj zmienne
    scene = null;
    renderer = null;
    controls = null;
    animateId = null;
    container = null;
    onWindowResize = null;
    mercuryPlanet = null;
    mercuryMesh = null;
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

    mercuryMesh.rotation.y += (2 * Math.PI) / (mercuryDay * 60);

    // Okrągła orbita Słońca (przeciwnie do wskazówek zegara)
    const time = (Date.now() / 1000) / sunOrbitDuration * Math.PI * 2; // Obliczamy czas dla pełnej orbity w 10957,5 sekund
    sunMesh.position.x = Math.cos(-time) * sunDistance;  // Ujemny czas dla odwrotnej orbity
    sunMesh.position.z = Math.sin(-time) * sunDistance;
    sunLight.position.set(sunMesh.position.x, sunMesh.position.y, sunMesh.position.z);
    renderer.render(scene, camera);
}

function onDocumentMouseDown(event) {
    event.preventDefault();
}




