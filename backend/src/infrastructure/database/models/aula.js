import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import { CATEGORIAS_AULA_VALUES, CATEGORIAS_AULA } from '../../../domain/constants/cursos.constants.js';

export const Aula = sequelize.define(
  'Aula',
  {
    ...baseModelFields,
    codigo: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'Código del aula (ej: Lab-1, Lab-2, Aula-8)',
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Nombre descriptivo del aula',
    },
    categoria: {
      type: DataTypes.ENUM(...CATEGORIAS_AULA_VALUES),
      defaultValue: CATEGORIAS_AULA.AULA,
      comment: 'Categoría del espacio según su diseño y construcción',
    },
    capacidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 35,
      comment: 'Capacidad máxima de estudiantes',
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observaciones: ubicación, equipamiento, restricciones, etc.',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'aulas',
  }
);

export default Aula;
