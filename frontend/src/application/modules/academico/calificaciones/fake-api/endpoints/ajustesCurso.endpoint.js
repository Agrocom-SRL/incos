/**
 * Ajustes del curso (override cuota, finales, asistencia) — simula asignaciones_docentes.
 */

import { fakeDatabase } from '../fakeDatabase.js';

const DOCENTE_MOCK = {
  id: 1,
  nombre: 'María Fernández López',
};

function clonarAjustes(ajustes) {
  return {
    ...ajustes,
    evaluacionesFinales: ajustes.evaluacionesFinales.map((e) => ({ ...e })),
    historial: [...(ajustes.historial ?? [])],
  };
}

function crearAjustesPorDefecto() {
  const institucional = fakeDatabase.configuracionInstitucional;
  return {
    usarCuotaInstitucional: true,
    teoricoOverride: null,
    practicoOverride: null,
    evaluacionesFinales: institucional.evaluacionesFinalesDisponibles.map((t) => ({
      codigo: t.codigo,
      activo: false,
      peso: null,
    })),
    politicaAsistencia: institucional.politicaAsistenciaDefault.politica,
    pesoAsistencia: null,
    minimoAsistencia: null,
    notaReprobada: null,
    historial: [],
  };
}

function resolverCuotaEfectiva(ajustes) {
  const inst = fakeDatabase.configuracionInstitucional;
  if (ajustes.usarCuotaInstitucional) {
    return {
      teorico: inst.cuotaTeorico,
      practico: inst.cuotaPractico,
      esOverride: false,
    };
  }
  return {
    teorico: ajustes.teoricoOverride ?? inst.cuotaTeorico,
    practico: ajustes.practicoOverride ?? inst.cuotaPractico,
    esOverride: true,
  };
}

function tieneOverrides(ajustes) {
  const inst = fakeDatabase.configuracionInstitucional;
  const cuotaDistinta =
    !ajustes.usarCuotaInstitucional &&
    (ajustes.teoricoOverride !== inst.cuotaTeorico ||
      ajustes.practicoOverride !== inst.cuotaPractico);
  const finalesActivos = ajustes.evaluacionesFinales.some((e) => e.activo);
  const asistenciaDistinta =
    ajustes.politicaAsistencia !== inst.politicaAsistenciaDefault.politica ||
    ajustes.pesoAsistencia != null ||
    ajustes.minimoAsistencia != null ||
    ajustes.notaReprobada != null;
  return cuotaDistinta || finalesActivos || asistenciaDistinta;
}

export function obtenerAjustesCurso({ cursoId }) {
  const curso = fakeDatabase.cursos.find((c) => c.id === cursoId);
  if (!curso) {
    const err = new Error('CURSO_NOT_FOUND');
    err.code = 'CURSO_NOT_FOUND';
    throw err;
  }

  if (!fakeDatabase.ajustesCurso[cursoId]) {
    fakeDatabase.ajustesCurso[cursoId] = crearAjustesPorDefecto();
  }

  const institucional = fakeDatabase.configuracionInstitucional;
  const ajustes = clonarAjustes(fakeDatabase.ajustesCurso[cursoId]);

  return {
    cursoId,
    materia: curso.materia,
    gestionVigente: fakeDatabase.docenteActual.gestionVigente,
    institucional: {
      cuotaTeorico: institucional.cuotaTeorico,
      cuotaPractico: institucional.cuotaPractico,
      evaluacionesFinalesDisponibles: institucional.evaluacionesFinalesDisponibles.map(
        (t) => ({ ...t }),
      ),
      politicaAsistenciaDefault: { ...institucional.politicaAsistenciaDefault },
    },
    ajustes,
    cuotaEfectiva: resolverCuotaEfectiva(ajustes),
    tieneOverrides: tieneOverrides(ajustes),
    ultimaModificacion: ajustes.historial[0] ?? null,
  };
}

export function guardarAjustesCurso({ cursoId, cambios }) {
  const curso = fakeDatabase.cursos.find((c) => c.id === cursoId);
  if (!curso) {
    const err = new Error('CURSO_NOT_FOUND');
    err.code = 'CURSO_NOT_FOUND';
    throw err;
  }

  if (!fakeDatabase.ajustesCurso[cursoId]) {
    fakeDatabase.ajustesCurso[cursoId] = crearAjustesPorDefecto();
  }

  const previo = fakeDatabase.ajustesCurso[cursoId];
  const siguiente = {
    ...previo,
    ...cambios,
    evaluacionesFinales:
      cambios.evaluacionesFinales ?? previo.evaluacionesFinales,
    historial: [...(previo.historial ?? [])],
  };

  const entradaHistorial = {
    updatedAt: new Date().toISOString(),
    updatedBy: DOCENTE_MOCK.id,
    updatedByNombre: DOCENTE_MOCK.nombre,
    resumen: 'Ajustes del curso actualizados',
  };

  siguiente.historial = [entradaHistorial, ...siguiente.historial].slice(0, 10);
  fakeDatabase.ajustesCurso[cursoId] = siguiente;

  return obtenerAjustesCurso({ cursoId });
}
