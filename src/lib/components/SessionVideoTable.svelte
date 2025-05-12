<script lang="ts">
	import {
		Button,
		Modal,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import { AngleDownOutline, AngleUpOutline, TicketOutline } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';
	import { PB_COLLECTION_VIDEOS_EXERCISE, PB_COLLECTION_VIDEOS_GAMEPLAY } from '$lib/pb-integrate';
	import VideoViewModal from './VideoViewModal.svelte';
	import type { RecordModel } from 'pocketbase';

	let {
		selectedId = $bindable(),
		selectVideo = $bindable<(id: RecordModel) => void>(),
		videos = $bindable(),
		tableReordered = $bindable<(idArr: string[]) => void>()
	} = $props();
	let showVideoModal = $state(false);
	let videoModalVideoPath = $state('');
	// let maxOrder = $state(0);

	onMount(() => {
		if (videos != undefined) {
			// maxOrder = videos.length - 1;
			videos.sort((a: any, b: any) => {
				return a.order - b.order;
			});
		}
	});

	async function handleSortUp(video: any) {
		// console.log('to move up: ', video.id);
		const ids = videos.flatMap((x: any) => x.id);
		// console.log('Origin: ', ids);
		const index = ids.indexOf(video.id);
		// console.log('Index: ', index);
		ids.splice(index, 1);
		// console.log('Spliced: ', ids);
		ids.splice(index - 1, 0, video.id);
		// console.log('Inserted: ', ids);
		tableReordered(ids);
	}

	async function handleSortDown(video: any) {
		// console.log('to move up: ', video.id);
		const ids = videos.flatMap((x: any) => x.id);
		// console.log('Origin: ', ids);
		const index = ids.indexOf(video.id);
		// console.log('Index: ', index);
		ids.splice(index, 1);
		// console.log('Spliced: ', ids);
		ids.splice(index + 1, 0, video.id);
		// console.log('Inserted: ', ids);
		tableReordered(ids);
	}
</script>

<Table>
	<TableHead>
		{#if selectVideo != undefined}
			<TableHeadCell>Select</TableHeadCell>
		{/if}
		<TableHeadCell>Path</TableHeadCell>
		<TableHeadCell>Order</TableHeadCell>
		<TableHeadCell>Sort</TableHeadCell>
		{#if videos.length > 0 && videos[0].collectionName == PB_COLLECTION_VIDEOS_GAMEPLAY}
			<TableHeadCell>Events Count</TableHeadCell>
		{/if}
		<TableHeadCell>Operation</TableHeadCell>
	</TableHead>
	<TableBody tableBodyClass="divide-y">
		{#key videos}
			{#each videos as v}
				<TableBodyRow>
					{#if selectVideo != undefined}
						<TableBodyCell>
							{#if selectedId != undefined && selectedId == v.id}
								<Button disabled color="blue">Selected</Button>
							{:else}
								<Button
									on:click={() => {
										// selectedId = v;
										selectVideo(v);
										// console.log(v);
									}}>Select</Button
								>
							{/if}
						</TableBodyCell>
					{/if}
					<TableBodyCell>{v.file_source_path}</TableBodyCell>
					<TableBodyCell>{v.order}</TableBodyCell>
					<TableBodyCell>
						<Button
							disabled={v.order == 0}
							on:click={() => {
								handleSortUp(v);
							}}
						>
							<AngleUpOutline />
						</Button>
						<Button
							disabled={videos.length == 0 || v.order >= videos.length - 1}
							on:click={() => {
								handleSortDown(v);
							}}
						>
							<AngleDownOutline />
						</Button>
					</TableBodyCell>

					{#if videos.length > 0 && videos[0].collectionName == PB_COLLECTION_VIDEOS_GAMEPLAY}
						<TableBodyCell
							>{v.expand.gameplay_metric_events_via_video_gameplay == null
								? 0
								: v.expand.gameplay_metric_events_via_video_gameplay.length}</TableBodyCell
						>
					{/if}
					<TableBodyCell>
						<Button
							color="blue"
							on:click={() => {
								videoModalVideoPath = '';
								if (v.collectionName == PB_COLLECTION_VIDEOS_EXERCISE) {
									videoModalVideoPath += '/exercise_vid/';
								} else if (v.collectionName == PB_COLLECTION_VIDEOS_GAMEPLAY) {
									videoModalVideoPath += '/gameplay_vid/';
								}
								videoModalVideoPath += v.file_source_path;
								showVideoModal = true;
							}}
						>
							View
						</Button>
					</TableBodyCell>
				</TableBodyRow>
			{/each}
		{/key}
	</TableBody>
</Table>

<VideoViewModal bind:open={showVideoModal} bind:videoPath={videoModalVideoPath} />
