import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import { TIPOS_ORIGEN_VALUES, TIPOS_ORIGEN } from '../../../domain/constants/estudiantes.constants.js';

export const EstudianteOrigen = sequelize.define(
  'EstudianteOrigen',
  {
    ...baseModelFields,
    estudianteId: {
      type: DataTypes.INTEGER,
      field: 'estudiante_id',
      allowNull: true,
      comment: 'Estudiante',
    },
    paisId: {
      type: DataTypes.INTEGER,
      field: 'pais_id',
      allowNull: true,
      comment: 'País de origen/nacionalidad (NULL si es Bolivia y se usa municipio_nacimiento_id)',
    },
    municipioNacimientoId: {
      type: DataTypes.INTEGER,
      field: 'municipio_nacimiento_id',
      allowNull: true,
      comment: 'Municipio de nacimiento (solo si es Bolivia, contiene toda la info geográfica)',
    },
    ciudadNacimiento: {
      type: DataTypes.STRING(100),
      field: 'ciudad_nacimiento',
      allowNull: true,
      comment: 'Ciudad/localidad de nacimiento (para extranjeros o localidad específica en Bolivia)',
    },
    idiomaMaternoId: {
      type: DataTypes.INTEGER,
      field: 'idioma_materno_id',
      allowNull: true,
      comment: 'Idioma materno del país de origen o comunidad donde nació (relacionado con este origen específico)',
    },
    idiomaSecundarioId: {
      type: DataTypes.INTEGER,
      field: 'idioma_secundario_id',
      allowNull: true,
      comment: 'Idioma secundario que más habla relacionado con este origen',
    },
    tipoOrigen: {
      type: DataTypes.ENUM(...TIPOS_ORIGEN_VALUES),
      field: 'tipo_origen',
      allowNull: true,
      defaultValue: TIPOS_ORIGEN.BOLIVIANA,
      comment: 'Tipo de nacionalidad: BOLIVIANA (usa municipio_nacimiento_id), EXTRANJERA (usa pais_id y ciudad_nacimiento), DOBLE_NACIONALIDAD (requiere dos registros con es_principal TRUE y FALSE)',
    },
    esPrincipal: {
      type: DataTypes.BOOLEAN,
      field: 'es_principal',
      allowNull: true,
      defaultValue: true,
      comment: 'Indica si es la nacionalidad/origen principal',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'estudiantes_origenes',
  }
);

export default EstudianteOrigen;

