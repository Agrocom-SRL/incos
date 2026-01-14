import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import { ESTADOS_CURSOS_VALUES, ESTADOS_CURSOS } from '../../../domain/constants/cursos.constants.js';

export const Curso = sequelize.define(
  'Curso',
  {
    ...baseModelFields,
    codigo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Código identificador del curso (ej: SIS-1A-NOCHE-PRG102)',
    },
    paraleloId: {
      type: DataTypes.INTEGER,
      field: 'paralelo_id',
      allowNull: true,
      comment: 'Paralelo al que pertenece este curso',
    },
    asignaturaPlanId: {
      type: DataTypes.INTEGER,
      field: 'asignatura_plan_id',
      allowNull: true,
      comment: 'Asignatura del plan (incluye: materia + periodo + plan + horas_semanales)',
    },
    cupoMaximo: {
      type: DataTypes.INTEGER,
      field: 'cupo_maximo',
      allowNull: true,
      defaultValue: 35,
      comment: 'Cupo máximo de estudiantes para este curso',
    },
    cupoMinimo: {
      type: DataTypes.INTEGER,
      field: 'cupo_minimo',
      allowNull: true,
      defaultValue: 10,
      comment: 'Cupo mínimo requerido para abrir el curso',
    },
    colorHex: {
      type: DataTypes.STRING(7),
      field: 'color_hex',
      allowNull: true,
      comment: 'Color identificador en formato hexadecimal (ej: #FF5733) para horarios y calendarios',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'cursos',
  }
);

export default Curso;
