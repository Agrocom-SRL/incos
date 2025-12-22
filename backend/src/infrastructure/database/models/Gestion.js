import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';
import { baseModelFields, baseModelOptions } from './baseModel.js';

export const Gestion = sequelize.define(
  'gestiones',
  {
    ...baseModelFields,
    codigo: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'Código de la gestión (ej: 2025-1, 2025-2)',
    },
    anio: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Año académico',
    },
    imagenPromocionUrl: {
      type: DataTypes.STRING(500),
      field: 'imagen_promocion_url',
      allowNull: true,
    },
    fechaInicioAdministrativa: {
      type: DataTypes.DATEONLY,
      field: 'fecha_inicio_administrativa',
      allowNull: false,
      comment: 'Fecha de inicio administrativo de la gestión',
    },
    fechaFinAdministrativa: {
      type: DataTypes.DATEONLY,
      field: 'fecha_fin_administrativa',
      allowNull: false,
      comment: 'Fecha de fin administrativo de la gestión',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'gestiones',
  }
);

export default Gestion;
