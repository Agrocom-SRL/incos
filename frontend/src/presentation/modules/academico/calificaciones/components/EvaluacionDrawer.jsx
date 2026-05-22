/**
 * Drawer crear / editar evaluación del bimestre — estilo cal-ajustes-drawer.
 */

import { forwardRef, useEffect, useMemo, useState } from 'react';
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
  Space,
} from 'antd';
import {
  CalendarOutlined,
  CheckOutlined,
  DeleteOutlined,
  PieChartOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useTiposEvaluacion } from '@application-academico/calificaciones/hooks/useTiposEvaluacion.js';
import {
  calcularSumaPesosComponente,
  contarNotasCargadas,
} from '@application-academico/calificaciones/utils/pesoEvaluaciones.js';
import SeccionAjustes from './ajustes/SeccionAjustes.jsx';
import {
  CALIFICACIONES_DRAWER_Z_INDEX,
  calificacionesDrawerClassNames,
  calificacionesDrawerRootClassName,
  calificacionesDrawerSectionClassName,
  calificacionesDrawerStyles,
  calificacionesDrawerTarjetaClassName,
} from '../utils/calificacionesDrawerLayout.js';

const COMPONENTES = [
  { label: 'Teórico', value: 'TEORICO' },
  { label: 'Práctico', value: 'PRACTICO' },
];

const InputPorcentaje = forwardRef((props, ref) => {
  const { style, ...rest } = props;
  return (
    <Space.Compact block className="cal-ajustes-drawer__input-pct">
      <InputNumber ref={ref} {...rest} style={{ width: '100%', ...style }} />
      <Input className="cal-ajustes-drawer__input-pct-suffix" value="%" disabled tabIndex={-1} />
    </Space.Compact>
  );
});
InputPorcentaje.displayName = 'InputPorcentaje';

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
      setErrorGuardado(
        typeof err?.message === 'string' ? err.message : 'No se pudo guardar. Reintentar.',
      );
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
        } catch (err) {
          setErrorGuardado(
            typeof err?.message === 'string' ? err.message : 'No se pudo eliminar. Reintentar.',
          );
        } finally {
          setEliminando(false);
        }
      },
    });
  };

  const tituloDrawer = esEditar ? 'Editar evaluación' : 'Agregar evaluación';

  const footer = (
    <div className="cal-ajustes-drawer__footer cal-eval-drawer__footer">
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
        <span className="cal-ajustes-drawer__footer-count cal-ajustes-drawer__footer-count--empty" />
      )}
      <div className="cal-ajustes-drawer__footer-actions cal-eval-drawer__footer-actions">
        <Button onClick={handleCerrar} disabled={guardando || eliminando}>
          Cancelar
        </Button>
        <Button
          type="primary"
          className="cal-ajustes-drawer__btn-guardar cal-eval-drawer__btn-primary"
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
      title={tituloDrawer}
      size={520}
      open={abierto}
      onClose={handleCerrar}
      destroyOnClose
      footer={footer}
      rootClassName={calificacionesDrawerRootClassName}
      className={`${calificacionesDrawerSectionClassName} cal-eval-drawer`}
      classNames={calificacionesDrawerClassNames}
      zIndex={CALIFICACIONES_DRAWER_Z_INDEX}
      styles={calificacionesDrawerStyles()}
    >
      {errorGuardado ? (
        <Alert
          type="error"
          showIcon
          title={errorGuardado}
          action={
            <Button size="small" type="link" onClick={handleGuardar}>
              Reintentar
            </Button>
          }
          className="cal-eval-drawer__alert"
        />
      ) : null}

      <Form form={form} layout="vertical" className="cal-ajustes-drawer__form cal-eval-drawer__form">
        <div className="cal-eval-drawer__bloques">
          <SeccionAjustes
            icon={TagsOutlined}
            titulo="Identificación"
            className={calificacionesDrawerTarjetaClassName}
          >
            <p className="cal-ajustes-drawer__section-desc">
              Definí el tipo institucional y el nombre con el que aparecerá la columna en el
              cuaderno
              {cursoId && bimestre ? ` (bimestre ${bimestre})` : ''}.
            </p>

            <Form.Item
              name="tipoEvaluacionId"
              label="Tipo de evaluación"
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
              rules={[
                { required: true, message: 'Ingresá un nombre' },
                { max: 200, message: 'Máximo 200 caracteres' },
              ]}
            >
              <Input placeholder="Ej. Parcial Tema 3, Proyecto web final…" maxLength={200} />
            </Form.Item>
          </SeccionAjustes>

          <SeccionAjustes
            icon={PieChartOutlined}
            titulo="Componente y ponderación"
            className={calificacionesDrawerTarjetaClassName}
          >
            <p className="cal-ajustes-drawer__section-desc">
              Indicá si la evaluación suma al componente teórico o práctico y qué porcentaje
              representa dentro de ese componente al cerrar el bimestre.
            </p>

            <Form.Item
              name="componente"
              label="Componente"
              rules={[{ required: true, message: 'Seleccioná un componente' }]}
            >
              <Segmented options={COMPONENTES} block className="cal-eval-drawer__segmented" />
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
              <InputPorcentaje min={0.01} max={100} precision={2} step={0.5} />
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
          </SeccionAjustes>

          <SeccionAjustes
            icon={CalendarOutlined}
            titulo="Programación"
            className={calificacionesDrawerTarjetaClassName}
          >
            <p className="cal-ajustes-drawer__section-desc">
              Fecha prevista de la evaluación (opcional). Sirve como referencia en el cuaderno; no
              bloquea la carga de notas.
            </p>

            <Form.Item name="fecha" label="Fecha de la evaluación">
              <DatePicker
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                placeholder="Cuándo se rendirá esta evaluación"
              />
            </Form.Item>
          </SeccionAjustes>
        </div>
      </Form>
    </Drawer>
  );
};

export default EvaluacionDrawer;
