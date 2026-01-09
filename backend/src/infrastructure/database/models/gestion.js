import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

export const Gestion = sequelize.define(
  'Gestion',
  {
    ...baseModelFields,
    codigo: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'Código único de la gestión (ej: 2025-REG, 2025-VER, 2025-NIV)',
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Nombre descriptivo de la gestión (ej: Gestión Regular 2025, Curso de Verano 2025)',
    },
    anio: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Año académico principal',
    },
    tipo: {
      type: DataTypes.ENUM('REGULAR', 'VERANO', 'INVIERNO', 'NIVELACION', 'EXTRAORDINARIA'),
      allowNull: false,
      defaultValue: 'REGULAR',
      comment: 'Tipo de gestión',
    },
    fechaInicio: {
      type: DataTypes.DATEONLY,
      field: 'fecha_inicio',
      allowNull: false,
      comment: 'Fecha de inicio de la gestión',
    },
    fechaFin: {
      type: DataTypes.DATEONLY,
      field: 'fecha_fin',
      allowNull: false,
      comment: 'Fecha de fin de la gestión',
    },
    vigente: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Si la gestión está actualmente vigente',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'gestiones',
  }
);

export default Gestion;
