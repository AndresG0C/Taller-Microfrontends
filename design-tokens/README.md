# design-tokens

Sistema de diseño mínimo de SaborUPC. **Solo UI. Sin lógica de negocio.**

## Puerto
Se sirve en `http://localhost:8081/tokens.css`.

Ejemplo de cómo levantarlo:
    python -m http.server 8081

## Qué expone
Variables CSS bajo `:root` con nombres estables:

- Colores: `--color-primario`, `--color-acento`, `--color-exito`, `--color-peligro`, ...
- Tipografía: `--fuente-base`, `--tam-titulo`, `--tam-cuerpo`, ...
- Espaciado: `--espaciado-1` a `--espaciado-5`
- Radios: `--radio-sm`, `--radio-md`
- Sombras: `--sombra-toast`

## Contrato
El contrato de tokens está documentado en `../contenedor/CONTRATOS.md`
(sección “Recursos compartidos”).

Resumen:
- Añadir variables nuevas no rompe a los consumidores.
- Renombrar o eliminar una variable existente requiere subir versión.

## Quién lo consume
- contenedor
- mfe-catalogo
- mfe-carrito
- mfe-perfil
- mfe-pedidos

## Verificación
Abrir `http://localhost:8081/` para ver la paleta y los checks ✓/✗.