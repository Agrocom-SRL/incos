/**
 * Buscador remoto para asociar estudiante o docente existente al crear usuario.
 * Al elegir un registro rellena `vinculo_email_display` y `vinculo_nombre_display` (paso Credenciales).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Form, Input } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { FormSection } from '@molecules';
import { Text } from '@atoms';
import UsuarioFormSection from './UsuarioFormSection.jsx';
import usuarioAltaLookupRepository from '@/infrastructure/repositories/seguridad/UsuarioAltaLookupRepository.js';
import { buildFullName } from '@application/utils/formatters';

const DEBOUNCE_MS = 380;

function labelEstudiante(e) {
  const cod = e.codigoEstudiante ?? e.codigo_estudiante ?? '';
  const nom = buildFullName(e.nombres, e.apellidoPaterno, e.apellidoMaterno, '');
  const ci = e.ci && e.expedicion ? `${e.ci} ${e.expedicion}` : e.ci || '';
  return [cod && `Cód. ${cod}`, nom || '—', ci && `CI ${ci}`].filter(Boolean).join(' · ');
}

function labelDocente(d) {
  const nom = buildFullName(d.nombres, d.apellidoPaterno, d.apellidoMaterno, '');
  const ci = d.ci && d.expedicion ? `${d.ci} ${d.expedicion}` : d.ci || '';
  return [nom || '—', ci && `CI ${ci}`].filter(Boolean).join(' · ');
}

function nombreCompletoReferencia(row) {
  if (!row) return '';
  const n = row.nombres ?? row.firstName;
  const ap = row.apellidoPaterno ?? row.lastName;
  const am = row.apellidoMaterno ?? row.motherLastName;
  return buildFullName(n, ap, am, '').trim();
}

function emailReferencia(row) {
  if (!row) return '';
  const e = row.emailPersonal ?? row.email_personal ?? row.personalEmail ?? '';
  return String(e).trim().toLowerCase();
}

function ciCompletoReferencia(row) {
  if (!row) return '';
  if (row.ci && row.expedicion) return `${row.ci} ${row.expedicion}`;
  return row.ci || '';
}

function codigoReferencia(row) {
  if (!row) return '';
  return row.codigoEstudiante ?? row.codigo_estudiante ?? '';
}

export default function UsuarioWizardVinculoBusqueda({
  form,
  kind,
  title,
  intro,
  fieldName,
  placeholder = 'Escriba al menos 2 caracteres para buscar',
  prefillDocenteUsuario,
  prefillEstudianteUsuario,
  isEditMode = false,
}) {
  const selectedFieldValue = Form.useWatch(fieldName, form);
  const [rows, setRows] = useState([]);
  const [fetching, setFetching] = useState(false);
  const timerRef = useRef(null);

  const runSearch = useCallback(
    async (q) => {
      const term = String(q || '').trim();
      if (term.length < 2) {
        setRows([]);
        return;
      }
      setFetching(true);
      try {
        const resultRows =
          kind === 'estudiante'
            ? await usuarioAltaLookupRepository.buscarEstudiantesSinCuenta(term, 20)
            : await usuarioAltaLookupRepository.buscarDocentesSinCuenta(term, 20);
        setRows(Array.isArray(resultRows) ? resultRows : []);
      } catch {
        setRows([]);
      } finally {
        setFetching(false);
      }
    },
    [kind]
  );

  const onSearch = useCallback(
    (q) => {
      if (isEditMode) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        runSearch(q);
      }, DEBOUNCE_MS);
    },
    [runSearch, isEditMode]
  );

  const onSelectRow = useCallback(
    (row) => {
      if (isEditMode || !row?.id) return;
      const mail = emailReferencia(row);
      const nombre = nombreCompletoReferencia(row);
      form.setFieldsValue({
        [fieldName]: Number(row.id),
        vinculo_email_display: mail || undefined,
        vinculo_nombre_display: nombre || undefined,
        vinculo_ci_display: ciCompletoReferencia(row) || undefined,
        vinculo_codigo_display: codigoReferencia(row) || undefined,
      });
    },
    [fieldName, form, isEditMode]
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
      id,
      nombres: prefillDocenteUsuario.nombreCompleto || '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      email_personal: prefillDocenteUsuario.emailPersonal || null,
      ci: prefillDocenteUsuario.ciCompleto || null,
      etiqueta_prefill: label,
    };
    setRows((prev) => (prev.some((o) => Number(o.id) === id) ? prev : [opt, ...prev]));
    const current = form.getFieldValue(fieldName);
    if (current !== id) {
      form.setFieldsValue({
        [fieldName]: id,
        vinculo_nombre_display: prefillDocenteUsuario.nombreCompleto || undefined,
        vinculo_email_display: prefillDocenteUsuario.emailPersonal || undefined,
        vinculo_ci_display: prefillDocenteUsuario.ciCompleto || undefined,
        vinculo_codigo_display: undefined,
      });
    }
  }, [kind, fieldName, prefillDocenteUsuario, form]);

  useEffect(() => {
    if (kind !== 'estudiante' || fieldName !== 'estudiante_id' || !prefillEstudianteUsuario?.estudianteId) return;
    const id = Number(prefillEstudianteUsuario.estudianteId);
    if (!Number.isFinite(id) || id < 1) return;
    const label = [
      prefillEstudianteUsuario.codigo && `Cód. ${prefillEstudianteUsuario.codigo}`,
      prefillEstudianteUsuario.nombreCompleto,
      prefillEstudianteUsuario.ciCompleto && `CI ${prefillEstudianteUsuario.ciCompleto}`,
    ]
      .filter(Boolean)
      .join(' · ') || `Estudiante #${id}`;
    const opt = {
      id,
      nombres: prefillEstudianteUsuario.nombreCompleto || '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      codigo_estudiante: prefillEstudianteUsuario.codigo || null,
      email_personal: prefillEstudianteUsuario.emailPersonal || null,
      ci: prefillEstudianteUsuario.ciCompleto || null,
      etiqueta_prefill: label,
    };
    setRows((prev) => (prev.some((o) => Number(o.id) === id) ? prev : [opt, ...prev]));
    const current = form.getFieldValue(fieldName);
    if (current !== id) {
      form.setFieldsValue({
        [fieldName]: id,
        vinculo_nombre_display: prefillEstudianteUsuario.nombreCompleto || undefined,
        vinculo_email_display: prefillEstudianteUsuario.emailPersonal || undefined,
        vinculo_ci_display: prefillEstudianteUsuario.ciCompleto || undefined,
        vinculo_codigo_display: prefillEstudianteUsuario.codigo || undefined,
      });
    }
  }, [kind, fieldName, prefillEstudianteUsuario, form]);

  const selectedId = Number(selectedFieldValue || 0);
  const isEstudiante = kind === 'estudiante';
  const selectedRow = rows.find((row) => Number(row.id) === selectedId) || null;

  const buildListItem = useCallback(
    (row) => {
      const title = row.etiqueta_prefill || (isEstudiante ? labelEstudiante(row) : labelDocente(row));
      const extra = [];
      if (row.ci && row.expedicion) extra.push(`CI: ${row.ci} ${row.expedicion}`);
      if (isEstudiante && (row.codigoEstudiante || row.codigo_estudiante)) {
        extra.push(`Código: ${row.codigoEstudiante ?? row.codigo_estudiante}`);
      }
      const caption = extra.length > 0 ? extra.join(' | ') : null;
      return {
        avatar: <UserOutlined />,
        title,
        caption: caption ? <Text type="secondary">{caption}</Text> : null,
      };
    },
    [isEstudiante]
  );

  const fields = [
    {
      name: `${fieldName}_search`,
      type: 'search',
      label: isEstudiante ? 'Buscar Estudiante' : 'Buscar Docente',
      placeholder,
      required: true,
      span: 24,
      allowClear: true,
      onSearch,
      disabled: isEditMode,
    },
    {
      name: `${fieldName}_results`,
      type: 'list',
      label: '',
      span: 24,
      required: false,
      items: rows,
      loading: fetching,
      emptyMessage: `No se encontraron ${isEstudiante ? 'estudiantes' : 'docentes'} sin usuario asociado.`,
      renderItem: buildListItem,
      onSelect: onSelectRow,
      selectedItem: selectedRow,
      isSelected: (item) => Number(item?.id) === selectedId,
      disabled: isEditMode,
    },
  ];

  return (
    <div className="usuario-wizard-step">
      <UsuarioFormSection title={title} description={intro}>
        <Form.Item
          name={fieldName}
          preserve
          hidden
          rules={[{ required: true, message: 'Seleccione un registro de la lista' }]}
        >
          <Input type="hidden" />
        </Form.Item>
        <Form.Item name="vinculo_nombre_display" preserve hidden>
          <Input type="hidden" />
        </Form.Item>
        <Form.Item name="vinculo_email_display" preserve hidden>
          <Input type="hidden" />
        </Form.Item>
        <Form.Item name="vinculo_ci_display" preserve hidden>
          <Input type="hidden" />
        </Form.Item>
        <Form.Item name="vinculo_codigo_display" preserve hidden>
          <Input type="hidden" />
        </Form.Item>
        <FormSection title={null} fields={fields} form={form} resolveOptions={() => []} readOnly={false} />
        <Text type="secondary">
          {isEditMode
            ? 'En edición no se permite cambiar el vínculo de referencia para mantener consistencia del usuario.'
            : 'Solo se muestran registros que todavia no tienen usuario asociado para evitar duplicar accesos.'}
        </Text>
      </UsuarioFormSection>
    </div>
  );
}
