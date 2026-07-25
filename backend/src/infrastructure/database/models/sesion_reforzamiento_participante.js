import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import {
  ORIGENES_PARTICIPANTE_SESION,
  ORIGENES_PARTICIPANTE_SESION_VALUES,
  PROGRESOS_PARTICIPANTE_SESION,
  PROGRESOS_PARTICIPANTE_SESION_VALUES,
} from '../../../domain/constants/tutorias.constants.js';

/**
 * Participante de sesión de reforzamiento (módulo TUT) — tabla
 * `sesion_reforzamiento_participantes`. Ancla al estudiante por su matrícula
 * en la materia reforzada (matriculas_materia), no por estudiante suelto.
 */
export const SesionReforzamientoParticipante = sequelize.define(
  'SesionReforzamientoParticipante',
  {
    ...baseModelFields,
    sesionReforzamientoId: {
      type: DataTypes.INTEGER,
      field: 'sesion_reforzamiento_id',
      allowNull: true,
      comment: 'Sesión (referencia a sesiones_reforzamiento)',
    },
    matriculaMateriaId: {
      type: DataTypes.INTEGER,
      field: 'matricula_materia_id',
      allowNull: true,
      comment: 'Matrícula del estudiante en la materia reforzada (matriculas_materia)',
    },
    origen: {
      type: DataTypes.ENUM(...ORIGENES_PARTICIPANTE_SESION_VALUES),
      allowNull: true,
      defaultValue: ORIGENES_PARTICIPANTE_SESION.RIESGO,
      comment: 'RIESGO: por alerta | DOCENTE: invitado | VOLUNTARIO',
    },
    asistio: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: 'NULL: sin registrar | TRUE: asistió | FALSE: faltó',
    },
    progreso: {
      type: DataTypes.ENUM(...PROGRESOS_PARTICIPANTE_SESION_VALUES),
      allowNull: true,
      defaultValue: PROGRESOS_PARTICIPANTE_SESION.SIN_EVALUAR,
      comment: 'Valoración del docente sobre el progreso tras la sesión',
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observaciones del docente sobre el participante',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'sesion_reforzamiento_participantes',
  }
);

export default SesionReforzamientoParticipante;
