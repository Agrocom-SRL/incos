import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

export const Prerrequisito = sequelize.define(
  'Prerrequisito',
  {
    ...baseModelFields,
    planEstudioId: {
      type: DataTypes.INTEGER,
      field: 'plan_estudio_id',
      allowNull: true,
      comment: 'Plan de estudios (redundancia controlada para performance en queries)',
    },
    asignaturaId: {
      type: DataTypes.INTEGER,
      field: 'asignatura_id',
      allowNull: true,
      comment: 'Asignatura que requiere el prerrequisito (la que quieres cursar)',
    },
    prerrequisitoId: {
      type: DataTypes.INTEGER,
      field: 'prerrequisito_id',
      allowNull: true,
      comment: 'Asignatura que debe aprobarse antes (el prerrequisito)',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'prerrequisitos',
  }
);

export default Prerrequisito;
