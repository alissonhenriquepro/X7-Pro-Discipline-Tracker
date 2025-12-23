
import React, { useState, useMemo } from 'react';
import { QUIZ_QUESTIONS, QuizQuestion } from '../constants';

interface QuizSectionProps {
  answeredIds: number[];
  onAnswerCorrect: (id: number) => void;
}

export const QuizSection: React.FC<QuizSectionProps> = ({ answeredIds, onAnswerCorrect }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Filtra apenas as perguntas que ainda não foram respondidas corretamente
  const remainingQuestions = useMemo(() => {
    return QUIZ_QUESTIONS.filter(q => !answeredIds.includes(q.id));
  }, [answeredIds]);

  const currentQuestion = remainingQuestions[0];

  const handleSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    if (index === currentQuestion.correctIndex) {
      onAnswerCorrect(currentQuestion.id);
    }
  };

  const nextQuestion = () => {
    setSelectedOption(null);
    setIsAnswered(false);
  };

  if (remainingQuestions.length === 0) {
    return (
      <div className="animate-in zoom-in-95 duration-500 text-center py-12 px-6">
        <div className="text-7xl mb-6">🏆</div>
        <h3 className="text-2xl font-black text-gray-800 mb-2 uppercase tracking-tighter">Mestre do Conhecimento!</h3>
        <p className="text-gray-500 font-bold text-sm leading-relaxed mb-8">
          Você respondeu todas as perguntas disponíveis. Volte em breve para novos desafios didáticos!
        </p>
        <div className="bg-blue-50 border-2 border-blue-100 rounded-3xl p-6">
           <p className="text-blue-600 font-bold text-xs uppercase">Sua mente está tão forte quanto seu corpo.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl p-6 duo-shadow border-2 border-gray-100 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Desafio de Conhecimento</span>
            <span className="text-[9px] font-bold text-gray-300 uppercase">Perguntas restantes: {remainingQuestions.length}</span>
          </div>
          <span className="text-xs font-bold text-gray-400">ID: #{currentQuestion.id}</span>
        </div>

        <h3 className="text-xl font-black text-gray-800 mb-6 leading-tight">
          {currentQuestion.question}
        </h3>

        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            let statusClasses = "bg-white border-gray-200 text-gray-700 hover:bg-gray-50";
            
            if (isAnswered) {
              if (idx === currentQuestion.correctIndex) {
                statusClasses = "bg-green-100 border-green-500 text-green-700";
              } else if (idx === selectedOption) {
                statusClasses = "bg-red-100 border-red-500 text-red-700";
              } else {
                statusClasses = "bg-gray-50 border-gray-100 text-gray-300 opacity-50";
              }
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleSelect(idx)}
                className={`w-full text-left p-4 rounded-2xl border-2 border-b-4 font-bold transition-all duo-button-active ${statusClasses}`}
              >
                <div className="flex items-center">
                  <span className="w-8 h-8 rounded-lg border-2 border-current flex items-center justify-center mr-3 text-xs">
                    {idx + 1}
                  </span>
                  {option}
                </div>
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="mt-8 animate-in zoom-in-95 duration-300">
            <div className={`p-4 rounded-2xl border-2 mb-6 ${selectedOption === currentQuestion.correctIndex ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">{selectedOption === currentQuestion.correctIndex ? '✅' : '❌'}</span>
                <span className={`font-black uppercase text-xs ${selectedOption === currentQuestion.correctIndex ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedOption === currentQuestion.correctIndex ? 'Correto!' : 'Não foi dessa vez!'}
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-snug font-medium italic">
                {currentQuestion.explanation}
              </p>
            </div>

            <button
              onClick={nextQuestion}
              className="w-full bg-blue-500 hover:bg-blue-400 text-white font-black py-4 rounded-2xl border-b-4 border-blue-700 transition-all duo-button-active uppercase"
            >
              Continuar para Próxima
            </button>
          </div>
        )}
      </div>

      <div className="bg-blue-50 rounded-3xl p-6 border-2 border-blue-100">
        <div className="flex items-center space-x-3 mb-2">
          <span className="text-2xl">🎓</span>
          <h4 className="font-black text-blue-800 text-sm uppercase">Dica do Professor</h4>
        </div>
        <p className="text-xs text-blue-600 leading-relaxed">
          Estudar sobre o corpo ajuda você a treinar melhor, evitar lesões e entender o processo de evolução. Conhecimento é poder!
        </p>
      </div>
    </div>
  );
};
