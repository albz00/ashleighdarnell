import type { MediaContent } from '$lib/content/page-content';

type RotationOptions = {
	media: MediaContent;
	background?: boolean;
};

export function rotateMedia(node: HTMLElement, initial: RotationOptions) {
	let options = initial;
	let timer: ReturnType<typeof setInterval> | undefined;
	let index = 0;

	function sources() {
		return [options.media.src, ...(options.media.rotation ?? [])].filter(
			(source, position, values) => source && values.indexOf(source) === position
		);
	}

	function display(source: string) {
		if (options.background) {
			node.style.setProperty('--managed-bg', `url("${source.replaceAll('"', '\\"')}")`);
		} else if (node instanceof HTMLImageElement) {
			node.src = source;
		}
	}

	function start() {
		if (timer) clearInterval(timer);
		index = 0;
		const available = sources();
		if (available[0]) display(available[0]);
		if (available.length < 2) return;

		const delay = Math.max(2, options.media.rotationSeconds ?? 8) * 1000;
		timer = setInterval(() => {
			index = (index + 1) % available.length;
			display(available[index]);
		}, delay);
	}

	start();

	return {
		update(next: RotationOptions) {
			options = next;
			start();
		},
		destroy() {
			if (timer) clearInterval(timer);
		}
	};
}
