/**
 * Constantes del dominio Titulación (módulo TIT)
 *
 * Proyectos de grado: proyectos_grado (raíz legacy) + satélites tutoria_*
 * (schema 23). "Tutoría"/"tutor" aquí es vocabulario de negocio legítimo (el
 * rol de acompañamiento académico dentro de UN proyecto de grado), no el
 * nombre del módulo.
 *
 * Nota (2026-07-31): este archivo se llamó `tutorias.constants.js` y el
 * módulo era TUT. Ese rename (titulación) estuvo documentado como "código no
 * cambia" — decisión REVERTIDA en esta fecha: el módulo pasa a TIT y el
 * sub-grupo Acompañamiento (antes aquí mismo) se reclasificó al dominio
 * ACADEMICO; sus constantes de sesión de refuerzo viven ahora en
 * `academico.acompanamiento.constants.js`.
 */

// ============================================
// PROYECTOS DE GRADO (tabla `proyectos_grado`, 22-modalidades-grado.sql)
// ============================================

/**
 * Estados del proyecto de grado (máquina de estados de titulación).
 */
export const ESTADOS_PROYECTO_GRADO = {
  PERFIL: 'PERFIL',
  APROBADO_PERFIL: 'APROBADO_PERFIL',
  DESARROLLO: 'DESARROLLO',
  PREDEFENSA: 'PREDEFENSA',
  APROBADO_PREDEFENSA: 'APROBADO_PREDEFENSA',
  DEFENSA: 'DEFENSA',
  APROBADO: 'APROBADO',
  REPROBADO: 'REPROBADO',
  CANCELADO: 'CANCELADO',
};

export const ESTADOS_PROYECTO_GRADO_VALUES = Object.values(ESTADOS_PROYECTO_GRADO);

/**
 * Estados en los que el proyecto se considera VIGENTE (en curso).
 * Regla de negocio: un estudiante solo puede ser integrante ACTIVO de UN
 * proyecto vigente a la vez.
 */
export const ESTADOS_PROYECTO_GRADO_VIGENTES = [
  ESTADOS_PROYECTO_GRADO.PERFIL,
  ESTADOS_PROYECTO_GRADO.APROBADO_PERFIL,
  ESTADOS_PROYECTO_GRADO.DESARROLLO,
  ESTADOS_PROYECTO_GRADO.PREDEFENSA,
  ESTADOS_PROYECTO_GRADO.APROBADO_PREDEFENSA,
  ESTADOS_PROYECTO_GRADO.DEFENSA,
];

/**
 * Transiciones válidas de la máquina de estados del proyecto
 * (POST /proyectos-grado/:id/transiciones). Desde cualquier estado vigente
 * se puede CANCELAR.
 */
export const TRANSICIONES_PROYECTO_GRADO = {
  [ESTADOS_PROYECTO_GRADO.PERFIL]: [
    ESTADOS_PROYECTO_GRADO.APROBADO_PERFIL,
    ESTADOS_PROYECTO_GRADO.CANCELADO,
  ],
  [ESTADOS_PROYECTO_GRADO.APROBADO_PERFIL]: [
    ESTADOS_PROYECTO_GRADO.DESARROLLO,
    ESTADOS_PROYECTO_GRADO.CANCELADO,
  ],
  [ESTADOS_PROYECTO_GRADO.DESARROLLO]: [
    ESTADOS_PROYECTO_GRADO.PREDEFENSA,
    ESTADOS_PROYECTO_GRADO.CANCELADO,
  ],
  [ESTADOS_PROYECTO_GRADO.PREDEFENSA]: [
    ESTADOS_PROYECTO_GRADO.APROBADO_PREDEFENSA,
    ESTADOS_PROYECTO_GRADO.CANCELADO,
  ],
  [ESTADOS_PROYECTO_GRADO.APROBADO_PREDEFENSA]: [
    ESTADOS_PROYECTO_GRADO.DEFENSA,
    ESTADOS_PROYECTO_GRADO.CANCELADO,
  ],
  [ESTADOS_PROYECTO_GRADO.DEFENSA]: [
    ESTADOS_PROYECTO_GRADO.APROBADO,
    ESTADOS_PROYECTO_GRADO.REPROBADO,
    ESTADOS_PROYECTO_GRADO.CANCELADO,
  ],
  [ESTADOS_PROYECTO_GRADO.APROBADO]: [],
  [ESTADOS_PROYECTO_GRADO.REPROBADO]: [],
  [ESTADOS_PROYECTO_GRADO.CANCELADO]: [],
};

// ============================================
// MODALIDADES DE GRADO (tabla `modalidades_grado`)
// ============================================

/**
 * Código de la ÚNICA modalidad grupal (Proyecto Socio-comunitario Productivo).
 * La tabla no tiene flag de grupalidad: el criterio es el código.
 */
export const MODALIDAD_GRUPAL_CODIGO = 'PSP';

// ============================================
// INTEGRANTES (tabla `integrantes_proyecto`)
// ============================================

export const ROLES_INTEGRANTE_TUTORIA = {
  TITULAR: 'TITULAR',
  INTEGRANTE: 'INTEGRANTE',
};

export const ROLES_INTEGRANTE_TUTORIA_VALUES = Object.values(ROLES_INTEGRANTE_TUTORIA);

export const ESTADOS_INTEGRANTE_TUTORIA = {
  ACTIVO: 'ACTIVO',
  RETIRADO: 'RETIRADO',
};

export const ESTADOS_INTEGRANTE_TUTORIA_VALUES = Object.values(ESTADOS_INTEGRANTE_TUTORIA);

// ============================================
// AVANCES (tabla `avances_proyecto`)
// ============================================

export const ESTADOS_REVISION_AVANCE = {
  PENDIENTE_REVISION: 'PENDIENTE_REVISION',
  OBSERVADO: 'OBSERVADO',
  SUBSANADO: 'SUBSANADO',
  APROBADO: 'APROBADO',
};

export const ESTADOS_REVISION_AVANCE_VALUES = Object.values(ESTADOS_REVISION_AVANCE);

// ============================================
// BITÁCORA (tabla `bitacora_proyecto`)
// ============================================

export const TIPOS_BITACORA_TUTORIA = {
  REUNION: 'REUNION',
  REVISION_AVANCE: 'REVISION_AVANCE',
};

export const TIPOS_BITACORA_TUTORIA_VALUES = Object.values(TIPOS_BITACORA_TUTORIA);

export const ESTADOS_BITACORA_TUTORIA = {
  PENDIENTE: 'PENDIENTE',
  SUBSANADO: 'SUBSANADO',
};

export const ESTADOS_BITACORA_TUTORIA_VALUES = Object.values(ESTADOS_BITACORA_TUTORIA);

// ============================================
// DICTÁMENES (tabla `dictamenes_proyecto`)
// ============================================

export const TIPOS_DICTAMEN_TUTORIA = {
  VIABILIDAD_TECNICA: 'VIABILIDAD_TECNICA',
  DESIGNACION_OFICIAL: 'DESIGNACION_OFICIAL',
};

export const TIPOS_DICTAMEN_TUTORIA_VALUES = Object.values(TIPOS_DICTAMEN_TUTORIA);

export const RESULTADOS_DICTAMEN_TUTORIA = {
  APROBADO: 'APROBADO',
  OBSERVADO: 'OBSERVADO',
  RECHAZADO: 'RECHAZADO',
};

export const RESULTADOS_DICTAMEN_TUTORIA_VALUES = Object.values(RESULTADOS_DICTAMEN_TUTORIA);
