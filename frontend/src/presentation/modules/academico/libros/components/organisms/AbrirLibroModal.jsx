/**
 * Organismo: modal "Abrir libro" (alta del libro de registro — P1 · LibrosListPage).
 *
 * Modal AntD6 (`open`) con un Form: gestión (select), número de libro
 * (obligatorio, SIN auto-sugerencia — un único libro por gestión, compartido
 * por las 3 carreras del instituto), código de registro (opcional, prellenado
 * con la sugerencia institucional 81981609), folio inicial (arranque
 * histórico del libro) y observaciones. `numeroFolio` NO se pide aquí: lo
 * asigna el backend por gestión al generar folios.
 */

import { useEffect } from 'react';
import { Col, DatePicker, Form, Input, InputNumber, Modal, Row, Select } from 'antd';
import dayjs from 'dayjs';
import { modalWidths } from '@theme/tokens/spacing';
import { CODIGO_REGISTRO_SUGERIDO } from '@application-academico/libros/utils/libroDoc';

const { TextArea } = Input;

const AbrirLibroModal = ({
  open,
  gestiones = [],
  loadingCatalogos = false,
  guardando = false,
  onGuardar,
  onCancelar,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      gestionId: undefined,
      numeroLibro: undefined,
      codigoRegistro: CODIGO_REGISTRO_SUGERIDO,
      folioInicial: 1,
      fechaApertura: dayjs(),
      observaciones: undefined,
    });
  }, [open, form]);

  const gestionOptions = gestiones.map((gestion) => ({
    value: gestion.id,
    label: gestion.nombre || (gestion.anio != null ? `Gestión ${gestion.anio}` : `Gestión ${gestion.id}`),
  }));

  const handleOk = () => form.submit();

  const handleFinish = (values) => {
    onGuardar?.({
      gestionId: values.gestionId,
      numeroLibro: values.numeroLibro,
      codigoRegistro: values.codigoRegistro?.trim() || undefined,
      folioInicial: values.folioInicial,
      fechaApertura: values.fechaApertura ? values.fechaApertura.format('YYYY-MM-DD') : undefined,
      observaciones: values.observaciones?.trim() || undefined,
    });
  };

  return (
    <Modal
      open={open}
      title="Abrir libro de registro"
      okText="Abrir libro"
      cancelText="Cancelar"
      onOk={handleOk}
      onCancel={onCancelar}
      confirmLoading={guardando}
      destroyOnHidden
      maskClosable={!guardando}
      width={modalWidths.modalWidth}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Row gutter={[24, 0]}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="gestionId"
              label="Gestión"
              rules={[{ required: true, message: 'Seleccione la gestión' }]}
            >
              <Select
                size="large"
                loading={loadingCatalogos}
                placeholder="Seleccione la gestión"
                options={gestionOptions}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="numeroLibro"
              label="Número de libro"
              tooltip="Número del libro físico de esta gestión, compartido por las 3 carreras del instituto."
              rules={[{ required: true, message: 'Ingrese el número de libro' }]}
            >
              <InputNumber size="large" min={1} style={{ width: '100%' }} placeholder="Ej. 14" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="codigoRegistro"
              label="Código de registro"
              tooltip="Sugerencia institucional; puede editarlo si corresponde."
            >
              <Input size="large" maxLength={20} placeholder={CODIGO_REGISTRO_SUGERIDO} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="folioInicial"
              label="Folio inicial"
              tooltip="Arranque histórico del libro (el número real de folio lo asigna el sistema por gestión)."
              rules={[{ required: true, message: 'Ingrese el folio inicial' }]}
            >
              <InputNumber size="large" min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="fechaApertura"
              label="Fecha de apertura"
              rules={[{ required: true, message: 'Seleccione la fecha de apertura' }]}
            >
              <DatePicker size="large" format="DD/MM/YYYY" style={{ width: '100%' }} />
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item name="observaciones" label="Observaciones (opcional)">
              <TextArea rows={2} maxLength={2000} showCount placeholder="Detalle adicional del libro" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AbrirLibroModal;
