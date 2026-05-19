// Main Matriculados page for INCOS
const { useState: useS, useMemo, useEffect } = React;
const {
  ConfigProvider, Layout, Table, Button, Input, Select, Tag, Avatar, Tooltip,
  Dropdown, Menu, Drawer, Breadcrumb, Badge, Space, Checkbox, Pagination,
  Card, Statistic, Progress, Divider, Segmented, Empty,
} = antd;
const {
  SearchOutlined: Search2, PlusOutlined, DownloadOutlined, FilterOutlined,
  EyeOutlined, EditOutlined, DeleteOutlined, MoreOutlined, BellOutlined,
  CalendarOutlined, BookOutlined, IdcardOutlined: Id2, TagOutlined,
  RiseOutlined, FallOutlined, TeamOutlined: Team2, CheckCircleFilled,
  ClockCircleFilled, ExclamationCircleFilled, SyncOutlined, AppstoreOutlined,
  UnorderedListOutlined: List2, PrinterOutlined, MailOutlined, FileTextOutlined,
  HomeOutlined, QuestionCircleOutlined, GlobalOutlined, ArrowUpOutlined,
} = icons;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "density": "comfortable",
  "greenIntensity": "balanced",
  "showKpis": true,
  "showCareerChips": true,
  "viewMode": "table",
  "showAvatars": true
}/*EDITMODE-END*/;

const { CAREERS, MATRICULADOS, avatarFor } = window.INCOS_DATA;

// ---------- KPI Card ----------
function KpiCard({ label, value, delta, deltaLabel, icon, accent, sub }) {
  const positive = (delta || 0) >= 0;
  return (
    <div style={{
      background: "white",
      borderRadius: 14,
      padding: "18px 20px",
      border: "1px solid #eef0f2",
      flex: 1,
      display: "flex",
      flexDirection: "column",
      gap: 8,
      minWidth: 0,
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: -24, right: -24, width: 100, height: 100,
        borderRadius: "50%", background: accent, opacity: 0.06,
      }} />
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `${accent}14`, color: accent,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18,
        }}>{icon}</div>
        <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>{label}</div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <div style={{
          fontSize: 28, fontWeight: 700, color: "#0f172a",
          fontVariantNumeric: "tabular-nums", letterSpacing: -0.5,
        }}>{value}</div>
        {delta !== undefined && (
          <div style={{
            fontSize: 12, fontWeight: 600,
            color: positive ? "#16a34a" : "#dc2626",
            display: "inline-flex", alignItems: "center", gap: 3,
          }}>
            {positive ? <ArrowUpOutlined /> : <FallOutlined />}
            {Math.abs(delta)}%
          </div>
        )}
      </div>
      {sub && <div style={{ fontSize: 12, color: "#9ca3af" }}>{sub}</div>}
    </div>
  );
}

// ---------- Career chip ----------
function CareerChip({ career, count, active, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "6px 12px",
        background: active ? career.color : "white",
        color: active ? "white" : "#374151",
        border: `1px solid ${active ? career.color : "#e5e7eb"}`,
        borderRadius: 999,
        cursor: "pointer",
        fontSize: 13, fontWeight: 500,
        transition: "all 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{
        width: 8, height: 8, borderRadius: "50%",
        background: active ? "white" : career.color,
      }} />
      {career.name}
      <span style={{
        background: active ? "rgba(255,255,255,0.25)" : "#f3f4f6",
        color: active ? "white" : "#6b7280",
        padding: "1px 8px", borderRadius: 8, fontSize: 11, fontWeight: 600,
      }}>{count}</span>
    </div>
  );
}

// ---------- Student detail drawer ----------
function StudentDrawer({ student, open, onClose }) {
  if (!student) return null;
  const av = avatarFor(student.fullName);
  return (
    <Drawer
      title={null}
      width={460}
      open={open}
      onClose={onClose}
      closable={false}
      bodyStyle={{ padding: 0 }}
      headerStyle={{ display: "none" }}
    >
      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, var(--brand-700), var(--brand-500))",
        padding: "28px 24px 60px",
        color: "white",
        position: "relative",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <Tag style={{
            background: "rgba(255,255,255,0.2)", border: "none", color: "white",
            borderRadius: 999, padding: "2px 10px",
          }}>{student.tipo}</Tag>
          <Button type="text" onClick={onClose}
            style={{ color: "white" }} icon={<span style={{ fontSize: 18 }}>×</span>} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "white", color: av.color,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, fontWeight: 700,
            border: "3px solid rgba(255,255,255,0.4)",
          }}>{av.initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.2 }}>{student.fullName}</div>
            <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>
              Código {student.code} · CI {student.ci}
            </div>
          </div>
        </div>
      </div>

      {/* Floating card */}
      <div style={{ padding: "0 24px", marginTop: -36 }}>
        <div style={{
          background: "white", borderRadius: 12,
          border: "1px solid #eef0f2", padding: 16,
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12,
          boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
        }}>
          <div>
            <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>SEMESTRE</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>{student.semester}°</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>MATERIAS</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>{student.materias}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>PROMEDIO</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--brand-700)" }}>{student.avgGrade}</div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div style={{ padding: 24 }}>
        <DetailSection title="Información de inscripción">
          <DetailRow label="Carrera" value={
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: student.career.color }} />
              <strong>{student.career.name}</strong>
            </span>
          } />
          <DetailRow label="Gestión" value={student.gestion} />
          <DetailRow label="Fecha matrícula" value={student.fecha} />
          <DetailRow label="Tipo" value={<Tag color={student.isAntiguo ? "gold" : "green"}>{student.tipo}</Tag>} />
        </DetailSection>

        <DetailSection title="Estado académico">
          <DetailRow label="Historial" value={
            <Tag color={student.historyState.color}>{student.historyState.label}</Tag>
          } />
          <DetailRow label="Estado de pago" value={
            <Tag color={student.pago === "Al día" ? "green" : student.pago === "Pendiente" ? "red" : "blue"}>
              {student.pago}
            </Tag>
          } />
          <DetailRow label="Progreso del semestre" value={
            <div style={{ flex: 1 }}>
              <Progress
                percent={42}
                size="small"
                strokeColor="var(--brand-600)"
                style={{ margin: 0 }}
              />
            </div>
          } />
        </DetailSection>

        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <Button type="primary" icon={<EditOutlined />} block
            style={{ background: "var(--brand-700)", borderColor: "var(--brand-700)" }}>
            Editar inscripción
          </Button>
          <Button icon={<PrinterOutlined />}>Imprimir</Button>
          <Button icon={<MailOutlined />} />
        </div>
      </div>
    </Drawer>
  );
}

function DetailSection({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        fontSize: 11, color: "#9ca3af", fontWeight: 600,
        letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 10,
      }}>{title}</div>
      <div style={{
        background: "#fafbfc", border: "1px solid #eef0f2", borderRadius: 10,
        padding: "4px 14px",
      }}>{children}</div>
    </div>
  );
}
function DetailRow({ label, value }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 0", borderBottom: "1px solid #f0f2f4", gap: 12,
    }}>
      <div style={{ fontSize: 13, color: "#6b7280" }}>{label}</div>
      <div style={{ fontSize: 13, color: "#0f172a", textAlign: "right", flex: 1, minWidth: 0 }}>{value}</div>
    </div>
  );
}

// ---------- Avatar cell ----------
function StudentCell({ student, showAvatar }) {
  const av = avatarFor(student.fullName);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {showAvatar && (
        <div style={{
          width: 38, height: 38, borderRadius: "50%",
          background: `${av.color}15`, color: av.color,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 700, fontSize: 13, flexShrink: 0,
          border: `1.5px solid ${av.color}25`,
        }}>{av.initials}</div>
      )}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", lineHeight: 1.3 }}>
          {student.fullName}
        </div>
        <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2,
          display: "flex", gap: 12, fontVariantNumeric: "tabular-nums" }}>
          <span>#{student.code}</span>
          <span>CI {student.ci}</span>
        </div>
      </div>
    </div>
  );
}

// ---------- Top bar ----------
function TopBar({ onMenuClick }) {
  return (
    <div style={{
      height: 64,
      background: "white",
      borderBottom: "1px solid #eef0f2",
      display: "flex", alignItems: "center",
      padding: "0 28px",
      gap: 20,
    }}>
      <Button type="text" icon={<List2 />} onClick={onMenuClick}
        style={{ fontSize: 18, color: "#6b7280" }} />
      <div style={{ flex: 1, maxWidth: 460 }}>
        <Input
          prefix={<Search2 style={{ color: "#9ca3af" }} />}
          placeholder="Buscar estudiantes, códigos, carreras..."
          size="large"
          style={{ borderRadius: 10, background: "#f8fafc", border: "1px solid #eef0f2" }}
        />
      </div>
      <div style={{ flex: 1 }} />
      <Space size={4}>
        <Button type="text" icon={<QuestionCircleOutlined />}
          style={{ color: "#6b7280" }} />
        <Button type="text" icon={<GlobalOutlined />}
          style={{ color: "#6b7280" }} />
        <Badge count={3} size="small">
          <Button type="text" icon={<BellOutlined />} style={{ color: "#6b7280" }} />
        </Badge>
        <div style={{ width: 1, height: 28, background: "#eef0f2", margin: "0 8px" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>Juan Rodríguez</div>
            <div style={{ fontSize: 11, color: "#6b7280" }}>Gestión 2026</div>
          </div>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "var(--brand-100)", color: "var(--brand-700)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 13,
          }}>JR</div>
        </div>
      </Space>
    </div>
  );
}

// ---------- Page header ----------
function PageHeader({ totalSelected, onNew }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <Breadcrumb style={{ fontSize: 13, marginBottom: 8 }}
        items={[
          { title: <span style={{ color: "#9ca3af" }}><HomeOutlined /> Inicio</span> },
          { title: <span style={{ color: "#9ca3af" }}>Matrícula</span> },
          { title: <span style={{ color: "var(--brand-700)", fontWeight: 600 }}>Inscripciones</span> },
        ]} />
      <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
        <div style={{ flex: 1 }}>
          <h1 style={{
            margin: 0, fontSize: 28, fontWeight: 700, color: "#0f172a",
            letterSpacing: -0.5, lineHeight: 1.2,
          }}>Lista de Inscripciones</h1>
          <div style={{ color: "#6b7280", fontSize: 14, marginTop: 6 }}>
            Gestión 2026 · Administra las matrículas de estudiantes activos del instituto.
          </div>
        </div>
        <Space>
          <Select
            placeholder="Carrera para exportar"
            style={{ width: 220 }}
            options={CAREERS.map(c => ({ label: c.name, value: c.id }))}
            suffixIcon={<FilterOutlined />}
          />
          <Button icon={<DownloadOutlined />} size="middle">Exportar</Button>
          <Button type="primary" icon={<PlusOutlined />} size="middle" onClick={onNew}
            style={{ background: "var(--brand-700)", borderColor: "var(--brand-700)" }}>
            Nueva Inscripción
          </Button>
        </Space>
      </div>
    </div>
  );
}

// ---------- Main page ----------
function MatriculadosPage() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [collapsed, setCollapsed] = useS(false);
  const [search, setSearch] = useS("");
  const [careerFilter, setCareerFilter] = useS(null);
  const [tipoFilter, setTipoFilter] = useS("todos");
  const [historyFilter, setHistoryFilter] = useS(null);
  const [selectedRows, setSelectedRows] = useS([]);
  const [drawerStudent, setDrawerStudent] = useS(null);
  const [page, setPage] = useS(1);

  // remove unused alias


  // Apply CSS theme based on green intensity
  useEffect(() => {
    const root = document.documentElement;
    const intensities = {
      bold:     { 50: "#e8f5ee", 100: "#c8e8d4", 500: "#0a8a48", 600: "#0a7a3f", 700: "#0a6c38" },
      balanced: { 50: "#eef7f1", 100: "#d4ebdc", 500: "#157347", 600: "#0e6038", 700: "#0a4f2d" },
      subtle:   { 50: "#f3f8f4", 100: "#e3eee6", 500: "#3a8060", 600: "#2c6a4f", 700: "#1f5640" },
    };
    const c = intensities[tweaks.greenIntensity] || intensities.balanced;
    root.style.setProperty("--brand-50", c[50]);
    root.style.setProperty("--brand-100", c[100]);
    root.style.setProperty("--brand-500", c[500]);
    root.style.setProperty("--brand-600", c[600]);
    root.style.setProperty("--brand-700", c[700]);
  }, [tweaks.greenIntensity]);

  // Filter data
  const filtered = useMemo(() => {
    return MATRICULADOS.filter(s => {
      if (careerFilter && s.career.id !== careerFilter) return false;
      if (tipoFilter === "antiguos" && !s.isAntiguo) return false;
      if (tipoFilter === "nuevos" && s.isAntiguo) return false;
      if (historyFilter && s.historyState.key !== historyFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!s.fullName.toLowerCase().includes(q)
          && !s.code.includes(q)
          && !s.ci.includes(q)
          && !s.career.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [search, careerFilter, tipoFilter, historyFilter]);

  const pageSize = tweaks.density === "compact" ? 12 : 8;
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Career counts
  const careerCounts = useMemo(() => {
    const out = {};
    MATRICULADOS.forEach(s => { out[s.career.id] = (out[s.career.id] || 0) + 1; });
    return out;
  }, []);

  // Stats
  const totalCount = MATRICULADOS.length;
  const antiguosCount = MATRICULADOS.filter(s => s.isAntiguo).length;
  const nuevosCount = totalCount - antiguosCount;
  const pendientesCount = MATRICULADOS.filter(s => s.historyState.key === "pendiente").length;

  const columns = [
    {
      title: "Estudiante",
      dataIndex: "fullName",
      key: "student",
      width: 320,
      render: (_, r) => <StudentCell student={r} showAvatar={tweaks.showAvatars} />,
    },
    {
      title: "Carrera",
      dataIndex: "career",
      key: "career",
      width: 220,
      render: (_, r) => (
        <div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            fontSize: 13, fontWeight: 600, color: "#0f172a",
          }}>
            <span style={{
              width: 4, height: 18, borderRadius: 2,
              background: r.career.color,
            }} />
            {r.career.name}
          </div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4, marginLeft: 12 }}>
            {r.semester}° semestre · {r.materias} materias
          </div>
        </div>
      ),
    },
    {
      title: "Tipo",
      dataIndex: "tipo",
      key: "tipo",
      width: 110,
      render: (_, r) => (
        <Tag style={{
          margin: 0, borderRadius: 999, padding: "1px 10px",
          background: r.isAntiguo ? "#fef3c7" : "#dcfce7",
          color: r.isAntiguo ? "#92400e" : "#166534",
          border: "none", fontWeight: 600, fontSize: 11,
        }}>{r.tipo}</Tag>
      ),
    },
    {
      title: "Historial",
      key: "history",
      width: 180,
      render: (_, r) => {
        const map = {
          pendiente: { bg: "#fef3c7", color: "#92400e", icon: <ClockCircleFilled /> },
          completo:  { bg: "#dcfce7", color: "#166534", icon: <CheckCircleFilled /> },
          observado: { bg: "#fee2e2", color: "#991b1b", icon: <ExclamationCircleFilled /> },
          revision:  { bg: "#dbeafe", color: "#1e40af", icon: <SyncOutlined spin /> },
        };
        const m = map[r.historyState.key];
        return (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: m.bg, color: m.color,
            padding: "4px 10px", borderRadius: 999,
            fontSize: 12, fontWeight: 600,
          }}>
            <span style={{ fontSize: 11 }}>{m.icon}</span>
            {r.historyState.label}
          </span>
        );
      },
    },
    {
      title: "Pago",
      dataIndex: "pago",
      key: "pago",
      width: 110,
      render: (v) => (
        <span style={{
          fontSize: 12, fontWeight: 600,
          color: v === "Al día" ? "#16a34a" : v === "Pendiente" ? "#dc2626" : "#0369a1",
        }}>{v}</span>
      ),
    },
    {
      title: "Gestión",
      key: "fecha",
      width: 130,
      render: (_, r) => (
        <div style={{ fontSize: 13, color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>
          <div style={{ fontWeight: 600 }}>{r.gestion}</div>
          <div style={{ fontSize: 11, color: "#9ca3af" }}>{r.fecha}</div>
        </div>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 100,
      align: "right",
      render: (_, r) => (
        <Space size={2}>
          <Tooltip title="Ver detalle">
            <Button type="text" size="small" icon={<EyeOutlined />}
              onClick={() => setDrawerStudent(r)}
              style={{ color: "var(--brand-700)" }} />
          </Tooltip>
          <Tooltip title="Editar">
            <Button type="text" size="small" icon={<EditOutlined />}
              style={{ color: "#d97706" }} />
          </Tooltip>
          <Dropdown menu={{ items: [
            { key: "print", icon: <PrinterOutlined />, label: "Imprimir comprobante" },
            { key: "mail", icon: <MailOutlined />, label: "Enviar correo" },
            { key: "doc", icon: <FileTextOutlined />, label: "Generar reporte" },
            { type: "divider" },
            { key: "del", icon: <DeleteOutlined />, label: "Eliminar", danger: true },
          ]}}>
            <Button type="text" size="small" icon={<MoreOutlined />}
              style={{ color: "#6b7280" }} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <ConfigProvider theme={{
      token: {
        colorPrimary: "#0e6038",
        borderRadius: 8,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      },
      components: {
        Table: { headerBg: "#fafbfc", headerColor: "#6b7280", headerSplitColor: "transparent",
          rowHoverBg: "var(--brand-50)" },
      },
    }}>
      <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <TopBar onMenuClick={() => setCollapsed(!collapsed)} />
          <div style={{ padding: "26px 32px", flex: 1, overflowY: "auto" }}>
            <PageHeader totalSelected={selectedRows.length} />

            {/* KPIs */}
            {tweaks.showKpis && (
              <div style={{ display: "flex", gap: 16, marginBottom: 22 }}>
                <KpiCard
                  label="Total inscritos"
                  value={totalCount}
                  delta={12}
                  icon={<Team2 />}
                  accent="#0e6038"
                  sub="Gestión 2026"
                />
                <KpiCard
                  label="Estudiantes antiguos"
                  value={antiguosCount}
                  delta={8}
                  icon={<RiseOutlined />}
                  accent="#a16207"
                  sub={`${Math.round(antiguosCount/totalCount*100)}% del total`}
                />
                <KpiCard
                  label="Nuevos ingresos"
                  value={nuevosCount}
                  delta={24}
                  icon={<UserAddOutlined />}
                  accent="#1d4e89"
                  sub="Primer semestre"
                />
                <KpiCard
                  label="Historiales pendientes"
                  value={pendientesCount}
                  delta={-5}
                  icon={<ClockCircleFilled />}
                  accent="#d97706"
                  sub="Requieren revisión"
                />
              </div>
            )}

            {/* Career chips */}
            {tweaks.showCareerChips && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16, alignItems: "center" }}>
                <div
                  onClick={() => setCareerFilter(null)}
                  style={{
                    padding: "6px 14px", borderRadius: 999, cursor: "pointer",
                    background: !careerFilter ? "var(--brand-700)" : "white",
                    color: !careerFilter ? "white" : "#374151",
                    border: `1px solid ${!careerFilter ? "var(--brand-700)" : "#e5e7eb"}`,
                    fontSize: 13, fontWeight: 600,
                  }}>
                  Todas <span style={{
                    background: !careerFilter ? "rgba(255,255,255,0.25)" : "#f3f4f6",
                    color: !careerFilter ? "white" : "#6b7280",
                    padding: "1px 8px", borderRadius: 8, fontSize: 11, marginLeft: 6,
                  }}>{totalCount}</span>
                </div>
                {CAREERS.map(c => (
                  <CareerChip key={c.id} career={c}
                    count={careerCounts[c.id] || 0}
                    active={careerFilter === c.id}
                    onClick={() => setCareerFilter(careerFilter === c.id ? null : c.id)} />
                ))}
              </div>
            )}

            {/* Toolbar */}
            <div style={{
              background: "white", borderRadius: 14, border: "1px solid #eef0f2",
              padding: "14px 18px", display: "flex", alignItems: "center", gap: 12,
              marginBottom: 0,
              borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
              borderBottom: "none",
            }}>
              <Input
                prefix={<Search2 style={{ color: "#9ca3af" }} />}
                placeholder="Buscar por nombre, código, CI..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ maxWidth: 320, borderRadius: 8 }}
                allowClear
              />
              <Segmented
                value={tipoFilter}
                onChange={setTipoFilter}
                options={[
                  { label: "Todos", value: "todos" },
                  { label: "Antiguos", value: "antiguos" },
                  { label: "Nuevos", value: "nuevos" },
                ]}
              />
              <Select
                placeholder="Historial"
                value={historyFilter}
                onChange={setHistoryFilter}
                allowClear
                style={{ width: 170 }}
                options={[
                  { label: "Pendiente", value: "pendiente" },
                  { label: "Completo", value: "completo" },
                  { label: "Observado", value: "observado" },
                  { label: "En revisión", value: "revision" },
                ]}
              />
              <div style={{ flex: 1 }} />
              {selectedRows.length > 0 ? (
                <Space>
                  <span style={{ fontSize: 13, color: "#6b7280" }}>
                    <strong style={{ color: "var(--brand-700)" }}>{selectedRows.length}</strong> seleccionados
                  </span>
                  <Button size="small" icon={<MailOutlined />}>Notificar</Button>
                  <Button size="small" icon={<DownloadOutlined />}>Exportar</Button>
                  <Button size="small" danger icon={<DeleteOutlined />}>Eliminar</Button>
                </Space>
              ) : (
                <Space>
                  <span style={{ fontSize: 13, color: "#9ca3af" }}>
                    {filtered.length} resultados
                  </span>
                  <Segmented
                    value={tweaks.viewMode}
                    onChange={(v) => setTweak("viewMode", v)}
                    options={[
                      { value: "table", icon: <List2 /> },
                      { value: "grid", icon: <AppstoreOutlined /> },
                    ]}
                  />
                </Space>
              )}
            </div>

            {/* Content */}
            <div style={{
              background: "white", borderRadius: 14, border: "1px solid #eef0f2",
              borderTopLeftRadius: 0, borderTopRightRadius: 0,
              borderTop: "1px solid #eef0f2",
              overflow: "hidden",
            }}>
              {tweaks.viewMode === "table" ? (
                <Table
                  rowKey="key"
                  columns={columns}
                  dataSource={paged}
                  pagination={false}
                  size={tweaks.density === "compact" ? "small" : "middle"}
                  rowSelection={{
                    selectedRowKeys: selectedRows,
                    onChange: setSelectedRows,
                  }}
                  onRow={(r) => ({
                    onClick: (e) => {
                      if (e.target.closest('button, .ant-checkbox-wrapper')) return;
                      setDrawerStudent(r);
                    },
                    style: { cursor: "pointer" },
                  })}
                />
              ) : (
                <div style={{ padding: 20, display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 14 }}>
                  {paged.map(s => <StudentCard key={s.key} student={s}
                    onOpen={() => setDrawerStudent(s)} />)}
                </div>
              )}
              <div style={{
                padding: "12px 18px", display: "flex", alignItems: "center",
                justifyContent: "space-between", borderTop: "1px solid #f0f2f4",
              }}>
                <div style={{ fontSize: 13, color: "#6b7280" }}>
                  Mostrando {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} de {filtered.length}
                </div>
                <Pagination
                  current={page}
                  pageSize={pageSize}
                  total={filtered.length}
                  onChange={setPage}
                  showSizeChanger={false}
                />
              </div>
            </div>
          </div>
        </div>

        <StudentDrawer
          student={drawerStudent}
          open={!!drawerStudent}
          onClose={() => setDrawerStudent(null)}
        />

        <MyTweaks tweaks={tweaks} setTweak={setTweak} />
      </div>
    </ConfigProvider>
  );
}

// ---------- Student card (grid view) ----------
function StudentCard({ student, onOpen }) {
  const av = avatarFor(student.fullName);
  return (
    <div onClick={onOpen}
      style={{
        background: "white", border: "1px solid #eef0f2", borderRadius: 12,
        padding: 16, cursor: "pointer", transition: "all 0.15s",
        position: "relative", overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--brand-500)";
        e.currentTarget.style.boxShadow = "0 6px 20px rgba(13,110,61,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#eef0f2";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 4,
        background: student.career.color,
      }} />
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          background: `${av.color}15`, color: av.color,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 700, fontSize: 16,
          border: `2px solid ${av.color}25`,
        }}>{av.initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", lineHeight: 1.3 }}>
            {student.fullName}
          </div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
            #{student.code} · CI {student.ci}
          </div>
        </div>
        <Tag style={{
          margin: 0, borderRadius: 999, padding: "0 8px", fontSize: 10,
          background: student.isAntiguo ? "#fef3c7" : "#dcfce7",
          color: student.isAntiguo ? "#92400e" : "#166534",
          border: "none", fontWeight: 600,
        }}>{student.tipo}</Tag>
      </div>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        fontSize: 12, fontWeight: 600, color: "#0f172a", marginBottom: 10,
      }}>
        <span style={{ width: 3, height: 14, background: student.career.color, borderRadius: 2 }} />
        {student.career.name}
      </div>
      <div style={{
        display: "flex", gap: 16, padding: "10px 0",
        borderTop: "1px solid #f0f2f4", marginTop: 4,
        fontSize: 11, color: "#6b7280",
      }}>
        <div><strong style={{ color: "#0f172a", fontSize: 13 }}>{student.semester}°</strong> sem.</div>
        <div><strong style={{ color: "#0f172a", fontSize: 13 }}>{student.materias}</strong> mat.</div>
        <div><strong style={{ color: "var(--brand-700)", fontSize: 13 }}>{student.avgGrade}</strong> prom.</div>
      </div>
    </div>
  );
}

// ---------- Tweaks panel ----------
function MyTweaks({ tweaks, setTweak }) {
  const t = tweaks;
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Vista">
        <TweakRadio label="Modo" value={t.viewMode} onChange={(v) => setTweak("viewMode", v)}
          options={[
            { value: "table", label: "Tabla" },
            { value: "grid", label: "Tarjetas" },
          ]} />
        <TweakRadio label="Densidad" value={t.density} onChange={(v) => setTweak("density", v)}
          options={[
            { value: "compact", label: "Compacta" },
            { value: "comfortable", label: "Cómoda" },
          ]} />
      </TweakSection>
      <TweakSection label="Estilo">
        <TweakRadio label="Verde institucional" value={t.greenIntensity} onChange={(v) => setTweak("greenIntensity", v)}
          options={[
            { value: "subtle", label: "Sutil" },
            { value: "balanced", label: "Medio" },
            { value: "bold", label: "Fuerte" },
          ]} />
        <TweakToggle label="Avatares de estudiante" value={t.showAvatars}
          onChange={(v) => setTweak("showAvatars", v)} />
      </TweakSection>
      <TweakSection label="Componentes">
        <TweakToggle label="Mostrar KPIs" value={t.showKpis}
          onChange={(v) => setTweak("showKpis", v)} />
        <TweakToggle label="Chips de carrera" value={t.showCareerChips}
          onChange={(v) => setTweak("showCareerChips", v)} />
      </TweakSection>
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<MatriculadosPage />);
