<script lang="ts">
	import { notify } from '$lib/components/notificationStore';
	import type { Activity } from '$lib/types/gdpr/activity';
	import type { List } from '$lib/types/gdpr/list';
	import type { User } from '$lib/types/gdpr/user';
	import type { MangabakaSeries } from '$lib/types/series';
	import { ObjectTypes, StatusNames } from '$lib/types/gdpr/enums';
	import StatCard from '$lib/components/StatCard.svelte';
	import ActivityGraph from '$lib/components/ActivityGraph.svelte';
	import { browser } from '$app/environment';
	import { getColor, darkenColor, pluralize } from '$lib/utils';
	import { slide } from 'svelte/transition';
	import { ArrowUp, ArrowDown, Settings, GithubIcon, Upload, ImageDown } from '@lucide/svelte';

	interface StatItem {
		title: string;
		subtitle?: string | null;
		value: string | number;
		tooltip?: string | null;
	}

	let fullData: { user: User; activity: Activity[]; lists: List[] } | null = null;
	let stats: StatItem[] = [];
	let activities: Activity[] = [];
	let lists: List[] = [];
	let series: MangabakaSeries[] = [];

	let userSettings = {
		includeRepeats: true,
		fullClock: true,
		fallbackAverageReadingTime: 5,
		assumeRepeatsAsTotalChapters: true
	};

	if (browser) {
		const stored = localStorage.getItem('UserSettings');
		if (stored) {
			try {
				const parsed = JSON.parse(stored);
				userSettings = { ...userSettings, ...parsed };
			} catch {
				notify({ message: 'Error parsing stored user settings.', type: 'error' });
			}
		}
	}

	let mostReadSeriesFolded = false;
	let settingsOpen: boolean = false;

	let hasActivity = false;
	$: hasActivity = activities.length > 0 || lists.length > 0;

	$: if (browser) {
		localStorage.setItem('UserSettings', JSON.stringify(userSettings));
	}

	let totalChaptersRead: number = 0;
	let totalEpisodesWatched: number = 0;
	let watchTimeMinutes: number = 0;
	let readingStats = {
		chainedMinutes: 0,
		rangeMinutes: 0,
		averageMinutesPerChapter: 0,
		remainingMinutes: 0
	};
	let history: Record<number, Activity[]> = {};
	let dayEntries: Array<{
		date: number;
		total: number;
		anime: Record<string, number>;
		manga: Record<string, number>;
	}> = [];
	type Streaks = {
		longestStreak: { manga: number; anime: number };
		currentStreak: { manga: number; anime: number };
	};

	let streaks: Streaks = {
		longestStreak: { manga: 0, anime: 0 },
		currentStreak: { manga: 0, anime: 0 }
	};

	type MangaEntry = List & { totalProgress: number; data?: MangabakaSeries };
	let mangaEntries: MangaEntry[] = [];
	let seriesByAnilistId: Record<number, MangabakaSeries> = {};

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		const files = event.dataTransfer?.files;
		if (files && files.length > 0) {
			processFile(files[0]);
		}
	}

	function processFile(file: File) {
		if (file.type !== 'application/json') {
			notify({ message: 'Please upload a valid JSON file.', type: 'warning' });
			return;
		}
		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const content = e.target?.result as string;
				const data = JSON.parse(content);
				if (!data.activity || !Array.isArray(data.activity)) {
					console.error('Invalid AniList GDPR data file structure:', data);
					notify({ message: 'Invalid AniList GDPR data file.', type: 'error' });
					return;
				}
				fullData = data;
				analyzeData(data);
			} catch (error) {
				notify({ message: 'Error parsing JSON file.', type: 'error' });
				console.error('Error parsing JSON file:', error);
			}
		};
		reader.readAsText(file);
	}

	function analyzeData(data: { activity: Activity[]; lists: List[] }) {
		const activityData: Activity[] = data.activity;
		activities = activityData;
		lists = data.lists;
		fetchMangaSeriesData(
			lists.filter((list) => list.series_type === ObjectTypes.Manga).map((list) => list.series_id)
		);
	}

	$: animeLists = lists.filter((list) => list.series_type === ObjectTypes.Anime);

	$: seriesByAnilistId = series.reduce(
		(acc, item) => {
			const key = Number(item.sourceAnilistId);
			if (Number.isFinite(key)) acc[key] = item;
			return acc;
		},
		{} as Record<number, MangabakaSeries>
	);

	$: mangaEntries = lists
		.filter((list) => list.series_type === ObjectTypes.Manga)
		.map((list) => {
			const series = seriesByAnilistId[list.series_id];
			const totalProgress = userSettings.includeRepeats
				? list.progress +
					list.repeat *
						(series?.status === 'completed' && userSettings.assumeRepeatsAsTotalChapters
							? Number(series?.totalChapters)
							: list.progress)
				: list.progress;
			return { ...list, totalProgress, data: series };
		});

	$: totalChaptersRead = mangaEntries.reduce((sum, item) => sum + item.totalProgress, 0);

	$: totalEpisodesWatched = animeLists.reduce(
		(sum, item) =>
			sum +
			(userSettings.includeRepeats ? item.progress + item.repeat * item.progress : item.progress),
		0
	);

	$: watchTimeMinutes = totalEpisodesWatched * 24;

	$: readingStats = calculateReadingTime(
		activities.filter((act) => act.object_type === ObjectTypes.Manga + 1),
		mangaEntries
	);

	$: history = buildHistory(activities);

	$: dayEntries = buildDayEntries(activities);

	$: mostActiveReadingDay = (function () {
		if (!Array.isArray(dayEntries) || dayEntries.length === 0)
			return { date: '', value: 0, unit: 'chapters' };
		const top = dayEntries.reduce(
			(max, d) => {
				const mangaTotal = Object.values(d.manga || {}).reduce((s, v) => s + (Number(v) || 0), 0);
				if (mangaTotal > max.total) {
					return { date: new Date(d.date).toISOString(), total: mangaTotal, unit: 'chapters' };
				}
				return max;
			},
			{ date: '', total: 0, unit: 'chapters' }
		);
		return { date: top.date, value: top.total, unit: top.unit };
	})();

	$: mostActiveWatchingDay = (function () {
		if (!Array.isArray(dayEntries) || dayEntries.length === 0)
			return { date: '', value: 0, unit: 'episodes' };
		const top = dayEntries.reduce(
			(max, d) => {
				const animeTotal = Object.values(d.anime || {}).reduce((s, v) => s + (Number(v) || 0), 0);
				if (animeTotal > max.total) {
					return { date: new Date(d.date).toISOString(), total: animeTotal, unit: 'episodes' };
				}
				return max;
			},
			{ date: '', total: 0, unit: 'episodes' }
		);
		return { date: top.date, value: top.total, unit: top.unit };
	})();

	$: mostActiveDayTotal = (function () {
		if (!Array.isArray(dayEntries) || dayEntries.length === 0)
			return { date: '', value: 0, unit: 'items' };
		const top = dayEntries.reduce(
			(max, d) => {
				if (d.total > max.total) {
					const mangaTotal = Object.values(d.manga || {}).reduce((s, v) => s + (Number(v) || 0), 0);
					const unit = mangaTotal >= d.total - mangaTotal ? 'chapters' : 'episodes';
					return { date: new Date(d.date).toISOString(), total: d.total, unit };
				}
				return max;
			},
			{ date: '', total: 0, unit: 'items' }
		);
		return { date: top.date, value: top.total, unit: top.unit };
	})();

	$: activitiesByHour = Array.from({ length: 24 }, (_, hour) => {
		const activitiesByHour = activities.filter(
			(activity) => new Date(activity.created_at).getHours() === hour
		);
		return { hour, activities: activitiesByHour, count: activitiesByHour.length };
	});

	$: streaks = calculateStreaks(history);

	$: stats = [
		{
			title: 'Total Episodes Watched',
			value: totalEpisodesWatched,
			tooltip: 'Total number of anime episodes you have watched.'
		},
		{
			title: 'Total Chapters Read',
			value: totalChaptersRead,
			tooltip: `Total number of manga chapters you have read${userSettings.includeRepeats ? ' (including repeats)' : ''}.`
		},
		{
			title: 'Estimated Watch Time',
			subtitle: pluralize(watchTimeMinutes / 60, 'hour', 'hours'),
			value: Math.round(watchTimeMinutes / 60),
			tooltip: 'Estimated total time spent watching anime.'
		},
		{
			title: 'Estimated Reading Time',
			subtitle: pluralize(
				(readingStats.chainedMinutes + readingStats.rangeMinutes + readingStats.remainingMinutes) /
					60,
				'hour',
				'hours'
			),
			value: Math.round(
				(readingStats.chainedMinutes + readingStats.rangeMinutes + readingStats.remainingMinutes) /
					60
			),
			tooltip: `Estimated total time spent reading manga. <br> Chained: ${Math.round(
				readingStats.chainedMinutes / 60
			)} hrs, Range: ${Math.round(readingStats.rangeMinutes / 60)} hrs, Remaining: ${Math.round(
				readingStats.remainingMinutes / 60
			)} hrs.`
		},
		{
			title: 'Average Reading Speed',
			subtitle: 'minutes/chapter',
			value: readingStats.averageMinutesPerChapter.toFixed(2),
			tooltip: 'Your average time spent reading each manga chapter.'
		},
		{
			title: 'Longest Reading Streak',
			subtitle: pluralize(streaks.longestStreak.manga, 'day', 'days'),
			value: streaks.longestStreak.manga,
			tooltip: 'The longest number of consecutive days you have read manga.'
		},
		{
			title: 'Current Reading Streak',
			subtitle: pluralize(streaks.currentStreak.manga, 'day', 'days'),
			value: streaks.currentStreak.manga,
			tooltip: 'The current number of consecutive days you have read manga.'
		},
		{
			title: 'Longest Watching Streak',
			subtitle: pluralize(streaks.longestStreak.anime, 'day', 'days'),
			value: streaks.longestStreak.anime,
			tooltip: 'The longest number of consecutive days you have watched anime.'
		},
		{
			title: 'Current Watching Streak',
			subtitle: pluralize(streaks.currentStreak.anime, 'day', 'days'),
			value: streaks.currentStreak.anime,
			tooltip: 'The current number of consecutive days you have watched anime.'
		},
		{
			title: 'Longest Overall Streak',
			subtitle: pluralize(
				Math.max(streaks.longestStreak.manga, streaks.longestStreak.anime) + 1,
				'day',
				'days'
			),
			value: Math.max(streaks.longestStreak.manga, streaks.longestStreak.anime) + 1,
			tooltip: 'The longest number of consecutive days you have engaged with either manga or anime.'
		},
		{
			title: 'Most Active Reading Day',
			subtitle: mostActiveReadingDay.date
				? `On ${mostActiveReadingDay.date.split('T')[0]}`
				: 'On —',
			value: `${mostActiveReadingDay.value} ${mostActiveReadingDay.unit}`,
			tooltip: mostActiveReadingDay.date
				? `On ${new Date(mostActiveReadingDay.date).toLocaleDateString()}, you read ${mostActiveReadingDay.value} ${mostActiveReadingDay.unit}.`
				: 'No activity data.'
		},
		{
			title: 'Most Active Watching Day',
			subtitle: mostActiveWatchingDay.date
				? `On ${mostActiveWatchingDay.date.split('T')[0]}`
				: 'On —',
			value: `${mostActiveWatchingDay.value} ${mostActiveWatchingDay.unit}`,
			tooltip: mostActiveWatchingDay.date
				? `On ${new Date(mostActiveWatchingDay.date).toLocaleDateString()}, you watched ${mostActiveWatchingDay.value} ${mostActiveWatchingDay.unit}.`
				: 'No activity data.'
		},
		{
			title: 'Most Active Day Overall',
			subtitle: mostActiveDayTotal.date ? `On ${mostActiveDayTotal.date.split('T')[0]}` : 'On —',
			value: `${mostActiveDayTotal.value} ${mostActiveDayTotal.unit}`,
			tooltip: mostActiveDayTotal.date
				? `On ${new Date(mostActiveDayTotal.date).toLocaleDateString()}, you had ${mostActiveDayTotal.value} total ${mostActiveDayTotal.unit}.`
				: 'No activity data.'
		}
	];

	$: mostReadSeries = [...mangaEntries].sort((a, b) => b.totalProgress - a.totalProgress);

	function calculateReadingTime(readingActivities: Activity[], mangaEntries: MangaEntry[]) {
		const emptyTotals = {
			chainedMinutes: 0,
			rangeMinutes: 0,
			averageMinutesPerChapter: 0,
			remainingMinutes: 0
		};
		if (readingActivities.length === 0) return emptyTotals;

		const sorted = [...readingActivities].sort(
			(a, b) => Date.parse(a.created_at) - Date.parse(b.created_at)
		);

		const rangeActivities = [];
		for (const activity of sorted) {
			if (isRangeActivity(activity)) {
				const progress = parseActivityProgress(activity);
				if (progress > 0) {
					rangeActivities.push({ activity, progress });
				}
			}
		}

		const chainedReadingTimes: number[] = [];
		const seriesGroups: Record<number, Activity[]> = {};

		for (const activity of sorted) {
			if (!isRangeActivity(activity) && parseInt(activity.object_value, 10) > 0) {
				const objectId = activity.object_id;
				if (!seriesGroups[objectId]) {
					seriesGroups[objectId] = [];
				}
				seriesGroups[objectId].push(activity);
			}
		}

		const remainingChapters =
			mangaEntries.reduce((sum, entry) => sum + entry.totalProgress, 0) -
			rangeActivities.reduce((sum, entry) => sum + entry.progress, 0);

		for (const activities of Object.values(seriesGroups)) {
			for (let i = 1; i < activities.length; i++) {
				const prevTime = Date.parse(activities[i - 1].created_at);
				const currTime = Date.parse(activities[i].created_at);
				const minutesDiff = (currTime - prevTime) / 1000 / 60;

				if (minutesDiff > 0 && minutesDiff <= 15) {
					chainedReadingTimes.push(minutesDiff);
				}
			}
		}

		const averageMinutesPerChapter =
			chainedReadingTimes.length > 1
				? chainedReadingTimes.reduce((sum, val) => sum + val, 0) / chainedReadingTimes.length
				: userSettings.fallbackAverageReadingTime;
		const rangeMinutes = rangeActivities.reduce((sum, entry) => {
			return sum + entry.progress * averageMinutesPerChapter;
		}, 0);
		const remainingMinutes = remainingChapters * averageMinutesPerChapter;
		return {
			chainedMinutes: chainedReadingTimes.reduce((sum, val) => sum + val, 0),
			rangeMinutes,
			averageMinutesPerChapter,
			remainingMinutes
		};
	}

	function isRangeActivity(activity: Activity) {
		return activity.object_value.includes('-');
	}

	function parseActivityProgress(activity: Activity) {
		const value = activity.object_value;
		if (value.includes('-')) {
			const [startStr, endStr] = value.split('-').map((s) => s.trim());
			const start = parseInt(startStr, 10);
			const end = parseInt(endStr, 10);
			if (!isNaN(start) && !isNaN(end)) {
				return end - start + 1;
			}
		} else {
			const num = parseInt(value, 10);
			if (!isNaN(num)) {
				return 1;
			}
		}
		return 0;
	}

	function getProgressDeltaForActivity(activity: Activity, tracker: Map<string, number>) {
		if (!activity) return 0;
		const type = activity.object_type;
		if (type !== ObjectTypes.Anime + 1 && type !== ObjectTypes.Manga + 1) return 0;
		const value = activity.object_value;
		if (typeof value !== 'string' || !value.trim()) return 0;

		const key = `${type}:${activity.object_id}`;

		if (value.includes('-')) {
			const parts = value.split('-').map((p) => parseInt(p.trim(), 10));
			if (parts.length === 2 && Number.isFinite(parts[0]) && Number.isFinite(parts[1])) {
				const delta = parts[1] - parts[0] + 1;
				tracker.set(key, parts[1]);
				return delta > 0 ? delta : 0;
			}
			return 0;
		}

		const current = parseInt(value, 10);
		if (!Number.isFinite(current)) return 0;

		const previous = tracker.get(key);
		tracker.set(key, current);

		if (previous === undefined) {
			return 0;
		}

		const delta = current - previous;
		return delta > 0 ? delta : 0;
	}

	function toDayStartUTC(timestamp: number) {
		if (timestamp === null || timestamp === undefined) return NaN;
		const date = new Date(Number(timestamp));
		if (Number.isNaN(date.getTime())) return NaN;
		return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
	}

	function buildDayEntries(activities: Activity[]) {
		if (!Array.isArray(activities)) return [];
		const sorted = [...activities].sort(
			(a, b) => Date.parse(a.created_at) - Date.parse(b.created_at)
		);
		const tracker = new Map<string, number>();
		const dayMap: Record<
			number,
			{ date: number; total: number; anime: Record<string, number>; manga: Record<string, number> }
		> = {};

		for (const activity of sorted) {
			const ts = Date.parse(activity.created_at);
			if (Number.isNaN(ts)) continue;
			const delta = getProgressDeltaForActivity(activity, tracker);
			if (!delta || delta <= 0) continue;

			const dayKey = toDayStartUTC(ts);
			if (!Number.isFinite(dayKey)) continue;

			if (!dayMap[dayKey]) {
				dayMap[dayKey] = { date: dayKey, total: 0, anime: {}, manga: {} };
			}
			const entry = dayMap[dayKey];
			entry.total += delta;
			const seriesKey = String(activity.object_id);
			if (activity.object_type === ObjectTypes.Anime + 1) {
				entry.anime[seriesKey] = (entry.anime[seriesKey] || 0) + delta;
			} else if (activity.object_type === ObjectTypes.Manga + 1) {
				entry.manga[seriesKey] = (entry.manga[seriesKey] || 0) + delta;
			}
		}

		return Object.values(dayMap)
			.filter(
				(d) => d.total > 0 || Object.keys(d.anime).length > 0 || Object.keys(d.manga).length > 0
			)
			.sort((a, b) => a.date - b.date);
	}

	function buildHistory(activities: Activity[]) {
		const history: Record<number, Activity[]> = {};
		for (const activity of activities) {
			const date = new Date(activity.created_at);
			const dateKey = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
			if (!history[dateKey]) history[dateKey] = [];
			history[dateKey].push(activity);
		}
		return history;
	}

	function calculateStreaks(history: Record<number, Activity[]>) {
		let longestStreak = { manga: 0, anime: 0, any: 0 };
		let currentStreak = { manga: 0, anime: 0, any: 0 };
		let tempStreak = { manga: 0, anime: 0, any: 0 };
		const dates = Object.keys(history)
			.map((key) => parseInt(key, 10))
			.sort((a, b) => a - b);

		if (dates.length === 0) return { longestStreak, currentStreak };

		const now = new Date();
		const todayTime = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

		for (let i = 1; i < dates.length; i++) {
			const prevDate = new Date(dates[i - 1]);
			const currDate = new Date(dates[i]);
			const diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

			if (diffDays === 1) {
				const dayActivities = history[dates[i]];
				const hasManga = dayActivities.some((a) => a.object_type === ObjectTypes.Manga + 1);
				const hasAnime = dayActivities.some((a) => a.object_type === ObjectTypes.Anime + 1);
				if (hasManga) tempStreak.manga += 1;
				else tempStreak.manga = 0;
				if (hasAnime) tempStreak.anime += 1;
				else tempStreak.anime = 0;
				if (hasManga || hasAnime) tempStreak.any += 1;
				else tempStreak.any = 0;
			} else {
				tempStreak = { manga: 0, anime: 0, any: 0 };
			}

			longestStreak.manga = Math.max(longestStreak.manga, tempStreak.manga);
			longestStreak.anime = Math.max(longestStreak.anime, tempStreak.anime);
			longestStreak.any = Math.max(longestStreak.any, tempStreak.any);
		}

		const lastDate = new Date(dates[dates.length - 1]);
		const diffFromToday = (todayTime - lastDate.getTime()) / (1000 * 60 * 60 * 24);

		if (diffFromToday <= 1) {
			if (dates.length === 1) {
				const lastDayActs = history[dates[0]];
				currentStreak.manga = lastDayActs.some((a) => a.object_type === ObjectTypes.Manga + 1)
					? 1
					: 0;
				currentStreak.anime = lastDayActs.some((a) => a.object_type === ObjectTypes.Anime + 1)
					? 1
					: 0;
				currentStreak.any = currentStreak.manga || currentStreak.anime ? 1 : 0;
			} else {
				currentStreak = { ...tempStreak };
			}
		}

		return { longestStreak, currentStreak };
	}

	async function fetchMangaSeriesData(mangaIds: number[]) {
		if (mangaIds.length === 0) return;

		const chunkSize = 50;
		const chunks = Math.ceil(mangaIds.length / chunkSize);
		const shouldThrottle = chunks > 25;
		const delay = shouldThrottle ? 500 : 0;

		for (let i = 0; i < mangaIds.length; i += chunkSize) {
			const chunk = mangaIds.slice(i, i + chunkSize);
			const chunkIndex = Math.floor(i / chunkSize);

			setTimeout(async () => {
				const cacheKey = `mangabaka_anilist_${chunk.join(',')}`;
				if ('caches' in window) {
					const cache = await caches.open('mangabaka-anilist');
					const cachedResp = await cache.match(cacheKey);
					if (cachedResp) {
						const json = await cachedResp.json();
						if (Date.now() - json.timestamp < 6 * 60 * 60 * 1000) {
							series = [...series, ...json.data];
							return;
						}
					}
				}
				fetch(`/api/mangabaka/anilist?ids=${chunk.join(',')}`)
					.then((res) => res.json())
					.then(async (data: { count: number; data: MangabakaSeries[] }) => {
						series = [...series, ...data.data];
						if ('caches' in window) {
							const cache = await caches.open('mangabaka-anilist');
							const resp = new Response(JSON.stringify({ timestamp: Date.now(), data: data.data }));
							await cache.put(cacheKey, resp);
						}
					})
					.catch(() => {});
			}, chunkIndex * delay);
		}
	}

	function getCoverURL(seriesId: number, quality: 'small' | 'medium' | 'large' | 'raw' = 'medium') {
		const seriesData = seriesByAnilistId[seriesId];
		if (!seriesData) return '';
		switch (quality) {
			case 'small':
				return seriesData.coverX150X1;
			case 'medium':
				return seriesData.coverX250X1;
			case 'large':
				return seriesData.coverX350X1;
			case 'raw':
				return seriesData.coverRawUrl;
			default:
				return seriesData.coverX250X1;
		}
	}

	function generateStatsImage() {
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		canvas.width = 800;
		canvas.height = 200 + stats.length * 70 + 20;

		ctx.beginPath();
		ctx.fillStyle = '#0b1622';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		ctx.beginPath();
		ctx.fillStyle = '#151f2e';
		ctx.strokeStyle = '#253049';
		ctx.roundRect(30, 30, canvas.width - 60, canvas.height - 60, 10);
		ctx.fill();
		ctx.stroke();

		const avatarUrl = fullData?.user?.avatar_url
			? `https://s4.anilist.co/file/anilistcdn/user/avatar/medium/${fullData?.user?.avatar_url}`
			: '';
		const username = fullData?.user?.display_name || 'Unknown User';
		const avatarImg = new Image();
		avatarImg.crossOrigin = 'anonymous';
		avatarImg.src = avatarUrl;
		avatarImg.onload = () => {
			ctx.save();
			ctx.beginPath();
			ctx.arc(100, 100, 50, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.clip();
			ctx.drawImage(avatarImg, 50, 50, 100, 100);
			ctx.restore();

			ctx.fillStyle = '#dbeafe';
			ctx.font = 'bold 28px Segoe UI';
			ctx.fillText(username, 170, 110);
			ctx.fillStyle = '#6b7280';
			ctx.font = '18px Segoe UI';
			ctx.fillText(new Date().toLocaleDateString(), 170, 140);

			const imageUrl = canvas.toDataURL('image/png');
			const link = document.createElement('a');
			link.href = imageUrl;
			link.download = 'anilyzer_stats.png';
			link.click();
		};

		let rowTop = 175;
		const rowHeight = 60;
		stats.forEach((stat) => {
			ctx.beginPath();
			ctx.fillStyle = '#1a2332';
			ctx.strokeStyle = '#253049';
			ctx.roundRect(50, rowTop, canvas.width - 100, rowHeight, 8);
			ctx.fill();
			ctx.stroke();
			ctx.textBaseline = 'middle';
			ctx.fillStyle = '#94a3b8';
			ctx.font = '20px Segoe UI';
			ctx.fillText(stat.title, 70, rowTop + rowHeight / 2);
			ctx.fillStyle = '#dbeafe';
			ctx.font = 'bold 24px Segoe UI';
			let valueText = typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value;
			if (stat.subtitle) {
				valueText += ` ${stat.subtitle}`;
			}
			let width = ctx.measureText(valueText).width;
			ctx.fillText(valueText, canvas.width - 70 - width, rowTop + rowHeight / 2);
			ctx.textBaseline = 'alphabetic';
			rowTop += rowHeight + 10;
		});
	}
</script>

<main class="max-w-[1440px] p-4 mx-auto overflow-hidden">
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="mt-5 mb-5 text-center">
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div
			class="border-2 border-dashed border-slate-775 bg-slate-850 {hasActivity
				? 'p-5'
				: 'p-10'} rounded-lg cursor-pointer flex flex-col items-center justify-center hover:bg-slate-875 hover:border-sky-400 transition-all duration-300"
			on:drop={handleDrop}
			on:dragover={(event) => {
				event.preventDefault();
				(event.currentTarget as HTMLElement).classList.add('bg-slate-875', 'border-sky-400');
			}}
			on:dragleave={(event) => {
				(event.currentTarget as HTMLElement).classList.remove('bg-slate-875', 'border-sky-400');
			}}
			on:click={() => document.getElementById('fileInput')?.click()}
		>
			{#if !hasActivity}
				<Upload class="w-16 h-16 text-blue-100" />
			{/if}

			<h2 class="text-2xl font-semibold {hasActivity ? 'mb-2.5' : ''} text-blue-100">
				Upload Your AniList Data
			</h2>
			<p class="text-lg text-slate-400">
				Drag and drop your <strong class="text-blue-400">gdpr_data.json</strong> file here or click to
				browse
			</p>

			<input
				type="file"
				id="fileInput"
				class="hidden"
				accept=".json"
				on:change={(e) => {
					const files = (e.target as HTMLInputElement).files;
					if (files && files.length > 0) {
						processFile(files[0]);
					}
				}}
			/>
		</div>
	</div>

	{#if hasActivity}
		<div class="grid mt-5 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each stats as stat (stat.title)}
				<StatCard
					title={stat.title}
					subtitle={stat.subtitle}
					value={stat.value}
					tooltip={stat.tooltip}
				/>
			{/each}
		</div>
	{/if}

	{#if dayEntries.length > 0}
		<ActivityGraph entries={dayEntries} listData={mostReadSeries} />
	{/if}

	{#if activitiesByHour.some((hourData) => hourData.count > 0)}
		<div class="bg-slate-850 border border-slate-775 rounded-lg p-5 mt-10">
			<h2 class="text-2xl font-semibold text-blue-100 mb-5">Activity by Hour</h2>
			<div class="flex gap-1 flex-wrap">
				{#each activitiesByHour as hourData (hourData.hour)}
					{@const maxCount = Math.max(...activitiesByHour.map((h) => h.count)) || 1}
					<div
						class="w-12 h-12 rounded flex items-center justify-center text-xs font-semibold cursor-pointer transition-all hover:scale-110 relative group"
						style="background-color: {getColor(hourData.count, maxCount)}"
					>
						<span class="text-shadow-black text-shadow-sm">
							{userSettings.fullClock
								? hourData.hour.toString().padStart(2, '0') + ':00'
								: (hourData.hour % 12 || 12) + (hourData.hour < 12 ? ' AM' : ' PM')}
						</span>

						<span
							class="sm:hidden absolute bottom-0 left-1/2 w-12 -translate-x-1/2 text-blue-100 px-1 rounded-b-sm text-xs whitespace-nowrap text-center"
							style="background-color: {darkenColor(getColor(hourData.count, maxCount), 0.6)}"
						>
							{hourData.count}
						</span>
						<div
							class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-775 text-blue-100 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
						>
							{hourData.count} activit{hourData.count === 1 ? 'y' : 'ies'}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	{#if mostReadSeries.length > 0}
		<div class="bg-slate-850 border border-slate-775 rounded-lg p-5 mt-10">
			<div class="w-full flex items-center justify-between">
				<h2 class="text-2xl font-semibold text-blue-100">Most Read Series</h2>
				<button
					class="text-sm text-blue-100 hover:text-blue-400"
					on:click={() => (mostReadSeriesFolded = !mostReadSeriesFolded)}
				>
					{#if mostReadSeriesFolded}
						<ArrowUp></ArrowUp>
					{:else}
						<ArrowDown></ArrowDown>
					{/if}
				</button>
			</div>

			{#if !mostReadSeriesFolded}
				<div transition:slide>
					{#each mostReadSeries.slice(0, 10) as series (series.series_id)}
						<div
							class="flex items-center space-x-4 mt-6 p-4 bg-slate-875 rounded-lg border border-slate-800"
						>
							<img
								src={getCoverURL(series.series_id, 'medium')}
								alt={series.data
									? series.data.title || series.data.romanizedTitle || series.data.nativeTitle
									: 'Cover'}
								loading="lazy"
								class="w-32 h-48 object-cover rounded"
							/>
							<div>
								<a
									class="text-lg font-semibold text-blue-100 hover:text-blue-400"
									href={series.data
										? `https://mangabaka.org/${series.data.id}`
										: `https://anilist.co/manga/${series.series_id}`}
									target="_blank"
									rel="noopener noreferrer"
									referrerpolicy="origin"
								>
									{series.data
										? series.data.title || series.data.romanizedTitle || series.data.nativeTitle
										: 'Unknown Title'}
								</a>
								<p class="text-slate-400">Chapters Read: {series.totalProgress}</p>
								<p class="text-slate-400">Status: {StatusNames[series.status]}</p>
								<p class="text-slate-400">Score: {series.score === 0 ? 'N/A' : series.score}</p>
								<div class="mt-2 text-sm text-slate-500">
									{#if series.data && series.data.description}
										{series.data.description.slice(0, 200) +
											(series.data.description.length > 200 ? '...' : '')}
									{:else}
										No description available.
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	{#if settingsOpen}
		<div
			class="fixed w-full h-screen backdrop-blur-sm top-0 left-0 flex items-center justify-center z-50"
			role="dialog"
			tabindex="0"
			on:click={() => (settingsOpen = false)}
			on:keydown={(e) => {
				if (e.key === 'Escape') settingsOpen = false;
			}}
		>
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="max-w-[1400px] w-full m-4 bg-slate-850 border border-slate-775 rounded-lg p-6 relative"
				on:click|capture={(e) => e.stopPropagation()}
			>
				<h2 class="text-2xl font-semibold mb-4 text-blue-100">Settings</h2>
				<div class="space-y-4">
					<div class="flex items-center">
						<input
							type="checkbox"
							id="includeRepeatsSettings"
							bind:checked={userSettings.includeRepeats}
							class="mr-2"
						/>
						<label for="includeRepeatsSettings" class="text-slate-400"
							>Include repeats in calculations</label
						>
					</div>
					<div class="flex items-center">
						<input
							type="checkbox"
							id="fullClockSettings"
							bind:checked={userSettings.fullClock}
							class="mr-2"
						/>
						<label for="fullClockSettings" class="text-slate-400"
							>Display time in 24-hour format</label
						>
					</div>
					<div class="flex items-center">
						<input
							type="checkbox"
							id="assumeRepeatsAsTotalChapters"
							bind:checked={userSettings.assumeRepeatsAsTotalChapters}
							class="mr-2"
						/>
						<label for="assumeRepeatsAsTotalChapters" class="text-slate-400 mr-2"
							>Assume repeats as the series total chapters in calculations</label
						>
					</div>
					<div class="flex items-center">
						<label for="fallbackAverageReadingTime" class="text-slate-400 mr-2"
							>Fallback Average Reading Time (minutes per chapter):</label
						>
						<input
							type="number"
							id="fallbackAverageReadingTime"
							bind:value={userSettings.fallbackAverageReadingTime}
							min="1"
							class="w-20 p-1 rounded border border-slate-700 bg-slate-800 text-blue-100"
						/>
					</div>
				</div>
				<button
					class="absolute top-4 right-4 text-slate-400 hover:text-blue-400 text-4xl"
					on:click={() => (settingsOpen = false)}
					aria-label="Close Settings"
				>
					&times;
				</button>
			</div>
		</div>
	{/if}
	<button
		class="p-2 fixed bottom-6 right-6 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-blue-100 rounded-full shadow-lg transition-colors duration-300 cursor-pointer"
		on:click={() => (settingsOpen = true)}
		aria-label="Open Settings"
	>
		<Settings size="32" />
	</button>
	<a
		href="https://github.com/whoswhip/anilyzer"
		aria-label="github"
		class="p-2 fixed bottom-20 right-6 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-blue-100 rounded-full shadow-lg transition-colors duration-300"
	>
		<GithubIcon size="32" />
	</a>
	<button
		class="p-2 fixed bottom-34 right-6 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-blue-100 rounded-full shadow-lg transition-colors duration-300 cursor-pointer
		{!hasActivity ? 'opacity-50 pointer-events-none' : ''}"
		on:click={generateStatsImage}
		aria-label="Download Stats Image"
	>
		<ImageDown size="32" />
	</button>
</main>
