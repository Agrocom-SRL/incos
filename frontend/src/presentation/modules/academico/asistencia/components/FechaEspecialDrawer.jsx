/**
 * Drawer para habilitar una fecha especial de clase (taller/recuperación) — organismo.
 *
 * Reusa el layout/estilo de los drawers de Calificaciones (cal-ajustes-drawer + SeccionAjustes)
 * para mantener una sola estética en Académico. La fecha llega precargada desde el día
 * clickeado en el calendario; el motivo es obligatorio y las horas son opcionales.
 * Al confirmar llama `onConfirmar({ fecha, motivo, horaInicio, horaFin })`.
 */

import { useEffect } from 'react';
import { Alert, Button, DatePicker, Drawer, Form, Input, TimePicker } from 'antd';
import { CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
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

const FechaEspecialDrawerFooter = ({ confirmando, onCerrar, onConfirmar }) => (
  <div className="cal-ajustes-drawer__footer">
    <span className="cal-ajustes-drawer__footer-count cal-ajustes-drawer__footer-count--empty" />
    <div className="cal-ajustes-drawer__footer-actions">
      <Button onClick={onCerrar} disabled={confirmando}>
        Cancelar
      </Button>
      <Button
        type="primary"
        className="cal-ajustes-drawer__btn-guardar"
        loading={confirmando}
        onClick={onConfirmar}
      >
        Habilitar fecha
      </Button>
    </div>
  </div>
);

const FechaEspecialDrawer = ({
  abierto,
  fechaInicial = null,
  confirmando = false,
  onCerrar,
  onConfirmar,
}) => {
  const [form] = Form.useForm();

  // Precarga la fecha del día clickeado cada vez que se abre el drawer.
  useEffect(() => {
    if (!abierto) return;
    form.resetFields();
    form.setFieldsValue({
      fecha: fechaInicial ? dayjs(fechaInicial) : null,
    });
  }, [abierto, fechaInicial, form]);

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

  const handleCerrar = () => {
    if (!confirmando) onCerrar();
  };

  return (
    <Drawer
      title="Habilitar fecha especial"
      size={520}
      open={abierto}
      onClose={handleCerrar}
      destroyOnHidden
      footer={
        <FechaEspecialDrawerFooter
          confirmando={confirmando}
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
        type="info"
        showIcon
        title="Sesión fuera del horario habitual"
        description="Habilitá un día que no figura en el horario del curso (taller, recuperación o reposición) para poder tomar lista en esa fecha."
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
              Confirmá el día de la sesión especial y describí el motivo con el que quedará
              registrada.
            </p>

            <Form.Item
              name="fecha"
              label="Fecha de la sesión"
              rules={[{ required: true, message: 'Elegí la fecha de la sesión' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                placeholder="Seleccioná un día"
              />
            </Form.Item>

            <Form.Item
              name="motivo"
              label="Motivo"
              rules={[{ required: true, message: 'Indicá el motivo (taller, recuperación, …)' }]}
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
              Si la sesión tiene un horario definido, indicalo para que figure en la planilla. Podés
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
