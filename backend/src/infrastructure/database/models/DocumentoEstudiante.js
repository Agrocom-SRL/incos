import { DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize.js';
import { baseModelFields, baseModelOptions } from './baseModel.js';

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
      type: DataTypes.ENUM(
        'INSCRIPCION',
        'LICENCIA',
        'PASANTIA',
        'DESCUENTO',
        'PAGO_INSCRIPCION',
        'PAGO_TITULACION',
        'PAGO_TRASLADO_INSTITUTO',
        'PAGO_CAMBIO_CARRERA',
        'OTRO'
      ),
      field: 'tipo_documento',
      allowNull: false,
      comment: 'Tipo de documento',
    },
    motivoDocumento: {
      type: DataTypes.STRING(200),
      field: 'motivo_documento',
      allowNull: true,
      comment: 'Motivo específico del documento',
    },
    tipoReferencia: {
      type: DataTypes.ENUM(
        'licencias_solicitudes',
        'estudiantes_becas',
        'pasantias_asignaciones',
        'inscripciones',
        'pagos',
        'otro'
      ),
      field: 'tipo_referencia',
      allowNull: true,
      comment: 'Tipo de referencia',
    },
    referenciaId: {
      type: DataTypes.INTEGER,
      field: 'referencia_id',
      allowNull: true,
      comment: 'ID de referencia según tipo_referencia',
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tamanoKb: {
      type: DataTypes.INTEGER,
      field: 'tamano_kb',
      allowNull: true,
      comment: 'Tamaño en kilobytes',
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
      type: DataTypes.ENUM('PENDIENTE', 'APROBADO', 'RECHAZADO', 'REQUERIDO'),
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
