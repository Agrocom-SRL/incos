/**
 * Drawer único de una licencia estudiantil: ficha (detalle) + decisión (aprobar/rechazar).
 *
 * Reemplaza a la página de detalle (ACA-ASI-LIC-DET) y al Modal de decisión: la acción "ver"
 * de la tabla abre este drawer; sobre una licencia PENDIENTE (y con permiso licencia.aprobar ·
 * APROBAR) ofrece aprobar/rechazar inline, sin navegar a otra pantalla. Al rechazar, el motivo
 * es obligatorio; las observaciones son opcionales. La regla "solo desde PENDIENTE" y el tope de
 * días los valida el backend.
 *
 * Modos internos:
 *  - 'idle'    → ficha + (si pendiente/puede) botones Aprobar / Rechazar.
 *  - 'APROBAR' → ficha + observaciones (opcional) + confirmar aprobación.
 *  - 'RECHAZAR'→ ficha + motivo del rechazo (obligatorio) + observaciones.
 *
 * @param {Object} props
 * @param {boolean} props.open
 * @param {Object|null} props.licencia
 * @param {boolean} [props.puedeDecidir=false]   - permiso licencia.aprobar · APROBAR
 * @param {'APROBAR'|'RECHAZAR'|null} [props.decisionInicial] - abrir directo en modo decisión
 * @param {boolean} [props.guardando=false]
 * @param {() => void} props.onCerrar
 * @param {(payload: { decision, motivoRechazo?, observacionesDecision? }) => Promise<{success:boolean}>} props.onDecidir
 */

import { useState } from 'react';
import { Alert, Drawer, Flex, Form, Input, Tag } from 'antd';
import {
  CalendarOutlined,
  CheckOutlined,
  CloseOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { DetailField, Button, Text } from '@atoms';
import { allSpacing } from '@theme/tokens';
import {
  formatEstadoLicencia,
  tagColorEstadoLicencia,
  ESTADOS_LICENCIA,
} from '@application-academico/asistencia/utils/licenciasEstados.js';
import { formatMotivoLicencia } from '@application-academico/asistencia/utils/licenciasMotivos.js';
import {
  etiquetaRangoFechas,
  etiquetaDiaMesAnio,
} from '@application-academico/asistencia/utils/asistenciaFechas.js';
import '@presentation/styles/pages/detail-page.css';

const LicenciaDecisionDrawer = ({
  open,
  licencia = null,
  puedeDecidir = false,
  decisionInicial = null,
  guardando = false,
  onCerrar,
  onDecidir,
}) => {
  const [form] = Form.useForm();
  // 'idle' | 'APROBAR' | 'RECHAZAR'
  const [modo, setModo] = useState('idle');
  const [sesion, setSesion] = useState(null);

  const esPendiente = licencia?.estado === ESTADOS_LICENCIA.PENDIENTE;
  const puedeAccionar = esPendiente && puedeDecidir;
  const tieneDecision = Boolean(licencia?.motivoRechazo || licencia?.observacionesDecision);

  // Reset del modo al abrir o cambiar de licencia (ajuste de estado en render, sin efecto).
  // El form se monta fresco en cada modo gracias a destroyOnHidden + render condicional.
  const sesionActual = open ? `${licencia?.id ?? ''}::${decisionInicial ?? ''}` : null;
  if (sesionActual !== sesion) {
    setSesion(sesionActual);
    setModo(open && puedeAccionar && decisionInicial ? decisionInicial : 'idle');
  }

  const esRechazo = modo === 'RECHAZAR';
  const enDecision = modo !== 'idle';

  const handleConfirmar = async () => {
    const values = await form.validateFields();
    const payload = {
      decision: modo,
      observacionesDecision: values.observacionesDecision?.trim() || undefined,
    };
    if (esRechazo) payload.motivoRechazo = values.motivoRechazo?.trim();
    const result = await onDecidir(payload);
    if (result?.success) onCerrar?.();
  };

  const handleCerrar = () => {
    if (!guardando) onCerrar?.();
  };

  const footer = !licencia ? null : enDecision ? (
    <Flex justify="flex-end" gap={allSpacing.marginSM}>
      <Button variant="outline" onClick={() => setModo('idle')} disabled={guardando}>
        Cancelar
      </Button>
      <Button
        variant={esRechazo ? 'error' : 'success'}
        icon={esRechazo ? <CloseOutlined /> : <CheckOutlined />}
        loading={guardando}
        onClick={handleConfirmar}
      >
        {esRechazo ? 'Confirmar rechazo' : 'Confirmar aprobación'}
      </Button>
    </Flex>
  ) : (
    <Flex justify="flex-end" gap={allSpacing.marginSM}>
      <Button variant="outline" onClick={handleCerrar}>
        Cerrar
      </Button>
      {puedeAccionar ? (
        <>
          <Button variant="error" icon={<CloseOutlined />} onClick={() => setModo('RECHAZAR')}>
            Rechazar
          </Button>
          <Button variant="success" icon={<CheckOutlined />} onClick={() => setModo('APROBAR')}>
            Aprobar
          </Button>
        </>
      ) : null}
    </Flex>
  );

  return (
    <Drawer
      open={open}
      width={520}
      title="Detalle de la licencia"
      onClose={handleCerrar}
      maskClosable={!guardando}
      destroyOnHidden
      footer={footer}
    >
      {licencia ? (
        <Flex vertical gap={allSpacing.marginLG}>
          <Flex vertical gap={allSpacing.marginXS}>
            <Flex align="center" gap={allSpacing.marginXS} wrap="wrap">
              <UserOutlined />
              <Text strong style={{ fontSize: 'var(--font-size-lg)' }}>
                {licencia.estudianteNombre ?? 'Estudiante'}
              </Text>
              <Tag color={tagColorEstadoLicencia(licencia.estado)}>
                {formatEstadoLicencia(licencia.estado)}
              </Tag>
            </Flex>
            <Text type="secondary">
              <CalendarOutlined style={{ marginRight: allSpacing.marginXS }} />
              {etiquetaRangoFechas(licencia.fechaInicio, licencia.fechaFin)}
            </Text>
          </Flex>

          <Flex vertical gap={allSpacing.marginSM}>
            <DetailField label="Total de días">{licencia.totalDias ?? '—'}</DetailField>
            <DetailField label="Motivo">{formatMotivoLicencia(licencia.motivo)}</DetailField>
            <DetailField label="Detalle del motivo">{licencia.detalleMotivo}</DetailField>
            <DetailField label="Fecha de solicitud">
              {etiquetaDiaMesAnio(licencia.fechaSolicitud)}
            </DetailField>
            {tieneDecision ? (
              <>
                <DetailField label="Motivo del rechazo">{licencia.motivoRechazo}</DetailField>
                <DetailField label="Observaciones de la decisión">
                  {licencia.observacionesDecision}
                </DetailField>
              </>
            ) : null}
          </Flex>

          {enDecision ? (
            <Flex vertical gap={allSpacing.marginSM}>
              <Alert
                type={esRechazo ? 'warning' : 'info'}
                showIcon
                title={
                  esRechazo ? 'Rechazar la solicitud de licencia' : 'Aprobar la solicitud de licencia'
                }
                description={`${licencia.estudianteNombre ?? 'Estudiante'} · ${etiquetaRangoFechas(
                  licencia.fechaInicio,
                  licencia.fechaFin,
                )} · ${licencia.totalDias ?? '—'} día(s).`}
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
            </Flex>
          ) : null}
        </Flex>
      ) : null}
    </Drawer>
  );
};

export default LicenciaDecisionDrawer;
