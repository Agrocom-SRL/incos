import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

export const Materia = sequelize.define(
  'Materia',
  {
    ...baseModelFields,
    codigo: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'Código de la materia',
    },
    nombre: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Nombre de la materia',
    },
    nombreCorto: {
      type: DataTypes.STRING(100),
      field: 'nombre_corto',
      allowNull: true,
      comment: 'Nombre abreviado',
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cargaHorariaTeorica: {
      type: DataTypes.INTEGER,
      field: 'carga_horaria_teorica',
      allowNull: false,
      defaultValue: 0,
      comment: 'Horas teóricas totales',
    },
    cargaHorariaPractica: {
      type: DataTypes.INTEGER,
      field: 'carga_horaria_practica',
      allowNull: false,
      defaultValue: 0,
      comment: 'Horas prácticas totales',
    },
    creditos: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: true,
      comment: 'Créditos académicos',
    },
    tipo: {
      type: DataTypes.ENUM('TEORICA', 'PRACTICA', 'TEORICA_PRACTICA'),
      defaultValue: 'TEORICA_PRACTICA',
      comment: 'Tipo de materia según su naturaleza',
    },
    areaConocimiento: {
      type: DataTypes.STRING(100),
      field: 'area_conocimiento',
      allowNull: true,
      comment: 'Área de conocimiento',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'materias',
  }
);

export default Materia;
