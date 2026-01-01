import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './baseModel.js';

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
      type: DataTypes.ENUM('ACADEMICA', 'ADMINISTRATIVA'),
      allowNull: false,
      comment: 'Tipo de secretaria',
    },
    nivelAcademico: {
      type: DataTypes.ENUM('ESTUDIANTE', 'TECNICO', 'LICENCIATURA', 'MAESTRIA', 'DOCTORADO'),
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
      type: DataTypes.ENUM('EVENTUAL', 'TEMPORAL', 'INDEFINIDO'),
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
