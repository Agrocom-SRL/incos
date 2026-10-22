/**
 * Organismo: sección «Grupo» del paso «Grupo y requisitos» de Inscribir
 * participante (CAP). Los grupos del curso elegido se muestran como tarjetas
 * seleccionables (`DataCards` + molécula `GrupoCapacitacionCard`, mismo patrón
 * que los paralelos de Matrícula); el cupo es informativo y un único grupo se
 * preselecciona (lo decide el hook). Con 0 grupos, un `Empty` simple.
 *
 * Maneja aquí el estado de carga/error de la ficha del curso, que comparten
 * las secciones del paso. Va envuelto en `FormWorkspaceSection`.
 * Recibe props ya mapeadas del hook; no llama hooks de fetch.
 */

import { Alert, Empty, Spin } from 'antd';
import { FormWorkspaceSection } from '@organisms';
import { DataCards } from '@molecules';
import GrupoCapacitacionCard from '@capacitacion/components/molecules/GrupoCapacitacionCard';

const InscribirParticipanteSeccionGrupo = ({
  section = null,
  form,
  loading = false,
  error = null,
  grupos = [],
  capacitacionGrupoId = null,
  onGrupoChange,
}) => {
  const titulo = grupos.length >= 2 ? `${section?.title ?? 'Grupo'} (obligatorio)` : section?.title;
  const seleccionado = grupos.find((g) => g.id === capacitacionGrupoId) ?? null;

  return (
    <FormWorkspaceSection title={titulo} description={section?.description} form={form}>
      {error ? (
        <Alert type="error" showIcon title="No se pudo cargar el curso" description={error} />
      ) : (
        <Spin spinning={loading}>
          {grupos.length > 0 ? (
            <DataCards
              data={grupos}
              renderItem={(grupo) => <GrupoCapacitacionCard grupo={grupo} />}
              onSelect={(grupo) => onGrupoChange?.(grupo.id)}
              selectedItem={seleccionado}
              className="step2-paralelos-cards"
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={loading ? 'Cargando grupos…' : 'El curso aún no define grupos.'}
            />
          )}
        </Spin>
      )}
    </FormWorkspaceSection>
  );
};

export default InscribirParticipanteSeccionGrupo;
