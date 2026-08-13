/**
 * PagosRegistrarSeleccion — Paso previo al registro de cuota desde listados de aportes.
 * Muestra inicial y búsqueda comparten el mismo endpoint y la misma tabla de columnas.
 *
 * Atomic Design: Page
 * - Shell alineado al ABM de referencia (EstudiantesAsignarBeca / ParaleloFormPage):
 *   PageHeaderArea (PageHeader + BackButton) + DashboardPageShell + MainContent.
 * - El contenido vive en una tarjeta `CfgFormWorkspace` de una sola sección:
 *   buscador con debounce + tabla de estudiantes con saldo de aporte.
 * - También se sirve por la ruta legacy `/pagos/registrar/seleccionar-estudiante`
 *   (dominio Finanzas): `returnListPath`/`menuSidebarKey` se conservan intactos.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, Flex, Input, Table, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { BackButton, Button } from '@atoms';
import { CfgFormWorkspace } from '@organisms';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import { useCasesFactory } from '@container';
import { createPagosSeleccionEstudianteTableColumns } from '@pagos/config/pagosSeleccionEstudianteTableColumns';
import '@configuracion/academico/styles/academico-form-page.css';

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

  // Breadcrumb con jerarquía de dominio (patrón de Matrícula); el retorno a la
  // lista respeta la lista de origen (matrícula/aportes o finanzas legacy).
  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Matrícula' },
      { title: 'Aportes de matrícula', href: returnListPath },
      { title: 'Seleccionar estudiante' },
    ],
    [returnListPath]
  );

  const esBusquedaActiva = busquedaDebounced.length >= BUSQUEDA_MIN_CHARS;

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader
          title="Registrar pago de aporte"
          breadcrumbItems={breadcrumbItems}
          actions={
            <BackButton icon={<ArrowLeftOutlined />} onClick={handleVolverLista}>
              Volver
            </BackButton>
          }
        />
      </PageHeaderArea>

      <DashboardPageShell>
        <MainContent>
          <Flex vertical gap="middle" className="cfg-academico-page__stack">
            {hayAporteCubierto ? (
              <Alert
                type="warning"
                showIcon
                title="Aporte ya cubierto"
                description="Algún resultado corresponde a un estudiante cuyo aporte académico ya no tiene saldo pendiente. No podrá registrar otra cuota desde aquí para ese caso."
              />
            ) : null}

            <CfgFormWorkspace
              title="Seleccionar estudiante"
              description="Busque al estudiante por cédula, código o nombre y selecciónelo para registrar su aporte."
              sections={[
                {
                  key: 'busqueda',
                  children: (
                    <Flex vertical gap="small">
                      <Input.Search
                        allowClear
                        placeholder="Email, teléfono, código, CI, nombre, apellidos o carrera…"
                        value={busquedaInput}
                        onChange={(e) => setBusquedaInput(e.target.value)}
                        loading={tablaLoading}
                      />
                      <Text type="secondary">
                        {esBusquedaActiva
                          ? `Búsqueda por similitud. Escriba menos de ${BUSQUEDA_MIN_CHARS} caracteres para volver a la muestra con saldo.`
                          : `Muestra de hasta ${PRELIM_LIMIT} estudiantes con saldo pendiente. Escriba al menos ${BUSQUEDA_MIN_CHARS} caracteres para buscar.`}
                      </Text>
                      {tablaError ? (
                        <Alert
                          type="error"
                          showIcon
                          title="No se pudo cargar la lista de estudiantes"
                          description={String(tablaError)}
                        />
                      ) : null}
                      <Table
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
                      <Flex align="center" gap="small" wrap>
                        <Text type="secondary">¿No encuentra al estudiante?</Text>
                        <Button type="link" size="small" onClick={irAEstudiantes}>
                          Ir a la lista de estudiantes
                        </Button>
                      </Flex>
                    </Flex>
                  ),
                },
              ]}
            />
          </Flex>
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default PagosRegistrarSeleccion;
