//moon.js
import * as THREE from 'three';
import { createPlanet } from './createPlanet.js';
import { createLabel, updateLabelVisibility } from '../utils/labelUtils.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.169/examples/jsm/loaders/GLTFLoader.js';
import { OrbitTail } from '../utils/orbitTail.js';
import { focusOnObject } from '../utils/focusOnObject.js';
import { PLYLoader } from 'https://cdn.jsdelivr.net/npm/three@0.169/examples/jsm/loaders/PLYLoader.js';

export class Moon {
    constructor(params) {
        this.name = params.name;
        this.radius = params.radius;
        this.texturePath = params.texturePath || null;
        this.modelPath = params.modelPath || null;
        this.scale = params.scale || 1;
        this.bumpMapPath = params.bumpMapPath || null;
        this.displacementMapPath = params.displacementMapPath || null;
        this.displacementScale = params.displacementScale || 0;
        this.orbitDuration = params.orbitDuration;
        this.rotationDuration = params.rotationDuration || params.orbitDuration;
        this.distance = params.distance;
        this.orbitTilt = params.orbitTilt || 0;
        this.rotationTilt = params.rotationTilt || 0;
        this.parentPlanet = params.parentPlanet;
        this.scene = params.scene;
        this.camera = params.camera;
        this.controls = params.controls;
        this.state = params.state;
        this.guiParams = params.guiParams;
        this.occlusionObjects = params.occlusionObjects;
        this.orbitTails = params.orbitTails;
        this.labelRenderer = params.labelRenderer;
        this.raycaster = params.raycaster;
        this.isGLTF = params.isGLTF || false;
        this.isPLY = params.isPLY || false;

        this.initMoon();
    }

    initMoon() {
        // Tworzenie pivotu orbity księżyca
        this.orbitPivot = new THREE.Object3D();
        this.parentPlanet.add(this.orbitPivot);
        this.orbitPivot.rotation.x = THREE.MathUtils.degToRad(this.orbitTilt);

        // Tworzenie mesha księżyca
        if (this.isGLTF) {
            const loader = new GLTFLoader();
            loader.load(this.modelPath, (gltf) => {
                this.mesh = gltf.scene;
                this.applyProjectAndIndividualScale();
                this.afterMeshLoad();
            });
        } else if (this.isPLY) {
            const loader = new PLYLoader();
            loader.load(this.modelPath, (geometry) => {
                const material = new THREE.MeshStandardMaterial({
                    map: this.texturePath ? new THREE.TextureLoader().load(this.texturePath) : null,
                });
                this.mesh = new THREE.Mesh(geometry, material);
                this.applyProjectAndIndividualScale();
                this.afterMeshLoad();
            });
        } else {
            // createPlanet jest generowane bez dodatkowego skalowania
            this.mesh = createPlanet(
                this.radius,
                this.texturePath,
                15,
                this.bumpMapPath,
                2,
                this.displacementMapPath,
                this.displacementScale
            );
            this.afterMeshLoad();
        }
    }

    applyProjectAndIndividualScale() {
        // Ustawiamy docelowy pełny wymiar obiektu na podstawie jego `radius`
        const targetSize = this.radius * 2; // Zakładamy, że radius oznacza promień księżyca
        
        // Uzyskaj obecny rozmiar obiektu
        const boundingBox = new THREE.Box3().setFromObject(this.mesh);
        const size = new THREE.Vector3();
        boundingBox.getSize(size);
        console.log(`Rozmiar modelu przed skalowaniem:`, size);
    
        // Oblicz jeden współczynnik skalowania dla całego modelu
        const scaleFactor = targetSize / Math.max(size.x, size.y, size.z);
    
        // Zastosuj współczynnik skalowania jednocześnie na wszystkie wymiary
        this.mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);
    
        // Sprawdź rozmiar po skalowaniu
        const scaledBoundingBox = new THREE.Box3().setFromObject(this.mesh);
        const scaledSize = new THREE.Vector3();
        scaledBoundingBox.getSize(scaledSize);
        console.log(`Rozmiar modelu po skalowaniu:`, scaledSize);
    }

    afterMeshLoad() {
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        this.mesh.position.set(this.distance, 0, 0);
        this.mesh.rotation.z = THREE.MathUtils.degToRad(this.rotationTilt);
        this.orbitPivot.add(this.mesh);

        // Ustawienie właściwości mesha
        this.setMeshProperties();

        // Dodanie do obiektów zasłaniających
        this.occlusionObjects.push(this.mesh);

        // Tworzenie etykiety
        this.label = createLabel(this.name);
        this.mesh.add(this.label);
        this.label.visible = this.guiParams.showObjectNames;

        // Dodanie obsługi kliknięcia na etykietę
        this.label.element.addEventListener('click', (event) => {
            event.stopPropagation();
            focusOnObject(this.mesh, this.camera, this.controls, this.state);

            const planetInfoDiv = document.getElementById('planet-info');
            if (planetInfoDiv) {
                planetInfoDiv.innerHTML = `
                    <h2>Informacje o ${this.name}</h2>
                    <p>${this.name} jest jednym z księżyców...</p>
                `;
            }
        });

        // Tworzenie ogona orbity
        const maxPoints = Math.round(0.6 * this.orbitDuration * 60);
        this.orbitTail = new OrbitTail(this.mesh, this.scene, maxPoints, { color: 0xcccccc, opacity: 0.5 });
        this.orbitTail.hide(); // Ukryj na starcie
        this.orbitTails.push(this.orbitTail);
    }

    setMeshProperties() {
        this.mesh.name = this.name;
        this.mesh.userData.radius = this.radius;
        this.mesh.traverse((child) => {
            if (child.isMesh) {
                child.name = this.name;
                child.userData.radius = this.radius;
            }
        });
    }

    update(deltaTime) {
        // Rotacja księżyca wokół własnej osi
        if (this.mesh) {
            this.mesh.rotation.y += (2 * Math.PI) / (this.rotationDuration * 60) * deltaTime;
            this.mesh.rotation.x += (2 * Math.PI) / (this.rotationDuration * 1000) * deltaTime;
            this.mesh.rotation.z += (2 * Math.PI) / (this.rotationDuration * 1000) * deltaTime;

        }

        // Aktualizacja orbity księżyca
        if (this.orbitPivot) {
            this.orbitPivot.rotation.y += (2 * Math.PI) / (this.orbitDuration * 60) * deltaTime;
        }

        // Aktualizacja widoczności etykiety
        if (this.mesh && this.label) {
            updateLabelVisibility(this.label, this.mesh, this.camera, this.raycaster, this.occlusionObjects);
        }

        // Aktualizacja ogona orbity
        if (this.guiParams.showOrbitTails && this.orbitTail) {
            this.orbitTail.update();
        }
    }
}
