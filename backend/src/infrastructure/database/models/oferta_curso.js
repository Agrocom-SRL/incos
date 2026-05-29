import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import {
  ESTADOS_OFERTA_CURSO_VALUES,
  ESTADOS_OFERTA_CURSO,
} from '../../../domain/constants/oferta.constants.js';

export const OfertaCurso = sequelize.define(
  'OfertaCurso',
  {
    ...baseModelFields,
    paraleloGestionId: {
      type: DataTypes.INTEGER,
      field: 'paralelo_gestion_id',
      allowNull: true,
      comment: 'Paralelo en su gestión',
    },
    asignaturaPlanId: {
      type: DataTypes.INTEGER,
      field: 'asignatura_plan_id',
      allowNull: true,
      comment: 'Asignatura del plan ofertada',
    },
    estado: {
      type: DataTypes.ENUM(...ESTADOS_OFERTA_CURSO_VALUES),
      defaultValue: ESTADOS_OFERTA_CURSO.PROGRAMADA,
      comment: 'Estado de la oferta del curso',
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observaciones',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'oferta_cursos',
  }
);

export default OfertaCurso;
