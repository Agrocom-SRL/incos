/**
 * Organismo (compartido del módulo CAP): campos del formulario de participante.
 *
 * Reutilizado por el modal de alta/edición (Participantes) y por el paso
 * "participante nuevo" de InscribirParticipantePage — mismos nombres de campo
 * que el validator del backend (`buildParticipanteFieldValidators`): ci,
 * expedicion, nombres, apellidoPaterno, apellidoMaterno, celular, email.
 *
 * Se monta DENTRO de un <Form layout="vertical"> del consumidor (no crea Form).
 */

import { Col, Form, Input, Row, Select } from 'antd';
import { allSpacing } from '@theme/tokens';

/** Expediciones de CI (departamentos de Bolivia, catálogo estable). */
const EXPEDICION_OPTIONS = ['LP', 'CB', 'SC', 'OR', 'PT', 'CH', 'TJ', 'BE', 'PD'].map((sigla) => ({
  value: sigla,
  label: sigla,
}));

/** Normaliza el valor del campo a mayúsculas (nombres y apellidos se guardan en mayúsculas). */
const aMayusculas = (valor) => (typeof valor === 'string' ? valor.toUpperCase() : valor);

const ParticipanteFormFields = ({ disabled = false }) => (
  <Row gutter={[allSpacing.marginLG, 0]}>
    <Col xs={24} sm={12}>
      <Form.Item
        name="ci"
        label="Cédula de identidad"
        rules={[
          { required: true, message: 'Ingrese el CI del participante' },
          { min: 4, max: 20, message: 'El CI debe tener entre 4 y 20 caracteres' },
        ]}
      >
        <Input disabled={disabled} placeholder="Ej. 8159625" maxLength={20} />
      </Form.Item>
    </Col>
    <Col xs={24} sm={12}>
      <Form.Item name="expedicion" label="Expedición">
        <Select
          disabled={disabled}
          options={EXPEDICION_OPTIONS}
          allowClear
          placeholder="Ej. LP"
        />
      </Form.Item>
    </Col>
    <Col xs={24}>
      <Form.Item
        name="nombres"
        normalize={aMayusculas}
        label="Nombres"
        rules={[
          { required: true, message: 'Ingrese los nombres del participante' },
          { min: 2, max: 150, message: 'Los nombres deben tener entre 2 y 150 caracteres' },
        ]}
      >
        <Input disabled={disabled} placeholder="Nombres" maxLength={150} />
      </Form.Item>
    </Col>
    <Col xs={24} sm={12}>
      <Form.Item
        name="apellidoPaterno"
        normalize={aMayusculas}
        label="Apellido paterno"
        rules={[{ max: 100, message: 'Máximo 100 caracteres' }]}
      >
        <Input disabled={disabled} placeholder="Apellido paterno" maxLength={100} />
      </Form.Item>
    </Col>
    <Col xs={24} sm={12}>
      <Form.Item
        name="apellidoMaterno"
        normalize={aMayusculas}
        label="Apellido materno"
        rules={[{ max: 100, message: 'Máximo 100 caracteres' }]}
      >
        <Input disabled={disabled} placeholder="Apellido materno" maxLength={100} />
      </Form.Item>
    </Col>
    <Col xs={24} sm={12}>
      <Form.Item
        name="celular"
        label="Celular"
        rules={[
          { required: true, message: 'Ingrese el celular de contacto' },
          { min: 7, max: 20, message: 'El celular debe tener entre 7 y 20 caracteres' },
        ]}
      >
        <Input disabled={disabled} placeholder="Ej. 71234567" maxLength={20} />
      </Form.Item>
    </Col>
    <Col xs={24} sm={12}>
      <Form.Item
        name="email"
        label="Correo electrónico"
        rules={[{ type: 'email', message: 'Ingrese un correo válido' }]}
      >
        <Input disabled={disabled} placeholder="correo@ejemplo.com" maxLength={150} />
      </Form.Item>
    </Col>
  </Row>
);

export default ParticipanteFormFields;
