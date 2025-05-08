<script lang="ts">
	import {
		Avatar,
		Button,
		Dropdown,
		DropdownItem,
		Navbar,
		NavBrand,
		NavHamburger,
		NavLi,
		NavUl
	} from 'flowbite-svelte';
	import '../../app.css';
	import { cc_pb } from '$lib/pb-integrate';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	let { children } = $props();

	$effect(() => {
		if (!cc_pb.authStore.isValid) {
			if (!page.url.pathname.toLowerCase().startsWith('/login')) {
				goto('/login');
			}
		}
	});

	function handleSignOut() {
		cc_pb.authStore.clear();
		location.reload();
	}
</script>

<Navbar>
	<NavBrand href="/">
		<!-- <img src="/images/flowbite-svelte-icon-logo.svg" class="me-3 h-6 sm:h-9" alt="Flowbite Logo" /> -->
		<span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white"
			>Cardio Controller</span
		>
	</NavBrand>

	{#key cc_pb.authStore}
		{#if cc_pb.authStore.isValid}
			<div class="flex items-center md:order-2">
				<Avatar id="avatar-menu" />
				<NavHamburger />
			</div>
			<Dropdown placement="bottom" triggeredBy="#avatar-menu">
				<!-- <DropdownHeader>
					<span class="block text-sm">Bonnie Green</span>
					<span class="block truncate text-sm font-medium">name@flowbite.com</span>
				</DropdownHeader>
				<DropdownItem>Dashboard</DropdownItem>
				<DropdownItem>Settings</DropdownItem>
				<DropdownItem>Earnings</DropdownItem>
				<DropdownDivider /> -->
				<DropdownItem on:click={handleSignOut}>Sign out</DropdownItem>
			</Dropdown>
		{:else}
			<div class="flex items-center md:order-2">
				<Button
					on:click={() => {
						if (page.url.pathname != '/login') {
							goto('/login');
						}
					}}>Login</Button
				>
				<NavHamburger />
			</div>
		{/if}
		
	{/key}

	<NavUl class="order-1">
		<NavLi href="/sessions">Sessions</NavLi>
		<NavLi href="/games">Games</NavLi>
		<NavLi href="/exercises">Exercises</NavLi>
	</NavUl>
</Navbar>

<div class=" container m-auto">
	{@render children()}
</div>
