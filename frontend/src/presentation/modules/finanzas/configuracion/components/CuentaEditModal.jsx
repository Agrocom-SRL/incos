/**
 * Organismo: modal de alta/edición de una CUENTA de pago
 * (Config. de pagos · Finanzas).
 *
 * Modal AntD6 (`open`) con form precargado en edición. Campos: titular (req),
 * método de pago, banco, N.° de cuenta, N.° de celular, activo (switch) y subida
 * de imagen QR (Upload AntD6, `beforeUpload` → false para retener el File en
 * cliente). El File se extrae aquí y se entrega como `qr` al handler, que delega
 * el multipart al repositorio. Recibe catálogos ya cargados; no hace fetch.
 */

import { useEffect, useMemo } from 'react';
import { Form, Input, Modal, Select, Switch, Typography, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { Button } from '@atoms';
import { modalWidths } from '@theme/tokens/spacing';

const { Text } = Typography;

const QR_ACCEPT = '.jpg,.jpeg,.png';

/** Normaliza el evento de Upload a un fileList (espejo de `normFileFromUpload`). */
const normFile = (e) => {
  if (Array.isArray(e)) return e;
  return e?.fileList ?? [];
};

const CuentaEditModal = ({
  open,
  cuenta,
  metodos = [],
  bancos = [],
  saving,
  onGuardar,
  onCancelar,
}) => {
  const [form] = Form.useForm();
  const esEdicion = Boolean(cuenta?.id);

  const metodoOptions = useMemo(
    () => metodos.map((metodo) => ({ value: metodo.id, label: metodo.nombre })),
    [metodos],
  );
  const bancoOptions = useMemo(
    () => bancos.map((banco) => ({ value: banco.id, label: banco.nombre })),
    [bancos],
  );

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      nombreTitular: cuenta?.nombreTitular ?? '',
      metodoPagoId: cuenta?.metodoPagoId ?? undefined,
      bancoId: cuenta?.bancoId ?? undefined,
      numeroCuenta: cuenta?.numeroCuenta ?? '',
      numeroCelular: cuenta?.numeroCelular ?? '',
      activo: cuenta?.activo ?? true,
      qr: [],
    });
  }, [open, cuenta, form]);

  const handleOk = () => form.submit();

  const handleFinish = (values) => {
    // Extrae el File del fileList (si hay) y lo entrega como `qr` al handler.
    let qr;
    if (Array.isArray(values.qr) && values.qr.length > 0) {
      const file = values.qr[0];
      qr = file?.originFileObj || file;
    }
    onGuardar?.({ ...values, qr });
  };

  return (
    <Modal
      open={open}
      title={esEdicion ? 'Editar cuenta de pago' : 'Agregar cuenta de pago'}
      okText="Guardar"
      cancelText="Cancelar"
      onOk={handleOk}
      onCancel={onCancelar}
      confirmLoading={saving}
      destroyOnHidden
      maskClosable={!saving}
      width={modalWidths.modalWidthLG}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="nombreTitular"
          label="Nombre del titular"
          rules={[{ required: true, message: 'Ingrese el nombre del titular' }]}
        >
          <Input size="large" placeholder="Titular de la cuenta" maxLength={150} />
        </Form.Item>

        <Form.Item name="metodoPagoId" label="Método de pago (opcional)">
          <Select
            size="large"
            allowClear
            placeholder="Asociar a un método de pago"
            options={metodoOptions}
          />
        </Form.Item>

        <Form.Item name="bancoId" label="Banco (opcional)">
          <Select
            size="large"
            allowClear
            placeholder="Banco de la cuenta"
            options={bancoOptions}
          />
        </Form.Item>

        <Form.Item name="numeroCuenta" label="N.° de cuenta (opcional)">
          <Input size="large" placeholder="Número de cuenta" maxLength={50} />
        </Form.Item>

        <Form.Item name="numeroCelular" label="N.° de celular (opcional)">
          <Input size="large" placeholder="Número de celular" maxLength={20} />
        </Form.Item>

        <Form.Item
          name="qr"
          label="Imagen QR (opcional)"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          tooltip="JPG o PNG. Reemplaza el QR actual si la cuenta ya tiene uno."
        >
          <Upload accept={QR_ACCEPT} maxCount={1} beforeUpload={() => false} listType="picture">
            <Button icon={<UploadOutlined />}>Seleccionar QR</Button>
          </Upload>
        </Form.Item>

        {esEdicion && cuenta?.qrImagenUrl ? (
          <Text type="secondary">Esta cuenta ya tiene un QR cargado.</Text>
        ) : null}

        <Form.Item name="activo" label="Activo" valuePropName="checked">
          <Switch checkedChildren="Activo" unCheckedChildren="Inactivo" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CuentaEditModal;
