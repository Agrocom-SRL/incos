import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import {
  ESTADOS_REVISION_AVANCE,
  ESTADOS_REVISION_AVANCE_VALUES,
} from '../../../domain/constants/titulacion.constants.js';

/**
 * Avance del proyecto de grado (módulo TUT) — tabla `avances_proyecto`.
 * Archivo digital (pdf/doc/docx) subido por un integrante; el historial de
 * observaciones vive en bitacora_proyecto (tipo REVISION_AVANCE).
 */
export const AvanceProyecto = sequelize.define(
  'AvanceProyecto',
  {
    ...baseModelFields,
    proyectoGradoId: {
      type: DataTypes.INTEGER,
      field: 'proyecto_grado_id',
      allowNull: true,
      comment: 'Proyecto de grado al que pertenece el avance',
    },
    subidoPorEstudianteId: {
      type: DataTypes.INTEGER,
      field: 'subido_por_estudiante_id',
      allowNull: true,
      comment: 'Estudiante que subió el archivo (integrante — validación de aplicación)',
    },
    numeroAvance: {
      type: DataTypes.INTEGER,
      field: 'numero_avance',
      allowNull: true,
      comment: 'Número correlativo del avance dentro del proyecto (1, 2, 3...)',
    },
    titulo: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Título o etiqueta del avance',
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descripción del contenido entregado',
    },
    nombreArchivo: {
      type: DataTypes.STRING(255),
      field: 'nombre_archivo',
      allowNull: false,
      comment: 'Nombre del archivo digital',
    },
    rutaArchivo: {
      type: DataTypes.STRING(500),
      field: 'ruta_archivo',
      allowNull: false,
      comment: 'Ruta del archivo en el servidor',
    },
    extension: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: 'Extensión del archivo (pdf, doc, docx)',
    },
    tipoMime: {
      type: DataTypes.STRING(100),
      field: 'tipo_mime',
      allowNull: true,
      comment: 'Tipo MIME del archivo',
    },
    tamanoBytes: {
      type: DataTypes.BIGINT.UNSIGNED,
      field: 'tamano_bytes',
      allowNull: true,
      comment: 'Tamaño del archivo en bytes',
    },
    estadoRevision: {
      type: DataTypes.ENUM(...ESTADOS_REVISION_AVANCE_VALUES),
      field: 'estado_revision',
      allowNull: true,
      defaultValue: ESTADOS_REVISION_AVANCE.PENDIENTE_REVISION,
      comment: 'PENDIENTE_REVISION | OBSERVADO | SUBSANADO | APROBADO',
    },
    fechaRevision: {
      type: DataTypes.DATEONLY,
      field: 'fecha_revision',
      allowNull: true,
      comment: 'Fecha de la última revisión del tutor',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'avances_proyecto',
  }
);

export default AvanceProyecto;
