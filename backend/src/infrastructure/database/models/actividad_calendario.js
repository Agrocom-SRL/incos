import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

export const ActividadCalendario = sequelize.define(
  'ActividadCalendario',
  {
    ...baseModelFields,
    periodoAcademicoId: {
      type: DataTypes.INTEGER,
      field: 'periodo_academico_id',
      allowNull: true,
      comment: 'Periodo académico al que pertenece',
    },
    actividadId: {
      type: DataTypes.INTEGER,
      field: 'actividad_id',
      allowNull: true,
      comment: 'Referencia a la actividad del catálogo (NULL si es actividad única sin catálogo)',
    },
    codigo: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Código autogenerado (ej: 2025-BIM1-001, 2025-PLAN-005)',
    },
    nombrePersonalizado: {
      type: DataTypes.STRING(200),
      field: 'nombre_personalizado',
      allowNull: true,
      comment: 'Nombre personalizado para esta instancia (NULL usa el del catálogo). Incluye detalles como año de carrera si aplica.',
    },
    carrerasIds: {
      type: DataTypes.JSON,
      field: 'carreras_ids',
      allowNull: true,
      comment: 'Array de IDs de carreras específicas a las que aplica esta actividad (NULL = todas las carreras). Ej: [1,2] para Contaduría y Administración',
    },
    fechaInicio: {
      type: DataTypes.DATEONLY,
      field: 'fecha_inicio',
      allowNull: false,
      comment: 'Fecha de inicio de la actividad',
    },
    fechaFin: {
      type: DataTypes.DATEONLY,
      field: 'fecha_fin',
      allowNull: true,
      comment: 'Fecha de fin (NULL si es actividad de un solo día)',
    },
    suspendeClases: {
      type: DataTypes.BOOLEAN,
      field: 'suspende_clases',
      allowNull: false,
      defaultValue: false,
      comment: 'TRUE = este día NO se pasa clase (feriado, receso, vacaciones); neutro en asistencia',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'actividades_calendario',
  }
);

export default ActividadCalendario;
