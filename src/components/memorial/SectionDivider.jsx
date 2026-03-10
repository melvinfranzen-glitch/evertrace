export default function SectionDivider({ quote, light = false }) {
  return (
    <div
      className="py-10 px-6 text-center"
      style={{ background: light ? "#FAFAF8" : "#F5F0E8" }}
    >
      <div className="flex items-center justify-center gap-4 max-w-sm mx-auto">
        <div className="h-px flex-1 opacity-30" style={{ background: "#b45309" }} />
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C12 2 7 7 7 12C7 17 12 22 12 22C12 22 17 17 17 12C17 7 12 2 12 2Z"
            fill="#c9a84c" opacity="0.5" />
          <circle cx="12" cy="12" r="2.5" fill="#c9a84c" />
        </svg>
        <div className="h-px flex-1 opacity-30" style={{ background: "#b45309" }} />
      </div>
      {quote && (
        <p className="text-sm italic text-gray-400 mt-5 max-w-md mx-auto leading-relaxed"
          style={{ fontFamily: "'Playfair Display', serif" }}>
          {quote}
        </p>
      )}
    </div>
  );
}