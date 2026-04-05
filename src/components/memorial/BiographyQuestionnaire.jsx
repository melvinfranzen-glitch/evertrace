import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { sanitizePromptInput } from "@/utils/sanitize";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

const QUESTIONS = [
  {
    id: "childhood",
    title: "Kindheit & Familie",
    description: "Wo und wann wurde die Person geboren? Wie war die Familie?",
    placeholder: "z.B. Geboren 1945 in München, aufgewachsen mit zwei Geschwistern...",
  },
  {
    id: "career",
    title: "Beruf & Karriere",
    description: "Was hat die Person beruflich gemacht? Worauf war sie stolz?",
    placeholder: "z.B. Seit 1970 Lehrer an der Grundschule, liebte es, Kindern zu helfen...",
  },
  {
    id: "family_life",
    title: "Familie & Beziehungen",
    description: "War die Person verheiratet? Hat sie Kinder/Enkel?",
    placeholder: "z.B. Verheiratet seit 1968, drei Kinder, acht Enkel...",
  },
  {
    id: "passions",
    title: "Leidenschaften & Hobbys",
    description: "Was hat die Person gerne in der Freizeit gemacht?",
    placeholder: "z.B. Leidenschaftlicher Gärtner, liebte Reisen, aktiv im Kirchenchor...",
  },
  {
    id: "values",
    title: "Werte & Vermächtnis",
    description: "Wofür stand die Person? Was wird man an ihr vermissen?",
    placeholder: "z.B. Immer hilfsbereit, großes Herz, liebte ihre Familie über alles...",
  },
  {
    id: "quote",
    title: "Lieblingszitat oder Lebensmotto",
    description: "Hatte die Person einen Lieblingssatz oder ein Zitat?",
    placeholder: "z.B. »Das Leben ist zu kurz, um es nicht zu genießen.«",
  },
];

export default function BiographyQuestionnaire({ memorial, onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [generating, setGenerating] = useState(false);

  const currentQuestion = QUESTIONS[step];
  const progress = ((step + 1) / QUESTIONS.length) * 100;

  const handleNext = () => {
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleAnswerChange = (value) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
  };

  const generateBiography = async () => {
    setGenerating(true);
    try {
      const prompt = `Erstelle eine würdevolle, persönliche Biografie auf Deutsch für ${memorial.name} (geboren: ${memorial.birth_date || "unbekannt"}, gestorben: ${memorial.death_date || "unbekannt"}). 
      
Basiere auf folgenden Informationen:
- Kindheit & Familie: ${sanitizePromptInput(answers.childhood || "")}
- Beruf & Karriere: ${sanitizePromptInput(answers.career || "")}
- Familie & Beziehungen: ${sanitizePromptInput(answers.family_life || "")}
- Leidenschaften: ${sanitizePromptInput(answers.passions || "")}
- Werte: ${sanitizePromptInput(answers.values || "")}
- Lebensmotto: ${sanitizePromptInput(answers.quote || "")}

Schreibe 3–4 Absätze, die die Person lebendig werden lassen. Nutze die Informationen, um eine zusammenhängende, emotionale Erzählung zu schaffen. Beginne direkt mit der Geschichte.`;

      const result = await base44.integrations.Core.InvokeLLM({ prompt });
      onComplete(result, answers);
    } catch (err) {
      console.error("Fehler beim Generieren:", err);
    }
    setGenerating(false);
  };

  const currentAnswer = answers[currentQuestion.id] || "";

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-medium text-gray-700">
            Frage {step + 1} von {QUESTIONS.length}
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

        {step < QUESTIONS.length - 1 ? (
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
        <p>Sie füllen gerade einen Fragebogen aus, um eine schöne Lebensgeschichte zu erstellen.</p>
        <p>Nach allen Fragen wird die KI eine persönliche Biografie schreiben.</p>
      </div>
    </div>
  );
}