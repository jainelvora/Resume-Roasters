export interface UploadedFile { name: string; mimeType: string; data: string }
export interface StartExtras { file?: UploadedFile; jobDescription?: string }

// Optional fields the server now adds on top of the original response shape.
export interface RoastExtras {
  extractedText?: string;
  turns?: { hireOdds?: number }[];
  verdict?: {
    bestBurn?: string;
    atsGap?: { matched: string[]; missing: string[] };
    layoutNotes?: string[];
  };
}
