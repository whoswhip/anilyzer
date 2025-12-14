<script lang="ts">
	import { onMount } from 'svelte';

	export let title: string;
	export let subtitle: string | null = null;
	export let value: string | number;
	export let tooltip: string | null = null;

	let tooltipElement: HTMLElement;
	let tooltipPosition = 'center';

	onMount(() => {
		if (!tooltipElement) return;

		const updatePosition = () => {
			const rect = tooltipElement.getBoundingClientRect();
			if (rect.left < 0) {
				tooltipPosition = 'left';
			} else if (rect.right > window.innerWidth) {
				tooltipPosition = 'right';
			} else {
				tooltipPosition = 'center';
			}
		};

		const observer = new ResizeObserver(updatePosition);
		observer.observe(tooltipElement);

		return () => observer.disconnect();
	});
</script>

<div class="bg-slate-825 rounded-lg shadow-md border border-slate-775 p-5">
	<div class="flex items-center gap-2">
		<h3 class="font-medium text-slate-500 uppercase">{title}</h3>
		{#if tooltip}
			<div class="relative group">
				<svg class="w-4 h-4 text-gray-400 cursor-help" fill="currentColor" viewBox="0 0 20 20">
					<path
						fill-rule="evenodd"
						d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
						clip-rule="evenodd"
					/>
				</svg>
				<div
					bind:this={tooltipElement}
					class="absolute bottom-full mb-2 px-2 py-1 bg-slate-925 border border-slate-700 text-white text-sm rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity {tooltipPosition ===
					'left'
						? 'left-0'
						: tooltipPosition === 'center'
							? 'left-1/2 -translate-x-1/2'
							: 'right-0'}"
				>
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html tooltip}
				</div>
			</div>
		{/if}
	</div>
	<p class="text-4xl font-bold mt-2.5 text-blue-50">
		{typeof value === 'number' ? value.toLocaleString() : value}
	</p>
	{#if subtitle}
		<p class="font-medium text-slate-500 uppercase mt-2">{subtitle}</p>
	{/if}
</div>
