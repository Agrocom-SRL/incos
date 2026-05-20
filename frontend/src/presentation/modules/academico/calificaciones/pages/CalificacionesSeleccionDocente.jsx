/**
 * CalificacionesSeleccionDocente — Paso previo a la lista de cursos (vista administrativa).
 * Mismo patrón visual que PagosRegistrarSeleccion: muestra previa + búsqueda en tabla.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, Input, Space, Spin, Table, Tag, Typography } from 'antd';
import {
  BookOutlined,
  CalendarOutlined,
  IdcardOutlined,
  MailOutlined,
  PhoneOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton } from '@atoms';
import { useAuthContext } from '@application-auth';
import { mapDocentesList } from '@application-docentes/mappers';
import { resolveDocenteIdFromUsuario } from '@application-academico/calificaciones/utils/resolveDocenteId';
import {
  CALIFICACIONES_SELECCION_PATH,
  calificacionesCursosPath,
} from '@application-academico/calificaciones/utils/calificacionesPaths';
import { useCasesFactory } from '@container';
import '../styles/calificaciones.css';

const { Text } = Typography;

const PRELIM_LIMIT = 10;
const BUSQUEDA_DEBOUNCE_MS = 400;
const BUSQUEDA_MIN_CHARS = 2;

const formatFechaCreacion = (fecha) => {
  if (!fecha) return '—';
  const d = dayjs(fecha);
  return d.isValid() ? d.format('DD/MM/YYYY') : String(fecha);
};

const filtrarConAsignaciones = (rows) =>
  rows.filter((d) => d?.teachingStats?.hasAsignaciones || (d?.teachingStats?.totalAsignaciones ?? 0) > 0);

const CalificacionesSeleccionDocente = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const menuSidebarKeyFromState = location.state?.menuSidebarKey ?? 'ACA-CAL';
  const { usuario, isLoading: authLoading } = useAuthContext();
  const docenteIdFromUser = resolveDocenteIdFromUsuario(usuario);

  const [tablaLoading, setTablaLoading] = useState(true);
  const [tablaError, setTablaError] = useState(null);
  const [tablaFilas, setTablaFilas] = useState([]);

  const [busquedaInput, setBusquedaInput] = useState('');
  const [busquedaDebounced, setBusquedaDebounced] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (docenteIdFromUser) {
      navigate(calificacionesCursosPath(docenteIdFromUser), {
        replace: true,
        state: { menuSidebarKey: menuSidebarKeyFromState },
      });
    }
  }, [authLoading, docenteIdFromUser, navigate, menuSidebarKeyFromState]);

  useEffect(() => {
    const t = setTimeout(() => setBusquedaDebounced(busquedaInput.trim()), BUSQUEDA_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [busquedaInput]);

  useEffect(() => {
    if (authLoading || docenteIdFromUser) return;

    let cancelled = false;
    (async () => {
      setTablaLoading(true);
      setTablaError(null);
      try {
        const uc = useCasesFactory.obtenerTodosDocentes();
        const esBusqueda = busquedaDebounced.length >= BUSQUEDA_MIN_CHARS;
        const result = await uc.ejecutar({
          params: esBusqueda
            ? { page: 1, limit: 50, search: busquedaDebounced }
            : { page: 1, limit: 50, sort: 'id:DESC' },
        });
        if (cancelled) return;
        if (!result?.success) {
          setTablaFilas([]);
          setTablaError(result?.error || 'No se pudo cargar la información');
          return;
        }
        const mapped = mapDocentesList(result.data);
        const filas = esBusqueda ? mapped : filtrarConAsignaciones(mapped).slice(0, PRELIM_LIMIT);
        setTablaFilas(filas);
      } catch (e) {
        if (!cancelled) {
          setTablaFilas([]);
          setTablaError(e?.message || 'Error al cargar');
        }
      } finally {
        if (!cancelled) setTablaLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [busquedaDebounced, authLoading, docenteIdFromUser]);

  const irACursos = useCallback(
    (docenteId) => {
      if (!docenteId) return;
      navigate(calificacionesCursosPath(Number(docenteId)), {
        state: { menuSidebarKey: menuSidebarKeyFromState },
      });
    },
    [navigate, menuSidebarKeyFromState],
  );

  const irAListaDocentes = useCallback(() => {
    navigate('/docentes/listar', {
      state: { menuSidebarKey: menuSidebarKeyFromState, returnListPath: CALIFICACIONES_SELECCION_PATH },
    });
  }, [navigate, menuSidebarKeyFromState]);

  const columnasTabla = useMemo(
    () => [
      {
        title: 'Registro',
        key: 'created_at',
        width: 120,
        render: (_, r) => (
          <Space size={6}>
            <CalendarOutlined />
            <Text>{formatFechaCreacion(r.createdAt)}</Text>
          </Space>
        ),
      },
      {
        title: 'Docente',
        key: 'nombre',
        render: (_, r) => (
          <Space>
            <UserOutlined />
            <div>
              <Text strong>{r.nombreCompleto ?? '—'}</Text>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <IdcardOutlined style={{ marginRight: 6 }} />
                  {r.ciCompleto ?? r.ci ?? '—'}
                </Text>
              </div>
            </div>
          </Space>
        ),
      },
      {
        title: 'Contacto',
        key: 'contacto',
        width: 200,
        render: (_, r) => (
          <div style={{ fontSize: 13 }}>
            {r.emailPersonal ? (
              <div>
                <MailOutlined style={{ marginRight: 8 }} />
                {r.emailPersonal}
              </div>
            ) : null}
            {r.celular ? (
              <div>
                <PhoneOutlined style={{ marginRight: 8 }} />
                {r.celular}
              </div>
            ) : null}
            {r.telefono ? (
              <div>
                <PhoneOutlined style={{ marginRight: 8 }} />
                {r.telefono}
              </div>
            ) : null}
            {!r.emailPersonal && !r.celular && !r.telefono ? (
              <div>
                <PhoneOutlined style={{ marginRight: 8 }} />
                —
              </div>
            ) : null}
          </div>
        ),
      },
      {
        title: 'Formación',
        key: 'formacion',
        ellipsis: true,
        render: (_, r) => (
          <Space size={6}>
            <BookOutlined />
            <span>{r.tituloProfesional ?? r.especialidad ?? '—'}</span>
          </Space>
        ),
      },
      {
        title: 'Carga docente',
        key: 'carga',
        width: 200,
        render: (_, r) => {
          const stats = r.teachingStats ?? {};
          const total = Number(stats.totalAsignaciones ?? 0);
          if (!stats.hasAsignaciones && total === 0) {
            return <Tag>Sin cursos vigentes</Tag>;
          }
          return (
            <div>
              <Tag color="processing" icon={<TeamOutlined />}>
                {total} asignación{total === 1 ? '' : 'es'}
              </Tag>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {stats.totalMaterias ?? 0} materia(s) · {stats.totalParalelos ?? 0} paralelo(s)
                </Text>
              </div>
            </div>
          );
        },
      },
      {
        title: '',
        key: 'accion',
        width: 140,
        render: (_, r) => {
          const stats = r.teachingStats ?? {};
          const tieneCursos = stats.hasAsignaciones || (stats.totalAsignaciones ?? 0) > 0;
          if (!tieneCursos) return null;
          return (
            <ActionButton
              permiso="academico.calificacion.curso"
              accion="LISTAR"
              variant="primary"
              size="small"
              onClick={() => irACursos(r.id)}
            >
              Ver cursos
            </ActionButton>
          );
        },
      },
    ],
    [irACursos],
  );

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Académico', href: '/academico' },
      { title: 'Calificaciones' },
    ],
    [],
  );

  const esBusquedaActiva = busquedaDebounced.length >= BUSQUEDA_MIN_CHARS;

  if (authLoading || docenteIdFromUser) {
    return (
      <PageTemplate
        header={<PageHeader title="Calificaciones" breadcrumbItems={breadcrumbItems} />}
        sidebar={null}
      >
        <Spin size="large" style={{ display: 'block', margin: '3rem auto' }} />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      header={
        <PageHeader
          title="Calificaciones — elegir docente"
          breadcrumbItems={breadcrumbItems}
        />
      }
      sidebar={null}
    >
      <div className="sd">
        <Alert
          type="info"
          showIcon
          title="Resumen"
          description={
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ margin: 0 }}>
                La tabla muestra primero una <strong>muestra</strong> de docentes con{' '}
                <strong>cursos asignados</strong> en la gestión vigente. Use el buscador (desde{' '}
                {BUSQUEDA_MIN_CHARS} caracteres) para ampliar por nombre, CI, email, teléfono o título.
              </p>
              <p style={{ margin: 0 }}>
                Si no lo encuentra, vaya a{' '}
                <button
                  type="button"
                  className="sd-btn sd-btn--primary"
                  style={{ verticalAlign: 'middle' }}
                  onClick={irAListaDocentes}
                >
                  Lista de docentes
                </button>
                .
              </p>
            </div>
          }
        />

        <div className="sd-card" style={{ marginTop: 16 }}>
          <div className="sd-card__head sd-card__head--cabecera">
            <span className="sd-card__title">Docentes</span>
          </div>
          <div className="sd-card__body" style={{ display: 'block', padding: '16px 20px' }}>
            <Input.Search
              allowClear
              placeholder="Nombre, CI, email, teléfono, título o especialidad…"
              value={busquedaInput}
              onChange={(e) => setBusquedaInput(e.target.value)}
              loading={tablaLoading}
              style={{ maxWidth: 480, marginBottom: 12 }}
            />
            {tablaError ? (
              <Text type="danger" style={{ display: 'block', marginBottom: 8 }}>
                {tablaError}
              </Text>
            ) : null}
            <Text type="secondary" style={{ display: 'block', marginBottom: 12, fontSize: 13 }}>
              {esBusquedaActiva
                ? `Búsqueda en el catálogo de docentes. Escriba menos de ${BUSQUEDA_MIN_CHARS} caracteres para volver a la muestra con cursos asignados.`
                : `Muestra de hasta ${PRELIM_LIMIT} docentes con asignaciones vigentes. Escriba al menos ${BUSQUEDA_MIN_CHARS} caracteres para buscar.`}
            </Text>
            <Table
              className="cal-sel-table"
              rowKey={(r) => r.id}
              loading={tablaLoading}
              columns={columnasTabla}
              dataSource={tablaFilas}
              pagination={
                esBusquedaActiva
                  ? { pageSize: 10, showSizeChanger: true, hideOnSinglePage: true }
                  : false
              }
              size="middle"
              locale={{
                emptyText: tablaError
                  ? String(tablaError)
                  : tablaLoading
                    ? 'Cargando…'
                    : 'Sin resultados.',
              }}
            />
          </div>
        </div>
      </div>
    </PageTemplate>
  );
};

export default CalificacionesSeleccionDocente;
