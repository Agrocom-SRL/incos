import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

export const BancoAutorizado = sequelize.define(
  'BancoAutorizado',
  {
    ...baseModelFields,
    metodoPagoId: {
      type: DataTypes.INTEGER,
      field: 'metodo_pago_id',
      allowNull: true,
      comment: 'Método de pago (TRANSFERENCIA o DEPOSITO)',
    },
    codigo: {
      type: DataTypes.STRING(30),
      allowNull: false,
      comment: 'Código del banco según ASFI (ej: BNB, BCP, BCPB, MERCANTIL, UNION)',
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Nombre completo del banco según ASFI',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'bancos_autorizados',
  }
);

export default BancoAutorizado;
