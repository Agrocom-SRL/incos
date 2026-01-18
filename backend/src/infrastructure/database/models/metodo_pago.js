import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

export const MetodoPago = sequelize.define(
  'MetodoPago',
  {
    ...baseModelFields,
    codigo: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'Código: EFECTIVO, TRANSFERENCIA, DEPOSITO, TARJETA, QR, TIGO_MONEY, OTRO',
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Nombre del método de pago',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'metodos_pago',
  }
);

export default MetodoPago;
