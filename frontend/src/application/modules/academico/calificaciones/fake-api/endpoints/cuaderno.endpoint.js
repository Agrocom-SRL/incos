/**
 * Simula GET /api/cuaderno/:cursoId?bimestre=N
 */

import { fakeDatabase } from '../fakeDatabase.js';
import { notaKey } from '../fakeDatabase.js';

export function obtenerCuaderno({ cursoId, bimestre }) {
  const cursoMeta = fakeDatabase.cuadernos[cursoId];
  const cursoList = fakeDatabase.cursos.find((c) => c.id === cursoId);

  if (!cursoMeta || !cursoList) {
    const err = new Error('CURSO_NOT_FOUND');
    err.code = 'CURSO_NOT_FOUND';
    throw err;
  }

  const bimestreNum = Number(bimestre);
  const bimestreInfo = cursoMeta.bimestres.find((b) => b.numero === bimestreNum);
  if (!bimestreInfo) {
    const err = new Error('BIMESTRE_NOT_FOUND');
    err.code = 'BIMESTRE_NOT_FOUND';
    throw err;
  }

  const bimestreVigente = fakeDatabase.docenteActual.bimestreVigente;
  const evaluaciones = cursoMeta.evaluaciones[bimestreNum] ?? [];

  const estudiantes = cursoMeta.estudiantes.map((est) => {
    const notas = {};
    evaluaciones.forEach((ev) => {
      const key = notaKey(est.id, ev.id);
      notas[ev.id] = cursoMeta.notas[key] ?? null;
    });
    return { ...est, notas };
  });

  const modoEdicion =
    bimestreNum === bimestreVigente && bimestreInfo.estado === 'vigente';

  return {
    curso: {
      id: cursoList.id,
      materia: cursoList.materia,
      paralelo: cursoList.paralelo,
      turno: cursoList.turno,
      horasSemana: cursoList.horasSemana,
      estudiantes: cursoList.cantidadEstudiantes,
    },
    bimestreVigente,
    bimestreActivo: bimestreNum,
    bimestres: cursoMeta.bimestres,
    evaluaciones,
    estudiantes,
    modoEdicion,
  };
}
