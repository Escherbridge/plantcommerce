import { writable } from 'svelte/store';

export interface Toast {
	id: string;
	message: string;
	variant: 'success' | 'error' | 'warning' | 'info';
	duration: number;
}

function createToastStore() {
	const { subscribe, update } = writable<Toast[]>([]);

	function addToast(toast: Omit<Toast, 'id'>) {
		const id = crypto.randomUUID();
		update((toasts) => {
			const next = [...toasts, { ...toast, id }];
			// Cap at 5 visible toasts
			return next.length > 5 ? next.slice(next.length - 5) : next;
		});
		setTimeout(() => removeToast(id), toast.duration ?? 5000);
		return id;
	}

	function removeToast(id: string) {
		update((toasts) => toasts.filter((t) => t.id !== id));
	}

	return { subscribe, addToast, removeToast };
}

export const toasts = createToastStore();
