/**
 * estudianteContactoEmergenciaFields - Configuración de campos de contacto de emergencia para el formulario de registro de estudiantes
 * 
 * Single Responsibility: Definir la configuración de campos de contacto de emergencia (apoderados/tutores)
 * 
 * Este archivo separa la configuración de campos de contacto de emergencia de la lógica del componente,
 * permitiendo reutilizar y modificar fácilmente los campos sin tocar el componente.
 * 
 * Estructura de cada campo:
 * - name: Nombre del campo (debe coincidir con el nombre en el backend)
 * - label: Etiqueta visible para el usuario
 * - type: Tipo de campo (input, select, switch, textarea, etc.)
 * - required: Si el campo es obligatorio
 * - span: Ancho del campo en columnas (12 = 50%, 24 = 100%)
 * - options: Opciones para campos select (string para resolver con resolveOptions, o array)
 * - placeholder: Texto de ayuda en el campo
 * - default: Valor por defecto (para switches)
 */

/**
 * Crea los campos de un contacto de emergencia
 * @param {number} index - Índice del contacto (0, 1, 2, etc.) para crear campos únicos
 * @returns {Array} Array de campos de contacto de emergencia
 */
export const createCamposContactoEmergencia = (index = 0) => {
    // Siempre usar prefijo para evitar conflictos con campos de datos personales
    // Índice 0 -> contactoEmergencia1, índice 1 -> contactoEmergencia2, etc.
    const numeroContacto = index + 1;
    const prefix = `contactoEmergencia${numeroContacto}`;

    return [
        {
            name: `${prefix}TipoParentescoId`,
            label: 'Tipo de Parentesco',
            type: 'select',
            required: true,
            span: 12,
            options: 'tiposParentesco',
            placeholder: 'Seleccione tipo de parentesco',
            showDescription: true, // Mostrar descripción del tipo de parentesco en tooltip o texto pequeño
        },
        {
            name: `${prefix}Nombres`,
            label: 'Nombres',
            type: 'input',
            required: true,
            span: 12,
            placeholder: 'Ingrese nombres completos',
            maxLength: 150,
        },
        {
            name: `${prefix}Apellidos`,
            label: 'Apellidos',
            type: 'input',
            required: false,
            span: 12,
            placeholder: 'Ingrese apellidos',
            maxLength: 150,
        },
        {
            name: `${prefix}Ci`,
            label: 'Cédula de Identidad',
            type: 'input',
            required: false,
            span: 12,
            placeholder: 'Ej: 1234567',
            maxLength: 20,
        },
        {
            name: `${prefix}Telefono`,
            label: 'Teléfono',
            type: 'input',
            inputType: 'tel',
            required: false,
            span: 12,
            placeholder: 'Ej: 2123456',
            maxLength: 20,
        },
        {
            name: `${prefix}Celular`,
            label: 'Celular',
            type: 'input',
            inputType: 'tel',
            required: false,
            span: 12,
            placeholder: 'Ej: 70000000',
            maxLength: 20,
        },
        {
            name: `${prefix}Email`,
            label: 'Email',
            type: 'input',
            inputType: 'email',
            required: false,
            span: 12,
            placeholder: 'Ej: contacto@email.com',
            maxLength: 150,
        },
        {
            name: `${prefix}EsContactoEmergencia`,
            label: 'Es Contacto de Emergencia',
            type: 'switch',
            required: false,
            span: 12,
            defaultChecked: true,
        },
        {
            name: `${prefix}EsApoderadoLegal`,
            label: 'Es Apoderado Legal',
            type: 'switch',
            required: false,
            span: 12,
            defaultChecked: true,
        },
        {
            name: `${prefix}ViveConEstudiante`,
            label: 'Vive con el Estudiante',
            type: 'switch',
            required: false,
            span: 12,
            defaultChecked: false,
        },
        {
            name: `${prefix}Ocupacion`,
            label: 'Ocupación',
            type: 'input',
            required: false,
            span: 12,
            placeholder: 'Ingrese ocupación',
            maxLength: 100,
        },
        {
            name: `${prefix}LugarTrabajo`,
            label: 'Lugar de Trabajo',
            type: 'input',
            required: false,
            span: 12,
            placeholder: 'Ingrese lugar de trabajo',
            maxLength: 200,
        },
        {
            name: `${prefix}Direccion`,
            label: 'Dirección',
            type: 'textarea',
            required: false,
            span: 12,
            placeholder: 'Ingrese dirección completa',
            rows: 3,
        },
        {
            name: `${prefix}Observaciones`,
            label: 'Observaciones',
            type: 'textarea',
            required: false,
            span: 12,
            placeholder: 'Ingrese observaciones adicionales',
            rows: 3,
        },
    ];
};

/**
 * Genera los campos dinámicos de contactos de emergencia basándose en los índices
 * 
 * @param {Array<number>} contactosIndices - Array de índices de contactos (ej: [0, 1, 2])
 * @param {Function} eliminarContacto - Función para eliminar un contacto por su índice
 * @param {Function} agregarContacto - Función para agregar un nuevo contacto
 * @returns {Array} Array de campos dinámicos (subsections + botón agregar)
 */
export const createCamposContactosEmergenciaDinamicos = (contactosIndices, eliminarContacto, agregarContacto) => {
    const campos = [];

    // Generar una subsection para cada contacto
    contactosIndices.forEach((index, position) => {
        const numeroContacto = position + 1;
        const esPrimero = position === 0;

        campos.push({
            type: 'subsection',
            subsectionTitle: `Contacto de Emergencia ${numeroContacto}`,
            subsectionIndex: index, // Índice único para identificar el contacto
            fields: createCamposContactoEmergencia(index),
            // Agregar botón de eliminar si no es el primero
            showDeleteButton: !esPrimero,
            onDelete: esPrimero ? null : () => eliminarContacto(index),
        });
    });

    // Agregar botón para agregar más contactos
    campos.push({
        type: 'button',
        name: 'agregarContactoEmergencia',
        label: '',
        buttonText: '+ Agregar Otro Contacto de Emergencia',
        variant: 'info',
        style: 'outlined',
        span: 24,
        onClick: agregarContacto,
    });

    return campos;
};

/**
 * Crea la configuración de campos de contacto de emergencia para el registro de estudiantes
 * 
 * Los campos de contacto de emergencia incluyen:
 * - Tipo de Parentesco (select con descripción)
 * - Botón para agregar más contactos
 * - Subsection con campos del contacto de emergencia
 * 
 * NOTA: Esta función ahora retorna campos estáticos. Para campos dinámicos,
 * usar el hook useContactosEmergenciaDinamicos que genera los campos dinámicamente.
 * 
 * @returns {Object} Configuración de campos organizados por sección
 */
export const createEstudianteContactoEmergenciaFields = () => {
    return {
        contactoEmergencia: {
            title: 'Datos de Contacto de Emergencia',
            // Los campos se generan dinámicamente usando useContactosEmergenciaDinamicos
            // Este objeto solo define la estructura base
            fields: [],
        },
    };
};

