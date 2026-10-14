// 1. LÓGICA DEL MENÚ LATERAL
const btnAbrir = document.getElementById('btnAbrirMenu');
const btnCerrar = document.getElementById('btnCerrarMenu');
const menuLateral = document.getElementById('menuLateral');
const menuOverlay = document.getElementById('menuOverlay');

function abrirMenu() {
    menuLateral.classList.remove('-translate-x-full');
    menuOverlay.classList.remove('hidden');
    setTimeout(() => {
        menuOverlay.classList.remove('opacity-0');
    }, 10);
}

function cerrarMenu() {
    menuLateral.classList.add('-translate-x-full');
    menuOverlay.classList.add('opacity-0');
    setTimeout(() => {
        menuOverlay.classList.add('hidden');
    }, 300);
}

btnAbrir.addEventListener('click', abrirMenu);
btnCerrar.addEventListener('click', cerrarMenu);
menuOverlay.addEventListener('click', cerrarMenu);

// 2. CONFIGURACIÓN DE LA API Y VARIABLES
import { RAWG_API_KEY } from '/env.js';

// Catálogo general
const urlCatalogo = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&page_size=21`;
let juegosDeLaAPI = [];

// Carrusel 1: Retro
const urlRetro = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&dates=1980-01-01,2005-12-31&page_size=20`;
let juegosCarruselRetro = [];

// Carrusel 2: Coches (Género Racing)
const urlCoches = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&genres=racing&page_size=20`;
let juegosCarruselCoches = [];

// 3. EL COMPONENTE: La "Fábrica" de Tarjetas
function crearTarjetaHTML(juego, clasesExtra = "") {
    let valorPorNota = juego.rating * 10;
    let picoVariado = juego.id % 10;
    let precioEstatico = (valorPorNota + picoVariado + 9.99).toFixed(2);

    let estrellasHTML = "";
    let notaRedondeada = Math.round(juego.rating - 0.5);
    for (let i = 0; i < notaRedondeada; i++) {
        estrellasHTML += `<i class="bx bxs-star" style="color: #eab308;"></i>`;
    }

    return `
        <div class="tarjeta-juego ${clasesExtra}">
            <div class="tarjeta-imagen-caja">
                <img src="${juego.background_image}" alt="Portada de ${juego.name}" class="tarjeta-imagen" />
                <div class="tarjeta-nota">
                    <i class="bx bxs-star" style="color: #eab308;"></i> ${juego.rating}
                </div>
            </div>
            <div class="tarjeta-contenido">
                <h5 class="tarjeta-titulo">${juego.name}</h5>
                <div class="tarjeta-info">
                    <div class="tarjeta-estrellas">
                        ${estrellasHTML} <span class="ml-1">${juego.rating}</span>
                    </div>
                    <span class="tarjeta-fecha">${juego.released}</span>
                </div>
                <div class="tarjeta-precio">${precioEstatico}€</div>
                <div class="tarjeta-botones">
                    <button class="btn-gamer btn-comprar text-[14px]">
                          <i class='bx bx-cart-add text-2xl'></i> COMPRAR
                    </button>
                    <button class="btn-favorito"><i class='bx bx-heart icono-fav'></i></button>
                </div>
            </div>
        </div>
    `;
}

// 4. OBTENER DATOS
async function obtenerJuegos() {
    // A) Catálogo General
    const respuestaCatalogo = await fetch(urlCatalogo);
    const datosCatalogo = await respuestaCatalogo.json();
    juegosDeLaAPI = datosCatalogo.results;

    const contenedor = document.getElementById("contenedor-juegos");
    if (contenedor) {
        contenedor.innerHTML = "";
        juegosDeLaAPI.forEach(juego => {
            contenedor.innerHTML += crearTarjetaHTML(juego);
        });
    }

    // B) Carrusel Retro
    const respuestaRetro = await fetch(urlRetro);
    const datosRetro = await respuestaRetro.json();
    juegosCarruselRetro = datosRetro.results;

    const carousel1 = document.getElementById('carousel');
    if (carousel1) carousel1.innerHTML = juegosCarruselRetro.map(juego => crearTarjetaHTML(juego, "flex-none w-72")).join('');

    // Configuramos los botones del carrusel retro
    configurarControlesCarrusel('carousel', 'prev-btn', 'next-btn', juegosCarruselRetro.length);

    // C) Carrusel de Coches
    const respuestaCoches = await fetch(urlCoches);
    const datosCoches = await respuestaCoches.json();
    juegosCarruselCoches = datosCoches.results;

    const carousel2 = document.getElementById('carousel2');
    if (carousel2) carousel2.innerHTML = juegosCarruselCoches.map(juego => crearTarjetaHTML(juego, "flex-none w-72")).join('');

    // Configuramos los botones del carrusel de coches
    configurarControlesCarrusel('carousel2', 'prev-btn2', 'next-btn2', juegosCarruselCoches.length);
}

// 5. LÓGICA DE MÚLTIPLES CARRUSELES
function configurarControlesCarrusel(idCarrusel, idBtnAnterior, idBtnSiguiente, totalJuegos) {
    const carruselDOM = document.getElementById(idCarrusel);
    const btnAnterior = document.getElementById(idBtnAnterior);
    const btnSiguiente = document.getElementById(idBtnSiguiente);

    if (!carruselDOM || totalJuegos === 0) return;

    let indexLocal = 0;
    const cardWidth = 288 + 24; // Ancho de la tarjeta + espacio

    function mover(direccion) {
        indexLocal += direccion;

        if (indexLocal >= totalJuegos) {
            indexLocal = 0;
        } else if (indexLocal < 0) {
            indexLocal = totalJuegos - 1;
        }

        carruselDOM.scrollTo({ left: indexLocal * cardWidth, behavior: 'smooth' });
    }

    if (btnAnterior) btnAnterior.addEventListener('click', () => mover(-1));
    if (btnSiguiente) btnSiguiente.addEventListener('click', () => mover(1));
}

// 6. LÓGICA DEL BUSCADOR
const inputBuscador = document.getElementById("buscador");
const listaSugerencias = document.getElementById("lista-sugerencias");
let temporizadorBuscador;

inputBuscador.addEventListener("input", (evento) => {
    clearTimeout(temporizadorBuscador);
    const textoBusqueda = evento.target.value;

    if (textoBusqueda.trim() === "") {
        listaSugerencias.innerHTML = "";
        listaSugerencias.classList.add("hidden");
        return;
    }

    temporizadorBuscador = setTimeout(async () => {
        const urlBusqueda = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&search=${textoBusqueda}&ordering=-added&page_size=9`;
        const respuesta = await fetch(urlBusqueda);
        const datos = await respuesta.json();

        listaSugerencias.innerHTML = "";

        if (datos.results.length === 0) {
            listaSugerencias.innerHTML = `<div class="p-3 text-white text-sm font-bold">No se encontraron juegos</div>`;
        } else {
            datos.results.forEach(juego => {
                let año = juego.released ? juego.released.substring(0, 4) : "N/A";

                listaSugerencias.innerHTML += `
                    <div class="flex items-center gap-3 p-3 hover:bg-slate-800 cursor-pointer border-b border-slate-700 transition-colors last:border-b-0">
                        <img src="${juego.background_image}" class="w-12 h-12 object-cover rounded-md" alt="${juego.name}">
                        <div class="flex flex-col">
                            <h6 class="text-white font-bold text-sm truncate w-48">${juego.name}</h6>
                            <span class="text-xs text-slate-400">${año} - ⭐ ${juego.rating}</span>
                        </div>
                    </div>
                `;
            });
        }
        listaSugerencias.classList.remove("hidden");
    }, 500);
});

document.addEventListener("click", (evento) => {
    if (!evento.target.closest('.buscador_div')) {
        listaSugerencias.classList.add("hidden");
    }
});

// Arrancamos la aplicación
obtenerJuegos();

// 7. CARRUSEL PÁGINA PRINCIPAL
const pista = document.getElementById('carruselPista');
const btnAnteriorSlider = document.getElementById('btnAnterior');
const btnSiguienteSlider = document.getElementById('btnSiguiente');
const slides = document.querySelectorAll('.banner-slide');

let indiceActual = 0;
const totalSlides = slides.length;

function moverCarruselPrincipal() {
    if (pista) {
        pista.style.transform = `translateX(-${indiceActual * 100}%)`;
    }
}

if (btnSiguienteSlider) {
    btnSiguienteSlider.addEventListener('click', () => {
        indiceActual++;
        if (indiceActual >= totalSlides) {
            indiceActual = 0;
        }
        moverCarruselPrincipal();
    });
}

if (btnAnteriorSlider) {
    btnAnteriorSlider.addEventListener('click', () => {
        indiceActual--;
        if (indiceActual < 0) {
            indiceActual = totalSlides - 1;
        }
        moverCarruselPrincipal();
    });
}

setInterval(() => {
    if (totalSlides > 0) {
        indiceActual = (indiceActual + 1) % totalSlides;
        moverCarruselPrincipal();
    }
}, 5000);