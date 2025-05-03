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
	import { Button, Heading, Hr, Spinner } from 'flowbite-svelte';
	import { ArchiveOutline, HeartOutline, RocketOutline } from 'flowbite-svelte-icons';
	import type { RecordModel } from 'pocketbase';
	import { onMount } from 'svelte';

	let sessionId = page.url.searchParams.get('id') ?? '';
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

	async function GamePlayVideosReOrdered(idArr: string[]) {
		const batch = cc_pb.createBatch();
		idArr.forEach((v, index) => {
			batch.collection(PB_COLLECTION_VIDEOS_GAMEPLAY).update(v, {
				order: index
			});
		});
		await batch.send();
		getSession();
	}

	async function ExerciseVideosReOrdered(idArr: string[]) {
		const batch = cc_pb.createBatch();
		idArr.forEach((v, index) => {
			batch.collection(PB_COLLECTION_VIDEOS_EXERCISE).update(v, {
				order: index
			});
		});
		await batch.send();
		getSession();
	}

	onMount(() => {
		if (sessionId.length == 0) {
			goto('/sessions');
			return;
		}
		getSession();
	});
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

		<Hr />
		<div class="mb-5 flex">
			<Heading tag="h4" class="text-gray-500">Game play footage</Heading>
			<Button
				on:click={() => {
					addVideoCollection = PB_COLLECTION_VIDEOS_GAMEPLAY;
					showAddVideoModal = true;
				}}
			>
				Add video
			</Button>
		</div>
		<SessionVideoTabel
			bind:videos={sessionData.expand!.videos_gameplay_via_session}
			tableReordered={GamePlayVideosReOrdered}
		/>

		<Hr />
		<div class="mb-5 flex">
			<Heading tag="h4" class="text-gray-500">Game exercise footage</Heading>
			<Button
				on:click={() => {
					addVideoCollection = PB_COLLECTION_VIDEOS_EXERCISE;
					showAddVideoModal = true;
				}}
			>
				Add video
			</Button>
		</div>
		<SessionVideoTabel
			bind:videos={sessionData.expand!.videos_exercise_via_session}
			tableReordered={ExerciseVideosReOrdered}
		/>
	{/if}
{/key}

<br class="mb-10" />

<SessionAddVideoModal
	bind:open={showAddVideoModal}
	bind:collection={addVideoCollection}
	addVideosCallback={addVideoCallbackFunc}
/>
