<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import '@fontsource-variable/noto-sans';

	let debug = $state(false);
	let positionStyle = $state('');
	let information = $state('');

	['items-start', 'items-center', 'items-end', 'justify-start', 'justify-center', 'justify-end'];

	onMount(() => {
		debug = parseInt(page.url.searchParams.get('debug') ?? '0') == 1;
		let informationParam = page.url.searchParams.get('information') ?? '';
		information = decodeURI(informationParam);

		// position can be
		// top-start,top-center,top-end
		// center-start,center-center,center-end
		// end-start,end-center,end-end
		let positionParam = page.url.searchParams.get('position') ?? 'top-start';

		let posSplitted = positionParam.split('-');
		if (posSplitted.length != 2) {
			posSplitted = ['top', 'start'];
		}

		if (posSplitted[0] == 'top') {
			positionStyle = 'items-start';
		} else if (posSplitted[0] == 'center') {
			positionStyle = 'items-center';
		} else {
			positionStyle = 'items-end';
		}

		if (posSplitted[1] == 'start') {
			positionStyle += ' justify-start';
		} else if (posSplitted[1] == 'center') {
			positionStyle += ' justify-center';
		} else {
			positionStyle += ' justify-end';
		}
	});
</script>

{#if debug}
	<div class="fixed flex h-full w-full items-center justify-center">
		<div class=" h-[1080px] w-[1920px] border-2 border-black"></div>
	</div>
{/if}

<div class="fixed flex h-full w-full items-center justify-center">
	<div class="flex h-[1080px] w-[1920px] p-10 {positionStyle}">
		<div class="p-10 bg-black/50 rounded-4xl">
			<pre class="text-4xl text-white">{information}</pre>
		</div>
	</div>
</div>

<style>
	pre {
		font-family: 'Noto Sans Variable', sans-serif;
		font-weight: 900;
	}
</style>
