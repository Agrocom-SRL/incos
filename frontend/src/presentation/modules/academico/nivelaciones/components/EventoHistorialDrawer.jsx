/**
 * Drawer de `/academico/nivelaciones/inscribir` (B2) — dos modos:
 *
 * - `crear`: hay un ancla real (`subjectEnrollmentId` XOR `enrollmentId`+
 *   `planSubjectId`) para escribir un evento NUEVO. Identificación
 *   (estudiante/materia read-only + `tipo_estado` con `optGroup`) →
 *   Programar examen (condicional, tipos de examen académico) →
 *   Observaciones. Sin `Modal.confirm` al guardar (regla A5: solo
 *   eliminar/anular/cancelar lo usan). EXCLUYE deliberadamente ABANDONO/
 *   RETIRADO del Select — esa decisión administrativa vive únicamente en
 *   `ResultadoNivelacionDrawer` (permiso `academico.nivelacion.aprobar`,
 *   espejo del gate del backend). Ver `nivelacionEstados.js`.
 * - `detalle`: solo se conoce el `historialMatriculaId` de un evento YA
 *   registrado (deep-link desde la grilla, StatusPill de una celda). Sin
 *   ancla reutilizable para volver a escribir — la grilla no la expone (gap
 *   documentado) — así que el Drawer se abre en solo lectura.
 */

import { useState } from 'react';
import { Alert, App, Button, DatePicker, Drawer, Form, InputNumber, Select } from 'antd';
import { CalendarOutlined, ProfileOutlined, TagsOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { FieldTextarea, StatusPill } from '@atoms';
import SeccionAjustes from '@academico/calificaciones/components/ajustes/SeccionAjustes.jsx';
import {
  TIPOS_EVENTO_INSCRIBIR_OPTIONS,
  TIPOS_CON_EXAMEN,
  formatEstadoHistorial,
  getEstadoHistorialPillClass,
  formatEstadoNivelacion,
  getEstadoNivelacionPillClass,
} from '@application-academico/nivelaciones/utils/nivelacionEstados.js';
import { useRegistrarEventoHistorial, useProgramarNivelacion } from '@application-academico/nivelaciones/hooks/api';
import {
  NIVELACION_DRAWER_Z_INDEX,
  nivelacionDrawerClassNames,
  nivelacionDrawerRootClassName,
  nivelacionDrawerSectionClassName,
  nivelacionDrawerStyles,
  nivelacionDrawerTarjetaClassName,
} from '../utils/nivelacionDrawerLayout.js';

const ContextoIdentificacion = ({ contexto }) => (
  <dl className="niv-ajustes-drawer__contexto">
    <div className="niv-ajustes-drawer__contexto-item">
      <dt>Estudiante</dt>
      <dd>
        {contexto?.estudianteCodigo ? `${contexto.estudianteCodigo} — ` : ''}
        {contexto?.estudianteNombre || 'Sin datos de contexto'}
      </dd>
    </div>
    <div className="niv-ajustes-drawer__contexto-item">
      <dt>Materia</dt>
      <dd>
        {[contexto?.asignaturaSigla, contexto?.asignaturaNombre].filter(Boolean).join(' — ') ||
          'Sin datos de contexto'}
      </dd>
    </div>
  </dl>
);

const EventoHistorialDrawerFooter = ({ modo, guardando, onCerrar, onGuardar }) => (
  <div className="niv-ajustes-drawer__footer">
    <span className="niv-ajustes-drawer__footer-count niv-ajustes-drawer__footer-count--empty" />
    <div className="niv-ajustes-drawer__footer-actions">
      <Button onClick={onCerrar} disabled={guardando}>
        {modo === 'crear' ? 'Cancelar' : 'Cerrar'}
      </Button>
      {modo === 'crear' ? (
        <Button type="primary" loading={guardando} onClick={onGuardar}>
          Registrar
        </Button>
      ) : null}
    </div>
  </div>
);

const DetalleEventoSoloLectura = ({ detalle }) => (
  <div className="niv-ajustes-drawer__detalle">
    <Alert
      type="info"
      showIcon
      title="Evento ya registrado"
      description="Este evento no tiene un ancla de escritura disponible desde la grilla; se muestra en modo lectura. Para registrar un evento nuevo sobre esta materia, use el buscador de estudiante del menú Nivelación."
      className="niv-ajustes-drawer__alert"
    />
    <dl className="niv-ajustes-drawer__contexto">
      <div className="niv-ajustes-drawer__contexto-item">
        <dt>Tipo de evento</dt>
        <dd>
          <StatusPill
            label={formatEstadoHistorial(detalle?.stateType)}
            className={getEstadoHistorialPillClass(detalle?.stateType)}
          />
        </dd>
      </div>
      <div className="niv-ajustes-drawer__contexto-item">
        <dt>Fecha de transición</dt>
        <dd>{detalle?.transitionDate || '—'}</dd>
      </div>
      {detalle?.resultingGrade != null ? (
        <div className="niv-ajustes-drawer__contexto-item">
          <dt>Nota {detalle?.forcedGrade ? 'forzada' : 'resultante'}</dt>
          <dd>{detalle.resultingGrade}</dd>
        </div>
      ) : null}
      <div className="niv-ajustes-drawer__contexto-item">
        <dt>Observaciones</dt>
        <dd>{detalle?.observations || '—'}</dd>
      </div>
      {detalle?.nivelacion ? (
        <div className="niv-ajustes-drawer__contexto-item">
          <dt>Examen de nivelación</dt>
          <dd>
            <StatusPill
              label={formatEstadoNivelacion(detalle.nivelacion.status)}
              className={getEstadoNivelacionPillClass(detalle.nivelacion.status)}
            />
            {detalle.nivelacion.examDate ? ` · ${detalle.nivelacion.examDate}` : ''}
          </dd>
        </div>
      ) : null}
    </dl>
  </div>
);

/**
 * @param {Object} props
 * @param {boolean} props.abierto
 * @param {'crear'|'detalle'} props.modo
 * @param {Object} props.contexto - { estudianteNombre, estudianteCodigo, asignaturaSigla, asignaturaNombre }
 * @param {{subjectEnrollmentId?:number, enrollmentId?:number, planSubjectId?:number}} [props.ancla] - solo modo 'crear'
 * @param {Object} [props.detalle] - solo modo 'detalle'
 * @param {() => void} props.onCerrar
 * @param {() => void} [props.onGuardado]
 */
const EventoHistorialDrawer = ({ abierto, modo, contexto, ancla, detalle, onCerrar, onGuardado }) => {
  const { notification } = App.useApp();
  const [form] = Form.useForm();
  const { registrarEvento, loading: guardandoEvento } = useRegistrarEventoHistorial();
  const { programar, loading: guardandoExamen } = useProgramarNivelacion();
  const [errorGuardado, setErrorGuardado] = useState(null);

  const guardando = guardandoEvento || guardandoExamen;
  const tipoSeleccionado = Form.useWatch('stateType', form);
  const esExamen = TIPOS_CON_EXAMEN.includes(tipoSeleccionado);

  // Ajuste durante el render al reabrir (sin setState en efecto), mismo
  // patrón que `CentralizadorMatrizPage.jsx` (`prevObservacionesSeed`).
  const [prevAbierto, setPrevAbierto] = useState(abierto);
  if (abierto !== prevAbierto) {
    setPrevAbierto(abierto);
    if (abierto) {
      setErrorGuardado(null);
      form.resetFields();
      form.setFieldsValue({ transitionDate: dayjs() });
    }
  }

  const handleCerrar = () => {
    if (!guardando) onCerrar();
  };

  const handleGuardar = async () => {
    try {
      const values = await form.validateFields();
      setErrorGuardado(null);

      const base = {
        ...ancla,
        stateType: values.stateType,
        transitionDate: values.transitionDate ? values.transitionDate.format('YYYY-MM-DD') : null,
        observations: values.observations?.trim() || undefined,
      };

      const result = esExamen
        ? await programar({
            ...base,
            examDate: values.examDate ? values.examDate.format('YYYY-MM-DD') : undefined,
            evaluatorTeacherId: values.evaluatorTeacherId ?? undefined,
          })
        : await registrarEvento(base);

      if (!result.success) {
        setErrorGuardado(result.error || 'No se pudo registrar. Reintente.');
        return;
      }

      notification.success({
        title: esExamen ? 'Examen de nivelación programado' : 'Evento registrado',
      });
      onGuardado?.(result.data);
      onCerrar();
    } catch (err) {
      if (err?.errorFields) return;
      setErrorGuardado(typeof err?.message === 'string' ? err.message : 'No se pudo guardar. Reintente.');
    }
  };

  const tituloDrawer = modo === 'crear' ? 'Registrar evento de nivelación' : 'Detalle del evento';

  return (
    <Drawer
      title={tituloDrawer}
      size={520}
      open={abierto}
      onClose={handleCerrar}
      destroyOnClose
      footer={
        <EventoHistorialDrawerFooter
          modo={modo}
          guardando={guardando}
          onCerrar={handleCerrar}
          onGuardar={handleGuardar}
        />
      }
      rootClassName={nivelacionDrawerRootClassName}
      className={`${nivelacionDrawerSectionClassName} niv-evento-drawer`}
      classNames={nivelacionDrawerClassNames}
      zIndex={NIVELACION_DRAWER_Z_INDEX}
      styles={nivelacionDrawerStyles()}
    >
      {errorGuardado ? (
        <Alert
          type="error"
          showIcon
          title={errorGuardado}
          action={
            <Button size="small" type="link" onClick={handleGuardar}>
              Reintentar
            </Button>
          }
          className="niv-ajustes-drawer__alert"
        />
      ) : null}

      {modo === 'detalle' ? (
        <DetalleEventoSoloLectura detalle={detalle} />
      ) : (
        <Form form={form} layout="vertical" className="niv-ajustes-drawer__form">
          <div className="niv-evento-drawer__bloques">
            <SeccionAjustes icon={TagsOutlined} titulo="Identificación" className={nivelacionDrawerTarjetaClassName}>
              <ContextoIdentificacion contexto={contexto} />

              <Form.Item
                name="stateType"
                label="Tipo de evento"
                rules={[{ required: true, message: 'Seleccione un tipo de evento' }]}
              >
                <Select placeholder="Seleccionar tipo" options={TIPOS_EVENTO_INSCRIBIR_OPTIONS} />
              </Form.Item>

              <Form.Item name="transitionDate" label="Fecha de transición">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </SeccionAjustes>

            {esExamen ? (
              <SeccionAjustes
                icon={CalendarOutlined}
                titulo="Programar examen"
                className={nivelacionDrawerTarjetaClassName}
              >
                <p className="niv-ajustes-drawer__section-desc">
                  Fecha del examen y docente evaluador (opcionales al registrar; se pueden
                  completar luego desde la bandeja de aprobación).
                </p>
                <Form.Item name="examDate" label="Fecha del examen">
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>
                <Form.Item name="evaluatorTeacherId" label="Docente evaluador (ID)">
                  <InputNumber style={{ width: '100%' }} min={1} placeholder="ID del docente" />
                </Form.Item>
              </SeccionAjustes>
            ) : null}

            <SeccionAjustes icon={ProfileOutlined} titulo="Observaciones" className={nivelacionDrawerTarjetaClassName}>
              <Form.Item name="observations" label="Observaciones (opcional)">
                <FieldTextarea rows={3} minRows={3} maxLength={2000} placeholder="Detalle adicional…" />
              </Form.Item>
            </SeccionAjustes>
          </div>
        </Form>
      )}
    </Drawer>
  );
};

export default EventoHistorialDrawer;
