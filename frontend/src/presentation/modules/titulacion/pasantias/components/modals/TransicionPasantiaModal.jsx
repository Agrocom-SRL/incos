/**
 * Modal: transición de estado del trámite de pasantía (TIT · P6,
 * pasantia·APROBAR).
 *
 * El select solo ofrece los estados destino válidos desde el estado actual
 * SEGÚN EL CAMINO (TRANSICIONES_PASANTIA — el backend valida igual): una
 * CONVALIDACION nunca pasa a EN_CURSO/FINALIZADA y una PASANTIA nunca a
 * CONVALIDADA. Bajo el select se explica QUÉ pasa al confirmar cada opción
 * (mismo pedido del usuario que `AprobarEtapaModal`, TIT · Titulación); para
 * `FINALIZADA` además se muestra en vivo si las horas cumplidas alcanzan
 * las requeridas (el backend rechaza la transición si no — P6). Los
 * destinos `RECHAZADA`/`CANCELADA` son irreversibles y exigen confirmación
 * adicional (regla A5).
 *
 * Reincorporado 2026-08-11 (estaba retirado desde 2026-08-09 en espera de
 * definir el mecanismo): la transición SOLICITADA → EN_CURSO/CONVALIDADA
 * ahora exige un informe VIABLE previo (R.M. 487/2023) — `transiciones` ya
 * llega filtrada sin ese destino cuando falta el informe, y `avisoInforme`
 * explica el porqué con un `Alert` (mismo gate en `TransicionarPasantiaUseCase`,
 * backend, defensa en profundidad).
 */

import { useEffect, useMemo } from 'react';
import { Alert, App, Empty, Form, Input, Modal, Select, Typography } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import {
  formatEstadoPasantia,
  formatExplicacionTransicionPasantia,
  ESTADOS_TRANSICION_PASANTIA_IRREVERSIBLES,
} from '@application-titulacion/utils/pasantiasPills';

const { Paragraph, Text } = Typography;

const TransicionPasantiaModal = ({
  open,
  onCancel,
  onSubmit,
  saving = false,
  transiciones = [],
  estadoActual = null,
  horasCumplidas = null,
  horasRequeridas = null,
  avisoInforme = null,
}) => {
  const { modal } = App.useApp();
  const [form] = Form.useForm();
  const estadoSeleccionado = Form.useWatch('estado', form);

  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);

  const opciones = useMemo(
    () => transiciones.map((estado) => ({ value: estado, label: formatEstadoPasantia(estado) })),
    [transiciones],
  );

  const sinTransiciones = opciones.length === 0;
  const explicacion = formatExplicacionTransicionPasantia(estadoSeleccionado);
  const esIrreversible = ESTADOS_TRANSICION_PASANTIA_IRREVERSIBLES.includes(estadoSeleccionado);

  const horasInsuficientes =
    estadoSeleccionado === 'FINALIZADA' &&
    horasCumplidas != null &&
    horasRequeridas != null &&
    Number(horasCumplidas) < Number(horasRequeridas);

  const registrar = async (values) => {
    await onSubmit({
      estado: values.estado,
      observaciones: (values.observaciones || '').trim() || undefined,
    });
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    if (ESTADOS_TRANSICION_PASANTIA_IRREVERSIBLES.includes(values.estado)) {
      modal.confirm({
        title: `¿Confirma ${values.estado === 'RECHAZADA' ? 'rechazar' : 'cancelar'} el trámite?`,
        icon: <ExclamationCircleOutlined />,
        content: formatExplicacionTransicionPasantia(values.estado),
        okText: `Sí, ${values.estado === 'RECHAZADA' ? 'rechazar' : 'cancelar'}`,
        okButtonProps: { danger: true },
        cancelText: 'Volver',
        onOk: () => registrar(values),
      });
      return;
    }
    await registrar(values);
  };

  return (
    <Modal
      title="Transición de estado del trámite"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Registrar transición"
      cancelText="Volver"
      confirmLoading={saving}
      okButtonProps={{ disabled: sinTransiciones || horasInsuficientes, danger: esIrreversible }}
      destroyOnHidden
    >
      {avisoInforme ? (
        <Alert type="warning" showIcon title={avisoInforme} style={{ marginBottom: 16 }} />
      ) : null}
      {sinTransiciones ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={`El trámite se encuentra en estado «${formatEstadoPasantia(estadoActual)}» y no admite más transiciones.`}
        />
      ) : (
        <Form form={form} layout="vertical">
          <Form.Item label="Estado actual">
            <Input value={formatEstadoPasantia(estadoActual)} disabled />
          </Form.Item>
          <Form.Item
            name="estado"
            label="Nuevo estado"
            rules={[{ required: true, message: 'Seleccione el estado destino' }]}
          >
            <Select options={opciones} placeholder="Seleccione el estado destino" />
          </Form.Item>
          {explicacion ? (
            <Paragraph
              type={esIrreversible || horasInsuficientes ? 'danger' : 'secondary'}
              style={{ marginTop: -8 }}
            >
              {explicacion}
              {estadoSeleccionado === 'FINALIZADA' && horasRequeridas != null ? (
                <>
                  {' '}
                  <Text strong>
                    Horas cumplidas: {horasCumplidas ?? 0} de {horasRequeridas} requeridas.
                  </Text>
                  {horasInsuficientes ? ' Aún no alcanza el mínimo para finalizar.' : ''}
                </>
              ) : null}
            </Paragraph>
          ) : null}
          <Form.Item name="observaciones" label="Observaciones (opcional)">
            <Input.TextArea
              rows={3}
              maxLength={2000}
              placeholder="Registre observaciones de la transición si corresponde"
            />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default TransicionPasantiaModal;
