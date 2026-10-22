import { describe, it, expect } from 'vitest';
import { calcularPendientesInscripcion } from '../inscripcionPendientes';

const base = {
  estado: 'PENDIENTE',
  saldoMatricula: 0,
  saldoCurso: 0,
  requisitos: [],
};

describe('calcularPendientesInscripcion', () => {
  it('vacío si no está PENDIENTE', () => {
    expect(calcularPendientesInscripcion({ ...base, estado: 'INSCRITO', saldoCurso: 100 })).toEqual([]);
    expect(calcularPendientesInscripcion(null)).toEqual([]);
  });

  it('lista matrícula, curso y requisitos obligatorios faltantes', () => {
    const pendientes = calcularPendientesInscripcion({
      ...base,
      saldoMatricula: 150,
      saldoCurso: 440,
      requisitos: [
        { descripcion: 'CI', obligatorio: true, entregado: false },
        { descripcion: 'Foto', obligatorio: true, entregado: true },
        { descripcion: 'Extra', obligatorio: false, entregado: false },
      ],
    });
    expect(pendientes.map((p) => p.key)).toEqual(['matricula', 'curso', 'requisitos']);
    expect(pendientes[0].label).toMatch(/Matrícula/);
    expect(pendientes[2].label).toContain('CI');
    expect(pendientes[2].label).not.toContain('Extra');
  });

  it('solo reporta lo que falta', () => {
    const pendientes = calcularPendientesInscripcion({ ...base, saldoCurso: 10 });
    expect(pendientes.map((p) => p.key)).toEqual(['curso']);
  });
});

describe('calcularPendientesInscripcion · curso externo', () => {
  it('el saldo del curso (informativo) no bloquea: solo matrícula y requisitos', () => {
    const pendientes = calcularPendientesInscripcion({
      ...base,
      pagoCursoExterno: true,
      saldoMatricula: 150,
      saldoCurso: 440,
      requisitos: [{ descripcion: 'Depósito', obligatorio: true, entregado: false }],
    });
    expect(pendientes.map((p) => p.key)).toEqual(['matricula', 'requisitos']);
  });
});
