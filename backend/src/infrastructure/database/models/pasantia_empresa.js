import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import { TIPOS_SOCIETARIO_EMPRESA_VALUES } from '../../../domain/constants/pasantias.constants.js';

/**
 * Empresa/institución para práctica laboral (módulo TUT · pasantías) — tabla
 * `pasantias_empresas` (24-pasantias.sql). Catálogo con ABM propio; campos
 * según el "INFORME DE VERIFICACIÓN DE LA EMPRESA Y DE SU ACTIVIDAD PARA
 * REALIZAR LA PASANTÍA LABORAL".
 */
export const PasantiaEmpresa = sequelize.define(
  'PasantiaEmpresa',
  {
    ...baseModelFields,
    nombre: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Nombre de la empresa/institución (informe de verificación)',
    },
    nombreComercial: {
      type: DataTypes.STRING(200),
      field: 'nombre_comercial',
      allowNull: true,
      comment: 'Nombre comercial o de fantasía, si difiere de la razón social',
    },
    tipoSocietario: {
      type: DataTypes.ENUM(...TIPOS_SOCIETARIO_EMPRESA_VALUES),
      field: 'tipo_societario',
      allowNull: true,
      comment: 'Unipersonal / S.R.L. / S.A.; PUBLICA/OTRO para no societarias',
    },
    nit: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'NIT (informe de verificación)',
    },
    enFuncionamiento: {
      type: DataTypes.BOOLEAN,
      field: 'en_funcionamiento',
      allowNull: true,
      comment: 'Empresa en funcionamiento al momento de la verificación',
    },
    direccion: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Dirección: calle/Av. y número',
    },
    telefono: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Teléfono o celular de la empresa (hoja de seguimiento)',
    },
    sectorActividad: {
      type: DataTypes.STRING(150),
      field: 'sector_actividad',
      allowNull: true,
      comment: 'Sector o actividad económica (informe de verificación)',
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observaciones generales',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'pasantias_empresas',
  }
);

export default PasantiaEmpresa;
