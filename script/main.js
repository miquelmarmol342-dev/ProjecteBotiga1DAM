
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







// 2. CONFIGURACIÓN DE LA API Y VARIABLES (DOS URLS)
import { RAWG_API_KEY } from '/env.js';

// URL para el catálogo general (25 juegos)
const urlCatalogo = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&page_size=30`;
let juegosDeLaAPI = [];

// URL para el carrusel (20 juegos, filtrados entre 1980 y 1999)
const urlRetro = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&dates=1980-01-01,2005-12-31&page_size=20`;
let juegosCarrusel = [];

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
                        ${estrellasHTML} <span class="ml-1" ">${juego.rating}</span>  
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

// 4. OBTENER DATOS (Catálogo y Carrusel por separado)
async function obtenerJuegos() {
    // A) Petición para el Catálogo General
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

    // B) Petición para el Carrusel Retro
    const respuestaRetro = await fetch(urlRetro);
    const datosRetro = await respuestaRetro.json();
    juegosCarrusel = datosRetro.results;

    renderCarousel(juegosCarrusel);
}

// 5. LÓGICA DEL CARRUSEL
const carousel = document.getElementById('carousel');
let index = 0;

function renderCarousel(juegosParaMostrar) {
    if (!carousel) return;
    carousel.innerHTML = juegosParaMostrar.map(juego => crearTarjetaHTML(juego, "flex-none w-72")).join('');
}

function slide(direction) {
    // Importante: usamos juegosCarrusel.length para saber el límite
    if (juegosCarrusel.length === 0) return;

    const cardWidth = 288 + 24;
    index += direction;

    if (index >= juegosCarrusel.length) {
        index = 0;
    } else if (index < 0) {
        index = juegosCarrusel.length - 1;
    }

    carousel.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
}

document.getElementById('prev-btn')?.addEventListener('click', () => slide(-1));
document.getElementById('next-btn')?.addEventListener('click', () => slide(1));

// 6. LÓGICA DEL BUSCADOR (Lista desplegable tipo Autocompletar)

const inputBuscador = document.getElementById("buscador");
const listaSugerencias = document.getElementById("lista-sugerencias");
let temporizadorBuscador;

inputBuscador.addEventListener("input", (evento) => {
    clearTimeout(temporizadorBuscador);
    const textoBusqueda = evento.target.value;

    // Si borra el texto, ocultamos la lista y paramos
    if (textoBusqueda.trim() === "") {
        listaSugerencias.innerHTML = "";
        listaSugerencias.classList.add("hidden");
        return;
    }

    temporizadorBuscador = setTimeout(async () => {
        // Pedimos solo 5 resultados para no saturar la lista
        const urlBusqueda = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&search=${textoBusqueda}&ordering=-added&page_size=9`;

        const respuesta = await fetch(urlBusqueda);
        const datos = await respuesta.json();

        listaSugerencias.innerHTML = "";

        if (datos.results.length === 0) {
            listaSugerencias.innerHTML = `<div class="p-3 text-white text-sm font-bold">No se encontraron juegos</div>`;
        } else {
            datos.results.forEach(juego => {
                // Sacamos el año de lanzamiento si existe
                let año = juego.released ? juego.released.substring(0, 4) : "N/A";

                // Fabricamos una mini-fila para la lista
                listaSugerencias.innerHTML += `
                    <div class="flex items-center gap-3 p-3  hover:bg-slate-800 cursor-pointer border-b border-slate-700 transition-colors last:border-b-0">
                        <img src="${juego.background_image}" class="w-12 h-12 object-cover rounded-md" alt="${juego.name}">
                        <div class="flex flex-col">
                            <h6 class="text-white font-bold text-sm truncate w-48">${juego.name}</h6>
                            <span class="text-xs text-slate-400">${año} • ⭐ ${juego.rating}</span>
                        </div>
                    </div>
                `;
            });
        }

        // Mostramos la lista
        listaSugerencias.classList.remove("hidden");

    }, 500);
});

// Truco extra: Ocultar la lista si el usuario hace clic fuera del buscador
document.addEventListener("click", (evento) => {
    if (!evento.target.closest('.buscador_div')) {
        listaSugerencias.classList.add("hidden");
    }
});
// Arrancamos la aplicación
obtenerJuegos();



//Carrusel Pagina principal
// Selección de elementos del DOM
const pista = document.getElementById('carruselPista');
const btnAnterior = document.getElementById('btnAnterior');
const btnSiguiente = document.getElementById('btnSiguiente');
const slides = document.querySelectorAll('.banner-slide');

let indiceActual = 0;
const totalSlides = slides.length;

// Función que mueve la pista de posición
function moverCarrusel() {
    // Movemos la pista en el eje X según el índice (-0%, -100%, -200%...)
    pista.style.transform = `translateX(-${indiceActual * 100}%)`;
}

// Clic en botón "Siguiente"
btnSiguiente.addEventListener('click', () => {
    indiceActual++;
    if (indiceActual >= totalSlides) {
        indiceActual = 0; // Vuelve al inicio si llega al final
    }
    moverCarrusel();
});

// Clic en botón "Anterior"
btnAnterior.addEventListener('click', () => {
    indiceActual--;
    if (indiceActual < 0) {
        indiceActual = totalSlides - 1; // Va al último si está en el primero
    }
    moverCarrusel();
});

// (Opcional) Cambio automático cada 5 segundos
setInterval(() => {
    indiceActual = (indiceActual + 1) % totalSlides;
    moverCarrusel();
}, 5000);