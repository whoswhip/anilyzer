<script lang="ts">
	import NotificationItem from './NotificationItem.svelte';
	import { notifications } from '$lib/components/notificationStore';
</script>

<div class="pointer-events-none fixed inset-0 z-50 flex justify-end p-4">
	<div class="flex w-full max-w-sm flex-col gap-3">
		{#each $notifications as notification (notification.id)}
			<NotificationItem {notification} />
		{/each}
	</div>
</div>
