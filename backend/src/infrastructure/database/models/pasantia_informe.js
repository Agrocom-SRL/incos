import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import {
  TIPOS_INFORME_PASANTIA_VALUES,
  RESULTADOS_INFORME_PASANTIA_VALUES,
} from '../../../domain/constants/pasantias.constants.js';

/**
 * Informe formal de pasantía (módulo TUT · pasantías) — tabla
 * `pasantias_informes` (24-pasantias.sql). Patrón dictamenes_proyecto:
 * "INFORME DE VERIFICACIÓN DE LA EMPRESA..." (VERIFICACION_EMPRESA) y
 * "FORMATO DE CONVALIDACIÓN DE CERTIFICADO DE TRABAJO..."
 * (CONVALIDACION_TRABAJO). El PDF generado en backend se guarda en uploads y
 * se registra aquí (nombre_archivo/ruta_archivo).
 */
export const PasantiaInforme = sequelize.define(
  'PasantiaInforme',
  {
    ...baseModelFields,
    pasantiaId: {
      type: DataTypes.INTEGER,
      field: 'pasantia_id',
      allowNull: true,
      comment: 'Trámite de pasantía (referencia a pasantias)',
    },
    tipo: {
      type: DataTypes.ENUM(...TIPOS_INFORME_PASANTIA_VALUES),
      allowNull: false,
      comment: 'VERIFICACION_EMPRESA | CONVALIDACION_TRABAJO',
    },
    docenteId: {
      type: DataTypes.INTEGER,
      field: 'docente_id',
      allowNull: true,
      comment: 'Docente que eleva el informe (referencia a docentes)',
    },
    numeroMemo: {
      type: DataTypes.STRING(50),
      field: 'numero_memo',
      allowNull: true,
      comment: 'Cite del memo de instrucción (ej: MEMO/INCOS/DA/N°.../2025)',
    },
    fechaVerificacion: {
      type: DataTypes.DATEONLY,
      field: 'fecha_verificacion',
      allowNull: true,
      comment: 'Fecha de la verificación en la empresa',
    },
    fechaEmision: {
      type: DataTypes.DATEONLY,
      field: 'fecha_emision',
      allowNull: true,
      comment: 'Fecha de emisión del informe',
    },
    destinatario: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: 'Instancia destinataria (ej: Rectorado, vía Dirección Académica)',
    },
    areaRelacionada: {
      type: DataTypes.STRING(150),
      field: 'area_relacionada',
      allowNull: true,
      comment: 'Área de trabajo relacionada con la carrera (conclusión del informe)',
    },
    evaluacionCualitativa: {
      type: DataTypes.TEXT,
      field: 'evaluacion_cualitativa',
      allowNull: true,
      comment: 'Evaluación cualitativa del docente en convalidación; NULL en verificación',
    },
    resultado: {
      type: DataTypes.ENUM(...RESULTADOS_INFORME_PASANTIA_VALUES),
      allowNull: true,
      comment: 'Viabilidad SI/NO (verificación) o validez de la convalidación',
    },
    contenido: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Cuerpo/resumen del informe',
    },
    nombreArchivo: {
      type: DataTypes.STRING(255),
      field: 'nombre_archivo',
      allowNull: true,
      comment: 'Nombre del archivo PDF del informe',
    },
    rutaArchivo: {
      type: DataTypes.STRING(500),
      field: 'ruta_archivo',
      allowNull: true,
      comment: 'Ruta del archivo en el servidor',
    },
    extension: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: 'Extensión (pdf)',
    },
    tipoMime: {
      type: DataTypes.STRING(100),
      field: 'tipo_mime',
      allowNull: true,
      comment: 'Tipo MIME',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'pasantias_informes',
  }
);

export default PasantiaInforme;
