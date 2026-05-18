import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import { ESTADOS_ASISTENCIA_VALUES } from '../../../domain/constants/evaluaciones.constants.js';

export const Asistencia = sequelize.define(
    'Asistencia',
    {
        ...baseModelFields,

        matriculaMateriaId: {
            type: DataTypes.INTEGER,
            field: 'matricula_materia_id',
            allowNull: true,
            comment: 'Matrícula a la materia',
        },

        fechaClase: {
            type: DataTypes.DATEONLY,
            field: 'fecha_clase',
            allowNull: false,
            comment: 'Fecha de la clase',
        },

        horaClase: {
            type: DataTypes.TIME,
            field: 'hora_clase',
            allowNull: true,
            comment: 'Hora de la clase (opcional)',
        },

        estado: {
            type: DataTypes.ENUM(...ESTADOS_ASISTENCIA_VALUES),
            allowNull: false,
            defaultValue: 'AUSENTE',
            comment:
                'PRESENTE, AUSENTE o TARDANZA. Licencias APROBADAS se cruzan dinámicamente vía inscripcion.',
        },

        observaciones: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Observaciones del docente',
        },

        registradoPor: {
            type: DataTypes.INTEGER,
            field: 'registrado_por',
            allowNull: true,
            comment: 'Usuario que registró (típicamente el docente)',
        },

        fechaRegistro: {
            type: DataTypes.DATE,
            field: 'fecha_registro',
            allowNull: true,
            defaultValue: DataTypes.NOW,
            comment: 'Fecha y hora del registro',
        },
    },
    {
        ...baseModelOptions,
        tableName: 'asistencias',
    }
);

export default Asistencia;
