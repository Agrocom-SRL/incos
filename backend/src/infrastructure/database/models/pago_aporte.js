import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

export const PagoAporte = sequelize.define(
  'PagoAporte',
  {
    ...baseModelFields,
    estudianteId: {
      type: DataTypes.INTEGER,
      field: 'estudiante_id',
      allowNull: true,
      comment: 'Estudiante que realiza el pago',
    },
    gestionId: {
      type: DataTypes.INTEGER,
      field: 'gestion_id',
      allowNull: true,
      comment: 'Gestión académica para la cual se realiza el pago (el pago es ANTES de la inscripción)',
    },
    inscripcionId: {
      type: DataTypes.INTEGER,
      field: 'inscripcion_id',
      allowNull: true,
      comment: 'Inscripción asociada (se vincula después de que el estudiante se inscriba usando el recibo como documento)',
    },
    estudianteBecaId: {
      type: DataTypes.INTEGER,
      field: 'estudiante_beca_id',
      allowNull: true,
      comment: 'Referencia a estudiantes_becas.id si se aplicó descuento por beca',
    },
    metodoPagoId: {
      type: DataTypes.INTEGER,
      field: 'metodo_pago_id',
      allowNull: true,
      comment: 'Método de pago utilizado',
    },
    cuentaPagoId: {
      type: DataTypes.INTEGER,
      field: 'cuenta_pago_id',
      allowNull: true,
      comment: 'Cuenta utilizada para el pago (referencia a cuentas_pago, contiene banco_id cuando aplica. Solo para TRANSFERENCIA/DEPOSITO/QR/TIGO_MONEY)',
    },
    numeroRecibo: {
      type: DataTypes.STRING(50),
      field: 'numero_recibo',
      allowNull: true,
      comment: 'Número de recibo único (generado por la lógica de negocio)',
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
      comment: 'Monto base del aporte (de configuracion_aportes)',
    },
    descuentoBeca: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'descuento_beca',
      defaultValue: 0.00,
      comment: 'Descuento por beca aplicado',
    },
    montoPagado: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'monto_pagado',
      allowNull: false,
      comment: 'Monto efectivamente pagado (calculado por lógica de negocio: monto_total - descuento_beca)',
    },
    numeroTransaccion: {
      type: DataTypes.STRING(100),
      field: 'numero_transaccion',
      allowNull: true,
      comment: 'Número de transacción/código (para TRANSFERENCIA/DEPOSITO/TARJETA/QR/TIGO_MONEY)',
    },
    concepto: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Concepto del pago',
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observaciones',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'pago_aporte',
  }
);

export default PagoAporte;
