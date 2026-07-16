import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import {
  ESTADOS_INSCRIPCION_CAPACITACION,
  ESTADOS_INSCRIPCION_CAPACITACION_VALUES,
} from '../../../domain/constants/capacitacion.constants.js';

/**
 * Inscripción de un participante a una capacitación (módulo CAP) — tabla
 * `capacitacion_inscritos` (no "inscripciones", que ya existe con otro
 * significado en la matrícula formal). Sin UNIQUE en
 * (participante_id, capacitacion_id): la regla "una inscripción activa" se
 * garantiza en lógica de negocio.
 */
export const InscripcionCapacitacion = sequelize.define(
  'InscripcionCapacitacion',
  {
    ...baseModelFields,
    participanteId: {
      type: DataTypes.INTEGER,
      field: 'participante_id',
      allowNull: true,
      comment: 'Participante inscrito',
    },
    capacitacionId: {
      type: DataTypes.INTEGER,
      field: 'capacitacion_id',
      allowNull: true,
      comment: 'Curso de capacitación',
    },
    fechaInscripcion: {
      type: DataTypes.DATEONLY,
      field: 'fecha_inscripcion',
      allowNull: false,
      comment: 'Fecha en que se registró la inscripción',
    },
    estado: {
      type: DataTypes.ENUM(...ESTADOS_INSCRIPCION_CAPACITACION_VALUES),
      allowNull: false,
      defaultValue: ESTADOS_INSCRIPCION_CAPACITACION.INSCRITO,
      comment: 'Estado de la inscripción (INSCRITO/RETIRADO)',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'capacitacion_inscritos',
  }
);

export default InscripcionCapacitacion;
