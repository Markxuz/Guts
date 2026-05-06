import { useEffect, useMemo, useRef, useState } from "react";
import {
  BellRing,
  Bike,
  Car,
  Clock3,
  ChevronDown,
  Fuel,
  Plus,
  Search,
  Trash2,
  UserRound,
  UserRoundCog,
  Wrench,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import NotificationBell from "../../notifications/components/NotificationBell";
import { useAuth } from "../../auth/hooks/useAuth";
import { resourceServices } from "../../../services/resources";
import { fetchReportOverview, fetchScheduleDay } from "../../dashboard/services/dashboardApi";

const PAGE_SIZE = 6;

const STATUS_STYLES = {
  Available: "bg-emerald-100 text-emerald-700 border border-emerald-300",
  Scheduled: "bg-yellow-100 text-yellow-800 border border-yellow-300",
  "Under Maintenance": "bg-rose-100 text-rose-800 border border-rose-300",
  "In Service": "bg-amber-100 text-amber-700 border border-amber-300",
  Archived: "bg-slate-200 text-slate-700 border border-slate-300",
};

function normalizeVehicleType(type, name) {
  const raw = String(type || "").toLowerCase();
  const label = String(name || "").toLowerCase();

  if (
    raw.includes("tricycle") ||
    raw.includes("3wheel") ||
    raw.includes("3-wheel") ||
    raw.includes("three wheel") ||
    label.includes("tricycle") ||
    label.includes("3wheel") ||
    label.includes("3-wheel") ||
    label.includes("three wheel")
  ) {
    return "Tricycle";
  }

  if (raw.includes("motor") || raw.includes("bike") || label.includes("motor") || label.includes("bike")) {
    return "Motorcycle";
  }

  if (raw.includes("sedan") || label.includes("sedan") || raw.includes("car") || label.includes("car")) {
    return "Sedan";
  }

  return "Sedan";
}

function vehicleTypeLabel(type) {
  if (type === "Sedan") return "Four Wheels";
  if (type === "Tricycle") return "Tricycle (3 Wheels)";
  return type;
}

function normalizeVehicleStatus(value) {
  const raw = String(value || "").toLowerCase();

  if (raw.includes("arch")) return "Archived";
  if (raw.includes("maint")) return "Maintenance";
  if (raw.includes("service")) return "In Service";
  return "Available";
}

function buildLatestMaintenanceByVehicle(logs = []) {
  const latest = new Map();

  logs.forEach((log) => {
    const vehicleId = Number(log?.vehicle_id);
    if (!vehicleId) return;

    const current = latest.get(vehicleId);
    const dateKey = String(log?.date_of_service || "");
    if (!current || dateKey > String(current?.date_of_service || "")) {
      latest.set(vehicleId, log);
    }
  });

  return latest;
}

function isDateWithinRange(targetDate, startDate, endDate) {
  const target = String(targetDate || "");
  const start = String(startDate || "");
  const end = String(endDate || "");

  if (!target || !start || !end) return false;
  return target >= start && target <= end;
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function resolveStatusForDate({ baseStatus, latestLog, scheduleRows, statusDate }) {
  if (baseStatus === "Archived") {
    return "Archived";
  }

  if (baseStatus === "Maintenance") {
    return "Under Maintenance";
  }

  const selectedDate = String(statusDate || todayIsoDate());
  const hasMaintenance = Boolean(
    latestLog && isDateWithinRange(selectedDate, latestLog.date_of_service, latestLog.next_schedule_date)
  );

  if (hasMaintenance) {
    return "Under Maintenance";
  }

  const hasSchedule = (scheduleRows || []).some((schedule) => {
    const scheduleDate = schedule?.scheduleDate || schedule?.schedule_date || "";
    return String(scheduleDate) === selectedDate;
  });
  if (hasSchedule) {
    return "Scheduled";
  }

  if (baseStatus === "In Service") {
    return "In Service";
  }

  return "Available";
}

function scheduleMatchesVehicle(schedule, vehicle) {
  const scheduleVehicleId = Number(schedule?.vehicle_id || schedule?.vehicleId || 0);
  const vehicleId = Number(vehicle?.id || 0);

  if (scheduleVehicleId && vehicleId && scheduleVehicleId === vehicleId) {
    return true;
  }

  const scheduleVehicleName = String(schedule?.vehicleName || "").toLowerCase();
  const vehicleName = String(vehicle?.nickname || "").toLowerCase();
  const vehiclePlate = String(vehicle?.plateNumber || "").toLowerCase();

  if (!scheduleVehicleName) {
    return false;
  }

  return scheduleVehicleName === vehicleName || scheduleVehicleName.includes(vehiclePlate);
}

function emptyVehicleForm() {
  return {
    vehicle_name: "",
    plate_number: "",
    vehicle_type: "Sedan",
    transmission_type: "Automatic",
  };
}

function emptyMaintenanceForm() {
  return {
    vehicle_id: "",
    service_type: "",
    date_of_service: new Date().toISOString().slice(0, 10),
    next_schedule_date: "",
    maintenance_cost: "",
    remarks: "",
  };
}

function emptyFuelForm() {
  return {
    vehicle_id: "",
    liters: "",
    amount_spent: "",
    odometer_reading: "",
    odometer_start: "",
    odometer_end: "",
    logged_at: new Date().toISOString().slice(0, 10),
  };
}

function normalizeDateInput(value) {
  if (!value) return todayIsoDate();
  return String(value).slice(0, 10);
}

function buildVehicleFormValue(vehicle, baseForm) {
  return {
    ...baseForm,
    vehicle_id: vehicle?.id ? String(vehicle.id) : "",
  };
}

function formatMoney(value) {
  return `PHP ${Number(value || 0).toFixed(2)}`;
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function currentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: now.toISOString().slice(0, 10),
  };
}

export default function VehiclesPage() {
  const navigate = useNavigate();
  const { auth, role, logout } = useAuth();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [statusDate, setStatusDate] = useState(() => todayIsoDate());
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [scheduleRows, setScheduleRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(() => emptyVehicleForm());

  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [maintenanceForm, setMaintenanceForm] = useState(() => emptyMaintenanceForm());
  const [maintenanceSaving, setMaintenanceSaving] = useState(false);
  const [maintenanceVehicle, setMaintenanceVehicle] = useState(null);

  const [isFuelOpen, setIsFuelOpen] = useState(false);
  const [fuelForm, setFuelForm] = useState(() => emptyFuelForm());
  const [fuelSaving, setFuelSaving] = useState(false);
  const [fuelVehicle, setFuelVehicle] = useState(null);

  const [isUsageOpen, setIsUsageOpen] = useState(false);
  const [usageLoading, setUsageLoading] = useState(false);
  const [usageError, setUsageError] = useState("");
  const [usageRows, setUsageRows] = useState([]);
  const [vehicleActionLoadingId, setVehicleActionLoadingId] = useState(null);

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportVehicle, setReportVehicle] = useState(null);

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

  async function loadVehicles() {
    setLoading(true);
    setError("");

    try {
      const [vehicles, logs, fuelEntries, daySchedules] = await Promise.all([
        resourceServices.vehicles.list(),
        resourceServices.maintenanceLogs.list(),
        resourceServices.fuelLogs.list(),
        fetchScheduleDay(normalizeDateInput(statusDate)),
      ]);
      const latestMaintenanceByVehicle = buildLatestMaintenanceByVehicle(logs || []);
      const mapped = (vehicles || []).map((item, index) => {
        const type = normalizeVehicleType(item.vehicle_type, item.vehicle_name);
        const baseStatus = normalizeVehicleStatus(item.status);
        const latestMaintenance = latestMaintenanceByVehicle.get(Number(item.id));
        return {
          id: item.id,
          nickname: item.vehicle_name || `${type} ${index + 1}`,
          makeModel: item.make_model || "Fleet Unit",
          plateNumber: item.plate_number || "No Plate",
          vehicleType: type,
          transmissionType: item.transmission_type || "Automatic",
          baseStatus,
          latestMaintenance,
          maintainedBy: item.maintained_by || "Fleet Manager",
        };
      });

      setRows(mapped);
      setMaintenanceLogs(logs || []);
      setFuelLogs(fuelEntries || []);
      setScheduleRows(daySchedules || []);
    } catch (loadError) {
      setError(loadError?.message || "Failed to load vehicles.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    Promise.resolve().then(() => {
      void loadVehicles();
    });
    // loadVehicles is intentionally recreated from component state; statusDate drives refreshes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusDate]);

  const rowsWithStatus = useMemo(() => {
    const selectedDate = normalizeDateInput(statusDate);

    return rows.map((row) => {
      const relatedSchedules = (scheduleRows || []).filter((schedule) => scheduleMatchesVehicle(schedule, row));
      const status = resolveStatusForDate({
        baseStatus: row.baseStatus,
        latestLog: row.latestMaintenance,
        scheduleRows: relatedSchedules,
        statusDate: selectedDate,
      });

      return {
        ...row,
        status,
      };
    });
  }, [rows, scheduleRows, statusDate]);

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return rowsWithStatus.filter((row) => {
      const matchesSearch =
        !keyword ||
        [row.nickname, row.makeModel, row.plateNumber, row.maintainedBy, row.vehicleType]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(keyword));

      const matchesTab =
        (activeTab === "all" && row.status !== "Archived") ||
        (activeTab === "sedans" && row.vehicleType === "Sedan") ||
        (activeTab === "tricycles" && row.vehicleType === "Tricycle") ||
        (activeTab === "motorcycles" && row.vehicleType === "Motorcycle") ||
        (activeTab === "maintenance" && row.status === "Under Maintenance") ||
        (activeTab === "archived" && row.status === "Archived");

      return matchesSearch && matchesTab;
    });
  }, [rowsWithStatus, search, activeTab]);

  const overdueVehicleIds = useMemo(() => {
    const nowIso = new Date().toISOString().slice(0, 10);
    const latestByVehicle = buildLatestMaintenanceByVehicle(maintenanceLogs || []);

    return new Set(
      Array.from(latestByVehicle.values())
        .filter((item) => String(item?.next_schedule_date || "") < nowIso)
        .map((item) => Number(item.vehicle_id))
    );
  }, [maintenanceLogs]);

  useEffect(() => {
    Promise.resolve().then(() => {
      setPage(1);
    });
  }, [activeTab, search]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const pagedRows = filteredRows.slice(startIndex, startIndex + PAGE_SIZE);
  const activeVehicleOptions = rowsWithStatus.filter((row) => row.status !== "Archived");

  async function submitVehicle(event) {
    event.preventDefault();
    if (!form.vehicle_name.trim() || !form.plate_number.trim()) {
      window.alert("Vehicle nickname and plate number are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await resourceServices.vehicles.create({
        vehicle_name: form.vehicle_name.trim(),
        plate_number: form.plate_number.trim(),
        vehicle_type: form.vehicle_type,
        transmission_type: form.transmission_type,
      });
      setIsModalOpen(false);
      setForm(emptyVehicleForm());
      await loadVehicles();
    } catch (submitError) {
      window.alert(submitError?.message || "Failed to add vehicle.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitMaintenance(event) {
    event.preventDefault();

    if (!maintenanceForm.vehicle_id || !maintenanceForm.service_type || !maintenanceForm.date_of_service || !maintenanceForm.next_schedule_date) {
      window.alert("Please complete all required maintenance fields.");
      return;
    }

    setMaintenanceSaving(true);
    try {
      await resourceServices.maintenanceLogs.create({
        vehicle_id: Number(maintenanceForm.vehicle_id),
        service_type: maintenanceForm.service_type.trim(),
        date_of_service: maintenanceForm.date_of_service,
        next_schedule_date: maintenanceForm.next_schedule_date,
        maintenance_cost: maintenanceForm.maintenance_cost ? Number(maintenanceForm.maintenance_cost) : 0,
        remarks: maintenanceForm.remarks.trim() || null,
      });
      setIsMaintenanceOpen(false);
      setMaintenanceForm(emptyMaintenanceForm());
      await loadVehicles();
    } catch (saveError) {
      window.alert(saveError?.message || "Failed to save maintenance log.");
    } finally {
      setMaintenanceSaving(false);
    }
  }

  async function submitFuel(event) {
    event.preventDefault();

    if (!fuelForm.vehicle_id || !fuelForm.liters || !fuelForm.amount_spent || !fuelForm.odometer_reading) {
      window.alert("Please complete all fuel log fields.");
      return;
    }

    setFuelSaving(true);
    try {
      await resourceServices.fuelLogs.create({
        vehicle_id: Number(fuelForm.vehicle_id),
        liters: Number(fuelForm.liters),
        amount_spent: Number(fuelForm.amount_spent),
        odometer_reading: Number(fuelForm.odometer_reading),
        odometer_start: fuelForm.odometer_start ? Number(fuelForm.odometer_start) : null,
        odometer_end: fuelForm.odometer_end ? Number(fuelForm.odometer_end) : null,
        logged_at: fuelForm.logged_at || new Date().toISOString().slice(0, 10),
      });
      setIsFuelOpen(false);
      setFuelForm(emptyFuelForm());
    } catch (saveError) {
      window.alert(saveError?.message || "Failed to save fuel log.");
    } finally {
      setFuelSaving(false);
    }
  }

  async function openUsageModal() {
    setIsUsageOpen(true);
    setUsageLoading(true);
    setUsageError("");

    try {
      const range = currentMonthRange();
      const payload = await fetchReportOverview({
        startDate: range.startDate,
        endDate: range.endDate,
        course: "overall",
      });
      setUsageRows(payload?.usageByVehicle || []);
    } catch (fetchError) {
      setUsageError(fetchError?.message || "Failed to load usage summary.");
      setUsageRows([]);
    } finally {
      setUsageLoading(false);
    }
  }

  function openMaintenanceForVehicle(vehicle) {
    if (!vehicle || vehicle.status === "Archived") return;

    setMaintenanceForm(buildVehicleFormValue(vehicle, emptyMaintenanceForm()));
    setMaintenanceVehicle(vehicle);
    setIsMaintenanceOpen(true);
  }

  function openFuelForVehicle(vehicle) {
    if (!vehicle || vehicle.status === "Archived") return;

    setFuelForm(buildVehicleFormValue(vehicle, emptyFuelForm()));
    setFuelVehicle(vehicle);
    setIsFuelOpen(true);
  }

  function openReportForVehicle(vehicle) {
    if (!vehicle) return;

    setReportVehicle(vehicle);
    setIsReportOpen(true);
  }

  function openQuickMaintenance() {
    setMaintenanceVehicle(null);
    setMaintenanceForm((current) => ({
      ...current,
      vehicle_id: activeVehicleOptions[0]?.id ? String(activeVehicleOptions[0].id) : "",
    }));
    setIsMaintenanceOpen(true);
  }

  function openQuickFuel() {
    setFuelVehicle(null);
    setFuelForm((current) => ({
      ...current,
      vehicle_id: activeVehicleOptions[0]?.id ? String(activeVehicleOptions[0].id) : "",
    }));
    setIsFuelOpen(true);
  }

  async function archiveVehicle(row) {
    if (!row || vehicleActionLoadingId) return;

    const shouldArchive = window.confirm(`Archive vehicle ${row.nickname}?`);
    if (!shouldArchive) return;

    setVehicleActionLoadingId(row.id);
    try {
      await resourceServices.vehicles.update(row.id, { status: "Archived" });
      await loadVehicles();
    } catch (archiveError) {
      window.alert(archiveError?.message || "Failed to archive vehicle.");
    } finally {
      setVehicleActionLoadingId(null);
    }
  }

  async function restoreVehicle(row) {
    if (!row || vehicleActionLoadingId) return;

    setVehicleActionLoadingId(row.id);
    try {
      await resourceServices.vehicles.update(row.id, { status: "Available" });
      await loadVehicles();
    } catch (restoreError) {
      window.alert(restoreError?.message || "Failed to restore vehicle.");
    } finally {
      setVehicleActionLoadingId(null);
    }
  }

  async function deleteArchivedVehicle(row) {
    if (!row || vehicleActionLoadingId) return;

    const shouldDelete = window.confirm(`Delete archived vehicle ${row.nickname}? This cannot be undone.`);
    if (!shouldDelete) return;

    setVehicleActionLoadingId(row.id);
    try {
      await resourceServices.vehicles.remove(row.id);
      await loadVehicles();
    } catch (deleteError) {
      window.alert(deleteError?.message || "Failed to delete vehicle.");
    } finally {
      setVehicleActionLoadingId(null);
    }
  }

  return (
    <section className="space-y-4">
      <div className="rounded-xl border-t-2 border-t-[#D4AF37] border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#800000] px-4 py-2 text-xs font-semibold text-white"
          >
            <Plus size={14} />
            Add Vehicle
          </button>

          <label className="ml-auto flex min-w-52 flex-1 items-center gap-2 rounded-full bg-[#800000] px-3 py-2 transition hover:bg-[#600000]">
            <Search size={14} className="text-[#D4AF37]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search vehicles..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/70"
            />
          </label>

          {(role === "admin" || role === "sub_admin") ? (
            <NotificationBell
              buttonClassName="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#D4AF37]/70 bg-[#800000] text-[#D4AF37] transition hover:bg-[#600000]"
              iconSize={14}
              dropdownClassName="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
            />
          ) : (
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#D4AF37]/70 bg-[#800000] text-[#D4AF37] transition hover:bg-[#600000]"
              aria-label="Notifications"
            >
              <BellRing size={14} />
            </button>
          )}

          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen((value) => !value)}
              className="inline-flex items-center gap-1 rounded-full border border-[#D4AF37]/70 bg-[#800000] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#600000]"
            >
              <UserRound size={13} className="text-[#D4AF37]" />
              {auth?.user?.name || "System Admin"}
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
                    <UserRoundCog size={14} />
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
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-4">
          <section className="rounded-xl border-t-2 border-t-[#D4AF37] border-slate-200 bg-white p-4 shadow-sm">
            <h1 className="text-xl font-bold text-slate-900">Vehicle Inventory</h1>

            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              <span className="font-semibold text-slate-700">Status date</span>
              <input
                type="date"
                value={statusDate}
                onChange={(event) => setStatusDate(event.target.value)}
                className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 outline-none"
              />
              <span className="text-slate-500">Badge updates to match the selected day.</span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`rounded-lg px-4 py-2 text-xs font-semibold ${
                  activeTab === "all" ? "bg-[#800000] text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                All Vehicle
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("sedans")}
                className={`rounded-lg px-4 py-2 text-xs font-semibold ${
                  activeTab === "sedans" ? "bg-[#800000] text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                Four Wheels
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("motorcycles")}
                className={`rounded-lg px-4 py-2 text-xs font-semibold ${
                  activeTab === "motorcycles" ? "bg-[#800000] text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                Motorcycles
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("tricycles")}
                className={`rounded-lg px-4 py-2 text-xs font-semibold ${
                  activeTab === "tricycles" ? "bg-[#800000] text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                Tricycle (3 Wheels)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("maintenance")}
                className={`rounded-lg px-4 py-2 text-xs font-semibold ${
                  activeTab === "maintenance" ? "bg-[#800000] text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                Under Maintenance
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("archived")}
                className={`rounded-lg px-4 py-2 text-xs font-semibold ${
                  activeTab === "archived" ? "bg-[#800000] text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                Archived
              </button>
            </div>

            {error ? (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            ) : null}

            <div className="mt-4 min-h-80 rounded-xl border border-slate-200 bg-slate-50 p-4">
              {loading ? <p className="text-sm text-slate-500">Loading fleet...</p> : null}

              {!loading && pagedRows.length === 0 ? (
                <p className="text-sm text-slate-500">No vehicles found for this filter.</p>
              ) : null}

              {!loading && pagedRows.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {pagedRows.map((row) => {
                    const isBike = row.vehicleType === "Motorcycle" || row.vehicleType === "Tricycle";
                    const TypeIcon = isBike ? Bike : Car;

                    return (
                      <article key={row.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                        <div className="flex items-start justify-between gap-2">
                          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#800000]/10 text-[#800000]">
                            <TypeIcon size={18} />
                          </div>
                          <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${STATUS_STYLES[row.status] || STATUS_STYLES.Available}`}>
                            {row.status}
                          </span>
                        </div>

                        {overdueVehicleIds.has(Number(row.id)) ? (
                          <p className="mt-2 inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                            Maintenance Overdue
                          </p>
                        ) : null}

                        <h3 className="mt-3 text-sm font-bold text-slate-900">{row.nickname}</h3>
                        <p className="text-xs text-slate-600">{row.makeModel}</p>

                        <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                          <p>
                            <span className="font-semibold text-slate-800">Plate:</span> {row.plateNumber}
                          </p>
                          <p>
                            <span className="font-semibold text-slate-800">Type:</span> {vehicleTypeLabel(row.vehicleType)}
                          </p>
                          <p>
                            <span className="font-semibold text-slate-800">Transmission:</span> {row.transmissionType || "Automatic"}
                          </p>
                          <p>
                            <span className="font-semibold text-slate-800">Maintained By:</span> {row.maintainedBy}
                          </p>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => openMaintenanceForVehicle(row)}
                            disabled={row.status === "Archived"}
                            title={row.status === "Archived" ? "Restore this vehicle before logging maintenance." : "Schedule maintenance for this vehicle."}
                            className="inline-flex items-center justify-center gap-1 rounded-md border border-rose-300 bg-rose-50 px-2.5 py-1.5 text-[11px] font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Wrench size={12} />
                            Schedule Maintenance
                          </button>
                          <button
                            type="button"
                            onClick={() => openFuelForVehicle(row)}
                            disabled={row.status === "Archived"}
                            title={row.status === "Archived" ? "Restore this vehicle before logging fuel." : "Log fuel expense for this vehicle."}
                            className="inline-flex items-center justify-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Fuel size={12} />
                            Log Fuel Expense
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => openReportForVehicle(row)}
                          className="mt-2 w-full rounded-md border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          View Report
                        </button>

                        <div className="mt-3 flex gap-2">
                          {row.status === "Archived" ? (
                            <>
                              <button
                                type="button"
                                onClick={() => restoreVehicle(row)}
                                disabled={vehicleActionLoadingId === row.id}
                                className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 disabled:opacity-60"
                              >
                                Restore
                              </button>
                              {activeTab === "archived" ? (
                                <button
                                  type="button"
                                  onClick={() => deleteArchivedVehicle(row)}
                                  disabled={vehicleActionLoadingId === row.id}
                                  className="inline-flex items-center gap-1 rounded-md border border-rose-300 bg-rose-50 px-2.5 py-1.5 text-[11px] font-semibold text-rose-700 disabled:opacity-60"
                                >
                                  <Trash2 size={12} /> Delete
                                </button>
                              ) : null}
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => archiveVehicle(row)}
                              disabled={vehicleActionLoadingId === row.id}
                              className="rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold text-amber-700 disabled:opacity-60"
                            >
                              Archive
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : null}
            </div>

            <div className="mt-3 flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={safePage <= 1}
                className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-600 disabled:opacity-50"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setPage(num)}
                  className={`h-7 min-w-7 rounded-md px-2 text-xs font-semibold ${
                    num === safePage ? "bg-[#800000] text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={safePage >= totalPages}
                className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-600 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </section>
        </div>

        <aside className="rounded-xl border-t-2 border-t-[#D4AF37] border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-bold text-slate-900">Quick Actions</p>
          <p className="mt-1 text-xs text-slate-500">Vehicle operations shortcuts</p>

          <div className="mt-3 space-y-2">
            <button
              type="button"
              onClick={openQuickMaintenance}
              className="w-full rounded-lg bg-[#800000] px-3 py-2 text-left text-xs font-semibold text-white"
            >
              <span className="inline-flex items-center gap-2">
                <Wrench size={14} />
                Schedule Maintenance
              </span>
            </button>
            <button
              type="button"
              onClick={openQuickFuel}
              className="inline-flex w-full items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Fuel size={14} className="text-[#800000]" />
              Log Fuel Expense
            </button>
            <button
              type="button"
              onClick={openUsageModal}
              className="inline-flex w-full items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Clock3 size={14} className="text-[#800000]" />
              View Vehicle Usage Reports
            </button>
          </div>
        </aside>
      </div>

      {isModalOpen ? (
        <div
          style={{ left: "var(--app-sidebar-width, 0px)", width: "calc(100vw - var(--app-sidebar-width, 0px))" }}
          className="fixed inset-y-0 right-0 z-50 flex items-center justify-center bg-slate-900/30 p-4"
        >
          <div className="w-full max-w-xl rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Add Vehicle</h2>
              <button
                type="button"
                onClick={() => {
                  if (!isSubmitting) {
                    setIsModalOpen(false);
                    setForm(emptyVehicleForm());
                  }
                }}
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
              >
                <ChevronDown size={16} className="rotate-45" />
              </button>
            </div>

            <form className="mt-4 space-y-3" onSubmit={submitVehicle}>
              <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                Vehicle Nickname / ID
                <input
                  value={form.vehicle_name}
                  onChange={(event) => setForm((current) => ({ ...current, vehicle_name: event.target.value }))}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#800000]"
                  placeholder="Car 1"
                  required
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                  Plate Number
                  <input
                    value={form.plate_number}
                    onChange={(event) => setForm((current) => ({ ...current, plate_number: event.target.value }))}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#800000]"
                    placeholder="ABC-1234"
                    required
                  />
                </label>

                <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                  Vehicle Type
                  <select
                    value={form.vehicle_type}
                    onChange={(event) => setForm((current) => ({ ...current, vehicle_type: event.target.value }))}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#800000]"
                  >
                    <option value="Sedan">Four Wheels</option>
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="Tricycle">Tricycle (3 Wheels)</option>
                  </select>
                </label>
              </div>

              <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                Transmission Type
                <select
                  value={form.transmission_type}
                  onChange={(event) => setForm((current) => ({ ...current, transmission_type: event.target.value }))}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#800000]"
                >
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
              </label>

              <div className="mt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!isSubmitting) {
                      setIsModalOpen(false);
                      setForm(emptyVehicleForm());
                    }
                  }}
                  className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-md bg-[#800000] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Create Vehicle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isMaintenanceOpen ? (
        <div
          style={{ left: "var(--app-sidebar-width, 0px)", width: "calc(100vw - var(--app-sidebar-width, 0px))" }}
          className="fixed inset-y-0 right-0 z-50 flex items-center justify-center bg-slate-900/30 p-4"
        >
          <div className="w-full max-w-xl rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="inline-flex items-center gap-2 text-lg font-bold text-slate-900">
                <Wrench size={17} className="text-[#800000]" />
                Maintenance Scheduler
              </h2>
              <button
                type="button"
                  onClick={() => {
                    if (!maintenanceSaving) {
                      setIsMaintenanceOpen(false);
                      setMaintenanceVehicle(null);
                    }
                  }}
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            <form className="mt-4 space-y-3" onSubmit={submitMaintenance}>
              <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                Vehicle Name
                {maintenanceVehicle ? (
                  <input
                    value={`${maintenanceVehicle.nickname} (${maintenanceVehicle.plateNumber})`}
                    readOnly
                    className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none"
                  />
                ) : (
                  <select
                    value={maintenanceForm.vehicle_id}
                    onChange={(event) => setMaintenanceForm((current) => ({ ...current, vehicle_id: event.target.value }))}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#800000]"
                    required
                  >
                    <option value="">Select vehicle</option>
                    {activeVehicleOptions.map((vehicle) => (
                      <option key={vehicle.id} value={String(vehicle.id)}>{vehicle.nickname} ({vehicle.plateNumber})</option>
                    ))}
                  </select>
                )}
              </label>

              <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                Service Type
                <input
                  value={maintenanceForm.service_type}
                  onChange={(event) => setMaintenanceForm((current) => ({ ...current, service_type: event.target.value }))}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#800000]"
                  placeholder="Change Oil / Tire Rotation / Registration"
                  required
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                  Date of Service
                  <input
                    type="date"
                    value={maintenanceForm.date_of_service}
                    onChange={(event) => setMaintenanceForm((current) => ({ ...current, date_of_service: event.target.value }))}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#800000]"
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                  Next Schedule Date
                  <input
                    type="date"
                    value={maintenanceForm.next_schedule_date}
                    onChange={(event) => setMaintenanceForm((current) => ({ ...current, next_schedule_date: event.target.value }))}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#800000]"
                    required
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                Maintenance Cost (optional)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={maintenanceForm.maintenance_cost}
                  onChange={(event) => setMaintenanceForm((current) => ({ ...current, maintenance_cost: event.target.value }))}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#800000]"
                  placeholder="0.00"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                Remarks
                <textarea
                  value={maintenanceForm.remarks}
                  onChange={(event) => setMaintenanceForm((current) => ({ ...current, remarks: event.target.value }))}
                  className="min-h-20 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#800000]"
                  placeholder="Optional notes"
                />
              </label>

              <div className="mt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!maintenanceSaving) {
                      setIsMaintenanceOpen(false);
                      setMaintenanceVehicle(null);
                    }
                  }}
                  className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={maintenanceSaving}
                  className="rounded-md bg-[#800000] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {maintenanceSaving ? "Saving..." : "Save Maintenance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isFuelOpen ? (
        <div
          style={{ left: "var(--app-sidebar-width, 0px)", width: "calc(100vw - var(--app-sidebar-width, 0px))" }}
          className="fixed inset-y-0 right-0 z-50 flex items-center justify-center bg-slate-900/30 p-4"
        >
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="inline-flex items-center gap-2 text-lg font-bold text-slate-900">
                <Fuel size={17} className="text-[#800000]" />
                Fuel Log Entry
              </h2>
              <button
                type="button"
                  onClick={() => {
                    if (!fuelSaving) {
                      setIsFuelOpen(false);
                      setFuelVehicle(null);
                    }
                  }}
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            <form className="mt-4 space-y-3" onSubmit={submitFuel}>
              <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                Vehicle
                {fuelVehicle ? (
                  <input
                    value={`${fuelVehicle.nickname} (${fuelVehicle.plateNumber})`}
                    readOnly
                    className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none"
                  />
                ) : (
                  <select
                    value={fuelForm.vehicle_id}
                    onChange={(event) => setFuelForm((current) => ({ ...current, vehicle_id: event.target.value }))}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#800000]"
                    required
                  >
                    <option value="">Select vehicle</option>
                    {activeVehicleOptions.map((vehicle) => (
                      <option key={vehicle.id} value={String(vehicle.id)}>{vehicle.nickname} ({vehicle.plateNumber})</option>
                    ))}
                  </select>
                )}
              </label>

              <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                Liters
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={fuelForm.liters}
                  onChange={(event) => setFuelForm((current) => ({ ...current, liters: event.target.value }))}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#800000]"
                  placeholder="0.00"
                  required
                />
              </label>

              <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                Amount Spent
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={fuelForm.amount_spent}
                  onChange={(event) => setFuelForm((current) => ({ ...current, amount_spent: event.target.value }))}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#800000]"
                  placeholder="0.00"
                  required
                />
              </label>

              <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                Current Odometer Reading
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={fuelForm.odometer_reading}
                  onChange={(event) => setFuelForm((current) => ({ ...current, odometer_reading: event.target.value }))}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#800000]"
                  placeholder="0"
                  required
                />
              </label>

                <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                  Odometer Start (optional)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={fuelForm.odometer_start}
                    onChange={(event) => setFuelForm((current) => ({ ...current, odometer_start: event.target.value }))}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#800000]"
                    placeholder="0"
                  />
                </label>

                <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                  Odometer End (optional)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={fuelForm.odometer_end}
                    onChange={(event) => setFuelForm((current) => ({ ...current, odometer_end: event.target.value }))}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#800000]"
                    placeholder="0"
                  />
                </label>

              <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                Date Logged
                <input
                  type="date"
                  value={fuelForm.logged_at}
                  onChange={(event) => setFuelForm((current) => ({ ...current, logged_at: event.target.value }))}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#800000]"
                />
              </label>

              <div className="mt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!fuelSaving) {
                      setIsFuelOpen(false);
                      setFuelVehicle(null);
                    }
                  }}
                  className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={fuelSaving}
                  className="rounded-md bg-[#800000] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {fuelSaving ? "Saving..." : "Save Fuel Log"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isUsageOpen ? (
        <div
          style={{ left: "var(--app-sidebar-width, 0px)", width: "calc(100vw - var(--app-sidebar-width, 0px))" }}
          className="fixed inset-y-0 right-0 z-50 flex items-center justify-center bg-slate-900/35 p-4"
        >
          <div className="w-full max-w-3xl rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="inline-flex items-center gap-2 text-lg font-bold text-slate-900">
                <Clock3 size={17} className="text-[#800000]" />
                Vehicle Usage Reports
              </h2>
              <button
                type="button"
                onClick={() => setIsUsageOpen(false)}
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            <p className="mt-1 text-xs text-slate-500">Completed PDC sessions this month with total training hours per vehicle.</p>

            {usageError ? (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{usageError}</p>
            ) : null}

            {usageLoading ? <p className="mt-4 text-sm text-slate-500">Loading usage summary...</p> : null}

            {!usageLoading && usageRows.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">No completed PDC usage records found for this month.</p>
            ) : null}

            {!usageLoading && usageRows.length > 0 ? (
              <div className="mt-4 space-y-3">
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50 text-left">
                      <tr>
                        <th className="px-3 py-2 font-semibold text-slate-700">Vehicle</th>
                        <th className="px-3 py-2 font-semibold text-slate-700">Type</th>
                        <th className="px-3 py-2 font-semibold text-slate-700">Completed Sessions</th>
                        <th className="px-3 py-2 font-semibold text-slate-700">Total Training Hours</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {usageRows.map((row) => (
                        <tr key={row.vehicleId}>
                          <td className="px-3 py-2 text-slate-800">{row.vehicleName} ({row.plateNumber || "No Plate"})</td>
                          <td className="px-3 py-2 text-slate-700">{row.vehicleType}</td>
                          <td className="px-3 py-2 text-slate-700">{row.completedSessions}</td>
                          <td className="px-3 py-2 font-semibold text-[#800000]">{row.totalTrainingHours}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  {(() => {
                    const maxHours = Math.max(1, ...usageRows.map((item) => Number(item.totalTrainingHours) || 0));
                    return (
                      <div className="space-y-2">
                        {usageRows.map((item) => (
                          <div key={`bar-${item.vehicleId}`}>
                            <div className="mb-1 flex items-center justify-between text-xs text-slate-700">
                              <span>{item.vehicleName}</span>
                              <span>{item.totalTrainingHours} hrs</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                              <div
                                className="h-full rounded-full bg-[#800000]"
                                style={{ width: `${Math.max(8, (Number(item.totalTrainingHours) / maxHours) * 100)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {isReportOpen && reportVehicle ? (
        <div
          style={{ left: "var(--app-sidebar-width, 0px)", width: "calc(100vw - var(--app-sidebar-width, 0px))" }}
          className="fixed inset-y-0 right-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
        >
          <div className="w-full max-w-4xl rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Vehicle Report</h2>
                <p className="text-sm text-slate-500">
                  {reportVehicle.nickname} · {reportVehicle.plateNumber} · {vehicleTypeLabel(reportVehicle.vehicleType)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsReportOpen(false);
                  setReportVehicle(null);
                }}
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            {(() => {
              const vehicleId = Number(reportVehicle.id);
              const maintenanceRows = (maintenanceLogs || []).filter((log) => Number(log.vehicle_id) === vehicleId);
              const fuelRows = (fuelLogs || []).filter((log) => Number(log.vehicle_id) === vehicleId);

              return (
                <div className="mt-4 space-y-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Maintenance Entries</p>
                      <p className="mt-1 text-2xl font-bold text-slate-900">{maintenanceRows.length}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Fuel Entries</p>
                      <p className="mt-1 text-2xl font-bold text-slate-900">{fuelRows.length}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Total Fuel Expense</p>
                      <p className="mt-1 text-2xl font-bold text-slate-900">{formatMoney(fuelRows.reduce((sum, log) => sum + Number(log.amount_spent || 0), 0))}</p>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <section className="rounded-xl border border-slate-200">
                      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                        <h3 className="text-sm font-bold text-slate-900">Maintenance Report</h3>
                      </div>
                      <div className="max-h-80 overflow-auto p-4">
                        {maintenanceRows.length === 0 ? (
                          <p className="text-sm text-slate-500">No maintenance records for this vehicle.</p>
                        ) : (
                          <div className="space-y-3">
                            {maintenanceRows.map((log) => (
                              <article key={log.id} className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="font-semibold text-slate-900">{log.service_type}</p>
                                  <span className="text-xs text-slate-500">{formatDate(log.date_of_service)}</span>
                                </div>
                                <p className="mt-1 text-xs text-slate-600">Next schedule: {formatDate(log.next_schedule_date)}</p>
                                <p className="mt-1 text-xs text-slate-600">Cost: {formatMoney(log.maintenance_cost)}</p>
                                {log.remarks ? <p className="mt-1 text-xs text-slate-600">Remarks: {log.remarks}</p> : null}
                              </article>
                            ))}
                          </div>
                        )}
                      </div>
                    </section>

                    <section className="rounded-xl border border-slate-200">
                      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                        <h3 className="text-sm font-bold text-slate-900">Fuel Expense Report</h3>
                      </div>
                      <div className="max-h-80 overflow-auto p-4">
                        {fuelRows.length === 0 ? (
                          <p className="text-sm text-slate-500">No fuel records for this vehicle.</p>
                        ) : (
                          <div className="space-y-3">
                            {fuelRows.map((log) => (
                              <article key={log.id} className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="font-semibold text-slate-900">{formatDate(log.logged_at)}</p>
                                  <span className="text-xs font-semibold text-[#800000]">{formatMoney(log.amount_spent)}</span>
                                </div>
                                <p className="mt-1 text-xs text-slate-600">Liters: {Number(log.liters || 0).toFixed(2)}</p>
                                <p className="mt-1 text-xs text-slate-600">Odometer: {Number(log.odometer_reading || 0).toFixed(2)}</p>
                                {log.odometer_start !== null && log.odometer_end !== null ? (
                                  <>
                                    <p className="mt-1 text-xs text-slate-600">Distance: {Number(log.distance_travelled || (Number(log.odometer_end) - Number(log.odometer_start))).toFixed(2)} km</p>
                                    <p className="mt-1 text-xs text-slate-600">Fuel Efficiency: {(Number(log.liters || 0) > 0 ? Number(log.distance_travelled || (Number(log.odometer_end) - Number(log.odometer_start))) / Number(log.liters) : 0).toFixed(2)} km/L</p>
                                  </>
                                ) : null}
                              </article>
                            ))}
                          </div>
                        )}
                      </div>
                    </section>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      ) : null}
    </section>
  );
}
