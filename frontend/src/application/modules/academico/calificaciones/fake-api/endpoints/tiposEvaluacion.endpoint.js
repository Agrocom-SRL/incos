/**
 * Simula GET /api/tipos-evaluacion?ambito=BIMESTRE
 */

import { fakeDatabase } from '../fakeDatabase.js';

export function obtenerTiposEvaluacion({ ambito = 'BIMESTRE' } = {}) {
  return fakeDatabase.tiposEvaluacion.filter((t) => t.ambito === ambito);
}
