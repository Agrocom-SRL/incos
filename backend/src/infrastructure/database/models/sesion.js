import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import { TIPOS_DISPOSITIVO_VALUES } from '../../../domain/constants/usuarios.constants.js';

/**
 * Modelo ORM: Sesion — tabla `sesiones`
 * DDL: database/01-schemas/04-sistema-seguridad.sql
 */
export const Sesion = sequelize.define(
  'Sesion',
  {
    ...baseModelFields,
    usuarioId: {
      type: DataTypes.INTEGER,
      field: 'usuario_id',
      allowNull: true,
      comment: 'Usuario de la sesión',
    },
    tokenSesion: {
      type: DataTypes.STRING(500),
      field: 'token_sesion',
      allowNull: true,
      comment: 'Token JWT o similar de la sesión activa',
    },
    tokenRecuperacion: {
      type: DataTypes.STRING(255),
      field: 'token_recuperacion',
      allowNull: true,
      comment: 'Token para recuperación de contraseña',
    },
    fechaExpiracion: {
      type: DataTypes.DATE,
      field: 'fecha_expiracion',
      allowNull: true,
      comment: 'Fecha de expiración de la sesión',
    },
    ultimoLogin: {
      type: DataTypes.DATE,
      field: 'ultimo_login',
      allowNull: true,
      comment: 'Última vez que inició sesión',
    },
    ipUltimoLogin: {
      type: DataTypes.STRING(45),
      field: 'ip_ultimo_login',
      allowNull: true,
      comment: 'IP del último login (IPv4 o IPv6)',
    },
    dispositivo: {
      type: DataTypes.ENUM(...TIPOS_DISPOSITIVO_VALUES),
      allowNull: true,
      comment: 'Tipo de dispositivo: MOVIL, TABLET, DESKTOP',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'sesiones',
  }
);

export default Sesion;
