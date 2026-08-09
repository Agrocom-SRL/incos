import { BaseListController } from '../base/BaseListController.js';

/**
 * GET /api/v1/ingresos
 * Listado unificado de transacciones de ingreso (vista 184
 * vista_ingresos_listado): aportes académicos (pago_cuotas) + pagos de
 * capacitación (capacitacion_pagos). 1 fila = 1 pago real.
 * dataFieldName: 'ingresos'.
 */
export class ListIngresosController extends BaseListController {
  /**
   * @param {Object} params - Dependencias inyectadas
   * @param {ListIngresosUseCase} params.listIngresosUseCase - Caso de uso para listar ingresos
   * @param {ILogger} params.logger - Logger para registro de eventos
   * @param {ResponseFormatter} params.responseFormatter - Formatter de respuestas exitosas
   */
  constructor({ listIngresosUseCase, logger, responseFormatter }) {
    super({
      useCase: listIngresosUseCase,
      logger,
      responseFormatter,
      resourceName: 'ingresos',
      dataFieldName: 'ingresos',
    });
  }

  // Nota: No es necesario sobrescribir buildFilters() ni handle()
  // BaseListController maneja search/sort genéricos; origen se lee de
  // req.query dentro del Use Case (mismo patrón que ListPasantiasUseCase).
}
