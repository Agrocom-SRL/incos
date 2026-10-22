/**
 * Configuración declarativa pura de los PDF del módulo Capacitación (CAP):
 * Formulario de Inscripción y Recibo de Pago.
 *
 * Solo datos (etiquetas, títulos, anchos de columna, tamaños, firmas). Sin lógica:
 * la aritmética vive en `capacitacionPdfLayout.js` y el render en los generadores
 * y en `secciones/`. Los colores institucionales y la plantilla `Plantilla.pdf`
 * provienen de `IncosPDFBase`; aquí solo se definen los que son propios de CAP.
 */

/** Cuerpo del formulario de inscripción. */
export const FORMULARIO_CAPACITACION_PDF_CONFIG = {
  titulo: 'FORMULARIO DE INSCRIPCIÓN',
  subtituloPrefijo: 'CURSO DE CAPACITACIÓN - GESTIÓN',
  registroLabel: 'No. Registro',
  /** Texto cuando un dato opcional no existe. */
  nullPlaceholder: '—',
  secciones: {
    participante: 'I. DATOS DEL PARTICIPANTE',
    curso: 'II. DATOS DEL CURSO',
    requisitos: 'III. REQUISITOS RECEPCIONADOS',
    grupos: 'IV. GRUPOS Y HORARIOS'
  },
  etiquetas: {
    nombres: 'Nombres y Apellidos:',
    ci: 'C.I.:',
    celular: 'Celular:',
    email: 'Correo:',
    curso: 'Curso:',
    modalidad: 'Modalidad:',
    certificadoPor: 'Certifica:',
    inicio: 'Inicio:',
    grupo: 'Grupo:',
    fechaInscripcion: 'Inscripción:',
    estado: 'Estado:',
    sinRequisitos: 'El curso no exige requisitos',
    compromiso: 'Compromiso de entrega hasta:',
    sinPagos: 'Aún no se registraron pagos'
  },
  /**
   * Tabla de requisitos: anchos como fracciones (< 1, suman 1) —`_addTable` solo
   * trata como proporción los valores menores a 1— y alineación por columna.
   */
  tablaRequisitos: {
    headers: ['REQUISITO', 'OBLIGATORIO', 'ENTREGADO', 'FECHA'],
    widths: [0.52, 0.16, 0.16, 0.16],
    alignments: ['left', 'center', 'center', 'center']
  },
  /** Tabla de la sección IV: casilla del grupo elegido, grupo, días y horarios. */
  tablaGrupos: {
    headers: ['SELECCIÓN', 'GRUPO', 'DÍAS', 'HORARIOS'],
    widths: [0.14, 0.3, 0.32, 0.24]
  },
  firmas: [{ label: 'Participante' }, { label: 'Responsable de Inscripción' }]
};

/** Cuerpo del recibo de pago (hereda el diseño del recibo normal). */
export const RECIBO_CAPACITACION_PDF_CONFIG = {
  subtitulo: 'RECIBO DE PAGO - CURSO DE CAPACITACIÓN',
  secciones: {
    participante: 'DATOS DEL PARTICIPANTE',
    pago: 'DETALLE DEL PAGO',
    constancia: 'CONSTANCIA'
  },
  /** Texto de la constancia; {PARTICIPANTE}, {CONCEPTO}, {CURSO} y {MONTO} se sustituyen. */
  constanciaTexto:
    'Se deja constancia de haber recibido de {PARTICIPANTE} la suma de {MONTO}, por concepto de ' +
    '{CONCEPTO}, correspondiente al curso de capacitación «{CURSO}».',
  moneda: 'Bs',
  firmas: [{ label: 'Participante' }, { label: 'Recibí conforme' }]
};

export default { FORMULARIO_CAPACITACION_PDF_CONFIG, RECIBO_CAPACITACION_PDF_CONFIG };
