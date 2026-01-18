import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import { ESTADOS_PAGO_VALUES, METODOS_PAGO_VALUES } from '../../../domain/constants/payments.constants.js';

export const PagoArancel = sequelize.define(
  'PagoArancel',
  {
    ...baseModelFields,
    estudianteId: {
      type: DataTypes.INTEGER,
      field: 'estudiante_id',
      allowNull: false,
      comment: 'Estudiante que realiza el pago',
    },
    inscripcionId: {
      type: DataTypes.INTEGER,
      field: 'inscripcion_id',
      allowNull: false,
      comment: 'Inscripción asociada',
    },
    gestionId: {
      type: DataTypes.INTEGER,
      field: 'gestion_id',
      allowNull: true, // NULLABLE - redundante (ya está en inscripcion_id), se mantiene para reportes
      comment: 'Gestión académica (redundante, se puede obtener de inscripcion_id. Se mantiene para reportes directos)',
    },
    numeroRecibo: {
      type: DataTypes.STRING(50),
      field: 'numero_recibo',
      allowNull: true,
      comment: 'Número de recibo único',
    },
    fechaPago: {
      type: DataTypes.DATEONLY,
      field: 'fecha_pago',
      allowNull: false,
      comment: 'Fecha del pago',
    },
    montoTotal: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'monto_total',
      allowNull: false,
      defaultValue: 400.00,
      comment: 'Aporte anualizado: 400 Bs',
    },
    descuentoBeca: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'descuento_beca',
      defaultValue: 0.00,
      comment: 'Descuento por beca (automático o manual)',
    },
    descuentoOtros: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'descuento_otros',
      defaultValue: 0.00,
      comment: 'Otros descuentos',
    },
    montoPagado: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'monto_pagado',
      defaultValue: 0.00,
      comment: 'Monto efectivamente pagado',
    },
    metodoPago: {
      type: DataTypes.ENUM(...METODOS_PAGO_VALUES),
      field: 'metodo_pago',
      allowNull: false,
      comment: 'Método de pago',
    },
    numeroTransaccion: {
      type: DataTypes.STRING(100),
      field: 'numero_transaccion',
      allowNull: true,
      comment: 'Número de transacción/depósito',
    },
    banco: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Banco (si aplica)',
    },
    concepto: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Concepto del pago',
    },
    periodoPago: {
      type: DataTypes.STRING(50),
      field: 'periodo_pago',
      allowNull: true,
      comment: 'Periodo que cubre (Ej: Año 2025)',
    },
    estado: {
      type: DataTypes.ENUM(...ESTADOS_PAGO_VALUES),
      defaultValue: 'PENDIENTE',
      comment: 'Estado del pago',
    },
    fechaVencimiento: {
      type: DataTypes.DATEONLY,
      field: 'fecha_vencimiento',
      allowNull: true,
      comment: 'Fecha de vencimiento',
    },
    validado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Pago validado por personal',
    },
    validadoPor: {
      type: DataTypes.INTEGER,
      field: 'validado_por',
      allowNull: true,
      comment: 'Usuario que validó el pago',
    },
    fechaValidacion: {
      type: DataTypes.DATEONLY,
      field: 'fecha_validacion',
      allowNull: true,
      comment: 'Fecha de validación',
    },
    comprobanteUrl: {
      type: DataTypes.STRING(255),
      field: 'comprobante_url',
      allowNull: true,
      comment: 'URL del comprobante escaneado',
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    motivoAnulacion: {
      type: DataTypes.TEXT,
      field: 'motivo_anulacion',
      allowNull: true,
      comment: 'Motivo de anulación (si aplica)',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'pagos_aranceles',
  }
);

export default PagoArancel;
