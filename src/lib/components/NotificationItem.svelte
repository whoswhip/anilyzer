<script lang="ts">
	import { cubicIn, cubicOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';
	import { onDestroy, onMount } from 'svelte';
	import type { Notification, NotificationType } from '$lib/components/notificationStore';
	import { removeNotification } from '$lib/components/notificationStore';

	export let notification: Notification;

	const accentMap: Record<NotificationType, string> = {
		info: 'border-sky-900! border-2',
		success: 'border-emerald-900! border-2',
		warning: 'border-yellow-900! border-2',
		error: 'border-rose-900! border-2'
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
	class={`pointer-events-auto bg-slate-825 rounded-lg border border-slate-775 p-5 transition-colors ${accentMap[notification.type]} relative`}
	in:fly={{ x: 200, duration: 280, easing: cubicOut }}
	out:fly={{ x: 200, duration: 240, easing: cubicIn }}
	on:mouseenter={pauseTimer}
	on:mouseleave={resumeTimer}
	on:click={dismiss}
>
	<div class="flex items-center gap-2">
		<div class="flex flex-col gap-1 truncate flex-1">
			<span class="truncate text-sm font-medium text-slate-500 uppercase">{notification.type}</span>
			<span class="truncate text-md font-bold mt-2.5 text-blue-50">{notification.message}</span>
		</div>
		<button
			type="button"
			aria-label="Close notification"
			class="text-slate-300 transition hover:text-blue-400 text-2xl font-bold ml-2 absolute top-2.5 right-5"
			on:click={dismiss}
		>
			×
		</button>
	</div>
</div>
