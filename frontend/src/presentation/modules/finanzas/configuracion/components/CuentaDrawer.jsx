/**
 * Drawer de alta/edición de una CUENTA de pago (Config. de pagos · Finanzas).
 *
 * Drawer AntD6 (`open`) con el shell compartido de calificaciones. Campos: titular
 * (req), método de pago, banco, N.° de cuenta, N.° de celular, estado activo
 * (switch) y subida de imagen QR (Upload AntD6, `beforeUpload` → false para retener
 * el File en cliente). El File se extrae aquí y se entrega como `qr` al handler, que
 * delega el multipart al repositorio. Recibe catálogos ya cargados; no hace fetch.
 */

import { useEffect, useMemo } from 'react';
import { Drawer, Form, Input, Select, Switch, Typography, Upload } from 'antd';
import {
  CheckCircleOutlined,
  CheckOutlined,
  QrcodeOutlined,
  SolutionOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { Button } from '@atoms';
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
import '../styles/config-pagos.css';

const { Text } = Typography;

const QR_ACCEPT = '.jpg,.jpeg,.png';

/** Normaliza el evento de Upload a un fileList (espejo de `normFileFromUpload`). */
const normFile = (e) => {
  if (Array.isArray(e)) return e;
  return e?.fileList ?? [];
};

const CuentaDrawer = ({
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

  const handleFinish = (values) => {
    // Extrae el File del fileList (si hay) y lo entrega como `qr` al handler.
    let qr;
    if (Array.isArray(values.qr) && values.qr.length > 0) {
      const file = values.qr[0];
      qr = file?.originFileObj || file;
    }
    onGuardar?.({ ...values, qr });
  };

  const handleCerrar = () => {
    if (!saving) onCancelar?.();
  };

  return (
    <Drawer
      title={esEdicion ? 'Editar cuenta de pago' : 'Agregar cuenta de pago'}
      width={560}
      open={open}
      onClose={handleCerrar}
      destroyOnHidden
      rootClassName={calificacionesDrawerRootClassName}
      className={calificacionesDrawerSectionClassName}
      classNames={calificacionesDrawerClassNames}
      zIndex={CALIFICACIONES_DRAWER_Z_INDEX}
      styles={calificacionesDrawerStyles()}
      footer={
        <div className="cal-eval-drawer__footer">
          <Button onClick={handleCerrar} disabled={saving}>
            Cancelar
          </Button>
          <div className="cal-eval-drawer__footer-actions">
            <Button
              type="primary"
              className="cal-eval-drawer__btn-primary"
              icon={<CheckOutlined />}
              loading={saving}
              onClick={() => form.submit()}
            >
              {esEdicion ? 'Guardar cambios' : 'Agregar cuenta'}
            </Button>
          </div>
        </div>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <div className="cal-eval-drawer__bloques">
          <SeccionAjustes
            icon={SolutionOutlined}
            titulo="Datos de la cuenta"
            className={calificacionesDrawerTarjetaClassName}
          >
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
              <Select size="large" allowClear placeholder="Banco de la cuenta" options={bancoOptions} />
            </Form.Item>

            <Form.Item name="numeroCuenta" label="N.° de cuenta (opcional)">
              <Input size="large" placeholder="Número de cuenta" maxLength={50} />
            </Form.Item>

            <Form.Item name="numeroCelular" label="N.° de celular (opcional)">
              <Input size="large" placeholder="Número de celular" maxLength={20} />
            </Form.Item>

            <Form.Item name="activo" label="Estado" valuePropName="checked">
              <Switch checkedChildren="Activo" unCheckedChildren="Inactivo" />
            </Form.Item>
          </SeccionAjustes>

          <SeccionAjustes
            icon={QrcodeOutlined}
            titulo="Imagen QR de cobro"
            className={calificacionesDrawerTarjetaClassName}
          >
            <p className="cal-ajustes-drawer__section-desc">
              Subí el QR con el que los estudiantes realizarán el pago. JPG o PNG; reemplaza el QR
              actual si la cuenta ya tiene uno.
            </p>

            <Form.Item
              name="qr"
              label="Imagen QR (opcional)"
              valuePropName="fileList"
              getValueFromEvent={normFile}
            >
              <Upload accept={QR_ACCEPT} maxCount={1} beforeUpload={() => false} listType="picture">
                <Button icon={<UploadOutlined />}>Seleccionar QR</Button>
              </Upload>
            </Form.Item>

            {esEdicion && cuenta?.qrImagenUrl ? (
              <Text type="secondary" className="cfg-pagos-drawer__qr-hint">
                <CheckCircleOutlined aria-hidden /> Esta cuenta ya tiene un QR cargado.
              </Text>
            ) : null}
          </SeccionAjustes>
        </div>
      </Form>
    </Drawer>
  );
};

export default CuentaDrawer;
