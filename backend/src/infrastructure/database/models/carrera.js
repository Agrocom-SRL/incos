import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

export const Carrera = sequelize.define(
  'Carrera',
  {
    ...baseModelFields,
    codigo: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'Código de la carrera (ej: SIS-INF, ADM-EMP, CON-GEN)',
    },
    nombre: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Nombre completo de la carrera',
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descripción del perfil profesional de la carrera',
    },
    areaFormacion: {
      type: DataTypes.STRING(150),
      field: 'area_formacion',
      allowNull: true,
      comment: 'Área de formación (ej: COMERCIAL Y SERVICIOS, TECNOLOGÍA, SALUD)',
    },
    tituloOtorgado: {
      type: DataTypes.STRING(250),
      field: 'titulo_otorgado',
      allowNull: true,
      comment: 'Título profesional que otorga (ej: Técnico Superior en Sistemas Informáticos)',
    },
    colorHex: {
      type: DataTypes.STRING(7),
      field: 'color_hex',
      allowNull: true,
      comment: 'Color identificador en formato hexadecimal (ej: #FF5733) para dashboards y tarjetas',
    },
    imagenRuta: {
      type: DataTypes.STRING(500),
      field: 'imagen_ruta',
      allowNull: true,
      comment: 'Ruta relativa de la imagen (ej: /uploads/carreras/1_SIS-INF.webp) o URL completa si es externa',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'carreras',
  }
);

export default Carrera;
