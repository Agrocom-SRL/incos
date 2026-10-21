import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createInscripcionesCapTableColumns } from '../inscripcionesTableColumns';

describe('columnas de inscripciones de capacitación', () => {
  it('la columna «Curso» renderiza título y grupo sin fallar', () => {
    const columnas = createInscripcionesCapTableColumns({});
    const curso = columnas.find((c) => c.key === 'curso');
    render(curso.render(null, { capacitacionTitulo: 'Curso de Guaraní', grupoNombre: 'mañana' }));
    expect(screen.getByText('Curso de Guaraní')).toBeTruthy();
    expect(screen.getByText('mañana')).toBeTruthy();
  });
});
