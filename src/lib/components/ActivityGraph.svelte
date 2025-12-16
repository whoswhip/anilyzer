<script lang="ts">
	import type { MangabakaSeries } from '$lib/types/series';
	import { colors } from '$lib/constants';
	import { getColor } from '$lib/utils';
	import { SvelteMap } from 'svelte/reactivity';

	type ActivityEntry = {
		date: number | string;
		total?: number;
		anime?: Record<string, number | string>;
		manga?: Record<string, number | string>;
	};

	type TooltipState = {
		text: string;
		element?: HTMLDivElement;
		x: number;
		y: number;
		visible: boolean;
		frozen: boolean;
		content: { manga: MangabakaSeries[]; anime: string[] } | null;
	};

	export let entries: ActivityEntry[] = [];
	export let listData: Array<{
		series_id: number;
		data?: { title?: string; romanizedTitle?: string; nativeTitle?: string };
	}> = [];

	const dayMs = 1000 * 60 * 60 * 24;

	const toKey = (value: number) => {
		const date = new Date(value);
		return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
	};
	const groupSum = (group?: Record<string, number | string>) => {
		if (!group) return 0;
		let total = 0;
		for (const value of Object.values(group)) {
			const parsed = Number(value);
			if (Number.isFinite(parsed)) total += parsed;
		}
		return total;
	};

	let entryTotals = new SvelteMap<string, number>();
	let entryDetails = new SvelteMap<string, { manga: MangabakaSeries[]; anime: string[] }>();
	let normalizedEntries: ActivityEntry[] = [];

	$: {
		entryTotals = new SvelteMap();
		entryDetails = new SvelteMap();
		normalizedEntries = Array.isArray(entries) ? entries : [];
		for (const entry of normalizedEntries) {
			const rawDate = typeof entry.date === 'string' ? Date.parse(entry.date) : Number(entry.date);
			if (!Number.isFinite(rawDate)) continue;
			const total = entry.total ?? groupSum(entry.anime) + groupSum(entry.manga);
			const key = toKey(rawDate);
			entryTotals.set(key, total > 0 ? total : 0);

			const animeTitles = Object.keys(entry.anime || {}).map((id) => {
				const list = listData.find((l) => String(l.series_id) === id);
				return list?.data?.title || list?.data?.romanizedTitle || list?.data?.nativeTitle || id;
			});
			const mangaSeries = Object.keys(entry.manga || {}).map((id) => {
				const list = listData.find((l) => String(l.series_id) === id);
				return {
					sourceAnilistId: id,
					title:
						list?.data?.title ||
						list?.data?.romanizedTitle ||
						list?.data?.nativeTitle ||
						`Series ${id}`
				} as MangabakaSeries;
			});

			if (mangaSeries.length > 0 || animeTitles.length > 0) {
				entryDetails.set(key, { manga: mangaSeries, anime: animeTitles });
			}
		}
	}

	let today = new Date();
	let endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
	endDate.setHours(0, 0, 0, 0);
	let endDay = endDate.getDay();
	let defaultStart = endDate.getTime() - (52 * 7 + endDay) * dayMs;
	let startDate = defaultStart;

	let calendarDays: Array<{ timestamp: number; total: number }> = [];
	let weeks: Array<Array<{ timestamp: number; total: number }>> = [];
	let maxValue: number = 0;
	let hasActivity: boolean = false;

	$: {
		calendarDays = [];
		for (let current = startDate; current <= endDate.getTime(); current += dayMs) {
			const key = toKey(current);
			const total = entryTotals.get(key) ?? 0;
			calendarDays.push({ timestamp: current, total });
		}
	}

	$: {
		weeks = [];
		for (let i = 0; i < calendarDays.length; i += 7) {
			weeks.push(calendarDays.slice(i, i + 7));
		}
	}

	$: maxValue = Math.max(0, ...Array.from(entryTotals.values()));
	$: hasActivity = maxValue > 0;

	let tooltip: TooltipState = {
		text: '',
		x: 0,
		y: 0,
		visible: false,
		frozen: false,
		content: null
	};
	let tooltipElement: HTMLDivElement | null = null;

	const showTooltip = (
		day: { timestamp: number; total: number },
		event: MouseEvent,
		element: HTMLDivElement
	) => {
		if (tooltip.frozen) return;

		const date = formatDate(day.timestamp);
		const key = toKey(day.timestamp);
		const details = entryDetails.get(key) || { manga: [], anime: [] };
		element.classList.add('outline', 'outline-2', 'outline-blue-500', 'scale-150');

		tooltip = {
			text: `${date} · ${day.total} activity`,
			element: element,
			x: event.pageX,
			y: event.pageY,
			visible: true,
			frozen: false,
			content: details
		};
	};

	const moveMouse = (event: MouseEvent) => {
		if (tooltip.frozen || !tooltip.visible) return;
		updateTooltipPosition(event.pageX, event.pageY);
	};

	const updateTooltipPosition = (x: number, y: number) => {
		if (!tooltipElement) return;

		const padding = 12;
		const rect = tooltipElement.getBoundingClientRect();
		let finalX = x + padding;
		let finalY = y + padding;

		if (finalX + rect.width > window.scrollX + window.innerWidth) {
			finalX = Math.max(window.scrollX, window.scrollX + window.innerWidth - rect.width - padding);
		}
		if (finalY + rect.height > window.scrollY + window.innerHeight) {
			finalY = Math.max(
				window.scrollY,
				window.scrollY + window.innerHeight - rect.height - padding
			);
		}

		tooltip.x = finalX;
		tooltip.y = finalY;
	};

	const freezeTooltip = (day: { timestamp: number; total: number }, element: HTMLDivElement) => {
		const date = formatDate(day.timestamp);
		const key = toKey(day.timestamp);
		const details = entryDetails.get(key) || { manga: [], anime: [] };

		tooltip.element?.classList.remove('outline', 'outline-2', 'outline-blue-500', 'scale-150');
		element.classList.add('outline', 'outline-2', 'outline-blue-500', 'scale-150');

		tooltip = {
			text: `${date} · ${day.total} activity`,
			element: element,
			x: tooltip.x,
			y: tooltip.y,
			visible: true,
			frozen: true,
			content: details
		};
	};

	const hideTooltip = () => {
		if (tooltip.frozen) return;
		tooltip.element?.classList.remove('outline', 'outline-2', 'outline-blue-500', 'scale-150');
		tooltip = { text: '', x: 0, y: 0, visible: false, frozen: false, content: null };
	};

	const unfreezeTooltip = () => {
		tooltip.element?.classList.remove('outline', 'outline-2', 'outline-blue-500', 'scale-150');
		tooltip = { ...tooltip, frozen: false };
	};

	const formatDate = (timestamp: number) => {
		const date = new Date(timestamp);
		return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
	};
</script>

<div class="bg-slate-850 border border-slate-775 rounded-lg p-5 mt-10">
	<div class="flex items-center justify-between gap-4 flex-wrap">
		<div>
			<h2 class="text-2xl font-semibold text-blue-100">Activity Graph</h2>
			<p class="text-slate-400 text-sm">Past year of reading and watching activity.</p>
		</div>
		<div class="flex items-center gap-2 text-xs text-slate-400">
			<span>Less</span>
			{#each colors as color (color)}
				<div class="w-4 h-4 rounded" style={`background:${color}`}></div>
			{/each}
			<span>More</span>
		</div>
	</div>

	{#if weeks.length === 0}
		<div class="text-slate-400 text-sm mt-4">No activity to show.</div>
	{:else}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="flex mt-6 overflow-x-auto pb-2" on:mouseleave={hideTooltip}>
			<div class="flex flex-col justify-between text-xs text-slate-500 mr-3 py-0.5">
				<span class="h-4">Sun</span>
				<span class="h-4">Tue</span>
				<span class="h-4">Thu</span>
				<span class="h-4">Sat</span>
			</div>
			<div class="flex gap-1">
				{#each weeks as week, index (index)}
					<div class="grid grid-rows-7 gap-1" aria-label={`Week ${index + 1}`}>
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						{#each week as day (day.timestamp)}
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<div
								class="w-4 h-4 rounded transition-transform hover:scale-150 cursor-pointer hover:outline-1 outline-blue-500"
								style={`background:${getColor(day.total, maxValue)}`}
								on:mouseenter={(event) =>
									showTooltip(day, event, event.currentTarget as HTMLDivElement)}
								on:mousemove={(event) => moveMouse(event)}
								on:mouseleave={hideTooltip}
								on:click={(event) => freezeTooltip(day, event.currentTarget as HTMLDivElement)}
								aria-label={`${formatDate(day.timestamp)} ${day.total} activity`}
							></div>
						{/each}
					</div>
				{/each}
			</div>
		</div>
		{#if !hasActivity}
			<div class="text-slate-400 text-sm mt-4">No recorded activity during this period.</div>
		{/if}
	{/if}
	{#if tooltip.visible}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			bind:this={tooltipElement}
			class={`absolute z-50 bg-slate-900 text-blue-100 rounded shadow-lg border border-slate-775 ${tooltip.frozen ? '' : 'pointer-events-none'}`}
			style={`top:${tooltip.y}px;left:${tooltip.x}px;transition:all 0.1s ease-out;`}
			on:mouseleave={unfreezeTooltip}
		>
			<div class="px-3 py-2 text-xs font-medium border-b border-slate-775 whitespace-nowrap">
				{tooltip.text}
			</div>
			{#if tooltip.content && (tooltip.content.manga.length > 0 || tooltip.content.anime.length > 0)}
				<div class="px-3 py-2 max-w-64 max-h-32 overflow-y-auto">
					{#if tooltip.content.manga.length > 0}
						<div class="mb-2">
							<p class="text-xs font-semibold text-blue-300 mb-1">Manga</p>
							<ul class="text-xs text-slate-300 space-y-1">
								{#each tooltip.content.manga as manga (manga.sourceAnilistId)}
									<a
										class="hover:text-blue-400"
										href="https://anilist.co/manga/{manga.sourceAnilistId}"
										target="_blank"
										rel="noopener noreferrer"
										referrerpolicy="origin"><li class="mt-1">• {manga.title}</li></a
									>
								{/each}
							</ul>
						</div>
					{/if}
					{#if tooltip.content.anime.length > 0}
						<div>
							<p class="text-xs font-semibold text-blue-300 mb-1">Anime</p>
							<ul class="text-xs text-slate-300 space-y-1">
								{#each tooltip.content.anime as title (title)}
									<li>• {title}</li>
								{/each}
							</ul>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</div>
