import { describe, it, expect } from 'vitest';
import { mapParticipanteDetail } from '../participanteMapper';

const rawParticipante = {
  id: 9,
  ci: '1234567',
  expedicion: 'sc',
  nombres: 'Juan Carlos',
  apellidoPaterno: 'Pérez',
  apellidoMaterno: 'Gómez',
  celular: '70000000',
  email: null,
  activo: 1,
  createdAt: '2026-03-01T10:00:00.000Z',
};

describe('mapParticipanteDetail', () => {
  it('devuelve null sin datos', () => {
    expect(mapParticipanteDetail(null)).toBeNull();
  });

  it('mapea el participante y su historial con la inscripción más reciente primero', () => {
    const detalle = mapParticipanteDetail({
      ...rawParticipante,
      inscripciones: [
        { id: 1, fechaInscripcion: '2026-02-01', capacitacionTitulo: 'Word', estado: 'RETIRADO', estadoPago: 'PARCIAL' },
        { id: 3, fechaInscripcion: '2026-06-10', capacitacionTitulo: 'Excel', estado: 'INSCRITO', estadoPago: 'CANCELADO' },
        { id: 2, fechaInscripcion: '2026-06-10', capacitacionTitulo: 'Guaraní', estado: 'PENDIENTE', estadoPago: 'PARCIAL' },
      ],
    });
    expect(detalle).toMatchObject({ id: 9, ciCompleto: '1234567 SC', activo: true });
    expect(detalle.inscripciones.map((i) => i.capacitacionTitulo)).toEqual(['Excel', 'Guaraní', 'Word']);
  });

  it('sin inscripciones el historial queda vacío', () => {
    expect(mapParticipanteDetail(rawParticipante).inscripciones).toEqual([]);
  });
});
