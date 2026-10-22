/**
 * Organismo: campos del formulario de horario de capacitación (CAP): día (o varios, con `multipleDias`), hora
 * de inicio y hora de fin con reloj analógico en popup (AM/PM; el código interno lo genera el backend, no se pide nombre). Se monta DENTRO de un
 * `<Form layout="vertical">` (`beforeFields` de `CfgFormWorkspace`, mismo
 * patrón que `ParticipanteFormFields`). La regla «fin posterior a inicio» usa
 * la misma validación pura que el resto del módulo (`validarHorarioNuevo`).
 */

import { lazy, Suspense } from 'react';
import { Col, Form, Input, Row, Select } from 'antd';
import { DIA_HORARIO_OPTIONS, validarHorarioNuevo } from '@application-capacitacion/utils/horarioCapacitacion';

// El reloj analógico (MUI X) se carga bajo demanda: solo pesa al abrir el formulario de horario.
const TimeClockField = lazy(() => import('@molecules/TimeClockField/TimeClockField'));

/** Control de hora para `Form.Item`: reloj con AM/PM en popup; mientras carga, un campo inerte. */
const HoraReloj = (props) => (
  <Suspense fallback={<Input disabled placeholder="Cargando reloj…" />}>
    <TimeClockField {...props} />
  </Suspense>
);

const horaFinRule = ({ getFieldValue }) => ({
  validator: (_, horaFin) => {
    const mensaje = validarHorarioNuevo({
      dia: [].concat(getFieldValue('dia') ?? 'x')[0] ?? 'x',
      horaInicio: getFieldValue('horaInicio'),
      horaFin,
    });
    return mensaje ? Promise.reject(new Error(mensaje)) : Promise.resolve();
  },
});

const HorarioFormFields = ({ disabled = false, multipleDias = false }) => (
  <Row gutter={[24, 0]}>
    <Col xs={24} sm={12}>
      <Form.Item
        name="dia"
        label={multipleDias ? 'Días' : 'Día'}
        rules={[{ required: true, message: multipleDias ? 'Seleccione al menos un día' : 'Seleccione el día' }]}
      >
        <Select
          mode={multipleDias ? 'multiple' : undefined}
          options={DIA_HORARIO_OPTIONS}
          placeholder={multipleDias ? 'Seleccione uno o más días' : 'Seleccione el día'}
          disabled={disabled}
        />
      </Form.Item>
    </Col>
    <Col xs={24} sm={12}>
      <Form.Item
        name="horaInicio"
        label="Hora de inicio"
        rules={[{ required: true, message: 'Indique la hora de inicio' }]}
      >
        <HoraReloj disabled={disabled} />
      </Form.Item>
    </Col>
    <Col xs={24} sm={12}>
      <Form.Item
        name="horaFin"
        label="Hora de fin"
        dependencies={['horaInicio']}
        rules={[{ required: true, message: 'Indique la hora de fin' }, horaFinRule]}
      >
        <HoraReloj disabled={disabled} />
      </Form.Item>
    </Col>
  </Row>
);

export default HorarioFormFields;
