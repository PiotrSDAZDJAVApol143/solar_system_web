//venus.js

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

// Zmienne globalne dla modułu
let scene, camera, renderer, controls, container, animateId;
let venusPlanet, venusMesh, cloudsMesh;
let sunMesh, sunLight, sunPivot, ambientLight;
let onWindowResize;
let occlusionObjects = [];

const planetRadius = 9.5;
const axialTilt = -2.64;
const cameraPosition = planetRadius*2;
const flarePower = 700;
const venusDay = 7290;
const sunOrbitDuration = 6741;
const venusCloudRotationDuration = 120;
const sunRadius = 1093;
const sunDistance = 169810;
const spaceHorizonDistance = 500000;
const ambientLightPower = 4;
const rotationAngle =110;
const venusTexturePath = "./assets/textures/venus/8k_venus_surface.jpg";
const venusBumpMapPath = "./assets/textures/venus/8k_venus_surface_NRM.png";
const venusCloudTexturePath = "./assets/textures/venus/4k_venus_atmosphere.jpg";

let raycaster = new THREE.Raycaster();

export function initializeVenusScene(containerElement) {
    container = containerElement;

    if (scene) {
        disposeVenusScene();
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

    venusPlanet = new THREE.Group();
    venusPlanet.rotation.z = axialTilt * Math.PI / 180;
    scene.add(venusPlanet);

    venusMesh = createPlanet(planetRadius, venusTexturePath, 5, venusBumpMapPath, 1 ); //
    venusMesh.receiveShadow = true;
    venusPlanet.add(venusMesh);

    const cloudsMat = new THREE.MeshStandardMaterial({
        map: loader.load(venusCloudTexturePath),
        transparent: true,
        opacity: 0.95,
        blending: THREE.NormalBlending,
    });
    
    cloudsMesh = new THREE.Mesh(venusMesh.geometry, cloudsMat); // Przypisanie do globalnej zmiennej
    cloudsMesh.scale.setScalar(1.035);
    venusPlanet.add(cloudsMesh);

    createSpaceHorizon(scene, spaceHorizonDistance);
    const sunResult = addSunAndLight(scene, sunDistance, sunRadius, flarePower, ambientLightPower);
    sunMesh = sunResult.sunMesh;
    sunLight = sunResult.sunLight;
    sunPivot = sunResult.sunPivot;
    ambientLight = sunResult.ambientLight;

    // Gwiazdy
    const stars = getStarfield({ numStars: 1000 });
    scene.add(stars);

    window.addEventListener('resize', handleWindowResize, false);

    animate();
}

export function disposeVenusScene() {
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
    venusPlanet = null;
    venusMesh = null;
    //cloudsMesh = null;
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

    venusMesh.rotation.y += (2 * Math.PI) / (venusDay * 60);
    if (cloudsMesh) {
        cloudsMesh.rotation.y += (2 * Math.PI) / (venusCloudRotationDuration * 60);
    }

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