import { describe, it, expect } from 'vitest';
import {
  buildParticipanteResumen,
  resolverEstadoPagoCursoExterno,
  splitRequisitosResumen,
} from '../inscripcionResumen';

describe('buildParticipanteResumen', () => {
  it('existente: usa el participante elegido', () => {
    const resumen = buildParticipanteResumen({
      modoParticipante: 'existente',
      participanteSeleccionado: { id: 3, nombreCompleto: 'PEREZ LOPEZ ANA', ciCompleto: '123 LP' },
    });
    expect(resumen).toEqual({ nombreCompleto: 'PEREZ LOPEZ ANA', ciCompleto: '123 LP', esNuevo: false });
  });

  it('existente sin selección: null', () => {
    expect(
      buildParticipanteResumen({ modoParticipante: 'existente', participanteSeleccionado: null }),
    ).toBeNull();
  });

  it('nuevo: arma nombre (apellidos primero) y CI del formulario', () => {
    const resumen = buildParticipanteResumen({
      modoParticipante: 'nuevo',
      participanteSeleccionado: null,
      values: { ci: ' 8159625 ', expedicion: 'lp', nombres: 'Ana', apellidoPaterno: 'Pérez', apellidoMaterno: '' },
    });
    expect(resumen.esNuevo).toBe(true);
    expect(resumen.nombreCompleto).toBe('Pérez Ana');
    expect(resumen.ciCompleto).toContain('8159625');
  });

  it('nuevo sin datos todavía: null', () => {
    expect(buildParticipanteResumen({ modoParticipante: 'nuevo', values: {} })).toBeNull();
  });
});

describe('splitRequisitosResumen', () => {
  const requisitos = [
    { id: 1, obligatorio: true },
    { id: 2, obligatorio: false },
    { id: 3, obligatorio: true },
  ];

  it('separa entregados y pendientes y cuenta los obligatorios que faltan', () => {
    const r = splitRequisitosResumen(requisitos, [1]);
    expect(r.entregados.map((x) => x.id)).toEqual([1]);
    expect(r.pendientes.map((x) => x.id)).toEqual([2, 3]);
    expect(r.obligatoriosPendientes).toBe(1);
  });

  it('sin requisitos: todo vacío', () => {
    expect(splitRequisitosResumen([], [])).toEqual({
      entregados: [],
      pendientes: [],
      obligatoriosPendientes: 0,
    });
  });
});

describe('resolverEstadoPagoCursoExterno', () => {
  const requisitos = [
    { id: 1, acreditaPagoCurso: false },
    { id: 2, acreditaPagoCurso: true },
  ];

  it('null si el curso no es externo', () => {
    expect(resolverEstadoPagoCursoExterno({ pagoCursoExterno: false }, requisitos, [2])).toBeNull();
    expect(resolverEstadoPagoCursoExterno(null, requisitos, [2])).toBeNull();
  });

  it('CANCELADO (pagado a la entidad) si el requisito acreditador se entrega; si no, PARCIAL', () => {
    const curso = { pagoCursoExterno: true };
    expect(resolverEstadoPagoCursoExterno(curso, requisitos, [1, 2])).toBe('CANCELADO');
    expect(resolverEstadoPagoCursoExterno(curso, requisitos, [1])).toBe('PARCIAL');
    expect(resolverEstadoPagoCursoExterno(curso, [], [])).toBe('PARCIAL');
  });
});
