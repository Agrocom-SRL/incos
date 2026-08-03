import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import { ESTADOS_FOLIO, ESTADOS_FOLIO_VALUES } from '../../../domain/constants/libros.constants.js';

/**
 * Folio = página del centralizador de calificaciones de un paralelo (schema 25).
 * Hasta 10 estudiantes por página; numero_folio correlativo del libro (cruza
 * paralelos y años/cursos de la misma gestión).
 */
export const FolioLibro = sequelize.define(
    'FolioLibro',
    {
        ...baseModelFields,

        libroId: {
            type: DataTypes.INTEGER,
            field: 'libro_id',
            allowNull: true,
            comment: 'Libro al que pertenece el folio (referencia a libros_registro)',
        },

        numeroFolio: {
            type: DataTypes.INTEGER,
            field: 'numero_folio',
            allowNull: false,
            comment: 'Número de folio correlativo del libro (cabecera FOLIO N°, ej: 56)',
        },

        paraleloGestionId: {
            type: DataTypes.INTEGER,
            field: 'paralelo_gestion_id',
            allowNull: true,
            comment: 'Paralelo en gestión del centralizador (referencia a paralelos_gestion)',
        },

        ordenEnParalelo: {
            type: DataTypes.INTEGER,
            field: 'orden_en_paralelo',
            allowNull: true,
            comment: 'Orden de la página dentro del paralelo (1ra, 2da... página de hasta 10 estudiantes)',
        },

        estado: {
            type: DataTypes.ENUM(...ESTADOS_FOLIO_VALUES),
            allowNull: true,
            defaultValue: ESTADOS_FOLIO.BORRADOR,
            comment: 'BORRADOR | IMPRESO | FIRMADO (inmutable) | ANULADO (exige motivo)',
        },

        fechaRegistro: {
            type: DataTypes.DATEONLY,
            field: 'fecha_registro',
            allowNull: true,
            comment: 'Fecha de registro/impresión del folio',
        },

        observaciones: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Observaciones del folio (ej: motivo de anulación)',
        },
    },
    {
        ...baseModelOptions,
        tableName: 'folios_libro',
    }
);

export default FolioLibro;
