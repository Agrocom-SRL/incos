import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import { ESTADOS_PAGO_APORTE_VALUES, ESTADOS_PAGO_APORTE } from '../../../domain/constants/pagos.constants.js';

export const PagoAporte = sequelize.define(
  'PagoAporte',
  {
    ...baseModelFields,
    estudianteId: {
      type: DataTypes.INTEGER,
      field: 'estudiante_id',
      allowNull: true,
      comment: 'Estudiante que debe el aporte',
    },
    gestionId: {
      type: DataTypes.INTEGER,
      field: 'gestion_id',
      allowNull: true,
      comment: 'Gestión académica del aporte (una cabecera por estudiante por gestión)',
    },
    estudianteBecaId: {
      type: DataTypes.INTEGER,
      field: 'estudiante_beca_id',
      allowNull: true,
      comment: 'Beca/descuento aplicado UNA SOLA VEZ por gestión (referencia a estudiantes_becas). Solo un registro por cabecera.',
    },
    montoBase: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'monto_base',
      allowNull: false,
      comment: 'Monto base del aporte para esta gestión (de configuracion_aportes)',
    },
    descuentoBeca: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'descuento_beca',
      allowNull: false,
      defaultValue: 0.0,
      comment: 'Descuento por beca aplicado a esta cabecera (una vez por gestión)',
    },
    montoObligatorio: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'monto_obligatorio',
      allowNull: false,
      comment: 'Monto a pagar = monto_base - descuento_beca',
    },
    estado: {
      type: DataTypes.ENUM(...ESTADOS_PAGO_APORTE_VALUES),
      allowNull: false,
      defaultValue: ESTADOS_PAGO_APORTE.PENDIENTE,
      comment: 'PENDIENTE=sin pagos, PARCIAL=algún pago, CANCELADO=total pagado >= monto_obligatorio',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'pago_aporte',
  }
);

export default PagoAporte;
