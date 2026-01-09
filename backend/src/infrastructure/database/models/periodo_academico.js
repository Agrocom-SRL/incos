import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

export const PeriodoAcademico = sequelize.define(
  'PeriodoAcademico',
  {
    ...baseModelFields,
    gestionId: {
      type: DataTypes.INTEGER,
      field: 'gestion_id',
      allowNull: true,
      comment: 'Gestión académica (NULL permite flexibilidad)',
    },
    codigo: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Código del periodo autogenerado (ej: 2025-PLAN, 2025-BIM1, 2025-CLAU)',
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Nombre del periodo (ej: Planificación, Primer Bimestre, Clausura)',
    },
    division: {
      type: DataTypes.ENUM(
        'PLANIFICACION',
        'MENSUAL',
        'BIMESTRE',
        'TRIMESTRE',
        'CUATRIMESTRE',
        'SEMESTRE',
        'CLAUSURA',
        'OTRO'
      ),
      allowNull: false,
      comment: 'División/tipo de periodo académico',
    },
    numeroOrden: {
      type: DataTypes.INTEGER,
      field: 'numero_orden',
      allowNull: true,
      comment: 'Orden del periodo (1, 2, 3, 4 para bimestres; NULL para periodos únicos como planificación/clausura)',
    },
    fechaInicio: {
      type: DataTypes.DATEONLY,
      field: 'fecha_inicio',
      allowNull: false,
      comment: 'Fecha de inicio del periodo',
    },
    fechaFin: {
      type: DataTypes.DATEONLY,
      field: 'fecha_fin',
      allowNull: false,
      comment: 'Fecha de fin del periodo',
    },
    colorHex: {
      type: DataTypes.STRING(7),
      field: 'color_hex',
      allowNull: true,
      comment: 'Color para mostrar en calendario (ej: #4CAF50 planificación, #2196F3 bimestres, #9E9E9E clausura)',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'periodos_academicos',
  }
);

export default PeriodoAcademico;
