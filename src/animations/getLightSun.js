import * as THREE from 'three';
import { Lensflare, LensflareElement } from 'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/objects/Lensflare.js';

export function addSunAndLight(scene, sunDistance, sunRadius, flarePower, ambientLightPower) {
    const loader = new THREE.TextureLoader();
    
    // Światło
    const sunLight = new THREE.DirectionalLight(0xffffff, 3.5);
    sunLight.position.set(sunDistance, 0, 0);
    sunLight.castShadow = true;
    scene.add(sunLight);

    // Słońce
    const sunTexture = loader.load("../../assets/textures/stars/8k_sun.jpg");
    const sunGeo = new THREE.SphereGeometry(sunRadius, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ map: sunTexture });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.position.set(sunDistance, 0, 0);
    scene.add(sunMesh);

    // Rozbłysk
    const flareTexture = loader.load('../../assets/textures/stars/lensflare0.png');
    const lensflare = new Lensflare();
    lensflare.addElement(new LensflareElement(flareTexture, flarePower, 0));
    sunMesh.add(lensflare);

    // Przegub dla orbity Słońca
    const sunPivot = new THREE.Object3D();
    sunPivot.add(sunMesh);
    sunPivot.add(sunLight);
    scene.add(sunPivot); // Dodanie przegubu do sceny

    const ambientLight = new THREE.AmbientLight(0x404040, ambientLightPower);
    scene.add(ambientLight);

    return { sunMesh, sunLight, sunPivot, ambientLight };
}