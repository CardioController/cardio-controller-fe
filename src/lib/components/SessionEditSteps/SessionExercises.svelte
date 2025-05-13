<script lang="ts">
	import { cc_pb, PB_COLLECTION_SESSIONS } from '$lib/pb-integrate';
	import {
		Button,
		Heading,
		Hr,
		Radio,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import type { RecordModel } from 'pocketbase';
	import { onMount } from 'svelte';

	let sessionData: RecordModel | undefined = $state(undefined);
	let { session, updated }: { session: RecordModel; updated: () => void } = $props();
	let metricSummary: { metric: RecordModel; count: number }[] = $state([]);
	const EXERCISE_TYPES = [
		// legs, arms, core, full-body, mobility, balance, posterior-chain, grip
		'legs',
		'arms',
		'core',
		'full-body',
		'mobility',
		'balance',
		'posterior-chain',
		'grip'
	];
	let toGenerateExerciseCategory = $state(EXERCISE_TYPES[0]);

	async function getEvents() {
		sessionData = await cc_pb.collection(PB_COLLECTION_SESSIONS).getOne(session.id, {
			expand:
				'game.metrics_via_game,session_exercises_via_session.exercise,videos_gameplay_via_session.gameplay_metric_events_via_video_gameplay.metric'
		});
		console.log(sessionData);

		// get metrics
		metricSummary = sessionData!.expand!.game.expand.metrics_via_game.flatMap((x: any) => {
			return { metric: x, count: 0 };
		});
		// console.log(metricSummary);

		// get count
		sessionData!.expand!.videos_gameplay_via_session.forEach((gp_v: RecordModel) => {
			// console.log(gp_v);
			gp_v.expand!.gameplay_metric_events_via_video_gameplay.forEach((e_gp: RecordModel) => {
				let summaryMetric = metricSummary.filter(
					(x: any) => x.metric.id == e_gp.expand!.metric.id
				)[0];
				summaryMetric.count += 1;
				// console.log(summaryMetric);
			});
		});
	}

	async function handleGenerateExercise() {
		console.log(toGenerateExerciseCategory);
		const result = await cc_pb.send(`/api/generate_exercise/${session.id}`, {
			method: 'POST',
			body: JSON.stringify({
				category: toGenerateExerciseCategory
			})
		});
		// console.log(result);
		getEvents();
	}

	onMount(() => {
		getEvents();
	});

	async function handleMarkAsChecked() {
		await cc_pb.collection(PB_COLLECTION_SESSIONS).update(session.id, {
			exercises_checked: true
		});
		updated();
	}
</script>

{#key sessionData}
	{#if sessionData != undefined}
		<Heading tag="h3">Session Metrics</Heading>
		<Table>
			<TableHead>
				<TableHeadCell>Metric Name</TableHeadCell>
				<TableHeadCell>Count</TableHeadCell>
			</TableHead>
			<TableBody>
				{#each metricSummary as ms}
					<TableBodyRow>
						<TableBodyCell>{ms.metric.name}</TableBodyCell>
						<TableBodyCell>{ms.count}</TableBodyCell>
					</TableBodyRow>
				{/each}
			</TableBody>
		</Table>
		<Hr />
		<Heading tag="h3">To Generate Exercise Types:</Heading>
		<div class="mt-2 flex justify-between">
			{#each EXERCISE_TYPES as et}
				<div class="rounded-sm border border-gray-200 dark:border-gray-700">
					<Radio
						name="bordered"
						value={et}
						bind:group={toGenerateExerciseCategory}
						class="w-full p-4"
					>
						{et}
					</Radio>
				</div>
			{/each}
			<Button on:click={handleGenerateExercise}>Generate Exercise</Button>
		</div>

		{#if sessionData.expand!.session_exercises_via_session != null}
			<Hr />
			<Heading tag="h3">Exercises</Heading>
			<Heading tag="h6">Sets: {sessionData.exercise_sets}</Heading>
			<Table>
				<TableHead>
					<TableHeadCell>Exercise name</TableHeadCell>
					<TableHeadCell>Exercise per set</TableHeadCell>
					<TableHeadCell>Type</TableHeadCell>
				</TableHead>
				<TableBody>
					{#each sessionData.expand!.session_exercises_via_session as exercise}
						<TableBodyRow>
							<TableBodyCell>{exercise.expand.exercise.name}</TableBodyCell>
							<TableBodyCell>{exercise.expand.exercise.value}</TableBodyCell>
							<TableBodyCell>{exercise.expand.exercise.type}</TableBodyCell>
						</TableBodyRow>
					{/each}
					<!-- <TableBodyRow>
						<TableBodyCell>Apple MacBook Pro 17"</TableBodyCell>
						<TableBodyCell>Sliver</TableBodyCell>
					</TableBodyRow> -->
				</TableBody>
			</Table>
			<Hr />
			<div class="flex items-end justify-end">
				<Button on:click={handleMarkAsChecked}>Mark as checked</Button>
			</div>
		{/if}
	{/if}
{/key}
