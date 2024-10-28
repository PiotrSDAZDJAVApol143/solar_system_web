//createPlanet.js
import * as THREE from 'three';

export const loader = new THREE.TextureLoader();

export function createPlanet(planetRadius, texturePath, shininess, bumpMapPath, bumpScale = 0.02) {
    const geometry = new THREE.SphereGeometry(planetRadius, 64, 64);
    const material = new THREE.MeshPhongMaterial({
        map: loader.load(texturePath),
        shininess: shininess || 10,
    });

    if(bumpMapPath){
        material.bumpMap =loader.load(bumpMapPath);
        material.bumpScale = bumpScale;
    }

    const planetMesh = new THREE.Mesh(geometry, material);
    planetMesh.castShadow = true;
    planetMesh.receiveShadow = true;

    return planetMesh;
}