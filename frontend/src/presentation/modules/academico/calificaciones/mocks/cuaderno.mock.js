/**
 * Mock del cuaderno por curso — reemplazar por API en Fase 2.
 */

import { MOCK_CURSOS } from './cursos.mock.js';

export const BIMESTRE_VIGENTE = 2;

const EVALUACIONES_MOCK = [
  { id: 'ev-1', nombre: 'Examen parcial' },
  { id: 'ev-2', nombre: 'Trabajo práctico' },
  { id: 'ev-3', nombre: 'Cuestionario' },
];

const ESTUDIANTES_MOCK = [
  { id: 'est-1', nombre: 'Ana María Quispe Flores', notas: { 'ev-1': 85, 'ev-2': 72, 'ev-3': null } },
  { id: 'est-2', nombre: 'Carlos Eduardo Mamani', notas: { 'ev-1': 91, 'ev-2': null, 'ev-3': 88 } },
  { id: 'est-3', nombre: 'Lucía Fernanda Vargas', notas: { 'ev-1': null, 'ev-2': 65, 'ev-3': 70 } },
  { id: 'est-4', nombre: 'José Luis Rojas Condori', notas: { 'ev-1': 78, 'ev-2': 80, 'ev-3': 82 } },
  { id: 'est-5', nombre: 'Patricia Soliz Uriona', notas: { 'ev-1': 55, 'ev-2': null, 'ev-3': null } },
];

const CURSO_FALLBACK = {
  id: 'asig-101',
  materia: 'Programación Web I',
  paralelo: 'A',
  turno: 'Mañana',
  horasSemana: 6,
  estudiantes: 28,
};

export const getCuadernoMock = (cursoId) => {
  const cursoBase = MOCK_CURSOS.find((c) => c.id === cursoId) ?? CURSO_FALLBACK;

  return {
    curso: {
      id: cursoBase.id,
      materia: cursoBase.materia,
      paralelo: cursoBase.paralelo,
      turno: cursoBase.turno,
      horasSemana: cursoBase.horasSemana,
      estudiantes: cursoBase.estudiantes,
    },
    bimestreVigente: BIMESTRE_VIGENTE,
    evaluaciones: EVALUACIONES_MOCK,
    estudiantes: ESTUDIANTES_MOCK,
    guardadoHaceSeg: 12,
  };
};
