import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';
import { baseModelFields, baseModelOptions } from './baseModel.js';

export const Rol = sequelize.define(
  'Rol',
  {
    ...baseModelFields,
    codigo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Código único del rol',
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Nombre descriptivo del rol',
    },
    nivelAcceso: {
      type: DataTypes.INTEGER,
      field: 'nivel_acceso',
      defaultValue: 1,
      comment: 'Nivel jerárquico (1=bajo, 5=alto)',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'roles',
  }
);

export default Rol;
