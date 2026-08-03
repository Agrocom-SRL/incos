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
            comment:
                'Matrícula a la que pertenece este estado. Referencia a matriculas_materia. NULL cuando el evento describe una materia no cursada (ancla en inscripcion_id + asignatura_plan_id).',
        },

        inscripcionId: {
            type: DataTypes.INTEGER,
            field: 'inscripcion_id',
            allowNull: true,
            comment:
                'Ancla alternativa para eventos sin matrícula (materia no cursada). Referencia a inscripciones.',
        },

        asignaturaPlanId: {
            type: DataTypes.INTEGER,
            field: 'asignatura_plan_id',
            allowNull: true,
            comment:
                'Materia del plan del evento sin matrícula. Referencia a asignaturas_plan. Se usa junto a inscripcion_id.',
        },

        tipoEstado: {
            type: DataTypes.ENUM(...TIPOS_ESTADO_HISTORIAL_MATRICULA_VALUES),
            field: 'tipo_estado',
            allowNull: false,
            comment:
                'Tipo de estado operativo según reglamento INCOS. Cubre nivelaciones, vencidas, choques, prerequisitos, abandonos, retiros y otros casos.',
        },

        notaResultante: {
            type: DataTypes.DECIMAL(5, 2),
            field: 'nota_resultante',
            allowNull: true,
            comment:
                'Nota fijada por decisión administrativa. Aplica solo para ABANDONO o RETIRADO (ARTICULO_18 es examen: su nota vive en nivelaciones).',
        },

        notaForzada: {
            type: DataTypes.BOOLEAN,
            field: 'nota_forzada',
            allowNull: true,
            defaultValue: false,
            comment:
                'TRUE si nota_resultante sobrescribe el cálculo regular de matriculas_materia.nota_final.',
        },

        fechaTransicion: {
            type: DataTypes.DATEONLY,
            field: 'fecha_transicion',
            allowNull: true,
            comment: 'Fecha en que ocurrió la transición a este estado.',
        },

        observaciones: {
            type: DataTypes.TEXT,
            field: 'observaciones',
            allowNull: true,
            comment: 'Observaciones adicionales del estado operativo.',
        },

        vigente: {
            type: DataTypes.BOOLEAN,
            field: 'vigente',
            allowNull: true,
            defaultValue: true,
            comment: 'Indica si este estado está vigente o ya fue reemplazado por uno posterior.',
        },
    },
    {
        ...baseModelOptions,
        tableName: 'historial_matricula',
    }
);

export default HistorialMatricula;
