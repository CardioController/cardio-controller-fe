<script lang="ts">
	import {
		Button,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import { ArchiveOutline, HeartOutline, RocketOutline } from 'flowbite-svelte-icons';

	export let sessions: any = [];
</script>

{#key sessions}
	<Table>
		<TableHead>
			<TableHeadCell>Create at</TableHeadCell>
			<TableHeadCell>Stage</TableHeadCell>
			<TableHeadCell>Game</TableHeadCell>
			<TableHeadCell>Operation</TableHeadCell>
		</TableHead>
		<TableBody tableBodyClass="divide-y">
			{#each sessions.items as s}
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
					<TableBodyCell>{s.expand.game.title}</TableBodyCell>
					<TableBodyCell>
						<Button color="blue" href={`/sessions/view?id=${s.id}`}>View</Button>
					</TableBodyCell>
				</TableBodyRow>
			{/each}
		</TableBody>
	</Table>
{/key}
