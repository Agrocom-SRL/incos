import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

export const CuentaPago = sequelize.define(
  'CuentaPago',
  {
    ...baseModelFields,
    metodoPagoId: {
      type: DataTypes.INTEGER,
      field: 'metodo_pago_id',
      allowNull: true,
      comment: 'Método de pago (TRANSFERENCIA, DEPOSITO, QR, TIGO_MONEY)',
    },
    bancoId: {
      type: DataTypes.INTEGER,
      field: 'banco_id',
      allowNull: true,
      comment: 'Banco asociado (para TRANSFERENCIA, DEPOSITO, QR. NULL para TIGO_MONEY)',
    },
    nombreTitular: {
      type: DataTypes.STRING(200),
      field: 'nombre_titular',
      allowNull: false,
      comment: 'Nombre completo del titular de la cuenta',
    },
    numeroCuenta: {
      type: DataTypes.STRING(50),
      field: 'numero_cuenta',
      allowNull: true,
      comment: 'Número de cuenta bancaria (para TRANSFERENCIA, DEPOSITO, QR)',
    },
    numeroCelular: {
      type: DataTypes.STRING(20),
      field: 'numero_celular',
      allowNull: true,
      comment: 'Número de celular del titular (para TIGO_MONEY)',
    },
    qrImagenUrl: {
      type: DataTypes.STRING(500),
      field: 'qr_imagen_url',
      allowNull: true,
      comment: 'Ruta/URL de la imagen del código QR activo (solo para método QR)',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'cuentas_pago',
  }
);

export default CuentaPago;
