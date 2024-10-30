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

// Zmienne globalne dla modułu
let scene, camera, renderer, controls, container, animateId;
let earthPlanet, earthMesh, cloudsMesh, earthAtNight, glowMesh;
let sunMesh, sunLight, sunPivot, ambientLight;
let onWindowResize;
let occlusionObjects = [];

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
const earthTexturePath = "../../assets/textures/earth/8k_earth_daymap.jpg";
const earthNightTexturePath = "../../assets/textures/earth/8k_earth_nightmap.jpg";
const earthBumpMapPath = "../../assets/textures/earth/earthbump10k.jpg";
const earthCloudTexturePath = "../../assets/textures/earth/clouds_8k.jpg";

let raycaster = new THREE.Raycaster();

export function initializeEarthScene(containerElement) {
    container = containerElement;

    if (scene) {
        disposeEarthScene();
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

    earthPlanet = new THREE.Group();
    earthPlanet.rotation.z = axialTilt * Math.PI / 180;
    scene.add(earthPlanet);

    earthMesh = createPlanet(planetRadius, earthTexturePath, 10, earthBumpMapPath, 5); //
    earthMesh.receiveShadow = true;
    earthPlanet.add(earthMesh);

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

export function disposeEarthScene() {
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
    controls.update();
    TWEEN.update();

    earthMesh.rotation.y += (2 * Math.PI) / (earthDay * 60);
    earthAtNight.rotation.y += (2 * Math.PI) / (earthDay * 60);
    glowMesh.rotation.y += (2 * Math.PI) / (earthDay * 50);
    cloudsMesh.rotation.y += (2 * Math.PI) / (earthDay * 50);

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