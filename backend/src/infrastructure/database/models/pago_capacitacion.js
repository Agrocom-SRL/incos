import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import {
  CONCEPTOS_PAGO_CAPACITACION,
  CONCEPTOS_PAGO_CAPACITACION_VALUES,
} from '../../../domain/constants/capacitacion.constants.js';

/**
 * Pago de inscripción a una capacitación (módulo CAP) — tabla
 * `capacitacion_pagos`. Tabla propia (NO extiende pago_cuotas/compromisos_pago,
 * acoplados a estudiante+gestión); reutiliza los catálogos `metodos_pago` y
 * `cuentas_pago` por FK de lectura. `numero_recibo` se genera en lógica de
 * negocio (unicidad en lógica, sin UNIQUE, mismo criterio que pago_cuotas).
 */
export const PagoCapacitacion = sequelize.define(
  'PagoCapacitacion',
  {
    ...baseModelFields,
    capacitacionInscritoId: {
      type: DataTypes.INTEGER,
      field: 'capacitacion_inscrito_id',
      allowNull: true,
      comment: 'Inscripción a la que corresponde el pago',
    },
    metodoPagoId: {
      type: DataTypes.INTEGER,
      field: 'metodo_pago_id',
      allowNull: true,
      comment: 'Método de pago utilizado (catálogo metodos_pago)',
    },
    cuentaPagoId: {
      type: DataTypes.INTEGER,
      field: 'cuenta_pago_id',
      allowNull: true,
      comment: 'Cuenta utilizada (catálogo cuentas_pago, para TRANSFERENCIA/DEPOSITO/QR/TIGO_MONEY)',
    },
    concepto: {
      type: DataTypes.ENUM(...CONCEPTOS_PAGO_CAPACITACION_VALUES),
      allowNull: false,
      defaultValue: CONCEPTOS_PAGO_CAPACITACION.CURSO,
      comment: 'MATRICULA (secretaría del instituto) | CURSO (entidad certificadora)',
    },
    monto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Monto pagado en Bs',
    },
    fechaPago: {
      type: DataTypes.DATEONLY,
      field: 'fecha_pago',
      allowNull: false,
      comment: 'Fecha del pago',
    },
    numeroRecibo: {
      type: DataTypes.STRING(50),
      field: 'numero_recibo',
      allowNull: false,
      comment: 'Número de recibo (generado por lógica de negocio)',
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observaciones del pago',
    },
    comprobanteRuta: {
      type: DataTypes.STRING(500),
      field: 'comprobante_ruta',
      allowNull: true,
      comment: 'Ruta del comprobante/depósito escaneado (opcional)',
    },
    comprobanteNombre: {
      type: DataTypes.STRING(255),
      field: 'comprobante_nombre',
      allowNull: true,
      comment: 'Nombre original del archivo del comprobante',
    },
    anulado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Pago anulado por error: conserva el historial pero no cuenta en totales, saldos ni ingresos',
    },
    motivoAnulacion: {
      type: DataTypes.STRING(500),
      field: 'motivo_anulacion',
      allowNull: true,
      comment: 'Motivo obligatorio de la anulación',
    },
    fechaAnulacion: {
      type: DataTypes.DATE,
      field: 'fecha_anulacion',
      allowNull: true,
      comment: 'Momento en que se anuló el pago',
    },
    anuladoPor: {
      type: DataTypes.INTEGER,
      field: 'anulado_por',
      allowNull: true,
      comment: 'Usuario que anuló el pago',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'capacitacion_pagos',
  }
);

export default PagoCapacitacion;
