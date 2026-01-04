import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

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
      type: DataTypes.ENUM('VER', 'CREAR', 'EDITAR', 'ELIMINAR', 'APROBAR', 'EXPORTAR'),
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
