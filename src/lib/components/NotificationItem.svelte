<script lang="ts">
	import { cubicIn, cubicOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';
	import { onDestroy, onMount } from 'svelte';
	import type { Notification, NotificationType } from '$lib/components/notificationStore';
	import { removeNotification } from '$lib/components/notificationStore';

	export let notification: Notification;

	const accentMap: Record<NotificationType, string> = {
		info: 'border-sky-500 bg-slate-950',
		success: 'border-emerald-500 bg-slate-950',
		warning: 'border-yellow-600 bg-slate-950',
		error: 'border-rose-500 bg-slate-950'
	};

	let remaining = notification.duration;
	let timer: ReturnType<typeof setTimeout> | null = null;
	let start = 0;

	const dismiss = () => {
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
		removeNotification(notification.id);
	};

	const startTimer = () => {
		if (remaining <= 0) {
			dismiss();
			return;
		}
		start = Date.now();
		timer = setTimeout(dismiss, remaining);
	};

	const pauseTimer = () => {
		if (timer) {
			clearTimeout(timer);
			timer = null;
			remaining -= Date.now() - start;
		}
	};

	const resumeTimer = () => {
		if (!timer) {
			startTimer();
		}
	};

	onMount(() => {
		startTimer();
	});

	onDestroy(() => {
		if (timer) {
			clearTimeout(timer);
		}
	});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
	class={`pointer-events-auto rounded-lg border px-4 py-3 shadow-xl transition-colors ${accentMap[notification.type]} relative`}
	in:fly={{ x: 200, duration: 280, easing: cubicOut }}
	out:fly={{ x: 200, duration: 240, easing: cubicIn }}
	on:mouseenter={pauseTimer}
	on:mouseleave={resumeTimer}
	on:click={dismiss}
>
	<div class="flex min-w-0 flex-1 items-center gap-3">
		<div class="flex flex-col gap-1 truncate">
			<span class="truncate text-sm font-semibold text-slate-50">{notification.message}</span>
			<span class="text-[11px] uppercase tracking-widest text-slate-400">{notification.type}</span>
		</div>
	</div>
	<button
		type="button"
		aria-label="Close notification"
		class="text-slate-300 transition hover:text-slate-50 absolute top-0 right-2"
		on:click={dismiss}
	>
		<span class="text-lg leading-none font-bold">×</span>
	</button>
</div>
