import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import {
    TIPOS_INSCRIPCION_VALUES,
    TIPOS_INSCRIPCION,
} from '../../../domain/constants/inscripciones.constants.js';

export const Inscripcion = sequelize.define(
    'Inscripcion',
    {
        ...baseModelFields,

        datosAcademicosId: {
            type: DataTypes.INTEGER,
            field: 'datos_academicos_id',
            allowNull: true,
            comment:
                'Datos académicos del estudiante. Permite llegar al estudiante, carrera, gestión de ingreso y tipo de admisión.',
        },

        gestionId: {
            type: DataTypes.INTEGER,
            field: 'gestion_id',
            allowNull: true,
            comment: 'Gestión académica anual en la que se inscribe.',
        },

        tipoInscripcion: {
            type: DataTypes.ENUM(...TIPOS_INSCRIPCION_VALUES),
            field: 'tipo_inscripcion',
            allowNull: true,
            defaultValue: TIPOS_INSCRIPCION.ANTIGUO,
            comment:
                'Tipo de inscripción para esta gestión: NUEVO, ANTIGUO, TRASPASO o TRANSITABILIDAD.',
        },

        fechaInscripcion: {
            type: DataTypes.DATEONLY,
            field: 'fecha_inscripcion',
            allowNull: true,
            comment: 'Fecha en que se realizó la inscripción.',
        },

        observaciones: {
            type: DataTypes.TEXT,
            field: 'observaciones',
            allowNull: true,
            comment: 'Observaciones generales sobre la inscripción.',
        },
    },
    {
        ...baseModelOptions,
        tableName: 'inscripciones',
    }
);

export default Inscripcion;