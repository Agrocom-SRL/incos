import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

export const CursoHorario = sequelize.define(
  'CursoHorario',
  {
    ...baseModelFields,
    cursoId: {
      type: DataTypes.INTEGER,
      field: 'curso_id',
      allowNull: true,
      comment: 'Curso al que pertenece este horario',
    },
    horarioId: {
      type: DataTypes.INTEGER,
      field: 'horario_id',
      allowNull: true,
      comment: 'Bloque horario (día + hora) de la tabla horarios',
    },
    aulaId: {
      type: DataTypes.INTEGER,
      field: 'aula_id',
      allowNull: true,
      comment: 'Aula o laboratorio asignado para este bloque',
    },
    ordenSecuencia: {
      type: DataTypes.INTEGER,
      field: 'orden_secuencia',
      allowNull: false,
      defaultValue: 1,
      comment: 'Orden del bloque en la semana (1, 2, 3, 4). Indica qué bloque se dicta primero, segundo, etc.',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'cursos_horarios',
  }
);

export default CursoHorario;
