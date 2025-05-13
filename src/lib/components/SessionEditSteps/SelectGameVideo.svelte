<script lang="ts">
	import { Button, ButtonGroup, Card, Heading, Hr, Input, Label } from 'flowbite-svelte';
	import { HeartOutline, RocketOutline } from 'flowbite-svelte-icons';
	import SessionVideoTabel from '$lib/components/SessionVideoTable.svelte';
	import type { RecordModel } from 'pocketbase';
	import { onMount } from 'svelte';
	import {
		cc_pb,
		PB_COLLECTION_GAMEPLAY_METRIC_EVENTS,
		PB_COLLECTION_SESSIONS,
		PB_COLLECTION_VIDEOS_GAMEPLAY
	} from '$lib/pb-integrate';
	import SessionAddVideoModal from '../SessionAddVideoModal.svelte';

	let { session, updated }: { session: RecordModel; updated: () => void } = $props();

	let videos: RecordModel[] = $state([]);
	let processingVideo: RecordModel | any = $state(undefined);
	let maxOrder = 0;
	let videoEvents: RecordModel[] = $state([]);
	let gameMetrics: RecordModel[] = $state([]);

	let showAddVideoModal: boolean = $state(false);

	async function getVideos() {
		videos = await cc_pb.collection(PB_COLLECTION_VIDEOS_GAMEPLAY).getFullList({
			sort: 'order',
			filter: `session="${session.id}"`,
			expand:
				'gameplay_metric_events_via_video_gameplay,gameplay_metric_events_via_video_gameplay.metric,session.game.metrics_via_game'
		});
		gameMetrics = videos[0].expand!.session.expand.game.expand.metrics_via_game;
		maxOrder = videos.length;
	}

	onMount(() => {
		getVideos();
	});

	async function VideosReOrdered(idArr: string[]) {
		const batch = cc_pb.createBatch();
		idArr.forEach((v, index) => {
			batch.collection(PB_COLLECTION_VIDEOS_GAMEPLAY).update(v, {
				order: index
			});
		});
		await batch.send();
		getVideos();
	}

	$effect(() => {
		videoEvents;
		videoEvents?.sort((a, b) => {
			return a.time - b.time;
		});
	});

	async function addVideoCallbackFunc(idArr: string[]) {
		console.log(`add video: ${idArr}`);
		const batch = cc_pb.createBatch();

		idArr.forEach((v) => {
			batch.collection(PB_COLLECTION_VIDEOS_GAMEPLAY).update(v, {
				session: session.id,
				order: maxOrder
			});
			maxOrder += 1;
		});
		await batch.send();
		getVideos();
		// updated();
	}

	async function handleMarkAsChecked() {
		await cc_pb.collection(PB_COLLECTION_SESSIONS).update(session.id, {
			game_play_metrics_checked: true
		});
		updated();
	}

	function selectVideo(video: RecordModel) {
		processingVideo = video;
		console.log(processingVideo);
		if (processingVideo.expand.gameplay_metric_events_via_video_gameplay != null) {
			videoEvents = processingVideo.expand.gameplay_metric_events_via_video_gameplay;
		} else {
			videoEvents = [];
		}
	}

	function getTimeStamp() {
		let timeStamp = (document.getElementById('video') as HTMLVideoElement).currentTime;
		return timeStamp;
	}

	async function setStart() {
		await cc_pb.collection(PB_COLLECTION_VIDEOS_GAMEPLAY).update(processingVideo!.id, {
			start: processingVideo!.start
		});
		getVideos();
		// processingVideo =
	}

	async function setEnd() {
		await cc_pb.collection(PB_COLLECTION_VIDEOS_GAMEPLAY).update(processingVideo!.id, {
			end: processingVideo!.end
		});
		getVideos();
	}

	function handleSeek(time: number) {
		if (time < 0) {
			return;
		}
		let videoElement = document.getElementById('video') as HTMLVideoElement;
		videoElement.currentTime = time;
	}

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
		videoEvents = videoEvents;
		getVideos();
		// console.log(videoEvents);
	}

	async function handleDeleteMetric(metricEvent: any) {
		// console.log(metricEvent);
		// console.log(metricEvent.time);
		await cc_pb.collection(PB_COLLECTION_GAMEPLAY_METRIC_EVENTS).delete(metricEvent.id);
		const indx = videoEvents?.indexOf(metricEvent);
		videoEvents?.splice(indx!, 1);
		getVideos();
	}
</script>

<div class="mb-5 flex items-baseline justify-baseline">
	<RocketOutline color="blue" />
	<Heading tag="h4" class="text-gray-500">Gameplay footage</Heading>
	<div class="flex items-center justify-center gap-x-2">
		<Button
			on:click={() => {
				// addVideoCollection = PB_COLLECTION_VIDEOS_EXERCISE;
				showAddVideoModal = true;
			}}
		>
			Add video
		</Button>
	</div>
</div>

<SessionVideoTabel
	bind:videos
	tableReordered={VideosReOrdered}
	selectedId={processingVideo == undefined ? undefined : processingVideo.id}
	{selectVideo}
/>
{#key processingVideo}
	{#if processingVideo != undefined}
		<Hr />
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
				<div class="grid grid-cols-2 gap-x-2">
					<div>
						<Label class="mb-2" for="input-addon-sm">Start</Label>
						<ButtonGroup class="w-full">
							<Button
								on:click={() => {
									processingVideo!.start = getTimeStamp();
									setStart();
								}}>Set</Button
							>
							<Input readonly bind:value={processingVideo.start} />
							<Button
								on:click={() => {
									handleSeek(processingVideo?.start);
								}}>Seek</Button
							>
						</ButtonGroup>
					</div>
					<div>
						<Label class="mb-2" for="input-addon-sm">End</Label>
						<ButtonGroup class="w-full">
							<Button
								on:click={() => {
									processingVideo!.end = getTimeStamp();
									setEnd();
								}}>Set</Button
							>
							<Input readonly bind:value={processingVideo.end} />
							<Button
								on:click={() => {
									handleSeek(processingVideo?.end);
								}}>Seek</Button
							>
						</ButtonGroup>
					</div>
				</div>
				<!-- <Hr /> -->
				<div class="grid grid-cols-4 gap-x-2">
					{#if processingVideo.start > -1}
						{#each gameMetrics as m}
							<Button
								size="lg"
								on:click={() => {
									handleAddMetric(m);
								}}>{m.name} + 1</Button
							>
						{/each}
					{:else}
						Please set start first
					{/if}
				</div>
			</Card>
		</div>
		<div class="mt-5 flex flex-row gap-x-2 overflow-x-auto border-2 p-2">
			{#each videoEvents as e}
				<Card size="md" class="w-60 max-w-60 min-w-60">
					<Heading tag="h6">{e.expand!.metric.name}</Heading>
					{e.time}
					<Hr />
					<div>
						<Button
							on:click={() => {
								handleSeek(e.time);
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
	{/if}
{/key}

{#if !session.game_play_metrics_checked}
	<Hr />
	<div class="flex items-end justify-end">
		<Button on:click={handleMarkAsChecked}>Mark as checked</Button>
	</div>
{/if}

<SessionAddVideoModal
	bind:open={showAddVideoModal}
	collection={PB_COLLECTION_VIDEOS_GAMEPLAY}
	addVideosCallback={addVideoCallbackFunc}
/>
