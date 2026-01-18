import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

export const ConfiguracionAporte = sequelize.define(
  'ConfiguracionAporte',
  {
    ...baseModelFields,
    gestionId: {
      type: DataTypes.INTEGER,
      field: 'gestion_id',
      allowNull: true,
      comment: 'Gestión académica',
    },
    montoBase: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'monto_base',
      allowNull: false,
      defaultValue: 400.00,
      comment: 'Monto base del aporte académico para esta gestión',
    },
    aporteActivo: {
      type: DataTypes.BOOLEAN,
      field: 'aporte_activo',
      defaultValue: true,
      comment: 'Si el aporte está activo para esta gestión',
    },
    fechaInicio: {
      type: DataTypes.DATEONLY,
      field: 'fecha_inicio',
      allowNull: false,
      comment: 'Fecha desde la cual está vigente el aporte',
    },
    fechaFin: {
      type: DataTypes.DATEONLY,
      field: 'fecha_fin',
      allowNull: true,
      comment: 'Fecha hasta la cual está vigente (NULL = sin límite)',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'configuracion_aportes',
  }
);

export default ConfiguracionAporte;
