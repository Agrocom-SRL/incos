/**
 * Organismo: modal de acceso rápido «Requisitos de la inscripción» (CAP ·
 * capacitacion.inscripcion EDITAR). Lo abre el listado para marcar como entregado
 * (o desmarcar) cualquier requisito del curso sin pasar por «Editar inscripción».
 *
 * Presentacional y controlado: `open` y los datos los da el hook de pantalla. Reusa
 * el checklist del wizard (`RequisitosChecklist`); solo guarda si hay cambios.
 */

import { Alert, Flex, Modal, Skeleton, Typography } from 'antd';
import RequisitosChecklist from '@capacitacion/components/molecules/RequisitosChecklist';
import { allSpacing } from '@theme/tokens';

const InscripcionRequisitosRapidoModal = ({
  open = false,
  ficha = null,
  requisitos = [],
  loading = false,
  error = null,
  hayCambios = false,
  pendientes = [],
  guardando = false,
  onToggle,
  onGuardar,
  onCancel,
}) => {
  const items = requisitos.map((r) => ({
    id: r.requisitoId,
    descripcion: r.descripcion,
    obligatorio: r.obligatorio,
    acreditaPagoCurso: r.acreditaPagoCurso,
    checked: r.entregado,
  }));

  return (
    <Modal
      open={open}
      title={<Typography.Title level={4} style={{ margin: 0 }}>Requisitos de la inscripción</Typography.Title>}
      okText="Guardar"
      cancelText="Cancelar"
      onOk={onGuardar}
      onCancel={onCancel}
      okButtonProps={{ disabled: !hayCambios || loading || Boolean(error) }}
      confirmLoading={guardando}
      maskClosable={!guardando}
      destroyOnHidden
    >
      {error ? (
        <Alert type="error" showIcon title="No se pudo cargar la inscripción" description={error} />
      ) : loading || !ficha ? (
        <Skeleton active paragraph={{ rows: 3 }} />
      ) : (
        <Flex vertical gap={allSpacing.marginMD}>
          <Flex vertical>
            <Typography.Text strong>{ficha.participanteNombreCompleto}</Typography.Text>
            <Typography.Text type="secondary">{ficha.capacitacionTitulo}</Typography.Text>
          </Flex>
          <RequisitosChecklist items={items} onToggle={onToggle} disabled={guardando} />
          {pendientes.length > 0 ? (
            <Alert
              type="info"
              showIcon
              title="Para pasar a INSCRITO aún falta"
              description={
                <ul style={{ margin: 0, paddingInlineStart: allSpacing.marginMD }}>
                  {pendientes.map((p) => (
                    <li key={p.key}>{p.label}</li>
                  ))}
                </ul>
              }
            />
          ) : null}
        </Flex>
      )}
    </Modal>
  );
};

export default InscripcionRequisitosRapidoModal;
