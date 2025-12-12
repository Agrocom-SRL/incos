import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';
import { baseModelFields, baseModelOptions } from './baseModel.js';

export const Departamento = sequelize.define(
  'Departamento',
  {
    ...baseModelFields,
    paisId: {
      type: DataTypes.INTEGER,
      field: 'pais_id',
      allowNull: true,
      comment: 'País al que pertenece',
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Nombre del departamento',
    },
    codigo: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: 'Código abreviado (SC, LP, CB, etc.)',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'departamentos',
  }
);

export default Departamento;
