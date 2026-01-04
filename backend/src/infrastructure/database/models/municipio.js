import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

export const Municipio = sequelize.define(
  'Municipio',
  {
    ...baseModelFields,
    provinciaId: {
      type: DataTypes.INTEGER,
      field: 'provincia_id',
      allowNull: true,
      comment: 'Provincia a la que pertenece',
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Nombre del municipio',
    },
    codigo: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: 'Código abreviado',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'municipios',
  }
);

export default Municipio;
