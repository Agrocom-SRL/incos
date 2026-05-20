/**
 * Valores por defecto alineados con 13-evaluaciones.sql (tipos_evaluacion, configuracion_evaluacion).
 */

export const BIMESTRES = [1, 2, 3, 4];

export const COMPONENTES_EVALUACION = [
  { value: 'TEORICO', label: 'Teórico' },
  { value: 'PRACTICO', label: 'Práctico' },
];

export const CUOTA_DEFAULT = { teorico: 30, practico: 70 };

export const TIPOS_EVALUACION_SUGERIDOS = [
  { codigo: 'EXAMEN_PARCIAL', nombre: 'Examen parcial', ambito: 'BIMESTRE', componente: 'TEORICO' },
  { codigo: 'PRACTICO', nombre: 'Práctico', ambito: 'BIMESTRE', componente: 'PRACTICO' },
  { codigo: 'PROYECTO', nombre: 'Proyecto', ambito: 'BIMESTRE', componente: 'PRACTICO' },
  { codigo: 'EXPOSICION', nombre: 'Exposición', ambito: 'BIMESTRE', componente: 'TEORICO' },
  { codigo: 'TALLER', nombre: 'Taller', ambito: 'BIMESTRE', componente: 'PRACTICO' },
  { codigo: 'PROYECTO_FINAL_ANUAL', nombre: 'Proyecto final anual', ambito: 'MATERIA_COMPLETA' },
  { codigo: 'EXAMEN_FINAL_ANUAL', nombre: 'Examen final anual', ambito: 'MATERIA_COMPLETA' },
];

export function createEvaluacionDraft(overrides = {}) {
  const id = `ev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  return {
    id,
    nombre: '',
    tipoCodigo: 'EXAMEN_PARCIAL',
    componente: 'TEORICO',
    ambito: 'BIMESTRE',
    peso: 0,
    fecha: null,
    bimestre: 1,
    ...overrides,
  };
}

export function createPlanVacio() {
  return {
    version: 1,
    configured: false,
    cuotas: { ...CUOTA_DEFAULT },
    pesoBimestres: BIMESTRES.map((b) => ({ bimestre: b, peso: 25 })),
    evaluacionesPorBimestre: Object.fromEntries(BIMESTRES.map((b) => [b, []])),
    evaluacionesFinales: [],
    updatedAt: null,
  };
}
