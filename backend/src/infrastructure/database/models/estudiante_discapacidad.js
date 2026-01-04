import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

export const EstudianteDiscapacidad = sequelize.define(
  'EstudianteDiscapacidad',
  {
    ...baseModelFields,
    estudianteId: {
      type: DataTypes.INTEGER,
      field: 'estudiante_id',
      allowNull: true,
      comment: 'Estudiante',
    },
    tipoDiscapacidadId: {
      type: DataTypes.INTEGER,
      field: 'tipo_discapacidad_id',
      allowNull: true,
      comment: 'Tipo de discapacidad',
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descripción detallada de la discapacidad específica del estudiante',
    },
    gradoDiscapacidad: {
      type: DataTypes.ENUM('LEVE', 'MODERADO', 'SEVERO', 'PROFUNDO'),
      field: 'grado_discapacidad',
      allowNull: true,
      comment: 'Grado de discapacidad',
    },
    causa: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Causa de la discapacidad (congénito, adquirido, etc.)',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'estudiantes_discapacidades',
    defaultScope: {
      where: {
        activo: true,
      },
    },
  }
);

export default EstudianteDiscapacidad;

