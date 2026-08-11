/**
 * Vocabularios del dominio Pasantías (TIT) → etiqueta legible + clase de
 * StatusPill.
 *
 * Mismo enfoque que `titulacionPills` (proyectos de grado): clases GLOBALES
 * `cfg-materia-pill--*` (styles/components/atoms/table-cells.css), sin CSS
 * propio del módulo. Espejo de `pasantias.constants.js` del backend
 * (schema 24, R.M. 487/2023). Vocabularios:
 *   - CAMINO del trámite (ENUM pasantias.tipo: PASANTIA | CONVALIDACION)
 *   - ESTADO del trámite (ENUM pasantias.estado, máquina por camino)
 *   - TIPO SOCIETARIO de la empresa (ENUM pasantias_empresas.tipo_societario)
 *   - TIPO DE CONTRATO (ENUM pasantias.tipo_contrato, solo CONVALIDACION)
 *   - TIPO y RESULTADO del informe (ENUMs pasantias_informes)
 *   - NIVEL DE DESEMPEÑO del seguimiento (ENUM pasantias_seguimientos)
 *
 * Semántica de color del kit: SOLICITADA = ámbar (warning), EN_CURSO = azul
 * de proceso (primary), FINALIZADA/CONVALIDADA = verde (success), RECHAZADA
 * = rojo semántico del theme (danger), CANCELADA = gris (inactiva).
 */

/** Caminos de cumplimiento de la práctica laboral (ENUM pasantias.tipo). */
export const TIPOS_PASANTIA = ['PASANTIA', 'CONVALIDACION'];

const TIPO_PASANTIA_META = {
  PASANTIA: { label: 'Pasantía', pill: 'cfg-materia-pill--info' },
  CONVALIDACION: { label: 'Convalidación', pill: 'cfg-materia-pill--primary' },
};

/** Etiqueta legible del camino del trámite. */
export const formatTipoPasantia = (tipo) => TIPO_PASANTIA_META[tipo]?.label ?? tipo ?? '—';

/** Clase completa del StatusPill para el camino del trámite. */
export const getTipoPasantiaPillClass = (tipo) =>
  `cfg-materia-pill ${TIPO_PASANTIA_META[tipo]?.pill ?? 'cfg-materia-pill--default'}`;

/** Opciones del select/filtro de camino. */
export const TIPO_PASANTIA_OPTIONS = TIPOS_PASANTIA.map((tipo) => ({
  value: tipo,
  label: formatTipoPasantia(tipo),
}));

/** ENUM del backend (pasantias.estado). */
export const ESTADOS_PASANTIA = [
  'SOLICITADA',
  'EN_CURSO',
  'FINALIZADA',
  'CONVALIDADA',
  'RECHAZADA',
  'CANCELADA',
];

const PASANTIA_ESTADO_META = {
  SOLICITADA: { label: 'Solicitada', pill: 'cfg-materia-pill--warning' },
  EN_CURSO: { label: 'En curso', pill: 'cfg-materia-pill--primary' },
  FINALIZADA: { label: 'Finalizada', pill: 'cfg-materia-pill--success' },
  CONVALIDADA: { label: 'Convalidada', pill: 'cfg-materia-pill--success' },
  RECHAZADA: { label: 'Rechazada', pill: 'cfg-materia-pill--danger' },
  CANCELADA: { label: 'Cancelada', pill: 'cfg-materia-pill--inactiva' },
};

/** Etiqueta legible del estado del trámite. */
export const formatEstadoPasantia = (estado) => PASANTIA_ESTADO_META[estado]?.label ?? estado ?? '—';

/** Clase completa del StatusPill para el estado del trámite. */
export const getEstadoPasantiaPillClass = (estado) =>
  `cfg-materia-pill ${PASANTIA_ESTADO_META[estado]?.pill ?? 'cfg-materia-pill--default'}`;

/** Opciones del filtro de estado del listado. */
export const ESTADO_PASANTIA_OPTIONS = ESTADOS_PASANTIA.map((estado) => ({
  value: estado,
  label: formatEstadoPasantia(estado),
}));

/**
 * Transiciones válidas de la máquina de estados, POR CAMINO (P6). El backend
 * es la autoridad; esta tabla alimenta `PasantiaTimeline` (línea de tiempo de
 * solo lectura de la ficha). Una CONVALIDACION nunca pasa a EN_CURSO/
 * FINALIZADA y una PASANTIA nunca a CONVALIDADA.
 */
export const TRANSICIONES_PASANTIA = {
  PASANTIA: {
    SOLICITADA: ['EN_CURSO', 'RECHAZADA'],
    EN_CURSO: ['FINALIZADA', 'CANCELADA'],
    FINALIZADA: [],
    RECHAZADA: [],
    CANCELADA: [],
  },
  CONVALIDACION: {
    SOLICITADA: ['CONVALIDADA', 'RECHAZADA'],
    CONVALIDADA: [],
    RECHAZADA: [],
  },
};

/**
 * Explicación de la consecuencia de CADA transición del modal genérico
 * (`TransicionPasantiaModal`), espejo exacto de `TransicionarPasantiaUseCase`
 * (P6, backend). Se muestra en el modal ANTES de confirmar.
 */
const EXPLICACION_TRANSICION_PASANTIA = {
  EN_CURSO:
    'El trámite pasa a estar en curso; el estudiante puede comenzar a registrar horas de la práctica laboral.',
  FINALIZADA:
    'Esta acción cierra la pasantía. Solo se puede finalizar cuando las horas cumplidas alcanzan las horas requeridas.',
  CONVALIDADA:
    'Esta acción convalida el trámite: se considera cumplida la práctica laboral por convalidación.',
  RECHAZADA: 'Esta acción rechaza la solicitud de forma definitiva: no admite más transiciones.',
  CANCELADA: 'Esta acción cancela el trámite de forma definitiva: no admite más transiciones.',
};

/** Texto de consecuencia de una transición del trámite, o `null` si no aplica. */
export const formatExplicacionTransicionPasantia = (estado) =>
  EXPLICACION_TRANSICION_PASANTIA[estado] ?? null;

/** Destinos irreversibles: exigen confirmación adicional antes de registrar (regla A5). */
export const ESTADOS_TRANSICION_PASANTIA_IRREVERSIBLES = ['RECHAZADA', 'CANCELADA'];

/** Horas laborales requeridas según R.M. 487/2023 (validación del formulario). */
export const HORAS_PASANTIA_MIN = 300;
export const HORAS_PASANTIA_MAX = 360;

/** ENUM del backend (pasantias_empresas.tipo_societario). */
const TIPO_SOCIETARIO_META = {
  UNIPERSONAL: 'Unipersonal',
  SRL: 'S.R.L.',
  SA: 'S.A.',
  PUBLICA: 'Pública',
  OTRO: 'Otro',
};

/** Etiqueta legible del tipo societario de la empresa. */
export const formatTipoSocietario = (tipo) => TIPO_SOCIETARIO_META[tipo] ?? tipo ?? '—';

/** Opciones del select de tipo societario. */
export const TIPO_SOCIETARIO_OPTIONS = Object.keys(TIPO_SOCIETARIO_META).map((tipo) => ({
  value: tipo,
  label: formatTipoSocietario(tipo),
}));

/** ENUM del backend (pasantias.tipo_contrato, solo camino CONVALIDACION). */
const TIPO_CONTRATO_META = {
  PERMANENTE: 'Permanente',
  OTRO: 'Otro',
};

/** Etiqueta legible del tipo de contrato (camino CONVALIDACION). */
export const formatTipoContrato = (tipo) => TIPO_CONTRATO_META[tipo] ?? tipo ?? '—';

/** Opciones del select de tipo de contrato. */
export const TIPO_CONTRATO_OPTIONS = Object.keys(TIPO_CONTRATO_META).map((tipo) => ({
  value: tipo,
  label: formatTipoContrato(tipo),
}));

/** ENUM del backend (pasantias_informes.tipo). */
const TIPO_INFORME_META = {
  VERIFICACION_EMPRESA: 'Verificación de empresa',
  CONVALIDACION_TRABAJO: 'Convalidación de certificado de trabajo',
};

/** Etiqueta legible del tipo de informe. */
export const formatTipoInforme = (tipo) => TIPO_INFORME_META[tipo] ?? tipo ?? '—';

/**
 * Coherencia camino ↔ informe (regla del backend): VERIFICACION_EMPRESA solo
 * aplica a trámites PASANTIA; CONVALIDACION_TRABAJO solo a CONVALIDACION.
 */
export const TIPO_INFORME_POR_TIPO_PASANTIA = {
  PASANTIA: 'VERIFICACION_EMPRESA',
  CONVALIDACION: 'CONVALIDACION_TRABAJO',
};

/** ENUM del backend (pasantias_informes.resultado). */
const RESULTADO_INFORME_META = {
  VIABLE: { label: 'Viable', pill: 'cfg-materia-pill--success' },
  NO_VIABLE: { label: 'No viable', pill: 'cfg-materia-pill--danger' },
};

/** Etiqueta legible del resultado del informe (NULL mientras no se dictamina). */
export const formatResultadoInforme = (resultado) =>
  RESULTADO_INFORME_META[resultado]?.label ?? resultado ?? '—';

/** Clase completa del StatusPill para el resultado del informe. */
export const getResultadoInformePillClass = (resultado) =>
  `cfg-materia-pill ${RESULTADO_INFORME_META[resultado]?.pill ?? 'cfg-materia-pill--default'}`;

/** Opciones del select de resultado del informe. */
export const RESULTADO_INFORME_OPTIONS = Object.keys(RESULTADO_INFORME_META).map((resultado) => ({
  value: resultado,
  label: formatResultadoInforme(resultado),
}));

/** ENUM del backend (pasantias_seguimientos.nivel_desempeno). */
export const NIVELES_DESEMPENO = ['ALTO', 'MEDIO', 'BAJO'];

const NIVEL_DESEMPENO_META = {
  ALTO: { label: 'Alto', pill: 'cfg-materia-pill--success' },
  MEDIO: { label: 'Medio', pill: 'cfg-materia-pill--warning' },
  BAJO: { label: 'Bajo', pill: 'cfg-materia-pill--danger' },
};

/** Etiqueta legible del nivel de desempeño del seguimiento. */
export const formatNivelDesempeno = (nivel) => NIVEL_DESEMPENO_META[nivel]?.label ?? nivel ?? '—';

/** Clase completa del StatusPill para el nivel de desempeño. */
export const getNivelDesempenoPillClass = (nivel) =>
  `cfg-materia-pill ${NIVEL_DESEMPENO_META[nivel]?.pill ?? 'cfg-materia-pill--default'}`;

/** Opciones del select de nivel de desempeño (hoja de seguimiento). */
export const NIVEL_DESEMPENO_OPTIONS = NIVELES_DESEMPENO.map((nivel) => ({
  value: nivel,
  label: formatNivelDesempeno(nivel),
}));
