//createPlanet.js
import * as THREE from 'three';

export const loader = new THREE.TextureLoader();

export function createPlanet(planetRadius, texturePath, shininess, bumpMapPath, bumpScale = 0.02, displacementMapPath, displacementScale = 0.2, normalMapPath) {
    const geometry = new THREE.SphereGeometry(planetRadius, 128, 128);
    const material = new THREE.MeshPhongMaterial({
        map: loader.load(texturePath),
        shininess: shininess || 10,
    });

    if(bumpMapPath){
        material.bumpMap =loader.load(bumpMapPath);
        material.bumpScale = bumpScale;
    }

    if (displacementMapPath) {
        material.displacementMap = loader.load(displacementMapPath);
        material.displacementScale = displacementScale;
    }
    if (normalMapPath) {
        material.normalMap = loader.load(normalMapPath);
    }
    
    const planetMesh = new THREE.Mesh(geometry, material);
    planetMesh.castShadow = true;
    planetMesh.receiveShadow = true;

    return planetMesh;
}