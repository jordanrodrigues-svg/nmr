export interface NMRModule {
  id: string;
  code: string;
  order: number;
  title: string;
  slides: string;
  content: string;
  interactive: string;
  isUnlocked?: boolean;
}

export const nmrModules: NMRModule[] = [
  {
    id: "proton-intro",
    code: "X7B2",
    order: 1,
    title: "Welcome to the World of Proton NMR — The Molecular Magnet Show",
    slides: "Slides 1-2",
    content: `Imagine each hydrogen atom as a tiny spinning magnet inside molecules. In NMR, these proton magnets line up just like compass needles when we apply a strong magnetic field. They can either "cooperate" by aligning with the field or "rebel" by aligning against it — creating two energy states. When these protons flip between these states (proton gymnastics!), they absorb specific radio waves.

Why Focus on Hydrogen?

Hydrogen (1H) is everywhere in organic molecules and is easy to detect with NMR.

Only nuclei with an odd mass number show this flipping behavior, making proton NMR a powerful tool to probe molecules.`,
    interactive: "Try this: Stretch your arms and pretend you're tiny protons spinning either with or against an imaginary magnetic field around you!"
  },
  {
    id: "magnetic-field-tms",
    code: "Q9KP",
    order: 2,
    title: "The Magic of the Magnetic Field & Why TMS Is the Star of the Show",
    slides: "Slides 4-5",
    content: `Protons flip between low and high energy states when bombarded by radio waves in a magnetic field — this tiny energy difference is the secret language telling us where each proton lives in a molecule.

Meet TMS (Tetramethylsilane):

It's like the calm center of the NMR universe.

All hydrogens in TMS are identical, giving a neat, single peak at zero on the scale (0 ppm).

Think of TMS as the 'zero degree' on your molecular thermometer.`,
    interactive: "Guess what would happen if we didn't have TMS? (Hint: Without a reference, it'd be like trying to read a map without a compass!)"
  },
  {
    id: "spectrum-peaks",
    code: "M4Z1",
    order: 3,
    title: "Decoding the NMR Spectrum: Peaks and Proton Parties",
    slides: "Slides 6-7",
    content: `Every unique proton environment throws its own molecular "party," sending a signal — the peaks we see on a spectrum. The bigger the party (more equivalent protons), the taller the peak!

Why is Ethanol a Star?

It has 3 unique proton "rooms": -CH3, -CH2, and -OH. Each sends its party invite (peak) at different spots.

This pattern lets chemists decode molecular neighborhoods — like a social network of hydrogens!`,
    interactive: "Make 3 groups with your classmates and pretend you're -CH3, -CH2, and -OH protons. See if you can guess the size of your group based on loudness!"
  },
  {
    id: "solvents-shifts",
    code: "N8RD",
    order: 4,
    title: "Solvents, Chemical Shifts, and the Art of Splitting",
    slides: "Slides 8-10",
    content: `In NMR, solvents usually stay quiet — especially if they're deuterated (D replaces H), so they don't drown out your proton signals.

Chemical Shifts:
Protons' "addresses" show up at different ppm values based on their chemical environment:

• Alkane protons chill near 1 ppm.
• Aromatic protons party between 6–9 ppm.
• Aldehyde protons show up way downfield near 9–10 ppm — the VIP guests!

Splitting: The n + 1 Rule
Neighboring protons whisper to each other causing peaks to split into multiples: triplets, quartets, and more. It's basically the gossip chain of protons!`,
    interactive: "If a proton has 2 neighbors, how many peaks will it split into? (Answer: 3, because n + 1 = 2 + 1)"
  },
  {
    id: "oh-nh-signals",
    code: "C5VX",
    order: 5,
    title: "The Mysterious OH and NH Signals & Solving the Ester Puzzle",
    slides: "Slides 13-14",
    content: `OH and NH protons are social butterflies, constantly exchanging partners (protons), so they don't form splitting patterns but show solitary peaks.

D2O Magic:
Add deuterium oxide (heavy water) and these labile protons trade places with deuterium — making their peaks vanish. This is like a molecular magic trick to confirm their identity!

Ester Detective Work:
By matching chemical shifts, counting peak areas, and decoding splitting, you can identify complex molecules like ethyl ethanoate.`,
    interactive: "Use a set of imaginary peaks and apply the n + 1 rule to crack the molecular code yourself!"
  },
  {
    id: "forensic-nmr",
    code: "T27J",
    order: 6,
    title: "Proton NMR: Your Molecular Detective in Forensics",
    slides: "Slides 14-15",
    content: `NMR isn't just for chemists in labs — it helps solve crimes too! By analyzing drugs like aspirin and paracetamol, NMR fingerprints unique chemical signatures for identification.

How D2O Helps:
Reveal hidden OH/NH groups by making their signals disappear with heavy water, giving forensic chemists crucial clues.

Real-World Impact:
Imagine being a molecular Sherlock Holmes — NMR lets you crack cases by reading the stories protons whisper in the spectra.`,
    interactive: "Can you guess the functional groups in mystery molecules by their chemical shifts and splitting? Try a mini case study on the website!"
  }
];

export const getModuleByCode = (code: string): NMRModule | undefined => {
  return nmrModules.find(module => module.code === code);
};

export const getNextModule = (currentOrder: number): NMRModule | undefined => {
  return nmrModules.find(module => module.order === currentOrder + 1);
};

export const isModuleUnlockable = (moduleOrder: number, unlockedModules: string[]): boolean => {
  // First module can always be unlocked
  if (moduleOrder === 1) return true;
  
  // Check if all previous modules are unlocked
  for (let i = 1; i < moduleOrder; i++) {
    const prevModule = nmrModules.find(m => m.order === i);
    if (!prevModule || !unlockedModules.includes(prevModule.id)) {
      return false;
    }
  }
  return true;
};