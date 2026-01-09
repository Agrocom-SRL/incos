import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import { ESTADOS_DOCUMENTO_VALUES } from '../../../domain/constants/student.constants.js';

export const DocumentoEstudiante = sequelize.define(
  'DocumentoEstudiante',
  {
    ...baseModelFields,
    estudianteId: {
      type: DataTypes.INTEGER,
      field: 'estudiante_id',
      allowNull: true,
      comment: 'Estudiante',
    },
    tipoDocumento: {
      type: DataTypes.STRING(50),
      field: 'tipo_documento',
      allowNull: true,
      comment: 'Tipo de documento según categoría (INSCRIPCION, LICENCIA, PASANTIA, DESCUENTO, TITULACION, TRASPASO, TRANSFERENCIA, BECA, OTRO). El usuario selecciona el tipo y luego puede elegir un documento específico de ese tipo.',
    },
    documentacionId: {
      type: DataTypes.INTEGER,
      field: 'documentacion_id',
      allowNull: true,
      comment: 'Documento específico de la categoría tipo_documento (referencia a documentacion). NULL si el archivo contiene TODOS los documentos del tipo_documento o múltiples documentos de diferentes tipos.',
    },
    nombreArchivo: {
      type: DataTypes.STRING(255),
      field: 'nombre_archivo',
      allowNull: false,
      comment: 'Nombre del archivo',
    },
    rutaArchivo: {
      type: DataTypes.STRING(500),
      field: 'ruta_archivo',
      allowNull: false,
      comment: 'Ruta del archivo',
    },
    extension: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: 'Extensión del archivo',
    },
    tipoMime: {
      type: DataTypes.STRING(100),
      field: 'tipo_mime',
      allowNull: true,
      comment: 'Tipo MIME del archivo',
    },
    contieneMultipleDocumentos: {
      type: DataTypes.BOOLEAN,
      field: 'contiene_multiple_documentos',
      defaultValue: false,
      comment: 'Indica si el archivo contiene múltiples documentos (TRUE) o un solo documento (FALSE). Si es TRUE y documentacion_id es NULL, el archivo contiene TODOS los documentos del tipo_documento.',
    },
    verificado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Documento verificado',
    },
    verificadoPor: {
      type: DataTypes.INTEGER,
      field: 'verificado_por',
      allowNull: true,
      comment: 'Usuario que verificó',
    },
    fechaVerificacion: {
      type: DataTypes.DATEONLY,
      field: 'fecha_verificacion',
      allowNull: true,
    },
    observacionesVerificacion: {
      type: DataTypes.TEXT,
      field: 'observaciones_verificacion',
      allowNull: true,
    },
    estado: {
      type: DataTypes.ENUM(...ESTADOS_DOCUMENTO_VALUES),
      defaultValue: 'PENDIENTE',
      comment: 'Estado del documento',
    },
    motivoRechazo: {
      type: DataTypes.TEXT,
      field: 'motivo_rechazo',
      allowNull: true,
    },
  },
  {
    ...baseModelOptions,
    tableName: 'documentos_estudiante',
  }
);

export default DocumentoEstudiante;
