/**
 * Organismo: sección «Requisitos entregados» del paso «Grupo y requisitos» de
 * Inscribir participante (CAP): checklist de los requisitos del curso elegido
 * que el participante ya entrega (se puede inscribir con requisitos
 * pendientes). Si la ficha del curso falló, la sección no se muestra (el error
 * ya lo explica la sección «Grupo»). Va envuelto en `FormWorkspaceSection`.
 * Recibe props ya mapeadas del hook; no llama hooks de fetch.
 */

import { Checkbox } from 'antd';
import { FormWorkspaceSection } from '@organisms';
import RequisitosChecklist from '@capacitacion/components/molecules/RequisitosChecklist';

const InscribirParticipanteSeccionRequisitos = ({
  section = null,
  form,
  error = null,
  requisitos = [],
  requisitosEntregados = [],
  onRequisitosChange,
}) => {
  if (error) return null;

  const items = requisitos.map((r) => ({
    id: r.id,
    descripcion: r.descripcion,
    obligatorio: r.obligatorio,
    checked: requisitosEntregados.includes(r.id),
    acreditaPagoCurso: r.acreditaPagoCurso,
  }));

  const handleToggle = (id, checked) =>
    onRequisitosChange?.(
      checked ? [...requisitosEntregados, id] : requisitosEntregados.filter((x) => x !== id),
    );

  const todos = requisitos.length > 0 && requisitos.every((r) => requisitosEntregados.includes(r.id));
  const algunos = !todos && requisitos.some((r) => requisitosEntregados.includes(r.id));
  const handleToggleTodos = (checked) =>
    onRequisitosChange?.(checked ? requisitos.map((r) => r.id) : []);

  return (
    <FormWorkspaceSection title={section?.title} description={section?.description} form={form}>
      {requisitos.length > 0 ? (
        <Checkbox
          checked={todos}
          indeterminate={algunos}
          onChange={(e) => handleToggleTodos(e.target.checked)}
          style={{ marginBottom: 'var(--ant-margin-sm, 12px)', fontWeight: 600 }}
        >
          Marcar todos los requisitos
        </Checkbox>
      ) : null}
      <RequisitosChecklist items={items} onToggle={handleToggle} />
    </FormWorkspaceSection>
  );
};

export default InscribirParticipanteSeccionRequisitos;
