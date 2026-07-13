# Avances del Proyecto — Cotizador Gomería La Lucha

**Prefijo del proyecto:** `cotiz_`
**Última actualización:** 2026-07-13
**Estado general:** en desarrollo (MVP funcional, falta probar instalación real en iPhone)

---

## 1. Descripción breve del proyecto
PWA para que los vendedores de Gomería La Lucha (San Juan y Solís) busquen un neumático por medida y obtengan al instante el precio final de venta al público, en pesos y dólares, sin ver costos ni márgenes internos.

## 2. Stack técnico
- Backend: ninguno (no hace falta — ver `05-guia-decision-tecnica.md` y punto 7 del alcance).
- Frontend: PWA con JavaScript vanilla, HTML y CSS puro, sin framework.
- Base de datos: ninguna — los datos viven en `public/data/neumaticos.json`, generado desde el Excel del proveedor.
- Hosting: a definir (cualquier hosting estático sirve — Netlify, Vercel, hosting propio, etc.).
- Integraciones externas: ninguna.

## 3. Estructura de archivos clave
| Archivo | Función |
|---|---|
| `public/index.html` | Estructura de la pantalla del cotizador |
| `public/css/estilos.css` | Estilos y sistema de diseño (tokens en `:root`) |
| `public/js/buscador.js` | Funciones puras de normalización y filtrado |
| `public/js/app.js` | Lógica principal: carga de datos, búsqueda, render |
| `public/manifest.json` | Configuración de instalación PWA |
| `public/service-worker.js` | Cacheo offline del shell + estrategia red-primero para los precios |
| `public/data/neumaticos.json` | Datos de precios (generado, no editar a mano) |
| `scripts/excel-a-json.js` | Conversor Excel → JSON. Correr `npm run datos` cada vez que cambia la lista del proveedor |
| `planeacion/LISTA_SJyS_julio_2026_cotizador_final_1.xlsx` | Excel fuente con la lista de precios (169 neumáticos, hoja "Cotizador") |

## 4. Hecho (por fecha, más reciente primero)
### 2026-07-14 (cantidad de cubiertas)
- Se agregó el campo "Cantidad de cubiertas" (numérico, obligatorio, mínimo 1) al formulario de aviso de cada tarjeta, entre nombre y teléfono. Se valida igual que los otros campos (mensaje de error si falta o es 0).
- La cantidad se guarda en el cliente en espera, se muestra en la lista ("4 × 175/70R14 · RAPID ECO809 · Tel: ...") y se incluye en el mensaje de WhatsApp a administración ("...solicitó 4 cubiertas 175/70R14...").
- Caché subida a `la-lucha-v5`.

### 2026-07-14 (corrección de mensaje)
- Gerardo siguió viendo el mensaje viejo (el de avisar al cliente) al probar — causa: todavía no había hecho el refresh fuerte que hacía falta para bajar la versión con el auto-reload (ver entrada anterior). Se subió la caché a `la-lucha-v4` para forzar la actualización una vez más.
- Se cambió la redacción del mensaje a administración (`construirMensajeAdministracion` en `buscador.js`) a pedido de Gerardo: "Administración: el cliente {nombre} solicitó cubiertas {medida} {marca} {modelo} para que le avisen cuando lleguen. Teléfono: {telefono}." — más corto y directo que el formato anterior con precio incluido.

### 2026-07-14
- Bug encontrado: Gerardo probó el botón de WhatsApp y le apareció el mensaje VIEJO (el de avisar al cliente), aunque ya lo habíamos sacado del código. Causa: el service worker sirve los `.js` con estrategia cache-first y no se había subido la versión de caché (`VERSION_CACHE`) después de ese cambio, así que el navegador seguía usando la copia vieja de `app.js` guardada en caché.
  - Se subió la versión de caché a `la-lucha-v3` para forzar la actualización.
  - Se agregó auto-recarga de la página cuando el service worker activa una versión nueva (evento `controllerchange` en `app.js`), para no depender de que alguien sepa que hay que refrescar dos veces cuando se publique una actualización — esto aplica para cualquier cambio futuro, no solo este.
- Aclarado con Gerardo: los "Clientes en espera" quedan guardados a propósito al reiniciar la web (persisten en `localStorage` del dispositivo) para no perder pedidos si se cierra la página o el celular se reinicia. Se borran solo manualmente con la "×" de cada uno.

### 2026-07-13 (noche, corrección)
- Gerardo aclaró el proceso real: el vendedor NO le escribe directo al cliente. El pedido va primero a administración (quienes cotizan tiempos de entrega con el proveedor) y administración es quien después le escribe al cliente. Se sacó el botón "Avisar al cliente" — ahora cada cliente en espera tiene un solo botón, "Enviar pedido a administración", que manda nombre + teléfono del cliente + medida/marca/modelo + precio para que administración lo contacte cuando corresponda.
- Se borró `construirMensajeAviso` (quedó sin uso al sacar el botón directo al cliente).

### 2026-07-13 (noche)
- Se agregó el botón "Avisar a administración" en cada cliente de la lista de espera, junto al de avisar al cliente. Abre WhatsApp hacia el número de administración (+598 91 360 450, configurado en `TELEFONO_ADMINISTRACION` en `app.js`) con un mensaje ya armado: nombre y teléfono del cliente, medida/marca/modelo buscado y precio en pesos y dólares — así se centralizan los pedidos.
- **Limitación técnica explicada y aceptada por Gerardo:** WhatsApp no permite enviar mensajes de forma automática/silenciosa desde una web sin backend (se necesitaría la API de WhatsApp Business, fuera de alcance). El botón abre el chat con el mensaje redactado; el vendedor tiene que tocar "Enviar" dentro de WhatsApp. Se eligió el flujo manual (botón aparte) en vez de abrir la pestaña automáticamente al guardar, para no ser invasivo en cada guardado.

### 2026-07-13 (tarde)
- Header rediseñado: fondo blanco con borde inferior rojo (antes negro carbón, donde el ícono se perdía por ser oscuro sobre oscuro) y logo más grande (40px → 56px, 64px en desktop). Se actualizó `theme-color` y el estilo de la barra de estado de iOS acorde.
- Nueva funcionalidad: **avisar a un cliente**. Cada tarjeta de resultado tiene un botón "+ Avisar a un cliente" que despliega un mini-formulario (nombre + teléfono). Al guardar, el cliente queda en una lista de "Clientes en espera" (persistida en `localStorage` del dispositivo, clave `cotiz_clientesEnEspera`) con un botón de WhatsApp que abre `wa.me` con un mensaje pre-armado avisando que la cubierta ya está disponible, y un botón para quitarlo de la lista una vez contactado.
- Se agregó botón "Buscar otra cubierta" al final de los resultados, que limpia el campo de búsqueda (mismo efecto que la X del input, pero más accesible después de scrollear resultados en mobile).
- Se agregó footer con "Desarrollado por Mazdesign - 2026".
- Bug encontrado y corregido (mismo patrón que el de los chips): el formulario de aviso aparecía abierto en TODAS las tarjetas desde el arranque, porque `.tarjeta__aviso-form { display:flex }` y `.tarjeta__aviso-boton { display:block }` le ganaban al atributo `hidden`. Se agregaron las reglas `[hidden] { display:none }` correspondientes.
- Se bump la versión de caché del service worker (`la-lucha-v2`) para que los dispositivos ya instalados bajen los archivos nuevos.

### 2026-07-13
- Se corrigió el ícono del header (`public/img/icono-neumatico.png`): el recorte original dejaba mucho margen transparente alrededor de la cubierta, por lo que a 40px de alto se veía casi imperceptible. Se recortó ajustado (trim) al borde real del dibujo. Se regeneraron con el mismo recorte los íconos de la PWA (`public/icons/`).
- Se sacaron los chips de filtro por marca (Todas/Goodyear/Rapid/etc.) a pedido de Gerardo — el buscador quedó solo con el campo de medida.
- La búsqueda ahora normaliza comparando solo dígitos (`normalizarMedida` en `buscador.js`), así que "175/70R14", "175-70-14" y "175 70 14" buscan exactamente lo mismo.

### 2026-07-12
- Junta de organización: alcance, reglas de negocio y decisión de stack ya estaban en `12-alcance-funcionalidades`.
- Se completó el sistema de diseño (`11-sistema-diseno`) a partir del logo de La Lucha (rojo #C62328, negro carbón #2B2B2B, Barlow Condensed + Inter).
- Se inspeccionó el Excel: hoja única "Cotizador", 169 filas, columnas MEDIDA/MARCA/MODELO/ORIGEN/PRECIO VENTA REDONDEADO (USD)/PRECIO EN PESOS. Tipo de cambio consistente x43. Sin duplicados ni filas vacías.
- Se armó el script `scripts/excel-a-json.js` (usa el paquete `xlsx` como devDependency) que genera `public/data/neumaticos.json`.
- Se generaron los íconos de la PWA recortando la cubierta del logo original (192/512 estándar + maskable + favicon) con `sharp` (herramienta de conversión, no queda como dependencia del proyecto).
- Se construyó el cotizador completo: búsqueda por medida (tolerante a mayúsculas/espacios/guiones), filtro por marca (chips), tarjetas de resultado con precio en pesos (destacado) y dólares (secundario), estados vacío/sin-resultados/error, animaciones de aparición y loading spinner.
- Se armaron `manifest.json` e íconos para que sea instalable en Android/iPhone/PC.
- Se armó `service-worker.js`: shell cacheado para offline, pero el JSON de precios se pide siempre a la red primero (con fallback a caché sin conexión) para no mostrar precios viejos por error.
- Se probó visualmente con Playwright (mobile 390x844 y desktop 1280x800): búsqueda, filtro por marca y estado sin resultados funcionan sin errores de consola.
- Bug encontrado y corregido: los chips de marca se veían en la pantalla inicial porque `.filtros { display:flex }` le ganaba al atributo `hidden` — se agregó `.filtros[hidden] { display:none }`.
- Se decidió no usar el logo completo en el header (ilegible a 44px de alto) — se usa el ícono de la cubierta recortado + texto tipografiado en su lugar.

## 5. Pendiente / próximos pasos
- [ ] Probar instalación real en un iPhone (Safari → "Agregar a inicio") — prioridad: alta, es punto de atención explícito del alcance.
- [ ] Probar instalación real en Android (Chrome) — prioridad: alta.
- [ ] Definir y contratar el hosting donde se va a publicar — prioridad: media.
- [ ] Definir con Gerardo los plazos de entrega (punto 8 del alcance sigue "a definir") — prioridad: media.
- [ ] Cuando el proveedor actualice la lista de precios: reemplazar el Excel en `planeacion/` y correr `npm run datos` — prioridad: recurrente.

## 6. Bugs conocidos / cosas a vigilar
- Ninguno abierto. Los bugs de los chips y del formulario de aviso visibles antes de tiempo ya se corrigieron (ver punto 4).
- **Importante para cualquier cambio futuro en `public/`:** el service worker cachea agresivamente (cache-first). Cada vez que se edite HTML/CSS/JS, hay que subir `VERSION_CACHE` en `service-worker.js` — si no, los dispositivos que ya instalaron la app van a seguir viendo la versión vieja aunque el código en el repo esté actualizado. Ya se agregó auto-recarga cuando el SW detecta una versión nueva, así que con un solo refresh alcanza (antes hacían falta dos).

## 7. Decisiones de arquitectura ya tomadas (no reabrir sin motivo)
- Los "Clientes en espera" se guardan en `localStorage`, no en un backend. Motivo: no se sumó backend a la app (fuera de alcance original) y `localStorage` alcanza para el caso de uso — el vendedor consulta la lista desde el mismo dispositivo donde la cargó. **Limitación conocida:** la lista NO se sincroniza entre dispositivos (si el vendedor usa el celular y la PC, cada uno tiene su propia lista). Si esto se vuelve un problema en el uso real, ahí sí se justificaría sumar backend — avisar a Gerardo si aparece esa necesidad.
- El envío del WhatsApp es manual (el vendedor tapea "Enviar WhatsApp" cuando corresponde) — no hay envío automático ni programado. Motivo: WhatsApp no ofrece esa función sin su API de Business (fuera de alcance), así que se resolvió con un enlace `wa.me` que abre la conversación con el mensaje ya redactado.
- Sin backend ni base de datos — filtrado 100% client-side sobre un JSON generado a partir del Excel. Motivo: no hay datos sensibles que ocultar dinámicamente ni lógica de negocio variable (alcance punto 7).
- El Excel se convierte a JSON con un script manual (`scripts/excel-a-json.js`), no se parsea el `.xlsx` en el navegador. Motivo: mantener el bundle liviano — parsear xlsx en el cliente requeriría cargar una librería pesada (SheetJS completo) solo para leer 169 filas que caben en un JSON de pocos KB.
- El vendedor ve precio en pesos Y en dólares (confirmado por Gerardo el 2026-07-12, superando lo que decía originalmente el alcance de "solo pesos").
- El service worker pide el JSON de precios a la red primero (no cache-first), para evitar mostrar una lista de precios desactualizada cuando hay conexión.

## 8. Credenciales / accesos (SOLO referencias, nunca valores reales)
- Ninguna por ahora (no hay backend, base de datos ni integraciones).
- Teléfono de WhatsApp de administración: configurado como constante `TELEFONO_ADMINISTRACION` en `public/js/app.js` — si cambia el número, actualizar ahí.

## 9. Notas de contexto de negocio
- Circuito de "cliente en espera": el vendedor NUNCA le escribe directo al cliente desde el cotizador. El pedido (nombre, teléfono, cubierta) se manda por WhatsApp a administración, que es quien coordina con el proveedor el tiempo de entrega y después le avisa al cliente.
- El precio final ya incluye el 45% de margen y el tipo de cambio (x43) — es fijo, el vendedor no lo edita ni ve el desglose de costo/descuento/margen.
- Los descuentos adicionales que puedan otorgar los dueños del negocio se manejan en la facturación, fuera de esta app.
- Cliente/negocio real: Tainet (nombre de fantasía "Gomería La Lucha").
