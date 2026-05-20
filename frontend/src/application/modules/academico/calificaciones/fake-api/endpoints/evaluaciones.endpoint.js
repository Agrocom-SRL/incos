/**
 * Simula operaciones sobre evaluaciones y notas del cuaderno.
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

export function crearEvaluacion({
  cursoId,
  bimestre,
  tipoEvaluacionId,
  nombre,
  componente,
  peso,
  fecha = null,
}) {
  const cuaderno = fakeDatabase.cuadernos[cursoId];
  if (!cuaderno) {
    const err = new Error('CURSO_NOT_FOUND');
    err.code = 'CURSO_NOT_FOUND';
    throw err;
  }

  const bimestreNum = Number(bimestre);
  if (!cuaderno.evaluaciones[bimestreNum]) {
    cuaderno.evaluaciones[bimestreNum] = [];
  }

  const nueva = {
    id: `eval-${Date.now()}`,
    nombre: nombre.trim(),
    tipoEvaluacionId: Number(tipoEvaluacionId),
    componente,
    peso: Number(peso),
    fecha,
  };

  cuaderno.evaluaciones[bimestreNum].push(nueva);

  return { ...nueva };
}

export function editarEvaluacion({ cursoId, bimestre, evaluacionId, cambios }) {
  const cuaderno = fakeDatabase.cuadernos[cursoId];
  if (!cuaderno) {
    const err = new Error('CURSO_NOT_FOUND');
    err.code = 'CURSO_NOT_FOUND';
    throw err;
  }

  const lista = cuaderno.evaluaciones[Number(bimestre)] ?? [];
  const idx = lista.findIndex((e) => e.id === evaluacionId);
  if (idx === -1) {
    const err = new Error('EVALUACION_NOT_FOUND');
    err.code = 'EVALUACION_NOT_FOUND';
    throw err;
  }

  lista[idx] = {
    ...lista[idx],
    ...cambios,
    nombre: cambios.nombre != null ? String(cambios.nombre).trim() : lista[idx].nombre,
    peso: cambios.peso != null ? Number(cambios.peso) : lista[idx].peso,
    tipoEvaluacionId:
      cambios.tipoEvaluacionId != null
        ? Number(cambios.tipoEvaluacionId)
        : lista[idx].tipoEvaluacionId,
  };

  return { ...lista[idx] };
}

export function eliminarEvaluacion({ cursoId, bimestre, evaluacionId }) {
  const cuaderno = fakeDatabase.cuadernos[cursoId];
  if (!cuaderno) {
    const err = new Error('CURSO_NOT_FOUND');
    err.code = 'CURSO_NOT_FOUND';
    throw err;
  }

  const lista = cuaderno.evaluaciones[Number(bimestre)] ?? [];
  const idx = lista.findIndex((e) => e.id === evaluacionId);
  if (idx === -1) {
    const err = new Error('EVALUACION_NOT_FOUND');
    err.code = 'EVALUACION_NOT_FOUND';
    throw err;
  }

  lista.splice(idx, 1);

  let deletedNotasCount = 0;
  const sufijo = `::${evaluacionId}`;
  Object.keys(cuaderno.notas).forEach((key) => {
    if (key.endsWith(sufijo)) {
      delete cuaderno.notas[key];
      deletedNotasCount += 1;
    }
  });

  return { deletedEvaluacionId: evaluacionId, deletedNotasCount };
}
