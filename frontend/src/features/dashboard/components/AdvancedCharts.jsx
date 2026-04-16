import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

const COLORS = ["#800000", "#D4AF37", "#10b981", "#3b82f6", "#f59e0b", "#8b5cf6"];

export function EnrollmentTrendChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
        <p className="text-sm text-slate-500">No enrollment data available</p>
      </div>
    );
  }

  const chartData = data.map((item, idx) => ({
    month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][item.month],
    TDC: item.tdc || 0,
    "PDC-B": item.pdcBeginner || 0,
    "PDC-E": item.pdcExperience || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
        <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
        <Tooltip 
          contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }}
          labelStyle={{ color: "#f1f5f9" }}
          itemStyle={{ color: "#f1f5f9" }}
        />
        <Legend />
        <Line type="monotone" dataKey="TDC" stroke="#800000" strokeWidth={2} />
        <Line type="monotone" dataKey="PDC-B" stroke="#D4AF37" strokeWidth={2} />
        <Line type="monotone" dataKey="PDC-E" stroke="#10b981" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function EnrollmentAreaChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
        <p className="text-sm text-slate-500">No enrollment data available</p>
      </div>
    );
  }

  const chartData = data.map((item, idx) => ({
    month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][item.month],
    TDC: item.tdc || 0,
    "PDC-B": item.pdcBeginner || 0,
    "PDC-E": item.pdcExperience || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="colorTDC" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#800000" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#800000" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorPDCB" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorPDCE" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
        <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
        <Tooltip 
          contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }}
          labelStyle={{ color: "#f1f5f9" }}
          itemStyle={{ color: "#f1f5f9" }}
        />
        <Legend />
        <Area type="monotone" dataKey="TDC" stroke="#800000" fillOpacity={1} fill="url(#colorTDC)" />
        <Area type="monotone" dataKey="PDC-B" stroke="#D4AF37" fillOpacity={1} fill="url(#colorPDCB)" />
        <Area type="monotone" dataKey="PDC-E" stroke="#10b981" fillOpacity={1} fill="url(#colorPDCE)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CompletionGaugeChart({ completionRate }) {
  const data = [
    { name: "Remaining", value: Math.max(0, 100 - (completionRate || 0)), fill: "#e2e8f0" },
    { name: "Completed", value: completionRate || 0, fill: "#10b981" },
  ];

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={180}
            endAngle={0}
            innerRadius={80}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center mt-2">
        <p className="text-3xl font-bold text-slate-900">{completionRate}%</p>
        <p className="text-xs text-slate-600">Completion Rate</p>
      </div>
    </div>
  );
}

export function ComboEnrollmentChart({ monthlyData, completionRate }) {
  if (!monthlyData || monthlyData.length === 0) return null;

  const chartData = monthlyData.map((item, idx) => ({
    month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][item.month],
    enrollments: (item.tdc || 0) + (item.pdcBeginner || 0) + (item.pdcExperience || 0),
    "Pass Rate": completionRate || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
        <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} yAxisId="left" />
        <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} yAxisId="right" orientation="right" domain={[0, 100]} />
        <Tooltip 
          contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }}
          labelStyle={{ color: "#f1f5f9" }}
          itemStyle={{ color: "#f1f5f9" }}
        />
        <Legend />
        <Bar yAxisId="left" dataKey="enrollments" fill="#800000" name="Total Enrollments" />
        <Line yAxisId="right" type="monotone" dataKey="Pass Rate" stroke="#D4AF37" strokeWidth={2} name="Pass Rate %" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function EnrollmentDistributionChart({ stats }) {
  if (!stats) return null;

  const data = [
    { name: "TDC", value: stats.tdc || 0, fill: COLORS[0] },
    { name: "PDC-B", value: stats.pdcBeginner || 0, fill: COLORS[1] },
    { name: "PDC-E", value: stats.pdcExperience || 0, fill: COLORS[2] },
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
        <p className="text-sm text-slate-500">No enrollment data available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 grid grid-cols-3 gap-4">
        {data.map((item) => (
          <div key={item.name} className="text-center">
            <div className="flex h-3 w-3 rounded-full mx-auto mb-1" style={{ backgroundColor: item.fill }} />
            <p className="text-xs font-semibold text-slate-700">{item.name}</p>
            <p className="text-sm font-bold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PerformanceMetricsChart({ completionRate, passRate }) {
  const data = [
    { metric: "Completion", value: completionRate || 0, fill: COLORS[0] },
    { metric: "Pass Rate", value: passRate || 0, fill: COLORS[3] },
  ];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis stroke="#94a3b8" style={{ fontSize: "12px" }} dataKey="metric" />
        <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} domain={[0, 100]} />
        <Tooltip 
          contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }}
          labelStyle={{ color: "#f1f5f9" }}
          itemStyle={{ color: "#f1f5f9" }}
          formatter={(value) => `${value}%`}
        />
        <Bar dataKey="value" fill="#800000" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function VehicleUsageChart({ usageByVehicle }) {
  if (!usageByVehicle || usageByVehicle.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
        <p className="text-sm text-slate-500">No vehicle usage data</p>
      </div>
    );
  }

  const chartData = usageByVehicle.map((vehicle) => ({
    name: vehicle.vehicleName?.substring(0, 15) || "Vehicle",
    sessions: vehicle.completedSessions || 0,
    hours: vehicle.totalTrainingHours || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis stroke="#94a3b8" style={{ fontSize: "11px" }} angle={-45} textAnchor="end" height={80} />
        <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
        <Tooltip 
          contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }}
          labelStyle={{ color: "#f1f5f9" }}
          itemStyle={{ color: "#f1f5f9" }}
        />
        <Legend />
        <Bar dataKey="sessions" fill="#800000" name="Completed Sessions" />
        <Bar dataKey="hours" fill="#D4AF37" name="Training Hours" />
      </BarChart>
    </ResponsiveContainer>
  );
}
