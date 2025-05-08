<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import {
		cc_pb,
		PB_COLLECTION_GAMEPLAY_METRIC_EVENTS,
		PB_COLLECTION_SESSIONS
	} from '$lib/pb-integrate';
	import {
		Button,
		Card,
		Heading,
		Hr,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import type { RecordModel } from 'pocketbase';
	import { onMount } from 'svelte';

	let sessionId = page.url.searchParams.get('id') ?? '';
	let sessionData: RecordModel | undefined = $state();

	let processingVideo: RecordModel | undefined = $state(undefined);
	let videoEvents: RecordModel[] | undefined = $state(undefined);

	async function getSession() {
		sessionData = await cc_pb.collection(PB_COLLECTION_SESSIONS).getOne(sessionId, {
			expand:
				'game,videos_gameplay_via_session,game.metrics_via_game,videos_gameplay_via_session.gameplay_metric_events_via_video_gameplay,videos_gameplay_via_session.gameplay_metric_events_via_video_gameplay.metric'
		});
	}

	onMount(() => {
		if (sessionId.length == 0) {
			goto('/sessions');
			return;
		}
		getSession();
	});

	$effect(() => {
		processingVideo;
		if (processingVideo != undefined) {
			videoEvents = processingVideo.expand!.gameplay_metric_events_via_video_gameplay;
		}
	});

	$effect(() => {
		videoEvents;
		videoEvents?.sort((a, b) => {
			return a.time - b.time;
		});
	});

	async function handleAddMetric(metric: any) {
		console.log('Metrid Name: ', metric.name);
		let timeStamp = (document.getElementById('video') as HTMLVideoElement).currentTime;

		let created = await cc_pb.collection(PB_COLLECTION_GAMEPLAY_METRIC_EVENTS).create(
			{
				video_gameplay: processingVideo!.id,
				metric: metric.id,
				time: timeStamp
			},
			{
				expand: 'metric'
			}
		);
		// console.log(created);
		videoEvents?.push(created);
	}
	async function handleDeleteMetric(metricEvent: any) {
		// console.log(metricEvent);
		console.log(metricEvent.time);
		await cc_pb.collection(PB_COLLECTION_GAMEPLAY_METRIC_EVENTS).delete(metricEvent.id);
		const indx = videoEvents?.indexOf(metricEvent);
		videoEvents?.splice(indx!, 1);
	}
	async function handleSeek(metricEvent: any) {
		let videoElement = document.getElementById('video') as HTMLVideoElement;
		videoElement.currentTime = metricEvent.time;
	}
</script>

<svelte:head>
	<title>Set Metric Events | Cardio Controller</title>
</svelte:head>

<div class="flex">
	<Heading>Set Metirc Events</Heading>
	<div class="flex gap-x-2">
		<Button color="alternative" href={`/sessions/view?id=${sessionId}`}>
			Back to Session View
		</Button>
		<!-- <Button>Set Metric Stage</Button> -->
	</div>
</div>

<Hr />
{#key processingVideo}
	{#if processingVideo != undefined}
		<!-- <Heading tag="h4">Please select a video to start recording metrics</Heading>
	{:else} -->
		<!-- {processingVideo.id} -->
		<div class="grid grid-cols-2 gap-x-2">
			<video controls height="540" width="860" id="video">
				<source
					title={'video file'}
					src={`/gameplay_vid/${processingVideo.file_source_path}`}
					type="video/mp4"
				/>
				<track kind="captions" />
			</video>

			<Card size="xl" class="gap-y-2">
				<Heading tag="h3">Metrics</Heading>
				<div>
					<Button size="lg">Start</Button>
					<Button size="lg">End</Button>
				</div>
				<Hr />
				<div class="grid grid-cols-4">
					{#each sessionData?.expand?.game.expand?.metrics_via_game as m}
						<Button
							size="lg"
							on:click={() => {
								handleAddMetric(m);
							}}>{m.name} + 1</Button
						>
					{/each}
				</div>
			</Card>
		</div>
		{#key videoEvents}
			<div class="mt-5 flex flex-row gap-x-2 overflow-x-auto border-2 p-2">
				{#each processingVideo.expand!.gameplay_metric_events_via_video_gameplay as e}
					<Card size="md" class="w-60 max-w-60 min-w-60">
						<Heading tag="h6">{e.expand.metric.name}</Heading>
						{e.time}
						<Hr />
						<div>
							<Button
								on:click={() => {
									handleSeek(e);
								}}>Seek</Button
							>
							<Button
								color="alternative"
								on:click={() => {
									handleDeleteMetric(e);
								}}>Delete</Button
							>
						</div>
					</Card>
				{/each}
			</div>
		{/key}
	{/if}
{/key}

<Hr />
{#key sessionData}
	{#if sessionData != undefined}
		<div class="grid grid-cols-2 gap-x-2">
			<!-- Video Table -->
			<Card size="xl" class="gap-y-2">
				<Heading tag="h3">Videos</Heading>
				<Table striped>
					<TableHead>
						<TableHeadCell>Select</TableHeadCell>
						<TableHeadCell>File Path</TableHeadCell>
						<TableHeadCell>Event Count</TableHeadCell>
					</TableHead>
					<TableBody tableBodyClass="divide-y">
						{#each sessionData?.expand?.videos_gameplay_via_session as v}
							<TableBodyRow>
								<TableBodyCell>
									{#if processingVideo != undefined && processingVideo.id == v.id}
										<Button disabled color="blue">Selected</Button>
									{:else}
										<Button
											on:click={() => {
												processingVideo = v;
												console.log(v);
											}}>Select</Button
										>
									{/if}
								</TableBodyCell>
								<TableBodyCell>{v.file_source_path}</TableBodyCell>
								<TableBodyCell
									>{v.expand?.gameplay_metric_events_via_video_gameplay != null
										? v.expand.gameplay_metric_events_via_video_gameplay.length
										: '0'}</TableBodyCell
								>
							</TableBodyRow>
						{/each}
					</TableBody>
				</Table>
			</Card>
			<!-- Video Table End -->
			<!-- <Card size="xl" class="gap-y-2">
				<Heading tag="h3">Metrics</Heading>
				<div class="grid grid-cols-4">
					{#each sessionData?.expand?.game.expand?.metrics_via_game as m}
						<Button size="lg">{m.name} + 1</Button>
					{/each}
				</div>
			</Card> -->
		</div>
	{/if}
{/key}

<br class="mb-10" />
