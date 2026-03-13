import { ENROLLMENT_TYPE_OPTIONS } from "./enrollmentTypeOptions";

export default function EnrollmentTypeSwitcher({ isOpen, selectedType, onToggle, onSelect }) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="text-xs font-semibold text-[#800000] hover:text-[#5f0000] hover:underline"
      >
        Change Type
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-6 z-10 min-w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
          {ENROLLMENT_TYPE_OPTIONS.map((option) => {
            const isSelected = option.value === selectedType;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onSelect(option.value)}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${
                  isSelected ? "bg-[#800000] text-white" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
