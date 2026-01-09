import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

export const Materia = sequelize.define(
  'Materia',
  {
    ...baseModelFields,
    sigla: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'Sigla de la materia (ej: CON-101, PRG-202, INT-102)',
    },
    nombre: {
      type: DataTypes.STRING(250),
      allowNull: false,
      comment: 'Nombre completo de la materia',
    },
    objetivos: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Objetivos de aprendizaje de la materia',
    },
    clasificacion: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: 'Clasificación de la materia (ej: CONTABILIDAD, PROGRAMACIÓN, IDIOMAS, FORMACIÓN GENERAL)',
    },
    tipo: {
      type: DataTypes.ENUM('TEORICA', 'PRACTICA', 'TEORICA_PRACTICA'),
      defaultValue: 'TEORICA_PRACTICA',
      comment: 'Naturaleza pedagógica: TEORICA (aula), PRACTICA (lab/taller/campo), TEORICA_PRACTICA (mixta)',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'materias',
  }
);

export default Materia;
