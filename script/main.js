// Control del menú lateral
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

if(btnAbrir) btnAbrir.addEventListener('click', abrirMenu);
if(btnCerrar) btnCerrar.addEventListener('click', cerrarMenu);
if(menuOverlay) menuOverlay.addEventListener('click', cerrarMenu);


// config de la api para las 3url o mas en el futuro
import { RAWG_API_KEY } from '/env.js';

const urlCatalogo = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&page_size=15`;
const urlRetro = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&dates=1980-01-01,2005-12-31&page_size=6`;
const urlCoches = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&genres=racing&page_size=6`;

let juegosDeLaAPI = [];
let juegosCarruselRetro = [];
let juegosCarruselCoches = [];


// plantilla para juegos
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
            <div class="tarjeta-wrapper">
                <img src="${juego.background_image}" alt="Portada de ${juego.name}" class="tarjeta-imagen" />
                <div class="tarjeta-gradiente-sombra"></div>
            </div>

            <div class="tarjeta-contenido-3d">
                <h5 class="tarjeta-titulo text-white font-bold text-lg truncate">${juego.name}</h5>
                <div class="tarjeta-info flex justify-between text-sm text-slate-300 my-2">
                    <div class="tarjeta-estrellas flex items-center">
                        ${estrellasHTML} <span class="ml-1">${juego.rating}</span>
                    </div>
                    <span class="tarjeta-fecha">${juego.released}</span>
                </div>
                <div class="tarjeta-precio text-2xl font-bold text-white mb-3">${precioEstatico}€</div>
                <div class="tarjeta-botones flex gap-2">
                    <button class="btn-gamer btn-comprar flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded py-2 flex justify-center items-center gap-1 transition-colors"
                            data-id="${juego.id}"
                            data-nombre="${juego.name}"
                            data-precio="${precioEstatico}"
                            data-imagen="${juego.background_image}">
                          <i class='bx bx-cart-add text-xl'></i> COMPRAR
                    </button>
                    <button class="btn-favorito bg-slate-700 hover:bg-slate-600 text-white p-2 rounded transition-colors">
                        <i class='bx bx-heart icono-fav'></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}


// cargamos api en paralelo para que no tarde tannnnto en cargar las los juegos
async function obtenerJuegos() {
    try {
        const [respuestaCatalogo, respuestaRetro, respuestaCoches] = await Promise.all([
            fetch(urlCatalogo),
            fetch(urlRetro),
            fetch(urlCoches)
        ]);

        const [datosCatalogo, datosRetro, datosCoches] = await Promise.all([
            respuestaCatalogo.json(),
            respuestaRetro.json(),
            respuestaCoches.json()
        ]);

        // Pintamos el catálogo principal
        juegosDeLaAPI = datosCatalogo.results;
        const contenedor = document.getElementById("contenedor-juegos");
        if (contenedor) {
            contenedor.innerHTML = juegosDeLaAPI.map(juego => crearTarjetaHTML(juego)).join('');
        }

        // Pintamos el carrusel retro
        juegosCarruselRetro = datosRetro.results;
        const carousel1 = document.getElementById('carousel');
        if (carousel1) {
            carousel1.innerHTML = juegosCarruselRetro.map(juego => crearTarjetaHTML(juego, "flex-none w-72")).join('');
            configurarControlesCarrusel('carousel', 'prev-btn', 'next-btn', juegosCarruselRetro.length);
        }

        // Pintamos el carrusel de coches
        juegosCarruselCoches = datosCoches.results;
        const carousel2 = document.getElementById('carousel2');
        if (carousel2) {
            carousel2.innerHTML = juegosCarruselCoches.map(juego => crearTarjetaHTML(juego, "flex-none w-72")).join('');
            configurarControlesCarrusel('carousel2', 'prev-btn2', 'next-btn2', juegosCarruselCoches.length);
        }

        // Activamos el efecto 3D en las tarjetas
        activarSeguimientoRaton();

    } catch (error) {
        console.error("Falló la carga de juegos:", error);
    }
}


// Sistema para mover los carruseles con los botones de flecha
function configurarControlesCarrusel(idCarrusel, idBtnAnterior, idBtnSiguiente, totalJuegos) {
    const carruselDOM = document.getElementById(idCarrusel);
    const btnAnterior = document.getElementById(idBtnAnterior);
    const btnSiguiente = document.getElementById(idBtnSiguiente);

    if (!carruselDOM || totalJuegos === 0) return;

    let indexLocal = 0;
    const cardWidth = 288 + 24;

    function mover(direccion) {
        indexLocal += direccion;
        if (indexLocal >= totalJuegos) indexLocal = 0;
        else if (indexLocal < 0) indexLocal = totalJuegos - 1;

        carruselDOM.scrollTo({ left: indexLocal * cardWidth, behavior: 'smooth' });
    }

    if (btnAnterior) btnAnterior.addEventListener('click', () => mover(-1));
    if (btnSiguiente) btnSiguiente.addEventListener('click', () => mover(1));
}


// buscador con "retrado" asi no saturamos la api por cada letra y demas
const inputBuscador = document.getElementById("buscador");
const listaSugerencias = document.getElementById("lista-sugerencias");
let temporizadorBuscador;

if (inputBuscador && listaSugerencias) {
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
                                <span class="text-xs text-slate-400">${año} ⭐ ${juego.rating}</span>
                            </div>
                        </div>
                    `;
                });
            }
            listaSugerencias.classList.remove("hidden");
        }, 500);
    });

    // Ocultar sugerencias si haces clic fuera del buscador
    document.addEventListener("click", (evento) => {
        if (!evento.target.closest('.buscador_div')) {
            listaSugerencias.classList.add("hidden");
        }
    });
}


// Logica del baner
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
        if (indiceActual >= totalSlides) indiceActual = 0;
        moverCarruselPrincipal();
    });
}

if (btnAnteriorSlider) {
    btnAnteriorSlider.addEventListener('click', () => {
        indiceActual--;
        if (indiceActual < 0) indiceActual = totalSlides - 1;
        moverCarruselPrincipal();
    });
}

setInterval(() => {
    if (totalSlides > 0) {
        indiceActual = (indiceActual + 1) % totalSlides;
        moverCarruselPrincipal();
    }
}, 5000);


// fondo animado con particulas y demas
const canvas = document.getElementById('lienzoGamer');

if (canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particulasArray = [];
    let raton = { x: null, y: null, radioSq: 6400 };

    window.addEventListener('mousemove', (event) => {
        raton.x = event.clientX;
        raton.y = event.clientY;
    });

    window.addEventListener('mouseout', () => {
        raton.x = null;
        raton.y = null;
    });

    const colores = ['#e8b402', '#de1115', '#00ffcc', '#ff00ff', '#ffffff'];
    const formas = ['estrella', 'fantasma', 'corazon', 'marciano', 'pixel'];

    class ParticulaPixel {
        constructor(x, y, direccionX, direccionY, tamaño, color, forma) {
            this.x = x;
            this.y = y;
            this.direccionX = direccionX;
            this.direccionY = direccionY;
            this.tamaño = tamaño;
            this.color = color;
            this.forma = forma;
        }

        dibujar() {
            ctx.fillStyle = this.color;
            const t = this.tamaño;

            switch(this.forma) {
                case 'estrella':
                    ctx.fillRect(this.x + t/3, this.y, t/3, t);
                    ctx.fillRect(this.x, this.y + t/3, t, t/3);
                    break;
                case 'fantasma':
                    ctx.fillRect(this.x + t/4, this.y, t/2, t);
                    ctx.fillRect(this.x, this.y + t/4, t, t/2);
                    ctx.fillRect(this.x, this.y + 3*t/4, t/4, t/4);
                    ctx.fillRect(this.x + 3*t/4, this.y + 3*t/4, t/4, t/4);
                    break;
                case 'corazon':
                    ctx.fillRect(this.x + t/4, this.y, t/4, t/4);
                    ctx.fillRect(this.x + 2*t/4, this.y, t/4, t/4);
                    ctx.fillRect(this.x, this.y + t/4, t, t/4);
                    ctx.fillRect(this.x + t/4, this.y + 2*t/4, 2*t/4, t/4);
                    ctx.fillRect(this.x + 2*t/4, this.y + 3*t/4, t/4, t/4);
                    break;
                case 'marciano':
                    ctx.fillRect(this.x + t/4, this.y, 2*t/4, t/4);
                    ctx.fillRect(this.x, this.y + t/4, t, t/4);
                    ctx.fillRect(this.x + t/4, this.y + 2*t/4, 2*t/4, t/4);
                    ctx.fillRect(this.x, this.y + 3*t/4, t/4, t/4);
                    ctx.fillRect(this.x + 3*t/4, this.y + 3*t/4, t/4, t/4);
                    break;
                default:
                    ctx.fillRect(this.x, this.y, t, t);
                    break;
            }
        }

        actualizar() {
            if (this.x > canvas.width || this.x < 0) this.direccionX = -this.direccionX;
            if (this.y > canvas.height || this.y < 0) this.direccionY = -this.direccionY;

            if (raton.x !== null && raton.y !== null) {
                let dx = raton.x - this.x;
                let dy = raton.y - this.y;
                let distanciaSq = dx * dx + dy * dy;

                if (distanciaSq < raton.radioSq) {
                    this.x -= dx / 15;
                    this.y -= dy / 15;
                }
            }

            this.x += this.direccionX;
            this.y += this.direccionY;
            this.dibujar();
        }
    }

    function iniciarFondo() {
        particulasArray = [];
        let numeroParticulas = Math.min((canvas.height * canvas.width) / 18000, 100);

        for (let i = 0; i < numeroParticulas; i++) {
            let tamaño = Math.random() * 8 + 12;
            let x = Math.random() * (canvas.width - tamaño * 2) + tamaño;
            let y = Math.random() * (canvas.height - tamaño * 2) + tamaño;
            let direccionX = (Math.random() - 0.5) * 0.5;
            let direccionY = (Math.random() - 0.5) * 0.5;
            let color = colores[Math.floor(Math.random() * colores.length)];
            let forma = formas[Math.floor(Math.random() * formas.length)];

            particulasArray.push(new ParticulaPixel(x, y, direccionX, direccionY, tamaño, color, forma));
        }
    }

    function animarFondo() {
        requestAnimationFrame(animarFondo);
        ctx.fillStyle = 'rgba(4, 22, 49, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < particulasArray.length; i++) {
            particulasArray[i].actualizar();
        }
    }

    iniciarFondo();
    animarFondo();

    let debounceTimer;
    window.addEventListener('resize', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            iniciarFondo();
        }, 150);
    });
}


// Efecto Parallax 3D siguiendo el movimiento del ratón sobre las tarjetas
function activarSeguimientoRaton() {
    const tarjetas = document.querySelectorAll('.tarjeta-juego');

    tarjetas.forEach(tarjeta => {
        const wrapper = tarjeta.querySelector('.tarjeta-wrapper');
        const imagen = tarjeta.querySelector('.tarjeta-imagen');

        tarjeta.addEventListener('mouseenter', () => {
            wrapper.style.transition = "none";
            imagen.style.transition = "none";
        });

        tarjeta.addEventListener('mousemove', (e) => {
            const rect = tarjeta.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;

            const mouseX = (e.clientX - rect.left - width / 2) / (width / 2);
            const mouseY = (e.clientY - rect.top - height / 2) / (height / 2);

            const rotateX = mouseY * -15;
            const rotateY = mouseX * 15;
            const translateX = mouseX * -20;
            const translateY = mouseY * -20;

            wrapper.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(-20px)`;
            imagen.style.transform = `scale(1.15) translateX(${translateX}px) translateY(${translateY}px)`;
        });

        tarjeta.addEventListener('mouseleave', () => {
            wrapper.style.transition = "transform 1.5s ease-out, box-shadow 0.5s ease-out";
            imagen.style.transition = "transform 0.5s ease-out";

            wrapper.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)`;
            imagen.style.transform = `scale(1.15) translateX(0px) translateY(0px)`;
        });
    });
}


// Lógica del carrito de compras guardado en localStorage
let carrito = JSON.parse(localStorage.getItem('carritoGamer')) || [];

function actualizarContadorCarrito() {
    const contadorDOM = document.getElementById('contador-carrito');
    if (contadorDOM) {
        const totalItems = carrito.reduce((suma, item) => suma + item.cantidad, 0);
        if (totalItems > 0) {
            contadorDOM.textContent = totalItems > 99 ? '+99' : totalItems;
            contadorDOM.classList.remove('hidden');
        } else {
            contadorDOM.classList.add('hidden');
        }
    }
}
actualizarContadorCarrito();

// Añadir productos al hacer clic en Comprar
document.addEventListener('click', (evento) => {
    const btnComprar = evento.target.closest('.btn-comprar');
    if (btnComprar) {
        const idJuego = btnComprar.getAttribute('data-id');
        const nombre = btnComprar.getAttribute('data-nombre');
        const precio = parseFloat(btnComprar.getAttribute('data-precio')) || 0;
        const imagen = btnComprar.getAttribute('data-imagen');

        const juegoExistente = carrito.find(item => item.id === idJuego);

        if (juegoExistente) {
            juegoExistente.cantidad++;
        } else {
            carrito.push({ id: idJuego, nombre: nombre, precio: precio, imagen: imagen, cantidad: 1 });
        }

        localStorage.setItem('carritoGamer', JSON.stringify(carrito));
        actualizarContadorCarrito();
        alert(`🎮 ¡${nombre} añadido al carrito!`);
    }
});

// Renderizado de la página del carrito
const contenedorItems = document.getElementById('contenedor-items-carrito');
if (contenedorItems) {
    const spanSubtotal = document.getElementById('resumen-subtotal');
    const spanIva = document.getElementById('resumen-iva');
    const spanTotal = document.getElementById('resumen-total');
    const btnVaciar = document.getElementById('btn-vaciar');

    function renderizarCarrito() {
        contenedorItems.innerHTML = '';
        let subtotal = 0;

        if (carrito.length === 0) {
            contenedorItems.innerHTML = `
                <div class="bg-slate-800 rounded-xl p-10 text-center border border-slate-700">
                    <i class='bx bx-cart text-6xl text-slate-500 mb-4'></i>
                    <h3 class="text-xl font-bold text-slate-300 mb-4">Tu carrito está vacío</h3>
                    <a href="catalogo_index.html" class="bg-[#e8b402] hover:bg-yellow-500 text-black font-bold py-2 px-6 rounded transition-colors inline-block">
                        Ir al catálogo
                    </a>
                </div>
            `;
        } else {
            carrito.forEach((juego) => {
                const precioSeguro = juego.precio || 0;
                const precioTotalJuego = precioSeguro * juego.cantidad;
                subtotal += precioTotalJuego;

                contenedorItems.innerHTML += `
                    <div class="bg-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4 border border-slate-700 transition hover:border-[#e8b402]">
                        <img src="${juego.imagen}" alt="${juego.nombre}" class="w-full lg:w-60 sm:w-32 h-36 object-cover rounded-lg shadow-md">
                        <div class="flex-grow text-center sm:text-left">
                            <h4 class="font-bold text-lg truncate max-w-xs">${juego.nombre}</h4>
                            <p class="text-slate-400 text-sm">Precio ud: ${precioSeguro.toFixed(2)}€</p>
                        </div>
                        <div class="flex items-center gap-3 bg-slate-900 rounded-lg p-1">
                            <button onclick="cambiarCantidad('${juego.id}', -1)" class="w-8 h-8 flex justify-center items-center bg-slate-700 hover:bg-slate-600 rounded text-white transition"><i class='bx bx-minus'></i></button>
                            <span class="font-bold w-4 text-center">${juego.cantidad}</span>
                            <button onclick="cambiarCantidad('${juego.id}', 1)" class="w-8 h-8 flex justify-center items-center bg-slate-700 hover:bg-slate-600 rounded text-white transition"><i class='bx bx-plus'></i></button>
                        </div>
                        <div class="text-xl font-bold text-[#e8b402] min-w-[80px] text-right">
                            ${precioTotalJuego.toFixed(2)}€
                        </div>
                        <button onclick="eliminarJuego('${juego.id}')" class="text-red-500 hover:text-red-400 p-2 text-2xl transition">
                            <i class='bx bx-trash'></i>
                        </button>
                    </div>
                `;
            });
        }

        const total = subtotal;
        const iva = subtotal - (subtotal / 1.21);
        const subtotalSinIva = subtotal / 1.21;

        spanSubtotal.textContent = subtotalSinIva.toFixed(2) + '€';
        spanIva.textContent = iva.toFixed(2) + '€';
        spanTotal.textContent = total.toFixed(2) + '€';
    }

    window.cambiarCantidad = function(id, cambio) {
        const juego = carrito.find(item => item.id === id);
        if (juego) {
            juego.cantidad += cambio;
            if (juego.cantidad <= 0) eliminarJuego(id);
            else guardarYRenderizar();
        }
    };

    window.eliminarJuego = function(id) {
        carrito = carrito.filter(item => item.id !== id);
        guardarYRenderizar();
    };

    if (btnVaciar) {
        btnVaciar.addEventListener('click', () => {
            if(confirm('¿Seguro que quieres vaciar todo el carrito?')) {
                carrito = [];
                guardarYRenderizar();
            }
        });
    }

    function guardarYRenderizar() {
        localStorage.setItem('carritoGamer', JSON.stringify(carrito));
        renderizarCarrito();
        actualizarContadorCarrito();
    }

    renderizarCarrito();
}

// llamamos a nuestra funcionnnnnnnnn
obtenerJuegos();