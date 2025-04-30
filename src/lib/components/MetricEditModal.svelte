<script lang="ts">
	import { Button, Input, Label, Modal, Spinner } from 'flowbite-svelte';

	export let modalTitle = 'Edit Metric';
	export let show = false;
	export let processing = false;
	export let handleSubmit: (a: string, b: string, c: string) => void;
	export let metricName = '';
	export let metricUnit = '';
	export let metricDescription = '';

	function handleFormSubmit(event: SubmitEvent) {
		event.preventDefault();
		handleSubmit(metricName, metricUnit, metricDescription);
	}
</script>

<Modal title={modalTitle} bind:open={show}>
	{#if processing}
		<Spinner />&nbsp;Submitting...
	{:else}
		<form class="flex flex-col space-y-5" action="#" onsubmit={handleFormSubmit}>
			<div>
				<Label for="name" class="mb-2">Name</Label>
				<Input
					type="text"
					id="name"
					placeholder="Speeding"
					required
					bind:value={metricName}
				/>
			</div>
			<div>
				<Label for="unit" class="mb-2">Unit</Label>
				<Input
					type="text"
					id="unit"
					placeholder="time(s)"
					required
					bind:value={metricUnit}
				/>
			</div>
			<div>
				<Label for="description" class="mb-2">Description</Label>
				<Input
					type="text"
					id="description"
					placeholder="time(s) of over speed"
					required
					bind:value={metricDescription}
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
