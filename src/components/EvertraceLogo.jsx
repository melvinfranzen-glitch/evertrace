export default function EvertraceLogo({ variant = "dark", size = "md" }) {
  const imgSize = size === "sm" ? 32 : size === "lg" ? 52 : 40;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <img
        src="https://media.base44.com/images/public/69af32617caa2f70a2b45d05/bc3dd5ca8_8c1f4d19-943c-44b4-8227-3e579aaa08be.jpg"
        alt="Evertrace"
        style={{ width: imgSize, height: imgSize, objectFit: "contain", borderRadius: 4 }}
      />
    </div>
  );
}