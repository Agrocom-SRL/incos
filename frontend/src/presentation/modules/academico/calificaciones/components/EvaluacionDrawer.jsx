/**
 * Drawer crear / editar evaluación del bimestre vigente.
 */

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  notification,
  Segmented,
  Select,
} from 'antd';
import { CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useTiposEvaluacion } from '@application-academico/calificaciones/hooks/useTiposEvaluacion.js';
import {
  calcularSumaPesosComponente,
  contarNotasCargadas,
} from '@application-academico/calificaciones/utils/pesoEvaluaciones.js';

const COMPONENTES = [
  { label: 'Teórico', value: 'TEORICO' },
  { label: 'Práctico', value: 'PRACTICO' },
];

const EvaluacionDrawer = ({
  abierto,
  modo,
  evaluacion = null,
  cursoId,
  bimestre,
  evaluacionesActuales = [],
  estudiantes = [],
  onCerrar,
  onGuardado,
  onEliminado,
  crearEvaluacion,
  editarEvaluacion,
}) => {
  const [form] = Form.useForm();
  const { tipos, isLoading: tiposLoading } = useTiposEvaluacion();
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState(null);

  const componenteWatch = Form.useWatch('componente', form);
  const pesoWatch = Form.useWatch('peso', form);
  const esEditar = modo === 'editar';

  useEffect(() => {
    if (!abierto) return;

    setErrorGuardado(null);
    if (esEditar && evaluacion) {
      form.setFieldsValue({
        tipoEvaluacionId: evaluacion.tipoEvaluacionId,
        nombre: evaluacion.nombre,
        componente: evaluacion.componente,
        peso: evaluacion.peso,
        fecha: evaluacion.fecha ? dayjs(evaluacion.fecha) : null,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ componente: 'TEORICO' });
    }
  }, [abierto, esEditar, evaluacion, form]);

  const sumaPesos = useMemo(
    () =>
      calcularSumaPesosComponente(
        evaluacionesActuales,
        componenteWatch ?? 'TEORICO',
        pesoWatch ?? 0,
        esEditar ? evaluacion?.id : null,
      ),
    [evaluacionesActuales, componenteWatch, pesoWatch, esEditar, evaluacion?.id],
  );

  const bloquePesos = useMemo(() => {
    const etiqueta = componenteWatch === 'PRACTICO' ? 'Práctico' : 'Teórico';
    if (sumaPesos > 100) {
      return {
        tipo: 'warn',
        texto: `Suma actual: ${sumaPesos}% / 100% — supera el límite. El bimestre solo puede cerrarse con suma exacta de 100%.`,
        etiqueta,
      };
    }
    if (sumaPesos === 100) {
      return {
        tipo: 'ok-full',
        texto: 'Suma actual: 100% / 100% — completo',
        etiqueta,
      };
    }
    return {
      tipo: 'ok',
      texto: `Suma actual del componente ${etiqueta}: ${sumaPesos}% / 100%`,
      etiqueta,
    };
  }, [sumaPesos, componenteWatch]);

  const handleCerrar = () => {
    if (!guardando && !eliminando) onCerrar();
  };

  const construirPayload = (values) => ({
    tipoEvaluacionId: values.tipoEvaluacionId,
    nombre: values.nombre?.trim(),
    componente: values.componente,
    peso: values.peso,
    fecha: values.fecha ? values.fecha.format('YYYY-MM-DD') : null,
  });

  const handleGuardar = async () => {
    try {
      const values = await form.validateFields();
      setGuardando(true);
      setErrorGuardado(null);
      const payload = construirPayload(values);

      if (esEditar) {
        const actualizada = await editarEvaluacion(evaluacion.id, payload);
        notification.success({ message: 'Evaluación actualizada' });
        onGuardado(actualizada);
        onCerrar();
      } else {
        const creada = await crearEvaluacion(payload);
        notification.success({ message: 'Evaluación creada' });
        onGuardado(creada);
        onCerrar();
      }
    } catch (err) {
      if (err?.errorFields) return;
      setErrorGuardado('No se pudo guardar. Reintentar.');
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminar = () => {
    const notasCount = contarNotasCargadas(estudiantes, evaluacion.id);
    const nombre = evaluacion.nombre;

    Modal.confirm({
      title: 'Eliminar evaluación',
      okText: 'Eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      content:
        notasCount > 0 ? (
          <span>
            ¿Eliminar la evaluación <strong>{nombre}</strong>? Se perderán{' '}
            <strong>{notasCount} notas</strong> ya cargadas. Esta acción no se puede deshacer.
          </span>
        ) : (
          <span>
            ¿Eliminar la evaluación <strong>{nombre}</strong>? Esta acción no se puede deshacer.
          </span>
        ),
      onOk: async () => {
        setEliminando(true);
        try {
          await onEliminado(evaluacion.id);
          notification.success({ message: 'Evaluación eliminada' });
          onCerrar();
        } catch {
          setErrorGuardado('No se pudo eliminar. Reintentar.');
        } finally {
          setEliminando(false);
        }
      },
    });
  };

  const footer = (
    <div className="cal-eval-drawer__footer">
      {esEditar ? (
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={confirmarEliminar}
          loading={eliminando}
          disabled={guardando}
        >
          Eliminar
        </Button>
      ) : (
        <span />
      )}
      <div className="cal-eval-drawer__footer-actions">
        <Button onClick={handleCerrar} disabled={guardando || eliminando}>
          Cancelar
        </Button>
        <Button
          type="primary"
          className="cal-eval-drawer__btn-primary"
          loading={guardando}
          disabled={eliminando}
          onClick={handleGuardar}
        >
          {esEditar ? 'Guardar cambios' : 'Agregar evaluación'}
        </Button>
      </div>
    </div>
  );

  return (
    <Drawer
      title={esEditar ? 'Editar evaluación' : 'Agregar evaluación'}
      width={480}
      open={abierto}
      onClose={handleCerrar}
      destroyOnClose
      footer={footer}
      className="cal-eval-drawer"
    >
      {errorGuardado ? (
        <Alert
          type="error"
          showIcon
          message={errorGuardado}
          action={
            <Button size="small" type="link" onClick={handleGuardar}>
              Reintentar
            </Button>
          }
          style={{ marginBottom: 16 }}
        />
      ) : null}

      <Form form={form} layout="vertical" className="cal-eval-drawer__form">
        <Form.Item
          name="tipoEvaluacionId"
          label="Tipo"
          rules={[{ required: true, message: 'Seleccioná un tipo' }]}
        >
          <Select
            placeholder={tiposLoading ? 'Cargando…' : 'Seleccionar tipo'}
            loading={tiposLoading}
            disabled={tiposLoading}
            options={tipos.map((t) => ({ value: t.id, label: t.nombre }))}
          />
        </Form.Item>

        <Form.Item
          name="nombre"
          label="Nombre descriptivo"
          extra="Este nombre aparece como cabecera de la columna en el cuaderno."
          rules={[
            { required: true, message: 'Ingresá un nombre' },
            { max: 200, message: 'Máximo 200 caracteres' },
          ]}
        >
          <Input placeholder="Ej. Parcial Tema 3, Proyecto web final…" maxLength={200} />
        </Form.Item>

        <Form.Item
          name="componente"
          label="Componente"
          rules={[{ required: true, message: 'Seleccioná un componente' }]}
        >
          <Segmented options={COMPONENTES} block />
        </Form.Item>

        <Form.Item
          name="peso"
          label="Peso dentro del componente"
          rules={[
            { required: true, message: 'Ingresá el peso' },
            {
              validator: (_, value) => {
                if (value == null || value <= 0) {
                  return Promise.reject(new Error('El peso debe ser mayor a 0'));
                }
                if (value > 100) {
                  return Promise.reject(new Error('Máximo 100%'));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber
            min={0.01}
            max={100}
            precision={2}
            step={0.5}
            addonAfter="%"
            style={{ width: '100%' }}
          />
        </Form.Item>

        <div
          className={[
            'cal-eval-drawer__peso-hint',
            `cal-eval-drawer__peso-hint--${bloquePesos.tipo}`,
          ].join(' ')}
        >
          {bloquePesos.tipo === 'ok-full' ? (
            <CheckOutlined className="cal-eval-drawer__peso-icon" aria-hidden />
          ) : null}
          <span>{bloquePesos.texto}</span>
        </div>

        <Form.Item name="fecha" label="Fecha (opcional)">
          <DatePicker
            style={{ width: '100%' }}
            format="DD/MM/YYYY"
            placeholder="Cuándo se rendirá esta evaluación"
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default EvaluacionDrawer;
