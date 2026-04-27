/**
 * Buscador remoto para asociar estudiante o docente existente al crear usuario.
 * Al elegir un registro rellena `vinculo_email_display` y `vinculo_nombre_display` (paso Credenciales).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Form, Input, Select, Spin, Typography } from 'antd';
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

function nombreCompletoReferencia(row) {
  if (!row) return '';
  const n = row.nombres ?? row.firstName;
  const ap = row.apellidoPaterno ?? row.lastName;
  const am = row.apellidoMaterno ?? row.motherLastName;
  return [n, ap, am].filter(Boolean).join(' ').trim();
}

function emailReferencia(row) {
  if (!row) return '';
  const e = row.emailPersonal ?? row.email_personal ?? row.personalEmail ?? '';
  return String(e).trim().toLowerCase();
}

export default function UsuarioWizardVinculoBusqueda({
  form,
  kind,
  title,
  intro,
  fieldName,
  placeholder = 'Escriba al menos 2 caracteres para buscar',
  prefillDocenteUsuario,
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
          datosVinculo: row,
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

  const onSelectChange = useCallback(
    (id, option) => {
      if (id == null || id === undefined) {
        form.setFieldsValue({ vinculo_email_display: undefined, vinculo_nombre_display: undefined });
        return;
      }
      const row = option?.datosVinculo ?? options.find((o) => o.value === id)?.datosVinculo;
      if (!row) return;
      const mail = emailReferencia(row);
      const nombre = nombreCompletoReferencia(row);
      form.setFieldsValue({
        vinculo_email_display: mail || undefined,
        vinculo_nombre_display: nombre || undefined,
      });
    },
    [form, options]
  );

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  useEffect(() => {
    if (kind !== 'docente' || fieldName !== 'docente_id' || !prefillDocenteUsuario?.docenteId) return;
    const id = Number(prefillDocenteUsuario.docenteId);
    if (!Number.isFinite(id) || id < 1) return;
    const label = [
      prefillDocenteUsuario.nombreCompleto,
      prefillDocenteUsuario.ciCompleto && `CI ${prefillDocenteUsuario.ciCompleto}`,
    ]
      .filter(Boolean)
      .join(' · ') || `Docente #${id}`;
    const opt = {
      value: id,
      label,
      datosVinculo: {
        id,
        nombres: prefillDocenteUsuario.nombreCompleto || '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        email_personal: prefillDocenteUsuario.emailPersonal || null,
      },
    };
    setOptions((prev) => (prev.some((o) => o.value === id) ? prev : [opt, ...prev]));
    const current = form.getFieldValue(fieldName);
    if (current !== id) {
      form.setFieldsValue({
        [fieldName]: id,
        vinculo_nombre_display: prefillDocenteUsuario.nombreCompleto || undefined,
        vinculo_email_display: prefillDocenteUsuario.emailPersonal || undefined,
      });
    }
  }, [kind, fieldName, prefillDocenteUsuario, form]);

  return (
    <div className="usuario-wizard-step">
      <Card className="form-section" variant="outlined" shadow={false} headerColor="primary" title={title}>
        {intro ? (
          <Paragraph type="secondary" style={{ marginBottom: 16 }}>
            {intro}
          </Paragraph>
        ) : null}
        <Form.Item name="vinculo_nombre_display" preserve hidden>
          <Input type="hidden" />
        </Form.Item>
        <Form.Item name="vinculo_email_display" preserve hidden>
          <Input type="hidden" />
        </Form.Item>
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
            onChange={onSelectChange}
            optionFilterProp="label"
          />
        </Form.Item>
      </Card>
    </div>
  );
}
