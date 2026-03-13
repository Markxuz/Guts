import { useEffect, useRef, useState } from "react";
import { ChartColumn, ChevronDown, LogOut, Search, UserRound, Users2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";
import NotificationBell from "../../notifications/components/NotificationBell";

export default function TopControls({
  activeFilter,
  onChangeFilter,
  search,
  onSearchChange,
  onEnroll,
}) {
  const navigate = useNavigate();
  const { auth, role, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    function handleOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const pdcOpen = activeFilter === "pdc" || activeFilter === "pdc_beginner" || activeFilter === "pdc_experience";

  return (
    <div className="rounded-xl border-t-2 border-t-[#D4AF37] border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onEnroll}
          className="rounded-lg bg-[#800000] px-4 py-2 text-xs font-semibold text-white"
        >
          + Enroll
        </button>

        <button
          type="button"
          onClick={() => onChangeFilter("overall")}
          className={`inline-flex items-center gap-1 rounded-lg px-4 py-2 text-xs font-semibold ${
            activeFilter === "overall" ? "bg-[#800000] text-white" : "bg-slate-100 text-slate-500"
          }`}
        >
          <ChartColumn size={13} className={activeFilter === "overall" ? "text-[#D4AF37]" : "text-[#D4AF37]"} /> Overall
        </button>

        <button
          type="button"
          onClick={() => onChangeFilter("tdc")}
          className={`rounded-lg px-4 py-2 text-xs font-semibold ${
            activeFilter === "tdc" ? "bg-[#800000] text-white" : "bg-slate-100 text-slate-500"
          }`}
        >
          TDC
        </button>

        <button
          type="button"
          onClick={() => onChangeFilter("pdc")}
          className={`rounded-lg px-4 py-2 text-xs font-semibold ${
            pdcOpen ? "bg-[#800000] text-white" : "bg-slate-100 text-slate-500"
          }`}
        >
          PDC
        </button>

        <div
          className={`flex items-center gap-1.5 overflow-hidden transition-all duration-300 ${
            pdcOpen ? "max-w-72 opacity-100 translate-y-0 scale-100" : "max-w-0 opacity-0 -translate-y-1 scale-95"
          }`}
        >
          <button
            type="button"
            onClick={() => onChangeFilter("pdc_beginner")}
            className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold transition ${
              activeFilter === "pdc_beginner"
                ? "border-[#D4AF37] bg-[#800000] text-[#D4AF37]"
                : "border-[#D4AF37] bg-white text-[#800000] hover:bg-[#D4AF37]/10"
            }`}
          >
            Beginner
          </button>
          <button
            type="button"
            onClick={() => onChangeFilter("pdc_experience")}
            className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold transition ${
              activeFilter === "pdc_experience"
                ? "border-[#D4AF37] bg-[#800000] text-[#D4AF37]"
                : "border-[#D4AF37] bg-white text-[#800000] hover:bg-[#D4AF37]/10"
            }`}
          >
            Experience
          </button>
        </div>

        <label className="ml-auto flex min-w-52 flex-1 items-center gap-2 rounded-full bg-[#800000] px-3 py-2 transition hover:bg-[#600000]">
          <Search size={14} className="text-[#D4AF37]" />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search students, enrollments..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/70"
          />
        </label>

        {(role === "admin" || role === "sub_admin") ? (
          <NotificationBell
            buttonClassName="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#D4AF37]/70 bg-[#800000] text-[#D4AF37] transition hover:bg-[#600000]"
            iconSize={14}
            dropdownClassName="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
          />
        ) : null}

        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setUserMenuOpen((value) => !value)}
            className="inline-flex items-center gap-1 rounded-full border border-[#D4AF37]/70 bg-[#800000] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#600000]"
          >
            <UserRound size={13} className="text-[#D4AF37]" />
            {auth?.user?.name || "User"}
            <ChevronDown size={12} className={`text-[#D4AF37] transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {userMenuOpen ? (
            <div className="absolute right-0 top-11 z-50 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
              {role === "admin" ? (
                <button
                  type="button"
                  onClick={() => {
                    navigate("/settings/users");
                    setUserMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Users2 size={14} />
                  Manage Users
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen(false);
                  logout();
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
