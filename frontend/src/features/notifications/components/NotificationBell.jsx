import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useNotifications, useMarkNotificationRead } from "../hooks/useNotifications";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NotificationBell({
  buttonClassName,
  dropdownClassName,
  iconSize = 20,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { data, isLoading } = useNotifications();
  const { markRead, markAllRead } = useMarkNotificationRead();

  const items = data?.items || [];
  const unreadCount = data?.unreadCount || 0;

  useEffect(() => {
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className={buttonClassName || "relative rounded-full p-2 text-slate-600 transition hover:bg-slate-100"}
      >
        <Bell size={iconSize} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className={dropdownClassName || "absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"}>
          <div className="flex items-center justify-between bg-[#800000] px-4 py-3">
            <h3 className="text-sm font-semibold text-white">
              Notifications {unreadCount > 0 ? `(${unreadCount})` : ""}
            </h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllRead()}
                className="text-xs text-[#D4AF37] transition hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-72 divide-y divide-slate-100 overflow-y-auto">
            {isLoading ? (
              <p className="px-4 py-6 text-center text-sm text-slate-400">Loading…</p>
            ) : items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-400">No notifications yet.</p>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => markRead(item.id)}
                  className={`w-full px-4 py-3 text-left transition hover:bg-slate-50 ${
                    !item.is_read ? "bg-amber-50/60" : ""
                  }`}
                >
                  <p
                    className={`text-sm leading-snug ${
                      !item.is_read ? "font-medium text-slate-800" : "text-slate-600"
                    }`}
                  >
                    {item.message}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">{timeAgo(item.created_at)}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
