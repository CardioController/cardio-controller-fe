<!-- TODO: Make this a step page, because this is too complicated.-->

<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import SessionAddVideoModal from '$lib/components/SessionAddVideoModal.svelte';
	import SessionVideoTabel from '$lib/components/SessionVideoTable.svelte';
	import {
		cc_pb,
		PB_COLLECTION_SESSIONS,
		PB_COLLECTION_VIDEOS_EXERCISE,
		PB_COLLECTION_VIDEOS_GAMEPLAY
	} from '$lib/pb-integrate';
	import { Button, Heading, Hr, Modal, Radio, Spinner } from 'flowbite-svelte';
	import { ArchiveOutline, HeartOutline, RocketOutline } from 'flowbite-svelte-icons';
	import type { RecordModel } from 'pocketbase';
	import { onMount } from 'svelte';

	let sessionId = $state('');
	let sessionData: RecordModel | undefined = $state();

	let showAddVideoModal = $state(false);
	let addVideoCollection = $state(PB_COLLECTION_VIDEOS_EXERCISE); // or PB_COLLECTION_VIDEOS_GAMEPLAY

	let maxExerciseVideoOrder = 0;
	let maxGameplayVideoOrder = 0;

	async function getSession() {
		sessionData = await cc_pb.collection(PB_COLLECTION_SESSIONS).getOne(sessionId, {
			expand:
				'game,session_exercises_via_session,session_metrics_via_session,videos_exercise_via_session,videos_gameplay_via_session'
		});
		if (sessionData?.expand?.videos_exercise_via_session != null) {
			maxExerciseVideoOrder = sessionData?.expand?.videos_exercise_via_session.length;
		}
		if (sessionData?.expand?.videos_gameplay_via_session != null) {
			maxGameplayVideoOrder = sessionData?.expand?.videos_gameplay_via_session.length;
		}
		// console.log('Exercise: ', maxExerciseVideoOrder);
		// console.log('Gameplay: ', maxGameplayVideoOrder);
	}

	async function addVideoCallbackFunc(idArr: string[]) {
		console.log(`add video: ${idArr}`);
		const batch = cc_pb.createBatch();
		let maxOrder = 0;
		if (addVideoCollection == PB_COLLECTION_VIDEOS_EXERCISE) {
			maxOrder = maxExerciseVideoOrder;
		} else {
			maxOrder = maxGameplayVideoOrder;
		}

		idArr.forEach((v) => {
			batch.collection(addVideoCollection).update(v, {
				session: sessionId,
				order: maxOrder
			});
			maxOrder += 1;
		});
		await batch.send();
		getSession();
	}

	async function VideosReOrdered(idArr: string[], collectionName: string) {
		const batch = cc_pb.createBatch();
		idArr.forEach((v, index) => {
			batch.collection(collectionName).update(v, {
				order: index
			});
		});
		await batch.send();
		getSession();
	}

	onMount(() => {
		sessionId = page.url.searchParams.get('id') ?? '';
		if (sessionId.length == 0) {
			goto('/sessions');
			return;
		}
		getSession();
	});

	// set stage modal
	let showEditStageModal = $state(false);
	let editModalProcessing = $state(false);
	let modalStageValue = $state('');
	async function handleSetSessionStage() {
		editModalProcessing = true;
		await cc_pb.collection(PB_COLLECTION_SESSIONS).update(sessionId, {
			stage: modalStageValue
		});
		editModalProcessing = false;
		showEditStageModal = false;
		getSession();
	}

	async function handleMarkReadyForRender() {
		await cc_pb.collection(PB_COLLECTION_SESSIONS).update(sessionId, {
			video_process_stage: 'in_queue'
		});
		getSession();
	}
</script>

<svelte:head>
	<title>Game Session Detail | Cardio Controller</title>
</svelte:head>

{#key sessionData}
	{#if sessionData == undefined}
		<div class="mx-auto h-full w-full">
			<Spinner /> Loading Data
		</div>
	{:else}
		<Heading>{sessionData.created.split(' ')[0]}</Heading>
		<Hr />
		<Heading tag="h4" class="text-gray-500">Game Title</Heading>
		<Heading tag="h2">{sessionData.expand!.game.title}</Heading>
		<div class="flex items-end">
			{#if sessionData.stage == 'game'}
				<RocketOutline color="blue" />
			{:else if sessionData.stage == 'exercise'}
				<HeartOutline color="red" />
			{:else if sessionData.stage == 'finished'}
				<ArchiveOutline />
			{/if}
			<Heading tag="h5" class="text-gray-400">
				{sessionData.stage}
			</Heading>
		</div>

		{#if sessionData.expand!.videos_gameplay_via_session != null}
			<div>
				<Heading tag="h4">Game metric state</Heading>
				<Heading tag="h5">{'['}{sessionData.session_metric_stage}{']'}</Heading>
			</div>
		{/if}

		<div>
			<Button
				on:click={() => {
					modalStageValue = sessionData!.stage;
					showEditStageModal = true;
				}}>Set Stage</Button
			>
		</div>

		{#if sessionData.session_metric_stage == 'finished'}
			<Hr />
			<div class="gap-y-2">
				{#if sessionData.expand!.videos_exercise_via_session != null && sessionData.expand!.videos_exercise_via_session != null && (sessionData.video_process_stage == '' || sessionData.video_process_stage == 'idle')}
					<Button on:click={handleMarkReadyForRender}>Mark Ready For Render</Button>
				{/if}
				<Heading tag="h4">Video Process Stage</Heading>
				<Heading tag="h5">{'['}{sessionData.video_process_stage}{']'}</Heading>
			</div>
		{/if}

		<Hr />
		<div class="mb-5 flex items-baseline justify-baseline">
			<RocketOutline color="blue" />
			<Heading tag="h4" class="text-gray-500">Game play footage</Heading>
			{#if sessionData.session_metric_stage != 'finished'}
				<div class="flex items-center justify-center gap-x-2">
					<Button
						on:click={() => {
							addVideoCollection = PB_COLLECTION_VIDEOS_GAMEPLAY;
							showAddVideoModal = true;
						}}
					>
						Add video
					</Button>
					<Button href={`/sessions/set_metric_event?id=${sessionId}`} color="blue"
						>Set Gameplay Event</Button
					>
				</div>
			{/if}
		</div>
		<SessionVideoTabel
			bind:videos={sessionData.expand!.videos_gameplay_via_session}
			tableReordered={VideosReOrdered}
		/>

		<Hr />
		<div class="mb-5 flex items-baseline justify-baseline">
			<HeartOutline color="red" />
			<Heading tag="h4" class="text-gray-500">Game exercise footage</Heading>
			<div class="flex items-center justify-center gap-x-2">
				{#if sessionData.stage != 'finished'}
					<Button
						on:click={() => {
							addVideoCollection = PB_COLLECTION_VIDEOS_EXERCISE;
							showAddVideoModal = true;
						}}
					>
						Add video
					</Button>
					<Button href={`/sessions/set_exercise_event?id=${sessionId}`} color="blue"
						>Set Start & End</Button
					>
				{/if}
			</div>
		</div>
		<SessionVideoTabel
			bind:videos={sessionData.expand!.videos_exercise_via_session}
			tableReordered={VideosReOrdered}
		/>
	{/if}
{/key}

<br class="mb-10" />

<SessionAddVideoModal
	bind:open={showAddVideoModal}
	bind:collection={addVideoCollection}
	addVideosCallback={addVideoCallbackFunc}
/>

<Modal title="Set Session Stage" bind:open={showEditStageModal}>
	{#if editModalProcessing}
		<Spinner />&nbsp;Submitting...
	{:else}
		<Radio name="Game" value="game" bind:group={modalStageValue}
			><RocketOutline color="blue" />Game</Radio
		>
		<Radio name="Exercise" value="exercise" bind:group={modalStageValue}
			><HeartOutline color="red" />Exercise</Radio
		>
		<Radio name="Finished" value="finished" bind:group={modalStageValue}
			><ArchiveOutline />Finished</Radio
		>

		<Hr />
		<Button on:click={handleSetSessionStage}>Save</Button>
		<Button
			color="alternative"
			on:click={() => {
				showEditStageModal = false;
			}}>Cancel</Button
		>
	{/if}
</Modal>
