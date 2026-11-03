/**
 * Drawer de `/academico/nivelaciones/aprobar` (B3) — dos acciones
 * independientes sobre la misma fila de la bandeja:
 *
 * 1) Resultado del examen (`PATCH /examenes/:id/resultado`): guardado
 *    DIRECTO, sin confirmación (regla A5 — es el examen, no la decisión
 *    irreversible).
 * 2) Decisión administrativa ABANDONO/RETIRADO
 *    (`POST /decisiones-administrativas`): con `Modal.confirm` (regla A5,
 *    mismo estilo que `confirmarEliminar` de `EvaluacionDrawer.jsx`) por
 *    IRREVERSIBLE — actualiza `matriculas_materia.estado` real. Solo
 *    disponible cuando la fila trae `subjectEnrollmentId` (materia cursada
 *    este año); las materias arrastradas no tienen ese ancla en la bandeja.
 */

import { useState } from 'react';
import { Alert, Button, DatePicker, Drawer, Form, InputNumber, Modal, Select } from 'antd';
import { CheckCircleOutlined, ProfileOutlined, WarningOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { FieldTextarea, StatusPill } from '@atoms';
import SeccionAjustes from '@academico/calificaciones/components/ajustes/SeccionAjustes.jsx';
import {
  RESULTADO_NIVELACION_OPTIONS,
  DECISION_ADMINISTRATIVA_OPTIONS,
  ESTADOS_NIVELACION_FINALES,
  formatEstadoHistorial,
  getEstadoHistorialPillClass,
  formatEstadoNivelacion,
  getEstadoNivelacionPillClass,
  NOTA_MINIMA_NIVELACION,
} from '@application-academico/nivelaciones/utils/nivelacionEstados.js';
import {
  NIVELACION_DRAWER_Z_INDEX,
  nivelacionDrawerClassNames,
  nivelacionDrawerRootClassName,
  nivelacionDrawerSectionClassName,
  nivelacionDrawerStyles,
  nivelacionDrawerTarjetaClassName,
} from '../utils/nivelacionDrawerLayout.js';

const ContextoFila = ({ fila }) => (
  <dl className="niv-ajustes-drawer__contexto">
    <div className="niv-ajustes-drawer__contexto-item">
      <dt>Estudiante</dt>
      <dd>
        {fila?.codigoEstudiante ? `${fila.codigoEstudiante} — ` : ''}
        {fila?.nombreCompleto || '—'}
      </dd>
    </div>
    <div className="niv-ajustes-drawer__contexto-item">
      <dt>Materia</dt>
      <dd>
        {[fila?.asignaturaSigla, fila?.asignaturaNombre].filter(Boolean).join(' — ') || '—'}
        {fila?.paraleloGestionId == null ? ' (materia arrastrada)' : ''}
      </dd>
    </div>
    <div className="niv-ajustes-drawer__contexto-item">
      <dt>Tipo de evento</dt>
      <dd>
        <StatusPill
          label={formatEstadoHistorial(fila?.stateType)}
          className={getEstadoHistorialPillClass(fila?.stateType)}
        />
      </dd>
    </div>
    <div className="niv-ajustes-drawer__contexto-item">
      <dt>Estado del examen</dt>
      <dd>
        <StatusPill
          label={formatEstadoNivelacion(fila?.status)}
          className={getEstadoNivelacionPillClass(fila?.status)}
        />
      </dd>
    </div>
  </dl>
);

const ResultadoNivelacionDrawer = ({
  abierto,
  fila,
  onCerrar,
  onGuardarResultado,
  guardandoResultado,
  onRegistrarDecision,
  guardandoDecision,
}) => {
  const [formResultado] = Form.useForm();
  const [formDecision] = Form.useForm();
  const [errorResultado, setErrorResultado] = useState(null);
  const [errorDecision, setErrorDecision] = useState(null);

  const statusResultado = Form.useWatch('status', formResultado);
  const requiereNota = ESTADOS_NIVELACION_FINALES.includes(statusResultado);

  // Ajuste durante el render al cambiar de fila/reabrir (sin setState en
  // efecto), mismo patrón que `CentralizadorMatrizPage.jsx` (`prevObservacionesSeed`).
  const [prevFila, setPrevFila] = useState(fila);
  if (fila !== prevFila) {
    setPrevFila(fila);
    if (abierto && fila) {
      setErrorResultado(null);
      setErrorDecision(null);
      formResultado.setFieldsValue({
        status: fila.status,
        levelingGrade: fila.levelingGrade ?? undefined,
        observations: fila.observations ?? undefined,
      });
      formDecision.resetFields();
      formDecision.setFieldsValue({ transitionDate: dayjs() });
    }
  }

  const handleCerrar = () => {
    if (!guardandoResultado && !guardandoDecision) onCerrar();
  };

  const handleGuardarResultado = async () => {
    try {
      const values = await formResultado.validateFields();
      setErrorResultado(null);
      const payload = {
        status: values.status,
        levelingGrade: requiereNota ? values.levelingGrade : undefined,
        observations: values.observations?.trim() || undefined,
      };
      const result = await onGuardarResultado(fila.nivelacionId, payload);
      if (!result?.success) {
        setErrorResultado(result?.error || 'No se pudo guardar el resultado.');
      }
    } catch (err) {
      if (err?.errorFields) return;
      setErrorResultado(typeof err?.message === 'string' ? err.message : 'No se pudo guardar. Reintente.');
    }
  };

  const confirmarDecision = () => {
    formDecision
      .validateFields()
      .then((values) => {
        Modal.confirm({
          title: 'Registrar decisión administrativa',
          icon: <WarningOutlined />,
          okText: 'Registrar',
          okType: 'danger',
          cancelText: 'Cancelar',
          content: (
            <span>
              Esta acción es <strong>irreversible</strong>: marcará al estudiante como{' '}
              <strong>{DECISION_ADMINISTRATIVA_OPTIONS.find((o) => o.value === values.stateType)?.label}</strong>{' '}
              en esta materia, con nota forzada <strong>{values.resultingGrade}</strong>. ¿Confirma?
            </span>
          ),
          onOk: async () => {
            setErrorDecision(null);
            const payload = {
              subjectEnrollmentId: fila.subjectEnrollmentId,
              stateType: values.stateType,
              resultingGrade: values.resultingGrade,
              transitionDate: values.transitionDate ? values.transitionDate.format('YYYY-MM-DD') : undefined,
              observations: values.observations?.trim() || undefined,
            };
            const result = await onRegistrarDecision(payload);
            if (!result?.success) {
              setErrorDecision(result?.error || 'No se pudo registrar la decisión administrativa.');
            }
          },
        });
      })
      .catch(() => {});
  };

  return (
    <Drawer
      title="Gestionar nivelación"
      size={520}
      open={abierto}
      onClose={handleCerrar}
      destroyOnHidden
      footer={null}
      rootClassName={nivelacionDrawerRootClassName}
      className={`${nivelacionDrawerSectionClassName} niv-resultado-drawer`}
      classNames={nivelacionDrawerClassNames}
      zIndex={NIVELACION_DRAWER_Z_INDEX}
      styles={nivelacionDrawerStyles()}
    >
      <div className="niv-evento-drawer__bloques">
        <SeccionAjustes icon={ProfileOutlined} titulo="Contexto" className={nivelacionDrawerTarjetaClassName}>
          <ContextoFila fila={fila} />
        </SeccionAjustes>

        <SeccionAjustes
          icon={CheckCircleOutlined}
          titulo="Resultado del examen"
          className={nivelacionDrawerTarjetaClassName}
        >
          <p className="niv-ajustes-drawer__section-desc">
            Nota mínima de aprobación: {NOTA_MINIMA_NIVELACION}. Guardado directo, sin
            confirmación.
          </p>
          {errorResultado ? (
            <Alert type="error" showIcon title={errorResultado} className="niv-ajustes-drawer__alert" />
          ) : null}
          <Form form={formResultado} layout="vertical">
            <Form.Item name="status" label="Estado" rules={[{ required: true, message: 'Seleccione un estado' }]}>
              <Select options={RESULTADO_NIVELACION_OPTIONS} />
            </Form.Item>
            {requiereNota ? (
              <Form.Item
                name="levelingGrade"
                label="Nota obtenida"
                rules={[{ required: true, message: 'Ingrese la nota' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} max={100} />
              </Form.Item>
            ) : null}
            <Form.Item name="observations" label="Observaciones (opcional)">
              <FieldTextarea rows={2} minRows={2} maxLength={2000} />
            </Form.Item>
          </Form>
          <Button type="primary" loading={guardandoResultado} onClick={handleGuardarResultado}>
            Guardar resultado
          </Button>
        </SeccionAjustes>

        {fila?.subjectEnrollmentId != null ? (
          <SeccionAjustes
            icon={WarningOutlined}
            titulo="Decisión administrativa"
            className={nivelacionDrawerTarjetaClassName}
          >
            <p className="niv-ajustes-drawer__section-desc">
              Marca ABANDONO/RETIRADO con nota forzada. Acción de RECTOR/DIR_ACADEMICO,
              irreversible.
            </p>
            {errorDecision ? (
              <Alert type="error" showIcon title={errorDecision} className="niv-ajustes-drawer__alert" />
            ) : null}
            <Form form={formDecision} layout="vertical">
              <Form.Item
                name="stateType"
                label="Decisión"
                rules={[{ required: true, message: 'Seleccione una decisión' }]}
              >
                <Select options={DECISION_ADMINISTRATIVA_OPTIONS} placeholder="Seleccionar…" />
              </Form.Item>
              <Form.Item
                name="resultingGrade"
                label="Nota forzada"
                rules={[{ required: true, message: 'Ingrese la nota forzada' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} max={100} />
              </Form.Item>
              <Form.Item name="transitionDate" label="Fecha de transición">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
              <Form.Item name="observations" label="Observaciones (opcional)">
                <FieldTextarea rows={2} minRows={2} maxLength={2000} />
              </Form.Item>
            </Form>
            <Button danger loading={guardandoDecision} onClick={confirmarDecision}>
              Registrar decisión administrativa
            </Button>
          </SeccionAjustes>
        ) : null}
      </div>
    </Drawer>
  );
};

export default ResultadoNivelacionDrawer;
