/**
 * Archivo: app.js
 * Proyecto: Cotizador Gomería La Lucha
 * Descripción: Lógica principal del cotizador - carga de datos, búsqueda,
 *              render y clientes en espera de aviso por WhatsApp.
 * Creado: 2026-07-12
 */

(function () {
  const CLAVE_CLIENTES_ESPERA = 'cotiz_clientesEnEspera';
  const TELEFONO_ADMINISTRACION = '+598 91 360 450';

  const campoMedida = document.getElementById('campo-medida');
  const botonLimpiar = document.getElementById('boton-limpiar');
  const contenedorResultados = document.getElementById('resultados');
  const seccionEspera = document.getElementById('seccion-espera');
  const contenedorListaEspera = document.getElementById('espera-lista');
  const contadorEspera = document.getElementById('espera-contador');
  const pantallaCarga = document.getElementById('pantalla-carga');

  let todosLosNeumaticos = [];

  async function iniciar() {
    try {
      const respuesta = await fetch('data/neumaticos.json');
      todosLosNeumaticos = await respuesta.json();
      renderizarEstadoInicial();
      renderizarClientesEnEspera();
    } catch (error) {
      renderizarError();
    } finally {
      pantallaCarga.setAttribute('hidden', '');
    }
  }

  // --- Búsqueda y resultados ---

  function renderizarEstadoInicial() {
    contenedorResultados.innerHTML = `
      <div class="estado-vacio">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.5"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <p>Ingresá una medida para ver los precios disponibles.</p>
      </div>`;
  }

  function renderizarSinResultados(textoBusqueda) {
    contenedorResultados.innerHTML = `
      <div class="estado-vacio">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
          <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <p>No encontramos neumáticos para "${escaparHtml(textoBusqueda)}". Probá con otra medida.</p>
      </div>`;
  }

  function renderizarError() {
    contenedorResultados.innerHTML = `
      <div class="estado-vacio">
        <p>No se pudo cargar la lista de precios. Recargá la página o avisá al administrador.</p>
      </div>`;
  }

  function renderizarResultados(neumaticos) {
    const contador = `<p class="resultado-contador">${neumaticos.length} resultado${neumaticos.length === 1 ? '' : 's'}</p>`;
    const tarjetas = neumaticos.map(neumaticoATarjetaHtml).join('');
    const botonNuevaBusqueda = `<button class="boton-nueva-busqueda" data-accion="nueva-busqueda" type="button">Buscar otra cubierta</button>`;
    contenedorResultados.innerHTML = contador + tarjetas + botonNuevaBusqueda;
  }

  function neumaticoATarjetaHtml(neumatico) {
    const datos = `data-medida="${escaparHtml(neumatico.medida)}" data-marca="${escaparHtml(neumatico.marca)}" data-modelo="${escaparHtml(neumatico.modelo)}" data-precio-pesos="${neumatico.precioPesos}" data-precio-dolares="${neumatico.precioDolares}"`;
    return `
      <article class="tarjeta" ${datos}>
        <div class="tarjeta__fila-superior">
          <div>
            <div class="tarjeta__medida">${escaparHtml(neumatico.medida)}</div>
            <span class="tarjeta__marca">${escaparHtml(neumatico.marca)}</span>
            <div class="tarjeta__modelo">${escaparHtml(neumatico.modelo)}</div>
          </div>
          <div class="tarjeta__precios">
            <div class="tarjeta__precio-pesos">$ ${formatearPesos(neumatico.precioPesos)}</div>
            <div class="tarjeta__precio-dolares">US$ ${formatearDolares(neumatico.precioDolares)}</div>
          </div>
        </div>
        <button class="tarjeta__aviso-boton" data-accion="mostrar-form" type="button">+ Avisar a un cliente</button>
        <div class="tarjeta__aviso-form" data-accion="form" hidden>
          <input type="text" class="tarjeta__aviso-input" data-campo="nombre" placeholder="Nombre del cliente" />
          <input type="tel" class="tarjeta__aviso-input" data-campo="telefono" placeholder="Teléfono (ej. 099123456)" />
          <input type="number" class="tarjeta__aviso-input" data-campo="cantidad" placeholder="Cantidad de cubiertas" min="1" step="1" />
          <div class="tarjeta__aviso-botones">
            <button class="tarjeta__aviso-guardar" data-accion="guardar-aviso" type="button">Guardar aviso</button>
            <button class="tarjeta__aviso-cancelar" data-accion="cancelar-aviso" type="button">Cancelar</button>
          </div>
          <p class="tarjeta__aviso-error" data-rol="error" hidden></p>
        </div>
      </article>`;
  }

  function escaparHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
  }

  function ejecutarBusqueda() {
    const textoBusqueda = campoMedida.value.trim();
    botonLimpiar.hidden = textoBusqueda.length === 0;

    if (!textoBusqueda) {
      renderizarEstadoInicial();
      return;
    }

    const resultadosFinales = filtrarPorMedida(todosLosNeumaticos, textoBusqueda);

    if (resultadosFinales.length === 0) {
      renderizarSinResultados(textoBusqueda);
    } else {
      renderizarResultados(resultadosFinales);
    }
  }

  function limpiarBusqueda() {
    campoMedida.value = '';
    campoMedida.focus();
    ejecutarBusqueda();
  }

  campoMedida.addEventListener('input', ejecutarBusqueda);
  botonLimpiar.addEventListener('click', limpiarBusqueda);

  // --- Interacciones dentro de los resultados (delegación de eventos) ---

  contenedorResultados.addEventListener('click', (evento) => {
    const boton = evento.target.closest('[data-accion]');
    if (!boton) return;
    const tarjeta = boton.closest('.tarjeta');

    switch (boton.dataset.accion) {
      case 'nueva-busqueda':
        limpiarBusqueda();
        break;
      case 'mostrar-form':
        alternarFormularioAviso(tarjeta, true);
        break;
      case 'cancelar-aviso':
        alternarFormularioAviso(tarjeta, false);
        break;
      case 'guardar-aviso':
        guardarAvisoDesdeTarjeta(tarjeta);
        break;
    }
  });

  function alternarFormularioAviso(tarjeta, mostrar) {
    const form = tarjeta.querySelector('[data-accion="form"]');
    const botonAbrir = tarjeta.querySelector('[data-accion="mostrar-form"]');
    form.hidden = !mostrar;
    botonAbrir.hidden = mostrar;
    if (mostrar) {
      form.querySelector('[data-campo="nombre"]').focus();
    } else {
      form.querySelectorAll('input').forEach(input => (input.value = ''));
      mostrarErrorAviso(form, '');
    }
  }

  function mostrarErrorAviso(form, mensaje) {
    const elementoError = form.querySelector('[data-rol="error"]');
    elementoError.textContent = mensaje;
    elementoError.hidden = !mensaje;
  }

  function guardarAvisoDesdeTarjeta(tarjeta) {
    const form = tarjeta.querySelector('[data-accion="form"]');
    const nombre = form.querySelector('[data-campo="nombre"]').value.trim();
    const telefono = form.querySelector('[data-campo="telefono"]').value.trim();
    const cantidad = Number(form.querySelector('[data-campo="cantidad"]').value);
    const soloDigitosTelefono = telefono.replace(/\D/g, '');

    if (!nombre) {
      mostrarErrorAviso(form, 'Ingresá el nombre del cliente.');
      return;
    }
    if (soloDigitosTelefono.length < 8) {
      mostrarErrorAviso(form, 'Ingresá un teléfono válido.');
      return;
    }
    if (!cantidad || cantidad < 1) {
      mostrarErrorAviso(form, 'Ingresá cuántas cubiertas precisa.');
      return;
    }

    agregarClienteEnEspera({
      id: Date.now(),
      nombre,
      telefono,
      cantidad,
      medida: tarjeta.dataset.medida,
      marca: tarjeta.dataset.marca,
      modelo: tarjeta.dataset.modelo,
      precioPesos: Number(tarjeta.dataset.precioPesos),
      precioDolares: Number(tarjeta.dataset.precioDolares),
    });

    alternarFormularioAviso(tarjeta, false);
  }

  // --- Clientes en espera (persistidos en este dispositivo) ---

  function obtenerClientesEnEspera() {
    try {
      return JSON.parse(localStorage.getItem(CLAVE_CLIENTES_ESPERA)) || [];
    } catch (error) {
      return [];
    }
  }

  function guardarListaClientesEnEspera(lista) {
    localStorage.setItem(CLAVE_CLIENTES_ESPERA, JSON.stringify(lista));
  }

  function agregarClienteEnEspera(cliente) {
    const lista = obtenerClientesEnEspera();
    lista.unshift(cliente);
    guardarListaClientesEnEspera(lista);
    renderizarClientesEnEspera();
  }

  function eliminarClienteEnEspera(id) {
    const lista = obtenerClientesEnEspera().filter(cliente => cliente.id !== id);
    guardarListaClientesEnEspera(lista);
    renderizarClientesEnEspera();
  }

  function renderizarClientesEnEspera() {
    const lista = obtenerClientesEnEspera();
    contadorEspera.textContent = lista.length;
    seccionEspera.hidden = lista.length === 0;

    contenedorListaEspera.innerHTML = lista.map(clienteAFilaHtml).join('');
  }

  function clienteAFilaHtml(cliente) {
    const mensajeAdmin = construirMensajeAdministracion(cliente);
    const enlaceAdmin = construirEnlaceWhatsapp(TELEFONO_ADMINISTRACION, mensajeAdmin);
    return `
      <article class="espera__fila">
        <div class="espera__cabecera">
          <div class="espera__info">
            <div class="espera__nombre">${escaparHtml(cliente.nombre)}</div>
            <div class="espera__detalle">${cliente.cantidad} × ${escaparHtml(cliente.medida)} · ${escaparHtml(cliente.marca)} ${escaparHtml(cliente.modelo)} · Tel: ${escaparHtml(cliente.telefono)}</div>
          </div>
          <button class="espera__eliminar" data-id="${cliente.id}" type="button" aria-label="Quitar de la lista de espera">&times;</button>
        </div>
        <a class="espera__whatsapp" href="${enlaceAdmin}" target="_blank" rel="noopener">Enviar pedido a administración</a>
      </article>`;
  }

  contenedorListaEspera.addEventListener('click', (evento) => {
    const boton = evento.target.closest('.espera__eliminar');
    if (!boton) return;
    eliminarClienteEnEspera(Number(boton.dataset.id));
  });

  if ('serviceWorker' in navigator) {
    // Cuando se activa una versión nueva del service worker, se recarga sola
    // para que la actualización se vea al toque (si no, hace falta refrescar
    // la página dos veces por cómo funciona el ciclo de vida del SW).
    let yaRecargo = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (yaRecargo) return;
      yaRecargo = true;
      window.location.reload();
    });

    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js').catch(() => {});
    });
  }

  iniciar();
})();
