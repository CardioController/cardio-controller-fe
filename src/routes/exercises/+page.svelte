<script lang="ts">
	import { page } from '$app/state';
	import { cc_pb, PB_COLLECTION_EXERCISES } from '$lib/pb-integrate';
	import {
		Button,
		Heading,
		Hr,
		Input,
		Label,
		Modal,
		Select,
		Spinner,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';

	let exercises: any = $state([]);

	async function GetExercises() {
		let pageParam = page.url.searchParams.get('page') ?? '0';
		let pageIndex = parseInt(pageParam);

		exercises = await cc_pb.collection(PB_COLLECTION_EXERCISES).getList(pageIndex, 25, {
			sort: '-created'
		});
	}

	$effect(() => {
		GetExercises();
	});

	// modal
	let editModalTitle = $state('New Exercise');
	let showEditModal = $state(false);
	let editModalProcessing = $state(false);
	let exerciseName = $state('');
	let exerciseCategory = $state('');
	let exerciseDescription = $state('');
	let editingExerciseId = $state('');
	let modalSaveHandleFunc: () => void = $state(handleCreateModal);

	const categories = [
		//legs, arms, core, full-body, mobility, balance, posterior-chain, grip
		{ value: 'legs', name: 'Legs' },
		{ value: 'arms', name: 'Arms' },
		{ value: 'core', name: 'Core' },
		{ value: 'full-body', name: 'Full Body' },
		{ value: 'mobility', name: 'Mobility' },
		{ value: 'balance', name: 'Balance' },
		{ value: 'posterior-chain', name: 'Posterior Chain' },
		{ value: 'grip', name: 'Grip' }
	];

	async function handleEditModal() {
		editModalProcessing = true;
		const data = {
			name: exerciseName,
			category: exerciseCategory,
			description: exerciseDescription
		};
		await cc_pb.collection(PB_COLLECTION_EXERCISES).update(editingExerciseId, data);

		location.reload();
	}

	async function handleCreateModal() {
		editModalProcessing = true;
		const data = {
			name: exerciseName,
			category: exerciseCategory,
			description: exerciseDescription
		};
		await cc_pb.collection(PB_COLLECTION_EXERCISES).create(data);

		location.reload();
	}

	// delete modal
	let showDeleteModal = $state(false);
	let deleteModalProcessing = $state(false);
	let deletingExerciseName = $state('');
	let deletingExerciseId = $state('');

	async function handleConfirmDelete() {
		deleteModalProcessing = true;
		await cc_pb.collection(PB_COLLECTION_EXERCISES).delete(deletingExerciseId);
		location.reload();
	}
</script>

<div class="mb-10 grid grid-cols-2">
	<Heading>Exercise</Heading>
	<div class="mt-auto ml-auto">
		<Button
			on:click={() => {
				editModalTitle = 'Add Exercise';
				exerciseName = '';
				exerciseCategory = '';
				exerciseDescription = '';
				editingExerciseId = '';
				modalSaveHandleFunc = handleCreateModal;
				showEditModal = true;
			}}>New Exercise</Button
		>
	</div>
</div>

{#key exercises}
	<Table>
		<TableHead>
			<TableHeadCell>Name</TableHeadCell>
			<TableHeadCell>Category</TableHeadCell>
			<TableHeadCell>Description</TableHeadCell>
			<TableHeadCell>Operation</TableHeadCell>
		</TableHead>
		<TableBody tableBodyClass="divide-y">
			{#each exercises.items as e}
				<TableBodyRow>
					<TableBodyCell>{e.name}</TableBodyCell>
					<TableBodyCell>{e.category}</TableBodyCell>
					<TableBodyCell>{e.description}</TableBodyCell>
					<TableBodyCell
						><Button
							on:click={() => {
								editModalTitle = 'Edit Exercise';
								exerciseName = e.name;
								exerciseCategory = e.category;
								exerciseDescription = e.description;
								editingExerciseId = e.id;
								modalSaveHandleFunc = handleEditModal;
								showEditModal = true;
							}}>Edit</Button
						>
						<Button
							color="alternative"
							on:click={() => {
								deletingExerciseName = e.name;
								deletingExerciseId = e.id;
								showDeleteModal = true;
							}}>Delete</Button
						>
					</TableBodyCell>
				</TableBodyRow>
			{/each}
		</TableBody>
	</Table>
{/key}

<Modal bind:title={editModalTitle} bind:open={showEditModal}>
	{#if editModalProcessing}
		<Spinner />&nbsp;Submitting...
	{:else}
		<form
			class="flex flex-col space-y-5"
			action="#"
			onsubmit={(event: SubmitEvent) => {
				event.preventDefault();
				modalSaveHandleFunc();
			}}
		>
			<div>
				<Label for="name" class="mb-2">Name</Label>
				<Input type="text" id="name" placeholder="Squats" required bind:value={exerciseName} />
			</div>
			<div>
				<Label for="category" class="mb-2">Category</Label>
				<Select id="category" bind:value={exerciseCategory} required items={categories}></Select>
			</div>

			<div>
				<Label for="description" class="mb-2">Description</Label>
				<Input
					type="text"
					id="description"
					placeholder="Basic exercise for legs."
					required
					bind:value={exerciseDescription}
				/>
			</div>
			<Hr />
			<div>
				<Button type="submit">Save</Button>
				<Button
					color="alternative"
					on:click={() => {
						showEditModal = false;
					}}>Cancel</Button
				>
			</div>
		</form>
	{/if}
</Modal>

<Modal title="Delete Modal" bind:open={showDeleteModal}>
	{#if deleteModalProcessing}
		<Spinner />&nbsp;Submitting...
	{:else}
		<p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
			Exercise about to delete: <strong>{deletingExerciseName}</strong>
		</p>
		<p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
			Deleted exercise are not recoverable, if sessions have events related to this exercise, the name
			will be empty.
		</p>
		<Hr />
		<div>
			<Button on:click={handleConfirmDelete}>Save</Button>
			<Button
				color="alternative"
				on:click={() => {
					showDeleteModal = false;
				}}>Cancel</Button
			>
		</div>
	{/if}
</Modal>
