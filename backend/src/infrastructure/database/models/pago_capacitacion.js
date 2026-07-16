import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

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
  },
  {
    ...baseModelOptions,
    tableName: 'capacitacion_pagos',
  }
);

export default PagoCapacitacion;
