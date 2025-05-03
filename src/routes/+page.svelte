<script>
	import { cc_pb, PB_COLLECTION_TO_ADD_VIDEOS } from '$lib/pb-integrate';
	import { Alert, Button, Card, Heading, P } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	let toAddExerciseVid = 0;
	let toAddGameplayVid = 0;
	onMount(() => {
		cc_pb
			.collection(PB_COLLECTION_TO_ADD_VIDEOS)
			.getFirstListItem('')
			.then((v) => {
				toAddExerciseVid = v.exercise_vid;
				toAddGameplayVid = v.gameplay_vid;
			});
	});
</script>

<div class="grid grid-cols-1 gap-y-5 lg:grid-cols-4 lg:gap-5">
	<Card>
		<Heading>Videos</Heading>
		<div>
			Exercise Video: {toAddExerciseVid}
		</div>
		<div>
			Gameplay Video: {toAddGameplayVid}
		</div>
	</Card>

	<!-- <Card>
		<Heading>Actions</Heading>
		<div>
			<Button>New Game Session</Button>
		</div>
	</Card> -->
</div>
