import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import {
  ORIGENES_ESTUDIANTE_SESION,
  ORIGENES_ESTUDIANTE_SESION_VALUES,
  PROGRESOS_ESTUDIANTE_SESION,
  PROGRESOS_ESTUDIANTE_SESION_VALUES,
} from '../../../domain/constants/tutorias.constants.js';

/**
 * Estudiante (por matrícula) de una sesión de refuerzo (módulo TUT) — tabla
 * `sesion_refuerzo_estudiantes`. Ancla al estudiante por su matrícula
 * en la materia reforzada (matriculas_materia), no por estudiante suelto.
 */
export const SesionRefuerzoEstudiante = sequelize.define(
  'SesionRefuerzoEstudiante',
  {
    ...baseModelFields,
    sesionRefuerzoId: {
      type: DataTypes.INTEGER,
      field: 'sesion_refuerzo_id',
      allowNull: true,
      comment: 'Sesión (referencia a sesiones_refuerzo)',
    },
    matriculaMateriaId: {
      type: DataTypes.INTEGER,
      field: 'matricula_materia_id',
      allowNull: true,
      comment: 'Matrícula del estudiante en la materia reforzada (matriculas_materia)',
    },
    origen: {
      type: DataTypes.ENUM(...ORIGENES_ESTUDIANTE_SESION_VALUES),
      allowNull: true,
      defaultValue: ORIGENES_ESTUDIANTE_SESION.RIESGO,
      comment: 'RIESGO: por alerta | DOCENTE: invitado | VOLUNTARIO',
    },
    asistio: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: 'NULL: sin registrar | TRUE: asistió | FALSE: faltó',
    },
    progreso: {
      type: DataTypes.ENUM(...PROGRESOS_ESTUDIANTE_SESION_VALUES),
      allowNull: true,
      defaultValue: PROGRESOS_ESTUDIANTE_SESION.SIN_EVALUAR,
      comment: 'Valoración del docente sobre el progreso tras la sesión',
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observaciones del docente sobre el estudiante',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'sesion_refuerzo_estudiantes',
  }
);

export default SesionRefuerzoEstudiante;
