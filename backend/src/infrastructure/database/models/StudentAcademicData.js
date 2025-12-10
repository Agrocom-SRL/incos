import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';

export const StudentAcademicData = sequelize.define(
  'StudentAcademicData',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
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
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Registro activo/inactivo',
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
      allowNull: false,
    },
    deletedAt: {
      type: DataTypes.DATE,
      field: 'deleted_at',
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      field: 'created_by',
      allowNull: true,
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      field: 'updated_by',
      allowNull: true,
    },
    deletedBy: {
      type: DataTypes.INTEGER,
      field: 'deleted_by',
      allowNull: true,
    },
  },
  {
    tableName: 'estudiantes_datos_academicos',
    timestamps: true,
    underscored: true,
    paranoid: true,
    defaultScope: {
      where: {
        activo: true,
      },
    },
  }
);
