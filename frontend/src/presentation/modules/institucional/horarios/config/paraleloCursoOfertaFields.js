/**
 * paraleloCursoOfertaFields — Configuración de campos del formulario de curso en la oferta del paralelo.
 *
 * Consumido por FormSection dentro de WizardForm (un paso). Opciones dinámicas vía resolveOptions:
 * - `asignaturasPlanPendientes`: materias del periodo sin curso en el paralelo (alta); en edición, solo la materia del curso (select deshabilitado).
 *
 * El código del curso (carrera · paralelo · turno · sigla) lo define el backend; en edición no se muestra ni se edita en este formulario.
 *
 * @param {{ isEdit?: boolean, soloAsignatura?: boolean }} options
 * @returns {Object} Secciones con arrays de definición de campo para FormSection.
 */
export const createParaleloCursoOfertaFields = (options = {}) => {
    const { isEdit = false, soloAsignatura = false } = options;

    const fields = [];

    fields.push(
        {
            name: 'asignaturaPlanId',
            label: 'Materia',
            type: 'select',
            options: 'asignaturasPlanPendientes',
            required: !isEdit,
            span: 24,
            disabled: isEdit,
            placeholder: isEdit ? undefined : 'Seleccioná una materia sin curso en este paralelo',
        }
    );

    if (!soloAsignatura) {
        fields.push(
            {
                name: 'cupoMinimo',
                label: 'Cupo mínimo',
                type: 'number',
                required: false,
                span: 24,
                min: 0,
                max: 500,
            },
            {
                name: 'cupoMaximo',
                label: 'Cupo máximo',
                type: 'number',
                required: false,
                span: 24,
                min: 0,
                max: 500,
            },
            {
                name: 'colorHex',
                label: 'Color del curso',
                type: 'color',
                required: false,
                span: 24,
                helperText: 'Elegí un color para identificar el curso en la grilla.',
            }
        );
    }

    return {
        datosCurso: {
            title: 'DATOS DEL CURSO',
            fields,
        },
    };
};
