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

/*el slideeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee*/
const products = [
    { name: "Kingdom Hearts Collection I-III Nintendo Switch", price: "79,99€", image: "https://media.game.es/COVERV2/3D_L/263/263157.png", rating: 4.8 },
    { name: "Control Resonant PS5 <br>", price: "59,99€ <br>", image: "https://media.game.es/COVERV2/3D_L/262/262631.png", rating: 4.5 },
    { name: "Kingdom Hearts Collection I-III PS5", price: "79,99€", image: "https://media.game.es/COVERV2/3D_L/263/263156.png", rating: 4.7 },
    { name: "Dragon's Dogma 2 Dark Arisen Nintendo Switch", price: "49,99€", image: "https://media.game.es/COVERV2/3D_L/264/264095.png", rating: 4.9 },
    { name: "The Crew Motorfest Nintendo Switch 2", price: "41,99€", image: "https://media.game.es/COVERV2/3D_L/264/264861.png", rating: 4.6 }
];

const carousel = document.getElementById('carousel');
let index = 0;

function renderCarousel(){
    carousel.innerHTML = products.map(product =>`
           <div class="product-card flex-none w-72 bg-white rounded-xl overflow-hidden shadow-lg">
              <div class="relative">
                <img src="${product.image}" alt="" class="w-full h-80 object-cover">
                <div class="absolute top-2 right-2 flex gap-2">
                  <button class="icon-btn bg-white text-gray-900 rounded-full py-2 px-3 shadow-lg transition-transform">
                    <i class="bx bx-heart text-xl"></i>
                  </button>
                  <button class="icon-btn bg-white text-gray-900 rounded-full py-2 px-3 shadow-lg transition-transform">
                    <i class="bx bx-cart-add text-xl"></i>
                  </button>
                </div>
              </div>
              <div class="p-4 bg-azulGamer">
                <a href="#" class="text-lg  text-white">${product.name}</a>
                <span class="text-indigo-400 font-bold">${product.price}</span>
                <div class="flex items-center mt-2 text-yellow-400">
                  ${'★'.repeat(Math.floor(product.rating)) + (product.rating % 1 >= 0.5 ? '☆' : '')}
                  <span class="text-gray-400 text-xs ml-2">(${product.rating.toFixed(1)})</span>
                </div>
              </div>
            </div>
        `).join('');
}

function slide(direction){
    const cardWidth = 488;
    index += direction;
    if(index >= products.length){
        index =0;
    }else if(index < 0){
        index = products.length - 1;
    }
    carousel.scrollTo({left: index * cardWidth, behavior: 'smooth'});
}

document.getElementById('prev-btn').addEventListener('click', ()=> slide(-1));
document.getElementById('next-btn').addEventListener('click', ()=> slide(1));
/*para que haga auto scroll pero de momento lo oculto*/
/*setInterval(()=> slide(1), 3000)*/ //Auto scroll every 3 seconds

renderCarousel();