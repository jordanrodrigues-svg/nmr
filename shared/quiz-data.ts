export interface QuizQuestion {
  id: number;
  question: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  correct: 'a' | 'b' | 'c' | 'd';
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "What phenomenon causes the NMR signal in proton NMR spectroscopy?",
    options: {
      a: "Absorption of ultraviolet radiation",
      b: "Absorption of infrared radiation",
      c: "Absorption of radio waves",
      d: "Emission of visible light"
    },
    correct: "c"
  },
  {
    id: 2,
    question: "Why is tetramethylsilane (TMS) used as the standard in 1H NMR spectroscopy?",
    options: {
      a: "It reacts with most organic compounds",
      b: "It has all equivalent protons giving one sharp peak at 0 ppm",
      c: "It has multiple proton environments causing multiple peaks",
      d: "It absorbs at the lowest frequency of all compounds"
    },
    correct: "b"
  },
  {
    id: 3,
    question: "What is the molecular formula of tetrachloromethane, a common NMR solvent?",
    options: {
      a: "CCl3H",
      b: "CCl4",
      c: "C2Cl4",
      d: "Cl4"
    },
    correct: "b"
  },
  {
    id: 4,
    question: "Why are deuterated solvents like CDCl3 preferred over CHCl3 in proton NMR?",
    options: {
      a: "They have a higher boiling point",
      b: "Deuterium nuclei do not produce interfering signals in 1H NMR",
      c: "They react less with the sample",
      d: "They contain more protons for easier analysis"
    },
    correct: "b"
  },
  {
    id: 5,
    question: "In the low-resolution NMR spectrum of ethanol, the peak at about 1.2 ppm is caused by:",
    options: {
      a: "–OH hydrogen atoms",
      b: "–CH2– hydrogen atoms",
      c: "–CH3 hydrogen atoms",
      d: "Aromatic hydrogen atoms"
    },
    correct: "c"
  },
  {
    id: 6,
    question: "Which of the following ranges best corresponds to the chemical shift of aromatic protons in 1H NMR?",
    options: {
      a: "0.9 – 1.7 ppm",
      b: "2.2 – 3.0 ppm",
      c: "3.2 – 4.0 ppm",
      d: "6.0 – 9.0 ppm"
    },
    correct: "d"
  },
  {
    id: 7,
    question: "According to the n + 1 rule, a proton having 3 neighboring protons will appear as:",
    options: {
      a: "A singlet",
      b: "A doublet",
      c: "A triplet",
      d: "A quartet"
    },
    correct: "d"
  },
  {
    id: 8,
    question: "Why does the OH proton signal in the 1H NMR spectrum often appear as a singlet without splitting?",
    options: {
      a: "There are no neighboring protons",
      b: "Rapid exchange of OH protons suppresses coupling",
      c: "OH protons are not detected in NMR",
      d: "OH protons always resonate at the same frequency"
    },
    correct: "b"
  },
  {
    id: 9,
    question: "What effect does adding D2O to an NMR sample have on the OH proton signal?",
    options: {
      a: "It intensifies the OH peak",
      b: "It shifts the OH peak downfield",
      c: "It causes the OH peak to disappear",
      d: "It splits the OH peak into multiple peaks"
    },
    correct: "c"
  },
  {
    id: 10,
    question: "In the high-resolution NMR spectrum of ethanol, why is the CH3 peak split into a triplet?",
    options: {
      a: "It has no neighboring protons",
      b: "It has one neighboring proton",
      c: "It has two neighboring protons on adjacent CH2",
      d: "It has three neighboring protons"
    },
    correct: "c"
  },
  {
    id: 11,
    question: "Which peak splitting pattern corresponds to a proton with 1 neighboring proton?",
    options: {
      a: "Singlet",
      b: "Doublet",
      c: "Triplet",
      d: "Quartet"
    },
    correct: "b"
  },
  {
    id: 12,
    question: "Which of the following solvents would cause interference in a proton NMR spectrum?",
    options: {
      a: "CCl4 (tetrachloromethane)",
      b: "CDCl3 (deuterated chloroform)",
      c: "CHCl3 (chloroform)",
      d: "D2O (deuterium oxide)"
    },
    correct: "c"
  },
  {
    id: 13,
    question: "Which of the following chemical shifts is most likely for aldehyde proton in 1H NMR?",
    options: {
      a: "9.3 – 10.5 ppm",
      b: "0.9 – 1.7 ppm",
      c: "2.2 – 3.0 ppm",
      d: "3.2 – 4.0 ppm"
    },
    correct: "a"
  },
  {
    id: 14,
    question: "In the presence of how many adjacent 1H protons does a singlet splitting appear?",
    options: {
      a: "1",
      b: "2",
      c: "3",
      d: "0"
    },
    correct: "d"
  },
  {
    id: 15,
    question: "How many signals will a symmetric molecule like benzene (C6H6) give in its 1H NMR spectrum?",
    options: {
      a: "1",
      b: "3",
      c: "6",
      d: "12"
    },
    correct: "a"
  },
  {
    id: 16,
    question: "Which of these compounds will show a triplet and a quartet in its 1H NMR spectrum due to spin-spin splitting?",
    options: {
      a: "Methanol",
      b: "Ethanol",
      c: "Benzene",
      d: "Propanone"
    },
    correct: "b"
  },
  {
    id: 17,
    question: "Which number of hydrogen atoms corresponds to an NMR peak with an integrated area labeled as 2H?",
    options: {
      a: "One hydrogen atom",
      b: "Two equivalent hydrogen atoms",
      c: "Three hydrogen atoms",
      d: "Four hydrogen atoms"
    },
    correct: "b"
  },
  {
    id: 18,
    question: "Why might the chemical shift for OH or NH protons vary depending on solvent and concentration?",
    options: {
      a: "Because of changes in molecular weight",
      b: "Due to hydrogen bonding and exchange effects",
      c: "Because OH and NH aren't detected in NMR",
      d: "They do not vary; chemical shift is constant"
    },
    correct: "b"
  }
];

export interface Player {
  id: string;
  name: string;
  score: number;
  answers: Array<{
    questionId: number;
    answer: 'a' | 'b' | 'c' | 'd';
    correct: boolean;
    timeToAnswer: number;
  }>;
}

export interface GameState {
  phase: 'lobby' | 'quiz' | 'results';
  currentQuestion: number;
  players: Player[];
  startTime?: number;
}