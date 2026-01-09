import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

export const PlanEstudios = sequelize.define(
  'PlanEstudios',
  {
    ...baseModelFields,
    carreraId: {
      type: DataTypes.INTEGER,
      field: 'carrera_id',
      allowNull: true,
      comment: 'Carrera a la que pertenece este plan de estudios',
    },
    nombrePlan: {
      type: DataTypes.STRING(150),
      field: 'nombre_plan',
      allowNull: false,
      comment: 'Nombre del plan de estudios (ej: Plan de Estudios 2024)',
    },
    resolucionMinisterial: {
      type: DataTypes.STRING(100),
      field: 'resolucion_ministerial',
      allowNull: true,
      comment: 'Número de resolución ministerial que aprueba este plan (ej: No.0210/2023)',
    },
    documentoRuta: {
      type: DataTypes.STRING(500),
      field: 'documento_ruta',
      allowNull: true,
      comment: 'Ruta del documento oficial de la RM (ej: /uploads/resoluciones/RM-0210-2023.pdf)',
    },
    duracionAnios: {
      type: DataTypes.INTEGER,
      field: 'duracion_anios',
      allowNull: false,
      comment: 'Duración en años del plan (ej: 3, 4)',
    },
    cargaHorariaTotal: {
      type: DataTypes.INTEGER,
      field: 'carga_horaria_total',
      allowNull: false,
      comment: 'Carga horaria total del plan (ej: 3600 hrs)',
    },
    horasSemana: {
      type: DataTypes.INTEGER,
      field: 'horas_semana',
      allowNull: false,
      comment: 'Horas semanales (ej: 30 hrs)',
    },
    horasMes: {
      type: DataTypes.INTEGER,
      field: 'horas_mes',
      allowNull: false,
      comment: 'Horas mensuales - indica semanas por mes (ej: 120 hrs)',
    },
    horasAnio: {
      type: DataTypes.INTEGER,
      field: 'horas_anio',
      allowNull: false,
      comment: 'Horas anuales - indica meses académicos (ej: 1200 hrs = 10 meses)',
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observaciones sobre cambios o características del plan',
    },
    vigente: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica si es el plan actualmente vigente para nuevas inscripciones',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'planes_estudios',
  }
);

export default PlanEstudios;
