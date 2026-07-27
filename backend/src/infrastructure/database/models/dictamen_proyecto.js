import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import {
  TIPOS_DICTAMEN_TUTORIA_VALUES,
  RESULTADOS_DICTAMEN_TUTORIA_VALUES,
} from '../../../domain/constants/tutorias.constants.js';

/**
 * Dictamen de tutoría (módulo TUT) — tabla `dictamenes_proyecto`.
 * Informes formales: Viabilidad Técnica (aprobación final del tutor) y
 * Designación Oficial de tutor (PDF para la DDE). El PDF generado en backend
 * se guarda en uploads y se registra aquí (nombre_archivo/ruta_archivo).
 */
export const DictamenProyecto = sequelize.define(
  'DictamenProyecto',
  {
    ...baseModelFields,
    proyectoGradoId: {
      type: DataTypes.INTEGER,
      field: 'proyecto_grado_id',
      allowNull: true,
      comment: 'Proyecto de grado (referencia a proyectos_grado)',
    },
    tipo: {
      type: DataTypes.ENUM(...TIPOS_DICTAMEN_TUTORIA_VALUES),
      allowNull: false,
      comment: 'VIABILIDAD_TECNICA | DESIGNACION_OFICIAL',
    },
    numeroInforme: {
      type: DataTypes.STRING(50),
      field: 'numero_informe',
      allowNull: true,
      comment: 'Número/cite del informe (ej: INF-DA-015/2026)',
    },
    resultado: {
      type: DataTypes.ENUM(...RESULTADOS_DICTAMEN_TUTORIA_VALUES),
      allowNull: true,
      comment: 'Resultado del dictamen (aplica a VIABILIDAD_TECNICA)',
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
      comment: 'Instancia destinataria (ej: DDE, Dirección Académica)',
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
      comment: 'Nombre del archivo PDF generado',
    },
    rutaArchivo: {
      type: DataTypes.STRING(500),
      field: 'ruta_archivo',
      allowNull: true,
      comment: 'Ruta del PDF en el servidor',
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
    tableName: 'dictamenes_proyecto',
  }
);

export default DictamenProyecto;
