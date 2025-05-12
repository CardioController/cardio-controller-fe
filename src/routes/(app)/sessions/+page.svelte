<script lang="ts">
	import { page } from '$app/state';
	import SessionsTable from '$lib/components/SessionsTable.svelte';
	import { cc_pb, PB_COLLECTION_GAMES, PB_COLLECTION_SESSIONS } from '$lib/pb-integrate';
	import { Button, Heading, Hr, Label, Modal, Select, Spinner } from 'flowbite-svelte';

	let sessions: any = $state([]);

	async function GetSessions() {
		let pageParam = page.url.searchParams.get('page') ?? '0';
		let pageIndex = parseInt(pageParam);

		sessions = await cc_pb.collection(PB_COLLECTION_SESSIONS).getList(pageIndex, 25, {
			expand: 'game',
			sort: '-created'
		});
	}

	$effect(() => {
		GetSessions();
	});

	// set stage modal
	let showEditStageModal = $state(false);
	let editModalProcessing = $state(false);
	let editingSessionId = $state('');
	let modalStageValue = $state('');
	async function handleSetSessionStage() {
		editModalProcessing = true;
		await cc_pb.collection(PB_COLLECTION_SESSIONS).update(editingSessionId, {
			stage: modalStageValue
		});
		location.reload();
	}

	// add session modal
	let showAddSessionModal = $state(false);
	let addModalProcessing = $state(false);
	let newSessionGameId = $state('');
	let loadingGamesList = $state(false);
	let dbGamesList = $state([]);
	let gamesList: { value: string; name: string }[] = $state([]);

	async function loadGames() {
		if (dbGamesList.length > 0) {
			return;
		}
		dbGamesList = await cc_pb.collection(PB_COLLECTION_GAMES).getFullList({
			sort: ''
		});
		gamesList = dbGamesList.map((x: any) => {
			return {
				value: x.id,
				name: x.title
			};
		});
	}

	async function handleAddSession() {
		addModalProcessing = true;
		const result = await cc_pb.collection(PB_COLLECTION_SESSIONS).create({
			game: newSessionGameId,
			stage: 'game'
		});
		location.reload();
	}
</script>

<svelte:head>
	<title>Sessions | Cardio Controller</title>
</svelte:head>

<div class="mb-10 grid grid-cols-2">
	<Heading>Sessions</Heading>
	<div class="mt-auto ml-auto">
		<Button
			on:click={() => {
				// maybe should check onging session before showing modal
				showAddSessionModal = true;
				loadGames();
			}}>New Session</Button
		>
	</div>
</div>

{#key sessions}
	<SessionsTable bind:sessions />
{/key}

<Modal title="New Session" bind:open={showAddSessionModal}>
	{#if addModalProcessing}
		<Spinner />&nbsp;Submitting...
	{:else}
		<Label>Game</Label>
		{#if loadingGamesList}
			<Spinner />&nbsp;Loading Games...
		{:else}
			<Select bind:items={gamesList} bind:value={newSessionGameId}></Select>
		{/if}
		<Hr />
		<Button on:click={handleAddSession}>Save</Button>
		<Button
			color="alternative"
			on:click={() => {
				showAddSessionModal = false;
			}}>Cancel</Button
		>
	{/if}
</Modal>
