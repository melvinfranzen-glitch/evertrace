import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { sanitizePromptInput } from "@/utils/sanitize";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

// Hardcodierte Fragen werden dynamisch ersetzt

export default function BiographyQuestionnaire({ memorial, onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);

  const generateQuestionsFromTimeline = useCallback(async (events) => {
    const timelineText = events
      .map(e => `${e.year}: ${e.title}${e.description ? " - " + e.description : ""}`)
      .join("\n");

    const prompt = `Analysiere den Lebenstrahl und generiere 3-6 zielgerichtete Fragen auf Deutsch, um die Biografie zu ergänzen.

Lebenstrahl:
${timelineText || "(leer)"}

Generiere Fragen, die Lücken füllen (z.B. frühe Jahre, Familie, Karriere, Leidenschaften, Vermächtnis). 

Format: JSON-Array mit Objekten {"title": "Frage als Überschrift", "description": "Erklärende Frage", "placeholder": "Beispiel-Text"}.
Rückgabe AUSSCHLIESSLICH gültiges JSON-Array ohne zusätzlichen Text.`;

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              placeholder: { type: "string" },
            },
          },
        },
      });
      return (Array.isArray(result) ? result : result.items || []).slice(0, 6);
    } catch (err) {
      console.error("Fehler beim Generieren von Fragen:", err);
      return [];
    }
  }, []);

  const generateBiography = useCallback(async () => {
    setGenerating(true);
    try {
      const timelineContext = timelineEvents
        .map(e => `${e.year}: ${e.title}${e.description ? " - " + e.description : ""}`)
        .join("\n");

      const prompt = `Erstelle eine würdevolle, persönliche Biografie auf Deutsch für ${memorial.name} (geboren: ${memorial.birth_date || "unbekannt"}, gestorben: ${memorial.death_date || "unbekannt"}). 
      
Lebenstrahl - Wichtige Ereignisse:
${timelineContext}

Zusätzliche Informationen:
- Fragen & Antworten aus dem Fragebogen:
${generatedQuestions.map((q, i) => `${q.title}: ${sanitizePromptInput(answers[i] || "")}`).join("\n")}

Integriere den Lebenstrahl chronologisch und ergänze mit den zusätzlichen Informationen. Schreibe 3–4 Absätze, die die Person lebendig werden lassen. Beginne direkt mit der Geschichte.`;

      const result = await base44.integrations.Core.InvokeLLM({ prompt });
      onComplete(result, answers);
    } catch (err) {
      console.error("Fehler beim Generieren:", err);
    }
    setGenerating(false);
  }, [memorial, timelineEvents, generatedQuestions, answers, onComplete]);

  useEffect(() => {
    const init = async () => {
      try {
        const events = await base44.entities.TimelineEvent.filter({ memorial_id: memorial.id }, "sort_order");
        setTimelineEvents(events);
        
        // KI generiert relevante Fragen basierend auf Timeline-Lücken
        const questions = await generateQuestionsFromTimeline(events);
        setGeneratedQuestions(questions);
      } catch (err) {
        console.error("Fehler beim Laden:", err);
      }
      setLoading(false);
    };
    init();
  }, [memorial.id]);



  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#c9a96e" }} />
      </div>
    );
  }

  if (generatedQuestions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl p-6 text-center" style={{ background: "rgba(201,169,110,0.06)", border: "1px solid rgba(201,169,110,0.2)" }}>
          <p className="text-sm text-gray-700 mb-3">✓ Alle Informationen aus dem Lebenstrahl gelesen.</p>
          <p className="text-xs text-gray-500 mb-4">Die Biografie wird erstellt basierend auf den Lebensereignissen.</p>
          <button
            onClick={generateBiography}
            disabled={generating}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-50 transition-all"
            style={{ background: "#c9a96e" }}
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> Biografie wird geschrieben...
              </>
            ) : (
              "✦ Biografie generieren"
            )}
          </button>
        </div>

        {/* Timeline Summary */}
        <div className="rounded-2xl p-4 bg-gray-50 border border-gray-200">
          <p className="text-xs font-medium text-gray-700 mb-2">Lebensereignisse im Lebenstrahl:</p>
          <div className="space-y-1">
            {timelineEvents.map(e => (
              <p key={e.id} className="text-xs text-gray-600">
                <span style={{ color: "#c9a96e" }}>{e.year}</span>: {e.title}
              </p>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = generatedQuestions[step];
  const progress = ((step + 1) / generatedQuestions.length) * 100;

  const handleNext = () => {
    if (step < generatedQuestions.length - 1) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleAnswerChange = (value) => {
    setAnswers(prev => ({ ...prev, [step]: value }));
  };

  const currentAnswer = step >= 0 && answers[step] ? answers[step] : "";



  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-medium text-gray-700">
            Frage {step + 1} von {generatedQuestions.length}
          </p>
          <p className="text-xs text-gray-400">{Math.round(progress)}%</p>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-300"
            style={{ width: `${progress}%`, background: "#c9a96e" }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          {currentQuestion.title}
        </h3>
        <p className="text-sm text-gray-600 mb-4">{currentQuestion.description}</p>
        <Textarea
          value={currentAnswer}
          onChange={(e) => handleAnswerChange(e.target.value)}
          placeholder={currentQuestion.placeholder}
          className="resize-none h-32 bg-white border-amber-300 rounded-xl"
        />
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={handlePrev}
          disabled={step === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-40 transition-all"
          style={{ borderColor: "#e5e7eb", color: "#6b7280" }}
        >
          <ChevronLeft className="w-4 h-4" /> Zurück
        </button>

        {step < generatedQuestions.length - 1 ? (
          <button
            onClick={handleNext}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-white transition-all"
            style={{ background: "#c9a96e" }}
          >
            Weiter <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={generateBiography}
            disabled={generating || Object.values(answers).some(a => !a?.trim())}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-50 transition-all"
            style={{ background: "#c9a96e" }}
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Biografie wird geschrieben...
              </>
            ) : (
              <>✦ Biografie generieren</>
            )}
          </button>
        )}
      </div>

      {/* Progress Summary */}
      <div className="text-xs text-gray-400 space-y-1">
        <p>Offene Fragen zum Ergänzen der Lebensgeschichte.</p>
        <p>Nach allen Antworten wird die Biografie mit dem Lebenstrahl zusammengefasst.</p>
      </div>
    </div>
  );
}