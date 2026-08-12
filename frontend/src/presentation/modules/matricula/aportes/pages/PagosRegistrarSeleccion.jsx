/**
 * PagosRegistrarSeleccion — Paso previo al registro de cuota desde listados de aportes.
 * Muestra inicial y búsqueda comparten el mismo endpoint y la misma tabla de columnas.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, Input, Table, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { useCasesFactory } from '@container';
import { createPagosSeleccionEstudianteTableColumns } from '@pagos/config/pagosSeleccionEstudianteTableColumns';

const { Text } = Typography;

const PRELIM_LIMIT = 10;
const BUSQUEDA_DEBOUNCE_MS = 400;
const BUSQUEDA_MIN_CHARS = 2;

const PagosRegistrarSeleccion = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const returnListPath = location.state?.returnListPath || '/pagos/listar';
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
        const uc = useCasesFactory.buscarEstudiantesRegistroAporte();
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

  const hayAporteCubierto = useMemo(
    () => tablaFilas.some((r) => r?.aporteRegistro?.aporteTotalmenteCubierto),
    [tablaFilas]
  );

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

  const irARegistrar = useCallback(
    (studentId) => {
      if (!studentId) return;
      navigate('/pagos/registrar', {
        state: {
          studentId: Number(studentId),
          returnListPath,
          ...(menuSidebarKeyFromState ? { menuSidebarKey: menuSidebarKeyFromState } : {}),
        },
      });
    },
    [navigate, returnListPath, menuSidebarKeyFromState]
  );

  const columnasTabla = useMemo(
    () => createPagosSeleccionEstudianteTableColumns({ onRegistrarPago: irARegistrar }),
    [irARegistrar]
  );

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Pagos', href: '/pagos' },
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
          title="Registrar pago — elegir estudiante"
          breadcrumbItems={breadcrumbItems}
          actions={headerActions}
        />
      }
      sidebar={null}
    >
      <div className="sd">
        <style>{`
          .pagos-reg-sel-table .ant-table-thead > tr > th {
            padding: 18px 20px !important;
          }
          .pagos-reg-sel-table .ant-table-tbody > tr > td {
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
                La tabla muestra primero una <strong>muestra</strong> de estudiantes con <strong>saldo de aporte</strong>{' '}
                pendiente. Use el buscador (desde {BUSQUEDA_MIN_CHARS} caracteres) para ampliar por email, teléfono,
                código, CI, nombre o carrera.
              </p>
              <p style={{ margin: 0 }}>
                Si no lo encuentra, vaya a{' '}
                <button type="button" className="sd-btn sd-btn--primary" style={{ verticalAlign: 'middle' }} onClick={irAEstudiantes}>
                  Lista de estudiantes
                </button>
                .
              </p>
            </div>
          }
        />

        {hayAporteCubierto ? (
          <Alert
            type="warning"
            showIcon
            title="Aporte ya cubierto"
            description="Algún resultado corresponde a un estudiante cuyo aporte académico ya no tiene saldo pendiente. No podrá registrar otra cuota desde aquí para ese caso."
          />
        ) : null}

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
                ? `Búsqueda por similitud. Escriba menos de ${BUSQUEDA_MIN_CHARS} caracteres para volver a la muestra con saldo.`
                : `Muestra de hasta ${PRELIM_LIMIT} estudiantes con saldo pendiente. Escriba al menos ${BUSQUEDA_MIN_CHARS} caracteres para buscar.`}
            </Text>
            <Table
              className="pagos-reg-sel-table"
              rowKey={(r) => r.id}
              loading={tablaLoading}
              columns={columnasTabla}
              dataSource={tablaFilas}
              scroll={{ x: 'max-content' }}
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

export default PagosRegistrarSeleccion;
