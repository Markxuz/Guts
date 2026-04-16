import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Clock, FileText, LayoutDashboard, LogOut, Settings, UserRound, Users, Users2 } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { prefetchRoute, prefetchRoutesWhenIdle } from "../../app/router/routeLoaders";

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

const APP_VERSION = import.meta.env.VITE_APP_VERSION || "1.0.0";
const RELEASE_LABEL = import.meta.env.VITE_RELEASE_LABEL || "April 2026 updates";

function buildNavItems(role) {
  const all = [
    { label: "Dashboard", to: "/", icon: LayoutDashboard, roles: ["admin", "sub_admin", "staff"] },
    { label: "Enrollments", to: "/enrollments", icon: UserRound, roles: ["admin", "sub_admin", "staff"] },
    { label: "Schedule PDC Later", to: "/enrollments/schedule-pdc-later", icon: Clock, roles: ["admin", "sub_admin", "staff"] },
    { label: "Students", to: "/students", icon: Users, roles: ["admin", "sub_admin", "staff"] },
  ];
  return all.filter((item) => item.roles.includes(role));
}

export default function AppLayout() {
  const { pathname } = useLocation();
  const { logout, auth, role } = useAuth();
  const currentYear = new Date().getFullYear();
  const isInReportsSection = pathname === "/reports" || pathname.startsWith("/reports/");
  const isInSettingsSection = pathname.startsWith("/settings/");
  const [isReportsExpanded, setIsReportsExpanded] = useState(false);
  const [isReportsPopoverOpen, setIsReportsPopoverOpen] = useState(false);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
  const [isSettingsPopoverOpen, setIsSettingsPopoverOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const reportsContainerRef = useRef(null);
  const settingsContainerRef = useRef(null);

  const navItems = buildNavItems(role || "staff");
  const showReports = role === "admin" || role === "sub_admin";
  const showSettings = role === "admin" || role === "sub_admin";
  const reportsItems = useMemo(
    () => [
      { to: "/reports", label: "Operations Reports" },
      { to: "/reports/overview", label: "Overview Reports" },
    ],
    []
  );
  const settingsItems = useMemo(() => {
    const items = [
      { to: "/settings/instructors", label: "Instructors" },
      { to: "/settings/vehicles", label: "Vehicles" },
    ];

    if (role === "admin") {
      items.push({ to: "/settings/users", label: "Manage Users", icon: Users2 });
    }

    return items;
  }, [role]);
  const isSettingsOpen = useMemo(
    () => !isCollapsed && (isInSettingsSection || isSettingsExpanded),
    [isCollapsed, isInSettingsSection, isSettingsExpanded]
  );
  const isReportsOpen = useMemo(
    () => !isCollapsed && (isInReportsSection || isReportsExpanded),
    [isCollapsed, isInReportsSection, isReportsExpanded]
  );

  useEffect(() => {
    if (!isCollapsed) {
      // Use a microtask to avoid cascading renders
      Promise.resolve().then(() => {
        setIsReportsPopoverOpen(false);
        setIsSettingsPopoverOpen(false);
      });
    }
  }, [isCollapsed]);

  useEffect(() => {
    if (!isReportsPopoverOpen && !isSettingsPopoverOpen) return undefined;

    function handleOutsideClick(event) {
      const inReports = reportsContainerRef.current?.contains(event.target);
      const inSettings = settingsContainerRef.current?.contains(event.target);

      if (!inReports && !inSettings) {
        setIsReportsPopoverOpen(false);
        setIsSettingsPopoverOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isReportsPopoverOpen, isSettingsPopoverOpen]);

  useEffect(() => {
    const sidebarWidth = isCollapsed ? "5rem" : "16rem";
    document.documentElement.style.setProperty("--app-sidebar-width", sidebarWidth);

    return () => {
      document.documentElement.style.setProperty("--app-sidebar-width", "0px");
    };
  }, [isCollapsed]);

  useEffect(() => {
    const commonRoutes = ["/", "/enrollments", "/students"];
    const privilegedRoutes = role === "admin" || role === "sub_admin"
      ? ["/reports", "/reports/overview", "/settings/instructors", "/settings/vehicles"]
      : [];
    const adminOnly = role === "admin" ? ["/settings/users"] : [];

    prefetchRoutesWhenIdle([...commonRoutes, ...privilegedRoutes, ...adminOnly]);
  }, [role]);

  function handleSettingsToggle(event) {
    event.preventDefault();
    event.stopPropagation();

    if (isCollapsed) {
      setIsSettingsPopoverOpen((prev) => !prev);
      return;
    }

    setIsSettingsExpanded((prev) => !prev);
  }

  function handleReportsToggle(event) {
    event.preventDefault();
    event.stopPropagation();

    if (isCollapsed) {
      setIsReportsPopoverOpen((prev) => !prev);
      return;
    }

    setIsReportsExpanded((prev) => !prev);
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
                onMouseEnter={() => prefetchRoute(item.to)}
                onFocus={() => prefetchRoute(item.to)}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center border-l-[3px] py-3 text-sm transition ${
                  isCollapsed ? "justify-center px-2" : `gap-3 ${item.isIndented ? "px-10 pl-10" : "px-5"}`
                } ${
                  isActive
                    ? "border-[#D4AF37] bg-linear-to-r from-[#6d1224]/30 to-transparent font-semibold text-[#D4AF37]"
                    : "border-transparent text-[#c4c8cd] hover:bg-white/5"
                }`}
              >
                <Icon size={15} />
                {!isCollapsed ? item.label : null}
              </Link>
            );
          })}

          {showReports && (
            <div
              ref={reportsContainerRef}
              className="relative mt-1"
            >
              <button
                type="button"
                onClick={handleReportsToggle}
                title={isCollapsed ? "Reports" : undefined}
                className={`flex w-full cursor-pointer items-center border-l-[3px] py-3 text-sm transition ${
                  isCollapsed ? "justify-center px-2" : "gap-3 px-5"
                } ${
                  isInReportsSection
                    ? "border-[#D4AF37] bg-linear-to-r from-[#6d1224]/30 to-transparent font-semibold text-[#D4AF37]"
                    : "border-transparent text-[#c4c8cd] hover:bg-white/5"
                }`}
                aria-expanded={isCollapsed ? isReportsPopoverOpen : isReportsOpen}
                aria-controls="reports-submenu"
              >
                <FileText size={15} />
                {!isCollapsed ? <span>Reports</span> : null}
                {!isCollapsed ? (
                  <ChevronDown
                    size={14}
                    className={`ml-auto transition-transform duration-200 ${isReportsOpen ? "rotate-180" : "rotate-0"}`}
                  />
                ) : null}
              </button>

              {isCollapsed && isReportsPopoverOpen ? (
                <div
                  id="reports-submenu"
                  className="absolute left-full top-0 z-60 ml-2 w-56 overflow-hidden rounded-xl border border-white/15 bg-[#1b1823] py-1 shadow-2xl"
                >
                  {reportsItems.map(({ to, label }) => (
                    <Link
                      key={to}
                      to={to}
                      onMouseEnter={() => prefetchRoute(to)}
                      onFocus={() => prefetchRoute(to)}
                      onClick={() => setIsReportsPopoverOpen(false)}
                      className={`flex items-center gap-2 px-4 py-2.5 text-sm transition ${
                        pathname === to
                          ? "bg-linear-to-r from-[#6d1224]/35 to-transparent font-semibold text-[#D4AF37]"
                          : "text-[#c4c8cd] hover:bg-white/10 hover:text-[#e8e5e0]"
                      }`}
                    >
                      <span>{label}</span>
                    </Link>
                  ))}
                </div>
              ) : null}

              {!isCollapsed && isReportsOpen ? (
                <div id="reports-submenu" className="mt-1 space-y-0.5 overflow-visible">
                  {reportsItems.map(({ to, label }) => (
                    <Link
                      key={to}
                      to={to}
                      onMouseEnter={() => prefetchRoute(to)}
                      onFocus={() => prefetchRoute(to)}
                      className={`ml-5 flex items-center border-l-2 py-2 pl-5 pr-4 text-sm transition ${
                        pathname === to
                          ? "border-[#D4AF37] bg-linear-to-r from-[#6d1224]/25 to-transparent font-semibold text-[#D4AF37]"
                          : "border-transparent text-[#b0b5bc] hover:bg-white/5 hover:text-[#e8e5e0]"
                      }`}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          )}

          {showSettings && (
            <div
              ref={settingsContainerRef}
              className="relative mt-1"
            >
              <button
                type="button"
                onClick={handleSettingsToggle}
                title={isCollapsed ? "Settings" : undefined}
                className={`flex w-full cursor-pointer items-center border-l-[3px] py-3 text-sm transition ${
                  isCollapsed ? "justify-center px-2" : "gap-3 px-5"
                } ${
                  isInSettingsSection
                    ? "border-[#D4AF37] bg-linear-to-r from-[#6d1224]/30 to-transparent font-semibold text-[#D4AF37]"
                    : "border-transparent text-[#c4c8cd] hover:bg-white/5"
                }`}
                aria-expanded={isCollapsed ? isSettingsPopoverOpen : isSettingsOpen}
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

              {isCollapsed && isSettingsPopoverOpen ? (
                <div
                  id="settings-submenu"
                  className="absolute left-full top-0 z-60 ml-2 w-56 overflow-hidden rounded-xl border border-white/15 bg-[#1b1823] py-1 shadow-2xl"
                >
                  {settingsItems.map(({ to, label, icon: Icon }) => (
                    <Link
                      key={to}
                      to={to}
                      onMouseEnter={() => prefetchRoute(to)}
                      onFocus={() => prefetchRoute(to)}
                      onClick={() => setIsSettingsPopoverOpen(false)}
                      className={`flex items-center gap-2 px-4 py-2.5 text-sm transition ${
                        pathname === to
                          ? "bg-linear-to-r from-[#6d1224]/35 to-transparent font-semibold text-[#D4AF37]"
                          : "text-[#c4c8cd] hover:bg-white/10 hover:text-[#e8e5e0]"
                      }`}
                    >
                      {Icon ? <Icon size={13} /> : null}
                      <span>{label}</span>
                    </Link>
                  ))}
                </div>
              ) : null}

              {!isCollapsed && isSettingsOpen ? (
                <div id="settings-submenu" className="mt-1 space-y-0.5 overflow-visible">
                  {settingsItems.map(({ to, label, icon: Icon }) => (
                    <Link
                      key={to}
                      to={to}
                      onMouseEnter={() => prefetchRoute(to)}
                      onFocus={() => prefetchRoute(to)}
                      className={`ml-5 flex items-center border-l-2 py-2 pl-5 pr-4 text-sm transition ${
                        pathname === to
                          ? "border-[#D4AF37] bg-linear-to-r from-[#6d1224]/25 to-transparent font-semibold text-[#D4AF37]"
                          : "border-transparent text-[#b0b5bc] hover:bg-white/5 hover:text-[#e8e5e0]"
                      }`}
                    >
                      {Icon ? <Icon size={13} className="mr-2" /> : null}
                      {label}
                    </Link>
                  ))}
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

      <div className={`flex min-h-screen min-w-0 flex-1 flex-col bg-slate-200 transition-all duration-300 print:ml-0 print:bg-white ${isCollapsed ? "ml-20" : "ml-64"}`}>
        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-6 scroll-smooth print:overflow-visible print:p-0">
          <div className="mx-auto min-w-0 w-full max-w-full">
            <div key={pathname} className="route-fade-enter min-w-0">
              <Outlet />
            </div>
          </div>
        </main>

        <footer className="border-t border-slate-300/70 bg-slate-100/90 px-6 py-2 text-xs text-slate-600 print:hidden">
          <div className="mx-auto flex w-full max-w-full flex-wrap items-center justify-between gap-2">
            <p>Guardians Technical School System</p>
            <p>Version {APP_VERSION} | {RELEASE_LABEL}</p>
            <p>Copyright {currentYear}</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
