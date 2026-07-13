/**
 * Archivo: buscador.js
 * Proyecto: Cotizador Gomería La Lucha
 * Descripción: Funciones puras de normalización y filtrado de neumáticos.
 * Creado: 2026-07-12
 */

/**
 * Normaliza una medida a solo sus dígitos, para poder comparar
 * "175/70R14", "175-70-14" y "175 70 14" como la misma búsqueda.
 */
function normalizarMedida(texto) {
  return String(texto).replace(/\D/g, '');
}

function filtrarPorMedida(neumaticos, textoBusqueda) {
  const busquedaNormalizada = normalizarMedida(textoBusqueda);
  if (!busquedaNormalizada) return [];

  return neumaticos.filter(neumatico =>
    normalizarMedida(neumatico.medida).includes(busquedaNormalizada)
  );
}

function formatearPesos(valor) {
  return new Intl.NumberFormat('es-UY', { maximumFractionDigits: 0 }).format(valor);
}

function formatearDolares(valor) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(valor);
}

/**
 * Normaliza un teléfono uruguayo a formato internacional sin signos
 * (ej. "099 123 456" o "94123456" -> "59894123456") para usar en wa.me.
 */
function normalizarTelefonoUY(texto) {
  let digitos = String(texto).replace(/\D/g, '');
  if (digitos.startsWith('598')) return digitos;
  if (digitos.startsWith('0')) digitos = digitos.slice(1);
  return '598' + digitos;
}

function construirEnlaceWhatsapp(telefono, mensaje) {
  const numero = normalizarTelefonoUY(telefono);
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

function construirMensajeAdministracion(cliente) {
  const cantidadTexto = cliente.cantidad === 1 ? '1 cubierta' : `${cliente.cantidad} cubiertas`;
  return `Administración: el cliente ${cliente.nombre} solicitó ${cantidadTexto} ${cliente.medida} ${cliente.marca} ${cliente.modelo} para que le avisen cuando lleguen. Teléfono: ${cliente.telefono}.`;
}
