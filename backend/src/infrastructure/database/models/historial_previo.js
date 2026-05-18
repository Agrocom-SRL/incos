import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import { ESTADOS_HISTORIAL_PREVIO_VALUES } from '../../../domain/constants/evaluaciones.constants.js';

export const HistorialPrevio = sequelize.define(
    'HistorialPrevio',
    {
        ...baseModelFields,

        inscripcionId: {
            type: DataTypes.INTEGER,
            field: 'inscripcion_id',
            allowNull: true,
            comment: 'Inscripción en la que se carga el historial previo.',
        },

        asignaturaPlanId: {
            type: DataTypes.INTEGER,
            field: 'asignatura_plan_id',
            allowNull: true,
            comment: 'Asignatura del plan aprobada o convalidada.',
        },

        notaFinal: {
            type: DataTypes.DECIMAL(5, 2),
            field: 'nota_final',
            allowNull: true,
            comment: 'Nota final obtenida (0-100).',
        },

        estado: {
            type: DataTypes.ENUM(...ESTADOS_HISTORIAL_PREVIO_VALUES),
            field: 'estado',
            allowNull: true,
            defaultValue: 'APROBADO',
            comment: 'APROBADO o CONVALIDADO.',
        },
    },
    {
        ...baseModelOptions,
        tableName: 'historial_previo',
    }
);

export default HistorialPrevio;
