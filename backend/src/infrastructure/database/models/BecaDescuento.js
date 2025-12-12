import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';
import { baseModelFields, baseModelOptions } from './baseModel.js';

export const BecaDescuento = sequelize.define(
  'BecaDescuento',
  {
    ...baseModelFields,
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Beca 0%, Beca 25%, Beca 50%, Beca 75%, Beca 100%',
    },
    codigo: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'BECA_0, BECA_25, BECA_50, BECA_75, BECA_100',
    },
    porcentaje: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      comment: 'Porcentaje de descuento (0.00 a 100.00)',
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    requiereDocumentacion: {
      type: DataTypes.BOOLEAN,
      field: 'requiere_documentacion',
      defaultValue: true,
      comment: 'Requiere documentos de respaldo',
    },
    requiereAprobacionRector: {
      type: DataTypes.BOOLEAN,
      field: 'requiere_aprobacion_rector',
      defaultValue: false,
      comment: 'Requiere aprobación del Rector (ej: Beca 100%)',
    },
    esAutomatica: {
      type: DataTypes.BOOLEAN,
      field: 'es_automatica',
      defaultValue: false,
      comment: 'Si la beca se asigna automáticamente',
    },
    tipoAutomatica: {
      type: DataTypes.ENUM('PROMEDIO_90', 'MANUAL'),
      field: 'tipo_automatica',
      defaultValue: 'MANUAL',
      comment: 'Tipo de asignación automática',
    },
    promedioMinimo: {
      type: DataTypes.DECIMAL(5, 2),
      field: 'promedio_minimo',
      allowNull: true,
      comment: 'Promedio mínimo requerido (ej: 90 para beca 100%)',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'becas_descuentos',
  }
);

export default BecaDescuento;
