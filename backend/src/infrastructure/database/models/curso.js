import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

export const Curso = sequelize.define(
  'Curso',
  {
    ...baseModelFields,
    materiaId: {
      type: DataTypes.INTEGER,
      field: 'materia_id',
      allowNull: true,
      comment: 'Materia del curso',
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Nombre del paralelo/grupo (ej: Grupo A, Sección 1)',
    },
    codigo: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Código identificador del curso',
    },
    cupoMaximo: {
      type: DataTypes.INTEGER,
      field: 'cupo_maximo',
      allowNull: false,
      defaultValue: 35,
      comment: 'Máximo de estudiantes permitidos',
    },
    cupoMinimo: {
      type: DataTypes.INTEGER,
      field: 'cupo_minimo',
      allowNull: true,
      defaultValue: 10,
      comment: 'Mínimo de estudiantes para abrir el curso',
    },
    estado: {
      type: DataTypes.ENUM('PROPUESTO', 'APROBADO', 'CANCELADO'),
      defaultValue: 'PROPUESTO',
      comment: 'Estado del curso',
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    ...baseModelOptions,
    tableName: 'cursos',
  }
);

export default Curso;
