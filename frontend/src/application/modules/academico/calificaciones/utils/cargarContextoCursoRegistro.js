/**
 * Contexto de curso para cuaderno / bimestre consolidado desde GET registro de notas (una sola lectura).
 */

import { useCasesFactory } from '@container';
import { mapBimestresCalendario } from './bimestrePlazoUtils.js';

export const mapEstudiantesRegistroBase = (filas = []) =>
  filas.map((e, index) => ({
    id: e.id,
    nro: e.nro ?? index + 1,
    codigo: e.codigo ?? '',
    nombre: e.nombre ?? '',
    notas: {},
  }));

/**
 * @param {number|string} asignacionId
 * @returns {Promise<{
 *   docente: object,
 *   curso: object,
 *   estudiantesBase: Array,
 *   bimestresCalendario: Array,
 *   gestionFechas: object|null,
 *   bimestreVigente: number,
 * }>}
 */
export async function cargarContextoCursoRegistro(asignacionId) {
  const ucRegistro = useCasesFactory.obtenerRegistroNotasCurso();
  const resRegistro = await ucRegistro.ejecutar(asignacionId);

  if (!resRegistro?.success) {
    const err = new Error(resRegistro?.error || 'No se pudo cargar el registro del curso');
    if (/not found|no encontr/i.test(String(resRegistro?.error ?? ''))) {
      err.code = 'CURSO_NOT_FOUND';
    }
    throw err;
  }

  const data = resRegistro.data ?? {};
  const docente = data.docente ?? null;
  const curso = data.curso ?? null;

  if (!docente?.id || !curso?.id) {
    const err = new Error('CURSO_NOT_FOUND');
    err.code = 'CURSO_NOT_FOUND';
    throw err;
  }

  return {
    docente,
    curso,
    estudiantesBase: mapEstudiantesRegistroBase(data.estudiantes),
    bimestresCalendario: mapBimestresCalendario(data.bimestresCalendario),
    gestionFechas: data.gestion ?? null,
    bimestreVigente: Number(docente.bimestreVigente) || 1,
  };
}
