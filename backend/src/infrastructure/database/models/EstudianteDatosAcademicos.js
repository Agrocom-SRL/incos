import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';
import { baseModelFields, baseModelOptions } from './baseModel.js';

export const EstudianteDatosAcademicos = sequelize.define(
  'EstudianteDatosAcademicos',
  {
    ...baseModelFields,
    estudianteId: {
      type: DataTypes.INTEGER,
      field: 'estudiante_id',
      allowNull: false,
      comment: 'Estudiante',
    },
    carreraId: {
      type: DataTypes.INTEGER,
      field: 'carrera_id',
      allowNull: false,
      comment: 'Carrera',
    },
    gestionIngresoId: {
      type: DataTypes.INTEGER,
      field: 'gestion_ingreso_id',
      allowNull: false,
      comment: 'Gestión de ingreso',
    },
    estadoAcademico: {
      type: DataTypes.ENUM('REGULAR', 'NIVELACION', 'RETIRADO', 'EGRESADO', 'ABANDONO'),
      field: 'estado_academico',
      allowNull: false,
      defaultValue: 'REGULAR',
      comment: 'Estado académico',
    },
    unidadEducativaProcedencia: {
      type: DataTypes.STRING(200),
      field: 'unidad_educativa_procedencia',
      allowNull: true,
      comment: 'Unidad educativa de procedencia',
    },
    anioEgresoSecundaria: {
      type: DataTypes.INTEGER,
      field: 'anio_egreso_secundaria',
      allowNull: true,
      comment: 'Año de egreso de secundaria',
    },
    promedioAnual: {
      type: DataTypes.DECIMAL(5, 2),
      field: 'promedio_anual',
      allowNull: true,
      comment: 'Promedio anual',
    },
    fechaEgreso: {
      type: DataTypes.DATEONLY,
      field: 'fecha_egreso',
      allowNull: true,
      comment: 'Fecha de egreso',
    },
    fechaRetiro: {
      type: DataTypes.DATEONLY,
      field: 'fecha_retiro',
      allowNull: true,
      comment: 'Fecha de retiro',
    },
    motivoRetiro: {
      type: DataTypes.TEXT,
      field: 'motivo_retiro',
      allowNull: true,
      comment: 'Motivo de retiro/abandono',
    },
    fotoUrl: {
      type: DataTypes.STRING(255),
      field: 'foto_url',
      allowNull: true,
      comment: 'URL de la fotografía',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'estudiantes_datos_academicos',
    defaultScope: {
      where: {
        activo: true,
      },
    },
  }
);
