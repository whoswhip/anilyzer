import { ObjectTypes, StatusTypes } from '$lib/types/gdpr/enums';

export interface List {
    id: number;
    series_type: typeof ObjectTypes[keyof typeof ObjectTypes];
    user_id: number;
    series_id: number;
    status: typeof StatusTypes[keyof typeof StatusTypes];
    score: number;
    progress: number;
    progress_volume: number;
    priority: number;
    repeat: number;
    private: number; // 0 or 1
    notes: string | null;
    custom_lists: string | string[]; // JSON string or array of list names
    advanced_scores: string | number[]; // JSON string or array of scores
    hidden_default: number; // 0 or 1
    started_on: number; // date in YYYYMMDD format (numeric)
    finished_on: number; // date in YYYYMMDD format (numeric)
    created_at: string; // timestamp string
    updated_at: string; // timestamp string
}