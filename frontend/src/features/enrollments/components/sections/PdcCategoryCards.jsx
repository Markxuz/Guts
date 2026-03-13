const PDC_CATEGORY_CARDS = [
  {
    value: "Beginner",
    title: "PDC Beginner",
    description: "For students with no prior driving experience",
  },
  {
    value: "Experience",
    title: "PDC Experience",
    description: "For students who can already drive and need certification.",
  },
];

export default function PdcCategoryCards({ selectedValue, onSelect }) {
  return (
    <div className="mb-3 rounded-lg border border-[#800000]/25 bg-[#800000]/5 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wide text-[#800000]">PDC Classification (Beginner/Experienced)</p>
        <span className="rounded-full bg-[#D4AF37]/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#800000]">
          Required
        </span>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {PDC_CATEGORY_CARDS.map((card) => {
          const selected = selectedValue === card.value;
          return (
            <button
              key={card.value}
              type="button"
              onClick={() => onSelect(card.value)}
              className={`rounded-lg border px-3 py-2 text-left transition ${
                selected
                  ? "border-[#800000] bg-[#800000]/10 shadow-[inset_0_0_0_1px_rgba(212,175,55,0.65)]"
                  : "border-slate-300 bg-white hover:border-[#800000]/50"
              }`}
            >
              <p className="text-sm font-semibold text-slate-900">
                {card.title}
                {selected ? <span className="ml-2 text-[#D4AF37]">✓</span> : null}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">{card.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}