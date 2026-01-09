import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

export const Periodo = sequelize.define(
  'Periodo',
  {
    ...baseModelFields,
    planEstudioId: {
      type: DataTypes.INTEGER,
      field: 'plan_estudio_id',
      allowNull: true,
      comment: 'Plan de estudios al que pertenece este periodo',
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Nombre del periodo (ej: Primer Año, Segundo Año, Tercer Año)',
    },
    numero: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Número del periodo (1, 2, 3, 4...)',
    },
    ordenVisualizacion: {
      type: DataTypes.INTEGER,
      field: 'orden_visualizacion',
      allowNull: false,
      defaultValue: 1,
      comment: 'Orden de visualización',
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    ...baseModelOptions,
    tableName: 'periodos',
  }
);

export default Periodo;
