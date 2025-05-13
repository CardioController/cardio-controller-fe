<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import GameEditModal from '$lib/components/GameEditModal.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import { cc_pb, PB_COLLECTION_GAMES } from '$lib/pb-integrate';
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

	let games: any = $state([]);
	let showAddModal: boolean = $state(false);

	let newGameSubmitting: boolean = $state(false);

	async function GetGames() {
		let pageParam = page.url.searchParams.get('page') ?? '0';
		let pageIndex = parseInt(pageParam);

		games = await cc_pb.collection(PB_COLLECTION_GAMES).getList(pageIndex, 25, {
			expand: 'sessions_via_game,metrics_via_game',
			sort: '-created'
		});
	}

	$effect(() => {
		GetGames();
	});

	async function handleNewGame(newGameTitle: string, newGameDescription: string) {
		newGameSubmitting = true;
		const data = {
			title: newGameTitle,
			description: newGameDescription
		};

		const result = await cc_pb.collection(PB_COLLECTION_GAMES).create(data);
		goto(`/games/edit?id=${result.id}`);
	}
</script>

<svelte:head>
	<title>Games | Cardio Controller</title>
</svelte:head>

<div class="mb-10 grid grid-cols-2">
	<Heading>Games</Heading>
	<div class="mt-auto ml-auto">
		<Button
			on:click={() => {
				showAddModal = true;
			}}>New Game</Button
		>
	</div>
</div>

{#key games}
	<Table>
		<TableHead>
			<TableHeadCell>Title</TableHeadCell>
			<TableHeadCell>Description</TableHeadCell>
			<TableHeadCell>Metrics Count</TableHeadCell>
			<TableHeadCell>Session Count</TableHeadCell>
			<TableHeadCell>Operation</TableHeadCell>
		</TableHead>
		<TableBody tableBodyClass="divide-y">
			{#each games.items as g}
				<TableBodyRow>
					<TableBodyCell>{g.title}</TableBodyCell>
					<TableBodyCell>{g.description}</TableBodyCell>
					<TableBodyCell
						>{g.expand.metrics_via_game == null
							? `0`
							: g.expand.metrics_via_game.length}</TableBodyCell
					>
					<TableBodyCell
						>{g.expand.sessions_via_game == null
							? `0`
							: g.expand.sessions_via_game.length}</TableBodyCell
					>
					<TableBodyCell>
						<Button href={`/games/edit?id=${g.id}`}>Edit</Button>
					</TableBodyCell>
				</TableBodyRow>
			{/each}
		</TableBody>

		<div class={games.totalPages > 1 ? '' : 'hidden'}>
			<div class="mt-5 flex w-full justify-center">
				<div class="mt-5 flex w-full justify-center">
					<Pagination
						data={games}
						pageIndex={games.page}
						isFirstPage={games.page - 1 < 1}
						isLastPage={games.page == games.totalPages}
					/>
				</div>
			</div>
		</div>
	</Table>
{/key}

<GameEditModal
	bind:show={showAddModal}
	handleSubmit={handleNewGame}
	bind:processing={newGameSubmitting}
/>
