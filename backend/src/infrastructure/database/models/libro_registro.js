import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import { ESTADOS_LIBRO, ESTADOS_LIBRO_VALUES } from '../../../domain/constants/libros.constants.js';

/**
 * Libro físico del centralizador de calificaciones (schema 25).
 * Un libro por GESTIÓN (UNIQUE gestión), compartido por las 3 carreras del
 * instituto (secuencia real 12→2023, 13→2024, 14→2025). Cada libro agrupa
 * todos los años/paralelos/carreras de esa gestión, con folios correlativos
 * que cruzan de una carrera a la siguiente (orden canónico `ordenCarreraLibro`).
 */
export const LibroRegistro = sequelize.define(
    'LibroRegistro',
    {
        ...baseModelFields,

        numeroLibro: {
            type: DataTypes.INTEGER,
            field: 'numero_libro',
            allowNull: false,
            comment: 'Número del libro físico (cabecera LIBRO N°). Correlativo institucional: avanza uno por gestión',
        },

        gestionId: {
            type: DataTypes.INTEGER,
            field: 'gestion_id',
            allowNull: true,
            comment: 'Gestión académica del libro (referencia a gestiones)',
        },

        codigoRegistro: {
            type: DataTypes.STRING(20),
            field: 'codigo_registro',
            allowNull: true,
            comment: 'Código de Registro institucional impreso en cada página (ej: 81981609)',
        },

        folioInicial: {
            type: DataTypes.INTEGER,
            field: 'folio_inicial',
            allowNull: false,
            defaultValue: 1,
            comment: 'Primer folio del libro (puede no ser 1: continúa lotes previos de la gestión)',
        },

        folioActual: {
            type: DataTypes.INTEGER,
            field: 'folio_actual',
            allowNull: false,
            defaultValue: 0,
            comment: 'Último folio registrado en el libro',
        },

        folioFinal: {
            type: DataTypes.INTEGER,
            field: 'folio_final',
            allowNull: true,
            comment: 'Último folio disponible del libro físico (si se conoce)',
        },

        estado: {
            type: DataTypes.ENUM(...ESTADOS_LIBRO_VALUES),
            allowNull: true,
            defaultValue: ESTADOS_LIBRO.ABIERTO,
            comment: 'ABIERTO: admite nuevos folios | CERRADO: gestión cerrada, libro completado',
        },

        fechaApertura: {
            type: DataTypes.DATEONLY,
            field: 'fecha_apertura',
            allowNull: true,
            comment: 'Fecha de apertura del libro físico',
        },

        fechaCierre: {
            type: DataTypes.DATEONLY,
            field: 'fecha_cierre',
            allowNull: true,
            comment: 'Fecha de cierre del libro físico',
        },

        observaciones: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Observaciones sobre el libro',
        },
    },
    {
        ...baseModelOptions,
        tableName: 'libros_registro',
    }
);

export default LibroRegistro;
