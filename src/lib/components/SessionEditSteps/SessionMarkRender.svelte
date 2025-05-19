<script lang="ts">
	// button was also visible when in finished, because we want the video re-renderable
	import { cc_pb, PB_COLLECTION_SESSIONS } from '$lib/pb-integrate';
	import { Button, Heading, Hr } from 'flowbite-svelte';
	import type { RecordModel } from 'pocketbase';
	import { onMount } from 'svelte';

	let { session, updated }: { session: RecordModel; updated: () => void } = $props();

	// onMount(() => {
	// 	console.log(session);
	// });

	async function handleMarkForRender() {
		await cc_pb.collection(PB_COLLECTION_SESSIONS).update(session.id, {
			video_process_stage: 'in_queue'
		});
		updated();
	}
</script>

<Heading>
	Video Process Stage: {session.video_process_stage == '' ? 'idle' : session.video_process_stage}
</Heading>
{#if ['', 'idle', 'finished'].indexOf(session.video_process_stage) > -1}
	<Hr />
	<Button on:click={handleMarkForRender}>Mark for render</Button>
	{#if session.video_process_stage == 'finished'}
		(re-render)
	{/if}
{/if}
