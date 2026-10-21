import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import {
  ESTADOS_INSCRIPCION_CAPACITACION,
  ESTADOS_INSCRIPCION_CAPACITACION_VALUES,
  ESTADOS_PAGO_INSCRITO_CAPACITACION,
  ESTADOS_PAGO_INSCRITO_CAPACITACION_VALUES,
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
      defaultValue: ESTADOS_INSCRIPCION_CAPACITACION.PENDIENTE,
      comment:
        'PENDIENTE: falta saldo (matrícula o curso) o requisitos obligatorios | INSCRITO: matrícula y curso cancelados y requisitos obligatorios entregados | RETIRADO: se retiró estando inscrito | ANULADO: decisión administrativa manual (no automática por incumplir el compromiso de pago)',
    },
    montoObligatorio: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'monto_obligatorio',
      allowNull: false,
      comment:
        'Snapshot de capacitaciones.costo (costo del CURSO) al momento de inscribirse (protege de cambios de precio posteriores)',
    },
    montoMatricula: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'monto_matricula',
      allowNull: false,
      defaultValue: 0,
      comment: 'Snapshot de capacitaciones.costo_matricula al momento de inscribirse',
    },
    estadoPagoMatricula: {
      type: DataTypes.ENUM(...ESTADOS_PAGO_INSCRITO_CAPACITACION_VALUES),
      field: 'estado_pago_matricula',
      allowNull: false,
      defaultValue: ESTADOS_PAGO_INSCRITO_CAPACITACION.PARCIAL,
      comment: 'CANCELADO: pagos MATRICULA >= monto_matricula (o la matrícula es 0)',
    },
    estadoPagoCurso: {
      type: DataTypes.ENUM(...ESTADOS_PAGO_INSCRITO_CAPACITACION_VALUES),
      field: 'estado_pago_curso',
      allowNull: false,
      defaultValue: ESTADOS_PAGO_INSCRITO_CAPACITACION.PARCIAL,
      comment: 'CANCELADO: pagos CURSO >= monto_obligatorio',
    },
    capacitacionGrupoId: {
      type: DataTypes.INTEGER,
      field: 'capacitacion_grupo_id',
      allowNull: true,
      comment: 'Grupo elegido (capacitacion_grupos.id); NULL = curso sin grupos',
    },
    estadoPago: {
      type: DataTypes.ENUM(...ESTADOS_PAGO_INSCRITO_CAPACITACION_VALUES),
      field: 'estado_pago',
      allowNull: false,
      defaultValue: ESTADOS_PAGO_INSCRITO_CAPACITACION.PARCIAL,
      comment:
        'Global: CANCELADO solo si matrícula y curso están cancelados; PARCIAL en otro caso',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'capacitacion_inscritos',
  }
);

export default InscripcionCapacitacion;
