import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

/**
 * Requisito de inscripción de un curso de capacitación (módulo CAP) — tabla
 * `capacitacion_requisitos`. Lista configurable por curso (ej.: «Dos
 * fotocopias de cédula de identidad vigente»).
 */
export const CapacitacionRequisito = sequelize.define(
  'CapacitacionRequisito',
  {
    ...baseModelFields,
    capacitacionId: {
      type: DataTypes.INTEGER,
      field: 'capacitacion_id',
      allowNull: true,
      comment: 'Curso de capacitación',
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Texto del requisito',
    },
    obligatorio: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Obligatorio para pasar a INSCRITO',
    },
    acreditaPagoCurso: {
      type: DataTypes.BOOLEAN,
      field: 'acredita_pago_curso',
      allowNull: false,
      defaultValue: false,
      comment: 'Entregarlo acredita el pago del costo del curso a la entidad certificadora (depósito)',
    },
    orden: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Orden de presentación',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'capacitacion_requisitos',
  }
);

export default CapacitacionRequisito;
