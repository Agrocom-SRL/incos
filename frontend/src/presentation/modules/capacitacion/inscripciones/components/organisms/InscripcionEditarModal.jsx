/**
 * Organismo: modal «Editar inscripción» (CAP · capacitacion.inscripcion EDITAR).
 *
 * Dos bloques en un solo `Form`: datos del participante (reutiliza
 * `ParticipanteFormFields`, el mismo formulario del alta/edición de participantes
 * y del wizard) y grupo del curso (select con horarios y cupo). El grupo se
 * deshabilita con tooltip cuando la inscripción está RETIRADA/ANULADA. Los
 * errores del servidor (409: CI duplicado, grupo lleno) se muestran dentro del
 * modal sin cerrar. Presentacional: la orquestación vive en `useInscripcionEditar`.
 */

import { Alert, Flex, Form, Modal, Select, Tooltip, Typography } from 'antd';
import { modalWidths } from '@theme/tokens/spacing';
import { allSpacing } from '@theme/tokens';
import ParticipanteFormFields from '@capacitacion/components/organisms/ParticipanteFormFields';

const InscripcionEditarModal = ({
  open,
  form,
  initialValues,
  guardando = false,
  error = null,
  grupoOptions = [],
  grupoMotivoDeshabilitado = null,
  loadingGrupos = false,
  errorGrupos = null,
  onGuardar,
  onCancel,
}) => {
  const mostrarGrupo = loadingGrupos || grupoOptions.length > 0;

  return (
    <Modal
      open={open}
      title="Editar inscripción"
      okText="Guardar cambios"
      cancelText="Cancelar"
      onOk={onGuardar}
      onCancel={onCancel}
      confirmLoading={guardando}
      maskClosable={!guardando}
      destroyOnHidden
      width={modalWidths.modalWidthLG}
    >
      <Form form={form} layout="vertical" initialValues={initialValues} disabled={guardando}>
        <Flex vertical gap={allSpacing.marginMD}>
          {error ? (
            <Alert type="error" showIcon title="No se pudieron guardar los cambios" description={error} />
          ) : null}

          <section aria-label="Datos del participante">
            <Typography.Title level={5}>Participante</Typography.Title>
            <Typography.Paragraph type="secondary">
              Los cambios también se reflejan en las otras inscripciones del participante.
            </Typography.Paragraph>
            <ParticipanteFormFields disabled={guardando} />
          </section>

          {mostrarGrupo ? (
            <section aria-label="Grupo del curso">
              <Typography.Title level={5}>Grupo</Typography.Title>
              {errorGrupos ? (
                <Alert
                  type="warning"
                  showIcon
                  title="No se pudieron cargar los grupos del curso"
                  description={errorGrupos}
                  style={{ marginBottom: allSpacing.marginSM }}
                />
              ) : null}
              <Tooltip title={grupoMotivoDeshabilitado}>
                <div>
                  <Form.Item name="capacitacionGrupoId" label="Grupo del curso">
                    <Select
                      options={grupoOptions}
                      loading={loadingGrupos}
                      disabled={guardando || Boolean(grupoMotivoDeshabilitado)}
                      placeholder="Seleccione el grupo"
                    />
                  </Form.Item>
                </div>
              </Tooltip>
            </section>
          ) : null}
        </Flex>
      </Form>
    </Modal>
  );
};

export default InscripcionEditarModal;
