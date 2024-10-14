import * as THREE from 'three';

const loader = new THREE.TextureLoader();

export function createPlanet(planetRadius, texturePath, shininess) {
    const geometry = new THREE.SphereGeometry(planetRadius, 64, 64);
    const material = new THREE.MeshPhongMaterial({
        map: loader.load(texturePath),
        shininess: shininess || 10,
    });

    const planetMesh = new THREE.Mesh(geometry, material);
    planetMesh.castShadow = true;
    planetMesh.receiveShadow = true;

    return planetMesh;
}