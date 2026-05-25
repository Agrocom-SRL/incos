/**
 * Drawer crear / editar evaluación del bimestre — estilo cal-ajustes-drawer.
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
  calcularSumaPuntosComponente,
  contarNotasCargadas,
} from '@application-academico/calificaciones/utils/puntosEvaluaciones.js';
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

const EvaluacionDrawer = ({
  abierto,
  modo,
  evaluacion = null,
  cursoId,
  bimestre,
  evaluacionesActuales = [],
  estudiantes = [],
  cuotaTeorico = 30,
  cuotaPractico = 70,
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
  const puntosWatch = Form.useWatch('puntos', form);
  const esEditar = modo === 'editar';

  useEffect(() => {
    if (!abierto) return;

    setErrorGuardado(null);
    if (esEditar && evaluacion) {
      form.setFieldsValue({
        tipoEvaluacionId: evaluacion.tipoEvaluacionId,
        nombre: evaluacion.nombre,
        componente: evaluacion.componente,
        puntos: evaluacion.puntos,
        fecha: evaluacion.fecha ? dayjs(evaluacion.fecha) : null,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ componente: 'TEORICO' });
    }
  }, [abierto, esEditar, evaluacion, form]);

  const cuotaComponente =
    componenteWatch === 'PRACTICO' ? Number(cuotaPractico) || 70 : Number(cuotaTeorico) || 30;

  const sumaPuntos = useMemo(
    () =>
      calcularSumaPuntosComponente(
        evaluacionesActuales,
        componenteWatch ?? 'TEORICO',
        puntosWatch ?? 0,
        esEditar ? evaluacion?.id : null,
      ),
    [evaluacionesActuales, componenteWatch, puntosWatch, esEditar, evaluacion?.id],
  );

  const bloquePuntos = useMemo(() => {
    const etiqueta = componenteWatch === 'PRACTICO' ? 'Práctico' : 'Teórico';
    if (sumaPuntos > cuotaComponente) {
      return {
        tipo: 'warn',
        texto: `Suma actual: ${sumaPuntos} / ${cuotaComponente} pts — supera la cuota del componente ${etiqueta}.`,
        etiqueta,
      };
    }
    if (sumaPuntos === cuotaComponente) {
      return {
        tipo: 'ok-full',
        texto: `Suma actual: ${sumaPuntos} / ${cuotaComponente} pts — completo`,
        etiqueta,
      };
    }
    return {
      tipo: 'ok',
      texto: `Suma actual del componente ${etiqueta}: ${sumaPuntos} / ${cuotaComponente} pts`,
      etiqueta,
    };
  }, [sumaPuntos, componenteWatch, cuotaComponente]);

  const handleCerrar = () => {
    if (!guardando && !eliminando) onCerrar();
  };

  const construirPayload = (values) => ({
    tipoEvaluacionId: values.tipoEvaluacionId,
    nombre: values.nombre?.trim(),
    componente: values.componente,
    puntos: values.puntos,
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
            titulo="Componente y puntos"
            className={calificacionesDrawerTarjetaClassName}
          >
            <p className="cal-ajustes-drawer__section-desc">
              Indicá si la actividad suma al bloque teórico ({cuotaTeorico} pts) o práctico (
              {cuotaPractico} pts) del bimestre, y cuántos puntos aporta esta columna. La suma de
              actividades de cada componente no debe superar su cuota.
            </p>

            <Form.Item
              name="componente"
              label="Componente"
              rules={[{ required: true, message: 'Seleccioná un componente' }]}
            >
              <Segmented options={COMPONENTES} block className="cal-eval-drawer__segmented" />
            </Form.Item>

            <Form.Item
              name="puntos"
              label="Puntos de la actividad"
              rules={[
                { required: true, message: 'Ingresá los puntos' },
                {
                  validator: (_, value) => {
                    const n = Number(value);
                    if (value == null || !Number.isInteger(n) || n < 1) {
                      return Promise.reject(new Error('Los puntos deben ser un entero ≥ 1'));
                    }
                    if (n > cuotaComponente) {
                      return Promise.reject(
                        new Error(`Máximo ${cuotaComponente} pts para este componente`),
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber
                min={1}
                max={cuotaComponente}
                precision={0}
                step={1}
                style={{ width: '100%' }}
                addonAfter="pts"
              />
            </Form.Item>

            <div
              className={[
                'cal-eval-drawer__peso-hint',
                `cal-eval-drawer__peso-hint--${bloquePuntos.tipo}`,
              ].join(' ')}
            >
              {bloquePuntos.tipo === 'ok-full' ? (
                <CheckOutlined className="cal-eval-drawer__peso-icon" aria-hidden />
              ) : null}
              <span>{bloquePuntos.texto}</span>
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
