// labelUtils.js
import { CSS2DRenderer, CSS2DObject } from 'https://cdn.jsdelivr.net/npm/three@0.169/examples/jsm/renderers/CSS2DRenderer.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169/build/three.module.js';

export function initializeLabelRenderer(container) {
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(container.clientWidth, container.clientHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0';
    labelRenderer.domElement.style.pointerEvents = 'none';
    container.appendChild(labelRenderer.domElement);
    return labelRenderer;
}

export function createLabel(text) {
    const div = document.createElement('div');
    div.className = 'label';
    div.textContent = text;
    div.style.marginTop = '-1em';
    div.style.pointerEvents = 'auto';
    div.style.cursor = 'pointer';



    const labelObject = new CSS2DObject(div);
    labelObject.position.set(0, 0, 0);
    return labelObject;
}

export function updateLabelVisibility(labelObject, targetObject, camera, raycaster, occlusionObjects, guiParams) {
    if (!guiParams.showObjectNames) {
        labelObject.visible = false;
        return;
    }
    // Pobierz pozycję obiektu w przestrzeni świata
    let targetPosition = new THREE.Vector3();
    targetObject.getWorldPosition(targetPosition);

    // Ustaw raycaster
    raycaster.set(camera.position, targetPosition.clone().sub(camera.position).normalize());

    // Sprawdź przecięcia
    let intersects = raycaster.intersectObjects(occlusionObjects, true);

    if (intersects.length > 0) {
        // Jeśli pierwszy przecięty obiekt to nasz cel, pokaż etykietę
        if (isDescendant(targetObject, intersects[0].object)) {
            labelObject.visible = true;
        } else {
            labelObject.visible = false;
        }
    } else {
        labelObject.visible = false;
    }
}

function isDescendant(parent, child) {
    let obj = child;
    while (obj != null) {
        if (obj === parent) {
            return true;
        }
        obj = obj.parent;
    }
    return false;
}