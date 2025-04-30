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

	let sessions: any = $state([]);
</script>

<div class="mb-10 grid grid-cols-2">
	<Heading>Sessions</Heading>
	<div class="mt-auto ml-auto">
		<Button>New Session</Button>
	</div>
</div>

<Table>
	<TableHead>
		<TableHeadCell>Create at</TableHeadCell>
		<TableHeadCell>Stage</TableHeadCell>
		<TableHeadCell>Game</TableHeadCell>
		<TableHeadCell>Operation</TableHeadCell>
	</TableHead>
	<TableBody tableBodyClass="divide-y">
		<TableBodyRow>
			<TableBodyCell>Apple MacBook Pro 17"</TableBodyCell>
			<TableBodyCell>Sliver</TableBodyCell>
			<TableBodyCell>Laptop</TableBodyCell>
			<TableBodyCell>$2999</TableBodyCell>
		</TableBodyRow>
		<TableBodyRow>
			<TableBodyCell>Microsoft Surface Pro</TableBodyCell>
			<TableBodyCell>White</TableBodyCell>
			<TableBodyCell>Laptop PC</TableBodyCell>
			<TableBodyCell>$1999</TableBodyCell>
		</TableBodyRow>
		<TableBodyRow>
			<TableBodyCell>Magic Mouse 2</TableBodyCell>
			<TableBodyCell>Black</TableBodyCell>
			<TableBodyCell>Accessories</TableBodyCell>
			<TableBodyCell>$99</TableBodyCell>
		</TableBodyRow>
	</TableBody>
</Table>
