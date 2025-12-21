import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';
import { baseModelFields, baseModelOptions } from './baseModel.js';

export const ConfiguracionSistema = sequelize.define(
  'ConfiguracionSistema',
  {
    ...baseModelFields,
    clave: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: 'Clave única de configuración (ej: codigo_estudiante_correlativo_2025)',
    },
    valor: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Valor de la configuración',
    },
    tipo: {
      type: DataTypes.ENUM('STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'DATE'),
      allowNull: false,
      defaultValue: 'STRING',
      comment: 'Tipo de dato del valor',
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descripción de qué representa esta configuración',
    },
    categoria: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Categoría de la configuración (ej: CODIGOS_ESTUDIANTE, NOTIFICACIONES, etc.)',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'configuracion_sistema',
  }
);

export default ConfiguracionSistema;
