<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>design-tokens · SaborUPC</title>
  <link rel="stylesheet" href="tokens.css">
  <style>
    body {
      font-family: var(--fuente-base);
      background: var(--color-fondo);
      color: var(--color-texto);
      margin: 0;
      padding: var(--espaciado-5);
    }
    h1 { color: var(--color-primario); margin: 0 0 var(--espaciado-2); }
    h2 { color: var(--color-primario); margin-top: var(--espaciado-4); }
    .nota { color: var(--color-texto-suave); font-size: var(--tam-pequeno); margin-bottom: var(--espaciado-4); }
    .muestras { display: flex; gap: var(--espaciado-3); flex-wrap: wrap; }
    .muestra {
      background: var(--color-superficie);
      border: 1px solid var(--color-borde);
      border-radius: var(--radio-md);
      padding: var(--espaciado-3);
      min-width: 180px;
    }
    .caja-color {
      height: 60px;
      border-radius: var(--radio-sm);
      margin-bottom: var(--espaciado-2);
      border: 1px solid var(--color-borde);
    }
    .check {
      font-family: monospace;
      padding: var(--espaciado-3);
      background: var(--color-superficie);
      border: 1px solid var(--color-borde);
      border-radius: var(--radio-md);
      margin-top: var(--espaciado-4);
    }
    .ok  { color: var(--color-exito); }
    .mal { color: var(--color-peligro); }
    code { background: #eef2f6; padding: 1px 4px; border-radius: var(--radio-sm); }
  </style>
</head>
<body>
  <h1>design-tokens v1</h1>
  <p class="nota">
    Sistema de diseño mínimo servido desde su propio origen.
    Solo UI. Sin lógica de negocio.
  </p>

  <h2>Colores</h2>
  <div class="muestras" id="colores"></div>

  <h2>Verificación del contrato de tokens (✓ / ✗)</h2>
  <p class="nota">
    Estos checks comprueban que las variables esperadas existen.
    No es un <code>contrato.html</code> de MFE: los tokens no se montan ni publican eventos.
  </p>
  <div class="check" id="checks"></div>

  <script>
    // 1. Paleta visual
    const COLORES = [
      '--color-primario', '--color-primario-claro', '--color-acento',
      '--color-exito', '--color-peligro', '--color-fondo',
      '--color-superficie', '--color-borde', '--color-texto', '--color-texto-suave'
    ];
    const cont = document.getElementById('colores');
    COLORES.forEach(function (nombre) {
      const valor = getComputedStyle(document.documentElement).getPropertyValue(nombre).trim();
      const div = document.createElement('div');
      div.className = 'muestra';
      div.innerHTML =
        '<div class="caja-color" style="background:' + valor + '"></div>' +
        '<code>' + nombre + '</code><br>' +
        '<small>' + valor + '</small>';
      cont.appendChild(div);
    });

    // 2. Verificación del contrato de tokens
    const ESPERADAS = [
      '--color-primario', '--color-acento', '--color-exito', '--color-peligro',
      '--fuente-base', '--espaciado-1', '--espaciado-2', '--espaciado-3', '--espaciado-4',
      '--radio-sm', '--radio-md'
    ];
    const out = document.getElementById('checks');
    ESPERADAS.forEach(function (nombre) {
      const valor = getComputedStyle(document.documentElement).getPropertyValue(nombre).trim();
      const ok = valor !== '';
      console.assert(ok, 'Falta la variable ' + nombre);
      const p = document.createElement('div');
      p.className = ok ? 'ok' : 'mal';
      p.textContent = (ok ? '✓ ' : '✗ ') + nombre + (ok ? ' → ' + valor : ' (no definida)');
      out.appendChild(p);
    });
  </script>
</body>
</html>