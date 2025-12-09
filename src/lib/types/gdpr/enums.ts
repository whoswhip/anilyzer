export const ActionTypes = {
	Completed: 1,
	Planned: 2,
	Consumed: 3,
	Paused: 4,
	Dropped: 5,
	Repeat: 6
} as const;

export const StatusTypes = {
	InProgress: 0,
	Planning: 1,
	Completed: 2,
	Dropped: 3,
	Paused: 4,
	Repeating: 5
} as const;
export const StatusNames = {
	0: 'In Progress',
	1: 'Planning',
	2: 'Completed',
	3: 'Dropped',
	4: 'Paused',
	5: 'Repeating'
};

export const ObjectTypes = {
	Anime: 0,
	Manga: 1
	// there may be more types (as shown on the anilist website), but i dont have data for them
} as const;
