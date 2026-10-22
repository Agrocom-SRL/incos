import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createInscripcionesCapTableColumns } from '../inscripcionesTableColumns';

describe('columnas de inscripciones de capacitación', () => {
  it('la columna «Curso» renderiza título y grupo sin fallar', () => {
    const columnas = createInscripcionesCapTableColumns({});
    const curso = columnas.find((c) => c.key === 'curso');
    render(curso.render(null, { capacitacionTitulo: 'Curso de Guaraní', grupoNombre: 'mañana' }));
    expect(screen.getByText('Curso de Guaraní')).toBeTruthy();
    expect(screen.getByText('mañana')).toBeTruthy();
  });

  it('curso externo: «Pagado» cuenta solo la matrícula y rotula el curso como pagado a la entidad', () => {
    const columnas = createInscripcionesCapTableColumns({});
    const pagado = columnas.find((c) => c.key === 'pagado');
    render(
      pagado.render(null, {
        montoTotal: 590,
        montoCobrable: 150,
        montoObligatorio: 440,
        totalPagado: 150,
        pagosCount: 1,
        pagoCursoExterno: true,
        estadoPagoCurso: 'CANCELADO',
      }),
    );
    expect(screen.getByText('Bs 150 de Bs 150')).toBeTruthy();
    expect(screen.getByText('Pagado a la entidad')).toBeTruthy();
  });

  it('curso externo con el depósito sin acreditar muestra «Pendiente de acreditar con depósito»', () => {
    const columnas = createInscripcionesCapTableColumns({});
    const pagado = columnas.find((c) => c.key === 'pagado');
    render(
      pagado.render(null, {
        montoTotal: 440,
        montoCobrable: 0,
        montoObligatorio: 440,
        totalPagado: 0,
        pagosCount: 0,
        pagoCursoExterno: true,
        estadoPagoCurso: 'PARCIAL',
      }),
    );
    expect(screen.getByText('Sin cobro en el instituto')).toBeTruthy();
    expect(screen.getByText('Pendiente de acreditar con depósito')).toBeTruthy();
  });
});
