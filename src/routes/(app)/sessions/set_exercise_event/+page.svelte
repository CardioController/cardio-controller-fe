<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { cc_pb, PB_COLLECTION_SESSIONS, PB_COLLECTION_VIDEOS_EXERCISE } from '$lib/pb-integrate';
	import {
		Button,
		ButtonGroup,
		Card,
		Heading,
		Hr,
		Input,
		Label,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import { HeartOutline } from 'flowbite-svelte-icons';
	import type { RecordModel } from 'pocketbase';
	import { onMount } from 'svelte';

	let sessionId = $state('');
	let sessionData: RecordModel | undefined = $state();

	let processingVideo: RecordModel | undefined = $state(undefined);
	let processingVideoStart: number = $state(0);
	let processingVideoEnd: number = $state(0);

	async function getSession() {
		sessionData = await cc_pb.collection(PB_COLLECTION_SESSIONS).getOne(sessionId, {
			expand: 'game,videos_exercise_via_session'
		});
		console.log(sessionData);
	}

	onMount(() => {
		sessionId = page.url.searchParams.get('id') ?? '';
		if (sessionId.length == 0) {
			goto('/sessions');
			return;
		}
		getSession();
	});

	function getVideoTimeStamp() {
		let timeStamp = (document.getElementById('video') as HTMLVideoElement).currentTime;
		return timeStamp;
	}

	function handleVideoSeek(timeStamp: number) {
		let videoElement = document.getElementById('video') as HTMLVideoElement;
		videoElement.currentTime = timeStamp;
	}

	async function handleSave() {
		await cc_pb.collection(PB_COLLECTION_VIDEOS_EXERCISE).update(processingVideo!.id, {
			start: processingVideoStart,
			end: processingVideoEnd
		});
		getSession();
	}
</script>

<svelte:head>
	<title>Set Exercise Events | Cardio Controller</title>
</svelte:head>

<div class="flex items-baseline gap-x-2">
	<HeartOutline color="red" size="xl" />
	<Heading>Set Exercise Events</Heading>
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
		<div class="grid grid-cols-2 gap-x-2">
			<video controls height="540" width="860" id="video">
				<source
					title={'video file'}
					src={`/exercise_vid/${processingVideo.file_source_path}`}
					type="video/mp4"
				/>
				<track kind="captions" />
			</video>

			<Card size="xl" class="gap-y-2">
				<Heading tag="h3">Metrics</Heading>
				<Label for="start" class="mb-2">Start</Label>
				<ButtonGroup>
					<Button
						on:click={() => {
							processingVideoStart = getVideoTimeStamp();
						}}>Set</Button
					>
					<Input id="start" readonly bind:value={processingVideoStart} />
					<Button
						on:click={() => {
							handleVideoSeek(processingVideoStart);
						}}>Seek</Button
					>
				</ButtonGroup>
				<Label for="end" class="mb-2">End</Label>
				<ButtonGroup>
					<Button
						on:click={() => {
							processingVideoEnd = getVideoTimeStamp();
						}}>Set</Button
					>
					<Input id="end" readonly bind:value={processingVideoEnd} />
					<Button
						on:click={() => {
							handleVideoSeek(processingVideoEnd);
						}}>Seek</Button
					>
				</ButtonGroup>
				<div class="mt-auto">
					<Hr />
					<div class="flex items-end justify-end">
						<Button on:click={handleSave}>Save</Button>
					</div>
				</div>
			</Card>
		</div>
		<Hr />
	{/if}

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
							<TableHeadCell>Start</TableHeadCell>
							<TableHeadCell>End</TableHeadCell>
						</TableHead>
						<TableBody tableBodyClass="divide-y">
							{#each sessionData?.expand?.videos_exercise_via_session as v}
								<TableBodyRow>
									<TableBodyCell>
										{#if processingVideo != undefined && processingVideo.id == v.id}
											<Button disabled color="blue">Selected</Button>
										{:else}
											<Button
												on:click={() => {
													processingVideo = v;
													processingVideoStart = v.start;
													processingVideoEnd = v.end;
													console.log(v);
												}}>Select</Button
											>
										{/if}
									</TableBodyCell>
									<TableBodyCell>{v.file_source_path}</TableBodyCell>
									<TableBodyCell>{v.start}</TableBodyCell>
									<TableBodyCell>{v.end}</TableBodyCell>
								</TableBodyRow>
							{/each}
						</TableBody>
					</Table>
				</Card>
			</div>
		{/if}
	{/key}
{/key}

<br class="mb-10" />

