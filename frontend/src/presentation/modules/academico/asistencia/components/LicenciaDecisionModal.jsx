/**
 * Modal de confirmación de decisión sobre una licencia PENDIENTE: aprobar o rechazar — molécula.
 *
 * Reemplaza al drawer de decisión por un Modal de confirmación (coherente con el patrón de
 * confirmación de Docentes). Al rechazar, el motivo de rechazo es obligatorio; las observaciones
 * de la decisión son opcionales en ambos casos. La regla "solo desde PENDIENTE" y el tope de
 * días los valida el backend; aquí solo se envía la decisión.
 *
 * @param {Object} props
 * @param {boolean} props.open
 * @param {Object|null} props.licencia            - licencia objetivo (estudianteNombre, rango…)
 * @param {'APROBAR'|'RECHAZAR'} props.decision
 * @param {boolean} props.guardando
 * @param {() => void} props.onCerrar
 * @param {(payload: { decision, motivoRechazo?, observacionesDecision? }) => Promise<{success:boolean}>} props.onConfirmar
 */

import { useEffect } from 'react';
import { Alert, Form, Input, Modal } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { allSpacing } from '@theme/tokens';
import { etiquetaRangoFechas } from '@application-academico/asistencia/utils/asistenciaFechas.js';

const LicenciaDecisionModal = ({
  open,
  licencia = null,
  decision = 'APROBAR',
  guardando = false,
  onCerrar,
  onConfirmar,
}) => {
  const [form] = Form.useForm();
  const esRechazo = decision === 'RECHAZAR';

  useEffect(() => {
    if (open) form.resetFields();
  }, [open, licencia, decision, form]);

  const handleConfirmar = async () => {
    const values = await form.validateFields();
    const payload = {
      decision,
      observacionesDecision: values.observacionesDecision?.trim() || undefined,
    };
    if (esRechazo) {
      payload.motivoRechazo = values.motivoRechazo?.trim();
    }
    const result = await onConfirmar(payload);
    if (result?.success) onCerrar();
  };

  const handleCerrar = () => {
    if (!guardando) onCerrar();
  };

  return (
    <Modal
      open={open}
      title={esRechazo ? 'Rechazar licencia' : 'Aprobar licencia'}
      onOk={handleConfirmar}
      onCancel={handleCerrar}
      okText={esRechazo ? 'Rechazar licencia' : 'Aprobar licencia'}
      cancelText="Cancelar"
      confirmLoading={guardando}
      okButtonProps={{
        danger: esRechazo,
        icon: esRechazo ? <CloseCircleOutlined /> : <CheckCircleOutlined />,
      }}
      maskClosable={!guardando}
      destroyOnHidden
    >
      <Alert
        type={esRechazo ? 'warning' : 'info'}
        showIcon
        title={esRechazo ? 'Rechazar la solicitud de licencia' : 'Aprobar la solicitud de licencia'}
        description={
          licencia
            ? `${licencia.estudianteNombre ?? 'Estudiante'} · ${etiquetaRangoFechas(
                licencia.fechaInicio,
                licencia.fechaFin,
              )} · ${licencia.totalDias ?? '—'} día(s).`
            : null
        }
        style={{ marginBottom: allSpacing.margin }}
      />

      <Form form={form} layout="vertical">
        {esRechazo ? (
          <Form.Item
            name="motivoRechazo"
            label="Motivo del rechazo"
            rules={[{ required: true, message: 'Indicá por qué se rechaza la licencia' }]}
          >
            <Input.TextArea
              rows={3}
              maxLength={300}
              showCount
              placeholder="Ej.: la documentación de respaldo no fue presentada."
            />
          </Form.Item>
        ) : null}

        <Form.Item
          name="observacionesDecision"
          label={esRechazo ? 'Observaciones adicionales (opcional)' : 'Observaciones (opcional)'}
        >
          <Input.TextArea
            rows={3}
            maxLength={300}
            showCount
            placeholder="Notas internas sobre la decisión."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default LicenciaDecisionModal;
