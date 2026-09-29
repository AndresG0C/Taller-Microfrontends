# mfe-catalogo

Micro frontend del catálogo de platos. Publica el evento `carrito:agregar`
cuando el usuario agrega un plato.

## Puerto
`http://localhost:8082`

Ejemplo:
    python -m http.server 8082

## Tecnología
Vue 3 desde CDN (unpkg, `vue.esm-browser.prod.js`). Sin build.

## Contrato de montaje / desmontaje
- `window.renderCatalogo(idContenedor)`
- `window.unmountCatalogo(idContenedor)`

## Eventos
- **Publica:** `carrito:agregar`
  - `detail`: `{ id, nombre, precio }`
  - Versión: 1
- **Escucha:** ninguno.

## Funcionalidad
- Lista de platos con categoría y precio.
- Búsqueda por nombre.
- Filtro por categoría.
- Botón "Agregar al carrito" → dispara `carrito:agregar`.

## Modo independiente
Abrir `http://localhost:8082/` para ver el catálogo sin el contenedor.
Los eventos que publica se muestran en una lista debajo.

## Prueba de contrato
Abrir `http://localhost:8082/contrato.html`.
Verifica automáticamente funciones expuestas, montaje y estructura del evento.

## Versión visible
`VERSION = '2.0.0'` (mostrado en pantalla bajo el título).