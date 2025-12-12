import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';
import { baseModelFields, baseModelOptions } from './baseModel.js';

export const Provincia = sequelize.define(
  'Provincia',
  {
    ...baseModelFields,
    departamentoId: {
      type: DataTypes.INTEGER,
      field: 'departamento_id',
      allowNull: true,
      comment: 'Departamento al que pertenece',
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Nombre de la provincia',
    },
    codigo: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: 'Código abreviado',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'provincias',
  }
);

export default Provincia;
