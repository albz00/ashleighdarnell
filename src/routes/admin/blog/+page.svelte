<script lang="ts">
	import type { BlogPost } from '$lib/content/site';
	import { newId, posts, slugify } from '$lib/content/site';
	import { deletePost, savePost } from '$lib/firebase/repository';
	import ImageSourcePicker from '$lib/components/admin/ImageSourcePicker.svelte';

	const blank = (): BlogPost => ({
		id: newId('post'),
		title: '',
		slug: '',
		excerpt: '',
		body: '',
		category: 'Field Notes',
		cover:
			'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=85',
		alt: '',
		coverCaption: '',
		coverRotation: [],
		coverRotationSeconds: 8,
		publishedAt: new Date().toISOString().slice(0, 10),
		status: 'draft',
		featured: false
	});

	let editing = $state<BlogPost | null>(null);
	let query = $state('');
	let filter = $state<'all' | 'published' | 'draft'>('all');
	let notice = $state('');

	const visiblePosts = $derived(
		$posts.filter(
			(post) =>
				(filter === 'all' || post.status === filter) &&
				`${post.title} ${post.category}`.toLowerCase().includes(query.toLowerCase())
		)
	);

	function edit(post: BlogPost) {
		editing = {
			...post,
			coverCaption: post.coverCaption ?? '',
			coverRotation: [...(post.coverRotation ?? [])],
			coverRotationSeconds: post.coverRotationSeconds ?? 8
		};
		notice = '';
	}

	function addCoverRotation() {
		if (!editing) return;
		editing.coverRotation = [...(editing.coverRotation ?? []), ''];
	}

	function removeCoverRotation(index: number) {
		if (!editing) return;
		editing.coverRotation = (editing.coverRotation ?? []).filter((_, position) => position !== index);
	}

	async function save() {
		if (!editing || !editing.title.trim()) {
			notice = 'Add a title before saving.';
			return;
		}
		editing.slug = slugify(editing.slug || editing.title);
		editing.alt ||= editing.title;
		try {
			await savePost({ ...editing });
			const exists = $posts.some((post) => post.id === editing?.id);
			$posts = exists
				? $posts.map((post) => (post.id === editing?.id ? { ...editing } as BlogPost : post))
				: [{ ...editing }, ...$posts];
			notice = 'Story saved to the server.';
			editing = null;
		} catch (error) {
			notice = error instanceof Error ? error.message : 'Story could not be saved.';
		}
	}

	async function remove(post: BlogPost) {
		if (!window.confirm(`Delete “${post.title}”?`)) return;
		try {
			await deletePost(post.id);
			$posts = $posts.filter((item) => item.id !== post.id);
			notice = 'Story deleted from the server.';
		} catch (error) {
			notice = error instanceof Error ? error.message : 'Story could not be deleted.';
		}
	}
</script>

<svelte:head><title>Blog posts - Website Studio</title></svelte:head>

<div class="mx-auto max-w-7xl">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div>
			<h1 class="font-display text-5xl">Blog posts</h1>
			<p class="mt-3 text-muted">Write, preview, and publish stories to the journal.</p>
		</div>
		<button onclick={() => (editing = blank())} class="btn-fun rounded-full bg-coral px-6 py-3 text-sm font-semibold text-paper">
			+ New story
		</button>
	</div>

	{#if notice}<p class="mt-6 rounded-2xl bg-butter px-5 py-3 text-sm">{notice}</p>{/if}

	<div class="mt-8 flex flex-wrap gap-3 rounded-[2rem] bg-paper p-4">
		<input
			bind:value={query}
			placeholder="Search stories..."
			class="min-w-60 flex-1 rounded-full border border-line bg-mist px-5 py-3 text-sm outline-none focus:border-coral"
		/>
		<select bind:value={filter} class="rounded-full border border-line bg-paper px-5 py-3 text-sm outline-none">
			<option value="all">All statuses</option>
			<option value="published">Published</option>
			<option value="draft">Drafts</option>
		</select>
	</div>

	<div class="mt-6 overflow-hidden rounded-[2rem] bg-paper">
		{#each visiblePosts as post (post.id)}
			<div class="grid gap-4 border-b border-line p-5 last:border-0 md:grid-cols-[5rem_1fr_auto] md:items-center">
				<img src={post.cover} alt="" class="h-20 w-20 rounded-2xl object-cover" />
				<div class="min-w-0">
					<div class="flex flex-wrap items-center gap-2">
						<h2 class="font-display text-2xl">{post.title}</h2>
						<span class="rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider {post.status === 'published' ? 'bg-mint text-teal' : 'bg-butter text-ink'}">{post.status}</span>
						{#if post.featured}<span class="rounded-full bg-lilac px-2.5 py-1 text-[9px] font-semibold uppercase text-violet">Featured</span>{/if}
					</div>
					<p class="mt-1 text-xs text-muted">{post.category} · {post.publishedAt} · /{post.slug}</p>
					<p class="mt-2 line-clamp-1 text-sm text-muted">{post.excerpt}</p>
				</div>
				<div class="flex gap-2">
					{#if post.status === 'published'}
						<a href="/blog/{post.slug}" target="_blank" class="rounded-full border border-line px-4 py-2 text-xs">Preview</a>
					{/if}
					<button onclick={() => edit(post)} class="rounded-full bg-ink px-4 py-2 text-xs text-paper">Edit</button>
					<button onclick={() => remove(post)} class="rounded-full px-3 py-2 text-xs text-coral">Delete</button>
				</div>
			</div>
		{:else}
			<p class="p-12 text-center text-muted">No stories match this search.</p>
		{/each}
	</div>
</div>

{#if editing}
	<div class="fixed inset-0 z-50 overflow-y-auto bg-ink/55 p-4 md:p-8">
		<div class="mx-auto max-w-4xl rounded-[2rem] bg-paper p-6 shadow-2xl md:p-9">
			<div class="flex items-center justify-between gap-4">
				<div>
					<h2 class="font-display text-3xl">{editing.title || 'Untitled story'}</h2>
				</div>
				<button onclick={() => (editing = null)} class="grid h-10 w-10 place-items-center rounded-full bg-mist text-xl">×</button>
			</div>
			<div class="mt-7 grid gap-5 md:grid-cols-2">
				<label class="block md:col-span-2">
					<span class="text-xs font-semibold">Title</span>
					<input bind:value={editing.title} oninput={() => { if (editing && !editing.slug) editing.slug = slugify(editing.title); }} class="mt-2 w-full rounded-2xl border border-line bg-mist px-4 py-3 outline-none focus:border-coral" />
				</label>
				<label class="block">
					<span class="text-xs font-semibold">URL slug</span>
					<input bind:value={editing.slug} class="mt-2 w-full rounded-2xl border border-line bg-mist px-4 py-3 outline-none focus:border-coral" />
				</label>
				<label class="block">
					<span class="text-xs font-semibold">Category</span>
					<input bind:value={editing.category} class="mt-2 w-full rounded-2xl border border-line bg-mist px-4 py-3 outline-none focus:border-coral" />
				</label>
				<label class="block md:col-span-2">
					<span class="text-xs font-semibold">Excerpt</span>
					<textarea bind:value={editing.excerpt} rows="2" class="mt-2 w-full resize-none rounded-2xl border border-line bg-mist px-4 py-3 outline-none focus:border-coral"></textarea>
				</label>
				<label class="block md:col-span-2">
					<span class="text-xs font-semibold">Story body</span>
					<textarea bind:value={editing.body} rows="8" class="mt-2 w-full resize-y rounded-2xl border border-line bg-mist px-4 py-3 leading-relaxed outline-none focus:border-coral"></textarea>
				</label>
				<div class="block md:col-span-2">
					<span class="mb-2 block text-xs font-semibold">Cover image source</span>
					<div class="rounded-3xl bg-mist p-4">
						<div class="grid gap-4 md:grid-cols-[8rem_1fr]">
							<img
								src={editing.cover}
								alt={editing.alt}
								class="aspect-square w-full rounded-2xl bg-line object-cover"
							/>
							<ImageSourcePicker
								value={editing.cover}
								onselect={(value) => {
									if (editing) editing.cover = value;
								}}
							/>
						</div>
						<div class="mt-5 border-t border-line pt-5">
							<div class="flex flex-wrap items-center justify-between gap-3">
								<div>
									<p class="text-xs font-semibold">Rotating cover images</p>
									<p class="mt-1 text-[11px] text-muted">Cycle through additional images automatically.</p>
								</div>
								<div class="flex items-center gap-2">
									<label class="text-[11px] text-muted" for="cover-rotation-seconds">Seconds</label>
									<input
										id="cover-rotation-seconds"
										type="number"
										min="2"
										max="300"
										bind:value={editing.coverRotationSeconds}
										class="w-20 rounded-xl border border-line bg-paper px-3 py-2 text-xs"
									/>
									<button type="button" onclick={addCoverRotation} class="rounded-full bg-ink px-4 py-2 text-xs text-paper">
										Add image
									</button>
								</div>
							</div>
							{#each editing.coverRotation ?? [] as source, index}
								<div class="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
									<ImageSourcePicker
										value={source}
										onselect={(value) => {
											if (editing?.coverRotation) editing.coverRotation[index] = value;
										}}
									/>
									<button
										type="button"
										onclick={() => removeCoverRotation(index)}
										class="self-start rounded-full px-4 py-2 text-xs text-coral"
									>
										Remove
									</button>
								</div>
							{/each}
						</div>
					</div>
				</div>
				<label class="block md:col-span-2">
					<span class="text-xs font-semibold">Cover caption</span>
					<input bind:value={editing.coverCaption} class="mt-2 w-full rounded-2xl border border-line bg-mist px-4 py-3 outline-none focus:border-coral" />
				</label>
				<label class="block">
					<span class="text-xs font-semibold">Image description</span>
					<input bind:value={editing.alt} class="mt-2 w-full rounded-2xl border border-line bg-mist px-4 py-3 outline-none focus:border-coral" />
				</label>
				<label class="block">
					<span class="text-xs font-semibold">Publish date</span>
					<input type="date" bind:value={editing.publishedAt} class="mt-2 w-full rounded-2xl border border-line bg-mist px-4 py-3 outline-none focus:border-coral" />
				</label>
				<label class="flex items-center gap-3"><input type="checkbox" bind:checked={editing.featured} class="accent-coral" /> <span class="text-sm">Feature this story</span></label>
			</div>
			<div class="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
				<div class="flex rounded-full bg-mist p-1">
					<button onclick={() => { if (editing) editing.status = 'draft'; }} class="rounded-full px-5 py-2 text-xs {editing.status === 'draft' ? 'bg-paper shadow-sm' : ''}">Draft</button>
					<button onclick={() => { if (editing) editing.status = 'published'; }} class="rounded-full px-5 py-2 text-xs {editing.status === 'published' ? 'bg-teal text-paper' : ''}">Published</button>
				</div>
				<button onclick={save} class="btn-fun rounded-full bg-coral px-7 py-3 text-sm font-semibold text-paper">Save story</button>
			</div>
		</div>
	</div>
{/if}
