/**
 * Organismo: formulario de compromiso de pago de un aporte (Finanzas).
 *
 * Recibe el compromiso vigente ya mapeado (o null) y precarga sus valores. Permite
 * registrar uno nuevo o actualizar el existente (UPSERT en backend) y eliminar el
 * vigente (Popconfirm). Solo presentación; no llama hooks de fetch.
 *
 * Campos: fecha del compromiso (requerida) y observación (opcional). El saldo se
 * deriva de las cuotas, por lo que el compromiso no captura monto. AntD6 — Form
 * rules, DatePicker, Popconfirm `open` interno.
 * Botones gateados por permiso `finanzas.pago.editar` (EDITAR / ELIMINAR).
 */

import { useEffect } from 'react';
import { Col, DatePicker, Form, Input, Popconfirm, Row } from 'antd';
import { DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { ActionButton, Button } from '@atoms';

const { TextArea } = Input;

const CompromisoForm = ({
  form,
  compromiso = null,
  onGuardar,
  onEliminar,
  guardando = false,
  eliminando = false,
}) => {
  const tieneVigente = Boolean(compromiso?.id);

  // Precarga los valores del compromiso vigente (o limpia si no hay).
  useEffect(() => {
    if (compromiso?.id) {
      form.setFieldsValue({
        fechaCompromiso: compromiso.fechaCompromiso ? dayjs(compromiso.fechaCompromiso) : null,
        observacion: compromiso.observacion ?? null,
      });
    } else {
      form.resetFields();
    }
  }, [compromiso, form]);

  /** Traduce los valores del formulario a claves de dominio para el hook de pantalla. */
  const handleFinish = (values) => {
    onGuardar?.({
      fechaCompromiso: values.fechaCompromiso
        ? dayjs(values.fechaCompromiso).format('YYYY-MM-DD')
        : null,
      observacion: (values.observacion || '').trim() || null,
    });
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish}>
      <Row gutter={[24, 0]}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="fechaCompromiso"
            label="Fecha del compromiso"
            rules={[{ required: true, message: 'Seleccione la fecha del compromiso de pago' }]}
          >
            <DatePicker size="large" format="DD/MM/YYYY" style={{ width: '100%' }} />
          </Form.Item>
        </Col>

        <Col xs={24}>
          <Form.Item name="observacion" label="Observación (opcional)">
            <TextArea
              rows={3}
              maxLength={500}
              showCount
              placeholder="Detalle del acuerdo o condición del compromiso de pago"
            />
          </Form.Item>
        </Col>
      </Row>

      <div className="cfg-academico-form-workspace__footer">
        <Row gutter={[12, 12]} justify="end">
          {tieneVigente ? (
            <Col>
              <Popconfirm
                title="Eliminar compromiso de pago"
                description="Se anulará el compromiso vigente del estudiante. ¿Continuar?"
                okText="Eliminar"
                okButtonProps={{ danger: true, loading: eliminando }}
                cancelText="Cancelar"
                onConfirm={onEliminar}
              >
                <ActionButton
                  permiso="finanzas.pago.editar"
                  accion="ELIMINAR"
                  variant="danger"
                  icon={<DeleteOutlined />}
                  loading={eliminando}
                >
                  Eliminar compromiso
                </ActionButton>
              </Popconfirm>
            </Col>
          ) : null}
          <Col>
            <ActionButton
              permiso="finanzas.pago.editar"
              accion="EDITAR"
              variant="primary"
              icon={<SaveOutlined />}
              htmlType="submit"
              loading={guardando}
            >
              {tieneVigente ? 'Actualizar compromiso' : 'Registrar compromiso'}
            </ActionButton>
          </Col>
        </Row>
      </div>
    </Form>
  );
};

export default CompromisoForm;
