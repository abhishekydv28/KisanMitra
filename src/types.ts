export type Language = 'hi' | 'en';

export interface DosageVisuals {
  spoons: number; // चम्मच (e.g. 2 spoons)
  waterBuckets: number; // बाल्टी (15L buckets)
  sprayTanks: number; // ढोलकी (knapsack sprayer)
  liquidDrops?: number; // मिली / बूंद
}

export interface RemedyDetail {
  title: string;
  name: string;
  dosageText: string;
  method: string;
  schedule: string;
  dosageVisuals: DosageVisuals;
  safetyTips: string[];
}

export interface CropScanRecord {
  id: string;
  cropNameHindi: string;
  cropNameEnglish: string;
  diseaseNameHindi: string;
  diseaseNameEnglish: string;
  field: string;
  date: string;
  status: 'treated' | 'resolved' | 'critical';
  statusHindi: string;
  statusEnglish: string;
  imageUrl: string;
  confidence: number;
  severity: 'mild' | 'moderate' | 'high';
  symptomsHindi: string;
  symptomsEnglish: string;
  organicRemedy: RemedyDetail;
  chemicalRemedy: RemedyDetail;
  audioTextHindi: string;
  audioTextEnglish: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  audioText?: string;
}
