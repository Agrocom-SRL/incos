import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './baseModel.js';

export const Periodo = sequelize.define(
  'Periodo',
  {
    ...baseModelFields,
    carreraId: {
      type: DataTypes.INTEGER,
      field: 'carrera_id',
      allowNull: true,
      comment: 'Carrera a la que pertenece',
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Nombre del periodo (ej: 1º Semestre, 2º Semestre)',
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
