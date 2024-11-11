//createSceneCameraAndRenderer.js
import * as THREE from 'three';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/controls/OrbitControls.js';


export function createSceneCameraAndRenderer(container, w, h, cameraPosition, planetRadius, rotationAngle ) {
    const scene = new THREE.Scene();

    const angle = THREE.MathUtils.degToRad(rotationAngle);  // Konwertuj 140 stopni na radiany
    const cameraX = Math.cos(angle) * cameraPosition;
    const cameraZ = Math.sin(angle) * cameraPosition;

    const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 500000);
    camera.position.set(cameraX, 0, cameraZ);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    container.appendChild(renderer.domElement);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = planetRadius + planetRadius * 0.2;
    controls.maxDistance = 350;

    return { scene, camera, renderer, controls };
}