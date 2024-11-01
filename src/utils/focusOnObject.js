// focusOnObject.js
import * as THREE from 'three';
import * as TWEEN from 'tweenjs'; // Użyj aliasu z importmap

export function focusOnObject(object, camera, controls, state) {
    if (!controls || !camera || !object) {
        console.error("Brak niezbędnych argumentów w focusOnObject.");
        return;
    }

    const radius = object.userData.radius;
    console.log('Promień obiektu:', radius);
    const diameter = radius * 2;

    let cameraMinDistance;
    let controlsMinDistance;
    let controlsMaxDistance;

    if (diameter > 0.5) {
        console.log("obiekt średni")
        // Dla obiektów o średnicy większej niż 0.5
        cameraMinDistance = diameter * 1.2;
        controlsMinDistance = cameraMinDistance;
        controlsMaxDistance = cameraMinDistance * 5;
    } else {
        console.log("obiekt mały")
        // Dla obiektów o średnicy mniejszej lub równej 0.5
        cameraMinDistance = diameter * 1.5; // Używane do pozycjonowania kamery
        controlsMinDistance = cameraMinDistance * 1;
        controlsMaxDistance = cameraMinDistance * 20;
    }

    controls.minDistance = controlsMinDistance;
    controls.maxDistance = controlsMaxDistance;
    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.enablePan = false;

    const targetPosition = new THREE.Vector3();
    object.getWorldPosition(targetPosition);

    state.isTweening = true;
    state.isFollowingObject = true;
    state.currentTargetObject = object;

    // Oblicz kierunek od obiektu do kamery
    const direction = new THREE.Vector3().subVectors(camera.position, targetPosition).normalize();

    // Ustawienie nowej pozycji kamery w odległości cameraMinDistance od obiektu
    const newCameraPosition = new THREE.Vector3().addVectors(
        targetPosition,
        direction.multiplyScalar(cameraMinDistance)
    );

    // Animacja przejścia kamery
    const from = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
    const to = { x: newCameraPosition.x, y: newCameraPosition.y, z: newCameraPosition.z };

    controls.target.copy(targetPosition);
    state.previousTargetPosition.copy(targetPosition);

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
