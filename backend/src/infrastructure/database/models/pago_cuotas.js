import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

export const PagoCuotas = sequelize.define(
  'PagoCuotas',
  {
    ...baseModelFields,
    pagoAporteId: {
      type: DataTypes.INTEGER,
      field: 'pago_aporte_id',
      allowNull: true,
      comment: 'Cabecera del aporte a la que aplica este pago',
    },
    numeroRecibo: {
      type: DataTypes.STRING(50),
      field: 'numero_recibo',
      allowNull: false,
      comment: 'Número de recibo único por cuota (generado por lógica de negocio)',
    },
    fechaPago: {
      type: DataTypes.DATEONLY,
      field: 'fecha_pago',
      allowNull: false,
      comment: 'Fecha del pago',
    },
    monto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Monto de este pago (sin valor fijo; suma de cuotas = total pagado)',
    },
    metodoPagoId: {
      type: DataTypes.INTEGER,
      field: 'metodo_pago_id',
      allowNull: true,
      comment: 'Método de pago utilizado',
    },
    cuentaPagoId: {
      type: DataTypes.INTEGER,
      field: 'cuenta_pago_id',
      allowNull: true,
      comment: 'Cuenta utilizada (para TRANSFERENCIA/DEPOSITO/QR/TIGO_MONEY)',
    },
    numeroTransaccion: {
      type: DataTypes.STRING(100),
      field: 'numero_transaccion',
      allowNull: true,
      comment: 'Número de transacción/código',
    },
    codigoComprobante: {
      type: DataTypes.STRING(100),
      field: 'codigo_comprobante',
      allowNull: true,
      comment: 'Código del comprobante (requerido para QR/TRANSFERENCIA/DEPOSITO)',
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descripción u observación del pago',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'pago_cuotas',
  }
);

export default PagoCuotas;
