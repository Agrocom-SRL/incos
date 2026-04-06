import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import { TIPOS_REFERENCIA_VALUES } from '../../../domain/constants/usuarios.constants.js';
import { ESTADOS_USUARIOS_VALUES } from '../../../domain/constants/usuarios.constants.js';

/**
 * Modelo ORM: Usuario — tabla `usuarios`
 * DDL: database/01-schemas/04-sistema-seguridad.sql
 */
export const Usuario = sequelize.define(
  'Usuario',
  {
    ...baseModelFields,
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Nombre de usuario',
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      comment: 'Email',
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      field: 'password_hash',
      allowNull: false,
      comment: 'Hash bcrypt de la contraseña',
    },
    fotoUrl: {
      type: DataTypes.STRING(255),
      field: 'foto_url',
      allowNull: true,
      comment: 'URL de la foto de perfil',
    },
    rolId: {
      type: DataTypes.INTEGER,
      field: 'rol_id',
      allowNull: true,
      comment: 'Rol principal del usuario',
    },
    referenciaId: {
      type: DataTypes.INTEGER,
      field: 'referencia_id',
      allowNull: true,
      comment: 'ID de referencia según tipo_referencia',
    },
    tipoReferencia: {
      type: DataTypes.ENUM(...TIPOS_REFERENCIA_VALUES),
      field: 'tipo_referencia',
      allowNull: true,
      comment: 'Tipo de referencia polimórfica',
    },
    estado: {
      type: DataTypes.ENUM(...ESTADOS_USUARIOS_VALUES),
      allowNull: true,
      comment: 'Estado del usuario (NULL = activo)',
    },
    fechaCambioEstado: {
      type: DataTypes.DATE,
      field: 'fecha_cambio_estado',
      allowNull: true,
    },
    motivoCambioEstado: {
      type: DataTypes.TEXT,
      field: 'motivo_cambio_estado',
      allowNull: true,
    },
  },
  {
    ...baseModelOptions,
    tableName: 'usuarios',
  }
);

export default Usuario;
