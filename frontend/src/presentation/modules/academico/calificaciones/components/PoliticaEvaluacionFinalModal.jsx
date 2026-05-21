/**
 * Modal para agregar o editar una regla de evaluación final institucional.
 */

import { useEffect } from 'react';
import { Form, Modal, Select, Radio, Typography } from 'antd';
import PoliticaPorcentajeSlider from './PoliticaPorcentajeSlider.jsx';
import {
  ALCANCE_EVALUACION_FINAL,
  ALCANCE_EVALUACION_FINAL_OPCIONES_MODAL,
  dedupePeriodosPlan,
  nuevaReglaEvaluacionFinal,
  periodoIdParaSelector,
} from '@application-academico/calificaciones/utils/evaluacionesFinalesReglas.js';

const { Paragraph } = Typography;

const PoliticaEvaluacionFinalModal = ({
  open,
  onCancel,
  onConfirm,
  reglaEditar = null,
  tiposEvaluacion = [],
  carreras = [],
  periodos = [],
}) => {
  const [form] = Form.useForm();
  const alcance = Form.useWatch('alcance', form);
  const periodosAnioPlan = dedupePeriodosPlan(periodos);

  useEffect(() => {
    if (!open) return;
    if (reglaEditar) {
      let alcanceGuardado = reglaEditar.alcance ?? ALCANCE_EVALUACION_FINAL.GESTION;
      if (alcanceGuardado === ALCANCE_EVALUACION_FINAL.CARRERA_PERIODO) {
        alcanceGuardado = reglaEditar.carreraId
          ? ALCANCE_EVALUACION_FINAL.CARRERA
          : reglaEditar.periodoId
            ? ALCANCE_EVALUACION_FINAL.PERIODO
            : ALCANCE_EVALUACION_FINAL.GESTION;
      }
      form.setFieldsValue({
        tipoEvaluacionCodigo: reglaEditar.tipoEvaluacionCodigo,
        ponderacion: reglaEditar.ponderacion ?? 10,
        alcance: alcanceGuardado,
        carreraId: reglaEditar.carreraId ?? undefined,
        periodoId: periodoIdParaSelector(reglaEditar.periodoId, periodos),
      });
      return;
    }
    form.resetFields();
    form.setFieldsValue({
      ponderacion: 10,
      alcance: ALCANCE_EVALUACION_FINAL.GESTION,
    });
  }, [open, reglaEditar, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    const tipo = tiposEvaluacion.find((t) => t.codigo === values.tipoEvaluacionCodigo);
    const carrera = carreras.find((c) => c.id === values.carreraId);
    const periodo = periodosAnioPlan.find((p) => p.id === values.periodoId);

    const base = reglaEditar
      ? { ...reglaEditar }
      : nuevaReglaEvaluacionFinal({
          tipoEvaluacionCodigo: values.tipoEvaluacionCodigo,
          tipoEvaluacionNombre: tipo?.nombre ?? values.tipoEvaluacionCodigo,
        });

    onConfirm?.({
      ...base,
      tipoEvaluacionCodigo: values.tipoEvaluacionCodigo,
      tipoEvaluacionNombre: tipo?.nombre ?? base.tipoEvaluacionNombre,
      ponderacion: values.ponderacion,
      alcance: values.alcance,
      carreraId:
        values.alcance === ALCANCE_EVALUACION_FINAL.CARRERA ||
        values.alcance === ALCANCE_EVALUACION_FINAL.CARRERA_PERIODO
          ? values.carreraId
          : null,
      carreraNombre: carrera?.nombre ?? null,
      periodoId:
        values.alcance === ALCANCE_EVALUACION_FINAL.PERIODO ||
        values.alcance === ALCANCE_EVALUACION_FINAL.CARRERA_PERIODO
          ? values.periodoId
          : null,
      periodoNombre: periodo?.nombre ?? null,
    });
    form.resetFields();
  };

  const requiereCarrera =
    alcance === ALCANCE_EVALUACION_FINAL.CARRERA ||
    alcance === ALCANCE_EVALUACION_FINAL.CARRERA_PERIODO;
  const requierePeriodo =
    alcance === ALCANCE_EVALUACION_FINAL.PERIODO ||
    alcance === ALCANCE_EVALUACION_FINAL.CARRERA_PERIODO;

  return (
    <Modal
      title={reglaEditar ? 'Editar evaluación final' : 'Agregar evaluación final'}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText={reglaEditar ? 'Guardar cambios' : 'Agregar'}
      cancelText="Cancelar"
      destroyOnHidden
      width={560}
      className="cal-politica-final-modal"
    >
      <Paragraph type="secondary" style={{ marginBottom: 16 }}>
        Definí el tipo de evaluación, su ponderación sobre la nota final de la materia y el
        alcance (toda la gestión, una carrera o un año del plan). El detalle por curso lo define el docente.
      </Paragraph>

      <Form form={form} layout="vertical">
        <Form.Item
          name="tipoEvaluacionCodigo"
          label="Tipo de evaluación"
          rules={[{ required: true, message: 'Seleccioná un tipo' }]}
        >
          <Select
            placeholder="Ej. Examen final, Feria anual, Proyecto final"
            options={tiposEvaluacion.map((t) => ({
              value: t.codigo,
              label: t.nombre,
            }))}
            showSearch
            optionFilterProp="label"
            disabled={Boolean(reglaEditar)}
          />
        </Form.Item>

        <Form.Item
          name="ponderacion"
          label="Ponderación sobre la nota final"
          rules={[{ required: true, message: 'Indicá el porcentaje' }]}
        >
          <PoliticaPorcentajeSlider label="Porcentaje de la nota final" color="#196b45" />
        </Form.Item>

        <Form.Item
          name="alcance"
          label="Alcance"
          rules={[{ required: true, message: 'Seleccioná el alcance' }]}
        >
          <Radio.Group className="cal-politica-final-modal__alcance">
            {ALCANCE_EVALUACION_FINAL_OPCIONES_MODAL.map((o) => (
              <Radio key={o.value} value={o.value} className="cal-politica-final-modal__alcance-item">
                {o.label}
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>

        {requiereCarrera ? (
          <Form.Item
            name="carreraId"
            label="Carrera"
            rules={[{ required: true, message: 'Seleccioná la carrera' }]}
          >
            <Select
              placeholder="Seleccionar carrera"
              options={carreras.map((c) => ({
                value: c.id,
                label: c.nombre,
              }))}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
        ) : null}

        {requierePeriodo ? (
          <Form.Item
            name="periodoId"
            label="Periodo (año del plan)"
            rules={[{ required: true, message: 'Seleccioná el periodo' }]}
          >
            <Select
              placeholder="Ej. Primer año, Segundo año"
              options={periodosAnioPlan.map((p) => ({
                value: p.id,
                label: p.nombre,
              }))}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
        ) : null}
      </Form>
    </Modal>
  );
};

export default PoliticaEvaluacionFinalModal;
