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
      comment: 'Carrera',
    },
    periodoId: {
      type: DataTypes.INTEGER,
      field: 'periodo_id',
      allowNull: true,
      comment: 'Periodo',
    },
    materiaId: {
      type: DataTypes.INTEGER,
      field: 'materia_id',
      allowNull: true,
      comment: 'Materia',
    },
    ordenVisualizacion: {
      type: DataTypes.INTEGER,
      field: 'orden_visualizacion',
      allowNull: false,
      defaultValue: 1,
      comment: 'Orden de visualización en el plan',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'plan_estudios',
  }
);

export default PlanEstudios;
