import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

/**
 * Modelo ORM: Rol — tabla `roles`
 * DDL: database/01-schemas/04-sistema-seguridad.sql
 */
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
    isSystem: {
      type: DataTypes.BOOLEAN,
      field: 'is_system',
      defaultValue: false,
      comment: 'TRUE = no se puede eliminar desde la UI',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'roles',
  }
);

export default Rol;
