/**
 * Organismo: contenido del paso «Grupo y requisitos» de Inscribir participante
 * (CAP). Grupos del curso como `Radio.Group` (nombre, horarios y cupo
 * disponible; sin cupo máximo no se muestra tope) y checklist de requisitos
 * ya entregados. Recibe props ya mapeadas del hook; no llama hooks de fetch.
 */

import { Alert, Empty, Flex, Radio, Spin, Typography } from 'antd';
import { allSpacing } from '@theme/tokens';
import RequisitosChecklist from '@capacitacion/components/molecules/RequisitosChecklist';

const detalleGrupo = (grupo) =>
  [
    grupo.horariosLabel || 'Sin horarios',
    grupo.cupoDisponible != null ? `${grupo.cupoDisponible} cupos disponibles` : null,
  ]
    .filter(Boolean)
    .join(' · ');

const InscribirParticipanteSeccionInscripcion = ({
  loading = false,
  error = null,
  grupos = [],
  requisitos = [],
  capacitacionGrupoId = null,
  onGrupoChange,
  requisitosEntregados = [],
  onRequisitosChange,
}) => {
  const items = requisitos.map((r) => ({
    id: r.id,
    descripcion: r.descripcion,
    obligatorio: r.obligatorio,
    checked: requisitosEntregados.includes(r.id),
  }));

  const handleToggle = (id, checked) =>
    onRequisitosChange?.(
      checked ? [...requisitosEntregados, id] : requisitosEntregados.filter((x) => x !== id),
    );

  if (error) {
    return <Alert type="error" showIcon title="No se pudo cargar el curso" description={error} />;
  }

  return (
    <Spin spinning={loading}>
      <Flex vertical gap={allSpacing.marginLG}>
        <Flex vertical gap={allSpacing.marginSM}>
          <Typography.Text strong>
            {grupos.length >= 2 ? 'Grupo (obligatorio)' : 'Grupo'}
          </Typography.Text>
          {grupos.length > 0 ? (
            <Radio.Group
              value={capacitacionGrupoId ?? undefined}
              onChange={(e) => onGrupoChange?.(e.target.value)}
            >
              <Flex vertical gap={allSpacing.marginXS}>
                {grupos.map((g) => (
                  <Radio key={g.id} value={g.id}>
                    <strong>{g.nombre}</strong> — {detalleGrupo(g)}
                  </Radio>
                ))}
              </Flex>
            </Radio.Group>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="El curso aún no define grupos."
            />
          )}
        </Flex>

        <Flex vertical gap={allSpacing.marginSM}>
          <Typography.Text strong>Requisitos entregados</Typography.Text>
          <RequisitosChecklist items={items} onToggle={handleToggle} />
        </Flex>
      </Flex>
    </Spin>
  );
};

export default InscribirParticipanteSeccionInscripcion;
