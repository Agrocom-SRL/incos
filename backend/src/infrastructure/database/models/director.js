import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

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
      type: DataTypes.ENUM('ACADEMICO', 'ADMINISTRATIVO'),
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
      type: DataTypes.ENUM('TECNICO', 'LICENCIATURA', 'MAESTRIA', 'DOCTORADO'),
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
