<script lang="ts">
	import SessionsTable from '$lib/components/SessionsTable.svelte';
	import { cc_pb, PB_COLLECTION_SESSIONS, PB_COLLECTION_TO_ADD_VIDEOS } from '$lib/pb-integrate';
	import { Card, Heading, Hr } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	let toAddExerciseVid = 0;
	let toAddGameplayVid = 0;
	let sessions: any;

	async function loadData() {
		let result = await cc_pb.collection(PB_COLLECTION_TO_ADD_VIDEOS).getFirstListItem('');
		toAddExerciseVid = result.exercise_vid;
		toAddGameplayVid = result.gameplay_vid;

		sessions = await cc_pb.collection(PB_COLLECTION_SESSIONS).getList(1, 100, {
			filter: 'stage!="finished" || video_process_stage !="finished"',
			expand: 'game',
			sort: '-created'
		});
	}

	onMount(() => {
		loadData();
	});
</script>

<svelte:head>
	<title>Cardio Controller</title>
</svelte:head>

<div class="grid grid-cols-1 gap-y-5 lg:grid-cols-4 lg:gap-5">
	<Card>
		<Heading>New Videos</Heading>
		<div>
			Exercise Video: {toAddExerciseVid}
		</div>
		<div>
			Gameplay Video: {toAddGameplayVid}
		</div>
	</Card>
</div>

<Hr />

<Heading class="mb-2">Ongoing Sessions</Heading>

<SessionsTable bind:sessions />
