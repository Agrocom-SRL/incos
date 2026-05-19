// Sidebar component for INCOS admin
const { useState } = React;
const {
    DashboardOutlined, IdcardOutlined, UserAddOutlined, SolutionOutlined,
    UnorderedListOutlined, DollarOutlined, GiftOutlined, ReadOutlined,
    TeamOutlined, BankOutlined, BarChartOutlined, SafetyOutlined,
    SettingOutlined, UserOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
    RightOutlined, DownOutlined, LogoutOutlined,
} = icons;

function SidebarItem({ icon, label, active, sub, onClick, collapsed }) {
    const [hover, setHover] = useState(false);
    const bg = active
        ? "var(--brand-50)"
        : hover ? "rgba(13,110,61,0.05)" : "transparent";
    const color = active ? "var(--brand-700)" : "#374151";
    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: collapsed ? "10px 0" : "10px 14px",
                justifyContent: collapsed ? "center" : "flex-start",
                margin: "2px 10px",
                borderRadius: 10,
                cursor: "pointer",
                background: bg,
                color,
                fontWeight: active ? 600 : 500,
                fontSize: 14,
                position: "relative",
                transition: "all 0.15s ease",
                paddingLeft: sub && !collapsed ? 44 : (collapsed ? 0 : 14),
            }}
        >
            {active && !sub && (
                <div style={{
                    position: "absolute", left: -10, top: 8, bottom: 8, width: 3,
                    background: "var(--brand-600)", borderRadius: 4,
                }} />
            )}
            <span style={{ fontSize: 16, display: "inline-flex" }}>{icon}</span>
            {!collapsed && <span style={{ flex: 1 }}>{label}</span>}
        </div>
    );
}

function SidebarSection({ icon, label, children, defaultOpen, collapsed }) {
    const [open, setOpen] = useState(defaultOpen);
    const [hover, setHover] = useState(false);
    return (
        <div>
            <div
                onClick={() => setOpen(!open)}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: collapsed ? "10px 0" : "10px 14px",
                    justifyContent: collapsed ? "center" : "flex-start",
                    margin: "2px 10px",
                    borderRadius: 10,
                    cursor: "pointer",
                    background: hover ? "rgba(13,110,61,0.05)" : "transparent",
                    color: "#374151",
                    fontWeight: 500,
                    fontSize: 14,
                }}
            >
                <span style={{ fontSize: 16, display: "inline-flex" }}>{icon}</span>
                {!collapsed && (
                    <>
                        <span style={{ flex: 1 }}>{label}</span>
                        <span style={{ fontSize: 10, color: "#9ca3af" }}>
                            {open ? <DownOutlined /> : <RightOutlined />}
                        </span>
                    </>
                )}
            </div>
            {open && !collapsed && <div style={{ paddingBottom: 4 }}>{children}</div>}
        </div>
    );
}

function Sidebar({ collapsed, onToggle }) {
    const width = collapsed ? 76 : 252;
    return (
        <div style={{
            width,
            background: "#ffffff",
            borderRight: "1px solid #e5e7eb",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            transition: "width 0.2s ease",
            position: "relative",
            flexShrink: 0,
        }}>
            {/* Logo header */}
            <div style={{
                padding: collapsed ? "18px 10px" : "18px 20px",
                borderBottom: "1px solid #f3f4f6",
                display: "flex",
                alignItems: "center",
                gap: 10,
                minHeight: 76,
            }}>
                {collapsed ? (
                    <div style={{
                        width: 44, height: 44, borderRadius: 10,
                        background: "var(--brand-700)",
                        color: "white", fontWeight: 800, fontSize: 16,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        letterSpacing: 0.5,
                    }}>IT</div>
                ) : (
                    <img src="assets/logo-incos.webp" alt="INCOS"
                        style={{ height: 44, width: "auto", objectFit: "contain" }} />
                )}
            </div>

            {/* Menu */}
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 0" }}>
                {!collapsed && (
                    <div style={{
                        padding: "0 24px 6px",
                        fontSize: 11,
                        color: "#9ca3af",
                        fontWeight: 600,
                        letterSpacing: 0.6,
                        textTransform: "uppercase",
                    }}>Principal</div>
                )}
                <SidebarItem icon={<DashboardOutlined />} label="Dashboard" collapsed={collapsed} />

                <SidebarSection icon={<IdcardOutlined />} label="Matrícula" defaultOpen collapsed={collapsed}>
                    <SidebarItem icon={<UserAddOutlined />} label="Nuevo estudiante" sub collapsed={collapsed} />
                    <SidebarItem icon={<SolutionOutlined />} label="Admisión" sub collapsed={collapsed} />
                    <SidebarItem icon={<UnorderedListOutlined />} label="Matrículas" sub active collapsed={collapsed} />
                    <SidebarItem icon={<DollarOutlined />} label="Aportes" sub collapsed={collapsed} />
                    <SidebarItem icon={<GiftOutlined />} label="Becas" sub collapsed={collapsed} />
                    <SidebarItem icon={<SolutionOutlined />} label="Pasantías" sub collapsed={collapsed} />
                </SidebarSection>

                <SidebarSection icon={<ReadOutlined />} label="Académico" collapsed={collapsed}>
                    <SidebarItem icon={<UnorderedListOutlined />} label="Materias" sub collapsed={collapsed} />
                    <SidebarItem icon={<UnorderedListOutlined />} label="Notas" sub collapsed={collapsed} />
                </SidebarSection>

                <SidebarItem icon={<TeamOutlined />} label="Docentes" collapsed={collapsed} />
                <SidebarItem icon={<DollarOutlined />} label="Finanzas" collapsed={collapsed} />
                <SidebarItem icon={<BankOutlined />} label="Institucional" collapsed={collapsed} />
                <SidebarItem icon={<BarChartOutlined />} label="Reportes" collapsed={collapsed} />
                <SidebarItem icon={<SafetyOutlined />} label="Seguridad" collapsed={collapsed} />
                <SidebarItem icon={<SettingOutlined />} label="Configuración" collapsed={collapsed} />
            </div>

            {/* Footer profile */}
            <div style={{
                borderTop: "1px solid #f3f4f6",
                padding: collapsed ? "12px 10px" : "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: 10,
            }}>
                <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: "var(--brand-100)", color: "var(--brand-700)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: 13, flexShrink: 0,
                }}>JR</div>
                {!collapsed && (
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Juan Rodríguez</div>
                        <div style={{ fontSize: 11, color: "#6b7280" }}>Administrador</div>
                    </div>
                )}
            </div>
        </div>
    );
}

window.Sidebar = Sidebar;
