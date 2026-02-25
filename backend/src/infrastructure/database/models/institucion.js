import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

/**
 * Modelo Sequelize: Institucion
 * Tabla: instituciones
 * Basado en 15-transitabilidades.sql
 */
export const Institucion = sequelize.define(
  'Institucion',
  {
    ...baseModelFields,
    nombre: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Nombre completo de la institución',
    },
    tipo: {
      type: DataTypes.ENUM('UETHP', 'CEA', 'ITT', 'UNIVERSIDAD'),
      allowNull: false,
      comment:
        'Tipo de institución: UETHP (Unidad Educativa Técnica Humanística Plena), CEA (Centro de Educación Alternativa), ITT (Instituto Técnico y Tecnológico), UNIVERSIDAD',
    },
    dependencia: {
      type: DataTypes.ENUM('FISCAL', 'CONVENIO', 'PRIVADO'),
      allowNull: true,
      comment: 'Dependencia institucional: FISCAL, CONVENIO o PRIVADO',
    },
    codigoSie: {
      type: DataTypes.STRING(20),
      field: 'codigo_sie',
      allowNull: true,
      comment: 'Código SIE-UE del sistema de información educativa',
    },
    departamentoId: {
      type: DataTypes.INTEGER,
      field: 'departamento_id',
      allowNull: true,
      comment: 'Departamento donde se ubica la institución (referencia a departamentos)',
    },
    distritoEducativo: {
      type: DataTypes.STRING(100),
      field: 'distrito_educativo',
      allowNull: true,
      comment: 'Distrito educativo al que pertenece',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'instituciones',
  }
);

export default Institucion;

