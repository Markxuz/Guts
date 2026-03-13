import { useEffect, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, FileText, LayoutDashboard, LogOut, Settings, UserRound, Users, Users2 } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";

const ROLE_LABEL = {
  admin: "Main Admin",
  sub_admin: "Sub Admin",
  staff: "Staff",
};

const ROLE_BADGE = {
  admin: "bg-[#800000]/10 text-[#800000] border border-[#800000]/30",
  sub_admin: "bg-amber-50 text-amber-700 border border-amber-300",
  staff: "bg-slate-100 text-slate-600 border border-slate-300",
};

function buildNavItems(role) {
  const all = [
    { label: "Dashboard", to: "/", icon: LayoutDashboard, roles: ["admin", "sub_admin", "staff"] },
    { label: "Enrollments", to: "/enrollments", icon: UserRound, roles: ["admin", "sub_admin", "staff"] },
    { label: "Students", to: "/students", icon: Users, roles: ["admin", "sub_admin", "staff"] },
    { label: "Reports", to: "/reports", icon: FileText, roles: ["admin", "sub_admin"] },
  ];
  return all.filter((item) => item.roles.includes(role));
}

export default function AppLayout() {
  const { pathname } = useLocation();
  const { logout, auth, role } = useAuth();
  const isInSettingsSection = pathname.startsWith("/settings/");
  const [isSettingsOpen, setIsSettingsOpen] = useState(isInSettingsSection);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = buildNavItems(role || "staff");
  const showSettings = role === "admin" || role === "sub_admin";

  useEffect(() => {
    if (!isCollapsed && isInSettingsSection) {
      setIsSettingsOpen(true);
    }
  }, [isCollapsed, isInSettingsSection]);

  useEffect(() => {
    if (isCollapsed) {
      setIsSettingsOpen(false);
    }
  }, [isCollapsed]);

  function handleSettingsToggle(event) {
    event.preventDefault();
    event.stopPropagation();

    if (isCollapsed) {
      setIsCollapsed(false);
      setIsSettingsOpen(true);
      return;
    }

    setIsSettingsOpen((prev) => !prev);
  }

  return (
    <div className="flex min-h-screen bg-[#0a0a0c] text-[#c4c8cd]">
      <aside className={`fixed left-0 top-0 z-40 flex h-screen flex-col overflow-visible border-r border-white/10 bg-[#14121a] transition-all duration-300 print:hidden ${isCollapsed ? "w-20" : "w-64"}`}>
        <div className={`border-b border-white/10 py-4 ${isCollapsed ? "px-2" : "px-5"}`}>
          <div className={`flex ${isCollapsed ? "justify-center" : "items-start justify-between"}`}>
            <div className={`flex ${isCollapsed ? "justify-center" : "items-center gap-3"}`}>
              <img
                src="/Guts%20Icon.png"
                alt="Guardians Technical School logo"
                className={`rounded-lg object-contain shadow-lg shadow-black/40 transition-all duration-300 ${isCollapsed ? "h-12 w-12" : "h-20 w-20"}`}
              />
              {!isCollapsed ? (
                <div className="text-left">
                  <p className="text-sm font-bold leading-tight text-[#e8e5e0]">Guardians Technical School INC.</p>
                  <p className="mt-1 text-xs tracking-wide text-[#c7a24a]">Admin Dashboard</p>
                </div>
              ) : null}
            </div>

            {!isCollapsed ? (
              <button
                type="button"
                onClick={() => setIsCollapsed((prev) => !prev)}
                title="Collapse sidebar"
                className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/5 text-[#c7a24a] hover:bg-white/10"
              >
                <ChevronLeft size={14} />
              </button>
            ) : null}
          </div>

          {isCollapsed ? (
            <div className="mt-2 flex justify-center">
              <button
                type="button"
                onClick={() => setIsCollapsed((prev) => !prev)}
                title="Expand sidebar"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/5 text-[#c7a24a] hover:bg-white/10"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          ) : null}
        </div>

        <nav className="flex-1 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center border-l-[3px] py-3 text-sm transition ${
                  isCollapsed ? "justify-center px-2" : "gap-3 px-5"
                } ${
                  isActive
                    ? "border-[#D4AF37] bg-gradient-to-r from-[#6d1224]/30 to-transparent font-semibold text-[#D4AF37]"
                    : "border-transparent text-[#c4c8cd] hover:bg-white/5"
                }`}
              >
                <Icon size={15} />
                {!isCollapsed ? item.label : null}
              </Link>
            );
          })}

          {showSettings && (
            <div className="mt-1">
              <button
                type="button"
                onClick={handleSettingsToggle}
                title={isCollapsed ? "Settings" : undefined}
                className={`flex w-full cursor-pointer items-center border-l-[3px] py-3 text-sm transition ${
                  isCollapsed ? "justify-center px-2" : "gap-3 px-5"
                } ${
                  isInSettingsSection
                    ? "border-[#D4AF37] bg-gradient-to-r from-[#6d1224]/30 to-transparent font-semibold text-[#D4AF37]"
                    : "border-transparent text-[#c4c8cd] hover:bg-white/5"
                }`}
                aria-expanded={!isCollapsed && isSettingsOpen}
                aria-controls="settings-submenu"
              >
                <Settings size={15} />
                {!isCollapsed ? <span>Settings</span> : null}
                {!isCollapsed ? (
                  <ChevronDown
                    size={14}
                    className={`ml-auto transition-transform duration-200 ${isSettingsOpen ? "rotate-180" : "rotate-0"}`}
                  />
                ) : null}
              </button>

              {!isCollapsed && isSettingsOpen ? (
                <div id="settings-submenu" className="mt-1 space-y-0.5 overflow-visible">
                  {[
                    { to: "/settings/instructors", label: "Instructors" },
                    { to: "/settings/vehicles", label: "Vehicles" },
                  ].map(({ to, label }) => (
                    <Link
                      key={to}
                      to={to}
                      className={`ml-5 flex items-center border-l-2 py-2 pl-5 pr-4 text-sm transition ${
                        pathname === to
                          ? "border-[#D4AF37] bg-gradient-to-r from-[#6d1224]/25 to-transparent font-semibold text-[#D4AF37]"
                          : "border-transparent text-[#b0b5bc] hover:bg-white/5 hover:text-[#e8e5e0]"
                      }`}
                    >
                      {label}
                    </Link>
                  ))}
                  {role === "admin" && (
                    <Link
                      to="/settings/users"
                      className={`ml-5 flex items-center gap-2 border-l-2 py-2 pl-5 pr-4 text-sm transition ${
                        pathname === "/settings/users"
                          ? "border-[#D4AF37] bg-gradient-to-r from-[#6d1224]/25 to-transparent font-semibold text-[#D4AF37]"
                          : "border-transparent text-[#b0b5bc] hover:bg-white/5 hover:text-[#e8e5e0]"
                      }`}
                    >
                      <Users2 size={13} />
                      Manage Users
                    </Link>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </nav>

        <div className={`border-t border-white/10 py-4 ${isCollapsed ? "px-2" : "px-4"}`}>
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-2"}`}>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#6d1224] text-xs font-bold text-white">
              {(auth?.user?.name || "U")[0].toUpperCase()}
            </div>
            {!isCollapsed ? (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-[#e8e5e0]">{auth?.user?.name || "User"}</p>
                <span className={`inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium ${ROLE_BADGE[role] || ROLE_BADGE.staff}`}>
                  {ROLE_LABEL[role] || role}
                </span>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={logout}
            title={isCollapsed ? "Logout" : undefined}
            className={`mt-3 inline-flex items-center justify-center rounded-md border border-white/10 bg-[#6d1224]/30 text-xs text-[#e8e5e0] hover:bg-[#6d1224]/50 ${
              isCollapsed ? "w-full px-0 py-1.5" : "w-full gap-2 px-3 py-1.5"
            }`}
          >
            <LogOut size={13} />
            {!isCollapsed ? "Logout" : null}
          </button>
        </div>
      </aside>

      <div className={`flex min-h-screen flex-1 flex-col bg-slate-200 transition-all duration-300 print:ml-0 print:bg-white ${isCollapsed ? "ml-20" : "ml-64"}`}>
        <main className="flex-1 overflow-y-auto p-6 print:overflow-visible print:p-0">
          <div className="mx-auto w-full max-w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
