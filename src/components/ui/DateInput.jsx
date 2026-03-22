import { useRef, useState, useEffect } from "react";

// Three-field date input: DD.MM.YYYY — works well on all mobile keyboards
export default function DateInput({ value, onChange, className = "", style = {} }) {
  const parseValue = (v) => {
    if (!v) return { d: "", m: "", y: "" };
    const parts = v.split("-");
    if (parts.length === 3) return { d: parts[2], m: parts[1], y: parts[0] };
    return { d: "", m: "", y: "" };
  };

  const [fields, setFields] = useState(() => parseValue(value));
  const monthRef = useRef(null);
  const yearRef = useRef(null);

  useEffect(() => {
    setFields(parseValue(value));
  }, [value]);

  const emit = (d, m, y) => {
    if (d && m && y && y.length === 4) {
      const dd = d.padStart(2, "0");
      const mm = m.padStart(2, "0");
      onChange?.(`${y}-${mm}-${dd}`);
    } else if (!d && !m && !y) {
      onChange?.("");
    }
  };

  const handleDay = (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 2);
    const next = { ...fields, d: v };
    setFields(next);
    emit(v, next.m, next.y);
    if (v.length === 2) monthRef.current?.focus();
  };

  const handleMonth = (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 2);
    const next = { ...fields, m: v };
    setFields(next);
    emit(next.d, v, next.y);
    if (v.length === 2) yearRef.current?.focus();
  };

  const handleYear = (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 4);
    const next = { ...fields, y: v };
    setFields(next);
    emit(next.d, next.m, v);
  };

  const baseInput = {
    textAlign: "center",
    border: "none",
    outline: "none",
    background: "transparent",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    color: "inherit",
    padding: 0,
    ...style,
  };

  return (
    <div
      className={`flex items-center h-9 rounded-md border border-input bg-transparent px-3 py-1 shadow-sm transition-colors focus-within:ring-1 focus-within:ring-ring ${className}`}
    >
      <input
        type="text"
        inputMode="numeric"
        placeholder="TT"
        value={fields.d}
        onChange={handleDay}
        style={{ ...baseInput, width: 28 }}
      />
      <span style={{ color: "#aaa", userSelect: "none" }}>.</span>
      <input
        ref={monthRef}
        type="text"
        inputMode="numeric"
        placeholder="MM"
        value={fields.m}
        onChange={handleMonth}
        style={{ ...baseInput, width: 28 }}
      />
      <span style={{ color: "#aaa", userSelect: "none" }}>.</span>
      <input
        ref={yearRef}
        type="text"
        inputMode="numeric"
        placeholder="JJJJ"
        value={fields.y}
        onChange={handleYear}
        style={{ ...baseInput, width: 44 }}
      />
    </div>
  );
}