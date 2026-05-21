/**
 * Reglas de evaluaciones finales por gestión, carrera y/o periodo.
 */

import { useState } from 'react';
import { Button, Empty, Flex, Form, Tag, Typography } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Card } from '@atoms';
import { describeAlcanceRegla } from '@application-academico/calificaciones/utils/evaluacionesFinalesReglas.js';
import PoliticaEvaluacionFinalModal from './PoliticaEvaluacionFinalModal.jsx';

const { Paragraph, Text } = Typography;

/** Registra el array en Ant Form sin UI (evita warning de Form.Item sin control). */
const ReglasFinalesFormHolder = ({ value: _value, onChange: _onChange }) => null;

const PoliticaEvaluacionesFinalesReglasSection = ({
  form,
  tiposEvaluacion = [],
  carreras = [],
  periodos = [],
  disabled = false,
  catalogoLoading = false,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [reglaEditar, setReglaEditar] = useState(null);
  const [editIndex, setEditIndex] = useState(null);

  const reglas = Form.useWatch('evaluacionesFinalesReglas', form) ?? [];

  const abrirAgregar = () => {
    setReglaEditar(null);
    setEditIndex(null);
    setModalOpen(true);
  };

  const abrirEditar = (regla, index) => {
    setReglaEditar(regla);
    setEditIndex(index);
    setModalOpen(true);
  };

  const handleConfirm = (regla) => {
    const actuales = [...(form.getFieldValue('evaluacionesFinalesReglas') ?? [])];
    if (editIndex != null && editIndex >= 0) {
      actuales[editIndex] = regla;
    } else {
      actuales.push(regla);
    }
    form.setFieldValue('evaluacionesFinalesReglas', actuales);
    setModalOpen(false);
    setReglaEditar(null);
    setEditIndex(null);
  };

  const eliminar = (index) => {
    const actuales = [...(form.getFieldValue('evaluacionesFinalesReglas') ?? [])];
    actuales.splice(index, 1);
    form.setFieldValue('evaluacionesFinalesReglas', actuales);
  };

  const agregarDisabled = disabled || catalogoLoading || tiposEvaluacion.length === 0;

  return (
    <Card
      title="Evaluaciones finales habilitadas"
      className="cal-politica-panel-card cal-politica-finales-reglas-card"
      headerColor="primary"
      variant="outlined"
      shadow={false}
      extra={
        <button
          type="button"
          className="sd-btn sd-btn--warn"
          onClick={abrirAgregar}
          disabled={agregarDisabled}
          aria-busy={catalogoLoading}
        >
          <PlusOutlined /> Agregar evaluación final
        </button>
      }
    >
      <Paragraph type="secondary" className="cal-politica-panel-card__desc">
        Configurá qué tipos de evaluación final aplican en esta gestión y con qué ponderación
        sobre la nota final. Podés limitar por carrera, por año del plan (periodo) o por ambos
        (ej. 1º año examen, 2º feria anual, 3º proyecto final).
      </Paragraph>

      <Form.Item name="evaluacionesFinalesReglas" initialValue={[]} hidden>
        <ReglasFinalesFormHolder />
      </Form.Item>

      {reglas.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Sin evaluaciones finales configuradas"
          className="cal-politica-finales-reglas__empty"
        />
      ) : (
        <div className="cal-politica-finales-reglas__lista">
          {reglas.map((regla, index) => (
            <div key={regla.id ?? index} className="cal-politica-finales-reglas__item">
              <Flex vertical gap={4} flex={1}>
                <Text strong>{regla.tipoEvaluacionNombre ?? regla.tipoEvaluacionCodigo}</Text>
                <Flex gap={8} wrap="wrap" align="center">
                  <Tag color="green">{Number(regla.ponderacion ?? 0).toFixed(1)}% nota final</Tag>
                  <Tag>{describeAlcanceRegla(regla, { carreras, periodos })}</Tag>
                </Flex>
              </Flex>
              <Flex gap={8}>
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => abrirEditar(regla, index)}
                  disabled={disabled}
                  aria-label="Editar"
                />
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => eliminar(index)}
                  disabled={disabled}
                  aria-label="Eliminar"
                />
              </Flex>
            </div>
          ))}
        </div>
      )}

      <PoliticaEvaluacionFinalModal
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setReglaEditar(null);
          setEditIndex(null);
        }}
        onConfirm={handleConfirm}
        reglaEditar={reglaEditar}
        tiposEvaluacion={tiposEvaluacion}
        carreras={carreras}
        periodos={periodos}
      />
    </Card>
  );
};

export default PoliticaEvaluacionesFinalesReglasSection;
