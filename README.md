# SaborUPC — Taller de Micro Frontends

Aplicación de pedidos de comida construida como **micro frontends** sin framework
de orquestación. Cada sección de la app (catálogo, carrito, perfil, pedidos) vive
en su propio origen (puerto), se despliega de forma independiente, puede usar una
tecnología distinta y se comunica con el resto **solo por eventos públicos**.

---

## 1. Arquitectura general

```
┌──────────────────────────────────────────────────────────────────┐
│  CONTENEDOR (:8080)                                              │
│  • Enruta por hash (#/catalogo, #/carrito, #/pedidos, #/perfil)  │
│  • Carga dinámicamente cada MFE desde su propio origen           │
│  • Aplica el contrato de montaje/desmontaje                      │
│  • Escucha eventos públicos y actualiza la UI                    │
│  • Resiliencia: botón "Reintentar" si un MFE no carga            │
│  • Observabilidad: performance.now() por MFE                     │
│  • Notificaciones: toasts al recibir pedido:estado               │
└──────────────────────────────────────────────────────────────────┘
        │                │              │              │
        ▼                ▼              ▼              ▼
  mfe-catalogo     mfe-carrito     mfe-perfil     mfe-pedidos
   (:8082)          (:8083)         (:8084)        (:8085)
   Vue 3            JS puro       Web Component      Lit
                                     nativo         (CDN)

                    design-tokens (:8081)
                    Sistema de diseño compartido (solo UI)
```

**Reglas de oro:**
- Ningún MFE llama directamente a otro por función. **Solo por eventos.**
- Ningún MFE modifica el DOM fuera de su propio contenedor.
- Ningún MFE importa CSS de otro MFE. Comparten solo `tokens.css`.

---

## 2. Puertos y responsabilidades

| Puerto | Carpeta | Tecnología | Rol |
|---|---|---|---|
| **8080** | `contenedor/` | JS puro | Shell que orquesta los MFEs |
| **8081** | `design-tokens/` | CSS | Sistema de diseño (solo UI) |
| **8082** | `mfe-catalogo/` | **Vue 3** (CDN) | Catálogo de platos |
| **8083** | `mfe-carrito/` | JS puro | Carrito de compras |
| **8084** | `mfe-perfil/` | **Web Component** nativo | Perfil del usuario |
| **8085** | `mfe-pedidos/` | **Lit** (CDN) | Seguimiento de pedidos |

**Heterogeneidad tecnológica:** catálogo (Vue), perfil (Web Component nativo)
y pedidos (Lit) usan tres tecnologías distintas a JS puro. Todas cargadas
desde CDN, sin paso de compilación.

---

## 3. Cómo ejecutarlo

### Requisitos

- **Node.js** (para `npx http-server`).
- **Python** (opcional, alternativa a `http-server`).
- Navegador moderno (Chrome, Edge, Firefox, Brave).

### ⚠ Importante: CORS en todos los MFEs

Como cada MFE vive en su **propio origen** (puerto distinto), el contenedor
los carga cross-origin. Para eso cada MFE debe servirse **con CORS habilitado**.
Por eso todos los comandos de abajo llevan `--cors` salvo el contenedor
(que sirve sus propios archivos y no lo necesita).

### Levantar los 6 servidores

Cada servidor va en **su propia terminal**, desde su carpeta:

```bash
# Terminal 1 — Contenedor (no necesita --cors)
cd contenedor
python -m http.server 8080 | npx http-server -p 8080 -c-1

# Terminal 2 — Design tokens
cd design-tokens
python -m http.server 8081 | npx http-server -p 8081 -c-1

# Terminal 3 — MFE Catálogo (Vue 3)
cd mfe-catalogo
npx http-server -p 8082 -c-1 --cors

# Terminal 4 — MFE Carrito (JS puro)
cd mfe-carrito
npx http-server -p 8083 -c-1 --cors

# Terminal 5 — MFE Perfil (Web Component)
cd mfe-perfil
npx http-server -p 8084 -c-1 --cors

# Terminal 6 — MFE Pedidos (Lit)
cd mfe-pedidos
npx http-server -p 8085 -c-1 --cors
```

### Alternativa con Python

Si prefieres Python, ten en cuenta que `python -m http.server` **no envía
cabeceras CORS por defecto**. Solo funciona para el contenedor:

```bash
# Contenedor
cd contenedor && python -m http.server 8080
```

Para los MFEs, usa `http-server --cors`.

### Abrir la aplicación

Una vez los 6 servidores estén arriba:

```
http://localhost:8080/
```

---

## 4. Contratos del proyecto

Todos los acuerdos públicos entre el contenedor y los MFEs están documentados
en detalle en [`contenedor/CONTRATOS.md`](contenedor/CONTRATOS.md).
Aquí va el resumen.

### 4.1 Contrato de montaje / desmontaje

Cada MFE se integra con el contenedor de una de estas dos formas:

**Tipo `funcion` (JS puro, Vue o Lit):**
```js
window.render<Nombre>(idContenedor)   // monta dentro del elemento con ese id
window.unmount<Nombre>(idContenedor)  // limpia lo que montó
```

**Tipo `webcomponent`:**
El MFE define una etiqueta personalizada. El contenedor solo la inserta:
```html
<mfe-perfil></mfe-perfil>
```

### 4.2 Contrato de eventos

Todos los eventos se emiten con `window.dispatchEvent(new CustomEvent(...))`
y se escuchan con `window.addEventListener(...)`.

| Evento | Publica | Escucha | `detail` | Versión |
|---|---|---|---|---|
| `carrito:agregar` | mfe-catalogo | mfe-carrito | `{ id, nombre, precio }` | 1 |
| `carrito:actualizado` | mfe-carrito | contenedor (badge) | `{ cantidad, subtotal, servicio, total, version }` | 2 |
| `usuario:cambio` | mfe-perfil | contenedor (saludo) | `{ nombre }` | 1 |
| `pedido:confirmado` | mfe-carrito | mfe-pedidos | `{ id, items, total, version }` | 1 |
| `pedido:estado` | mfe-pedidos | contenedor (toast) | `{ pedidoId, estado, version }` | 1 |

### 4.3 Estados de un pedido

```
Recibido → En preparación → En camino → Entregado
```

Cada pedido avanza automáticamente cada ~3 s vía `setInterval`.
Cada cambio publica `pedido:estado` y el contenedor muestra un toast.

### 4.4 Compatibilidad hacia atrás

Regla: **los cambios se hacen añadiendo campos, nunca quitando ni renombrando.**
Los consumidores leen solo los campos que conocen e ignoran el resto.

Ejemplo vigente: `carrito:actualizado` pasó de v1 `{ cantidad, total }`
a v2 `{ cantidad, subtotal, servicio, total, version }`.
El contenedor **no se tocó**: sigue leyendo solo `cantidad` y `total`.

### 4.5 Contrato de recursos compartidos

- **`tokens.css`** servido en `http://localhost:8081/tokens.css`.
- No es un MFE: no se monta ni publica eventos.
- Expone variables CSS con nombres estables (`--color-primario`,
  `--espaciado-3`, `--radio-md`, etc.).
- Añadir variables nuevas no rompe a los consumidores.

---

## 5. Cómo probar cada pieza

### 5.1 Modo independiente (sin contenedor)

Cada MFE se puede probar por sí solo, abriendo su raíz:

| MFE | URL | Qué muestra |
|---|---|---|
| Catálogo | `http://localhost:8082/` | Catálogo + lista de eventos publicados |
| Carrito | `http://localhost:8083/` | Botones para simular `carrito:agregar` |
| Perfil | `http://localhost:8084/` | Formulario + prueba de aislamiento Shadow DOM |
| Pedidos | `http://localhost:8085/` | Botón "Simular pedido confirmado" |

### 5.2 Pruebas de contrato

Cada MFE incluye una página `contrato.html` que verifica automáticamente
(sin el contenedor) que se exponen las funciones o etiqueta esperadas,
que el montaje genera contenido y que los eventos publicados tienen
la estructura acordada. Muestra ✓/✗ en pantalla y usa `console.assert`.

| MFE | URL de la prueba |
|---|---|
| Catálogo | `http://localhost:8082/contrato.html` |
| Carrito | `http://localhost:8083/contrato.html` |
| Perfil | `http://localhost:8084/contrato.html` |
| Pedidos | `http://localhost:8085/contrato.html` |

Todas las pruebas deben mostrarse en **verde (✓)**.

### 5.3 Prueba integrada

Con los 6 servidores levantados, abre `http://localhost:8080/` y prueba:

1. Navegar por las 4 rutas: `#/catalogo`, `#/carrito`, `#/pedidos`, `#/perfil`.
2. Catálogo → agregar platos → carrito → confirmar pedido → pedidos.
3. Ver los **toasts** apareciendo cada vez que un pedido cambia de estado.
4. **Resiliencia:** apagar un MFE con `Ctrl+C` → aparece mensaje + botón "Reintentar".
5. **Observabilidad:** abrir la consola del navegador y ver los tiempos
   `[mfe] <url> cargó en X ms` y `[mfe] <Nombre> montado en X ms`.

---

## 6. Resiliencia y observabilidad

- **CORS explícito:** cada MFE vive en su origen. El contenedor carga
  cross-origin con `--cors`. Esto es lo mismo que pasaría con cada MFE
  desplegado en un dominio distinto en producción.
- **Botón "Reintentar":** si un MFE no carga, el contenedor muestra un mensaje
  amigable y un botón para reintentar la carga sin recargar la página.
- **`performance.now()`:** el contenedor mide y loguea el tiempo de carga
  y de montaje de cada MFE en la consola.
- **Toasts:** el contenedor muestra notificaciones breves al recibir
  `pedido:estado`.

---

## 7. Estructura de carpetas

```
taller-microfrontends/
├── README.md                  ← este archivo
├── contenedor/                → :8080
│   ├── index.html
│   ├── contenedor.css
│   ├── contenedor.js
│   ├── registro.js
│   ├── CONTRATOS.md
│   └── README.md
├── design-tokens/             → :8081
│   ├── tokens.css
│   ├── index.html
│   └── README.md
├── mfe-catalogo/              → :8082
│   ├── catalogo.js
│   ├── index.html
│   ├── contrato.html
│   └── README.md
├── mfe-carrito/               → :8083
│   ├── carrito.js
│   ├── index.html
│   ├── contrato.html
│   └── README.md
├── mfe-perfil/                → :8084
│   ├── perfil.js
│   ├── index.html
│   ├── contrato.html
│   └── README.md
└── mfe-pedidos/               → :8085
    ├── pedidos.js
    ├── index.html
    ├── contrato.html
    └── README.md
```

Cada carpeta tiene su propio `README.md` con detalles específicos.

---

## 8. Cómo desplegar un MFE de forma independiente

Cada MFE es **estático**: son archivos HTML, CSS y JS que se sirven tal cual.
Se puede desplegar en cualquier hosting estático (GitHub Pages, Netlify, Vercel).

### Ejemplo: publicar `mfe-catalogo` en GitHub Pages

1. Crear un repositorio público con el contenido de `mfe-catalogo/`.
2. Activar GitHub Pages en *Settings → Pages* (rama `main`, carpeta `/`).
3. GitHub Pages servirá el MFE en algo como:
   `https://<usuario>.github.io/<repo>/catalogo.js`
4. En `contenedor/registro.js`, cambiar la URL de `catalogo.js`:
   ```js
   '/catalogo': {
     nombre: 'Catalogo',
     url: 'https://<usuario>.github.io/<repo>/catalogo.js',
     tipo: 'funcion'
   }
   ```
5. Recargar el contenedor: **sigue funcionando sin reiniciar los demás servidores**.
   Eso demuestra **despliegue independiente**.

### Demostración en video (resumen)

- Levantar los 6 servidores locales.
- Navegar las 4 rutas.
- Flujo completo: catálogo → carrito → confirmar → pedidos con toasts.
- Resiliencia: apagar un MFE → ver "Reintentar".
- Observabilidad: ver tiempos en consola.
- Contratos: abrir los 4 `contrato.html` en verde.
- Despliegue en caliente: publicar nueva versión de un MFE y recargar.

---

## 9. Tecnologías por MFE (resumen)

| MFE | Tecnología | Motivo |
|---|---|---|
| Contenedor | JS puro | Shell: solo orquestación, sin UI compleja |
| Catálogo | **Vue 3** (CDN) | Demostrar framework reactivo sin build |
| Carrito | JS puro | Estado global sencillo, sin necesidad de framework |
| Perfil | **Web Component** nativo | Aislamiento por Shadow DOM sin dependencias |
| Pedidos | **Lit** (CDN) | Web Component moderno con reactividad |

**Todos desde CDN. Ninguno requiere `npm install` ni build.**

---

## 10. Referencias

- `contenedor/CONTRATOS.md` — Contratos completos y versionado.
- `contenedor/registro.js` — Manifiesto de MFEs (ruta → URL → tipo).
- `design-tokens/README.md` — Sistema de diseño.
- Cada `mfe-*/README.md` — Detalles de cada micro frontend.