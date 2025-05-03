<script lang="ts">
	import {
		cc_pb,
		PB_COLLECTION_VIDEOS_EXERCISE,
		PB_COLLECTION_VIDEOS_GAMEPLAY
	} from '$lib/pb-integrate';
	import {
		Button,
		Checkbox,
		Hr,
		Modal,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import VideoViewModal from './VideoViewModal.svelte';

	let { open = $bindable(), collection = $bindable(), addVideosCallback = $bindable() } = $props();
	let videos: any = $state([]);

	async function getVideos() {
		videos = [];
		videos = await cc_pb.collection(collection).getFullList({
			filter: 'session=null'
		});
	}

	let selectedList: string[] = [];

	function addSelected(id: string) {
		selectedList.push(id);
		selectedList = [...new Set(selectedList)];
	}
	function removeSelected(id: string) {
		const index = selectedList.indexOf(id);
		if (index > -1) {
			selectedList.splice(index, 1);
		}
	}

	$effect(() => {
		if (open) {
			selectedList = [];
			getVideos();
		}
	});

	// preview video modal

	let showVideoModal = $state(false);
	let videoModalVideoPath = $state('');
</script>

<Modal title="Add Video" bind:open>
	<Table>
		<TableHead>
			<TableHeadCell>Select</TableHeadCell>
			<TableHeadCell>File Path</TableHeadCell>
			<TableHeadCell>Created</TableHeadCell>
			<TableHeadCell>Preview</TableHeadCell>
		</TableHead>
		<TableBody tableBodyClass="divide-y">
			{#key videos}
				{#each videos as v}
					<TableBodyRow>
						<TableBodyCell>
							<Checkbox
								on:change={(c: any) => {
									if (c.target.checked) {
										addSelected(v.id);
									} else {
										removeSelected(v.id);
									}
									// console.log(selectedList);
								}}
							/>
						</TableBodyCell>
						<TableBodyCell>{v.file_source_path}</TableBodyCell>
						<TableBodyCell>{v.created}</TableBodyCell>
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
								}}>Preview</Button
							>
						</TableBodyCell>
					</TableBodyRow>
				{/each}
			{/key}
		</TableBody>
	</Table>
	<Hr />
	<Button
		on:click={() => {
			open = false;
			addVideosCallback(selectedList);
		}}>Add</Button
	>
	<Button
		color="alternative"
		on:click={() => {
			open = false;
		}}>Cancel</Button
	>
</Modal>

<VideoViewModal bind:open={showVideoModal} bind:videoPath={videoModalVideoPath} />
