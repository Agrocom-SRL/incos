import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import { ESTADOS_ACADEMICOS_FOLIO_VALUES } from '../../../domain/constants/libros.constants.js';

/**
 * Fila de estudiante dentro de un folio del centralizador (schema 25):
 * columnas N°, ESTADO y OBSERVACIONES del documento impreso. Las notas por
 * materia NO se copian aquí — las provee el dominio calificaciones (vista 135).
 */
export const FolioEstudiante = sequelize.define(
    'FolioEstudiante',
    {
        ...baseModelFields,

        folioId: {
            type: DataTypes.INTEGER,
            field: 'folio_id',
            allowNull: true,
            comment: 'Folio/página del centralizador (referencia a folios_libro)',
        },

        numeroOrden: {
            type: DataTypes.INTEGER,
            field: 'numero_orden',
            allowNull: true,
            comment: 'Columna N°: correlativo del estudiante en el paralelo (continúa entre folios)',
        },

        estudianteId: {
            type: DataTypes.INTEGER,
            field: 'estudiante_id',
            allowNull: true,
            comment: 'Estudiante de la fila (referencia a estudiantes)',
        },

        inscripcionId: {
            type: DataTypes.INTEGER,
            field: 'inscripcion_id',
            allowNull: true,
            comment: 'Inscripción que liga estudiante y paralelo_gestion en la gestión del folio',
        },

        estadoAcademico: {
            type: DataTypes.ENUM(...ESTADOS_ACADEMICOS_FOLIO_VALUES),
            field: 'estado_academico',
            allowNull: true,
            comment: 'Columna ESTADO del centralizador, congelada al firmar el folio',
        },

        observaciones: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: 'Columna OBSERVACIONES del centralizador (ej: REPROBADO 2DA VEZ-ARTICULO 18)',
        },
    },
    {
        ...baseModelOptions,
        tableName: 'folio_estudiantes',
    }
);

export default FolioEstudiante;
