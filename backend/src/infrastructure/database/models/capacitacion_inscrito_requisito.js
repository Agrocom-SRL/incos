import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

/**
 * Entrega de un requisito por inscripción (módulo CAP) — tabla
 * `capacitacion_inscrito_requisitos` (checklist del participante).
 */
export const CapacitacionInscritoRequisito = sequelize.define(
  'CapacitacionInscritoRequisito',
  {
    ...baseModelFields,
    capacitacionInscritoId: {
      type: DataTypes.INTEGER,
      field: 'capacitacion_inscrito_id',
      allowNull: true,
      comment: 'Inscripción',
    },
    capacitacionRequisitoId: {
      type: DataTypes.INTEGER,
      field: 'capacitacion_requisito_id',
      allowNull: true,
      comment: 'Requisito del curso',
    },
    entregado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'El participante entregó el requisito',
    },
    fechaEntrega: {
      type: DataTypes.DATEONLY,
      field: 'fecha_entrega',
      allowNull: true,
      comment: 'Fecha de entrega',
    },
    observacion: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Nota (ej: falta una fotocopia)',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'capacitacion_inscrito_requisitos',
  }
);

export default CapacitacionInscritoRequisito;
