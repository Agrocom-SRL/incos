/**
 * Mock de cursos del docente — reemplazar por API en Fase 2.
 */

export const MOCK_DOCENTE = {
  nombre: 'María Fernández López',
  gestionLabel: 'Gestión 2025',
  bimestreVigente: 2,
};

export const MOCK_CURSOS = [
  {
    id: 'asig-101',
    materia: 'Programación Web I',
    paralelo: 'A',
    turno: 'Mañana',
    horasSemana: 6,
    estudiantes: 28,
    badge: { tipo: 'sin-evaluaciones', texto: 'Sin evaluaciones' },
    notasPendientes: 28,
  },
  {
    id: 'asig-102',
    materia: 'Bases de datos',
    paralelo: 'B',
    turno: 'Tarde',
    horasSemana: 4,
    estudiantes: 22,
    badge: { tipo: 'en-curso', texto: 'B2 · 3 evaluaciones' },
    notasPendientes: 5,
  },
  {
    id: 'asig-103',
    materia: 'Redes de computadoras',
    paralelo: 'Único',
    turno: 'Noche',
    horasSemana: 5,
    estudiantes: 18,
    badge: { tipo: 'cerrado', texto: 'B2 cerrado · prom 74' },
    notasPendientes: null,
  },
  {
    id: 'asig-104',
    materia: 'Ética profesional',
    paralelo: 'A',
    turno: 'Mañana',
    horasSemana: 2,
    estudiantes: 30,
    badge: { tipo: 'en-curso', texto: 'B2 · 2 evaluaciones' },
    notasPendientes: 12,
  },
];

export const getResumenCursos = (cursos) => {
  const paralelos = new Set(cursos.map((c) => c.paralelo));
  return {
    totalCursos: cursos.length,
    totalParalelos: paralelos.size,
  };
};
