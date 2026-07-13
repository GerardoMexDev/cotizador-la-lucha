/**
 * Archivo: excel-a-json.js
 * Proyecto: Cotizador Gomería La Lucha
 * Descripción: Convierte la lista de precios (Excel) en el JSON que consume el frontend.
 *              Se corre manualmente cada vez que el proveedor actualiza la lista.
 * Creado: 2026-07-12
 */

const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

const ARCHIVO_EXCEL = path.join(__dirname, '..', 'planeacion', 'LISTA_SJyS_julio_2026_cotizador_final_1.xlsx');
const ARCHIVO_SALIDA = path.join(__dirname, '..', 'public', 'data', 'neumaticos.json');
const NOMBRE_HOJA = 'Cotizador';

function convertirExcelAJson() {
  const libro = XLSX.readFile(ARCHIVO_EXCEL);
  const hoja = libro.Sheets[NOMBRE_HOJA];
  const filas = XLSX.utils.sheet_to_json(hoja, { header: 1, defval: null });
  const datos = filas.slice(1); // saltar encabezado

  const neumaticos = datos.map(fila => ({
    medida: String(fila[0]).trim(),
    marca: String(fila[1]).trim(),
    modelo: String(fila[2]).trim(),
    origen: String(fila[3]).trim(),
    precioDolares: Number(fila[4]),
    precioPesos: Number(fila[5]),
  }));

  fs.writeFileSync(ARCHIVO_SALIDA, JSON.stringify(neumaticos, null, 2), 'utf-8');
  console.log(`OK: ${neumaticos.length} neumáticos escritos en ${ARCHIVO_SALIDA}`);
}

convertirExcelAJson();
