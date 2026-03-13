export default function DashboardGrid({ left, right }) {
  return (
    <div className="grid grid-cols-12 items-start gap-6">
      <div className="col-span-12 min-w-0 space-y-3 lg:col-span-8">{left}</div>
      <div className="col-span-12 min-w-0 space-y-3 lg:col-span-4">{right}</div>
    </div>
  );
}
