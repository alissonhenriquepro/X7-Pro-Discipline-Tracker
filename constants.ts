
export const MOTIVATIONAL_QUOTES = [
  "Disciplina cria liberdade.",
  "Nenhum dia zero.",
  "Você apareceu. Isso já é uma vitória.",
  "Consistência vence a intensidade.",
  "A motivação te faz começar. O hábito te faz continuar.",
  "Não pare até se orgulhar.",
  "Disciplina é fazer o que precisa ser feito, mesmo quando não quer.",
  "O shape não vem por Wi-Fi, infelizmente. Bora treinar!",
  "Mais vale um treino fuleiro do que treino nenhum.",
  "Sua preguiça está rindo de você agora. Vai deixar?",
  "O suor de hoje é o 'caraca, você mudou' de amanhã.",
  "Se fosse fácil, o Batman não seria o único.",
  "Chorar no treino para sorrir na praia.",
  "O único treino ruim é aquele que não aconteceu.",
  "Vira essa cara de cansaço e foca no resultado!",
  "Hoje é dia de calar a sua versão preguiçosa.",
  "O descanso também faz parte do treino, mas não abuse!",
  "Seu corpo é seu templo, não uma lanchonete de fast food."
];

export const DAILY_TIPS = [
  { title: "Hidratação", content: "Beber água gelada pode acelerar levemente o metabolismo, pois o corpo gasta energia para aquecê-la." },
  { title: "Proteína", content: "Tente consumir pelo menos 1.6g a 2g de proteína por quilo de peso corporal para otimizar o ganho de massa." },
  { title: "Sono", content: "É durante o sono profundo que seus músculos se recuperam e crescem. Durma 7-9h por noite." },
  { title: "Receita Fit", content: "Panqueca de banana: 1 banana madura esmagada + 2 ovos. Misture e frite com um pouco de óleo de coco. Rápido e proteico!" },
  { title: "Pré-treino Natural", content: "Um café preto forte 30 min antes do treino é um dos melhores e mais baratos termogênicos que existem." },
  { title: "Execução", content: "Amplitude de movimento é mais importante que carga. Não sacrifique a técnica pelo ego." },
  { title: "Saúde Mental", content: "Treinar libera endorfina e dopamina, combatendo sintomas de ansiedade e depressão." }
];

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  type: 'multiple' | 'boolean';
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "Qual é o maior músculo do corpo humano?",
    options: ["Quadríceps", "Latíssimo do dorso", "Glúteo máximo", "Peitoral maior"],
    correctIndex: 2,
    explanation: "O glúteo máximo é o maior e mais potente músculo do corpo, essencial para manter a postura ereta e para movimentos de explosão.",
    type: 'multiple'
  },
  {
    id: 2,
    question: "Sentir dor muscular no dia seguinte é sinal obrigatório de que o músculo está crescendo?",
    options: ["Verdadeiro", "Falso"],
    correctIndex: 1,
    explanation: "Falso. A dor (DOMS) é apenas um sinal de microlesões e adaptação a novos estímulos, mas a hipertrofia pode ocorrer sem dor extrema.",
    type: 'boolean'
  },
  {
    id: 3,
    question: "Qual nutriente é o principal responsável pela reconstrução das fibras musculares?",
    options: ["Carboidratos", "Proteínas", "Gorduras", "Vitaminas"],
    correctIndex: 1,
    explanation: "As proteínas fornecem os aminoácidos necessários para reparar as microlesões causadas pelo treino, promovendo o crescimento muscular.",
    type: 'multiple'
  },
  {
    id: 4,
    question: "O agachamento é considerado um exercício isolado.",
    options: ["Verdadeiro", "Falso"],
    correctIndex: 1,
    explanation: "Falso. O agachamento é um exercício composto ou multiarticular, pois envolve várias articulações (quadril, joelho, tornozelo) e diversos grupos musculares.",
    type: 'boolean'
  },
  {
    id: 5,
    question: "Qual a função principal do período de 'descanso' entre as séries?",
    options: ["Apenas para beber água", "Recuperar os estoques de ATP e remover subprodutos metabólicos", "Esperar o suor secar", "Ver o celular"],
    correctIndex: 1,
    explanation: "O descanso permite que os sistemas energéticos (como a creatina fosfato) se regenerem para que você consiga manter a intensidade na próxima série.",
    type: 'multiple'
  }
];

export const BADGES = [
  { id: 'bronze', name: 'Iniciante', description: '3 treinos em uma semana', threshold: 3, icon: '🥉' },
  { id: 'silver', name: 'Guerreiro', description: '5 treinos em uma semana', threshold: 5, icon: '🥈' },
  { id: 'gold', name: 'Elite', description: '4 semanas consistentes', threshold: 4, icon: '🥇' },
];

export const DAYS_OF_WEEK = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
