import { describe, it, expect, jest } from '@jest/globals';
import { GetInscripcionCapacitacionByIdUseCase } from '../../../src/application/use-cases/capacitacion/GetInscripcionCapacitacionByIdUseCase.js';

describe('GetInscripcionCapacitacionByIdUseCase', () => {
  const crear = ({ row = { id: 2, estado: 'INSCRITO', capacitacion_id: 4 }, pagos = [], checklist = [] } = {}) => {
    const deps = {
      inscripcionCapacitacionRepository: { findListadoRowById: jest.fn().mockResolvedValue(row) },
      pagoCapacitacionRepository: { findDetalleByInscripcionId: jest.fn().mockResolvedValue(pagos) },
      capacitacionCompromisoRepository: { marcarVencidosComoIncumplidos: jest.fn().mockResolvedValue(0) },
      capacitacionInscritoRequisitoRepository: {
        findChecklistByInscripcionId: jest.fn().mockResolvedValue(checklist),
      },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new GetInscripcionCapacitacionByIdUseCase(deps) };
  };

  it('devuelve la ficha con pagos y marca vencidos antes de leer', async () => {
    const { deps, useCase } = crear({ pagos: [{ id: 1, monto: '10' }, { id: 2, monto: '5' }] });
    const res = await useCase.execute(2);
    expect(deps.capacitacionCompromisoRepository.marcarVencidosComoIncumplidos).toHaveBeenCalled();
    expect(deps.inscripcionCapacitacionRepository.findListadoRowById).toHaveBeenCalledWith(2);
    expect(deps.pagoCapacitacionRepository.findDetalleByInscripcionId).toHaveBeenCalledWith(2);
    expect(res.pagos).toHaveLength(2);
  });

  it('incluye estados por concepto, saldos, pagos con concepto/comprobante y checklist de requisitos', async () => {
    const { deps, useCase } = crear({
      row: {
        id: 2, estado: 'PENDIENTE', capacitacion_id: 4, monto_obligatorio: '440', monto_matricula: '150',
        pagado_curso: '440', pagado_matricula: '50', total_pagado: '490',
        estado_pago: 'PARCIAL', estado_pago_curso: 'CANCELADO', estado_pago_matricula: 'PARCIAL',
        capacitacion_grupo_id: 6, grupo_nombre: 'Grupo 1 – Mañana', grupo_horarios: 'SAB 08:00-12:00',
        requisitos_pendientes: 1,
      },
      pagos: [
        { id: 1, monto: '440', concepto: 'CURSO', tiene_comprobante: 1, comprobante_nombre: 'dep.pdf' },
        { id: 2, monto: '50', concepto: 'MATRICULA', tiene_comprobante: 0, comprobante_nombre: null },
      ],
      checklist: [
        { requisito_id: 1, descripcion: 'Cédula', obligatorio: 1, orden: 1, entregado: 1, fecha_entrega: '2026-01-02', observacion: null },
        { requisito_id: 2, descripcion: 'Formulario', obligatorio: 0, orden: 2, entregado: 0, fecha_entrega: null, observacion: 'falta' },
      ],
    });
    const res = await useCase.execute(2);
    expect(deps.capacitacionInscritoRequisitoRepository.findChecklistByInscripcionId).toHaveBeenCalledWith(2, 4);
    expect(res).toMatchObject({
      montoObligatorio: 440, montoMatricula: 150, saldoCurso: 0, saldoMatricula: 100, saldo: 100,
      estadoPago: 'PARCIAL', estadoPagoCurso: 'CANCELADO', estadoPagoMatricula: 'PARCIAL',
      capacitacionGrupoId: 6, grupoNombre: 'Grupo 1 – Mañana', grupoHorariosEtiqueta: 'SAB 08:00-12:00', requisitosPendientes: 1,
    });
    expect(res.pagos[0]).toMatchObject({ concepto: 'CURSO', tieneComprobante: true, comprobanteNombre: 'dep.pdf' });
    expect(res.pagos[1]).toMatchObject({ concepto: 'MATRICULA', tieneComprobante: false });
    expect(res.requisitos).toEqual([
      { requisitoId: 1, descripcion: 'Cédula', obligatorio: true, acreditaPagoCurso: false, orden: 1, entregado: true, fechaEntrega: '2026-01-02', observacion: null },
      { requisitoId: 2, descripcion: 'Formulario', obligatorio: false, acreditaPagoCurso: false, orden: 2, entregado: false, fechaEntrega: null, observacion: 'falta' },
    ]);
  });

  it('devuelve null si no existe y no consulta pagos', async () => {
    const { deps, useCase } = crear({ row: null });
    await expect(useCase.execute(9)).resolves.toBeNull();
    expect(deps.pagoCapacitacionRepository.findDetalleByInscripcionId).not.toHaveBeenCalled();
  });
});
