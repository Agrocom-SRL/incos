/**
 * Simula PUT /api/evaluaciones/:id/nota
 */

import { fakeDatabase, notaKey } from '../fakeDatabase.js';

export function actualizarNota({ cursoId, estudianteId, evaluacionId, valor }) {
  const cuaderno = fakeDatabase.cuadernos[cursoId];
  if (!cuaderno) {
    const err = new Error('CURSO_NOT_FOUND');
    err.code = 'CURSO_NOT_FOUND';
    throw err;
  }

  const key = notaKey(estudianteId, evaluacionId);

  if (valor == null || valor === '') {
    delete cuaderno.notas[key];
  } else {
    cuaderno.notas[key] = valor;
  }

  const actualizadoEn = new Date().toISOString();

  return {
    id: evaluacionId,
    estudianteId,
    valor: valor == null || valor === '' ? null : valor,
    actualizadoEn,
  };
}
