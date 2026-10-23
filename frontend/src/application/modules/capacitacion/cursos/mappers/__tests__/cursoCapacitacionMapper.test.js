import { describe, it, expect } from 'vitest';
import dayjs from 'dayjs';
import {
  mapCursoCapacitacion,
  mapCursoCapacitacionDetail,
  mapCursoToFormValues,
  mapFormValuesToCursoPayload,
  mapGruposFormToPayload,
  mapRequisitosFormToPayload,
} from '../cursoCapacitacionMapper';

const rawCurso = {
  id: 1,
  titulo: ' Curso de Guaraní ',
  costo: '440.00',
  costoMatricula: '150.00',
  tieneCosto: 1,
  cobraMatricula: true,
  entidadCertificadora: 'IPELC',
  modalidad: 'SEMIPRESENCIAL',
  nivel: 'Básico',
  dirigidoA: 'Público general',
  duracion: '2 meses',
  fechaInicio: '2026-11-01',
  fechaFin: null,
};

describe('mapCursoCapacitacion', () => {
  it('mapea los campos nuevos y los interruptores de costo', () => {
    expect(mapCursoCapacitacion(rawCurso)).toMatchObject({
      titulo: 'Curso de Guaraní',
      costo: 440,
      costoMatricula: 150,
      tieneCosto: true,
      cobraMatricula: true,
      esGratuito: false,
      entidadCertificadora: 'IPELC',
      modalidad: 'SEMIPRESENCIAL',
      modalidadLabel: 'Semipresencial',
      nivel: 'Básico',
      dirigidoA: 'Público general',
      duracion: '2 meses',
    });
  });

  it('sin flags del backend los deriva del monto', () => {
    const c = mapCursoCapacitacion({ id: 2, titulo: 'X', costo: 10, costoMatricula: 0 });
    expect(c).toMatchObject({ tieneCosto: true, cobraMatricula: false, esGratuito: false });
  });

  it('ambos interruptores apagados = curso gratuito', () => {
    const c = mapCursoCapacitacion({ id: 3, titulo: 'X', tieneCosto: false, cobraMatricula: 0 });
    expect(c.esGratuito).toBe(true);
    expect(c.costo).toBe(0);
  });

  it('acepta fechaFin null: rango abierto «Desde …»', () => {
    const curso = mapCursoCapacitacion(rawCurso);
    expect(curso.fechaFin).toBeNull();
    expect(curso.fechasLabel).toBe('Desde 01/11/2026');
  });

  it('con fecha de fin muestra el rango', () => {
    expect(mapCursoCapacitacion({ ...rawCurso, fechaFin: '2026-12-31' }).fechasLabel).toBe(
      '01/11/2026 – 31/12/2026',
    );
  });
});

describe('mapCursoCapacitacionDetail', () => {
  it('mapea grupos con horarios ordenados, cupo disponible y requisitos ordenados', () => {
    const detalle = mapCursoCapacitacionDetail({
      ...rawCurso,
      grupos: [
        {
          id: 2,
          nombre: '2do grupo',
          cupoMaximo: 20,
          orden: 2,
          inscritosCount: 5,
          aulaId: 4,
          aulaCodigo: 'A-01',
          aulaNombre: 'Aula Guaraní',
          horarios: [{ capacitacionHorarioId: 8, horarioId: 71, dia: 'SABADO', horaInicio: '15:00:00', horaFin: '19:00:00' }],
        },
        {
          id: 1,
          nombre: '1er grupo',
          orden: 1,
          horarios: [
            { horarioId: 71, dia: 'SABADO', horaInicio: '15:00', horaFin: '19:00', etiqueta: 'SAB 15:00-19:00' },
            { horarioId: 70, dia: 'SABADO', horaInicio: '08:00', horaFin: '12:00' },
          ],
        },
      ],
      requisitos: [
        { id: 2, descripcion: 'Foto', obligatorio: 0, orden: 2 },
        { id: 1, descripcion: 'CI', obligatorio: true, orden: 1 },
        { id: 3, descripcion: '   ' },
      ],
    });
    expect(detalle.grupos.map((g) => g.nombre)).toEqual(['1er grupo', '2do grupo']);
    expect(detalle.grupos[0].horariosLabel).toBe('SAB 08:00-12:00 · SAB 15:00-19:00');
    expect(detalle.grupos[0].cupoMaximo).toBeNull();
    expect(detalle.grupos[0].cupoDisponible).toBeNull();
    expect(detalle.grupos[0].aulaLabel).toBeNull();
    expect(detalle.grupos[1]).toMatchObject({ aulaId: 4, aulaLabel: 'A-01 · Aula Guaraní' });
    expect(detalle).not.toHaveProperty('aulaLabel');
    expect(detalle.grupos[1]).toMatchObject({ cupoMaximo: 20, inscritosCount: 5, cupoDisponible: 15 });
    expect(detalle.requisitos.map((r) => r.id)).toEqual([1, 2]);
    expect(detalle.requisitos[1].obligatorio).toBe(false);
  });

  it('un curso sin grupos ni requisitos (borrador) devuelve listas vacías', () => {
    const detalle = mapCursoCapacitacionDetail(rawCurso);
    expect(detalle.grupos).toEqual([]);
    expect(detalle.requisitos).toEqual([]);
  });
});

describe('payload de grupos y requisitos', () => {
  it('grupos: orden por posición, cupo opcional, id solo si existe y horarioId', () => {
    expect(
      mapGruposFormToPayload([
        { key: 'a', id: 4, nombre: ' 1er grupo ', cupoMaximo: 20, aulaId: '3', horarios: [{ horarioId: '70' }] },
        { key: 'b', id: null, nombre: '2do grupo', cupoMaximo: null, aulaId: undefined, horarios: [] },
      ]),
    ).toEqual([
      { id: 4, nombre: '1er grupo', cupoMaximo: 20, costoMatricula: 0, aulaId: 3, orden: 1, horarios: [{ horarioId: 70 }] },
      { nombre: '2do grupo', cupoMaximo: null, costoMatricula: 0, aulaId: null, orden: 2, horarios: [] },
    ]);
    expect(mapGruposFormToPayload(undefined)).toEqual([]);
  });

  it('grupos: la matrícula viaja solo en los grupos con su interruptor «Cobra matrícula» activo', () => {
    const grupos = [
      { nombre: 'Regular', cobraMatricula: true, costoMatricula: 150, horarios: [] },
      { nombre: 'Intensivo', cobraMatricula: true, costoMatricula: '250', horarios: [] },
      { nombre: 'Sin matrícula', cobraMatricula: false, costoMatricula: 99, horarios: [] },
    ];
    expect(mapGruposFormToPayload(grupos).map((g) => g.costoMatricula)).toEqual([150, 250, 0]);
  });

  it('requisitos: descarta vacíos y recalcula orden', () => {
    expect(
      mapRequisitosFormToPayload([
        { key: 'a', id: 4, descripcion: ' CI ', obligatorio: true },
        { key: 'b', id: null, descripcion: '', obligatorio: true },
        { key: 'c', id: null, descripcion: 'Foto', obligatorio: false },
      ]),
    ).toEqual([
      { id: 4, descripcion: 'CI', obligatorio: true, acreditaPagoCurso: false, orden: 1 },
      { descripcion: 'Foto', obligatorio: false, acreditaPagoCurso: false, orden: 2 },
    ]);
  });
});

describe('mapFormValuesToCursoPayload (costos condicionales)', () => {
  const base = {
    titulo: ' Guaraní ',
    modalidad: 'VIRTUAL',
    entidadCertificadora: ' IPELC ',
    nivel: '',
    cupoMaximo: 30,
    fechaInicio: dayjs('2026-11-01'),
    grupos: [],
    requisitos: [],
  };

  it('el costo del curso y la matrícula por grupo viajan; el curso cobra matrícula si algún grupo la cobra', () => {
    const p = mapFormValuesToCursoPayload({
      ...base,
      tieneCosto: true,
      costo: 440,
      grupos: [{ nombre: 'Intensivo', cobraMatricula: true, costoMatricula: 250, horarios: [] }],
    });
    expect(p).toMatchObject({
      titulo: 'Guaraní',
      tieneCosto: true,
      cobraMatricula: true,
      costo: 440,
      entidadCertificadora: 'IPELC',
      nivel: null,
      fechaInicio: '2026-11-01',
      fechaFin: null,
    });
    expect(p).not.toHaveProperty('costoMatricula');
    expect(p).not.toHaveProperty('horarioIds');
    expect(p).not.toHaveProperty('aulaId');
    expect(p).not.toHaveProperty('descripcionVirtual');
  });

  it('interruptor apagado envía 0 aunque quede un monto residual', () => {
    const p = mapFormValuesToCursoPayload({
      ...base,
      tieneCosto: false,
      costo: 999,
      grupos: [{ nombre: 'Regular', cobraMatricula: true, costoMatricula: 150, horarios: [] }],
    });
    expect(p).toMatchObject({ tieneCosto: false, costo: 0, cobraMatricula: true });
    expect(p.grupos[0].costoMatricula).toBe(150);
  });

  it('curso gratuito: sin costo ni matrícula en ningún grupo', () => {
    const p = mapFormValuesToCursoPayload({
      ...base,
      tieneCosto: false,
      grupos: [{ nombre: 'Regular', cobraMatricula: false, horarios: [] }],
    });
    expect(p).toMatchObject({ costo: 0, tieneCosto: false, cobraMatricula: false });
  });
});

describe('mapCursoToFormValues', () => {
  it('alta: gratuito, PRESENCIAL, fechaFin vacía y sin grupos ni requisitos', () => {
    const v = mapCursoToFormValues(null);
    expect(v).toMatchObject({ tieneCosto: false, modalidad: 'PRESENCIAL' });
    expect(v.fechaFin).toBeUndefined();
    expect(v.grupos).toEqual([]);
    expect(v.requisitos).toEqual([]);
  });

  it('edición: el grupo sin precio propio precarga la matrícula del curso; con precio propio, la suya', () => {
    const v = mapCursoToFormValues(
      mapCursoCapacitacionDetail({
        ...rawCurso,
        grupos: [
          { id: 1, nombre: 'Regular', orden: 1, horarios: [] },
          { id: 2, nombre: 'Intensivo', costoMatricula: '250.00', orden: 2, horarios: [] },
        ],
      }),
    );
    expect(v.grupos.map((g) => g.costoMatricula)).toEqual([150, 250]);
    expect(v.grupos.map((g) => g.cobraMatricula)).toEqual([true, true]);
  });

  it('edición: precarga montos solo si el interruptor está activo, grupos y requisitos con key', () => {
    const v = mapCursoToFormValues(
      mapCursoCapacitacionDetail({
        ...rawCurso,
        cobraMatricula: false,
        grupos: [{ id: 7, nombre: '1er grupo', cupoMaximo: 20, orden: 1, horarios: [{ horarioId: 70, dia: 'SABADO', horaInicio: '08:00', horaFin: '12:00' }] }],
        requisitos: [{ id: 7, descripcion: 'CI', obligatorio: true, orden: 1 }],
      }),
    );
    expect(v.costo).toBe(440);
    expect(v.grupos).toEqual([
      { key: 'grupo-7', id: 7, nombre: '1er grupo', cupoMaximo: 20, cobraMatricula: false, costoMatricula: undefined, aulaId: undefined, horarios: [{ horarioId: 70 }] },
    ]);
    expect(v.requisitos).toEqual([
      { key: 'req-7', id: 7, descripcion: 'CI', obligatorio: true, acreditaPagoCurso: false },
    ]);
  });
});

describe('mapCursoCapacitacion · pagoCursoExterno', () => {
  it('usa el campo del backend y, si falta, deriva de la entidad certificadora', () => {
    expect(mapCursoCapacitacion({ ...rawCurso, pagoCursoExterno: 1 }).pagoCursoExterno).toBe(true);
    expect(mapCursoCapacitacion({ ...rawCurso, pagoCursoExterno: false }).pagoCursoExterno).toBe(false);
    expect(mapCursoCapacitacion(rawCurso).pagoCursoExterno).toBe(true); // entidad 'IPELC'
    expect(mapCursoCapacitacion({ ...rawCurso, entidadCertificadora: null }).pagoCursoExterno).toBe(false);
  });
});
