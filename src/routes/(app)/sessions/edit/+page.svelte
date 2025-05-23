<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import SelectGameVideo from '$lib/components/SessionEditSteps/SelectGameVideo.svelte';
	import SessionExercises from '$lib/components/SessionEditSteps/SessionExercises.svelte';
	import SessionExerciseVideo from '$lib/components/SessionEditSteps/SessionExerciseVideo.svelte';
	import SessionMarkRender from '$lib/components/SessionEditSteps/SessionMarkRender.svelte';
	import { cc_pb, PB_COLLECTION_SESSIONS } from '$lib/pb-integrate';
	import { Button, Heading, Hr, StepIndicator, TabItem, Tabs } from 'flowbite-svelte';
	import {
		CheckOutline,
		ClockOutline,
		CloseOutline,
		DotsHorizontalOutline
	} from 'flowbite-svelte-icons';
	import type { RecordModel } from 'pocketbase';
	import { onMount } from 'svelte';

	let sessionId = $state('');
	let sessionData: RecordModel | undefined = $state();

	async function getSession() {
		sessionData = await cc_pb.collection(PB_COLLECTION_SESSIONS).getOne(sessionId, {
			expand: 'game'
		});
	}

	onMount(() => {
		sessionId = page.url.searchParams.get('id') ?? '';
		if (sessionId.length == 0) {
			goto('/sessions');
			return;
		}
		getSession();
	});
</script>

<svelte:head>
	<title>Edit Session - [ {sessionData != null ? sessionData.created.split(' ')[0] : ''}]</title>
</svelte:head>

{#if sessionData != null}
	<Heading>Edit Session - [{sessionData.created.split(' ')[0]}]</Heading>
	<Heading tag="h4">Game: {sessionData.expand!.game.title}</Heading>
	<br />

	<Tabs>
		<TabItem open>
			<div slot="title" class="flex items-center gap-2">
				{#if sessionData.game_play_metrics_checked}
					<CheckOutline color="green" />
				{:else}
					<CloseOutline color="red" />
				{/if}
				Game play videos
			</div>
			<SelectGameVideo session={sessionData} updated={getSession} />
		</TabItem>
		<TabItem disabled={sessionData.game_play_metrics_checked == false}>
			<div slot="title" class="flex items-center gap-2">
				{#if sessionData.exercises_checked}
					<CheckOutline color="green" />
				{:else}
					<CloseOutline color="red" />
				{/if}
				Generate Exercises
			</div>
			<SessionExercises session={sessionData} updated={getSession} />
		</TabItem>
		<TabItem disabled={sessionData.exercises_checked == false}>
			<div slot="title" class="flex items-center gap-2">
				{#if sessionData.exercise_videos_checked}
					<CheckOutline color="green" />
				{:else}
					<CloseOutline color="red" />
				{/if}
				Exercise videos
			</div>
			<SessionExerciseVideo session={sessionData} updated={getSession} />
		</TabItem>
		<TabItem disabled={sessionData.exercise_videos_checked == false}>
			<div slot="title" class="flex items-center gap-2">
				{#if ['', 'idle'].indexOf(sessionData.video_process_stage) > -1}
					<CloseOutline color="red" />
				{:else if sessionData.video_process_stage == 'in_queue'}
					<DotsHorizontalOutline />
				{:else if sessionData.video_process_stage == 'processing'}
					<ClockOutline color="blue" />
				{:else}
					<CheckOutline color="green" />
				{/if}
				Render
			</div>
			<SessionMarkRender session={sessionData} updated={getSession} />
		</TabItem>
	</Tabs>
{/if}

<br class="mb-10" />
