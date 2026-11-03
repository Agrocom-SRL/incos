/**
 * pdfFontSafety — evita que un carácter fuera de WinAnsi (Ł, emoji, cirílico, →, ≥ ...)
 * en un dato libre (nombre, observaciones, objetivos) haga fallar toda la generación
 * del PDF: pdf-lib lanza "WinAnsi cannot encode" con las fuentes estándar (Helvetica,
 * Times...). Las fuentes estándar embebidas de un documento protegido sustituyen el
 * carácter por su letra base (Ć -> C) o por "?" y siguen adelante.
 *
 * Las fuentes personalizadas (bytes TTF/OTF vía fontkit) no se tocan.
 */

const ORIGINALES = new WeakMap(); // PDFFont -> { encodeText, widthOfTextAtSize }
const REEMPLAZOS = new WeakMap(); // PDFFont -> Map(carácter -> reemplazo)

const CONTROL = /[\r\n\t]/;

function operacionesOriginales(font) {
  return ORIGINALES.get(font) ?? {
    encodeText: font.encodeText.bind(font),
    widthOfTextAtSize: font.widthOfTextAtSize.bind(font),
  };
}

function puedeCodificar(font, texto) {
  try {
    operacionesOriginales(font).widthOfTextAtSize(texto, 1);
    return true;
  } catch {
    return false;
  }
}

function reemplazoDe(font, caracter) {
  let cache = REEMPLAZOS.get(font);
  if (!cache) {
    cache = new Map();
    REEMPLAZOS.set(font, cache);
  }
  if (cache.has(caracter)) return cache.get(caracter);

  let resultado = '?';
  if (CONTROL.test(caracter) || puedeCodificar(font, caracter)) {
    resultado = caracter;
  } else {
    const base = caracter.normalize('NFD').replace(/[̀-ͯ]/g, '');
    if (base && base !== caracter && puedeCodificar(font, base)) resultado = base;
  }
  cache.set(caracter, resultado);
  return resultado;
}

/**
 * Devuelve el texto con los caracteres que la fuente estándar no puede codificar
 * sustituidos (letra base o "?"). Si todo es codificable lo devuelve igual.
 */
export function sanearTextoWinAnsi(font, texto) {
  const str = String(texto ?? '');
  if (str === '' || puedeCodificar(font, str)) return str;
  let salida = '';
  for (const caracter of str) salida += reemplazoDe(font, caracter);
  return salida;
}

function protegerFuente(font) {
  if (ORIGINALES.has(font)) return font;
  const originales = {
    encodeText: font.encodeText.bind(font),
    widthOfTextAtSize: font.widthOfTextAtSize.bind(font),
  };
  ORIGINALES.set(font, originales);
  font.encodeText = (texto) => originales.encodeText(sanearTextoWinAnsi(font, texto));
  font.widthOfTextAtSize = (texto, size) =>
    originales.widthOfTextAtSize(sanearTextoWinAnsi(font, texto), size);
  return font;
}

/**
 * Envuelve `pdfDoc.embedFont` para que las fuentes estándar (se piden por nombre) sean
 * tolerantes a caracteres no codificables. Idempotente.
 *
 * @param {import('pdf-lib').PDFDocument} pdfDoc
 * @returns {import('pdf-lib').PDFDocument}
 */
export function protegerFuentesEstandar(pdfDoc) {
  if (!pdfDoc || pdfDoc.__incosFuentesSeguras) return pdfDoc;
  const embedFont = pdfDoc.embedFont.bind(pdfDoc);
  pdfDoc.embedFont = async (fuente, opciones) => {
    const font = await embedFont(fuente, opciones);
    return typeof fuente === 'string' ? protegerFuente(font) : font;
  };
  pdfDoc.__incosFuentesSeguras = true;
  return pdfDoc;
}
