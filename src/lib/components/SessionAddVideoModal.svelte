<script lang="ts">
	import { cc_pb } from '$lib/pb-integrate';
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

	// $inspect(selectedList);
	// $inspect(videos);

	$effect(() => {
		if (open) {
			selectedList = [];
			getVideos();
		}
	});
</script>

<Modal title="Add Video" bind:open>
	<Table>
		<TableHead>
			<TableHeadCell>Select</TableHeadCell>
			<TableHeadCell>File Path</TableHeadCell>
			<TableHeadCell>Created</TableHeadCell>
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
