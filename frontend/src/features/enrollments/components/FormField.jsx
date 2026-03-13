const baseFieldClassName = "h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#800000]";

export function FormField({
  label,
  placeholder,
  required = false,
  type = "text",
  name,
  value,
  onChange,
  className = "",
  inputClassName = "",
}) {
  return (
    <label className={`flex flex-col gap-1 ${className}`.trim()}>
      <span className="text-[10px] font-bold tracking-wide text-slate-500">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        name={name}
        value={value ?? ""}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        className={`${baseFieldClassName} ${inputClassName}`.trim()}
      />
    </label>
  );
}

export function SelectField({
  label,
  placeholder,
  required = false,
  name,
  value,
  onChange,
  options = [],
  className = "",
  inputClassName = "",
}) {
  return (
    <label className={`flex flex-col gap-1 ${className}`.trim()}>
      <span className="text-[10px] font-bold tracking-wide text-slate-500">
        {label}
        {required ? " *" : ""}
      </span>
      <select
        name={name}
        value={value ?? ""}
        onChange={onChange}
        className={`${baseFieldClassName} ${inputClassName}`.trim()}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function SectionTitle({ children }) {
  return <h3 className="mb-3 mt-5 border-b border-slate-300 pb-2 text-xs font-bold tracking-[0.12em] text-blue-700">{children}</h3>;
}
