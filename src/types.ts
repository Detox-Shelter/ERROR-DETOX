export interface PainPointPreset {
  id: string;
  title: string;
  description: string;
  exampleConflict: string; // Prepopulated TRIZ contradiction example
}

export interface TrizPrinciple {
  id: string;
  name: string;
  nameKr: string;
  description: string;
  example: string; // Service SW specific example
}

export interface ScamperPrompt {
  letter: 'S' | 'C' | 'A' | 'M' | 'P' | 'E' | 'R';
  title: string;
  titleKr: string;
  questions: string[];
  serviceSwExamples: string[];
}

export interface BrainstormingSession {
  id?: string; // Google Drive file ID or local temp ID
  title: string;
  lastUpdated: string;
  painPoint: {
    type: 'preset' | 'custom';
    presetId?: string;
    text: string;
  };
  triz: {
    contradiction: string;
    selectedPrinciples: string[];
    ideas: Record<string, string>; // principleId -> idea
  };
  scamper: {
    selectedLetters: ('S' | 'C' | 'A' | 'M' | 'P' | 'E' | 'R')[];
    ideas: Record<string, string>; // letter -> idea
  };
  errc: {
    eliminate: string;
    reduce: string;
    raise: string;
    create: string;
  };
  finalSummary: {
    trizKeyIdea: string;
    scamperKeyIdea: string;
    errcKeyIdea: string;
    actionableSolution: string;
  };
}

export interface DriveFile {
  id: string;
  name: string;
  modifiedTime: string;
}

