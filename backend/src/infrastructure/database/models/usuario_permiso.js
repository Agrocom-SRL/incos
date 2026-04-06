import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import {
  ACCIONES_PERMISOS_VALUES,
  TIPOS_USUARIO_PERMISO_VALUES,
} from '../../../domain/constants/usuarios.constants.js';

/**
 * Modelo ORM: UsuarioPermiso — tabla `usuarios_permisos`
 * DDL: database/01-schemas/04-sistema-seguridad.sql
 */
export const UsuarioPermiso = sequelize.define(
  'UsuarioPermiso',
  {
    ...baseModelFields,
    usuarioId: {
      type: DataTypes.INTEGER,
      field: 'usuario_id',
      allowNull: true,
      comment: 'Usuario afectado por el override',
    },
    permisoId: {
      type: DataTypes.INTEGER,
      field: 'permiso_id',
      allowNull: true,
      comment: 'Permiso afectado',
    },
    accion: {
      type: DataTypes.ENUM(...ACCIONES_PERMISOS_VALUES),
      allowNull: false,
      comment: 'Acción del override',
    },
    tipo: {
      type: DataTypes.ENUM(...TIPOS_USUARIO_PERMISO_VALUES),
      allowNull: false,
      comment: 'GRANT o REVOKE',
    },
    motivo: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Razón documentada del override',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'usuarios_permisos',
  }
);

export default UsuarioPermiso;
