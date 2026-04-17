/**
 * Buscador remoto para asociar estudiante o docente existente al crear usuario.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Form, Select, Spin, Typography } from 'antd';
import { Card } from '@atoms';
import usuarioAltaLookupRepository from '@/infrastructure/repositories/seguridad/UsuarioAltaLookupRepository.js';

const { Paragraph } = Typography;

const DEBOUNCE_MS = 380;

function labelEstudiante(e) {
  const cod = e.codigoEstudiante ?? e.codigo_estudiante ?? '';
  const nom = [e.nombres, e.apellidoPaterno, e.apellidoMaterno].filter(Boolean).join(' ');
  const ci = e.ci && e.expedicion ? `${e.ci} ${e.expedicion}` : e.ci || '';
  return [cod && `Cód. ${cod}`, nom || '—', ci && `CI ${ci}`].filter(Boolean).join(' · ');
}

function labelDocente(d) {
  const nom = [d.nombres, d.apellidoPaterno, d.apellidoMaterno].filter(Boolean).join(' ');
  const ci = d.ci && d.expedicion ? `${d.ci} ${d.expedicion}` : d.ci || '';
  return [nom || '—', ci && `CI ${ci}`].filter(Boolean).join(' · ');
}

export default function UsuarioWizardVinculoBusqueda({
  form,
  kind,
  title,
  intro,
  fieldName,
  placeholder = 'Escriba al menos 2 caracteres para buscar',
}) {
  const [options, setOptions] = useState([]);
  const [fetching, setFetching] = useState(false);
  const timerRef = useRef(null);

  const runSearch = useCallback(
    async (q) => {
      const term = String(q || '').trim();
      if (term.length < 2) {
        return;
      }
      setFetching(true);
      try {
        const rows =
          kind === 'estudiante'
            ? await usuarioAltaLookupRepository.buscarEstudiantesSinCuenta(term, 20)
            : await usuarioAltaLookupRepository.buscarDocentesSinCuenta(term, 20);
        const mapped = rows.map((row) => ({
          value: row.id,
          label: kind === 'estudiante' ? labelEstudiante(row) : labelDocente(row),
        }));
        setOptions((prev) => {
          const sid = form.getFieldValue(fieldName);
          if (sid == null) return mapped;
          if (mapped.some((m) => m.value === sid)) return mapped;
          const keep = prev.find((p) => p.value === sid);
          return keep ? [keep, ...mapped] : mapped;
        });
      } catch {
        setOptions([]);
      } finally {
        setFetching(false);
      }
    },
    [kind, form, fieldName]
  );

  const onSearch = useCallback(
    (q) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        runSearch(q);
      }, DEBOUNCE_MS);
    },
    [runSearch]
  );

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  return (
    <div className="usuario-wizard-step">
      <Card className="form-section" variant="outlined" shadow={false} headerColor="primary" title={title}>
        {intro ? (
          <Paragraph type="secondary" style={{ marginBottom: 16 }}>
            {intro}
          </Paragraph>
        ) : null}
        <Form.Item
          name={fieldName}
          preserve
          label={kind === 'estudiante' ? 'Estudiante' : 'Docente'}
          rules={[{ required: true, message: 'Seleccione un registro de la lista' }]}
        >
          <Select
            showSearch
            allowClear
            filterOption={false}
            placeholder={placeholder}
            notFoundContent={fetching ? <Spin size="small" /> : null}
            options={options}
            onSearch={onSearch}
            optionFilterProp="label"
          />
        </Form.Item>
      </Card>
    </div>
  );
}
