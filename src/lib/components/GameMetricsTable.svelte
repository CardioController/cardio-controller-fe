<script lang="ts">
	import {
		Button,
		Heading,
		Hr,
		Modal,
		Spinner,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import MetricEditModal from './MetricEditModal.svelte';
	import { cc_pb, PB_COLLECTION_METRICS } from '$lib/pb-integrate';

	let props = $props();

	let showModal = $state(false);
	let processingSubmit = $state(false);
	let modalTitle = $state('Add Metric');
	let metricName = $state('');
	let metricUnit = $state('');
	let metricDescription = $state('');
	let metricEditingId: string = $state('');

	async function handleCreateMetric(name: string, unit: string, description: string) {
		processingSubmit = true;
		const data = {
			name,
			unit,
			description,
			game: props.gameId
		};
		await cc_pb.collection(PB_COLLECTION_METRICS).create(data);
		location.reload();
	}

	async function handleEditMetric(name: string, unit: string, description: string) {
		processingSubmit = true;
		const data = {
			name,
			unit,
			description
		};
		await cc_pb.collection(PB_COLLECTION_METRICS).update(metricEditingId, data);

		location.reload();
	}

	let modalHandleFunc = $state(handleCreateMetric);

	// delete
	let showDeleteModal = $state(false);
	let deletingMetricName = $state('');
	let deletingMetricId = $state('');
	let deleteProcessing = $state(false);

	async function handleDeleteMetric() {
		deleteProcessing = true;
		await cc_pb.collection(PB_COLLECTION_METRICS).delete(deletingMetricId);

		location.reload();
	}
</script>

<div class="grid grid-cols-2">
	<Heading tag="h3">Metrics</Heading>
	<div class="ml-auto">
		<Button
			on:click={() => {
				console.log(props.gameId);
				modalTitle = 'Edit Metric';
				metricName = '';
				metricUnit = '';
				metricDescription = '';
				modalHandleFunc = handleCreateMetric;
				metricEditingId = '';
				processingSubmit = false;
				showModal = true;
			}}>Add Metric</Button
		>
	</div>
</div>

{#key props}
	<Table>
		<TableHead>
			<TableHeadCell>Name</TableHeadCell>
			<TableHeadCell>Unit</TableHeadCell>
			<TableHeadCell>Description</TableHeadCell>
			<TableHeadCell>Operation</TableHeadCell>
		</TableHead>
		<TableBody tableBodyClass="divide-y">
			{#each props.metrics as m}
				<TableBodyRow>
					<TableBodyCell>{m.name}</TableBodyCell>
					<TableBodyCell>{m.unit}</TableBodyCell>
					<TableBodyCell>{m.description}</TableBodyCell>
					<TableBodyCell>
						<Button
							on:click={() => {
								modalTitle = 'Edit Metric';
								metricName = m.name;
								metricUnit = m.unit;
								metricDescription = m.description;
								modalHandleFunc = handleEditMetric;
								metricEditingId = m.id;
								processingSubmit = false;
								showModal = true;
							}}>Edit</Button
						>
						<Button
							color="alternative"
							on:click={() => {
								deletingMetricId = m.id;
								deletingMetricName = m.name;
								showDeleteModal = true;
							}}>Delete</Button
						>
					</TableBodyCell>
				</TableBodyRow>
			{/each}
		</TableBody>
	</Table>
{/key}

<MetricEditModal
	handleSubmit={modalHandleFunc}
	bind:show={showModal}
	bind:processing={processingSubmit}
	bind:modalTitle
	bind:metricName
	bind:metricUnit
	bind:metricDescription
/>

<Modal title="Delete Metric" bind:open={showDeleteModal}>
	{#if processingSubmit}
		<Spinner />&nbsp;Deleting...
	{:else}
		<p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
			Metric about to delete: <strong>{deletingMetricName}</strong>
		</p>
		<p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
			Deleted metrics are not recoverable, if sessions have events related to this metric, the name
			will be empty.
		</p>
		<Hr />
		<Button on:click={handleDeleteMetric}>Confirm</Button>
		<Button color="alternative">Cancel</Button>
	{/if}
</Modal>
