/**
 * Drawer de decisión de una licencia PENDIENTE: aprobar o rechazar — organismo.
 *
 * Reusa el layout/estilo de los drawers de Académico (calificacionesDrawerLayout + SeccionAjustes)
 * para mantener una sola estética. Al rechazar, el motivo de rechazo es obligatorio; las
 * observaciones de la decisión son opcionales en ambos casos. La regla "solo desde PENDIENTE"
 * y el tope de días los valida el backend; aquí solo se envía la decisión.
 */

import { useEffect } from 'react';
import { Alert, Button, Drawer, Form, Input } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, FormOutlined } from '@ant-design/icons';
import SeccionAjustes from '@academico/calificaciones/components/ajustes/SeccionAjustes.jsx';
import {
  CALIFICACIONES_DRAWER_Z_INDEX,
  calificacionesDrawerClassNames,
  calificacionesDrawerRootClassName,
  calificacionesDrawerSectionClassName,
  calificacionesDrawerStyles,
  calificacionesDrawerTarjetaClassName,
} from '@academico/calificaciones/utils/calificacionesDrawerLayout.js';
import { etiquetaRangoFechas } from '@application-academico/asistencia/utils/asistenciaFechas.js';
import '@academico/calificaciones/styles/calificaciones.css';

const DecisionDrawerFooter = ({ esRechazo, guardando, onCerrar, onConfirmar }) => (
  <div className="cal-ajustes-drawer__footer">
    <span className="cal-ajustes-drawer__footer-count cal-ajustes-drawer__footer-count--empty" />
    <div className="cal-ajustes-drawer__footer-actions">
      <Button onClick={onCerrar} disabled={guardando}>
        Cancelar
      </Button>
      <Button
        type="primary"
        danger={esRechazo}
        className="cal-ajustes-drawer__btn-guardar"
        icon={esRechazo ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
        loading={guardando}
        onClick={onConfirmar}
      >
        {esRechazo ? 'Rechazar licencia' : 'Aprobar licencia'}
      </Button>
    </div>
  </div>
);

/**
 * @param {Object} props
 * @param {boolean} props.abierto
 * @param {Object|null} props.licencia       - licencia objetivo (con estudianteNombre, rango…)
 * @param {'APROBAR'|'RECHAZAR'} props.decision
 * @param {boolean} props.guardando
 * @param {() => void} props.onCerrar
 * @param {(payload: { decision, motivoRechazo?, observacionesDecision? }) => Promise<{success:boolean}>} props.onConfirmar
 */
const LicenciaDecisionDrawer = ({
  abierto,
  licencia = null,
  decision = 'APROBAR',
  guardando = false,
  onCerrar,
  onConfirmar,
}) => {
  const [form] = Form.useForm();
  const esRechazo = decision === 'RECHAZAR';

  useEffect(() => {
    if (!abierto) return;
    form.resetFields();
  }, [abierto, licencia, decision, form]);

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
    <Drawer
      title={esRechazo ? 'Rechazar licencia' : 'Aprobar licencia'}
      size={520}
      open={abierto}
      onClose={handleCerrar}
      destroyOnHidden
      footer={
        <DecisionDrawerFooter
          esRechazo={esRechazo}
          guardando={guardando}
          onCerrar={handleCerrar}
          onConfirmar={handleConfirmar}
        />
      }
      rootClassName={calificacionesDrawerRootClassName}
      className={calificacionesDrawerSectionClassName}
      classNames={calificacionesDrawerClassNames}
      zIndex={CALIFICACIONES_DRAWER_Z_INDEX}
      styles={calificacionesDrawerStyles()}
    >
      <Alert
        type={esRechazo ? 'warning' : 'info'}
        showIcon
        title={
          esRechazo
            ? 'Rechazar la solicitud de licencia'
            : 'Aprobar la solicitud de licencia'
        }
        description={
          licencia
            ? `${licencia.estudianteNombre ?? 'Estudiante'} · ${etiquetaRangoFechas(
                licencia.fechaInicio,
                licencia.fechaFin,
              )} · ${licencia.totalDias ?? '—'} día(s).`
            : null
        }
      />

      <Form form={form} layout="vertical" className="cal-ajustes-drawer__form">
        <SeccionAjustes
          icon={esRechazo ? CloseCircleOutlined : FormOutlined}
          titulo={esRechazo ? 'Motivo del rechazo' : 'Observaciones'}
          className={calificacionesDrawerTarjetaClassName}
        >
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
        </SeccionAjustes>
      </Form>
    </Drawer>
  );
};

export default LicenciaDecisionDrawer;
