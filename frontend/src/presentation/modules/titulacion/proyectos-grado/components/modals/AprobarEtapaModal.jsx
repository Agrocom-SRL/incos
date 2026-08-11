/**
 * Modal: continuar a la SIGUIENTE etapa del proyecto de grado (TIT · T11,
 * proyecto·APROBAR).
 *
 * Rediseño 2026-08-11 (pedido explícito del usuario): antes mostraba un
 * `Select` con los estados destino — pero desde cualquier estado vigente solo
 * hay UNA transición hacia adelante real (la máquina de estados es lineal);
 * la única otra opción, `CANCELADO`, no es "una etapa más" y confundía el
 * flujo ("no tiene sentido elegir si solo hay 2 y una es cancelar"). Ahora el
 * modal solo confirma ese único destino (sin selector) y CANCELADO se maneja
 * aparte, en `CancelarProyectoModal` — accesible en cualquier momento, no
 * anidado en este flujo de avance.
 *
 * Requisitos por etapa (`requisitosTransicionProyecto`): el backend solo
 * valida la máquina de estados, no que el proyecto esté realmente listo —
 * pedido explícito del usuario: "no solo presionar y cambiar el estado".
 * Automáticos (verificables con datos de la ficha, p. ej. tutor asignado o
 * avance al 100%) bloquean "Continuar" mientras no se cumplan; manuales
 * (pasos que el sistema no puede verificar, p. ej. una firma física) se
 * listan como checklist y exigen una confirmación explícita del usuario.
 */

import { useMemo, useState } from 'react';
import { Checkbox, Empty, Flex, Form, Input, Modal, Typography } from 'antd';
import { ArrowRightOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { allColors } from '@theme/tokens';
import {
  formatEstadoProyecto,
  formatExplicacionTransicionProyecto,
} from '@application-titulacion/utils/titulacionPills';
import { getRequisitosTransicion } from '@application-titulacion/proyectos-grado/utils/requisitosTransicionProyecto';

const { Paragraph, Text } = Typography;

const AprobarEtapaModal = ({
  open,
  onCancel,
  onSubmit,
  saving = false,
  transiciones = [],
  estadoActual = null,
  proyecto = null,
  bitacoraCount = 0,
}) => {
  const [form] = Form.useForm();

  /** Única transición hacia adelante (se excluye CANCELADO — flujo aparte). */
  const destino = useMemo(() => transiciones.find((t) => t !== 'CANCELADO') ?? null, [transiciones]);
  const sinDestino = !destino;

  const [confirmoManuales, setConfirmoManuales] = useState(false);
  // Se limpia cada vez que el modal se abre (patrón "ajustar estado durante
  // el render", no en un efecto — evita el cascading render de un setState
  // síncrono en useEffect).
  const [lastOpen, setLastOpen] = useState(open);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) {
      form.resetFields();
      setConfirmoManuales(false);
    }
  }

  const explicacion = formatExplicacionTransicionProyecto(destino);

  const requisitos = useMemo(
    () => getRequisitosTransicion(destino, { proyecto, bitacoraCount }),
    [destino, proyecto, bitacoraCount],
  );
  const requisitosPendientes = requisitos.automaticos.filter((r) => !r.cumplido);
  const hayRequisitosManuales = requisitos.manuales.length > 0;
  const bloqueadoPorRequisitos =
    requisitosPendientes.length > 0 || (hayRequisitosManuales && !confirmoManuales);

  const handleOk = async () => {
    if (sinDestino || bloqueadoPorRequisitos) return;
    const values = await form.validateFields();
    await onSubmit({
      estado: destino,
      observaciones: (values.observaciones || '').trim() || undefined,
    });
  };

  return (
    <Modal
      title="Continuar a la siguiente etapa"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText={destino ? `Continuar a «${formatEstadoProyecto(destino)}»` : 'Continuar'}
      cancelText="Volver"
      confirmLoading={saving}
      okButtonProps={{ disabled: sinDestino || bloqueadoPorRequisitos }}
      destroyOnHidden
    >
      {sinDestino ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={`El proyecto se encuentra en estado «${formatEstadoProyecto(estadoActual)}» y no admite más transiciones.`}
        />
      ) : (
        <Form form={form} layout="vertical">
          <Flex align="center" gap={12} style={{ marginBottom: 16 }}>
            <Text strong>{formatEstadoProyecto(estadoActual)}</Text>
            <ArrowRightOutlined style={{ color: allColors.colorTextTertiary }} />
            <Text strong style={{ color: allColors.colorPrimary, fontSize: 16 }}>
              {formatEstadoProyecto(destino)}
            </Text>
          </Flex>
          {explicacion ? (
            <Paragraph type="secondary" style={{ marginTop: -8 }}>
              {explicacion}
            </Paragraph>
          ) : null}
          {requisitos.automaticos.length > 0 ? (
            <Flex vertical gap={4} style={{ marginBottom: 16 }}>
              <Text strong style={{ fontSize: 13 }}>
                Requisitos para continuar
              </Text>
              {requisitos.automaticos.map((r) => (
                <Flex key={r.descripcion} align="center" gap={8}>
                  {r.cumplido ? (
                    <CheckCircleOutlined style={{ color: allColors.colorSuccess }} />
                  ) : (
                    <CloseCircleOutlined style={{ color: allColors.colorError }} />
                  )}
                  <Text type={r.cumplido ? 'secondary' : 'danger'}>{r.descripcion}</Text>
                </Flex>
              ))}
            </Flex>
          ) : null}
          {hayRequisitosManuales ? (
            <Flex vertical gap={4} style={{ marginBottom: 16 }}>
              <Text strong style={{ fontSize: 13 }}>
                Antes de continuar, verifique lo siguiente
              </Text>
              {requisitos.manuales.map((texto) => (
                <Text key={texto} type="secondary">
                  · {texto}
                </Text>
              ))}
              <Checkbox
                checked={confirmoManuales}
                onChange={(e) => setConfirmoManuales(e.target.checked)}
                style={{ marginTop: 4 }}
              >
                Confirmo que se cumplieron los pasos indicados
              </Checkbox>
            </Flex>
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

export default AprobarEtapaModal;
