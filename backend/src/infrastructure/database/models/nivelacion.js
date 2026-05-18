import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import { ESTADOS_NIVELACION_VALUES } from '../../../domain/constants/evaluaciones.constants.js';

export const Nivelacion = sequelize.define(
    'Nivelacion',
    {
        ...baseModelFields,

        historialMatriculaId: {
            type: DataTypes.INTEGER,
            field: 'historial_matricula_id',
            allowNull: true,
            comment:
                'Evento de historial que habilitó y contextualiza este examen. El tipo de proceso vive en historial_matricula.tipo_estado.',
        },

        gestionId: {
            type: DataTypes.INTEGER,
            field: 'gestion_id',
            allowNull: true,
            comment: 'Gestión en la que se rinde el examen (puede ser posterior a la de la matrícula).',
        },

        docenteEvaluadorId: {
            type: DataTypes.INTEGER,
            field: 'docente_evaluador_id',
            allowNull: true,
            comment: 'Docente que evaluó el intento',
        },

        fechaExamen: {
            type: DataTypes.DATEONLY,
            field: 'fecha_examen',
            allowNull: true,
            comment: 'Fecha del examen',
        },

        notaNivelacion: {
            type: DataTypes.DECIMAL(5, 2),
            field: 'nota_nivelacion',
            allowNull: true,
            comment: 'Nota obtenida (0-100). Mínima de aprobación: 61.',
        },

        estado: {
            type: DataTypes.ENUM(...ESTADOS_NIVELACION_VALUES),
            allowNull: true,
            defaultValue: 'PROGRAMADA',
            comment: 'Estado del proceso del examen',
        },

        aprobado: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            comment: 'TRUE si aprobó (nota_nivelacion >= 61), FALSE si reprobó',
        },

        observaciones: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Observaciones del proceso',
        },
    },
    {
        ...baseModelOptions,
        tableName: 'nivelaciones',
    }
);

export default Nivelacion;
