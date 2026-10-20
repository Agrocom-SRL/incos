/**
 * BecasAsignarSeleccion — Paso previo al formulario de asignar beca (misma idea que PagosRegistrarSeleccion).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, Input, Space, Table, Typography } from 'antd';
import {
  ArrowLeftOutlined,
  BookOutlined,
  CalendarOutlined,
  IdcardOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { Button, ActionButton } from '@atoms';
import { useCasesFactory } from '@container';

const { Text } = Typography;

const PRELIM_LIMIT = 10;
const BUSQUEDA_DEBOUNCE_MS = 400;
const BUSQUEDA_MIN_CHARS = 2;
const RUTA_FORMULARIO_ASIGNAR = '/estudiantes/becas/asignar';

const formatFechaCreacion = (fecha) => {
  if (!fecha) return '—';
  const d = dayjs(fecha);
  return d.isValid() ? d.format('DD/MM/YYYY HH:mm') : String(fecha);
};

const BecasAsignarSeleccion = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const returnListPath = location.state?.returnListPath || '/estudiantes/becas/listar';
  const menuSidebarKeyFromState = location.state?.menuSidebarKey;

  const [tablaLoading, setTablaLoading] = useState(true);
  const [tablaError, setTablaError] = useState(null);
  const [tablaFilas, setTablaFilas] = useState([]);

  const [busquedaInput, setBusquedaInput] = useState('');
  const [busquedaDebounced, setBusquedaDebounced] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setBusquedaDebounced(busquedaInput.trim()), BUSQUEDA_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [busquedaInput]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setTablaLoading(true);
      setTablaError(null);
      try {
        const uc = useCasesFactory.buscarEstudiantesAsignacionBeca();
        const esBusqueda = busquedaDebounced.length >= BUSQUEDA_MIN_CHARS;
        const result = esBusqueda
          ? await uc.ejecutar({ q: busquedaDebounced, limit: 50 })
          : await uc.ejecutar({ preliminar: true, limit: PRELIM_LIMIT });
        if (cancelled) return;
        if (!result?.success) {
          setTablaFilas([]);
          setTablaError(result?.error || 'No se pudo cargar la información');
          return;
        }
        setTablaFilas(Array.isArray(result.data) ? result.data : []);
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
  }, [busquedaDebounced]);

  const handleVolverLista = useCallback(() => {
    navigate(returnListPath, {
      state: menuSidebarKeyFromState ? { menuSidebarKey: menuSidebarKeyFromState } : undefined,
    });
  }, [navigate, returnListPath, menuSidebarKeyFromState]);

  const irAEstudiantes = useCallback(() => {
    navigate('/estudiantes/listar', {
      state: {
        ...(menuSidebarKeyFromState ? { menuSidebarKey: menuSidebarKeyFromState } : {}),
        returnListPath,
      },
    });
  }, [navigate, menuSidebarKeyFromState, returnListPath]);

  const irAAsignar = useCallback(
    (studentId, nombreCompleto) => {
      if (!studentId) return;
      navigate(RUTA_FORMULARIO_ASIGNAR, {
        state: {
          studentId: Number(studentId),
          ...(nombreCompleto ? { studentName: nombreCompleto } : {}),
          returnListPath,
          returnSelectionPath: location.pathname,
          ...(menuSidebarKeyFromState ? { menuSidebarKey: menuSidebarKeyFromState } : {}),
        },
      });
    },
    [navigate, returnListPath, menuSidebarKeyFromState, location.pathname]
  );

  const columnasTabla = useMemo(
    () => [
      {
        title: 'Fecha de registro',
        key: 'created_at',
        width: 168,
        render: (_, r) => (
          <Space size={6}>
            <CalendarOutlined />
            <Text>{formatFechaCreacion(r.createdAt)}</Text>
          </Space>
        ),
      },
      {
        title: 'Estudiante',
        key: 'nombre',
        render: (_, r) => (
          <Space>
            <UserOutlined />
            <div>
              <Text strong>{r.nombreCompleto ?? '—'}</Text>
              <div>
                <Space size={8} style={{ fontSize: 12 }} wrap>
                  <Text type="secondary">
                    <IdcardOutlined style={{ marginRight: 6 }} />
                    {r.codigoEstudiante ?? '—'}
                  </Text>
                  {r.ci ? (
                    <Text type="secondary">
                      <IdcardOutlined style={{ marginRight: 6 }} />
                      CI {r.ci}
                    </Text>
                  ) : null}
                </Space>
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
            {r.telefonoFijo ? (
              <div>
                <PhoneOutlined style={{ marginRight: 8 }} />
                {r.telefonoFijo}
              </div>
            ) : null}
            {!r.emailPersonal && !r.celular && !r.telefonoFijo ? (
              <div>
                <PhoneOutlined style={{ marginRight: 8 }} />
                —
              </div>
            ) : null}
          </div>
        ),
      },
      {
        title: 'Carrera',
        key: 'carrera',
        ellipsis: true,
        render: (_, r) => (
          <Space size={6}>
            <BookOutlined />
            <span>{r.carreraNombre ?? '—'}</span>
          </Space>
        ),
      },
      {
        title: '',
        key: 'accion',
        width: 160,
        render: (_, r) => {
          const sid = r.id;
          return (
            <ActionButton
              permiso="matricula.beca.asignar"
              accion="CREAR"
              variant="primary"
              size="small"
              onClick={() => irAAsignar(sid, r.nombreCompleto)}
            >
              Asignar beca
            </ActionButton>
          );
        },
      },
    ],
    [irAAsignar]
  );

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Becas', href: '/estudiantes/becas/listar' },
      { title: 'Elegir estudiante' },
    ],
    []
  );

  const headerActions = (
    <button type="button" className="sd-btn sd-btn--outline" onClick={handleVolverLista}>
      <ArrowLeftOutlined /> Volver al listado
    </button>
  );

  const esBusquedaActiva = busquedaDebounced.length >= BUSQUEDA_MIN_CHARS;

  return (
    <PageTemplate
      header={
        <PageHeader
          title="Asignar beca — elegir estudiante"
          breadcrumbItems={breadcrumbItems}
          actions={headerActions}
        />
      }
      sidebar={null}
    >
      <div className="sd">
        <style>{`
          .becas-asignar-sel-table .ant-table-thead > tr > th {
            padding: 18px 20px !important;
          }
          .becas-asignar-sel-table .ant-table-tbody > tr > td {
            padding: 14px 20px !important;
          }
        `}</style>

        <Alert
          type="info"
          showIcon
          title="Resumen"
          description={
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ margin: 0 }}>
                La tabla muestra primero una <strong>muestra</strong> de estudiantes <strong>sin beca activa o pendiente</strong>{' '}
                en la gestión vigente. Use el buscador (desde {BUSQUEDA_MIN_CHARS} caracteres) para ampliar por email, teléfono,
                código, CI, nombre o carrera.
              </p>
              <p style={{ margin: 0 }}>
                Si no lo encuentra, vaya a{' '}
                <button
                  type="button"
                  className="sd-btn sd-btn--primary"
                  style={{ verticalAlign: 'middle' }}
                  onClick={irAEstudiantes}
                >
                  Lista de estudiantes
                </button>
                .
              </p>
            </div>
          }
        />

        <div className="sd-card">
          <div className="sd-card__head sd-card__head--cabecera">
            <span className="sd-card__title">Estudiantes</span>
          </div>
          <div className="sd-card__body" style={{ display: 'block', padding: '16px 20px' }}>
            <Input.Search
              allowClear
              placeholder="Email, teléfono, código, CI, nombre, apellidos o carrera…"
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
                ? `Búsqueda por similitud. Escriba menos de ${BUSQUEDA_MIN_CHARS} caracteres para volver a la muestra.`
                : `Muestra de hasta ${PRELIM_LIMIT} estudiantes elegibles. Escriba al menos ${BUSQUEDA_MIN_CHARS} caracteres para buscar.`}
            </Text>
            <Table
              className="becas-asignar-sel-table"
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

export default BecasAsignarSeleccion;
