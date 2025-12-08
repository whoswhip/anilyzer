<script lang="ts">
	import { notify } from '$lib/components/notificationStore';
	import type { Activity } from '$lib/types/gdpr/activity';
	import type { List } from '$lib/types/gdpr/list';
	import type { MangabakaSeries } from '$lib/types/series';
	import { ObjectTypes, StatusNames } from '$lib/types/gdpr/enums';
	import StatCard from '$lib/components/StatCard.svelte';
	import { browser } from '$app/environment';

	interface StatItem {
		title: string;
		subtitle?: string | null;
		value: string | number;
		tooltip?: string | null;
	}

	let stats: StatItem[] = [];
	let activities: Activity[] = [];
	let lists: List[] = [];
	let series: MangabakaSeries[] = [];
	let includeRepeats = browser && localStorage.getItem('includeRepeats') !== 'false';
	let fullClock = browser && localStorage.getItem('fullClock') !== 'false';

	$: if (browser) {
		localStorage.setItem('includeRepeats', String(includeRepeats));
		localStorage.setItem('fullClock', String(fullClock));
	}
	let settingsOpen: boolean = false;

	let totalChaptersRead: number = 0;
	let totalEpisodesWatched: number = 0;
	let watchTimeMinutes: number = 0;
	let readingStats = { chainedMinutes: 0, rangeMinutes: 0, averageMinutesPerChapter: 0 };
	let history: Record<number, Activity[]> = {};
	let dayEntries: Array<any> = [];
	let mostActiveDay = { date: '', chapters: 0, unit: 'chapters' };
	let streaks: any = {
		longestStreak: { manga: 0, anime: 0 },
		currentStreak: { manga: 0, anime: 0 }
	};

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
				analyzeData(data);
			} catch (error) {
				notify({ message: 'Error parsing JSON file.', type: 'error' });
				console.error('Error parsing JSON file:', error);
			}
		};
		reader.readAsText(file);
	}

	function analyzeData(data: any) {
		const activityData: Activity[] = data.activity;
		activities = activityData;
		lists = data.lists;
		const manga = lists.filter((list) => list.series_type === ObjectTypes.Manga);
		fetchMangaSeriesData(manga);
	}

	$: mangaLists = lists.filter((list) => list.series_type === ObjectTypes.Manga);
	$: animeLists = lists.filter((list) => list.series_type === ObjectTypes.Anime);

	$: totalChaptersRead = mangaLists.reduce(
		(sum, item) =>
			sum + (includeRepeats ? item.progress + item.repeat * item.progress : item.progress),
		0
	);

	$: totalEpisodesWatched = animeLists.reduce(
		(sum, item) =>
			sum + (includeRepeats ? item.progress + item.repeat * item.progress : item.progress),
		0
	);

	$: watchTimeMinutes = totalEpisodesWatched * 24;

	$: readingStats = calculateReadingTime(
		activities.filter((act) => act.object_type === ObjectTypes.Manga + 1)
	);

	$: history = buildHistory(activities);

	$: dayEntries = buildDayEntries(activities);

	$: mostActiveDay = (function () {
		if (!Array.isArray(dayEntries) || dayEntries.length === 0) return { date: '', chapters: 0, unit: 'chapters' };
		let top = { date: '', chapters: 0, unit: 'chapters' };
		for (const d of dayEntries) {
			const mangaTotal = (Object.values(d.manga || {}) as Array<number | string>).reduce<number>(
				(s, v) => s + (Number(v) || 0),
				0
			);
			const animeTotal = (Object.values(d.anime || {}) as Array<number | string>).reduce<number>(
				(s, v) => s + (Number(v) || 0),
				0
			);
			const amount = Math.max(mangaTotal, animeTotal);
			if (amount <= 0) continue;
			const unit = mangaTotal >= animeTotal ? 'chapters' : 'episodes';
			if (amount > top.chapters) {
				top = { date: new Date(d.date).toISOString(), chapters: amount, unit };
			}
		}
		return top;
	})();
	
	$: activitiesByHour = Array.from({ length: 24 }, (_, hour) => {
		const activitiesByHour = activities.filter(
			(activity) => new Date(activity.created_at).getUTCHours() === hour
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
			tooltip: `Total number of manga chapters you have read${includeRepeats ? ' (including repeats)' : ''}.`
		},
		{
			title: 'Estimated Watch Time',
			subtitle: 'hours',
			value: Math.round(watchTimeMinutes / 60),
			tooltip: 'Estimated total time spent watching anime.'
		},
		{
			title: 'Estimated Reading Time',
			subtitle: 'hours',
			value: Math.round((readingStats.chainedMinutes + readingStats.rangeMinutes) / 60),
			tooltip: 'Estimated total time spent reading manga.'
		},
		{
			title: 'Average Reading Speed',
			subtitle: 'minutes/chapter',
			value: readingStats.averageMinutesPerChapter.toFixed(2),
			tooltip: 'Your average time spent reading each manga chapter.'
		},
		{
			title: 'Longest Reading Streak',
			subtitle: 'days',
			value: streaks.longestStreak.manga,
			tooltip: 'The longest number of consecutive days you have read manga.'
		},
		{
			title: 'Current Reading Streak',
			subtitle: 'days',
			value: streaks.currentStreak.manga,
			tooltip: 'The current number of consecutive days you have read manga.'
		},
		{
			title: 'Longest Watching Streak',
			subtitle: 'days',
			value: streaks.longestStreak.anime,
			tooltip: 'The longest number of consecutive days you have watched anime.'
		},
		{
			title: 'Current Watching Streak',
			subtitle: 'days',
			value: streaks.currentStreak.anime,
			tooltip: 'The current number of consecutive days you have watched anime.'
		},
		{
			title: 'Longest Overall Streak',
			subtitle: 'days',
			value: Math.max(streaks.longestStreak.manga, streaks.longestStreak.anime) + 1,
			tooltip: 'The longest number of consecutive days you have engaged with either manga or anime.'
		},
		{
			title: 'Most Active Reading Day',
			subtitle: mostActiveDay.date ? `On ${mostActiveDay.date.split('T')[0]}` : 'On —',
			value: `${mostActiveDay.chapters} ${mostActiveDay.unit}`,
			tooltip: mostActiveDay.date
				? `On ${new Date(mostActiveDay.date).toLocaleDateString()}, you read ${mostActiveDay.chapters} ${mostActiveDay.unit}.`
				: 'No activity data.'
		}
	];
	
	$: mostReadSeries = lists
		.filter((list) => list.series_type === ObjectTypes.Manga)
		.map((list) => {
			const seriesData = series.find((s) => Number(s.sourceAnilistId) === list.series_id);
			return {
				...list,
				progress: includeRepeats ? list.progress + list.repeat * list.progress : list.progress,
				data: seriesData
			};
		})
		.sort((a, b) => {
			const aProgress = includeRepeats ? a.progress + a.repeat * a.progress : a.progress;
			const bProgress = includeRepeats ? b.progress + b.repeat * b.progress : b.progress;
			return bProgress - aProgress;
		});

	function calculateReadingTime(readingActivities: Activity[]) {
		const emptyTotals = { chainedMinutes: 0, rangeMinutes: 0, averageMinutesPerChapter: 0 };
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
			chainedReadingTimes.length > 0
				? chainedReadingTimes.reduce((sum, val) => sum + val, 0) / chainedReadingTimes.length
				: 0;
		const rangeMinutes = rangeActivities.reduce((sum, entry) => {
			return sum + entry.progress * averageMinutesPerChapter;
		}, 0);
		return {
			chainedMinutes: chainedReadingTimes.reduce((sum, val) => sum + val, 0),
			rangeMinutes,
			averageMinutesPerChapter
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
		return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
	}

	function buildDayEntries(activities: Activity[]) {
		if (!Array.isArray(activities)) return [];
		const sorted = [...activities].sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));
		const tracker = new Map<string, number>();
		const dayMap: Record<number, { date: number; total: number; anime: Record<string, number>; manga: Record<string, number> }> = {};

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
			.filter((d) => d.total > 0 || Object.keys(d.anime).length > 0 || Object.keys(d.manga).length > 0)
			.sort((a, b) => a.date - b.date);
	}

	function buildHistory(activities: Activity[]) {
		const history: Record<number, Activity[]> = {};
		for (const activity of activities) {
			const date = new Date(activity.created_at);
			const dateKey = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
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
				if (hasManga) tempStreak.manga += 1; else tempStreak.manga = 0;
				if (hasAnime) tempStreak.anime += 1; else tempStreak.anime = 0;
				if (hasManga || hasAnime) tempStreak.any += 1; else tempStreak.any = 0;
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
				currentStreak.manga = lastDayActs.some((a) => a.object_type === ObjectTypes.Manga + 1) ? 1 : 0;
				currentStreak.anime = lastDayActs.some((a) => a.object_type === ObjectTypes.Anime + 1) ? 1 : 0;
				currentStreak.any = currentStreak.manga || currentStreak.anime ? 1 : 0;
			} else {
				currentStreak = { ...tempStreak };
			}
		}

		return { longestStreak, currentStreak };
	}

	function fetchMangaSeriesData(lists: List[]) {
		const mangaIds = lists
			.filter((list) => list.series_type === ObjectTypes.Manga)
			.map((list) => list.series_id);

		if (mangaIds.length === 0) return;

		const chunkSize = 50;
		const chunks = Math.ceil(mangaIds.length / chunkSize);
		const shouldThrottle = chunks > 25;
		const delay = shouldThrottle ? 500 : 0;

		for (let i = 0; i < mangaIds.length; i += chunkSize) {
			const chunk = mangaIds.slice(i, i + chunkSize);
			const chunkIndex = Math.floor(i / chunkSize);

			setTimeout(() => {
				fetch(`/api/mangabaka/anilist?ids=${chunk.join(',')}`)
					.then((res) => res.json())
					.then((data: { count: number; data: MangabakaSeries[] }) => {
						series = [...series, ...data.data];
					})
					.catch((error) => {
						console.error('Error fetching Mangabaka series data:', error);
					});
			}, chunkIndex * delay);
		}
	}

	function getCoverURL(seriesId: number, quaity: 'small' | 'medium' | 'large' | 'raw' = 'medium') {
		const seriesData = series.find((s) => Number(s.sourceAnilistId) === seriesId);
		if (!seriesData) return '';
		switch (quaity) {
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
</script>

<main class="max-w-[1440px] mx-auto p-4 overflow-hidden">
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="mt-5 mb-5 text-center">
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div
			class="border-2 border-dashed border-slate-775 bg-slate-850 p-10 rounded-lg cursor-pointer flex flex-col items-center justify-center hover:bg-slate-875 hover:border-sky-400 transition-colors duration-300"
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
			<svg
				class="w-16 h-16 text-blue-100"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
				<polyline points="17 8 12 3 7 8"></polyline>
				<line x1="12" y1="3" x2="12" y2="15"></line>
			</svg>
			<h2 class="text-2xl font-semibold mb-2.5 text-blue-100">Upload Your AniList Data</h2>
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

	{#if activities.length > 0 || lists.length > 0}
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

	{#if activitiesByHour.some(hourData => hourData.count > 0)}
		<div class="mt-10">
			<h2 class="text-2xl font-semibold mb-4 text-blue-100">Activity by Hour</h2>
			<div class="flex gap-1 flex-wrap">
				{#each activitiesByHour as hourData (hourData.hour)}
					{@const maxCount = Math.max(...activitiesByHour.map(h => h.count)) || 1}
					{@const intensity = hourData.count / maxCount}
					{@const lightness = Math.min(70, 100 - intensity * 90)}
					<div
						class="w-12 h-12 rounded flex items-center justify-center text-xs font-semibold cursor-pointer transition-all hover:scale-110 group relative"
						style="background-color: hsl(200, 80%, {lightness}%)"
					>
						{fullClock
							? hourData.hour.toString().padStart(2, '0') + ':00'
							: ((hourData.hour % 12) || 12) + (hourData.hour < 12 ? ' AM' : ' PM')}
						<div class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-blue-100 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
							{hourData.count} activit{hourData.count === 1 ? 'y' : 'ies'}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	{#if mostReadSeries.length > 0}
		<div>
			<h2 class="text-2xl font-semibold mt-10 mb-4 text-blue-100">Most Read Series</h2>

			{#each mostReadSeries as series (series.series_id)}
				<div class="flex items-center space-x-4 mt-6 p-4 bg-slate-850 rounded-lg">
					<img
						src={getCoverURL(series.series_id, 'medium')}
						alt={series.data
							? series.data.title || series.data.romanizedTitle || series.data.nativeTitle
							: 'Cover'}
						class="w-32 h-48 object-cover rounded"
					/>
					<div>
						<h3 class="text-lg font-semibold text-blue-100">
							{series.data
								? series.data.title || series.data.romanizedTitle || series.data.nativeTitle
								: 'Unknown Title'}
						</h3>
						<p class="text-slate-400">Chapters Read: {series.progress}</p>
						<p class="text-slate-400">Status: {StatusNames[series.status]}</p>
						<p class="text-slate-400">Score: {series.score === 0 ? 'N/A' : series.score}</p>
						<div class="mt-2 text-sm text-slate-500">
							{#if series.data && series.data.description}
								{@html series.data.description.slice(0, 200) +
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

	<div
		class="fixed w-full h-screen backdrop-blur-sm top-0 left-0 {settingsOpen
			? 'flex'
			: 'hidden'} items-center justify-center z-50"
	>
		<div
			class="max-w-[1400px] w-full m-4 bg-slate-850 border border-slate-775 rounded-lg p-6 relative"
		>
			<h2 class="text-2xl font-semibold mb-4 text-blue-100">Settings</h2>
			<div class="space-y-4">
				<div class="flex items-center">
					<input
						type="checkbox"
						id="includeRepeatsSettings"
						bind:checked={includeRepeats}
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
						bind:checked={fullClock}
						class="mr-2"
					/>
					<label for="fullClockSettings" class="text-slate-400"
						>Display time in 24-hour format</label
					>
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
	<button
		class="p-2 fixed bottom-6 right-6 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-blue-100 rounded-full shadow-lg transition-colors duration-300"
		on:click={() => (settingsOpen = true)}
		aria-label="Open Settings"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="32"
			height="32"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="lucide lucide-settings-icon lucide-settings"
			><path
				d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"
			/><circle cx="12" cy="12" r="3" /></svg
		>
	</button>
</main>
