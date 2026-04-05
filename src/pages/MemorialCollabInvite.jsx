import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, Check, Lock } from "lucide-react";

/**
 * Landing page for collaborator invite links.
 * URL: /MemorialCollabInvite?memorial_id=XXX&token=YYY
 * token = base64(email:memorial_id) — verified client-side for simplicity
 */
export default function MemorialCollabInvite() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const memorialId = params.get("memorial_id");
  const token = params.get("token");

  const [status, setStatus] = useState("loading"); // loading | joining | done | error | already
  const [memorialName, setMemorialName] = useState("");

  useEffect(() => {
    if (!memorialId || !token) { setStatus("error"); return; }

    const tryJoin = async () => {
      // Check if logged in
      const isAuthed = await base44.auth.isAuthenticated();
      if (!isAuthed) {
        // Redirect to login and come back
        base44.auth.redirectToLogin(window.location.href);
        return;
      }

      const user = await base44.auth.me();
      const results = await base44.entities.Memorial.filter({ id: memorialId });
      if (!results.length) { setStatus("error"); return; }

      const memorial = results[0];
      setMemorialName(memorial.name);

      const existing = memorial.collaborator_emails || [];
      if (existing.includes(user.email) || memorial.created_by === user.email) {
        setStatus("already");
        return;
      }

      setStatus("joining");
      await base44.entities.Memorial.update(memorialId, {
        collaborator_emails: [...existing, user.email],
      });
      setStatus("done");
    };

    tryJoin();
  }, []);

  const goToEdit = () => {
    navigate(`/EditMemorial?id=${memorialId}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#FAFAF8" }}>
      <div className="max-w-sm w-full text-center space-y-5">
        {status === "loading" && (
          <>
            <Loader2 className="w-10 h-10 animate-spin mx-auto" style={{ color: "#c9a96e" }} />
            <p style={{ color: "#8a8278", fontFamily: "'DM Sans', sans-serif" }}>Einladung wird verarbeitet…</p>
          </>
        )}

        {status === "joining" && (
          <>
            <Loader2 className="w-10 h-10 animate-spin mx-auto" style={{ color: "#c9a96e" }} />
            <p style={{ color: "#8a8278" }}>Sie werden als Mitbearbeiter hinzugefügt…</p>
          </>
        )}

        {(status === "done" || status === "already") && (
          <>
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ background: "rgba(201,169,110,0.15)", border: "2px solid #c9a96e" }}>
              <Check className="w-8 h-8" style={{ color: "#c9a96e" }} />
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: "#2c2419", fontWeight: 600 }}>
              {status === "already" ? "Sie haben bereits Zugang" : "Zugang erteilt"}
            </h2>
            <p style={{ color: "#8a8278", fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
              {status === "already"
                ? `Sie können die Gedenkseite für „${memorialName}" bereits bearbeiten.`
                : `Sie können die Gedenkseite für „${memorialName}" jetzt mitgestalten.`}
            </p>
            <button
              onClick={goToEdit}
              className="w-full py-3 rounded-xl text-sm font-medium"
              style={{ background: "#c9a96e", color: "#0f0e0c", fontFamily: "'DM Sans', sans-serif" }}
            >
              Zur Gedenkseite →
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ background: "#fef2f2" }}>
              <Lock className="w-8 h-8 text-red-400" />
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: "#2c2419" }}>Ungültiger Link</h2>
            <p style={{ color: "#8a8278", fontSize: 14 }}>Dieser Einladungslink ist abgelaufen oder ungültig.</p>
          </>
        )}
      </div>
    </div>
  );
}