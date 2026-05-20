/**
 * Simula GET /api/mis-cursos
 */

import { fakeDatabase } from '../fakeDatabase.js';

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

export function obtenerMisCursos() {
  const { docenteActual, cursos } = fakeDatabase;
  const bimestreVigente = docenteActual.bimestreVigente;

  return {
    docente: {
      id: docenteActual.id,
      nombre: docenteActual.nombre,
      gestionVigente: docenteActual.gestionVigente,
      bimestreVigente,
    },
    cursos: cursos.map((c) => ({
      id: c.id,
      materia: c.materia,
      paralelo: c.paralelo,
      turno: c.turno,
      horasSemana: c.horasSemana,
      estudiantes: c.cantidadEstudiantes,
      badge: buildBadge(c, bimestreVigente),
      notasPendientes: c.notasPendientes,
    })),
  };
}
