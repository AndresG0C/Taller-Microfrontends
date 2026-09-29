// Micro frontend: CATÁLOGO  (equipo "Descubrimiento")
// Tecnología: Vue 3 desde CDN (unpkg), sin build.
// Contrato: window.renderCatalogo(idContenedor) / window.unmountCatalogo(idContenedor)
// Publica:  'carrito:agregar'  { id, nombre, precio }
import * as Vue from 'https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js';

const VERSION = '2.0.0';

const PLATOS = [
  { id: 1, nombre: 'Chivo guisado',         precio: 28000, categoria: 'Plato fuerte' },
  { id: 2, nombre: 'Arroz de payaso',       precio: 22000, categoria: 'Plato fuerte' },
  { id: 3, nombre: 'Sancocho de gallina',   precio: 25000, categoria: 'Plato fuerte' },
  { id: 4, nombre: 'Arepa de huevo',        precio: 6000,  categoria: 'Entrada' },
  { id: 5, nombre: 'Carimañola',            precio: 4500,  categoria: 'Entrada' },
  { id: 6, nombre: 'Jugo de corozo',        precio: 5000,  categoria: 'Bebida' },
  { id: 7, nombre: 'Limonada de panela',    precio: 4000,  categoria: 'Bebida' },
  { id: 8, nombre: 'Dulce de leche cortada', precio: 7000, categoria: 'Postre' }
];

const CATEGORIAS = ['Todas', 'Plato fuerte', 'Entrada', 'Bebida', 'Postre'];

const pesos = new Intl.NumberFormat('es-CO', {
  style: 'currency', currency: 'COP', maximumFractionDigits: 0
});

// Estado del componente Vue (creado una vez, reutilizado en cada mount)
let app = null;

const Catalogo = {
  data() {
    return {
      version: VERSION,
      filtro: '',
      categoria: 'Todas',
      categorias: CATEGORIAS,
      platos: PLATOS
    };
  },
  computed: {
    platosFiltrados() {
      const q = this.filtro.trim().toLowerCase();
      return this.platos.filter(p => {
        const coincideNombre = p.nombre.toLowerCase().includes(q);
        const coincideCategoria = this.categoria === 'Todas' || p.categoria === this.categoria;
        return coincideNombre && coincideCategoria;
      });
    }
  },
  methods: {
    agregar(plato) {
      window.dispatchEvent(new CustomEvent('carrito:agregar', {
        detail: { id: plato.id, nombre: plato.nombre, precio: plato.precio }
      }));
    },
    formatPrecio(v) {
      return pesos.format(v);
    }
  },
  template: `
    <div class="cat-contenedor">
      <h2 class="cat-titulo">Catálogo de platos</h2>
      <span class="cat-version">mfe-catalogo v{{ version }} · Vue 3 desde CDN</span>

      <div class="cat-controles">
        <input
          class="cat-buscar"
          type="search"
          placeholder="Buscar un plato..."
          v-model="filtro">

        <div class="cat-categorias">
          <button
            v-for="c in categorias"
            :key="c"
            :class="['cat-chip', { 'cat-chip--activo': c === categoria }]"
            @click="categoria = c">
            {{ c }}
          </button>
        </div>
      </div>

      <div v-if="platosFiltrados.length === 0" class="cat-vacio">
        No hay platos que coincidan.
      </div>

      <div v-else class="cat-grilla">
        <article v-for="p in platosFiltrados" :key="p.id" class="cat-tarjeta">
          <div class="cat-categoria">{{ p.categoria }}</div>
          <div class="cat-nombre">{{ p.nombre }}</div>
          <div class="cat-precio">{{ formatPrecio(p.precio) }}</div>
          <button class="cat-boton" @click="agregar(p)">Agregar al carrito</button>
        </article>
      </div>
    </div>
  `
};

// ------------------------------------------------------------------
// Estilos propios (prefijo cat-)
// ------------------------------------------------------------------
const CSS = `
  @import url('http://localhost:8081/tokens.css');

  .cat-contenedor { font-family: var(--fuente-base, Arial, sans-serif); }
  .cat-titulo { color: var(--color-primario, #0b4f8a); margin: 0 0 4px; }
  .cat-version { font-size: 12px; color: #888; }

  .cat-controles { margin: 16px 0; }
  .cat-buscar {
    width: 100%;
    padding: 10px;
    margin-bottom: 12px;
    border: 1px solid #bbb;
    border-radius: 4px;
    font-size: 15px;
    box-sizing: border-box;
  }
  .cat-categorias { display: flex; gap: 6px; flex-wrap: wrap; }
  .cat-chip {
    background: #fff;
    border: 1px solid #ccd4dd;
    border-radius: 16px;
    padding: 5px 12px;
    cursor: pointer;
    font-size: 13px;
    color: #333;
  }
  .cat-chip:hover { background: #f0f3f6; }
  .cat-chip--activo {
    background: var(--color-primario, #0b4f8a);
    color: #fff;
    border-color: var(--color-primario, #0b4f8a);
  }

  .cat-grilla {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
    gap: 16px;
  }
  .cat-tarjeta {
    background: #fff;
    border: 1px solid var(--color-borde, #dde3ea);
    border-radius: 6px;
    padding: 16px;
  }
  .cat-categoria {
    font-size: 12px;
    color: var(--color-exito, #3e9f3a);
    text-transform: uppercase;
  }
  .cat-nombre { font-size: 17px; margin: 6px 0; }
  .cat-precio { font-weight: bold; margin-bottom: 12px; }
  .cat-boton {
    background: var(--color-exito, #3e9f3a);
    color: #fff;
    border: 0;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
  }
  .cat-boton:hover { background: #1b7a3e; }
  .cat-vacio { color: #777; }
`;

function asegurarEstilos() {
  if (document.getElementById('cat-estilos')) return;
  const s = document.createElement('style');
  s.id = 'cat-estilos';
  s.textContent = CSS;
  document.head.appendChild(s);
}

// ------------------------------------------------------------------
// Contrato de montaje / desmontaje
// ------------------------------------------------------------------
window.renderCatalogo = function (idContenedor) {
  asegurarEstilos();
  app = Vue.createApp(Catalogo);
  app.mount('#' + idContenedor);
};

window.unmountCatalogo = function (idContenedor) {
  if (app) {
    app.unmount();
    app = null;
  }
  const raiz = document.getElementById(idContenedor);
  if (raiz) raiz.innerHTML = '';
};