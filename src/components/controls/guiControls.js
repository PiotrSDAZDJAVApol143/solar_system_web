// guiControls.js
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.17.0/dist/lil-gui.esm.min.js';

export function initializeGUI(guiParams, toggleObjectNames, orbitTails, resetCamera, container) {
    const gui = new GUI();

    // Przełącznik dla nazw obiektów
    gui.add(guiParams, 'showObjectNames')
       .name('Pokaż nazwy obiektów')
       .onChange((value) => {
           toggleObjectNames(value);
       });

    // Przełącznik dla ogonów orbity
    gui.add(guiParams, 'showOrbitTails')
       .name('Pokaż ogony orbity')
       .onChange((value) => {
           orbitTails.forEach(tail => {
               if (value) {
                   tail.show();
               } else {
                   tail.hide();
                   tail.tailPoints = []; // Opcjonalnie wyczyść ogon
               }
           });
       });

    // Przycisk do zatrzymania śledzenia
    gui.add({ stopFollowing: resetCamera }, 'stopFollowing').name('Zatrzymaj śledzenie');

    // Ustawienie pozycji GUI w górnym lewym rogu
    if (container) {
        container.appendChild(gui.domElement);
    } else {
        document.body.appendChild(gui.domElement); // Fallback na body, jeśli kontener nie jest zdefiniowany
    }
    
    gui.domElement.style.position = 'absolute';
    gui.domElement.style.top = '10px';
    gui.domElement.style.left = '10px';

    return gui;
}