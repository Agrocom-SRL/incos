import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import { TIPOS_ACTIVIDAD_VALUES } from '../../../domain/constants/gestion.constants.js';

export const Actividad = sequelize.define(
  'Actividad',
  {
    ...baseModelFields,
    nombre: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Nombre de la actividad',
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descripción detallada de la actividad',
    },
    tipo: {
      type: DataTypes.ENUM(...TIPOS_ACTIVIDAD_VALUES),
      allowNull: true,
      comment: 'Tipo de actividad (opcional, NULL si no aplica clasificación)',
    },
    esDestacada: {
      type: DataTypes.BOOLEAN,
      field: 'es_destacada',
      allowNull: false,
      defaultValue: false,
      comment: 'Si es una actividad importante/destacada en el calendario',
    },
    icono: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Nombre del icono para UI (opcional)',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'actividades',
  }
);

export default Actividad;
