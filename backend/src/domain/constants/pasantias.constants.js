/**
 * Constantes del dominio Pasantías / Práctica Laboral (módulo TUT · Titulación)
 *
 * Base: schema 24-pasantias.sql (pasantias_empresas, pasantias,
 * pasantias_informes, pasantias_seguimientos) y R.M. 487/2023 (la práctica
 * laboral exige entre 300 y 360 horas, bajo informes de supervisión).
 *
 * Dos caminos de cumplimiento:
 * - PASANTIA: práctica nueva con verificación previa de la empresa.
 * - CONVALIDACION: el estudiante ya trabaja y convalida su experiencia
 *   (FORMATO DE CONVALIDACIÓN DE CERTIFICADO DE TRABAJO).
 */

// ============================================
// PASANTÍAS (tabla `pasantias`)
// ============================================

/** Caminos de cumplimiento de la práctica laboral. */
export const TIPOS_PASANTIA = {
  PASANTIA: 'PASANTIA',
  CONVALIDACION: 'CONVALIDACION',
};

export const TIPOS_PASANTIA_VALUES = Object.values(TIPOS_PASANTIA);

/** Estados del trámite de pasantía. */
export const ESTADOS_PASANTIA = {
  SOLICITADA: 'SOLICITADA',
  EN_CURSO: 'EN_CURSO',
  FINALIZADA: 'FINALIZADA',
  CONVALIDADA: 'CONVALIDADA',
  RECHAZADA: 'RECHAZADA',
  CANCELADA: 'CANCELADA',
};

export const ESTADOS_PASANTIA_VALUES = Object.values(ESTADOS_PASANTIA);

/**
 * Estados en los que el trámite se considera VIGENTE (en curso).
 * Regla de negocio: un estudiante solo puede tener UN trámite vigente a la vez.
 */
export const ESTADOS_PASANTIA_VIGENTES = [
  ESTADOS_PASANTIA.SOLICITADA,
  ESTADOS_PASANTIA.EN_CURSO,
];

/**
 * Transiciones válidas de la máquina de estados, POR CAMINO
 * (POST /pasantias/:id/transiciones). La transición se valida contra el
 * `tipo` del trámite: una CONVALIDACION nunca pasa a EN_CURSO/FINALIZADA
 * y una PASANTIA nunca pasa a CONVALIDADA.
 */
export const TRANSICIONES_PASANTIA = {
  [TIPOS_PASANTIA.PASANTIA]: {
    [ESTADOS_PASANTIA.SOLICITADA]: [ESTADOS_PASANTIA.EN_CURSO, ESTADOS_PASANTIA.RECHAZADA],
    [ESTADOS_PASANTIA.EN_CURSO]: [ESTADOS_PASANTIA.FINALIZADA, ESTADOS_PASANTIA.CANCELADA],
    [ESTADOS_PASANTIA.FINALIZADA]: [],
    [ESTADOS_PASANTIA.RECHAZADA]: [],
    [ESTADOS_PASANTIA.CANCELADA]: [],
  },
  [TIPOS_PASANTIA.CONVALIDACION]: {
    [ESTADOS_PASANTIA.SOLICITADA]: [ESTADOS_PASANTIA.CONVALIDADA, ESTADOS_PASANTIA.RECHAZADA],
    [ESTADOS_PASANTIA.CONVALIDADA]: [],
    [ESTADOS_PASANTIA.RECHAZADA]: [],
  },
};

/** Horas laborales requeridas según R.M. 487/2023 (validación de aplicación). */
export const HORAS_PASANTIA_MIN = 300;
export const HORAS_PASANTIA_MAX = 360;

/** Tipos de contrato del camino CONVALIDACION (NULL en pasantía nueva). */
export const TIPOS_CONTRATO_PASANTIA = {
  PERMANENTE: 'PERMANENTE',
  OTRO: 'OTRO',
};

export const TIPOS_CONTRATO_PASANTIA_VALUES = Object.values(TIPOS_CONTRATO_PASANTIA);

// ============================================
// EMPRESAS (tabla `pasantias_empresas`)
// ============================================

/** Tipo societario (checkboxes del informe de verificación). */
export const TIPOS_SOCIETARIO_EMPRESA = {
  UNIPERSONAL: 'UNIPERSONAL',
  SRL: 'SRL',
  SA: 'SA',
  PUBLICA: 'PUBLICA',
  OTRO: 'OTRO',
};

export const TIPOS_SOCIETARIO_EMPRESA_VALUES = Object.values(TIPOS_SOCIETARIO_EMPRESA);

// ============================================
// INFORMES (tabla `pasantias_informes`)
// ============================================

export const TIPOS_INFORME_PASANTIA = {
  VERIFICACION_EMPRESA: 'VERIFICACION_EMPRESA',
  CONVALIDACION_TRABAJO: 'CONVALIDACION_TRABAJO',
};

export const TIPOS_INFORME_PASANTIA_VALUES = Object.values(TIPOS_INFORME_PASANTIA);

/**
 * Coherencia camino ↔ informe: VERIFICACION_EMPRESA solo aplica a trámites
 * PASANTIA; CONVALIDACION_TRABAJO solo a trámites CONVALIDACION.
 */
export const TIPO_INFORME_POR_TIPO_PASANTIA = {
  [TIPOS_PASANTIA.PASANTIA]: TIPOS_INFORME_PASANTIA.VERIFICACION_EMPRESA,
  [TIPOS_PASANTIA.CONVALIDACION]: TIPOS_INFORME_PASANTIA.CONVALIDACION_TRABAJO,
};

export const RESULTADOS_INFORME_PASANTIA = {
  VIABLE: 'VIABLE',
  NO_VIABLE: 'NO_VIABLE',
};

export const RESULTADOS_INFORME_PASANTIA_VALUES = Object.values(RESULTADOS_INFORME_PASANTIA);

// ============================================
// SEGUIMIENTOS (tabla `pasantias_seguimientos`)
// ============================================

/** Nivel de desempeño — escala única del FORMULARIO DE SEGUIMIENTO DE PASANTÍA. */
export const NIVELES_DESEMPENO_PASANTIA = {
  ALTO: 'ALTO',
  MEDIO: 'MEDIO',
  BAJO: 'BAJO',
};

export const NIVELES_DESEMPENO_PASANTIA_VALUES = Object.values(NIVELES_DESEMPENO_PASANTIA);

// ============================================
// AUTORIDADES INSTITUCIONALES (encabezado A/VIA de los informes)
// ============================================

/**
 * Destinatarios fijos del informe (A: Rector, VIA: Dirección Académica) —
 * NO se piden en el formulario: son cargos institucionales, no datos del
 * trámite. Cambian solo si cambia la autoridad; en ese caso se edita aquí.
 */
export const AUTORIDAD_RECTOR_INCOS = {
  nombre: 'Lic. Víctor Hugo Bejarano Rendón',
  cargo: 'RECTOR - INSTITUTO TÉCNICO INCOS SANTA CRUZ',
};

export const AUTORIDAD_DIRECTORA_ACADEMICA_INCOS = {
  nombre: 'Lic. Lidia Ordoñez Cuenca',
  cargo: 'DIRECTORA ACADÉMICA INSTITUTO TÉCNICO INCOS SANTA CRUZ',
};
