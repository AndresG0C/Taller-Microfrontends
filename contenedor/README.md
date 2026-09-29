# contenedor

Shell de SaborUPC. Orquesta el montaje/desmontaje de los micro frontends,
enruta por hash, muestra notificaciones y aplica resiliencia.

## Puerto
`http://localhost:8080`

Ejemplo:
    python -m http.server 8080

## Tecnología
JavaScript puro. Sin framework.

## Responsabilidades
- Enrutar por hash (`#/catalogo`, `#/carrito`, `#/pedidos`, `#/perfil`).
- Cargar dinámicamente el bundle de cada MFE desde su propio origen.
- Aplicar el contrato de montaje/desmontaje (`renderX`/`unmountX` o etiqueta).
- Escuchar eventos públicos y actualizar la UI:
  - `carrito:actualizado` → actualiza el badge del nav.
  - `usuario:cambio` → actualiza el saludo.
  - `pedido:estado` → muestra un toast breve.
- Resiliencia: si un MFE no carga, muestra mensaje amigable + botón "Reintentar".
- Observabilidad: mide con `performance.now()` el tiempo de carga y montaje
  de cada MFE, y lo registra en consola con `[mfe] ...`.
- Sistema de diseño: enlaza `tokens.css` de `design-tokens` (`:8081`).

## Archivos
- `index.html` — estructura del shell.
- `contenedor.css` — estilos del shell + toasts + botón de reintento.
- `contenedor.js` — lógica: routing, montaje, resiliencia, notificaciones, métricas.
- `registro.js` — manifiesto de MFEs (ruta → URL → tipo → precarga).
- `CONTRATOS.md` — acuerdos públicos con los MFEs.

## Verificación
- Abrir `http://localhost:8080/`.
- Con todos los MFEs levantados, todo debe funcionar.
- Con un MFE apagado, aparece el mensaje de error + botón "Reintentar".
- En consola, ver los tiempos `[mfe] <url> cargó en X ms` y
  `[mfe] <Nombre> montado en X ms`.