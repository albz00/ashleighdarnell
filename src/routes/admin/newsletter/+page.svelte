<script lang="ts">
	import type { Campaign } from '$lib/content/site';
	import { campaigns, newId, subscribers } from '$lib/content/site';
	import {
		deleteSubscriber,
		saveCampaign as saveCampaignToFirebase,
		saveSubscriber
	} from '$lib/firebase/repository';

	let name = $state('');
	let email = $state('');
	let notice = $state('');
	let composerOpen = $state(false);
	let draft = $state<Campaign>({
		id: '',
		subject: '',
		preview: '',
		body: '',
		status: 'draft',
		updatedAt: ''
	});

	const activeCount = $derived($subscribers.filter((subscriber) => subscriber.status === 'active').length);

	async function addSubscriber() {
		const clean = email.trim().toLowerCase();
		if (!clean.includes('@')) {
			notice = 'Enter a valid email address.';
			return;
		}
		if ($subscribers.some((subscriber) => subscriber.email === clean)) {
			notice = 'That email is already on the list.';
			return;
		}
		const subscriber = {
			id: newId('sub'),
			name: name.trim() || 'Newsletter reader',
			email: clean,
			joinedAt: new Date().toISOString().slice(0, 10),
			status: 'active' as const
		};
		try {
			await saveSubscriber(subscriber);
			$subscribers = [subscriber, ...$subscribers];
			name = '';
			email = '';
			notice = 'Reader saved to the server.';
		} catch (error) {
			notice = error instanceof Error ? error.message : 'Reader could not be saved.';
		}
	}

	function compose(campaign?: Campaign) {
		draft = campaign
			? { ...campaign }
			: { id: newId('campaign'), subject: '', preview: '', body: '', status: 'draft', updatedAt: '' };
		composerOpen = true;
	}

	async function saveCampaign(send = false) {
		if (!draft.subject.trim()) {
			notice = 'Add a subject line first.';
			return;
		}
		draft.status = send ? 'sent' : 'draft';
		draft.updatedAt = new Date().toISOString().slice(0, 10);
		try {
			await saveCampaignToFirebase({ ...draft });
			const exists = $campaigns.some((campaign) => campaign.id === draft.id);
			$campaigns = exists
				? $campaigns.map((campaign) => (campaign.id === draft.id ? { ...draft } : campaign))
				: [{ ...draft }, ...$campaigns];
			composerOpen = false;
			notice = send
				? `Campaign status saved — no email was actually sent to ${activeCount} readers.`
				: 'Campaign draft saved to the server.';
		} catch (error) {
			notice = error instanceof Error ? error.message : 'Campaign could not be saved.';
		}
	}

	async function toggleSubscriber(id: string) {
		const subscriber = $subscribers.find((item) => item.id === id);
		if (!subscriber) return;
		const updated = {
			...subscriber,
			status: subscriber.status === 'active' ? ('unsubscribed' as const) : ('active' as const)
		};
		try {
			await saveSubscriber(updated);
			$subscribers = $subscribers.map((item) => (item.id === id ? updated : item));
			notice = 'Reader status saved to the server.';
		} catch (error) {
			notice = error instanceof Error ? error.message : 'Reader status could not be saved.';
		}
	}

	async function removeSubscriber(id: string) {
		if (!window.confirm('Remove this reader?')) return;
		try {
			await deleteSubscriber(id);
			$subscribers = $subscribers.filter((item) => item.id !== id);
			notice = 'Reader removed from the server.';
		} catch (error) {
			notice = error instanceof Error ? error.message : 'Reader could not be removed.';
		}
	}
</script>

<svelte:head><title>Newsletter - Website Studio</title></svelte:head>

<div class="mx-auto max-w-7xl">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div>
			<h1 class="font-display text-5xl">Newsletter</h1>
			<p class="mt-3 text-muted">{activeCount} active readers · synced with the server</p>
		</div>
		<button
			type="button"
			disabled
			title="Campaign composing will be enabled after Ashleigh’s sender address is configured."
			class="cursor-not-allowed rounded-full bg-line px-6 py-3 text-sm font-semibold text-muted opacity-70"
		>
			Compose email
		</button>
	</div>

	{#if notice}<p class="mt-6 rounded-2xl bg-butter px-5 py-3 text-sm">{notice}</p>{/if}

	<div class="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
		<section class="rounded-[2rem] bg-paper p-6 md:p-8">
			<h2 class="font-display text-3xl">Readers</h2>
			<form class="mt-6 grid gap-3 sm:grid-cols-[1fr_1.3fr_auto]" onsubmit={(event) => { event.preventDefault(); addSubscriber(); }}>
				<input bind:value={name} placeholder="Name" class="rounded-2xl border border-line bg-mist px-4 py-3 text-sm outline-none focus:border-teal" />
				<input type="email" bind:value={email} placeholder="Email address" class="rounded-2xl border border-line bg-mist px-4 py-3 text-sm outline-none focus:border-teal" />
				<button class="rounded-full bg-ink px-5 py-3 text-sm text-paper">Add reader</button>
			</form>
			<div class="mt-6 divide-y divide-line">
				{#each $subscribers as subscriber (subscriber.id)}
					<div class="flex items-center gap-4 py-4">
						<div class="grid h-10 w-10 place-items-center rounded-full bg-mint font-display text-teal">{subscriber.name.charAt(0)}</div>
						<div class="min-w-0 flex-1">
							<p class="truncate text-sm font-semibold">{subscriber.name}</p>
							<p class="truncate text-xs text-muted">{subscriber.email} · Joined {subscriber.joinedAt}</p>
						</div>
						<button
							onclick={() => toggleSubscriber(subscriber.id)}
							class="rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase {subscriber.status === 'active' ? 'bg-mint text-teal' : 'bg-mist text-muted'}"
						>{subscriber.status}</button>
						<button onclick={() => removeSubscriber(subscriber.id)} class="text-lg text-muted hover:text-coral" aria-label="Remove reader">×</button>
					</div>
				{/each}
			</div>
		</section>

		<section class="rounded-[2rem] bg-paper p-6 md:p-8">
			<h2 class="font-display text-3xl">Campaigns</h2>
			<p class="mt-2 text-sm text-muted">Drafts and simulated sends.</p>
			<div class="mt-6 space-y-4">
				{#each $campaigns as campaign (campaign.id)}
					<button onclick={() => compose(campaign)} class="block w-full rounded-2xl border border-line p-5 text-left transition-colors hover:border-teal">
						<div class="flex justify-between gap-3">
							<p class="font-semibold">{campaign.subject}</p>
							<span class="rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase {campaign.status === 'sent' ? 'bg-mint text-teal' : 'bg-butter'}">{campaign.status}</span>
						</div>
						<p class="mt-2 text-sm text-muted">{campaign.preview || 'No preview text'}</p>
						<p class="mt-3 text-[10px] uppercase tracking-wider text-muted">Updated {campaign.updatedAt}</p>
					</button>
				{:else}
					<p class="rounded-2xl bg-mist p-6 text-sm text-muted">No campaigns yet.</p>
				{/each}
			</div>
		</section>
	</div>
</div>

{#if composerOpen}
	<div class="fixed inset-0 z-50 overflow-y-auto bg-ink/55 p-4 md:p-8">
		<div class="mx-auto max-w-2xl rounded-[2rem] bg-paper p-6 shadow-2xl md:p-9">
			<div class="flex items-center justify-between">
				<h2 class="font-display text-3xl">Write to your readers</h2>
				<button onclick={() => (composerOpen = false)} class="grid h-10 w-10 place-items-center rounded-full bg-mist text-xl">×</button>
			</div>
			<div class="mt-7 space-y-5">
				<label class="block"><span class="text-xs font-semibold">Subject</span><input bind:value={draft.subject} class="mt-2 w-full rounded-2xl border border-line bg-mist px-4 py-3 outline-none focus:border-teal" /></label>
				<label class="block"><span class="text-xs font-semibold">Preview text</span><input bind:value={draft.preview} class="mt-2 w-full rounded-2xl border border-line bg-mist px-4 py-3 outline-none focus:border-teal" /></label>
				<label class="block"><span class="text-xs font-semibold">Message</span><textarea bind:value={draft.body} rows="10" class="mt-2 w-full resize-y rounded-2xl border border-line bg-mist px-4 py-3 leading-relaxed outline-none focus:border-teal"></textarea></label>
			</div>
			<div class="mt-7 flex flex-wrap justify-between gap-3 border-t border-line pt-6">
				<p class="max-w-xs text-xs leading-relaxed text-muted">Send is simulated. This mockup never contacts subscribers.</p>
				<div class="flex gap-2"><button onclick={() => saveCampaign(false)} class="rounded-full border border-line px-5 py-2.5 text-xs">Save draft</button><button onclick={() => saveCampaign(true)} class="rounded-full bg-teal px-5 py-2.5 text-xs font-semibold text-paper">Simulate send</button></div>
			</div>
		</div>
	</div>
{/if}
