<script lang="ts">
	import { Modal } from 'flowbite-svelte';

	let { open = $bindable(), videoPath = $bindable() } = $props();
</script>

<Modal bind:open bind:title={videoPath}>
	<video controls height="540" width="860" id="video">
		<source title={'video file'} src={`${videoPath}`} type="video/mp4" />
		<track kind="captions" />
	</video>
</Modal>
