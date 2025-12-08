import { writable } from 'svelte/store';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export type Notification = {
	id: number;
	message: string;
	type: NotificationType;
	duration: number;
};

const defaultDuration = 4000;
const notificationQueue = writable<Notification[]>([]);
let nextId = 0;

export const notifications = notificationQueue;

export function notify(options: {
	message: string;
	type?: NotificationType;
	duration?: number;
}) {
	const id = ++nextId;
	notificationQueue.update((items) => [
		...items,
		{
			id,
			message: options.message,
			type: options.type ?? 'info',
			duration: options.duration ?? defaultDuration
		}
	]);
	return id;
}

export function removeNotification(id: number) {
	notificationQueue.update((items) => items.filter((item) => item.id !== id));
}
