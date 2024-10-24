// guiControls.js
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.17.0/dist/lil-gui.esm.min.js';

export function initializeGUI(guiParams, toggleObjectNames, additionalControlsCallback) {
    const gui = new GUI();

    // Przełącznik dla nazw obiektów
    gui.add(guiParams, 'showObjectNames')
       .name('Pokaż nazwy obiektów')
       .onChange((value) => {
           toggleObjectNames(value);
       });

    // Jeśli istnieje dodatkowa funkcja do dodania kontrolerów
    if (additionalControlsCallback) {
        additionalControlsCallback(gui);
    }

    // Ustawienie pozycji GUI w górnym lewym rogu
    gui.domElement.style.position = 'absolute';
    gui.domElement.style.top = '10px';
    gui.domElement.style.left = '10px';

    return gui;
}