(function () {
  const RUTA_INICIAL = '/catalogo';
  const ID_RAIZ = 'app-root';
  const ID_TOASTS = 'app-toasts';
  const raiz = document.getElementById(ID_RAIZ);
  const zonaToasts = document.getElementById(ID_TOASTS);
  const scripts = {};      // url -> { promesa, nodo } (cada script se descarga una sola vez)
  let montado = null;      // entrada del registro montada en este momento
  let turno = 0;           // evita condiciones de carrera si el usuario navega rápido

  // ------------------------------------------------------------------
  // 1. Descarga dinámica del bundle de un micro frontend (con medición)
  // ------------------------------------------------------------------
  function cargarScript(url) {
    if (!scripts[url]) {
      const t0 = performance.now();
      const promesa = new Promise(function (resolve, reject) {
        const s = document.createElement('script');
        s.type = 'module';
        s.src = url + '?v=' + Date.now(); // sin caché: vemos cada "despliegue" al recargar
        s.onload = function () {
          const ms = (performance.now() - t0).toFixed(1);
          console.info('[mfe] ' + url + ' cargó en ' + ms + ' ms');
          resolve();
        };
        s.onerror = function () {
          // Limpiamos la entrada para permitir Reintentar
          delete scripts[url];
          if (s.parentNode) s.parentNode.removeChild(s);
          reject(new Error('No se pudo cargar ' + url));
        };
        document.head.appendChild(s);
      });
      scripts[url] = { promesa: promesa, nodo: null };
    }
    return scripts[url].promesa;
  }

  // ------------------------------------------------------------------
  // 2. Contrato de montaje / desmontaje
  // ------------------------------------------------------------------
  function montar(entrada) {
    const t0 = performance.now();
    if (entrada.tipo === 'funcion') {
      window['render' + entrada.nombre](ID_RAIZ);
    } else if (entrada.tipo === 'webcomponent') {
      raiz.appendChild(document.createElement(entrada.etiqueta));
    }
    const ms = (performance.now() - t0).toFixed(1);
    console.info('[mfe] ' + entrada.nombre + ' montado en ' + ms + ' ms');
    montado = entrada;
  }

  function desmontarActual() {
    if (montado && montado.tipo === 'funcion') {
      const desmontar = window['unmount' + montado.nombre];
      if (typeof desmontar === 'function') desmontar(ID_RAIZ);
    }
    raiz.innerHTML = '';
    montado = null;
  }

  // ------------------------------------------------------------------
  // 3. Notificaciones breves (toasts)
  // ------------------------------------------------------------------
  function notificar(texto, tipo) {
    if (!zonaToasts) return;
    const toast = document.createElement('div');
    toast.className = 'app-toast app-toast--' + (tipo || 'info');
    toast.textContent = texto;
    zonaToasts.appendChild(toast);

    // Siguiente frame: añadimos la clase visible para que se anime
    requestAnimationFrame(function () {
      toast.classList.add('app-toast--visible');
    });

    // A los 2.5 s lo ocultamos y a los 250 ms más lo eliminamos
    setTimeout(function () {
      toast.classList.remove('app-toast--visible');
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 2500);
  }

  // ------------------------------------------------------------------
  // 4. Enrutamiento
  // ------------------------------------------------------------------
  async function navegar() {
    const miTurno = ++turno;
    const ruta = location.hash.replace('#', '') || RUTA_INICIAL;
    const entrada = window.REGISTRO_MFE[ruta];
    marcarEnlaceActivo(ruta);
    desmontarActual();

    if (!entrada) {
      raiz.innerHTML = '<p class="app-aviso">Página no encontrada.</p>';
      return;
    }
    raiz.innerHTML = '<p class="app-aviso">Cargando ' + entrada.nombre + '…</p>';
    try {
      await cargarScript(entrada.url);
      if (miTurno !== turno) return;   // el usuario ya navegó a otra ruta
      raiz.innerHTML = '';
      montar(entrada);
    } catch (e) {
      if (miTurno !== turno) return;
      mostrarError(entrada, e);
    }
  }

  function mostrarError(entrada, e) {
    console.error(e);
    raiz.innerHTML =
      '<div class="app-error">' +
        '<p>El micro frontend <b>' + entrada.nombre + '</b> no está disponible en este momento. ' +
        'El resto de la aplicación sigue funcionando.</p>' +
        '<button class="app-reintentar">Reintentar</button>' +
      '</div>';
    const boton = raiz.querySelector('.app-reintentar');
    boton.addEventListener('click', function () {
      // Limpiamos el cache del script para forzar una descarga nueva
      delete scripts[entrada.url];
      navegar();
    });
  }

  function marcarEnlaceActivo(ruta) {
    document.querySelectorAll('.app-nav a').forEach(function (a) {
      a.classList.toggle('activo', a.dataset.ruta === ruta);
    });
  }

  // ------------------------------------------------------------------
  // 5. Comunicación: el contenedor solo ESCUCHA eventos públicos
  // ------------------------------------------------------------------
  window.addEventListener('carrito:actualizado', function (e) {
    document.getElementById('app-contador').textContent = e.detail.cantidad;
    // Nota: leemos solo cantidad y total (v1). Ignoramos subtotal, servicio, version (v2).
  });

  window.addEventListener('usuario:cambio', function (e) {
    document.getElementById('app-saludo').textContent = 'Hola, ' + e.detail.nombre;
  });

  window.addEventListener('pedido:estado', function (e) {
    const d = e.detail;
    notificar('Pedido #' + d.pedidoId + ': ' + d.estado, 'info');
  });

  // ------------------------------------------------------------------
  // 6. Arranque
  // ------------------------------------------------------------------
  Object.values(window.REGISTRO_MFE)
    .filter(function (m) { return m.precargar; })
    .forEach(function (m) { cargarScript(m.url).catch(console.error); });

  window.addEventListener('hashchange', navegar);
  navegar();
})();