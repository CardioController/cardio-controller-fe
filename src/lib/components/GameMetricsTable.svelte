<script lang="ts">
	import {
		Button,
		Heading,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';

	let props = $props();
</script>

<div class="grid grid-cols-2">
	<Heading tag="h3">Metrics</Heading>
	<div class="ml-auto">
		<Button>Add Metric</Button>
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
						<Button>Edit</Button>
					</TableBodyCell>
				</TableBodyRow>
			{/each}
		</TableBody>
	</Table>
{/key}
