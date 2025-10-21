
export interface User {
  username: string;
  email: string;
  profilePicture?: string; // base64 string
}

export interface JournalEntry {
  id: string;
  date: string;
  transcribedText: string;
  analysis: AIAnalysisResult;
  facialImage?: string; // base64 string
  sleepHours: number;
  stressLevel: number;
}

export interface AIAnalysisResult {
  overallMood: string;
  moodScore: number; // A score from 1 to 10
  keyEmotions: string[];
  feedback: string;
  activitySuggestion: string;
}