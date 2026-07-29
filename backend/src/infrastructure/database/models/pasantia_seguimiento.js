import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import { NIVELES_DESEMPENO_PASANTIA_VALUES } from '../../../domain/constants/pasantias.constants.js';

/**
 * Seguimiento de pasantía (módulo TUT · pasantías) — tabla
 * `pasantias_seguimientos` (24-pasantias.sql). Réplica del "FORMULARIO DE
 * SEGUIMIENTO DE PASANTÍA": evaluación del pasante con sello y firma del
 * docente de INCOS y de la empresa (equivalente digital en booleans).
 */
export const PasantiaSeguimiento = sequelize.define(
  'PasantiaSeguimiento',
  {
    ...baseModelFields,
    pasantiaId: {
      type: DataTypes.INTEGER,
      field: 'pasantia_id',
      allowNull: true,
      comment: 'Trámite de pasantía (referencia a pasantias)',
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Fecha del seguimiento',
    },
    descripcionTrabajo: {
      type: DataTypes.TEXT,
      field: 'descripcion_trabajo',
      allowNull: true,
      comment: 'Descripción del trabajo realizado (formulario de seguimiento)',
    },
    principalesActividades: {
      type: DataTypes.TEXT,
      field: 'principales_actividades',
      allowNull: true,
      comment: 'Principales actividades (formulario de seguimiento)',
    },
    nivelDesempeno: {
      type: DataTypes.ENUM(...NIVELES_DESEMPENO_PASANTIA_VALUES),
      field: 'nivel_desempeno',
      allowNull: true,
      comment: 'Nivel de desempeño ALTO/MEDIO/BAJO (escala única del formulario)',
    },
    fortalezas: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Fortalezas observadas (formulario)',
    },
    areasMejorar: {
      type: DataTypes.TEXT,
      field: 'areas_mejorar',
      allowNull: true,
      comment: 'Áreas en que debe mejorar (formulario)',
    },
    sugerencias: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Sugerencias para el proceso de pasantías (formulario)',
    },
    firmadoDocente: {
      type: DataTypes.BOOLEAN,
      field: 'firmado_docente',
      allowNull: true,
      defaultValue: false,
      comment: 'Formulario con sello y firma del docente de INCOS (equivalente digital)',
    },
    firmadoEmpresa: {
      type: DataTypes.BOOLEAN,
      field: 'firmado_empresa',
      allowNull: true,
      defaultValue: false,
      comment: 'Formulario con sello y firma de la empresa (equivalente digital)',
    },
    nombreArchivo: {
      type: DataTypes.STRING(255),
      field: 'nombre_archivo',
      allowNull: true,
      comment: 'Nombre del archivo escaneado del formulario firmado y sellado',
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
      comment: 'Extensión (pdf, jpg)',
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
    tableName: 'pasantias_seguimientos',
  }
);

export default PasantiaSeguimiento;
