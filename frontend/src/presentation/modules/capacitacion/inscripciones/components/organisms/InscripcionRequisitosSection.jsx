/**
 * Organismo: checklist de requisitos de la ficha de inscripción (CAP).
 *
 * Compone `DetailInfoCard` + `RequisitosChecklist`; guardar usa `ActionButton`
 * (capacitacion.inscripcion EDITAR). Los botones solo aparecen con cambios
 * pendientes. Recibe el borrador y los handlers del hook de pantalla.
 */

import { Flex } from 'antd';
import { CheckSquareOutlined, SaveOutlined } from '@ant-design/icons';
import { DetailInfoCard } from '@molecules';
import { ActionButton, Button } from '@atoms';
import { allSpacing } from '@theme/tokens';
import { CAPACITACION_PERMISOS } from '@application-capacitacion/utils/capacitacionPermisos';
import RequisitosChecklist from '@capacitacion/components/molecules/RequisitosChecklist';

const InscripcionRequisitosSection = ({
  requisitos = [],
  dirty = false,
  saving = false,
  editable = true,
  onToggle,
  onGuardar,
  onDescartar,
}) => (
  <DetailInfoCard
    title={`Requisitos de inscripción (${requisitos.length})`}
    icon={<CheckSquareOutlined />}
    cols={1}
  >
    <Flex vertical gap={allSpacing.marginMD}>
      <RequisitosChecklist
        items={requisitos.map((r) => ({
          id: r.requisitoId,
          descripcion: r.descripcion,
          obligatorio: r.obligatorio,
          checked: r.entregado,
        }))}
        onToggle={onToggle}
        disabled={!editable || saving}
      />
      {dirty ? (
        <Flex gap={allSpacing.marginSM} justify="flex-end">
          <Button variant="back" size="middle" disabled={saving} onClick={onDescartar}>
            Descartar cambios
          </Button>
          <ActionButton
            permiso={CAPACITACION_PERMISOS.inscripcion}
            accion="EDITAR"
            variant="primary"
            size="middle"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={onGuardar}
          >
            Guardar requisitos
          </ActionButton>
        </Flex>
      ) : null}
    </Flex>
  </DetailInfoCard>
);

export default InscripcionRequisitosSection;
