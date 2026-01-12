import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import { ESTADOS_GESTION_PLAN_VALUES, ESTADOS_GESTION_PLAN } from '../../../domain/constants/cursos.constants.js';

export const GestionPlan = sequelize.define(
  'GestionPlan',
  {
    ...baseModelFields,
    gestionId: {
      type: DataTypes.INTEGER,
      field: 'gestion_id',
      allowNull: true,
      comment: 'Gestión académica donde se habilita el plan',
    },
    planEstudioId: {
      type: DataTypes.INTEGER,
      field: 'plan_estudio_id',
      allowNull: true,
      comment: 'Plan de estudios habilitado',
    },
    nombre: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Nombre descriptivo (ej: Oferta Gestión 2025 - Plan 2023 Sistemas Informáticos)',
    },
    estado: {
      type: DataTypes.ENUM(...ESTADOS_GESTION_PLAN_VALUES),
      defaultValue: ESTADOS_GESTION_PLAN.PROPUESTO,
      comment: 'Estado de habilitación del plan en esta gestión',
    },
    motivoCancelacion: {
      type: DataTypes.TEXT,
      field: 'motivo_cancelacion',
      allowNull: true,
      comment: 'Motivo si fue cancelado',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'gestiones_planes',
  }
);

export default GestionPlan;
