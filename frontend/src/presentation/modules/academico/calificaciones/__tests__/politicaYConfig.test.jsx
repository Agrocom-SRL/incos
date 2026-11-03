/**
 * Política institucional (sliders, paneles, resumen) y configuración de columnas/campos.
 */
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'antd';
import { renderCell, findColumn, flattenColumns } from '../../../../../test/renderColumns.jsx';
import PoliticaPorcentajeSlider from '../components/PoliticaPorcentajeSlider.jsx';
import PoliticaSumaHint from '../components/PoliticaSumaHint.jsx';
import PoliticaBimestresSliders from '../components/PoliticaBimestresSliders.jsx';
import PoliticaCuotaSliders from '../components/PoliticaCuotaSliders.jsx';
import PoliticaPonderacionBimestres from '../components/PoliticaPonderacionBimestres.jsx';
import PoliticaPonderacionTeoricoPractico from '../components/PoliticaPonderacionTeoricoPractico.jsx';
import PoliticaAsistenciaPanel from '../components/PoliticaAsistenciaPanel.jsx';
import PoliticaInstitucionalSidebarResumen from '../components/PoliticaInstitucionalSidebarResumen.jsx';
import miBoletinColumns from '../config/miBoletinColumns.jsx';
import {
  createPoliticaAsistenciaFields,
  createPoliticaBimestresFields,
  createPoliticaCuotaFields,
} from '../config/politicaInstitucionalFields.js';

const flecha = (el, key = 'ArrowRight') => fireEvent.keyDown(el, { key, keyCode: key === 'ArrowRight' ? 39 : 37 });

describe('PoliticaPorcentajeSlider', () => {
  it('muestra etiqueta y valor con un decimal', () => {
    render(<PoliticaPorcentajeSlider label="Bimestre 1" value={25} />);
    expect(screen.getByText('Bimestre 1')).toBeInTheDocument();
    expect(screen.getByText('25.0%')).toBeInTheDocument();
  });

  it('valor ausente se ve como 0.0%', () => {
    render(<PoliticaPorcentajeSlider label="X" />);
    expect(screen.getByText('0.0%')).toBeInTheDocument();
  });

  it('emite onChange con el teclado y no con disabled', () => {
    const onChange = vi.fn();
    const { rerender } = render(<PoliticaPorcentajeSlider label="X" value={10} onChange={onChange} />);
    flecha(screen.getByRole('slider'));
    expect(onChange).toHaveBeenCalledWith(10.5);
    onChange.mockClear();
    rerender(<PoliticaPorcentajeSlider label="X" value={10} onChange={onChange} disabled />);
    flecha(screen.getByRole('slider'));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('PoliticaSumaHint', () => {
  it('ok cuando suma el objetivo', () => {
    render(<PoliticaSumaHint suma={100} etiquetaOk="Suma correcta" etiquetaWarn="Suma {suma}%" />);
    expect(screen.getByRole('status')).toHaveTextContent('Suma correcta');
    expect(screen.getByRole('status').className).toMatch(/ok-full/);
  });

  it('advierte y redondea la suma', () => {
    render(<PoliticaSumaHint suma={99.456} etiquetaOk="ok" etiquetaWarn="Suma {suma}% de 100" />);
    expect(screen.getByRole('status')).toHaveTextContent('Suma 99.46% de 100');
    expect(screen.getByRole('status').className).toMatch(/warn/);
  });
});

describe('sliders vinculados', () => {
  it('PoliticaBimestresSliders: 4 sliders y redistribución que suma 100', () => {
    const onChange = vi.fn();
    render(<PoliticaBimestresSliders pesos={[25, 25, 25, 25]} onChange={onChange} />);
    const sliders = screen.getAllByRole('slider');
    expect(sliders).toHaveLength(4);
    flecha(sliders[0]);
    const next = onChange.mock.calls[0][0];
    expect(next).toHaveLength(4);
    expect(next[0]).toBe(25.5);
    expect(next.reduce((a, b) => a + b, 0)).toBeCloseTo(100, 1);
  });

  it('PoliticaBimestresSliders usa pesos por defecto si la longitud no es 4', () => {
    render(<PoliticaBimestresSliders pesos={[10]} />);
    expect(screen.getAllByText('25.0%')).toHaveLength(4);
  });

  it('PoliticaCuotaSliders: teórico y práctico complementarios', () => {
    const onChange = vi.fn();
    render(<PoliticaCuotaSliders teorico={30} practico={70} onChange={onChange} />);
    const [teo, pra] = screen.getAllByRole('slider');
    flecha(teo);
    expect(onChange).toHaveBeenLastCalledWith({ cuotaTeorico: 30.5, cuotaPractico: 69.5 });
    flecha(pra);
    expect(onChange).toHaveBeenLastCalledWith({ cuotaTeorico: 29.5, cuotaPractico: 70.5 });
  });
});

describe('ponderación ligada al formulario', () => {
  const Host = ({ children, initialValues }) => {
    const [form] = Form.useForm();
    return (
      <Form form={form} initialValues={initialValues}>
        {children(form)}
        <button type="button" onClick={() => document.body.setAttribute('data-vals', JSON.stringify(form.getFieldsValue(true)))}>
          leer
        </button>
      </Form>
    );
  };
  const leer = async () => {
    await userEvent.click(screen.getByRole('button', { name: 'leer' }));
    return JSON.parse(document.body.getAttribute('data-vals'));
  };

  it('PoliticaPonderacionBimestres mueve el campo pesosBimestres', async () => {
    render(<Host>{(form) => <PoliticaPonderacionBimestres form={form} />}</Host>);
    expect(screen.getByText(/se redistribuyen proporcionalmente/)).toBeInTheDocument();
    flecha(screen.getAllByRole('slider')[1]);
    const vals = await leer();
    expect(vals.pesosBimestres[1]).toBe(25.5);
    expect(vals.pesosBimestres.reduce((a, b) => a + b, 0)).toBeCloseTo(100, 1);
  });

  it('PoliticaPonderacionTeoricoPractico: por defecto 30/70 y complementarios', async () => {
    render(<Host>{(form) => <PoliticaPonderacionTeoricoPractico form={form} />}</Host>);
    expect(screen.getByText('30.0%')).toBeInTheDocument();
    expect(screen.getByText('70.0%')).toBeInTheDocument();
    flecha(screen.getAllByRole('slider')[0]);
    const vals = await leer();
    expect(vals.cuotaTeorico + vals.cuotaPractico).toBeCloseTo(100, 1);
    expect(vals.cuotaTeorico).toBe(30.5);
  });

  it('PoliticaPonderacionTeoricoPractico: mover práctico ajusta teórico', async () => {
    render(
      <Host initialValues={{ cuotaTeorico: 40, cuotaPractico: 60 }}>
        {(form) => <PoliticaPonderacionTeoricoPractico form={form} />}
      </Host>,
    );
    flecha(screen.getAllByRole('slider')[1]);
    const vals = await leer();
    expect(vals).toMatchObject({ cuotaTeorico: 39.5, cuotaPractico: 60.5 });
  });

  describe('PoliticaAsistenciaPanel', () => {
    const renderPanel = (initial) =>
      render(<Host initialValues={initial}>{(form) => <PoliticaAsistenciaPanel form={form} />}</Host>);

    it('lista las tres políticas y sin parámetros extra por defecto', () => {
      renderPanel({ politicaAsistenciaDefault: { politica: 'NO_AFECTA' } });
      expect(screen.getByText('No influye en la nota')).toBeInTheDocument();
      expect(screen.getByText('Aporta a la nota final')).toBeInTheDocument();
      expect(screen.getByText('Reprobación por asistencia')).toBeInTheDocument();
      expect(screen.queryByText(/Parámetros —/)).not.toBeInTheDocument();
    });

    it('COMPUTA_NOTA sugiere peso 10 y limpia mínimos', async () => {
      renderPanel({ politicaAsistenciaDefault: { politica: 'NO_AFECTA', minimoAsistencia: 80 } });
      await userEvent.click(screen.getByText('Aporta a la nota final'));
      expect(screen.getByText(/aporta a la nota final/)).toBeInTheDocument();
      const vals = await leer();
      expect(vals.politicaAsistenciaDefault).toMatchObject({
        politica: 'COMPUTA_NOTA',
        pesoAsistencia: 10,
        minimoAsistencia: null,
      });
    });

    it('CAUSA_REPROBACION sugiere 75 y 51', async () => {
      renderPanel({ politicaAsistenciaDefault: { politica: 'NO_AFECTA' } });
      await userEvent.click(screen.getByText('Reprobación por asistencia'));
      expect(screen.getByText(/reprobación por inasistencia/)).toBeInTheDocument();
      const vals = await leer();
      expect(vals.politicaAsistenciaDefault).toMatchObject({
        politica: 'CAUSA_REPROBACION',
        minimoAsistencia: 75,
        notaReprobada: 51,
        pesoAsistencia: null,
      });
    });

    it('volver a NO_AFECTA limpia todos los parámetros', async () => {
      renderPanel({
        politicaAsistenciaDefault: { politica: 'COMPUTA_NOTA', pesoAsistencia: 20 },
      });
      await userEvent.click(screen.getByText('No influye en la nota'));
      const vals = await leer();
      expect(vals.politicaAsistenciaDefault).toMatchObject({
        politica: 'NO_AFECTA',
        pesoAsistencia: null,
        minimoAsistencia: null,
        notaReprobada: null,
      });
    });
  });
});

describe('PoliticaInstitucionalSidebarResumen', () => {
  it('sin política muestra el aviso', () => {
    render(<PoliticaInstitucionalSidebarResumen politica={null} />);
    expect(screen.getByText('Sin datos de configuración.')).toBeInTheDocument();
  });

  it('configurada: resumen, etiqueta de asistencia y última modificación', () => {
    render(
      <PoliticaInstitucionalSidebarResumen
        gestionVigente="2026"
        politica={{
          configurada: true,
          cuotaTeorico: 30,
          cuotaPractico: 70,
          pesosBimestres: [25, 25, 25, 25],
          politicaAsistenciaDefault: { politica: 'COMPUTA_NOTA' },
          ultimaModificacion: { updatedAt: '2026-03-01T10:00:00Z', updatedByNombre: 'Admin' },
        }}
      />,
    );
    expect(screen.getByText('2026')).toBeInTheDocument();
    expect(screen.getByText('Configuración guardada')).toBeInTheDocument();
    expect(screen.getByText('30 / 70 pts')).toBeInTheDocument();
    expect(screen.getByText('B1: 25% · B2: 25% · B3: 25% · B4: 25%')).toBeInTheDocument();
    expect(screen.getByText('Aporta a la nota final')).toBeInTheDocument();
    expect(screen.getByText(/Admin ·/)).toBeInTheDocument();
  });

  it('no configurada: etiqueta de advertencia y guía', () => {
    render(
      <PoliticaInstitucionalSidebarResumen politica={{ configurada: false, gestionNombre: 'G-25' }} />,
    );
    expect(screen.getByText('G-25')).toBeInTheDocument();
    expect(screen.getByText('Sin guardar en esta gestión')).toBeInTheDocument();
    expect(screen.getByText(/Aún no hay configuración persistida/)).toBeInTheDocument();
  });
});

describe('politicaInstitucionalFields', () => {
  it('cuota: dos campos de puntos enteros', () => {
    const f = createPoliticaCuotaFields();
    expect(f.map((x) => x.name)).toEqual(['cuotaTeorico', 'cuotaPractico']);
    expect(f.every((x) => x.precision === 0 && x.addonAfter === 'pts')).toBe(true);
  });

  it('bimestres: cuatro porcentajes con path array', () => {
    const f = createPoliticaBimestresFields();
    expect(f).toHaveLength(4);
    expect(f[2].name).toEqual(['pesosBimestres', 2]);
    expect(f[2].label).toBe('Bim. 3');
    expect(f[0].addonAfter).toBe('%');
  });

  it('asistencia: condicionales según la política', () => {
    const f = createPoliticaAsistenciaFields();
    const peso = f.find((x) => x.name[1] === 'pesoAsistencia');
    const minimo = f.find((x) => x.name[1] === 'minimoAsistencia');
    const nota = f.find((x) => x.name[1] === 'notaReprobada');
    expect(peso.showIf({ politica: 'COMPUTA_NOTA' })).toBe(true);
    expect(peso.showIf({ politica: 'NO_AFECTA' })).toBe(false);
    expect(minimo.showIf({ politica: 'CAUSA_REPROBACION' })).toBe(true);
    expect(nota.showIf(undefined)).toBe(false);
    expect(f[0].options.map((o) => o.value)).toEqual(['NO_AFECTA', 'COMPUTA_NOTA', 'CAUSA_REPROBACION']);
  });
});

describe('miBoletinColumns', () => {
  const fila = {
    asignaturaSigla: 'MAT',
    asignaturaNombre: 'Algebra',
    docenteNombre: 'Ana',
    bim1: 60,
    bim2: null,
    promedioAnual: 55,
    notaFinal: 55,
    estado: 'APROBADO',
  };

  it('define columnas de asignatura, bimestres, final y estado', () => {
    const keys = flattenColumns(miBoletinColumns).map((c) => c.key);
    expect(keys).toEqual(
      expect.arrayContaining(['asignaturaSigla', 'bim1', 'bim4', 'promedioAnual', 'notaFinal', 'estado']),
    );
  });

  it('celdas con guion cuando faltan datos', () => {
    const { container } = renderCell(findColumn(miBoletinColumns, 'bim2'), fila);
    expect(container).toHaveTextContent('—');
    const vacio = renderCell(findColumn(miBoletinColumns, 'asignaturaSigla'), {});
    expect(vacio.container).toHaveTextContent('—');
  });

  it.each([
    ['APROBADO', 'aprobado'],
    ['REPROBADO', 'reprobado'],
    ['ABANDONO', 'abandono'],
    ['CURSANDO', 'cursando'],
  ])('nota final %s lleva el modificador %s', (estado, mod) => {
    const { container } = renderCell(findColumn(miBoletinColumns, 'notaFinal'), { ...fila, estado });
    expect(container.querySelector(`.mi-boletin-grid__nota-final--${mod}`)).not.toBeNull();
  });

  it('estado desconocido no agrega modificador y sin estado muestra guion', () => {
    const a = renderCell(findColumn(miBoletinColumns, 'notaFinal'), { ...fila, estado: 'X' });
    expect(a.container.querySelector('[class*="--aprobado"]')).toBeNull();
    const b = renderCell(findColumn(miBoletinColumns, 'estado'), { ...fila, estado: '' });
    expect(b.container).toHaveTextContent('—');
    const c = renderCell(findColumn(miBoletinColumns, 'estado'), fila);
    expect(c.container).toHaveTextContent('APROBADO');
  });
});
