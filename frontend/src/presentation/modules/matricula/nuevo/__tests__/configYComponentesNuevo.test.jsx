import { useEffect } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'antd';
import { ADMISSION_TYPE_COLORS, getAdmissionTypeColors, getAdmissionTypeTagStyle } from '../config/admissionTypeColors';
import { createEstudianteWizardSteps } from '../config/estudianteWizardSteps';
import { createEstudianteContactoEmergenciaFields, createCamposContactoEmergencia, createCamposContactosEmergenciaDinamicos } from '../config/estudianteContactoEmergenciaFields';
import { createCamposDocumentacionDinamicos, createEstudianteDocumentacionFields } from '../config/estudianteDocumentacionFields';
import { createEstudianteContactoFields } from '../config/estudianteContactoFields';
import { createEstudianteDatosAcademicosInicialesFields } from '../config/estudianteDatosAcademicosInicialesFields';
import { createEstudianteDatosPersonalesFields } from '../config/estudianteDatosPersonalesFields';
import { createEstudianteDiscapacidadFields } from '../config/estudianteDiscapacidadFields';
import { createEstudianteGeograficosFields } from '../config/estudianteGeograficosFields';
import { createEstudianteTransitabilidadFields } from '../config/estudianteTransitabilidadFields';
import { createEstudianteTraspasoFields } from '../config/estudianteTraspasoFields';
import TipoAdmisionSelectionSection from '../components/organisms/TipoAdmisionSelectionSection';
import EstudianteTipoAdmisionStepContent from '../components/organisms/EstudianteTipoAdmisionStepContent';
import GestionSelectionSection from '../components/organisms/GestionSelectionSection';
import EstudianteDatosAcademicosStepContent from '../components/organisms/EstudianteDatosAcademicosStepContent';
import DocumentacionStepContent from '../components/organisms/DocumentacionStepContent';

/** Aplana los campos de una sección, entrando en subsecciones. */
const camposPlanos = (fields = []) => fields.flatMap((f) => (f.type === 'subsection' ? camposPlanos(f.fields) : [f]));

const conForm = (ui, initialValues) => {
  let formRef;
  const Wrapper = () => {
    const [form] = Form.useForm();
    useEffect(() => {
      formRef = form;
    }, [form]);
    return <Form form={form} initialValues={initialValues}>{ui(form)}</Form>;
  };
  const view = render(<Wrapper />);
  return { ...view, getForm: () => formRef };
};

describe('colores por tipo de admisión', () => {
  it('cada tipo tiene color y fondo; desconocido y vacío usan el neutro', () => {
    ['NUEVO', 'ANTIGUO', 'TRASPASO', 'TRANSITABILIDAD'].forEach((t) => {
      expect(getAdmissionTypeColors(t)).toBe(ADMISSION_TYPE_COLORS[t]);
      expect(getAdmissionTypeColors(t.toLowerCase())).toBe(ADMISSION_TYPE_COLORS[t]);
    });
    expect(getAdmissionTypeColors('XYZ')).toBe(ADMISSION_TYPE_COLORS.default);
    expect(getAdmissionTypeColors()).toBe(ADMISSION_TYPE_COLORS.default);
  });

  it('el estilo del tag trae fondo, texto y borde translúcido', () => {
    expect(getAdmissionTypeTagStyle('NUEVO')).toEqual({ backgroundColor: '#dcfce7', color: '#16a34a', border: '1px solid #16a34a26' });
  });
});

describe('configuración de campos del registro de estudiantes', () => {
  const fabricas = {
    datosPersonales: [createEstudianteDatosPersonalesFields, 'datosPersonales'],
    contacto: [createEstudianteContactoFields, 'contacto'],
    geograficos: [createEstudianteGeograficosFields, 'geograficos'],
    discapacidad: [createEstudianteDiscapacidadFields, 'discapacidad'],
    datosAcademicosIniciales: [createEstudianteDatosAcademicosInicialesFields, 'datosAcademicosIniciales'],
  };

  it.each(Object.entries(fabricas))('%s: título, campos con nombre/tipo/ancho válidos y obligatorios con etiqueta', (_n, [fabrica, clave]) => {
    const seccion = fabrica()[clave];
    expect(seccion.title).toBeTruthy();
    const campos = camposPlanos(seccion.fields).filter((c) => !c.hidden && c.type !== 'hidden');
    expect(campos.length).toBeGreaterThan(0);
    campos.forEach((c) => {
      expect(c.name, JSON.stringify(c)).toBeTruthy();
      expect(c.type).toBeTruthy();
      if (c.span != null) expect(c.span).toBeLessThanOrEqual(24);
      if (c.required && c.type !== 'button') expect(c.label, String(c.name)).toBeTruthy();
      if (c.type === 'select') expect(typeof c.options === 'string' || Array.isArray(c.options)).toBe(true);
    });
  });

  it('nombres de campo únicos a nivel de sección (las subsecciones condicionales reutilizan nombres excluyentes)', () => {
    Object.values(fabricas).forEach(([fabrica, clave]) => {
      const nombres = fabrica()[clave].fields.filter((c) => c.type !== 'subsection').map((c) => JSON.stringify(c.name));
      expect(new Set(nombres).size, clave).toBe(nombres.length);
    });
  });

  it('datos personales: CI y tipo de admisión obligatorios, expedición opcional', () => {
    const campos = createEstudianteDatosPersonalesFields().datosPersonales.fields;
    expect(campos.find((c) => c.name === 'ci')).toMatchObject({ required: true, maxLength: 15 });
    expect(campos.find((c) => c.name === 'expedicionId')).toMatchObject({ required: false, options: 'expediciones' });
  });

  it('datos académicos iniciales: gestión y carrera obligatorias', () => {
    const campos = createEstudianteDatosAcademicosInicialesFields().datosAcademicosIniciales.fields;
    expect(campos.map((c) => c.name)).toEqual(['gestionIngresoId', 'carreraId']);
    expect(campos.every((c) => c.required)).toBe(true);
  });

  it('los idiomas se excluyen mutuamente', () => {
    const campos = createEstudianteGeograficosFields().geograficos.fields;
    expect(campos.find((c) => c.name === 'idiomaMaternoId').excludeFrom).toBe('idiomaSecundarioId');
    expect(campos.find((c) => c.name === 'idiomaSecundarioId').excludeFrom).toBe('idiomaMaternoId');
  });

  it('transitabilidad y traspaso exponen la sección de formación académica', () => {
    const t = createEstudianteTransitabilidadFields().formacionAcademica;
    const p = createEstudianteTraspasoFields().formacionAcademica;
    [t, p].forEach((s) => {
      expect(s.title).toBeTruthy();
      expect(camposPlanos(s.fields).length).toBeGreaterThan(0);
    });
  });
});

describe('contacto de emergencia dinámico', () => {
  it('los campos de un contacto usan la ruta contactosEmergencia[i] y un id oculto', () => {
    const campos = createCamposContactoEmergencia(2);
    expect(campos[0]).toMatchObject({ name: ['contactosEmergencia', 2, 'id'], hidden: true });
    expect(campos.map((c) => c.name[2])).toEqual(['id', 'tipoParentescoId', 'viveConEstudiante', 'nombres', 'apellidos', 'celular1', 'celular2']);
    expect(createCamposContactoEmergencia()[1].name[1]).toBe(0);
  });

  it('el primer contacto no se puede eliminar; los demás sí, y al final hay un botón de agregar', () => {
    const eliminar = vi.fn();
    const agregar = vi.fn();
    const campos = createCamposContactosEmergenciaDinamicos([0, 5, 7], eliminar, agregar);
    expect(campos).toHaveLength(4);
    expect(campos[0]).toMatchObject({ subsectionTitle: 'Contacto de emergencia 1', showDeleteButton: false, onDelete: null });
    expect(campos[1]).toMatchObject({ subsectionTitle: 'Contacto de emergencia 2', subsectionIndex: 5, showDeleteButton: true });
    campos[2].onDelete();
    expect(eliminar).toHaveBeenCalledWith(7);
    expect(campos[3]).toMatchObject({ type: 'button', buttonText: 'Agregar otro contacto de emergencia' });
    campos[3].onClick();
    expect(agregar).toHaveBeenCalled();
  });

  it('la sección base está vacía (los campos se generan dinámicamente)', () => {
    expect(createEstudianteContactoEmergenciaFields().contactoEmergencia.fields).toEqual([]);
  });
});

describe('documentación dinámica', () => {
  it('sin documentos devuelve vacío y la sección base no define campos', () => {
    expect(createCamposDocumentacionDinamicos()).toEqual([]);
    expect(createCamposDocumentacionDinamicos([])).toEqual([]);
    expect(createEstudianteDocumentacionFields().documentacion.fields).toEqual([]);
  });

  it('un campo por documento con ruta doc_<id>, sin duplicados', () => {
    const campos = createCamposDocumentacionDinamicos([
      { id: 1, name: 'Cédula', required: true, acceptsPhotocopy: true, entregado: true },
      { id: 1, name: 'Duplicada' },
      { id: 2, name: 'Foto', description: 'Fondo celeste', observaciones: 'x' },
    ]);
    expect(campos).toHaveLength(2);
    expect(campos[0]).toMatchObject({ name: ['documentacion', 'doc_1'], type: 'documento', required: true, documento: { id: 1, name: 'Cédula', acceptsPhotocopy: true, entregado: true, description: null } });
    expect(campos[1].documento).toMatchObject({ description: 'Fondo celeste', observaciones: 'x', required: false, en_tramite: false });
  });
});

describe('pasos del wizard de registro', () => {
  it('define los pasos en el orden del flujo con sus secciones', () => {
    const steps = createEstudianteWizardSteps();
    expect(steps.map((s) => s.title)).toEqual(['Tipo de admisión', 'Datos generales', 'Datos de transitabilidad', 'Datos de traspaso', 'Contacto de emergencia', 'Documentación']);
    expect(steps[0].sections).toEqual(['tipoAdmision', 'datosAcademicosIniciales']);
    expect(steps[1].sections).toEqual(['datosPersonales', 'discapacidad', 'geograficos', 'contacto']);
  });

  it('cada sección declarada en un paso tiene su configuración', () => {
    createEstudianteWizardSteps().forEach((step) => {
      step.sections.forEach((s) => expect(step.config[s], `${step.title}/${s}`).toBeDefined());
    });
  });

  it('gestión y carrera solo aparecen para antiguo, transitabilidad y traspaso; discapacidad es condicional', () => {
    const [paso0, paso1] = createEstudianteWizardSteps();
    expect(paso0.config.datosAcademicosIniciales).toMatchObject({ conditional: true, dependsOn: 'tipoAdmision', visibleWhenValue: ['ANTIGUO', 'TRANSITABILIDAD', 'TRASPASO'] });
    expect(paso1.config.discapacidad).toMatchObject({ conditional: true, dependsOn: 'tieneDiscapacidad' });
  });

  it('el modo completar conserva los mismos títulos (sin prefijos inválidos)', () => {
    expect(createEstudianteWizardSteps(true).map((s) => s.title)).toEqual(createEstudianteWizardSteps(false).map((s) => s.title));
  });
});

describe('TipoAdmisionSelectionSection', () => {
  it('muestra los cuatro tipos y NUEVO es el valor inicial', async () => {
    const { getForm } = conForm((form) => <TipoAdmisionSelectionSection form={form} title="Tipo" description="Elija" />);
    ['Nuevo', 'Antiguo', 'Transitabilidad', 'Traspaso'].forEach((t) => expect(screen.getByText(t)).toBeInTheDocument());
    expect(screen.getByText('Tipo')).toBeInTheDocument();
    expect(screen.getByText('Elija')).toBeInTheDocument();
    await waitFor(() => expect(getForm().getFieldValue('tipoAdmision')).toBe('NUEVO'));
  });

  it('cambiar de tipo notifica y limpia gestión y carrera salvo en ANTIGUO', async () => {
    const onChange = vi.fn();
    const { getForm } = conForm((form) => <TipoAdmisionSelectionSection form={form} onTipoAdmisionChange={onChange} />, { gestionIngresoId: 3, carreraId: 4 });
    await userEvent.click(screen.getByText('Antiguo'));
    expect(onChange).toHaveBeenLastCalledWith('ANTIGUO');
    expect(getForm().getFieldValue('gestionIngresoId')).toBe(3);
    await userEvent.click(screen.getByText('Traspaso'));
    expect(onChange).toHaveBeenLastCalledWith('TRASPASO');
    expect(getForm().getFieldValue('gestionIngresoId')).toBeUndefined();
    expect(getForm().getFieldValue('carreraId')).toBeUndefined();
  });

  it('sin título ni descripción no pinta cabecera', () => {
    const { container } = conForm((form) => <TipoAdmisionSelectionSection form={form} />);
    expect(container.querySelector('header')).toBeNull();
  });

  it('EstudianteTipoAdmisionStepContent fija el valor en el form y avisa al wizard', async () => {
    const onTipo = vi.fn();
    const { getForm } = conForm((form) => <EstudianteTipoAdmisionStepContent form={form} section={{ title: 'Tipo de admisión' }} onTipoAdmisionChange={onTipo} />);
    await userEvent.click(screen.getByText('Transitabilidad'));
    expect(getForm().getFieldValue('tipoAdmision')).toBe('TRANSITABILIDAD');
    expect(onTipo).toHaveBeenCalledWith('TRANSITABILIDAD');
  });
});

describe('GestionSelectionSection', () => {
  const gestiones = [{ id: 1, nombre: 'Gestión 2024', anio: 2024 }, { id: 2, name: 'Gestión 2025', anio: 2025, vigente: true }, { id: 3, anio: 2026 }];

  it('error, carga y vacío', () => {
    const a = conForm((form) => <GestionSelectionSection form={form} error="Falla" />);
    expect(screen.getByText('Error al cargar gestiones')).toBeInTheDocument();
    a.unmount();
    const b = conForm((form) => <GestionSelectionSection form={form} loading />);
    expect(screen.getByText('Cargando gestiones…')).toBeInTheDocument();
    b.unmount();
    conForm((form) => <GestionSelectionSection form={form} gestiones={[]} />);
    expect(screen.getByText('No hay gestiones disponibles')).toBeInTheDocument();
  });

  it('lista las gestiones con año y permite elegir una', async () => {
    const { getForm } = conForm((form) => <GestionSelectionSection form={form} gestiones={gestiones} tipoAdmision="NUEVO" />);
    expect(screen.getByText('Gestión 2024')).toBeInTheDocument();
    expect(screen.getByText('Gestión 2026')).toBeInTheDocument();
    expect(screen.getByText('(2025)')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Gestión 2024'));
    expect(getForm().getFieldValue('gestionIngresoId')).toBe(1);
  });

  it.each(['ANTIGUO', 'TRANSITABILIDAD', 'TRASPASO'])('preselecciona la gestión vigente para %s', async (tipo) => {
    const { getForm } = conForm((form) => <GestionSelectionSection form={form} gestiones={gestiones} tipoAdmision={tipo} />);
    await waitFor(() => expect(getForm().getFieldValue('gestionIngresoId')).toBe(2));
  });

  it('no pisa una selección previa', async () => {
    const { getForm } = conForm((form) => <GestionSelectionSection form={form} gestiones={gestiones} tipoAdmision="ANTIGUO" />, { gestionIngresoId: 1 });
    await Promise.resolve();
    expect(getForm().getFieldValue('gestionIngresoId')).toBe(1);
  });
});

describe('EstudianteDatosAcademicosStepContent', () => {
  const section = { title: 'Datos académicos iniciales', description: 'Elija', fields: [{ name: 'carreraId' }] };
  const carreras = [{ id: 1, nombre: 'Sistemas', codigo: 'SIS', colorHex: '#123456' }];

  it('para NUEVO solo pide la carrera', () => {
    conForm((form) => <EstudianteDatosAcademicosStepContent form={form} section={section} carreras={carreras} gestiones={[{ id: 1, nombre: 'G1' }]} />, { tipoAdmision: 'NUEVO' });
    expect(screen.getByText('Carrera')).toBeInTheDocument();
    expect(screen.queryByText('Gestión de ingreso')).not.toBeInTheDocument();
  });

  it('para ANTIGUO pide también la gestión de ingreso', async () => {
    conForm((form) => (
      <>
        <Form.Item name="tipoAdmision" hidden><input /></Form.Item>
        <EstudianteDatosAcademicosStepContent form={form} section={section} carreras={carreras} gestiones={[{ id: 1, nombre: 'G1' }]} />
      </>
    ), { tipoAdmision: 'ANTIGUO' });
    expect(screen.getByText('Carrera')).toBeInTheDocument();
    expect(await screen.findByText('Gestión de ingreso')).toBeInTheDocument();
    expect(screen.getByText('G1')).toBeInTheDocument();
  });

  it('sin campo carreraId en la sección no muestra el selector de carrera', () => {
    conForm((form) => <EstudianteDatosAcademicosStepContent form={form} section={{ title: 'X', fields: [] }} />, { tipoAdmision: 'NUEVO' });
    expect(screen.queryByText('Carrera')).not.toBeInTheDocument();
  });
});

describe('DocumentacionStepContent', () => {
  const docs = [
    { id: 1, nombre: 'Cédula', name: 'Cédula', tipoDocumento: 'INSCRIPCION', requerido: true },
    { id: 2, nombre: 'Certificado de traspaso', name: 'Certificado de traspaso', tipoDocumento: 'TRASPASO' },
  ];

  it('muestra la sección con las observaciones del estudiante', () => {
    conForm((form) => <DocumentacionStepContent form={form} documentacionRaw={docs} section={{ title: 'Documentación requerida', description: 'Marque' }} />);
    expect(screen.getByText('Documentación requerida')).toBeInTheDocument();
    expect(screen.getByText('Observaciones')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ingrese observaciones adicionales/)).toBeInTheDocument();
  });

  it('para traspaso incluye los documentos de traspaso; para el resto los excluye', () => {
    const traspaso = conForm((form) => (
      <DocumentacionStepContent form={form} documentacionRaw={docs.slice(0, 1)} documentacionTraspasoRaw={docs.slice(1)} tipoAdmisionForSteps="TRASPASO" />
    ));
    expect(document.body.textContent).toContain('Certificado de traspaso');
    traspaso.unmount();
    conForm((form) => <DocumentacionStepContent form={form} documentacionRaw={docs} tipoAdmisionForSteps="NUEVO" />);
    expect(document.body.textContent).not.toContain('Certificado de traspaso');
  });
});
