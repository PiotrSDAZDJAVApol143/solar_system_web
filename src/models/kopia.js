

// createPlanetRings.js
import * as THREE from 'three';

export function createPlanetRings(params) {
    const {
        innerRadius,
        outerRadius,
        texturePath,
        opacity,
    } = params;

    // Tworzenie kształtu pierścienia (2D)
    const shape = new THREE.Shape();

    // Rysowanie zewnętrznego okręgu
    shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);

    // Tworzenie otworu wewnętrznego
    const holePath = new THREE.Path();
    holePath.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
    shape.holes.push(holePath);

    // Ustawienia dla ExtrudeGeometry
    const extrudeSettings = {
        depth: 0.05, // Grubość pierścienia (możesz dostosować)
        bevelEnabled: false,
        steps: 1,
        curveSegments: 128,
    };

    // Tworzenie geometrii poprzez wyciągnięcie kształtu
    const ringGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    // Obrót geometrii tak, aby była w płaszczyźnie XZ
    ringGeometry.rotateX(Math.PI / 2);

    // Ładowanie tekstury pierścienia
    const ringTexture = new THREE.TextureLoader().load(texturePath);
    ringTexture.wrapS = THREE.RepeatWrapping;
    ringTexture.wrapT = THREE.RepeatWrapping;

    // Tworzenie materiału pierścienia
   //const ringMaterial = new THREE.MeshPhongMaterial({
   //    color: 0xffffff,
   //    map: ringTexture,
   //    side: THREE.DoubleSide,
   //    transparent: true,
   //    opacity: opacity,
   //    shininess: 100,
   //    specular: 0xaaaaaa,
   //    receiveShadow: true,
   //});
     const ringMaterial = new THREE.MeshBasicMaterial({
       map: ringTexture,
      side: THREE.DoubleSide,
       transparent: true,
       opacity: opacity,
   });

    // Tworzenie mesha pierścienia
    const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
    ringMesh.name = 'PlanetRing';
    ringMesh.receiveShadow = true;

    return ringMesh;
}
