import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import { InscripcionCapacitacion } from './inscripcion_capacitacion.js';
import {
  ESTADOS_COMPROMISO_CAPACITACION,
  ESTADOS_COMPROMISO_CAPACITACION_VALUES,
} from '../../../domain/constants/capacitacion.constants.js';

/**
 * Compromiso de pago de una inscripción a capacitación (módulo CAP) — tabla
 * `capacitacion_compromisos`. Mismo rol que `compromiso_pago.js` (fecha
 * acordada para cancelar el saldo pendiente) pero colgado de
 * `capacitacion_inscritos` en vez de `pago_aporte`: una capacitación no tiene
 * gestión y el participante puede no ser estudiante.
 *
 * Uso administrativo/informativo (reportes de pago atrasado) — NUNCA bloquea
 * ni anula `capacitacion_inscritos` de forma automática: un pago atrasado se
 * acepta con total normalidad (ver `25-cursos-capacitacion.sql`).
 */
export const CapacitacionCompromiso = sequelize.define(
  'CapacitacionCompromiso',
  {
    ...baseModelFields,
    capacitacionInscritoId: {
      type: DataTypes.INTEGER,
      field: 'capacitacion_inscrito_id',
      allowNull: true,
      comment: 'Inscripción a la que aplica el compromiso',
    },
    fechaCompromiso: {
      type: DataTypes.DATEONLY,
      field: 'fecha_compromiso',
      allowNull: false,
      comment: 'Fecha acordada para cancelar el saldo pendiente',
    },
    observacion: {
      type: DataTypes.STRING(500),
      field: 'observacion',
      allowNull: true,
      comment: 'Nota del compromiso (condiciones, respaldo)',
    },
    estado: {
      type: DataTypes.ENUM(...ESTADOS_COMPROMISO_CAPACITACION_VALUES),
      allowNull: false,
      defaultValue: ESTADOS_COMPROMISO_CAPACITACION.VIGENTE,
      comment:
        'VIGENTE=en plazo | CUMPLIDO=saldo cancelado (a tiempo o tarde) | INCUMPLIDO=venció sin cancelar (informativo, no bloquea nada)',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'capacitacion_compromisos',
  }
);

// Asociación con la inscripción (no hay associations centralizadas en el
// proyecto; se declara aquí como en el resto de modelos relacionados).
CapacitacionCompromiso.belongsTo(InscripcionCapacitacion, {
  foreignKey: 'capacitacionInscritoId',
  targetKey: 'id',
  as: 'inscripcionCapacitacion',
});

export default CapacitacionCompromiso;
