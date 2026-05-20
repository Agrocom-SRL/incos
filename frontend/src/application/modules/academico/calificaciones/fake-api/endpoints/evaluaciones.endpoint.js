/**
 * Simula operaciones sobre evaluaciones y notas del cuaderno.
 */

import { fakeDatabase, notaKey } from '../fakeDatabase.js';
import { registrarAuditoriaSiImpersona } from '../impersonacionAudit.js';

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

  registrarAuditoriaSiImpersona('ACTUALIZAR_NOTA', {
    cursoId,
    estudianteId,
    evaluacionId,
    valor,
  });

  return {
    id: evaluacionId,
    estudianteId,
    valor: valor == null || valor === '' ? null : valor,
    actualizadoEn,
    actualizadoPor: fakeDatabase.impersonacion.activa
      ? fakeDatabase.impersonacion.adminNombre
      : fakeDatabase.docenteActual.nombre,
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

  registrarAuditoriaSiImpersona('CREAR_EVALUACION', { cursoId, bimestre: bimestreNum, evaluacionId: nueva.id });

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

  registrarAuditoriaSiImpersona('EDITAR_EVALUACION', { cursoId, evaluacionId, cambios });

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

  registrarAuditoriaSiImpersona('ELIMINAR_EVALUACION', { cursoId, evaluacionId });

  return { deletedEvaluacionId: evaluacionId, deletedNotasCount };
}
