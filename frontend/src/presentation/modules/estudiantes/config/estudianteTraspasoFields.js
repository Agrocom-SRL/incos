/**
 * estudianteTraspasoFields - Configuración de campos del paso Traspaso (tabla instituciones + traspasos)
 *
 * Single Responsibility: Definir la configuración de campos de traspaso para FormSection/FormField.
 *
 * Solo se muestra cuando tipo de admisión es TRASPASO.
 * La carrera en INCOS ya se eligió en el paso "Tipo de Admisión"; no se repite aquí.
 * Los 5 documentos del traspaso se gestionan en el step Documentación (desde el seed).
 *
 * Secciones según 16-traspasos.sql e instituciones (15-transitabilidades.sql):
 * - Formación académica: datos de institución de origen + carrera origen (opcional), año cursado, régimen.
 * - Cumplimiento: estado y motivo si no procedente.
 * La declaración jurada (firma y fecha del postulante) y las observaciones se manejan en el documento final o en otra interfaz administrativa, no en este formulario.
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
    cumplimientoRequisitos: {
      title: 'Cumplimiento de los requisitos',
      fields: [
        {
          name: 'traspaso_estado',
          label: 'Conclusión',
          type: 'radio',
          required: true,
          span: 12,
          options: [
            { label: 'Procedente', value: 'PROCEDENTE' },
            { label: 'No procedente', value: 'NO_PROCEDENTE' },
          ],
        },
        {
          name: 'traspaso_motivo_no_procedente',
          label: 'Motivo (no procedente)',
          type: 'textarea',
          required: true,
          span: 24,
          placeholder: 'Motivo por el que la solicitud fue declarada No Procedente',
          rows: 3,
          conditional: true,
          dependsOn: 'traspaso_estado',
          showIf: (valor) => valor === 'NO_PROCEDENTE',
        },
      ],
    },
  };
};
