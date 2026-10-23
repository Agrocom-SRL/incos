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

  it('la columna «Acciones» se arma con la acción de requisitos para inscripciones vigentes', () => {
    const columnas = createInscripcionesCapTableColumns({ onGestionarRequisitos: () => {} });
    const acciones = columnas.find((c) => c.key === 'acciones');
    const el = acciones.render(null, { id: 1, estado: 'PENDIENTE', saldoTotal: 0 });
    const extra = el.props.extraActions.map((a) => a.key);
    expect(extra).toContain('requisitos');
    const anulada = acciones.render(null, { id: 2, estado: 'ANULADO', saldoTotal: 0 });
    expect(anulada.props.extraActions.map((a) => a.key)).not.toContain('requisitos');
  });

  it('columnas: el «Estado» es el de la inscripción; sin «Saldo» ni «Estado de pago»', () => {
    const keys = createInscripcionesCapTableColumns({}).map((c) => c.key);
    expect(keys).toEqual(['nro', 'participante', 'curso', 'pagado', 'estado', 'acciones']);
  });

  it('«Curso» no muestra las fechas del curso', () => {
    const curso = createInscripcionesCapTableColumns({}).find((c) => c.key === 'curso');
    render(
      curso.render(null, { capacitacionTitulo: 'Guaraní', capacitacionFechasLabel: '01/11/2026 – 30/11/2026' }),
    );
    expect(screen.queryByText(/01\/11\/2026/)).toBeNull();
  });

  it('«Pagado» muestra Matrícula y Curso, cada uno con su pill y sin montos ni cantidad de pagos', () => {
    const pagado = createInscripcionesCapTableColumns({}).find((c) => c.key === 'pagado');
    const base = {
      montoTotal: 590, montoMatricula: 150, montoObligatorio: 440, saldoMatricula: 0,
      saldoCurso: 440, pagoCursoExterno: false, pagosCount: 2,
    };
    render(pagado.render(null, base));
    expect(screen.getByText(/Matrícula:/)).toBeTruthy();
    expect(screen.getByText(/Curso:/)).toBeTruthy();
    expect(screen.getByText('Pagado')).toBeTruthy();
    expect(screen.getByText('Pendiente')).toBeTruthy();
    expect(screen.queryByText(/Bs/)).toBeNull();
  });

  it('curso externo: «Depósito pendiente» hasta que se acredita, luego «Pagado»', () => {
    const pagado = createInscripcionesCapTableColumns({}).find((c) => c.key === 'pagado');
    const base = {
      montoTotal: 590, montoMatricula: 150, montoObligatorio: 440, saldoMatricula: 150,
      saldoCurso: 440, pagoCursoExterno: true,
    };
    const { unmount } = render(pagado.render(null, { ...base, estadoPagoCurso: 'PARCIAL' }));
    expect(screen.getByText('Depósito pendiente')).toBeTruthy();
    expect(screen.getByText('Pendiente')).toBeTruthy();
    unmount();
    render(pagado.render(null, { ...base, saldoMatricula: 0, estadoPagoCurso: 'CANCELADO' }));
    expect(screen.queryByText('Depósito pendiente')).toBeNull();
    expect(screen.getAllByText('Pagado')).toHaveLength(2);
  });
});
