import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import { PagoAporte } from './pago_aporte.js';

/**
 * Compromiso de pago del estudiante (tabla `compromisos_pago`).
 *
 * Fecha en la que el estudiante se compromete a cancelar el saldo pendiente del
 * aporte. Reemplaza la práctica de anotar la fecha en pago_cuotas.descripcion.
 *
 * Regla de negocio: UN compromiso VIGENTE por cabecera (pago_aporte). El
 * histórico (renegociaciones) se conserva vía estado/soft delete.
 */
export const COMPROMISO_PAGO_ESTADOS = Object.freeze({
  VIGENTE: 'VIGENTE',
  CUMPLIDO: 'CUMPLIDO',
  INCUMPLIDO: 'INCUMPLIDO',
});

export const COMPROMISO_PAGO_ESTADOS_VALUES = Object.values(COMPROMISO_PAGO_ESTADOS);

export const CompromisoPago = sequelize.define(
  'CompromisoPago',
  {
    ...baseModelFields,
    pagoAporteId: {
      type: DataTypes.INTEGER,
      field: 'pago_aporte_id',
      allowNull: true,
      comment: 'Cabecera del aporte (estudiante + gestión) a la que aplica el compromiso',
    },
    fechaCompromiso: {
      type: DataTypes.DATEONLY,
      field: 'fecha_compromiso',
      allowNull: false,
      comment: 'Fecha en la que el estudiante se compromete a cancelar el saldo',
    },
    observacion: {
      type: DataTypes.STRING(500),
      field: 'observacion',
      allowNull: true,
      comment: 'Nota del compromiso (motivo, condiciones, respaldo firmado)',
    },
    estado: {
      type: DataTypes.ENUM(...COMPROMISO_PAGO_ESTADOS_VALUES),
      allowNull: false,
      defaultValue: COMPROMISO_PAGO_ESTADOS.VIGENTE,
      comment: 'VIGENTE=activo; CUMPLIDO=saldo cancelado; INCUMPLIDO=venció sin pago',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'compromisos_pago',
  }
);

// Asociación con la cabecera de aporte (no hay associations centralizadas en el
// proyecto; se declara aquí como en el resto de modelos relacionados).
CompromisoPago.belongsTo(PagoAporte, {
  foreignKey: 'pagoAporteId',
  targetKey: 'id',
  as: 'pagoAporte',
});

export default CompromisoPago;
