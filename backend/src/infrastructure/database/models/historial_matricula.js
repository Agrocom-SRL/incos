import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import {
    TIPOS_ESTADO_HISTORIAL_MATRICULA_VALUES,
} from '../../../domain/constants/inscripciones.constants.js';

export const HistorialMatricula = sequelize.define(
    'HistorialMatricula',
    {
        ...baseModelFields,

        matriculaMateriaId: {
            type: DataTypes.INTEGER,
            field: 'matricula_materia_id',
            allowNull: true,
            comment: 'Matrícula de materia a la que pertenece este suceso especial.',
        },

        tipoEstado: {
            type: DataTypes.ENUM(...TIPOS_ESTADO_HISTORIAL_MATRICULA_VALUES),
            field: 'tipo_estado',
            allowNull: false,
            comment:
                'Tipo de suceso especial u operativo según reglamento académico INCOS.',
        },

        fechaTransicion: {
            type: DataTypes.DATEONLY,
            field: 'fecha_transicion',
            allowNull: true,
            comment: 'Fecha en que ocurrió o se registró el suceso especial.',
        },

        notaResultante: {
            type: DataTypes.DECIMAL(5, 2),
            field: 'nota_resultante',
            allowNull: true,
            comment:
                'Nota asociada al suceso especial, si aplica. Ejemplo: recuperatorio anual o prueba excepcional.',
        },

        notaForzada: {
            type: DataTypes.BOOLEAN,
            field: 'nota_forzada',
            allowNull: true,
            defaultValue: false,
            comment:
                'TRUE si nota_resultante debe sobrescribir el cálculo normal de nota_final.',
        },

        observaciones: {
            type: DataTypes.TEXT,
            field: 'observaciones',
            allowNull: true,
            comment: 'Detalle u observación del suceso especial.',
        },

        vigente: {
            type: DataTypes.BOOLEAN,
            field: 'vigente',
            allowNull: true,
            defaultValue: true,
            comment: 'Indica si este suceso especial sigue vigente o ya fue superado.',
        },
    },
    {
        ...baseModelOptions,
        tableName: 'historial_matricula',
    }
);

export default HistorialMatricula;