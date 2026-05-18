import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import { TIPOS_SECRETARIA_VALUES } from '../../../domain/constants/docentes.constants.js';
import { NIVELES_ACADEMICOS_VALUES } from '../../../domain/constants/docentes.constants.js';
import { TIPOS_CONTRATO_SECRETARIA_VALUES } from '../../../domain/constants/docentes.constants.js';

/**
 * Modelo ORM: Secretaria — tabla `secretarias`
 * DDL: database/01-schemas/23-personal-usuarios.sql
 */
export const Secretaria = sequelize.define(
  'Secretaria',
  {
    ...baseModelFields,
    personalId: {
      type: DataTypes.INTEGER,
      field: 'personal_id',
      allowNull: true,
      comment: 'Referencia a personal.id',
    },
    tipo: {
      type: DataTypes.ENUM(...TIPOS_SECRETARIA_VALUES),
      allowNull: false,
      comment: 'Tipo de secretaria',
    },
    nivelAcademico: {
      type: DataTypes.ENUM(...NIVELES_ACADEMICOS_VALUES),
      field: 'nivel_academico',
      allowNull: true,
    },
    fechaContratacion: {
      type: DataTypes.DATEONLY,
      field: 'fecha_contratacion',
      allowNull: true,
    },
    fechaFinContrato: {
      type: DataTypes.DATEONLY,
      field: 'fecha_fin_contrato',
      allowNull: true,
    },
    tipoContrato: {
      type: DataTypes.ENUM(...TIPOS_CONTRATO_SECRETARIA_VALUES),
      field: 'tipo_contrato',
      allowNull: true,
    },
  },
  {
    ...baseModelOptions,
    tableName: 'secretarias',
  }
);

export default Secretaria;
