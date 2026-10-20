/**
 * Organismo: modal "Notas pendientes al cierre" (P2 · LibroDetailPage).
 *
 * Se alimenta DIRECTO del 409 CONFLICT que devuelve `PATCH /libros/:id`
 * (`estado: CERRADO`) cuando hay estudiantes con materias sin nota final
 * (`mapCierrePendientes`): resumen, lista compacta por paralelo con los folios
 * afectados y el rango de apellidos inicial–final de cada página
 * ("Folio 12 · AÑEZ – CASTRO"), explicación previa de lo que pasará y motivo
 * obligatorio. A propósito NO lista estudiantes, materias ni docentes (pedido
 * del usuario, 2026-08-21): el folio + rango de apellidos basta para ubicar la
 * página en el libro físico. "Cerrar de todos modos" (danger) pide una
 * confirmación final (`modal.confirm`, mismo patrón que las transiciones
 * irreversibles de Titulación) y reintenta el cierre con
 * `{ forzarCierre: true, motivo }`. Registro formal ("usted").
 */

import { useEffect } from 'react';
import { App, Form, Input, Modal, Typography } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { CarreraDotCell } from '@atoms';
import { modalWidths } from '@theme/tokens/spacing';
import { sanitizeDocenteColorHex } from '@docentes/components/atoms/DocenteColorBar';
import '../../styles/libros.css';

const { Paragraph, Text } = Typography;
const { TextArea } = Input;

/** Espejo de `MOTIVO_CIERRE_FORZADO_MIN_LENGTH` (backend, libros.constants.js). */
const MOTIVO_MIN_LENGTH = 10;

const plural = (n, singular, pluralForm) => (Number(n) === 1 ? singular : pluralForm);

const CerrarLibroPendientesModal = ({
  open,
  pendientes = null,
  cerrando = false,
  onConfirmar,
  onCancelar,
}) => {
  const { modal } = App.useApp();
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) form.resetFields();
  }, [open, form]);

  const total = pendientes?.total ?? 0;
  const totalParalelos = pendientes?.totalParalelos ?? 0;
  const desactualizadas = pendientes?.desactualizadas ?? 0;
  const paralelos = pendientes?.paralelos ?? [];

  const confirmar = (values) => {
    const motivo = String(values.motivo ?? '').trim();
    modal.confirm({
      title: '¿Confirma el cierre del libro con notas pendientes?',
      icon: <ExclamationCircleOutlined />,
      content:
        `${total} ${plural(total, 'estudiante quedará asentado', 'estudiantes quedarán asentados')} ` +
        'como ABANDONO, con NP en las materias sin nota, y el libro pasará a CERRADO. ' +
        'Solo podrá revertirlo reabriendo el libro y regenerando los folios.',
      okText: 'Sí, cerrar el libro',
      okButtonProps: { danger: true },
      cancelText: 'Volver',
      onOk: () => onConfirmar?.(motivo),
    });
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    confirmar(values);
  };

  return (
    <Modal
      open={open}
      title="Notas pendientes al cierre del libro"
      okText="Cerrar de todos modos"
      okButtonProps={{ danger: true }}
      cancelText="Cancelar"
      onOk={handleOk}
      onCancel={onCancelar}
      confirmLoading={cerrando}
      destroyOnHidden
      maskClosable={!cerrando}
      width={modalWidths.modalWidthLG}
      className="libro-cierre-modal"
    >
      <div className="libro-cierre__resumen">
        <Text strong>
          {total} {plural(total, 'estudiante', 'estudiantes')} en {totalParalelos}{' '}
          {plural(totalParalelos, 'paralelo', 'paralelos')} sin nota final.
        </Text>
        <Paragraph type="secondary">
          Reclame las notas a los docentes de los folios indicados o cierre el libro de todos
          modos. Si cierra de todos modos, estos estudiantes quedarán asentados en el libro como
          ABANDONO, con NP en las materias sin nota. Esta acción es irreversible salvo reapertura
          del libro y regeneración de los folios.
        </Paragraph>
        {desactualizadas > 0 ? (
          <Paragraph type="secondary">
            Además, {desactualizadas}{' '}
            {plural(desactualizadas, 'estudiante ya tiene', 'estudiantes ya tienen')} todas sus
            notas cargadas después de generar los folios; al cerrar, su estado se actualizará
            automáticamente.
          </Paragraph>
        ) : null}
      </div>

      <div className="libro-cierre__paralelos">
        {paralelos.map((paralelo) => (
          <section key={paralelo.paraleloGestionId} className="libro-cierre__paralelo">
            <div className="libro-cierre__paralelo-head">
              <CarreraDotCell
                nombre={paralelo.carreraCodigo || paralelo.carreraNombre}
                colorHex={sanitizeDocenteColorHex(paralelo.carreraColorHex)}
              />
              <Text strong>{paralelo.cursoLabel}</Text>
              {paralelo.turno ? <Text type="secondary">· {paralelo.turno}</Text> : null}
              <Text type="secondary">
                · {paralelo.totalEstudiantes}{' '}
                {plural(paralelo.totalEstudiantes, 'estudiante', 'estudiantes')}
              </Text>
            </div>
            <ul className="libro-cierre__folios">
              {paralelo.folios.map((folio) => (
                <li key={folio.numeroFolio ?? folio.label} className="libro-cierre__folio">
                  <Text strong>{folio.label}</Text>
                  {folio.rangoLabel ? <Text type="secondary"> · {folio.rangoLabel}</Text> : null}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <Form form={form} layout="vertical" className="libro-cierre__form">
        <Form.Item
          name="motivo"
          label="Motivo del cierre con notas pendientes"
          rules={[
            { required: true, message: 'Indique el motivo del cierre' },
            {
              validator: (_, value) =>
                String(value ?? '').trim().length >= MOTIVO_MIN_LENGTH
                  ? Promise.resolve()
                  : Promise.reject(
                      new Error(`Detalle el motivo con al menos ${MOTIVO_MIN_LENGTH} caracteres`),
                    ),
            },
          ]}
        >
          <TextArea
            rows={3}
            maxLength={2000}
            showCount
            placeholder="Ej. Cierre de gestión por plazo institucional; docentes notificados sin respuesta"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CerrarLibroPendientesModal;
