/**
 * Contratos de prueba reutilizables para las pantallas ABM de INCOS (Docentes ABM / CFG Académico).
 *
 * Las páginas de formulario, ficha y listado de catálogos comparten el mismo contrato con su hook de
 * estado (`hooks/state/`): estas funciones lo ejercen sin repetir cada prueba por entidad.
 * El hook se simula en el archivo de prueba (vi.mock + vi.fn) y se pasa aquí como `useHook`.
 *
 * Qué verifica cada contrato:
 *  - Formulario: campos de la sección, botón de guardar protegido por RBAC y que llama a `handleSubmit`,
 *    identificador de edición inválido y error de carga/envío.
 *  - Ficha: perfil con los datos, edición protegida por RBAC, id inválido, error con reintento y vacío.
 */
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'antd';
import { renderWithProviders, permiso } from './renderWithProviders';

const breadcrumbItems = [{ title: 'Inicio' }, { title: 'Pantalla' }];

/**
 * @param {object} cfg
 * @param {import('react').ComponentType} cfg.Page - página de formulario (acepta `mode`).
 * @param {import('vitest').Mock} cfg.useHook - mock del hook `useXForm`.
 * @param {string} cfg.permisoCodigo - código RBAC del guardar.
 * @param {string} cfg.saveLabel - texto del botón de guardar.
 * @param {string} cfg.invalidTitle - alerta del id de edición inválido.
 * @param {string} cfg.sectionKey - clave de `formSections` (p. ej. `datosActividad`).
 * @param {string} [cfg.fieldLabel='Nombre'] - etiqueta del campo de prueba.
 * @param {object} [cfg.extraState] - campos adicionales que devuelve el hook.
 */
export function describeFormPage({
  name,
  Page,
  useHook,
  permisoCodigo,
  saveLabel,
  invalidTitle,
  sectionKey,
  fieldLabel = 'Nombre',
  extraState = {},
}) {
  const Montar = (props) => {
    const [form] = Form.useForm();
    useHook.mockReturnValue({
      form,
      pageTitle: 'Título de la pantalla',
      breadcrumbItems,
      permisoAccion: 'CREAR',
      loading: false,
      submitLoading: false,
      error: null,
      initialValues: {},
      formSections: {
        [sectionKey]: { title: 'Sección de datos', description: 'Descripción', fields: [{ name: 'nombre', label: fieldLabel, type: 'input' }] },
      },
      handleVolver: vi.fn(),
      handleSubmit: vi.fn(),
      isInvalidEditId: false,
      ...extraState,
      ...props,
    });
    return <Page />;
  };

  describe(`${name} (contrato de formulario)`, () => {
    it('muestra los campos de la sección y guarda solo con el permiso de la acción', async () => {
      const handleSubmit = vi.fn();
      const { unmount } = renderWithProviders(<Montar handleSubmit={handleSubmit} />, {
        auth: { permisos: [permiso(permisoCodigo, 'CREAR')] },
      });
      expect(screen.getByText(fieldLabel)).toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: new RegExp(saveLabel) }));
      expect(handleSubmit).toHaveBeenCalledTimes(1);
      unmount();

      renderWithProviders(<Montar />, { auth: { permisos: [permiso(permisoCodigo, 'EDITAR')] } });
      expect(screen.queryByRole('button', { name: new RegExp(saveLabel) })).not.toBeInTheDocument();
    });

    it('en edición el permiso exigido es EDITAR', () => {
      renderWithProviders(<Montar permisoAccion="EDITAR" />, { auth: { permisos: [permiso(permisoCodigo, 'EDITAR')] } });
      expect(screen.getByRole('button', { name: new RegExp(saveLabel) })).toBeInTheDocument();
    });

    it('identificador de edición inválido muestra la alerta y no el formulario', () => {
      renderWithProviders(<Montar isInvalidEditId />, { auth: { permisos: [permiso(permisoCodigo, 'CREAR')] } });
      expect(screen.getByText(invalidTitle)).toBeInTheDocument();
      expect(screen.queryByText(fieldLabel)).not.toBeInTheDocument();
    });

    it('muestra el error de carga o envío', () => {
      renderWithProviders(<Montar error="No se pudo cargar" />);
      expect(screen.getByText('No se pudo cargar')).toBeInTheDocument();
    });
  });
}

/**
 * @param {object} cfg
 * @param {import('react').ComponentType} cfg.Page - página de ficha.
 * @param {import('vitest').Mock} cfg.useHook - mock del hook `useXDetallePage`.
 * @param {string} cfg.entityKey - clave de la entidad en el estado (p. ej. `actividad`).
 * @param {object} cfg.entity - entidad de ejemplo.
 * @param {string} cfg.title - texto visible de la entidad (nombre/título del perfil).
 * @param {string} cfg.invalidTitle - alerta de id inválido.
 * @param {string} cfg.emptyText - descripción del estado vacío.
 * @param {string} cfg.permisoCodigo - código RBAC de edición.
 * @param {string} cfg.editLabel - aria-label del botón de editar del perfil.
 * @param {object} [cfg.extraState]
 */
export function describeDetailPage({
  name,
  Page,
  useHook,
  entityKey,
  entity,
  title,
  invalidTitle,
  emptyText,
  permisoCodigo,
  editLabel,
  extraState = {},
}) {
  const estado = (extra = {}) => ({
    [entityKey]: entity,
    loading: false,
    error: null,
    isInvalidId: false,
    avatarInitials: 'XX',
    breadcrumbItems,
    handleVolver: vi.fn(),
    handleEditar: vi.fn(),
    handleEliminar: vi.fn(),
    refetch: vi.fn(),
    ...extraState,
    ...extra,
  });

  describe(`${name} (contrato de ficha)`, () => {
    it('muestra el perfil y la edición solo con permiso EDITAR', async () => {
      const s = estado();
      useHook.mockReturnValue(s);
      const { unmount } = renderWithProviders(<Page />, { auth: { permisos: [permiso(permisoCodigo, 'EDITAR')] } });
      expect(screen.getAllByText(title).length).toBeGreaterThan(0);
      await userEvent.click(screen.getByRole('button', { name: editLabel }));
      expect(s.handleEditar).toHaveBeenCalledTimes(1);
      unmount();

      renderWithProviders(<Page />);
      expect(screen.queryByRole('button', { name: editLabel })).not.toBeInTheDocument();
    });

    it('identificador inválido', () => {
      useHook.mockReturnValue(estado({ [entityKey]: null, isInvalidId: true }));
      renderWithProviders(<Page />);
      expect(screen.getByText(invalidTitle)).toBeInTheDocument();
    });

    it('error con reintento', async () => {
      const s = estado({ [entityKey]: null, error: 'Falla del servidor' });
      useHook.mockReturnValue(s);
      renderWithProviders(<Page />);
      expect(screen.getByText(/Falla del servidor/)).toBeInTheDocument();
      const reintentar = screen.queryByRole('button', { name: /Reintentar/ });
      if (reintentar) {
        await userEvent.click(reintentar);
        expect(s.refetch).toHaveBeenCalled();
      }
    });

    it('entidad inexistente muestra el estado vacío', () => {
      useHook.mockReturnValue(estado({ [entityKey]: null }));
      renderWithProviders(<Page />);
      expect(screen.getByText(emptyText)).toBeInTheDocument();
    });
  });
}

/**
 * Contrato de las pantallas de listado de catálogos (hook de contexto + TableListView).
 *
 * @param {object} cfg
 * @param {import('react').ComponentType<any>} cfg.Page
 * @param {import('vitest').Mock} cfg.useHook - mock del hook `useXContext`.
 * @param {string} cfg.itemsKey - clave del arreglo en el estado (p. ej. `aulas`).
 * @param {object} cfg.record - registro de ejemplo.
 * @param {string} cfg.recordText - texto visible esperado del registro.
 * @param {string} cfg.permisoCodigo - RBAC de CREAR.
 * @param {string} cfg.newLabel - texto del botón de alta.
 * @param {string} cfg.searchPlaceholder - placeholder del buscador.
 * @param {boolean} [cfg.embedded=false] - la página admite `embedded` y oculta su cabecera.
 */
export function describeCatalogListPage({
  name,
  Page,
  useHook,
  itemsKey,
  record,
  recordText,
  permisoCodigo,
  newLabel,
  searchPlaceholder,
  embedded = false,
}) {
  const estado = (extra = {}) => ({
    [itemsKey]: [record],
    loading: false,
    error: null,
    searchText: '',
    setSearchText: vi.fn(),
    refetch: vi.fn(),
    toggleEstado: vi.fn(),
    ...extra,
  });

  describe(`${name} (contrato de listado)`, () => {
    it('lista los registros del contexto', () => {
      useHook.mockReturnValue(estado());
      renderWithProviders(<Page />);
      expect(screen.getByText(recordText)).toBeInTheDocument();
    });

    it('buscar actualiza el texto del contexto', async () => {
      const s = estado();
      useHook.mockReturnValue(s);
      renderWithProviders(<Page />);
      await userEvent.type(screen.getByPlaceholderText(searchPlaceholder), 'a');
      expect(s.setSearchText).toHaveBeenCalledWith('a');
    });

    it('el botón de alta exige CREAR', () => {
      useHook.mockReturnValue(estado());
      const { unmount } = renderWithProviders(<Page />);
      expect(screen.queryByRole('button', { name: new RegExp(newLabel) })).not.toBeInTheDocument();
      unmount();
      renderWithProviders(<Page />, { auth: { permisos: [permiso(permisoCodigo, 'CREAR')] } });
      expect(screen.getByRole('button', { name: new RegExp(newLabel) })).toBeInTheDocument();
    });

    it('sin registros y con error', () => {
      useHook.mockReturnValue(estado({ [itemsKey]: [], error: 'Falla de red' }));
      renderWithProviders(<Page />);
      expect(screen.getByText(/Falla de red/)).toBeInTheDocument();
      expect(screen.queryByText(recordText)).not.toBeInTheDocument();
    });

    if (embedded) {
      it('embebida no repite el encabezado con el botón de alta', () => {
        useHook.mockReturnValue(estado());
        renderWithProviders(<Page embedded />, { auth: { permisos: [permiso(permisoCodigo, 'CREAR')] } });
        expect(screen.queryByRole('button', { name: new RegExp(newLabel) })).not.toBeInTheDocument();
      });
    }
  });
}
