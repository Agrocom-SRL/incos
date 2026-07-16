/**
 * estudianteDatosAcademicosInicialesFields - Configuración de campos de datos académicos iniciales
 * 
 * Single Responsibility: Definir la configuración de datos académicos para estudiantes antiguos
 * 
 * Este archivo separa la configuración de datos académicos iniciales de la lógica del componente,
 * permitiendo reutilizar y modificar fácilmente sin tocar el componente.
 * 
 * IMPORTANTE: Estos campos solo se muestran cuando tipoAdmision === 'ANTIGUO'
 */

/**
 * Crea la configuración de campos de datos académicos iniciales
 * 
 * Estos campos se usan para estudiantes antiguos que ya tienen:
 * - Una gestión de ingreso (gestión pasada)
 * - Una carrera asignada
 * 
 * Esto permite crear estudiantes_datos_academicos desde el registro inicial,
 * evitando tener que completar esta información en el proceso de inscripción.
 * 
 * @returns {Object} Configuración de campos organizados por sección
 */
export const createEstudianteDatosAcademicosInicialesFields = () => {
  return {
    datosAcademicosIniciales: {
      title: 'DATOS ACADÉMICOS INICIALES',
      fields: [
        {
          name: 'gestionIngresoId',
          label: 'Gestión de ingreso',
          type: 'select',
          required: true,
          span: 12,
          options: 'gestiones',
          placeholder: 'Seleccione la gestión de ingreso',
          help: 'Gestión académica en la que el estudiante ingresó originalmente. Esto determina el código del estudiante.',
        },
        {
          name: 'carreraId',
          label: 'Carrera',
          type: 'select', // El tipo se mantiene para referencia, pero se renderiza con componente visual
          required: true,
          span: 12,
          options: 'carreras', // Se mantiene para referencia
          placeholder: 'Seleccione la carrera de ingreso',
          help: 'Carrera en la que el estudiante está inscrito.',
        },
      ],
    },
  };
};
