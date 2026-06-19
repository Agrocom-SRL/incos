/**
 * Drawer de alta/edición de un BANCO autorizado (Config. de pagos · Finanzas).
 *
 * Drawer AntD6 (`open`) con el shell compartido de calificaciones. Campos: código
 * (req), nombre (req), método de pago (opcional, del catálogo ya cargado) y estado
 * activo (switch). En alta el switch arranca activo. Recibe handlers ya mapeados;
 * no hace fetch. El permiso (CREAR/EDITAR) lo decide la página al abrir el drawer.
 */

import { useEffect, useMemo } from 'react';
import { Drawer, Form, Input, Select, Switch } from 'antd';
import { CheckOutlined, IdcardOutlined, LinkOutlined } from '@ant-design/icons';
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

const BancoDrawer = ({ open, banco, metodos = [], saving, onGuardar, onCancelar }) => {
  const [form] = Form.useForm();
  const esEdicion = Boolean(banco?.id);

  const metodoOptions = useMemo(
    () => metodos.map((metodo) => ({ value: metodo.id, label: metodo.nombre })),
    [metodos],
  );

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      codigo: banco?.codigo ?? '',
      nombre: banco?.nombre ?? '',
      metodoPagoId: banco?.metodoPagoId ?? undefined,
      activo: banco?.activo ?? true,
    });
  }, [open, banco, form]);

  const handleCerrar = () => {
    if (!saving) onCancelar?.();
  };

  return (
    <Drawer
      title={esEdicion ? 'Editar banco' : 'Agregar banco'}
      width={520}
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
              {esEdicion ? 'Guardar cambios' : 'Agregar banco'}
            </Button>
          </div>
        </div>
      }
    >
      <Form form={form} layout="vertical" onFinish={onGuardar}>
        <div className="cal-eval-drawer__bloques">
          <SeccionAjustes
            icon={IdcardOutlined}
            titulo="Identificación del banco"
            className={calificacionesDrawerTarjetaClassName}
          >
            <Form.Item
              name="codigo"
              label="Código"
              rules={[{ required: true, message: 'Ingrese el código del banco' }]}
            >
              <Input size="large" placeholder="Código del banco" maxLength={50} />
            </Form.Item>

            <Form.Item
              name="nombre"
              label="Nombre"
              rules={[{ required: true, message: 'Ingrese el nombre del banco' }]}
            >
              <Input size="large" placeholder="Nombre del banco" maxLength={150} />
            </Form.Item>
          </SeccionAjustes>

          <SeccionAjustes
            icon={LinkOutlined}
            titulo="Asociación y estado"
            className={calificacionesDrawerTarjetaClassName}
          >
            <p className="cal-ajustes-drawer__section-desc">
              Asocie el banco a un método de pago (opcional) y defina si está disponible para
              recibir pagos.
            </p>

            <Form.Item name="metodoPagoId" label="Método de pago (opcional)">
              <Select
                size="large"
                allowClear
                placeholder="Asociar a un método de pago"
                options={metodoOptions}
              />
            </Form.Item>

            <Form.Item name="activo" label="Estado" valuePropName="checked">
              <Switch checkedChildren="Activo" unCheckedChildren="Inactivo" />
            </Form.Item>
          </SeccionAjustes>
        </div>
      </Form>
    </Drawer>
  );
};

export default BancoDrawer;
