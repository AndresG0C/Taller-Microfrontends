# CONTRATOS — SaborUPC

Documento de acuerdos públicos entre el contenedor y los micro frontends.
Nada de aquí puede cambiar sin subir la versión correspondiente y avisar
a los consumidores.

- **Versión del documento:** 1
- **Última actualización:** 28/09/2026
- **Convención de nombres:** los eventos usan el formato `dominio:accion`
  (por ejemplo `carrito:agregar`, `pedido:estado`).

---

## 1. Contrato de montaje / desmontaje

El contenedor integra cada micro frontend de una de estas dos formas.
Estas firmas son **públicas y estables**.

### 1.1 Tipo `funcion` (JS puro)

El MFE expone dos funciones globales con nombres fijos:

    window.render<Nombre>(idContenedor)   // monta dentro del elemento con ese id
    window.unmount<Nombre>(idContenedor)  // limpia todo lo que montó

Ejemplos vigentes:
- `window.renderCatalogo(id)` / `window.unmountCatalogo(id)`
- `window.renderCarrito(id)`  / `window.unmountCarrito(id)`
- `window.renderPedidos(id)`  / `window.unmountPedidos(id)`

### 1.2 Tipo `webcomponent`

El MFE define una etiqueta personalizada. El contenedor solo la inserta
en el DOM; el navegador dispara `connectedCallback` / `disconnectedCallback`.

Ejemplo vigente:
- `<mfe-perfil></mfe-perfil>`

---

## 2. Contrato de eventos

Todos los eventos se emiten con `window.dispatchEvent(new CustomEvent(...))`
y se escuchan con `window.addEventListener(...)`. Ningún MFE llama
directamente a otro: la comunicación es siempre por eventos.

### 2.1 Tabla de eventos

| Evento | Publica | Escucha | `detail` | Versión |
|---|---|---|---|---|
| `carrito:agregar` | mfe-catalogo | mfe-carrito | `{ id, nombre, precio }` | 1 |
| `carrito:actualizado` | mfe-carrito | contenedor (badge) | `{ cantidad, subtotal, servicio, total, version }` | 2 |
| `usuario:cambio` | mfe-perfil | contenedor (saludo) | `{ nombre }` | 1 |
| `pedido:confirmado` | mfe-carrito | mfe-pedidos | `{ id, items, total, version }` | 1 |
| `pedido:estado` | mfe-pedidos | contenedor (toast) | `{ pedidoId, estado, version }` | 1 |

### 2.2 Detalle por evento

#### `carrito:agregar`
- **Publica:** mfe-catalogo, cada vez que el usuario agrega un plato.
- **Escucha:** mfe-carrito (precargado, escucha aunque no esté visible).
- **`detail`:**
  - `id` (number) — identificador del plato.
  - `nombre` (string) — nombre visible del plato.
  - `precio` (number) — precio unitario en pesos.
- **Versión:** 1.

#### `carrito:actualizado`
- **Publica:** mfe-carrito, cada vez que cambia el contenido del carrito.
- **Escucha:** contenedor, para actualizar el badge del nav.
- **`detail`:**
  - `cantidad` (number) — total de ítems.
  - `subtotal` (number) — suma de `precio × cantidad` sin recargos (añadido en v2).
  - `servicio` (number) — recargo por servicio (10 % del subtotal) (añadido en v2).
  - `total` (number) — `subtotal + servicio`.
  - `version` (number) — `2` (añadido en v2).
- **Versión:** 2.
- **Compatibilidad hacia atrás:** ver sección 3.

#### `usuario:cambio`
- **Publica:** mfe-perfil, al guardar el formulario.
- **Escucha:** contenedor, para actualizar el saludo.
- **`detail`:**
  - `nombre` (string) — nombre del usuario.
- **Versión:** 1.

#### `pedido:confirmado`
- **Publica:** mfe-carrito, al pulsar “Confirmar pedido”.
- **Escucha:** mfe-pedidos.
- **`detail`:**
  - `id` (number) — identificador del pedido (timestamp).
  - `items` (array) — copia de los ítems del carrito (`{ id, nombre, precio, cantidad }`).
  - `total` (number) — monto total en pesos.
  - `version` (number) — `1`.
- **Versión:** 1.

#### `pedido:estado`
- **Publica:** mfe-pedidos, cada vez que un pedido cambia de estado.
- **Escucha:** contenedor, para mostrar un toast breve.
- **`detail`:**
  - `pedidoId` (number) — id del pedido que cambió.
  - `estado` (string) — uno de: `'Recibido'`, `'En preparación'`, `'En camino'`, `'Entregado'`.
  - `version` (number) — `1`.
- **Versión:** 1.

---

## 3. Compatibilidad hacia atrás

Regla: **los cambios se hacen añadiendo campos, nunca quitando ni renombrando.**
Los consumidores deben leer solo los campos que conocen e ignorar el resto.

### Ejemplo vigente: `carrito:actualizado`

- **v1:** `{ cantidad, total }`
- **v2:** `{ cantidad, subtotal, servicio, total, version }`

El **contenedor no se tocó**. Su handler sigue leyendo únicamente
`e.detail.cantidad` y `e.detail.total`. Los campos nuevos
(`subtotal`, `servicio`, `version`) son ignorados por consumidores
antiguos sin romper nada.

Si en el futuro se necesitara renombrar o eliminar un campo existente,
se subiría a `v3` y se coordinaría con todos los consumidores.

---

## 4. Contrato de recursos compartidos

### 4.1 `tokens.css` (design-tokens)

- **Origen:** `http://localhost:8081/tokens.css`
- **Tipo:** hoja de estilos. **No es un micro frontend**: no se monta,
  no se desmonta, no publica eventos. Por eso no lleva `contrato.html`.
- **Consumidores:** contenedor, mfe-catalogo, mfe-carrito, mfe-perfil, mfe-pedidos.
- **Variables expuestas (nombres estables):**
  - Colores: `--color-primario`, `--color-primario-claro`, `--color-acento`,
    `--color-exito`, `--color-peligro`, `--color-fondo`, `--color-superficie`,
    `--color-borde`, `--color-texto`, `--color-texto-suave`
  - Tipografía: `--fuente-base`, `--tam-titulo`, `--tam-subtitulo`,
    `--tam-cuerpo`, `--tam-pequeno`
  - Espaciado: `--espaciado-1` … `--espaciado-5`
  - Radios: `--radio-sm`, `--radio-md`
  - Sombras: `--sombra-toast`
- **Versión:** 1.
- **Garantía:**
  - Añadir variables nuevas no rompe a los consumidores.
  - Renombrar o eliminar una variable existente requiere subir versión
    y actualizar a todos los consumidores.

---

## 5. Reglas generales

1. Ningún MFE llama directamente a otro por función. Solo por eventos.
2. Ningún MFE modifica el DOM fuera de su propio contenedor.
3. Ningún MFE importa CSS de otro MFE. Comparten solo `tokens.css`.
4. Todo evento nuevo debe registrarse en este documento **antes** de implementarse.
5. Todo cambio incompatible exige subir la versión del evento y avisar a los consumidores.