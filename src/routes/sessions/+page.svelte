<script lang="ts">
	import { page } from '$app/state';
	import { cc_pb, PB_COLLECTION_GAMES, PB_COLLECTION_SESSIONS } from '$lib/pb-integrate';
	import {
		Button,
		Heading,
		Hr,
		Label,
		Modal,
		Radio,
		Select,
		Spinner,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import { ArchiveOutline, HeartOutline, RocketOutline } from 'flowbite-svelte-icons';

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
					<TableBodyCell
						><Button
							on:click={() => {
								editingSessionId = s.id;
								modalStageValue = s.stage;
								showEditStageModal = true;
							}}>Set Stage</Button
						></TableBodyCell
					>
				</TableBodyRow>
			{/each}
		</TableBody>
	</Table>
{/key}

<Modal title="Set Session Stage" bind:open={showEditStageModal}>
	{#if editModalProcessing}
		<Spinner />&nbsp;Submitting...
	{:else}
		<Radio name="Game" value="game" bind:group={modalStageValue}
			><RocketOutline color="blue" />Game</Radio
		>
		<Radio name="Exercise" value="exercise" bind:group={modalStageValue}
			><HeartOutline color="red" />Exercise</Radio
		>
		<Radio name="Finished" value="finished" bind:group={modalStageValue}
			><ArchiveOutline />Finished</Radio
		>

		<Hr />
		<Button on:click={handleSetSessionStage}>Save</Button>
		<Button
			color="alternative"
			on:click={() => {
				showEditStageModal = false;
			}}>Cancel</Button
		>
	{/if}
</Modal>

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
