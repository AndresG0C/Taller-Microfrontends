# mfe-perfil

Micro frontend del perfil del usuario, implementado como Web Component
con Shadow DOM.

## Puerto
`http://localhost:8084`

Ejemplo:
    python -m http.server 8084

## Tecnología
Web Component nativo (Custom Element + Shadow DOM).

## Contrato de montaje / desmontaje
- Define la etiqueta `<mfe-perfil>`.
- El navegador dispara `connectedCallback` / `disconnectedCallback`.

## Eventos
- **Publica:** `usuario:cambio`
  - `detail`: `{ nombre }`
  - Versión: 1.
- **Escucha:** ninguno.

## Aislamiento
Shadow DOM: el CSS interno no afecta ni es afectado por el exterior.
El `index.html` incluye una regla `h2 { color: red }` a propósito
para demostrar visualmente el aislamiento.

## Consumo de tokens
Dentro del Shadow DOM se enlaza `tokens.css` (`:8081`) y se usan
variables como `--color-exito` con fallback.

## Modo independiente
Abrir `http://localhost:8084/`.
El `<h2>` de fuera se ve rojo; el `<h2>` del componente NO.

## Prueba de contrato
Abrir `http://localhost:8084/contrato.html`.
Verifica la etiqueta, el Shadow DOM con `<form>` y la estructura del evento.

## Versión visible
`VERSION = '1.1.0'` (mostrado en pantalla dentro del componente).