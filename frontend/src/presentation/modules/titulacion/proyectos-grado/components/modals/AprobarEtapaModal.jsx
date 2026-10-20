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
 *
 * Informe de suficiencia (extensión 2026-08-17): cuando el destino es
 * `SUFICIENCIA`, el modal reemplaza el textarea genérico de observaciones
 * por la réplica digital del formulario físico "Informe de Suficiencia de
 * Modalidad de Graduación" — 3 criterios del tutor (texto libre) + el
 * veredicto. El backend exige estos 4 campos y, al completarse, emite y
 * guarda el PDF (tipo INFORME_SUFICIENCIA en la tab "Dictámenes").
 *
 * Nota de predefensa (extensión 2026-08-19): cuando el destino es
 * `APROBADO_PREDEFENSA`, el modal reemplaza el textarea genérico por un
 * campo numérico obligatorio — es el dato que habilita después el botón
 * "Declarar exento de defensa" (`proyecto.notaPredefensa > 90`, ver
 * `useProyectoGradoDetailPage`). El backend ya acepta `body.nota` en esta
 * transición (`AprobarEtapaProyectoUseCase`, `NOTA_POR_ESTADO`) y la persiste
 * como `notaPredefensa`; solo faltaba el campo en este formulario.
 */

import { useMemo, useState } from 'react';
import { Checkbox, Empty, Flex, Form, Input, InputNumber, Modal, Radio, Typography } from 'antd';
import { ArrowRightOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { allColors } from '@theme/tokens';
import {
  formatEstadoProyecto,
  formatExplicacionTransicionProyecto,
} from '@application-titulacion/utils/titulacionPills';
import { getRequisitosTransicion } from '@application-titulacion/proyectos-grado/utils/requisitosTransicionProyecto';

const { Paragraph, Text } = Typography;

/** Estado destino que activa el formulario del informe de suficiencia (T11). */
const DESTINO_SUFICIENCIA = 'SUFICIENCIA';
/** Estado destino que activa el campo de nota de predefensa (T11). */
const DESTINO_APROBADO_PREDEFENSA = 'APROBADO_PREDEFENSA';

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
  const esInformeSuficiencia = destino === DESTINO_SUFICIENCIA;
  const esAprobacionPredefensa = destino === DESTINO_APROBADO_PREDEFENSA;

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
      ...(esInformeSuficiencia
        ? {
            aspectosFormato: (values.aspectosFormato || '').trim(),
            contenidoProyecto: (values.contenidoProyecto || '').trim(),
            procesoTutoria: (values.procesoTutoria || '').trim(),
            resultadoSuficiencia: values.resultadoSuficiencia,
          }
        : {}),
      ...(esAprobacionPredefensa ? { nota: Number(values.notaPredefensa) } : {}),
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
          {esInformeSuficiencia ? (
            <>
              <Form.Item
                name="aspectosFormato"
                label="Aspectos de formato"
                rules={[{ required: true, message: 'Indique los aspectos de formato del proyecto' }]}
              >
                <Input.TextArea
                  rows={2}
                  maxLength={2000}
                  placeholder="Formato, redacción, normas de presentación del documento"
                />
              </Form.Item>
              <Form.Item
                name="contenidoProyecto"
                label="Contenido del proyecto"
                rules={[{ required: true, message: 'Indique el contenido del proyecto' }]}
              >
                <Input.TextArea
                  rows={2}
                  maxLength={2000}
                  placeholder="Pertinencia, desarrollo y consistencia del contenido"
                />
              </Form.Item>
              <Form.Item
                name="procesoTutoria"
                label="Proceso de tutoría"
                rules={[{ required: true, message: 'Indique el proceso de tutoría' }]}
              >
                <Input.TextArea
                  rows={2}
                  maxLength={2000}
                  placeholder="Cumplimiento y desempeño del estudiante durante la tutoría"
                />
              </Form.Item>
              <Form.Item
                name="resultadoSuficiencia"
                label="¿El estudiante está en condiciones de pasar a la Defensa de Proyecto de Grado?"
                rules={[{ required: true, message: 'Seleccione el veredicto del informe de suficiencia' }]}
              >
                <Radio.Group
                  optionType="button"
                  buttonStyle="solid"
                  options={[
                    { label: 'Apto para la Defensa', value: 'APROBADO' },
                    { label: 'No apto para la Defensa', value: 'NO_APROBADO' },
                  ]}
                />
              </Form.Item>
            </>
          ) : esAprobacionPredefensa ? (
            <Form.Item
              name="notaPredefensa"
              label="Nota de predefensa"
              rules={[
                { required: true, message: 'Indique la nota que el tribunal asignó en la predefensa' },
              ]}
            >
              <InputNumber
                min={0}
                max={100}
                style={{ width: '100%' }}
                placeholder="Nota sobre 100"
              />
            </Form.Item>
          ) : (
            <Form.Item name="observaciones" label="Observaciones (opcional)">
              <Input.TextArea
                rows={3}
                maxLength={2000}
                placeholder="Registre observaciones de la transición si corresponde"
              />
            </Form.Item>
          )}
        </Form>
      )}
    </Modal>
  );
};

export default AprobarEtapaModal;
