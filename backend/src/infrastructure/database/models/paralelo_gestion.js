import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import { TURNOS_VALUES } from '../../../domain/constants/cursos.constants.js';
import {
  ESTADOS_PARALELO_GESTION_VALUES,
  ESTADOS_PARALELO_GESTION,
} from '../../../domain/constants/oferta.constants.js';

export const ParaleloGestion = sequelize.define(
  'ParaleloGestion',
  {
    ...baseModelFields,
    gestionPlanId: {
      type: DataTypes.INTEGER,
      field: 'gestion_plan_id',
      allowNull: true,
      comment: 'Plan habilitado en la gestión',
    },
    paraleloId: {
      type: DataTypes.INTEGER,
      field: 'paralelo_id',
      allowNull: true,
      comment: 'Paralelo maestro reutilizable',
    },
    aulaId: {
      type: DataTypes.INTEGER,
      field: 'aula_id',
      allowNull: true,
      comment: 'Aula base del paralelo en esta gestión',
    },
    turno: {
      type: DataTypes.ENUM(...TURNOS_VALUES),
      allowNull: false,
      comment: 'Turno efectivo en la gestión',
    },
    estado: {
      type: DataTypes.ENUM(...ESTADOS_PARALELO_GESTION_VALUES),
      defaultValue: ESTADOS_PARALELO_GESTION.BORRADOR,
      comment: 'Estado de la oferta del paralelo',
    },
    cupoMaximo: {
      type: DataTypes.INTEGER,
      field: 'cupo_maximo',
      defaultValue: 35,
      comment: 'Cupo máximo',
    },
    cupoMinimo: {
      type: DataTypes.INTEGER,
      field: 'cupo_minimo',
      defaultValue: 10,
      comment: 'Cupo mínimo',
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observaciones',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'paralelos_gestion',
  }
);

export default ParaleloGestion;
