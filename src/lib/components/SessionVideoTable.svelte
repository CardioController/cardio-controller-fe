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

	let {
		videos = $bindable(),
		tableReordered = $bindable<(idArr: string[], collectionName: string) => void>()
	} = $props();
	let showVideoModal = $state(false);
	let videoModalVideoPath = $state('');
	let maxOrder = $state(0);

	onMount(() => {
		if (videos != null) {
			maxOrder = videos.length - 1;
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
		tableReordered(ids, video.collectionName);
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
		tableReordered(ids, video.collectionName);
	}
</script>

<Table>
	<TableHead>
		<TableHeadCell>Path</TableHeadCell>
		<TableHeadCell>Order</TableHeadCell>
		<TableHeadCell>Sort</TableHeadCell>
		<TableHeadCell>Operation</TableHeadCell>
	</TableHead>
	<TableBody tableBodyClass="divide-y">
		{#key videos}
			{#each videos as v}
				<TableBodyRow>
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
							disabled={v.order == maxOrder}
							on:click={() => {
								handleSortDown(v);
							}}
						>
							<AngleDownOutline />
						</Button>
					</TableBodyCell>
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
