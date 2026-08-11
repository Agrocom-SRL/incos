/**
 * Drawer: informe de un trámite de pasantía (TIT · P12/P13).
 *
 * Dos modos según props (mismo formulario, payloads del contrato):
 *  - Emisión (sin `informe`): el TIPO lo fija el camino del trámite
 *    (VERIFICACION_EMPRESA para PASANTIA, CONVALIDACION_TRABAJO para
 *    CONVALIDACION — regla del backend) y el PDF institucional se genera al
 *    guardar.
 *  - Edición (`informe`): mismos campos; el backend regenera el PDF.
 *
 * Solo se pide lo que NO puede resolverse solo (2026-08-09, revisión contra
 * el formato real): la fecha de emisión la fija el backend (hoy, `hoyISO()`),
 * el destinatario (A: Rector / VIA: Dirección Académica) es un cargo
 * institucional fijo y el área relacionada ya se capturó en el trámite
 * (`pasantia.areaDepartamento`) — ninguno de los tres se pregunta aquí.
 * Evaluación cualitativa/contenido solo aplican a CONVALIDACION_TRABAJO: en
 * VERIFICACION_EMPRESA las conclusiones son texto fijo del formato.
 */

import { useEffect } from 'react';
import dayjs from 'dayjs';
import { Alert, Button, DatePicker, Drawer, Flex, Form, Input, Select, Typography } from 'antd';
import {
  ApartmentOutlined,
  CalendarOutlined,
  SaveOutlined,
  SolutionOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import {
  RESULTADO_INFORME_OPTIONS,
  TIPO_INFORME_POR_TIPO_PASANTIA,
  formatTipoInforme,
} from '@application-titulacion/utils/pasantiasPills';

const { Text } = Typography;

/** Prefijo fijo del memo institucional — el input solo pide el correlativo/año. */
const MEMO_PREFIJO = 'MEMO/INCOS/DA/N°';

const InformePasantiaDrawer = ({
  open,
  onClose,
  onSubmit,
  saving = false,
  informe = null,
  tipoPasantia = 'PASANTIA',
  estudianteNombre = null,
  areaDepartamento = null,
}) => {
  const [form] = Form.useForm();

  const esEdicion = informe != null;
  /** Tipo de informe coherente con el camino (el backend valida igual). */
  const tipoInforme = esEdicion
    ? informe.tipo
    : (TIPO_INFORME_POR_TIPO_PASANTIA[tipoPasantia] ?? 'VERIFICACION_EMPRESA');
  const esVerificacion = tipoInforme === 'VERIFICACION_EMPRESA';

  const title = esEdicion ? 'Editar informe' : 'Emitir informe';

  /** Datos que el trámite ya resuelve — se muestran, no se piden de nuevo. */
  const infoLines = [
    { icon: <SolutionOutlined />, label: `Tipo: ${formatTipoInforme(tipoInforme)}` },
    esVerificacion && areaDepartamento
      ? { icon: <ApartmentOutlined />, label: `Área relacionada: ${areaDepartamento}` }
      : null,
    { icon: <TeamOutlined />, label: 'Dirigido a: Rector, vía Dirección Académica (fijo)' },
    { icon: <CalendarOutlined />, label: 'Fecha de emisión: la coloca el sistema (hoy)' },
  ].filter(Boolean);

  // Precarga por modo cada vez que se abre el drawer. Fecha de verificación
  // carga un valor por defecto (hoy); número de memo queda vacío — el
  // placeholder ya sugiere el formato, no hace falta un valor de partida.
  useEffect(() => {
    if (!open) return;
    const numeroMemoActual = informe?.numeroMemo
      ? informe.numeroMemo.startsWith(MEMO_PREFIJO)
        ? informe.numeroMemo.slice(MEMO_PREFIJO.length)
        : informe.numeroMemo
      : '';
    form.setFieldsValue({
      numeroMemo: numeroMemoActual,
      fechaVerificacion: informe?.fechaVerificacion
        ? dayjs(informe.fechaVerificacion)
        : (esVerificacion ? dayjs() : null),
      evaluacionCualitativa: informe?.evaluacionCualitativa ?? '',
      resultado: informe?.resultado ?? undefined,
      contenido: informe?.contenido ?? '',
    });
  }, [open, informe, form, esVerificacion]);

  const handleGuardar = async () => {
    const values = await form.validateFields();
    const numeroMemoIngresado = (values.numeroMemo || '').trim();
    await onSubmit({
      tipo: tipoInforme,
      numeroMemo: numeroMemoIngresado ? `${MEMO_PREFIJO}${numeroMemoIngresado}` : null,
      fechaVerificacion: values.fechaVerificacion
        ? values.fechaVerificacion.format('YYYY-MM-DD')
        : null,
      evaluacionCualitativa: (values.evaluacionCualitativa || '').trim() || null,
      resultado: values.resultado ?? null,
      contenido: (values.contenido || '').trim() || null,
    });
  };

  return (
    <Drawer
      title={title}
      open={open}
      onClose={onClose}
      size={480}
      destroyOnHidden
      footer={
        <Flex justify="flex-end" gap="small">
          <Button onClick={onClose}>Volver</Button>
          <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleGuardar}>
            {esEdicion ? 'Guardar informe' : 'Emitir informe'}
          </Button>
        </Flex>
      }
    >
      <Alert
        type="info"
        showIcon
        title={
          <Text strong>{estudianteNombre || 'Datos que ya trae el trámite'}</Text>
        }
        description={
          <Flex vertical gap={6} style={{ marginTop: 4 }}>
            {infoLines.map((line, i) => (
              <Flex key={i} align="center" gap={8}>
                <span
                  style={{
                    display: 'inline-flex',
                    fontSize: 15,
                    color: 'var(--primary, var(--ant-color-primary, #22854f))',
                  }}
                  aria-hidden
                >
                  {line.icon}
                </span>
                <Text style={{ fontSize: 14 }}>{line.label}</Text>
              </Flex>
            ))}
          </Flex>
        }
        style={{ marginBottom: 16 }}
      />

      <Form form={form} layout="vertical" disabled={saving}>
        <Form.Item
          name="numeroMemo"
          label={`Número de memo (${MEMO_PREFIJO})`}
          rules={[{ required: true, message: 'Registre el número de memo' }]}
        >
          <Input maxLength={30} placeholder={`…/${dayjs().year()}`} />
        </Form.Item>

        {esVerificacion ? (
          <Form.Item
            name="fechaVerificacion"
            label="Fecha de verificación"
            rules={[{ required: true, message: 'Registre la fecha en que se verificó la empresa' }]}
          >
            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
          </Form.Item>
        ) : null}

        <Form.Item
          name="resultado"
          label="Resultado"
          rules={[{ required: true, message: 'Seleccione el resultado' }]}
        >
          <Select
            options={RESULTADO_INFORME_OPTIONS}
            allowClear
            placeholder="Seleccione el resultado"
          />
        </Form.Item>

        {!esVerificacion ? (
          <>
            <Form.Item name="evaluacionCualitativa" label="Evaluación cualitativa (opcional)">
              <Input.TextArea
                rows={3}
                maxLength={5000}
                placeholder="Valoración cualitativa de la convalidación"
              />
            </Form.Item>

            <Form.Item name="contenido" label="Contenido del informe (opcional)">
              <Input.TextArea rows={4} maxLength={10000} placeholder="Cuerpo del informe" />
            </Form.Item>
          </>
        ) : null}
      </Form>
    </Drawer>
  );
};

export default InformePasantiaDrawer;
