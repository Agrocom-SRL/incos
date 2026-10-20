import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import {
    ESTADOS_MATERIA_INSCRITA_VALUES,
    ESTADOS_MATERIA_INSCRITA,
} from '../../../domain/constants/inscripciones.constants.js';

export const MatriculaMateria = sequelize.define(
    'MatriculaMateria',
    {
        ...baseModelFields,

        inscripcionId: {
            type: DataTypes.INTEGER,
            field: 'inscripcion_id',
            allowNull: true,
            comment: 'Inscripción anual del estudiante en una gestión.',
        },

        ofertaCursoId: {
            type: DataTypes.INTEGER,
            field: 'oferta_curso_id',
            allowNull: true,
            comment: 'Oferta de curso que cursa el estudiante. Estable durante la gestión.',
        },

        asignaturaPlanId: {
            type: DataTypes.INTEGER,
            field: 'asignatura_plan_id',
            allowNull: true,
            comment:
                'Asignatura del plan. Redundancia controlada para preservar la materia original.',
        },

        notaFinal: {
            type: DataTypes.DECIMAL(5, 2),
            field: 'nota_final',
            allowNull: true,
            comment:
                'Nota final consolidada/cacheada. Se calcula desde evaluaciones y/o historial_matricula.',
        },

        estado: {
            type: DataTypes.ENUM(...ESTADOS_MATERIA_INSCRITA_VALUES),
            field: 'estado',
            allowNull: true,
            defaultValue: ESTADOS_MATERIA_INSCRITA.INSCRITO,
            comment: 'Estado actual consolidado de la materia dentro de la gestión.',
        },

        historialEstados: {
            type: DataTypes.JSON,
            field: 'historial_estados',
            allowNull: true,
            comment:
                'Historial simple de fechas por estado normal. No reemplaza a historial_matricula.',
        },

        observaciones: {
            type: DataTypes.TEXT,
            field: 'observaciones',
            allowNull: true,
            comment: 'Observaciones académicas o administrativas de la matrícula de materia.',
        },
    },
    {
        ...baseModelOptions,
        tableName: 'matriculas_materia',
    }
);

export default MatriculaMateria;
