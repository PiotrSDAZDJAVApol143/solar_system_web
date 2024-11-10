//createPlanetRings.js
import * as THREE from 'three';

export function createPlanetRings(params) {
    const {
        innerRadius,
        outerRadius,
        texturePath,
        opacity = 0.7,
        rotationX = -Math.PI / 2,
        segments = 128,
        repeatsAroundRing = 1, // Liczba powtórzeń tekstury wokół pierścienia
    } = params;

    // Tworzenie geometrii pierścienia
    const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, segments);
    ringGeometry.rotateX(rotationX);

   // Modyfikacja współrzędnych UV
const pos = ringGeometry.attributes.position;
const uv = ringGeometry.attributes.uv;
const count = uv.count;

for (let i = 0; i < count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);

    const angle = Math.atan2(y, x);
    const u = (angle + Math.PI) / (2 * Math.PI) * repeatsAroundRing;
    const v = uv.getY(i);

    uv.setXY(i, u, v);
}
uv.needsUpdate = true;

    // Ładowanie tekstury pierścienia
    const ringTexture = new THREE.TextureLoader().load(texturePath);
    ringTexture.wrapS = THREE.RepeatWrapping;
    ringTexture.wrapT = THREE.ClampToEdgeWrapping;
    ringTexture.repeat.set(repeatsAroundRing, 1);

    // Tworzenie materiału pierścienia
    const ringMaterial = new THREE.MeshPhongMaterial({
        map: ringTexture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: opacity,
        depthWrite: false,
    });

    // Tworzenie mesha pierścienia
    const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
    ringMesh.renderOrder = 1;
    ringMesh.name = 'PlanetRing';

    return ringMesh;
}
