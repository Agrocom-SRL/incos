/**
 * Formulario ABM participante — workspace alineado a CFG Académico. Los 7
 * campos de `ParticipanteFormFields` no son declarativos (no usan
 * `CfgFormFieldGrid`), así que van en `beforeFields` y `fields=[]` (el grid
 * declarativo no renderiza nada). Gemelo de `CarreraFormSections`/
 * `ParaleloFormSections`.
 */
import { CfgFormWorkspace } from '@organisms';
import ParticipanteFormFields from '@capacitacion/components/organisms/ParticipanteFormFields';

const ParticipanteFormSections = ({ form, footer = null, disabled = false }) => (
  <CfgFormWorkspace
    title="Datos del participante"
    description="Persona externa que se inscribe a los cursos de capacitación (sin usuario del sistema). Estos datos se reutilizan al inscribirla a un curso."
    fields={[]}
    form={form}
    footer={footer}
    beforeFields={<ParticipanteFormFields disabled={disabled} />}
  />
);

export default ParticipanteFormSections;
