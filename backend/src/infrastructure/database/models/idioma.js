import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

export const Idioma = sequelize.define(
  'Idioma',
  {
    ...baseModelFields,
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Español, Quechua, Aymara, Guaraní, Inglés',
    },
    codigoIso: {
      type: DataTypes.CHAR(3),
      field: 'codigo_iso',
      allowNull: true,
      comment: 'spa, quz, aym, grn, eng',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'idiomas',
  }
);

export default Idioma;
