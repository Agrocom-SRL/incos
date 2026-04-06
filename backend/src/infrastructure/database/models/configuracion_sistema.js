import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import { TIPOS_CONFIGURACION_VALUES, TIPOS_CONFIGURACION } from '../../../domain/constants/sistema.constants.js';

/**
 * Modelo ORM: ConfiguracionSistema — tabla `configuracion_sistema`
 * DDL: database/01-schemas/03-catalogos-referencia.sql
 */
export const ConfiguracionSistema = sequelize.define(
  'ConfiguracionSistema',
  {
    ...baseModelFields,
    clave: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Clave única de configuración (ej: codigo_estudiante_correlativo_2025)',
    },
    valor: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Valor de la configuración',
    },
    tipo: {
      type: DataTypes.ENUM(...TIPOS_CONFIGURACION_VALUES),
      allowNull: false,
      defaultValue: TIPOS_CONFIGURACION.STRING,
      comment: 'Tipo de dato del valor',
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descripción de qué representa esta configuración',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'configuracion_sistema',
  }
);

export default ConfiguracionSistema;
