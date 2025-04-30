<script lang="ts">
	import {
		Heading,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import { ArchiveOutline, HeartOutline, RocketOutline } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';

	let props = $props();
	onMount(() => {
		if (props.sessions != null) {
			props.sessions.sort(function (a: any, b: any) {
				const aDate = new Date(a.created);
				const bDate = new Date(b.created);

				return bDate.getTime() - aDate.getTime(); // desc
			});
		}
	});
</script>

<Heading tag="h3">Sessions</Heading>
{#key props}
	<Table>
		<TableHead>
			<TableHeadCell>Created</TableHeadCell>
			<TableHeadCell>Stage</TableHeadCell>
		</TableHead>
		<TableBody tableBodyClass="divide-y">
			{#each props.sessions as s}
				<TableBodyRow>
					<TableBodyCell>{s.created.split(' ')[0]}</TableBodyCell>
					<TableBodyCell>
						<div class="flex gap-x-2">
							{#if s.stage == 'game'}
								<RocketOutline color="blue" />
							{:else if s.stage == 'exercise'}
								<HeartOutline color="red" />
							{:else if s.stage == 'finished'}
								<ArchiveOutline />
							{/if}
							{s.stage}
						</div>
					</TableBodyCell>
				</TableBodyRow>
			{/each}
		</TableBody>
	</Table>
{/key}
