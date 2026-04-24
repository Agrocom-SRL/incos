import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

/**
 * Modelo ORM: Permiso — tabla `permisos`
 * DDL: database/01-schemas/04-sistema-seguridad.sql
 */
export const Permiso = sequelize.define(
  'Permiso',
  {
    ...baseModelFields,
    codigo: {
      type: DataTypes.STRING(250),
      allowNull: false,
      comment: 'Código de dominio alineado al frontend (permiso en routes.jsx)',
    },
    nombre: {
      type: DataTypes.STRING(150),
      allowNull: false,
      comment: 'Nombre legible para administración',
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descripción detallada del permiso',
    },
    dominio: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Dominio de negocio (MATRICULA, ACADEMICO, …)',
    },
    modulo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Subdominio técnico (MAT, ACA, …)',
    },
    grupoUi: {
      type: DataTypes.STRING(100),
      field: 'grupo_ui',
      allowNull: true,
      comment: 'Agrupador UI para grilla de permisos',
    },
    rutaSidebar: {
      type: DataTypes.STRING(150),
      field: 'ruta_sidebar',
      allowNull: true,
      comment: 'Ruta de referencia del sidebar para este permiso',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'permisos',
  }
);

export default Permiso;
