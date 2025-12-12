import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';
import { baseModelFields, baseModelOptions } from './baseModel.js';

export const EstadoCivil = sequelize.define(
  'EstadoCivil',
  {
    ...baseModelFields,
    nombre: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'Soltero(a), Casado(a), Divorciado(a), Viudo(a), Conviviente',
    },
    abreviatura: {
      type: DataTypes.STRING(5),
      allowNull: true,
      comment: 'S, C, D, V, CV',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'estados_civiles',
  }
);

export default EstadoCivil;
