// guiControls.js
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.17.0/dist/lil-gui.esm.min.js';

export function initializeGUI(guiParams, toggleObjectNames) {
    const gui = new GUI();

    gui.add(guiParams, 'showObjectNames')
       .name('Pokaż nazwy obiektów')
       .onChange((value) => {
           toggleObjectNames(value);
       });

    // Ustaw pozycję GUI w górnym lewym rogu
    gui.domElement.style.position = 'absolute';
    gui.domElement.style.top = '10px';
    gui.domElement.style.left = '10px';

    return gui;
}