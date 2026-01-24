import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

export const EstudianteApoderado = sequelize.define(
  'EstudianteApoderado',
  {
    ...baseModelFields,
    estudianteId: {
      type: DataTypes.INTEGER,
      field: 'estudiante_id',
      allowNull: true,
      comment: 'Estudiante',
    },
    tipoParentescoId: {
      type: DataTypes.INTEGER,
      field: 'tipo_parentesco_id',
      allowNull: true,
      comment: 'Tipo de parentesco (padre, madre, abuelo, tío, tutor, apoderado, orfanato, etc.)',
    },
    nombres: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: 'Nombres completos del apoderado/tutor',
    },
    apellidos: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: 'Apellidos del apoderado/tutor',
    },
    celular1: {
      type: DataTypes.STRING(20),
      field: 'celular_1',
      allowNull: true,
      comment: 'Celular 1',
    },
    celular2: {
      type: DataTypes.STRING(20),
      field: 'celular_2',
      allowNull: true,
      comment: 'Celular 2',
    },
    viveConEstudiante: {
      type: DataTypes.BOOLEAN,
      field: 'vive_con_estudiante',
      defaultValue: false,
      comment: 'Vive con el estudiante',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'estudiantes_apoderados',
  }
);

export default EstudianteApoderado;
