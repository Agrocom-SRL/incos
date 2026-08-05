import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso } from '../middleware/permisos.middleware.js';
import { listValidator } from '../validators/common/index.js';

/**
 * Construye el router del recurso Ingresos (Finanzas · registro de ingresos)
 *
 * Listado unificado de transacciones de ingreso (vista 184
 * vista_ingresos_listado): aportes académicos (pago_cuotas) + pagos de
 * capacitación (capacitacion_pagos). 1 fila = 1 pago real (monto > 0,
 * activo, no eliminado).
 *
 * NO reemplaza /api/v1/pagos-aportes (cabeceras agregadas por estudiante,
 * vista 49 vista_pago_aporte_listado, consumida por la ficha
 * /finanzas/pagos/:id): este recurso es transaccional y de solo lectura.
 *
 * @param {Object} params - Dependencias inyectadas
 * @param {Object} params.controllers - Controllers del recurso
 * @param {Object} params.middlewares - Middlewares (validateRequest)
 * @returns {Router} Router configurado de Express
 */
export function buildIngresosRouter({ controllers, middlewares }) {
    const router = express.Router();
    const { validateRequest } = middlewares;

    const ingresoListar = [authenticate, verificarPermiso('finanzas.pago.ver', 'LISTAR')];

    /**
     * GET /api/v1/ingresos
     * Listado paginado de transacciones de ingreso (vista 184).
     * Query: page, limit, search, sort ("campo:DIRECCION"),
     * origen ('APORTE' | 'CAPACITACION').
     */
    router.get(
        '/',
        ...ingresoListar,
        listValidator,
        validateRequest,
        (req, res, next) => controllers.listIngresosController.handle(req, res, next)
    );

    return router;
}
