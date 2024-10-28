// focusOnObject.js
import * as THREE from 'three';
import * as TWEEN from 'tweenjs'; // Użyj aliasu z importmap

export function focusOnObject(object, camera, controls, state) {
    if (!controls || !camera || !object) {
        console.error("Brak niezbędnych argumentów w focusOnObject.");
        return;
    }

    const radius = object.userData.radius;
    const minDistance = radius * 1.2;

    controls.minDistance = minDistance;
    controls.maxDistance = minDistance * 20;
    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.enablePan = false;

    const targetPosition = new THREE.Vector3();
    object.getWorldPosition(targetPosition);

    state.isTweening = true;
    state.isFollowingObject = true;
    state.currentTargetObject = object;

    controls.target.copy(targetPosition);
    state.previousTargetPosition.copy(targetPosition);

    const from = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
    const to = { x: targetPosition.x, y: targetPosition.y, z: targetPosition.z };

    const tween = new TWEEN.Tween(from)
        .to(to, 2000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
            camera.position.set(from.x, from.y, from.z);
            controls.update();
        })
        .onComplete(() => {
            state.isTweening = false;
            controls.target.copy(targetPosition);
            controls.update();
        })
        .start();
}