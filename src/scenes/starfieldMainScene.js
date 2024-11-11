//stafieldMainScene.js
import * as THREE from 'three';

let starfieldMainScene, starfieldCamera, starfieldRenderer, starfieldAnimateId;
let starfieldPaused = false;

export function initializeStarfieldMainScene(container) {
    starfieldMainScene = new THREE.Scene();
    const width = container.clientWidth;
    const height = container.clientHeight;

    starfieldCamera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
    starfieldCamera.position.z = 1;
    starfieldCamera.rotation.x = Math.PI / 2;

    starfieldRenderer = new THREE.WebGLRenderer({ alpha: true });
    starfieldRenderer.setSize(width, height);
    container.appendChild(starfieldRenderer.domElement);

    // Liczba gwiazd
    const starCount = 8000;

    // Tablice do przechowywania pozycji, prędkości i przyspieszenia
    const starPositions = new Float32Array(starCount * 3); // x, y, z dla każdej gwiazdy
    const velocities = new Float32Array(starCount);
    const accelerations = new Float32Array(starCount);

    // Inicjalizacja pozycji i parametrów gwiazd
    for (let i = 0; i < starCount; i++) {
        const x = Math.random() * 600 - 300;
        const y = Math.random() * 600 - 300;
        const z = Math.random() * 600 - 300;

        starPositions[i * 3] = x;
        starPositions[i * 3 + 1] = y;
        starPositions[i * 3 + 2] = z;

        velocities[i] = 0;
        accelerations[i] = 0.02;
    }

    // Tworzenie BufferGeometry i ustawienie atrybutu pozycji
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

    // Ładowanie tekstury gwiazd
    const sprite = new THREE.TextureLoader().load('../../assets/textures/stars/circle.png');
    const starMaterial = new THREE.PointsMaterial({
        color: 0xaaaaaa,
        size: 0.7,
        map: sprite,
        transparent: true,
        depthWrite: false,
    });

    // Tworzenie obiektu Points
    const stars = new THREE.Points(starGeo, starMaterial);
    starfieldMainScene.add(stars);

    // Pętla animacji
    function animate() {
        if (starfieldPaused) {
            starfieldAnimateId = requestAnimationFrame(animate);
            return;
          }
        const positions = starGeo.attributes.position.array;
        for (let i = 0; i < starCount; i++) {
            velocities[i] += accelerations[i];
            positions[i * 3 + 1] -= velocities[i]; // Ruch wzdłuż osi Y

            if (positions[i * 3 + 1] < -200) {
                positions[i * 3 + 1] = 200;
                velocities[i] = 0;
            }
        }
        starGeo.attributes.position.needsUpdate = true;
        stars.rotation.y += 0.002;

        starfieldAnimateId = requestAnimationFrame(animate);
        starfieldRenderer.render(starfieldMainScene, starfieldCamera);
    }
    animate();

    // Obsługa zmiany rozmiaru okna
    function onWindowResize() {
        const width = container.clientWidth;
        const height = container.clientHeight;
        starfieldCamera.aspect = width / height;
        starfieldCamera.updateProjectionMatrix();
        starfieldRenderer.setSize(width, height);
    }
    window.addEventListener('resize', onWindowResize, false);

    // Przechowaj funkcję czyszczącą
    starfieldMainScene.dispose = function () {
        cancelAnimationFrame(starfieldAnimateId);
        starfieldRenderer.dispose();
        container.removeChild(starfieldRenderer.domElement);
        window.removeEventListener('resize', onWindowResize, false);

        // Usuń geometrię i materiały
        starGeo.dispose();
        starMaterial.dispose();
        sprite.dispose();

        // Resetuj zmienne
        starfieldMainScene = null;
        starfieldCamera = null;
        starfieldRenderer = null;
        starfieldAnimateId = null;
    };
}

export function disposeStarfieldScene() {
    if (starfieldMainScene && starfieldMainScene.dispose) {
        starfieldMainScene.dispose();
    }
}
export function pauseStarfield() {
    starfieldPaused = true;
  }
  
  export function resumeStarfield() {
    starfieldPaused = false;
  }