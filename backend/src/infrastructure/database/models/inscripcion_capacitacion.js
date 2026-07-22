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
        'PENDIENTE: pago parcial, aún no completa el monto obligatorio | INSCRITO: monto obligatorio cancelado (a tiempo o con pago atrasado, ambos se aceptan igual) | RETIRADO: se retiró estando inscrito | ANULADO: decisión administrativa manual (no automática por incumplir el compromiso de pago)',
    },
    montoObligatorio: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'monto_obligatorio',
      allowNull: false,
      comment:
        'Snapshot de capacitaciones.costo al momento de inscribirse (protege de cambios de precio posteriores)',
    },
    estadoPago: {
      type: DataTypes.ENUM(...ESTADOS_PAGO_INSCRITO_CAPACITACION_VALUES),
      field: 'estado_pago',
      allowNull: false,
      defaultValue: ESTADOS_PAGO_INSCRITO_CAPACITACION.PARCIAL,
      comment:
        'PARCIAL: aún debe saldo (siempre existe al menos el primer pago al crear la fila) | CANCELADO: SUM(capacitacion_pagos.monto) >= monto_obligatorio',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'capacitacion_inscritos',
  }
);

export default InscripcionCapacitacion;
