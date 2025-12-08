<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import NotificationSystem from '$lib/components/NotificationSystem.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<NotificationSystem />
