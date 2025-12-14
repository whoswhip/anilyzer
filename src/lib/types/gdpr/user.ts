export interface User {
	display_name: string;
	avatar_url: string | null;
	banner_url: string | null;
	about: string | null;
	custom_lists: {
		anime: string[];
		manga: string[];
	};
	advanced_scores: {
		active: boolean;
		names: string[];
	};
}
