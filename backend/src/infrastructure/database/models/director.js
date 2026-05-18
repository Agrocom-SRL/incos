import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import { TIPOS_DIRECTOR_VALUES } from '../../../domain/constants/docentes.constants.js';
import { NIVELES_ACADEMICOS_PERSONAL_VALUES } from '../../../domain/constants/docentes.constants.js';

/**
 * Modelo ORM: Director — tabla `directores`
 * DDL: database/01-schemas/23-personal-usuarios.sql
 */
export const Director = sequelize.define(
  'Director',
  {
    ...baseModelFields,
    personalId: {
      type: DataTypes.INTEGER,
      field: 'personal_id',
      allowNull: true,
      comment: 'Referencia a personal.id',
    },
    tipo: {
      type: DataTypes.ENUM(...TIPOS_DIRECTOR_VALUES),
      allowNull: false,
      comment: 'Tipo de director',
    },
    fechaNombramiento: {
      type: DataTypes.DATEONLY,
      field: 'fecha_nombramiento',
      allowNull: true,
    },
    resolucionNombramiento: {
      type: DataTypes.STRING(100),
      field: 'resolucion_nombramiento',
      allowNull: true,
    },
    tituloProfesional: {
      type: DataTypes.STRING(200),
      field: 'titulo_profesional',
      allowNull: true,
    },
    especialidad: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    nivelAcademico: {
      type: DataTypes.ENUM(...NIVELES_ACADEMICOS_PERSONAL_VALUES),
      field: 'nivel_academico',
      allowNull: true,
    },
    institucionEgreso: {
      type: DataTypes.STRING(200),
      field: 'institucion_egreso',
      allowNull: true,
    },
    anioEgreso: {
      type: DataTypes.INTEGER,
      field: 'anio_egreso',
      allowNull: true,
    },
  },
  {
    ...baseModelOptions,
    tableName: 'directores',
  }
);

export default Director;
