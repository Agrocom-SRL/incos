import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { baseModelFields, baseModelOptions } from './base_model.js';
import { AsignacionDocente } from './asignacion_docente.js';
import {
  CLASES_OBSERVADAS_FICHA,
  CLASES_OBSERVADAS_FICHA_VALUES,
} from '../../../domain/constants/docentes.constants.js';

/**
 * FICHA DE SEGUIMIENTO EN LA CLASE PRESENCIAL (módulo DOC · supervisión
 * docente) — tabla `fichas_seguimiento_clase` (27-supervision-docente.sql).
 * Réplica campo a campo del formulario físico de la Dirección Académica:
 * cabecera derivada de asignaciones_docentes, check PRESENCIAL, 4 ítems SI/NO
 * de documentación, cantidades de estudiantes y 9 secciones de observación.
 */
export const FichaSeguimientoClase = sequelize.define(
  'FichaSeguimientoClase',
  {
    ...baseModelFields,
    asignacionDocenteId: {
      type: DataTypes.INTEGER,
      field: 'asignacion_docente_id',
      allowNull: true,
      comment:
        'Curso observado (referencia a asignaciones_docentes). De aquí derivan docente, asignatura, carrera, curso y paralelo de la cabecera',
    },
    supervisorId: {
      type: DataTypes.INTEGER,
      field: 'supervisor_id',
      allowNull: true,
      comment:
        'Usuario de Dirección Académica que realiza el seguimiento (referencia a usuarios, sin FK por dependencia circular)',
    },
    fechaSeguimiento: {
      type: DataTypes.DATEONLY,
      field: 'fecha_seguimiento',
      allowNull: false,
      comment: 'Fecha de seguimiento (cabecera de la ficha)',
    },
    claseObservada: {
      type: DataTypes.ENUM(...CLASES_OBSERVADAS_FICHA_VALUES),
      field: 'clase_observada',
      allowNull: true,
      defaultValue: CLASES_OBSERVADAS_FICHA.PRESENCIAL,
      comment: 'Marque la clase observada — el formulario 2026 solo contempla PRESENCIAL',
    },
    tieneCronogramaBimestral: {
      type: DataTypes.BOOLEAN,
      field: 'tiene_cronograma_bimestral',
      allowNull: true,
      comment: 'SI/NO: Cronograma bimestral de asignatura',
    },
    tienePlanBimestral: {
      type: DataTypes.BOOLEAN,
      field: 'tiene_plan_bimestral',
      allowNull: true,
      comment: 'SI/NO: Plan bimestral',
    },
    tieneRegistroAsistencia: {
      type: DataTypes.BOOLEAN,
      field: 'tiene_registro_asistencia',
      allowNull: true,
      comment: 'SI/NO: Registro de asistencia',
    },
    tieneRegistroPedagogico: {
      type: DataTypes.BOOLEAN,
      field: 'tiene_registro_pedagogico',
      allowNull: true,
      comment: 'SI/NO: Registro pedagógico y el consolidado',
    },
    obsDocumentacion: {
      type: DataTypes.TEXT,
      field: 'obs_documentacion',
      allowNull: true,
      comment: 'Observaciones de la sección Documentación',
    },
    estudiantesEnPlanilla: {
      type: DataTypes.SMALLINT.UNSIGNED,
      field: 'estudiantes_en_planilla',
      allowNull: true,
      comment: 'Cantidad de estudiantes en planilla',
    },
    estudiantesAsistentes: {
      type: DataTypes.SMALLINT.UNSIGNED,
      field: 'estudiantes_asistentes',
      allowNull: true,
      comment: 'Cantidad de estudiantes asistentes',
    },
    obsAvanceAsignatura: {
      type: DataTypes.TEXT,
      field: 'obs_avance_asignatura',
      allowNull: true,
      comment: 'AVANCE DE LA ASIGNATURA: avance según cronograma, plan bimestral y temática actual',
    },
    obsPresentacionTema: {
      type: DataTypes.TEXT,
      field: 'obs_presentacion_tema',
      allowNull: true,
      comment:
        'PRESENTACIÓN DEL TEMA O CONTINUIDAD DE AVANCE: título, competencia e indicadores; retroalimentación si es continuación',
    },
    obsRecursos: {
      type: DataTypes.TEXT,
      field: 'obs_recursos',
      allowNull: true,
      comment: 'RECURSOS QUE UTILIZA: Power Point, PDF, Excel, Word, tablet gráfica u otro',
    },
    obsExposicion: {
      type: DataTypes.TEXT,
      field: 'obs_exposicion',
      allowNull: true,
      comment:
        'EXPOSICIÓN DEL DOCENTE: claridad, resúmenes, cuadros sinópticos, mapas, diagramas, casos, ejercicios',
    },
    obsParticipacion: {
      type: DataTypes.TEXT,
      field: 'obs_participacion',
      allowNull: true,
      comment: 'PARTICIPACIÓN DE ESTUDIANTES: participación activa en la clase',
    },
    obsActividadesPracticas: {
      type: DataTypes.TEXT,
      field: 'obs_actividades_practicas',
      allowNull: true,
      comment: 'ACTIVIDADES PRÁCTICAS: espacio de preguntas y promoción de la participación',
    },
    obsActividadesEvaluacion: {
      type: DataTypes.TEXT,
      field: 'obs_actividades_evaluacion',
      allowNull: true,
      comment: 'ACTIVIDADES DE EVALUACIÓN: evaluación de proceso o de resultado',
    },
    otrasObservaciones: {
      type: DataTypes.TEXT,
      field: 'otras_observaciones',
      allowNull: true,
      comment: 'OTRAS OBSERVACIONES (cierre de la ficha)',
    },
  },
  {
    ...baseModelOptions,
    tableName: 'fichas_seguimiento_clase',
  }
);

// Asociación con la asignación docente observada (patrón compromiso_pago):
// permite include del contexto del curso cuando se necesite desde el ORM.
FichaSeguimientoClase.belongsTo(AsignacionDocente, {
  foreignKey: 'asignacionDocenteId',
  as: 'asignacionDocente',
});

export default FichaSeguimientoClase;
