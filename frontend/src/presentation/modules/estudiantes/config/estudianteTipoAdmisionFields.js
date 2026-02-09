/**
 * estudianteTipoAdmisionFields - Configuración de campos para seleccionar tipo de admisión
 * 
 * Single Responsibility: Definir la configuración del paso inicial del wizard (tipo de admisión)
 * 
 * Este archivo separa la configuración del tipo de admisión de la lógica del componente,
 * permitiendo reutilizar y modificar fácilmente sin tocar el componente.
 */

/**
 * Crea la configuración de campos para el paso de tipo de admisión
 * 
 * Este es el primer paso del wizard donde el usuario selecciona cómo ingresa el estudiante:
 * - NUEVO: Estudiante nuevo (gestión actual)
 * - ANTIGUO: Estudiante antiguo (gestión pasada)
 * - TRANSITABILIDAD: Estudiante con Técnico Medio (futuro)
 * - TRASPASO: Estudiante de otro instituto (futuro)
 * 
 * @returns {Object} Configuración de campos organizados por sección
 */
export const createEstudianteTipoAdmisionFields = () => {
  return {
    tipoAdmision: {
      title: 'TIPO DE ADMISIÓN',
      fields: [
        {
          name: 'tipoAdmision',
          label: 'Seleccione el tipo de admisión',
          type: 'radio',
          required: true,
          span: 24,
          defaultValue: 'NUEVO',
          options: [
            { 
              label: 'Nuevo (gestión actual)', 
              value: 'NUEVO',
              description: 'Estudiante que ingresa por primera vez en la gestión actual',
            },
            { 
              label: 'Antiguo (gestión pasada)', 
              value: 'ANTIGUO',
              description: 'Estudiante que ya estudió en gestiones anteriores pero no está en el sistema',
            },
            { 
              label: 'Transitabilidad (Téc. Medio → Téc. Sup.)', 
              value: 'TRANSITABILIDAD',
              description: 'Estudiante con Técnico Medio que cursa solo materias complementarias',
              disabled: true, // Por ahora deshabilitado hasta implementar
            },
            { 
              label: 'Traspaso (otro instituto)', 
              value: 'TRASPASO',
              description: 'Estudiante que viene de otro instituto y completó un periodo',
              disabled: true, // Por ahora deshabilitado hasta implementar
            },
          ],
          help: 'El tipo de admisión determina qué información adicional se solicitará y cómo se generará el código del estudiante.',
        },
      ],
    },
  };
};
