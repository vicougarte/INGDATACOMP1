/**
 * Servicio Universal de Impresión y Generación de Documentos
 * Soporta:
 * 1. Diálogo de Impresora física / PDF (window.print, iframe print, y ventana popup si está permitido)
 * 2. Exportación a HTML autónomo descargable (.html listo para abrir con doble clic y presionar Ctrl+P o enviar)
 * 3. Copiado al portapapeles y visualización directa
 * 4. Conversión de montos numéricos a literal en Bolivianos
 */

/**
 * Convierte un número a su representación literal en Bolivianos
 */
export const numeroALiteralBolivianos = (num: number): string => {
  if (isNaN(num) || num <= 0) return 'CERO 00/100 BOLIVIANOS';

  const enteros = Math.floor(num);
  const centavos = Math.round((num - enteros) * 100);
  const centavosStr = String(centavos).padStart(2, '0') + '/100 BOLIVIANOS';

  const unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const diezY = ['', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
  const veinti = ['', 'VEINTIUNO', 'VEINTIDÓS', 'VEINTITRÉS', 'VEINTICUATRO', 'VEINTICINCO', 'VEINTISÉIS', 'VEINTISIETE', 'VEINTIOCHO', 'VEINTINUEVE'];
  const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

  const convertirCentenas = (n: number): string => {
    if (n === 100) return 'CIEN';
    let res = '';
    const c = Math.floor(n / 100);
    const d = Math.floor((n % 100) / 10);
    const u = n % 10;

    if (c > 0) res += centenas[c] + ' ';

    if (d === 1 && u > 0) {
      res += diezY[u];
    } else if (d === 2 && u > 0) {
      res += veinti[u];
    } else {
      if (d > 0) res += decenas[d] + (u > 0 ? ' Y ' : '');
      if (u > 0) res += unidades[u];
    }
    return res.trim();
  };

  if (enteros === 0) return `CERO ${centavosStr}`;
  if (enteros < 1000) return `${convertirCentenas(enteros)} ${centavosStr}`;

  const miles = Math.floor(enteros / 1000);
  const resto = enteros % 1000;
  const milesStr = miles === 1 ? 'UN MIL' : `${convertirCentenas(miles)} MIL`;
  const restoStr = resto > 0 ? ` ${convertirCentenas(resto)}` : '';

  return `${milesStr}${restoStr} ${centavosStr}`.trim();
};

/**
 * Obtiene los estilos CSS completos de la aplicación para inyectarlos en el documento a imprimir
 */
const obtenerEstilosDocumento = (): string => {
  const stylesFromDom = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map(el => el.outerHTML)
    .join('\n');

  return `
    ${stylesFromDom}
    <style>
      @page {
        size: A4 portrait;
        margin: 6mm 8mm;
      }
      *, *::before, *::after {
        box-sizing: border-box;
      }
      html, body {
        background: #ffffff !important;
        color: #0f172a !important;
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        margin: 0 !important;
        padding: 4px !important;
        width: 100% !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .no-print {
        display: none !important;
      }
      /* Asegurar que las tablas y bordes no se rompan */
      table {
        border-collapse: collapse !important;
        width: 100% !important;
      }
      th, td {
        border-color: #cbd5e1 !important;
      }
    </style>
  `;
};

/**
 * Construye el HTML completo e independiente de un documento listo para imprimir o descargar
 */
export const generarHtmlDocumentoImprimible = (
  elementoId: string,
  tituloDocumento: string = 'Documento Oficial'
): string | null => {
  const elemento = document.getElementById(elementoId);
  if (!elemento) return null;

  const estilos = obtenerEstilosDocumento();

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>${tituloDocumento}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${estilos}
</head>
<body>
  ${elemento.innerHTML}
  <script>
    window.addEventListener('DOMContentLoaded', () => {
      // Auto-ejecutar impresión si el usuario lo abre como archivo directo
      setTimeout(() => {
        window.focus();
        window.print();
      }, 400);
    });
  </script>
</body>
</html>`;
};

/**
 * Descarga el documento como un archivo HTML oficial listo para abrir e imprimir con 1 clic
 * (Garantiza que el usuario NUNCA se quede sin su boleta o recibo incluso con bloqueos de sandbox)
 */
export const descargarDocumentoHtml = (
  elementoId: string,
  nombreArchivo: string = 'documento-oficial'
): boolean => {
  try {
    const htmlCompleto = generarHtmlDocumentoImprimible(elementoId, nombreArchivo);
    if (!htmlCompleto) return false;

    const blob = new Blob([htmlCompleto], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${nombreArchivo.replace(/[^a-zA-Z0-9_-]/g, '_')}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch (e) {
    console.error('Error al descargar archivo HTML de impresión:', e);
    return false;
  }
};

/**
 * Imprime un documento directamente en la impresora física o diálogo del navegador.
 * Aplica estrategia multicapa para asegurar éxito en iframes, pestañas independientes o modo directo.
 */
export const imprimirElementoUniversal = async (
  elementoId: string,
  tituloDocumento: string = 'Documento Oficial'
): Promise<{ exito: boolean; metodoUsado: string; error?: string }> => {
  const elemento = document.getElementById(elementoId);
  if (!elemento) {
    console.warn(`Elemento #${elementoId} no encontrado en el DOM.`);
    try {
      window.focus();
      window.print();
      return { exito: true, metodoUsado: 'window.print (global fallback)' };
    } catch (err: any) {
      return { exito: false, metodoUsado: 'none', error: err?.message || 'Elemento no encontrado' };
    }
  }

  const htmlCompleto = generarHtmlDocumentoImprimible(elementoId, tituloDocumento);

  // ESTRATEGIA 1: Iframe offscreen con dimensiones reales completas.
  // Es la técnica más confiable en Chromium/Firefox para modales e iframes porque aísla el documento
  // de cualquier overflow, transform, fixed o backdrop-filter del DOM principal.
  if (htmlCompleto) {
    try {
      // Eliminar iframe previo si existiera
      const frameExistente = document.getElementById('idc-print-universal-frame');
      if (frameExistente) {
        try { frameExistente.remove(); } catch {}
      }

      const iframe = document.createElement('iframe');
      iframe.id = 'idc-print-universal-frame';
      iframe.setAttribute('title', tituloDocumento);
      // IMPORTANTE: No usar width: 0 o display: none porque Chromium ignora la impresión de frames vacíos.
      iframe.style.position = 'fixed';
      iframe.style.left = '-10000px';
      iframe.style.top = '-10000px';
      iframe.style.width = '950px';
      iframe.style.height = '1300px';
      iframe.style.border = '0';
      iframe.style.opacity = '0.01';
      iframe.style.pointerEvents = 'none';
      iframe.style.zIndex = '-99999';

      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(htmlCompleto);
        doc.close();

        // Esperar a que las imágenes y tipografías se carguen
        await new Promise<void>((resolve) => {
          const imgs = Array.from(doc.images);
          if (imgs.length === 0) {
            setTimeout(resolve, 250);
          } else {
            let cargadas = 0;
            const check = () => {
              cargadas++;
              if (cargadas >= imgs.length) resolve();
            };
            imgs.forEach(img => {
              if (img.complete) check();
              else {
                img.onload = check;
                img.onerror = check;
              }
            });
            setTimeout(resolve, 700);
          }
        });

        let printEjecutado = false;
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          printEjecutado = true;
        } catch (ePrint) {
          console.warn('Error en iframe.print():', ePrint);
        }

        // Si se ejecutó correctamente el print en el iframe, finalizar con éxito
        if (printEjecutado) {
          setTimeout(() => {
            try { iframe.remove(); } catch {}
          }, 60000);
          return { exito: true, metodoUsado: 'iframe_direct_print' };
        }
      }
    } catch (errIframe) {
      console.warn('Fallo en intento de impresión por iframe aislado:', errIframe);
    }
  }

  // ESTRATEGIA 2: window.print() nativo sobre la ventana activa con clases de aislamiento
  try {
    document.body.classList.add('imprimiendo-documento-activo');
    elemento.classList.add('elemento-impresion-activa');
    const tituloOriginal = document.title;
    document.title = tituloDocumento;

    window.focus();
    window.print();

    setTimeout(() => {
      document.body.classList.remove('imprimiendo-documento-activo');
      elemento.classList.remove('elemento-impresion-activa');
      document.title = tituloOriginal;
    }, 2000);

    return { exito: true, metodoUsado: 'window.print (estilos en capa activa)' };
  } catch (eNative) {
    console.warn('Error en impresión nativa directa:', eNative);
    document.body.classList.remove('imprimiendo-documento-activo');
    elemento?.classList.remove('elemento-impresion-activa');
  }

  // ESTRATEGIA 3: Descarga de archivo de impresión de contingencia
  const descargado = descargarDocumentoHtml(elementoId, tituloDocumento);
  return { 
    exito: descargado, 
    metodoUsado: 'descarga_html', 
    error: descargado ? undefined : 'No se pudo enviar a impresora ni descargar' 
  };
};

/**
 * Alias de compatibilidad para recibos
 */
export const imprimirReciboDirecto = async (
  elementoId: string,
  tituloDocumento: string = 'Recibo Oficial de Caja'
): Promise<boolean> => {
  const res = await imprimirElementoUniversal(elementoId, tituloDocumento);
  return res.exito;
};
