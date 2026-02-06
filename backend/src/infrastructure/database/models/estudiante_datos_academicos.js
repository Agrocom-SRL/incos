import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import { ESTADOS_ACADEMICOS_VALUES, ESTADOS_ACADEMICOS, ESTADOS_REGISTRO_ESTUDIANTE_VALUES, ESTADOS_REGISTRO_ESTUDIANTE, TIPOS_ADMISION_VALUES, TIPOS_ADMISION } from '../../../domain/constants/estudiantes.constants.js';

export const EstudianteDatosAcademicos = sequelize.define(
  'EstudianteDatosAcademicos',
  {
    ...baseModelFields,
    estudianteId: {
      type: DataTypes.INTEGER,
      field: 'estudiante_id',
      allowNull: true,
      comment: 'Estudiante (NULL permite flexibilidad en migraciones)',
    },
    carreraId: {
      type: DataTypes.INTEGER,
      field: 'carrera_id',
      allowNull: true,
      comment: 'Carrera (NULL permite flexibilidad en migraciones)',
    },
    gestionIngresoId: {
      type: DataTypes.INTEGER,
      field: 'gestion_ingreso_id',
      allowNull: true,
      comment: 'Gestión de ingreso (NULL permite flexibilidad en migraciones)',
    },
    estadoAcademico: {
      type: DataTypes.ENUM(...ESTADOS_ACADEMICOS_VALUES),
      field: 'estado_academico',
      allowNull: false,
      defaultValue: ESTADOS_ACADEMICOS.REGULAR,
      comment: 'Estado académico',
    },
    estadoRegistro: {
      type: DataTypes.ENUM(...ESTADOS_REGISTRO_ESTUDIANTE_VALUES),
      field: 'estado_registro',
      allowNull: false,
      defaultValue: ESTADOS_REGISTRO_ESTUDIANTE.BORRADOR,
      comment: 'Estado del proceso de registro: BORRADOR (datos completos, documentos pendientes), PENDIENTE (al menos un documento original), ADMITIDO (todos los documentos originales verificados)',
    },
    tipoAdmision: {
      type: DataTypes.ENUM(...TIPOS_ADMISION_VALUES),
      field: 'tipo_admision',
      allowNull: false,
      defaultValue: TIPOS_ADMISION.NUEVO,
      comment: 'Tipo de admisión del estudiante: NUEVO, ANTIGUO, TRANSITABILIDAD, TRASPASO',
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
