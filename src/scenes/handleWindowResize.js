export function handleWindowResize(camera, renderer, container) {
    if (camera && renderer && container) {
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    }
}