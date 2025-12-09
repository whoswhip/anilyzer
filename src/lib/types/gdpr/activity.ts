import { ActionTypes, ObjectTypes } from '$lib/types/gdpr/enums';

export interface Activity {
	id: number;
	user_id: number;
	messenger_id: number | null;
	action_type: (typeof ActionTypes)[keyof typeof ActionTypes];
	object_id: number;
	object_type: (typeof ObjectTypes)[keyof typeof ObjectTypes];
	object_value: string;
	reply_count: number;
	created_at: string; // timestamp string
	updated_at: string; // timestamp string
	locked: number; // 0 or 1
	like_count: number;
	private: number; // 0 or 1
}
