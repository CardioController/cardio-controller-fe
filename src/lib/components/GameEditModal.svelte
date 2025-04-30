<script lang="ts">
	import { Button, Input, Label, Modal, Spinner } from 'flowbite-svelte';

	export let show = false;
	export let processing = false;
	export let gameTitle = '';
	export let gameDescription = '';
	export let handleSubmit: (a: string, b: string) => void;

	function handleFormSubmit(event: SubmitEvent) {
		event.preventDefault();
		handleSubmit(gameTitle, gameDescription);
	}
</script>

<Modal title="Add Game" bind:open={show}>
	{#if processing}
		<Spinner />&nbsp;Submitting...
	{:else}
		<form class="flex flex-col space-y-5" action="#" onsubmit={handleFormSubmit}>
			<div>
				<Label for="title" class="mb-2">Title</Label>
				<Input
					type="text"
					id="title"
					placeholder="Europe Truck Simulator 2"
					required
					bind:value={gameTitle}
				/>
			</div>
			<div>
				<Label for="description" class="mb-2">Description</Label>
				<Input
					type="text"
					id="description"
					placeholder="Driving simulator, 3D, driving, simulator"
					required
					bind:value={gameDescription}
				/>
			</div>
			<div>
				<Button type="submit">Submit</Button>
				<Button
					color="alternative"
					on:click={() => {
						show = false;
					}}>Cancel</Button
				>
			</div>
		</form>
	{/if}
</Modal>
