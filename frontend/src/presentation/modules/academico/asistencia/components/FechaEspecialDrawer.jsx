/**
 * Drawer para habilitar una fecha especial de clase (taller/recuperación) — organismo.
 *
 * Reusa el layout/estilo de los drawers de Calificaciones (cal-ajustes-drawer + SeccionAjustes)
 * para mantener una sola estética en Académico. La fecha llega precargada desde el día
 * clickeado en el calendario; el motivo es obligatorio y las horas son opcionales.
 * Al confirmar llama `onConfirmar({ fecha, motivo, horaInicio, horaFin })`.
 */

import { useEffect } from 'react';
import { Alert, Button, DatePicker, Drawer, Form, Input, Popconfirm, TimePicker, Tooltip } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import SeccionAjustes from '@academico/calificaciones/components/ajustes/SeccionAjustes.jsx';
import {
  CALIFICACIONES_DRAWER_Z_INDEX,
  calificacionesDrawerClassNames,
  calificacionesDrawerRootClassName,
  calificacionesDrawerSectionClassName,
  calificacionesDrawerStyles,
  calificacionesDrawerTarjetaClassName,
} from '@academico/calificaciones/utils/calificacionesDrawerLayout.js';
import '@academico/calificaciones/styles/calificaciones.css';

const FechaEspecialDrawerFooter = ({
  esEdicion,
  tieneMarcas,
  confirmando,
  eliminando,
  onCerrar,
  onConfirmar,
  onEliminar,
}) => {
  const ocupado = confirmando || eliminando;
  const botonEliminar = (
    <Button danger icon={<DeleteOutlined />} loading={eliminando} disabled={tieneMarcas || confirmando}>
      Eliminar
    </Button>
  );

  return (
    <div className="cal-ajustes-drawer__footer">
      {esEdicion ? (
        tieneMarcas ? (
          <Tooltip title="No se puede eliminar: ya tiene asistencia registrada en ese día.">
            <span>{botonEliminar}</span>
          </Tooltip>
        ) : (
          <Popconfirm
            title="Eliminar fecha especial"
            description="Se quitará este día especial del calendario. ¿Continuar?"
            okText="Eliminar"
            okButtonProps={{ danger: true }}
            cancelText="Cancelar"
            onConfirm={onEliminar}
          >
            {botonEliminar}
          </Popconfirm>
        )
      ) : (
        <span className="cal-ajustes-drawer__footer-count cal-ajustes-drawer__footer-count--empty" />
      )}
      <div className="cal-ajustes-drawer__footer-actions">
        <Button onClick={onCerrar} disabled={ocupado}>
          Cancelar
        </Button>
        <Button
          type="primary"
          className="cal-ajustes-drawer__btn-guardar"
          loading={confirmando}
          disabled={eliminando}
          onClick={onConfirmar}
        >
          {esEdicion ? 'Guardar cambios' : 'Habilitar fecha'}
        </Button>
      </div>
    </div>
  );
};

/** 'HH:mm:ss' | 'HH:mm' → dayjs (o null). Sin plugins de parseo de formato. */
const horaADayjs = (valor) => {
  const hhmm = String(valor ?? '').slice(0, 5);
  return /^\d{2}:\d{2}$/.test(hhmm) ? dayjs(`2000-01-01T${hhmm}`) : null;
};

const FechaEspecialDrawer = ({
  abierto,
  fechaInicial = null,
  sesion = null,
  confirmando = false,
  eliminando = false,
  onCerrar,
  onConfirmar,
  onEliminar,
}) => {
  const [form] = Form.useForm();
  const esEdicion = Boolean(sesion);
  const tieneMarcas = Boolean(sesion?.tieneMarcas);

  // Precarga la fecha del día clickeado; en edición precarga motivo y horas existentes.
  useEffect(() => {
    if (!abierto) return;
    form.resetFields();
    form.setFieldsValue({
      fecha: fechaInicial ? dayjs(fechaInicial) : null,
      motivo: sesion?.motivo ?? undefined,
      horaInicio: horaADayjs(sesion?.horaInicio),
      horaFin: horaADayjs(sesion?.horaFin),
    });
  }, [abierto, fechaInicial, sesion, form]);

  const handleConfirmar = async () => {
    const values = await form.validateFields();
    const ok = await onConfirmar({
      fecha: values.fecha?.format('YYYY-MM-DD'),
      motivo: values.motivo?.trim(),
      horaInicio: values.horaInicio?.format('HH:mm') ?? undefined,
      horaFin: values.horaFin?.format('HH:mm') ?? undefined,
    });
    if (ok) onCerrar();
  };

  const handleEliminar = async () => {
    const ok = await onEliminar?.(fechaInicial);
    if (ok) onCerrar();
  };

  const handleCerrar = () => {
    if (!confirmando && !eliminando) onCerrar();
  };

  return (
    <Drawer
      title={esEdicion ? 'Editar fecha especial' : 'Habilitar fecha especial'}
      size={520}
      open={abierto}
      onClose={handleCerrar}
      destroyOnHidden
      footer={
        <FechaEspecialDrawerFooter
          esEdicion={esEdicion}
          tieneMarcas={tieneMarcas}
          confirmando={confirmando}
          eliminando={eliminando}
          onCerrar={handleCerrar}
          onConfirmar={handleConfirmar}
          onEliminar={handleEliminar}
        />
      }
      rootClassName={calificacionesDrawerRootClassName}
      className={calificacionesDrawerSectionClassName}
      classNames={calificacionesDrawerClassNames}
      zIndex={CALIFICACIONES_DRAWER_Z_INDEX}
      styles={calificacionesDrawerStyles()}
    >
      <Alert
        type="info"
        showIcon
        title="Sesión fuera del horario habitual"
        description={
          esEdicion
            ? 'Edite el motivo o el horario de esta sesión especial, o elimínela si la creó por error (solo si todavía no tiene asistencia tomada).'
            : 'Habilite un día que no figura en el horario del curso (taller, recuperación o reposición) para poder tomar lista en esa fecha.'
        }
        className="asi-fecha-especial__alert"
      />

      <Form form={form} layout="vertical" className="cal-ajustes-drawer__form">
        <div className="asi-fecha-especial__bloques">
          <SeccionAjustes
            icon={CalendarOutlined}
            titulo="Fecha y motivo"
            className={calificacionesDrawerTarjetaClassName}
          >
            <p className="cal-ajustes-drawer__section-desc">
              Confirme el día de la sesión especial y describa el motivo con el que quedará
              registrada.
            </p>

            <Form.Item
              name="fecha"
              label="Fecha de la sesión"
              rules={[{ required: true, message: 'Elija la fecha de la sesión' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                placeholder="Seleccione un día"
                disabled={esEdicion}
              />
            </Form.Item>

            <Form.Item
              name="motivo"
              label="Motivo"
              rules={[{ required: true, message: 'Indique el motivo (taller, recuperación, …)' }]}
            >
              <Input maxLength={120} placeholder="Taller de recuperación" />
            </Form.Item>
          </SeccionAjustes>

          <SeccionAjustes
            icon={ClockCircleOutlined}
            titulo="Horario (opcional)"
            className={calificacionesDrawerTarjetaClassName}
          >
            <p className="cal-ajustes-drawer__section-desc">
              Si la sesión tiene un horario definido, indíquelo para que figure en la planilla. Puede
              dejarlo en blanco.
            </p>

            <Form.Item name="horaInicio" label="Hora inicio">
              <TimePicker
                style={{ width: '100%' }}
                format="HH:mm"
                minuteStep={5}
                placeholder="08:00"
              />
            </Form.Item>

            <Form.Item name="horaFin" label="Hora fin">
              <TimePicker
                style={{ width: '100%' }}
                format="HH:mm"
                minuteStep={5}
                placeholder="10:00"
              />
            </Form.Item>
          </SeccionAjustes>
        </div>
      </Form>
    </Drawer>
  );
};

export default FechaEspecialDrawer;
