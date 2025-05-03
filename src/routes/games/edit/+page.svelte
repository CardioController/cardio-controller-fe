<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import GameEditModal from '$lib/components/GameEditModal.svelte';
	import GameMetricsTable from '$lib/components/GameMetricsTable.svelte';
	import GameSessionsTabel from '$lib/components/GameSessionsTabel.svelte';
	import { cc_pb, PB_COLLECTION_GAMES } from '$lib/pb-integrate';
	import { Button, Heading, Hr } from 'flowbite-svelte';
	import { onMount } from 'svelte';

	let gameId: string | null;
	let gameData: any = $state(null);

	async function GetGame() {
		const result = await cc_pb.collection(PB_COLLECTION_GAMES).getOne(gameId!, {
			expand: 'metrics_via_game,sessions_via_game'
		});
		if (result == null) {
			goto('/games');
			return;
		}
		gameData = result;
	}

	onMount(() => {
		gameId = page.url.searchParams.get('id');
		if (gameId == null || gameId.length == 0) {
			goto('/games');
			return;
		}
		GetGame();
	});

	let showModal: boolean = $state(false);
	let editSubmitting: boolean = $state(false);

	async function handleEditGame(title: string, description: string) {
		editSubmitting = true;

		const data = {
			title,
			description
		};
		const result = await cc_pb.collection(PB_COLLECTION_GAMES).update(gameData.id, data);
		GetGame();
	}
</script>

<svelte:head>
	<title>{gameData == null ? '' : gameData.title} - Edit Game | Cardio Controller</title>
</svelte:head>

{#if gameData != null}
	<div class="grid grid-cols-1 space-y-5">
		<div class="flex">
			<Heading>{gameData.title}</Heading>
			<Button
				on:click={() => {
					showModal = true;
				}}>Edit Game</Button
			>
		</div>
		<Heading tag="h2">{gameData.description}</Heading>
		<Hr />
		<GameMetricsTable
			metrics={gameData.expand.metrics_via_game}
			gameId={gameData.id}
			metricsChanged={GetGame}
		/>
		<Hr />
		<GameSessionsTabel sessions={gameData.expand.sessions_via_game} />
	</div>

	<GameEditModal
		modalTitle="Edit Game"
		gameTitle={gameData.title}
		gameDescription={gameData.description}
		handleSubmit={handleEditGame}
		bind:show={showModal}
		bind:processing={editSubmitting}
	/>
{/if}
