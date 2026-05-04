/**
 * paraleloCursoOfertaFields — Configuración de campos del formulario de curso en la oferta del paralelo.
 *
 * Consumido por FormSection dentro de WizardForm (un paso). Opciones dinámicas vía resolveOptions:
 * - `asignaturasPlanPendientes`: materias del periodo sin curso en el paralelo (alta); en edición, solo la materia del curso (select deshabilitado).
 *
 * En alta, el código puede autogenerarse en backend; en edición se muestra y puede ajustarse.
 *
 * @param {{ isEdit?: boolean }} options
 * @returns {Object} Secciones con arrays de definición de campo para FormSection.
 */
export const createParaleloCursoOfertaFields = (options = {}) => {
    const { isEdit = false } = options;

    const fields = [];

    if (isEdit) {
        fields.push({
            name: 'codigo',
            label: 'Código del curso',
            type: 'input',
            required: true,
            span: 24,
            maxLength: 50,
            placeholder: 'Ej: SIS-1A-NOCHE-PRG102',
        });
    }

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
        },
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
        },
    );

    return {
        datosCurso: {
            title: 'DATOS DEL CURSO',
            fields,
        },
    };
};
