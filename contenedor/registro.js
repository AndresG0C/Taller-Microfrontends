// Registro de micro frontends: qué ruta atiende cada uno, dónde está
// desplegado y cómo se monta. Es el ÚNICO lugar donde el contenedor
// "conoce" a los micro frontends.
window.REGISTRO_MFE = {
  '/catalogo': {
    nombre: 'Catalogo',
    url: 'http://localhost:8082/catalogo.js',
    tipo: 'funcion'            // expone window.renderCatalogo / window.unmountCatalogo
  },
  '/carrito': {
    nombre: 'Carrito',
    url: 'http://localhost:8083/carrito.js',
    tipo: 'funcion',
    precargar: true            // debe escuchar eventos aunque no esté en pantalla
  },
  '/perfil': {
    nombre: 'Perfil',
    url: 'http://localhost:8084/perfil.js',
    tipo: 'webcomponent',      // define la etiqueta <mfe-perfil>
    etiqueta: 'mfe-perfil'
  },
  '/pedidos': {
    nombre: 'Pedidos',
    url: 'http://localhost:8085/pedidos.js',
    tipo: 'funcion',           // expone window.renderPedidos / window.unmountPedidos
    precargar: true           // no necesita escuchar hasta que se navegue a #/pedidos
  }
};