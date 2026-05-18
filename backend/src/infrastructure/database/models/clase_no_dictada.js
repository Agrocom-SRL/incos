import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';

export const ClaseNoDictada = sequelize.define(
    'ClaseNoDictada',
    {
        ...baseModelFields,

        asignacionDocenteId: {
            type: DataTypes.INTEGER,
            field: 'asignacion_docente_id',
            allowNull: true,
            comment: 'Asignación docente del curso afectado',
        },

        fechaClase: {
            type: DataTypes.DATEONLY,
            field: 'fecha_clase',
            allowNull: false,
            comment: 'Fecha de la clase que no se dictó',
        },

        motivo: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: 'Motivo de la cancelación (texto libre)',
        },

        descripcionMotivo: {
            type: DataTypes.TEXT,
            field: 'descripcion_motivo',
            allowNull: true,
            comment: 'Descripción detallada',
        },
    },
    {
        ...baseModelOptions,
        tableName: 'clases_no_dictadas',
    }
);

export default ClaseNoDictada;
