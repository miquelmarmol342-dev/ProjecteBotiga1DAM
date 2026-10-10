// Seleccionamos los elementos del HTML mediante sus IDs
const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

// Función que abre o cierra el menú
function alternarMenu() {
    // La función toggle() añade la clase si no está, y la elimina si ya está puesta
    sidebar.classList.toggle('abierto');
    overlay.classList.toggle('activo');
}

// Cuando se hace clic en el botón de las 3 rayas(hamburguesita), se ejecuta la función
menuBtn.addEventListener('click', alternarMenu);

// Cuando se hace clic en el fondo oscuro, también cerramos el menú
overlay.addEventListener('click', alternarMenu);