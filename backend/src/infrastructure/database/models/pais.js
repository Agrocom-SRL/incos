import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

export const Pais = sequelize.define(
  'Pais',
  {
    ...baseModelFields,
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Nombre del país',
    },
    codigoIso: {
      type: DataTypes.CHAR(3),
      field: 'codigo_iso',
      allowNull: false,
      comment: 'Código ISO 3166-1 alpha-3 (ej: BOL, ARG, PER)',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'paises',
  }
);

export default Pais;
