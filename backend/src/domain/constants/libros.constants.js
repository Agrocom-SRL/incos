/**
 * Constantes del dominio Libros de registro (schema 25, módulo ACA).
 *
 * Base documental: "LIBRO LLENADO SISTEMAS 11 dic 2025" (libro físico real del
 * centralizador de calificaciones). Un LIBRO es por GESTIÓN, compartido por
 * las 3 carreras del instituto; un FOLIO = una página del centralizador de un
 * paralelo (hasta 10 estudiantes) de cualquiera de las 3 carreras.
 */

/**
 * Código de Registro institucional impreso en cada página del libro
 * (cabecera "Código de Registro: 81981609"). Default editable en el alta del
 * libro (columna libros_registro.codigo_registro).
 */
export const CODIGO_REGISTRO_INSTITUCIONAL = '81981609';

/** Máximo de estudiantes por página/folio del centralizador (formato real). */
export const ESTUDIANTES_POR_FOLIO = 10;

/** Estados del libro (libros_registro.estado). */
export const ESTADOS_LIBRO = {
  ABIERTO: 'ABIERTO',
  CERRADO: 'CERRADO',
};
export const ESTADOS_LIBRO_VALUES = Object.values(ESTADOS_LIBRO);

/**
 * Estados del folio (folios_libro.estado). Sin IMPRESO/FIRMADO: el sistema no
 * tiene forma de verificar que una página se imprimió o firmó físicamente, así
 * que solo trackea lo que SÍ controla — el folio existe (BORRADOR) o quedó sin
 * efecto (ANULADO). El "cierre" oficial del documento se controla por
 * `libros_registro.estado` (CERRADO) — ver `ExportLibroExcelUseCase` (bloque de
 * firmas solo en el export del libro CERRADO; mientras está ABIERTO se exporta
 * en borrador, sin firmas).
 */
export const ESTADOS_FOLIO = {
  BORRADOR: 'BORRADOR',
  ANULADO: 'ANULADO',
};
export const ESTADOS_FOLIO_VALUES = Object.values(ESTADOS_FOLIO);

/**
 * Máquina de estados del folio: BORRADOR → ANULADO. ANULADO es terminal y
 * exige motivo. Un folio NO se elimina: se anula.
 */
export const TRANSICIONES_FOLIO = {
  [ESTADOS_FOLIO.BORRADOR]: [ESTADOS_FOLIO.ANULADO],
  [ESTADOS_FOLIO.ANULADO]: [],
};

/**
 * Columna ESTADO de la nómina del folio (folio_estudiantes.estado_academico).
 * CURSANDO: la gestión sigue abierta y al estudiante aún le faltan notas —
 * distinto de ABANDONO (retiro real registrado en matriculas_materia). Ver
 * `derivarEstadoAcademico` (folioCeldasHelper.js).
 */
export const ESTADOS_ACADEMICOS_FOLIO = {
  APROBADO: 'APROBADO',
  REPROBADO: 'REPROBADO',
  ABANDONO: 'ABANDONO',
  CURSANDO: 'CURSANDO',
};
export const ESTADOS_ACADEMICOS_FOLIO_VALUES = Object.values(ESTADOS_ACADEMICOS_FOLIO);

/**
 * Metadatos de cabecera del documento oficial (espejo del CENTRALIZADOR_DOC del
 * frontend + campos propios del libro físico). NO viven en tablas: son
 * parametrizables el día que el instituto los gestione desde Configuración.
 */
export const LIBRO_REGISTRO_DOC = {
  titulo: 'CENTRALIZADOR DE CALIFICACIONES',
  institucion: 'INSTITUTO TÉCNICO INCOS SANTA CRUZ',
  ciudad: 'Santa Cruz - Bolivia',
  nivel: 'TÉCNICO SUPERIOR',
  regimen: 'ANUAL',
  caracter: 'FISCAL',
  resolucionMinisterial: '0426/2016',
  firmas: ['JEFE(A) DE CARRERA', 'DIRECTOR(A) ACADÉMICO(A)', 'RECTOR(A)'],
  /** Leyenda de abreviaturas bajo la nómina de cada folio (documento oficial). */
  leyendaNotas: 'NP = No se Presentó / AP = Aprobado / PRE = Prerrequisito',
  /** Bloque "ESTADÍSTICAS" al pie de la hoja del paralelo (junto a firmas de docentes). */
  estadisticas: {
    titulo: 'ESTADÍSTICAS',
    columnas: ['DETALLE', 'CANTIDAD', '%'],
    filas: [
      {
        campo: 'estudiantesInscritos',
        pctCampo: 'porcentajeInscritos',
        etiqueta: 'ESTUDIANTES INSCRITOS',
      },
      {
        campo: 'estudiantesAprobados',
        pctCampo: 'porcentajeAprobados',
        etiqueta: 'ESTUDIANTES APROBADOS',
      },
      {
        campo: 'estudiantesReprobados',
        pctCampo: 'porcentajeReprobados',
        etiqueta: 'ESTUDIANTES REPROBADOS',
      },
      { campo: 'abandono', pctCampo: 'porcentajeAbandono', etiqueta: 'ABANDONO' },
    ],
  },
};

/**
 * Orden canónico de carreras del documento oficial para la generación MASIVA
 * de folios de una gestión: Contaduría → Administración → Informática.
 * OJO: los ids de `carreras` en BD están en el orden CONTRARIO (1=SIS-INF,
 * 2=ADM-EMP, 3=CON-GEN) — nunca ordenar por id, usar siempre esta constante.
 */
export const ORDEN_CARRERAS_LIBRO = ['CON-GEN', 'ADM-EMP', 'SIS-INF'];

/**
 * Índice de orden canónico de una carrera (0-based) para ordenar paralelos de
 * la generación masiva. Códigos desconocidos/ausentes van al final (mismo
 * índice, se desempatan alfabéticamente por el llamador).
 * @param {string|null|undefined} codigo
 * @returns {number}
 */
export function ordenCarreraLibro(codigo) {
  const idx = ORDEN_CARRERAS_LIBRO.indexOf(String(codigo ?? '').toUpperCase());
  return idx === -1 ? ORDEN_CARRERAS_LIBRO.length : idx;
}

export default {
  CODIGO_REGISTRO_INSTITUCIONAL,
  ESTUDIANTES_POR_FOLIO,
  ESTADOS_LIBRO,
  ESTADOS_LIBRO_VALUES,
  ESTADOS_FOLIO,
  ESTADOS_FOLIO_VALUES,
  TRANSICIONES_FOLIO,
  ESTADOS_ACADEMICOS_FOLIO,
  ESTADOS_ACADEMICOS_FOLIO_VALUES,
  LIBRO_REGISTRO_DOC,
  ORDEN_CARRERAS_LIBRO,
  ordenCarreraLibro,
};
