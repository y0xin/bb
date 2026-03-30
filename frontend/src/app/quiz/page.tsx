"use client";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useState, useEffect } from 'react';
import { CheckCircle2, ArrowRight, RotateCcw } from 'lucide-react';

interface QuizQuestion {
  q: string;
  options: string[];
}

export default function QuizPage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}/api/quiz-questions`)
      .then(res => res.json())
      .then(res => {
        if (res.data) setQuestions(res.data.map((d: { question: string; options: string[] }) => ({ q: d.question, options: d.options })));
      })
      .catch(e => console.error('Quiz fetch error', e))
      .finally(() => setLoading(false));
  }, []);

  const handleAnswer = async (answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
    } else {
      setDone(true);
      try {
        await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}/api/quiz-submissions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: { answers: newAnswers.map((ans, i) => `${questions[i].q}: ${ans}`) } })
        });
      } catch (e) {
        console.error('Submission failed', e);
      }
    }
  };

  const reset = () => { setCurrent(0); setAnswers([]); setDone(false); };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black text-blue-500 font-black tracking-widest uppercase">
       Загрузка...
    </div>
  );
  
  if (!questions.length) return (
    <div className="min-h-screen flex items-center justify-center bg-black text-gray-500 font-black tracking-widest uppercase">
       Вопросы не найдены
    </div>
  );

  return (
    <main className="min-h-screen hero-gradient flex flex-col text-white">
      <Navbar />
      <div className="flex-1 max-w-2xl mx-auto px-6 pt-16 pb-24 w-full">
        {!done ? (
          <>
            <div className="flex items-center gap-2 mb-8">
              {questions.map((_, i) => (
                <div key={i} className={`h-2 flex-1 rounded-full transition-all ${i <= current ? 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]' : 'bg-white/10'}`} />
              ))}
            </div>
            <p className="text-sm text-blue-500 font-black mb-2 uppercase tracking-widest text-[10px]">Вопрос {current + 1}/{questions.length}</p>
            <h1 className="text-4xl font-black mb-10 tracking-tight italic">{questions[current]?.q}</h1>
            <div className="space-y-4">
              {questions[current]?.options?.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt)}
                  className="w-full glass p-8 rounded-3xl text-left font-bold text-lg border border-white/5 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all flex items-center justify-between group cursor-pointer shadow-xl active:scale-[0.98]"
                >
                  <span className="group-hover:translate-x-2 transition-transform">{opt}</span>
                  <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 transition-all text-blue-500 group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center pt-12 animate-in fade-in duration-700">
            <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/20">
              <CheckCircle2 size={48} className="text-emerald-500" />
            </div>
            <h1 className="text-5xl font-black mb-4 tracking-tighter uppercase italic">Готово!</h1>
            <p className="text-gray-400 text-lg mb-12 font-medium">Ваши ответы приняты. Мы подберем лучшее решение для вас.</p>
            <div className="glass p-10 rounded-[40px] border border-white/5 text-left mb-12 shadow-3xl">
              <h3 className="font-black mb-8 uppercase tracking-widest text-xs text-blue-500">Ваш результат:</h3>
              <div className="space-y-6">
                {questions.map((q, i) => (
                  <div key={i} className="flex flex-col gap-1 py-3 border-b border-white/5 last:border-0">
                    <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{q.q}</span>
                    <span className="font-bold text-white italic">{answers[i]}</span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={reset} className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-3xl font-black text-lg transition-all cursor-pointer shadow-2xl shadow-blue-500/40 active:scale-95 uppercase tracking-widest">
              <RotateCcw size={20} /> Заново
            </button>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
