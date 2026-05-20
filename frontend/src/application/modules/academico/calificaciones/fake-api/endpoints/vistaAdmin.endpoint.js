/**
 * Vista administrativa — listado de docentes e impersonación del cuaderno.
 */

import { fakeDatabase } from '../fakeDatabase.js';
import { obtenerContextoImpersonacion } from '../impersonacionAudit.js';

const BADGE_POR_ESTADO = {
  sin_evaluaciones: { tipo: 'sin-evaluaciones', texto: 'Sin evaluaciones' },
  en_curso: { tipo: 'en-curso', texto: null },
  cerrado: { tipo: 'cerrado', texto: null },
};

const buildBadge = (curso, bimestreVigente) => {
  const { estadoBimestreVigente } = curso;
  const base = BADGE_POR_ESTADO[estadoBimestreVigente] ?? BADGE_POR_ESTADO.en_curso;

  if (estadoBimestreVigente === 'en_curso') {
    const cuaderno = fakeDatabase.cuadernos[curso.id];
    const evals = cuaderno?.evaluaciones?.[bimestreVigente] ?? [];
    const texto =
      evals.length === 0
        ? 'Sin evaluaciones'
        : `B${bimestreVigente} · ${evals.length} evaluaciones`;
    return { tipo: 'en-curso', texto };
  }

  if (estadoBimestreVigente === 'cerrado') {
    return { tipo: 'cerrado', texto: `B${bimestreVigente} cerrado · prom 74` };
  }

  return { ...base, texto: base.texto ?? 'Sin evaluaciones' };
};

const resolverDocente = (docenteId) => {
  const id = Number(docenteId);
  const docente = fakeDatabase.docentesCatalog.find((d) => d.id === id);
  if (!docente) {
    const err = new Error('DOCENTE_NOT_FOUND');
    err.code = 'DOCENTE_NOT_FOUND';
    throw err;
  }
  return docente;
};

export function listarDocentesVistaAdmin() {
  const { docenteCursosMap } = fakeDatabase;

  return {
    gestionVigente: fakeDatabase.tablero.gestion.nombre,
    bimestreVigente: fakeDatabase.tablero.bimestreVigente,
    docentes: fakeDatabase.docentesCatalog.map((d) => ({
      id: d.id,
      nombre: d.nombre,
      especialidad: d.especialidad,
      cantidadCursos: (docenteCursosMap[d.id] ?? []).length,
    })),
  };
}

export function activarImpersonacion({ docenteId }) {
  const docente = resolverDocente(docenteId);
  const { adminActual } = fakeDatabase;

  fakeDatabase.impersonacion = {
    activa: true,
    docenteId: docente.id,
    docenteNombre: docente.nombre,
    adminId: adminActual.id,
    adminNombre: adminActual.nombre,
    iniciadaEn: new Date().toISOString(),
  };

  return {
    impersonacion: obtenerContextoImpersonacion(),
    docente: {
      id: docente.id,
      nombre: docente.nombre,
      gestionVigente: docente.gestionVigente,
      bimestreVigente: docente.bimestreVigente,
    },
  };
}

export function desactivarImpersonacion() {
  fakeDatabase.impersonacion = {
    activa: false,
    docenteId: null,
    docenteNombre: null,
    adminId: null,
    adminNombre: null,
    iniciadaEn: null,
  };
  return obtenerContextoImpersonacion();
}

export function obtenerCursosDocenteAdmin({ docenteId }) {
  const docente = resolverDocente(docenteId);
  activarImpersonacion({ docenteId: docente.id });

  const ids = fakeDatabase.docenteCursosMap[docente.id] ?? [];
  const bimestreVigente = docente.bimestreVigente;

  const cursos = fakeDatabase.cursos
    .filter((c) => ids.includes(c.id))
    .map((c) => ({
      id: c.id,
      materia: c.materia,
      paralelo: c.paralelo,
      turno: c.turno,
      horasSemana: c.horasSemana,
      estudiantes: c.cantidadEstudiantes,
      badge: buildBadge(c, bimestreVigente),
      notasPendientes: c.notasPendientes,
    }));

  return {
    docente: {
      id: docente.id,
      nombre: docente.nombre,
      gestionVigente: docente.gestionVigente,
      bimestreVigente,
    },
    cursos,
    impersonacion: obtenerContextoImpersonacion(),
  };
}
