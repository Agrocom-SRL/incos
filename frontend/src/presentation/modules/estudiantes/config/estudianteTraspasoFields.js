/**
 * estudianteTraspasoFields - Configuración de campos del paso Traspaso (tabla instituciones + traspasos)
 *
 * Single Responsibility: Definir la configuración de campos de traspaso para FormSection/FormField.
 *
 * Solo se muestra cuando tipo de admisión es TRASPASO.
 * La carrera en INCOS ya se eligió en el paso "Tipo de admisión"; no se repite aquí.
 * Los 5 documentos del traspaso se gestionan en el step Documentación (desde el seed).
 *
 * Secciones según 16-traspasos.sql e instituciones (15-transitabilidades.sql):
 * - Formación académica: datos de institución de origen + carrera origen (opcional), año cursado, régimen.
 * La sección "Cumplimiento de los requisitos" (estado/motivo no procedente) ya no se usa en el formulario; el backend acepta valores por defecto.
 */

/**
 * Crea la configuración de secciones del paso Traspaso
 *
 * @returns {Object} Configuración de secciones para el step Traspaso
 */
export const createEstudianteTraspasoFields = () => {
  return {
    formacionAcademica: {
      title: 'Formación académica',
      fields: [
        {
          name: 'traspaso_institucion_origen_nombre',
          label: 'Instituto en el que estudió',
          type: 'input',
          inputType: 'text',
          required: true,
          span: 12,
          placeholder: 'Nombre del ITT de origen',
        },
        {
          name: 'traspaso_codigo_rude',
          label: 'Código RUDE / RUDEAL',
          type: 'input',
          inputType: 'text',
          required: false,
          span: 12,
          placeholder: 'Código RUDE o RUDEAL del postulante',
        },
        {
          name: 'traspaso_carrera_origen',
          label: 'Carrera',
          type: 'input',
          inputType: 'text',
          required: false,
          span: 12,
          placeholder: 'Carrera cursada en el ITT de origen',
        },
        {
          name: 'traspaso_departamento_id',
          label: 'Departamento',
          type: 'select',
          required: false,
          span: 12,
          options: 'departamentos',
          placeholder: 'Seleccione departamento',
        },
        {
          name: 'traspaso_anio_cursado',
          label: 'Año cursado',
          type: 'radio',
          required: true,
          span: 12,
          options: [
            { label: 'Primer Año', value: 'PRIMERO' },
            { label: 'Segundo Año', value: 'SEGUNDO' },
          ],
        },
        {
          name: 'traspaso_regimen_origen',
          label: 'Régimen de estudios',
          type: 'radio',
          required: true,
          span: 12,
          options: [
            { label: 'Semestral', value: 'SEMESTRAL' },
            { label: 'Anual', value: 'ANUAL' },
          ],
        },
        {
          name: 'traspaso_distrito_educativo',
          label: 'Distrito educativo',
          type: 'input',
          inputType: 'text',
          required: false,
          span: 12,
          placeholder: 'Distrito educativo',
        },
        {
          name: 'traspaso_dependencia',
          label: 'Dependencia',
          type: 'select',
          required: false,
          span: 12,
          options: [
            { label: 'Fiscal', value: 'FISCAL' },
            { label: 'Convenio', value: 'CONVENIO' },
            { label: 'Privado', value: 'PRIVADO' },
          ],
          placeholder: 'Seleccione dependencia',
        },
      ],
    },
  };
};
