import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import { ACCIONES_PERMISOS_VALUES } from '../../../domain/constants/usuarios.constants.js';

/**
 * Modelo ORM: RolPermiso — tabla `roles_permisos`
 * DDL: database/01-schemas/04-sistema-seguridad.sql
 */
export const RolPermiso = sequelize.define(
  'RolPermiso',
  {
    ...baseModelFields,
    rolId: {
      type: DataTypes.INTEGER,
      field: 'rol_id',
      allowNull: true,
      comment: 'ID del rol',
    },
    permisoId: {
      type: DataTypes.INTEGER,
      field: 'permiso_id',
      allowNull: true,
      comment: 'ID del permiso',
    },
    accion: {
      type: DataTypes.ENUM(...ACCIONES_PERMISOS_VALUES),
      allowNull: false,
      comment: 'Acción específica permitida',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'roles_permisos',
  }
);

export default RolPermiso;
