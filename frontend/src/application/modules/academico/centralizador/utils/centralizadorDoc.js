/**
 * Constantes institucionales del documento "Centralizador de calificaciones".
 *
 * Son metadatos de la cabecera del documento oficial que NO viven en el sistema
 * (no hay tabla/endpoint que los provea). Se centralizan aquí en vez de
 * incrustarlos en el JSX para que sean parametrizables el día que el instituto
 * los gestione desde Configuración.
 *
 * LIBRO N° / FOLIO N° SÍ existen en el sistema (módulo Libros de registro,
 * schema 25 · `academico.libro`): el Centralizador anual (P2) los muestra vía
 * el bloque `libro` de `GET /calificaciones/centralizador` cuando el paralelo
 * ya tiene folios generados — `null` mientras no los tenga (nunca un
 * placeholder inventado aquí). Ver `CentralizadorLibroBadge`.
 */

export const CENTRALIZADOR_DOC = {
  /** Razón social del instituto (parametrizable a futuro desde Configuración). */
  institucion: 'Instituto Técnico INCOS Santa Cruz',
  /** Nivel de formación (parametrizable). */
  nivel: 'Técnico Superior',
  /** Régimen académico — el grano del sistema es anual. */
  regimen: 'Anual',
  /** Resolución Ministerial de habilitación (parametrizable). */
  resolucionMinisterial: '0426/2016',
};

/**
 * Nombres literales de los bimestres del régimen anual.
 * Reflejan el seeder `02-seeders/18-seed-periodos_academicos.sql`
 * (división BIMESTRE, numero_orden 1..4). Índice 0 = 1.er bimestre.
 */
export const BIMESTRE_NOMBRES = [
  'Primer Bimestre',
  'Segundo Bimestre',
  'Tercer Bimestre',
  'Cuarto Bimestre',
];

/** Nombre literal del bimestre por número (1..4); '' si fuera de rango. */
export const nombreBimestre = (numero) => BIMESTRE_NOMBRES[Number(numero) - 1] ?? '';

/**
 * Color de negocio de cada bimestre del régimen anual. Espejo de la columna
 * `color_hex` del seeder `02-seeders/18-seed-periodos_academicos.sql`
 * (división BIMESTRE, numero_orden 1..4). Índice 0 = 1.er bimestre.
 */
export const BIMESTRE_COLORES = ['#2196F3', '#FF9800', '#9C27B0', '#F44336'];

/** Color hex del bimestre por número (1..4); null si fuera de rango. */
export const colorBimestre = (numero) => BIMESTRE_COLORES[Number(numero) - 1] ?? null;

export default CENTRALIZADOR_DOC;
