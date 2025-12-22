import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './baseModel.js';

export const Carrera = sequelize.define(
  'Carrera',
  {
    ...baseModelFields,
    codigo: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: 'Código de la carrera',
    },
    nombre: {
      type: DataTypes.STRING(150),
      allowNull: false,
      comment: 'Nombre de la carrera',
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    duracionAnios: {
      type: DataTypes.INTEGER,
      field: 'duracion_anios',
      allowNull: false,
      defaultValue: 4,
      comment: 'Duración en años académicos',
    },
    tituloOtorgado: {
      type: DataTypes.STRING(200),
      field: 'titulo_otorgado',
      allowNull: true,
    },
    resolucionMinisterial: {
      type: DataTypes.STRING(100),
      field: 'resolucion_ministerial',
      allowNull: true,
    },
    fechaVigencia: {
      type: DataTypes.DATEONLY,
      field: 'fecha_vigencia',
      allowNull: true,
    },
    cargaHorariaTotal: {
      type: DataTypes.INTEGER,
      field: 'carga_horaria_total',
      allowNull: true,
    },
    colorHex: {
      type: DataTypes.STRING(7),
      field: 'color_hex',
      allowNull: true,
      comment: 'Color para UI',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'carreras',
  }
);

export default Carrera;
