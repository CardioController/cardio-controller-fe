<script lang="ts">
	import { goto } from '$app/navigation';
	import { cc_pb, PB_COLLECTION_USERS } from '$lib/pb-integrate';
	import { Button, Card, Checkbox, Heading, Input, Label } from 'flowbite-svelte';
	import { onMount } from 'svelte';

	let email: string, password: string;

	onMount(() => {
		if (cc_pb.authStore.isValid) {
			goto('/');
		}
	});

	async function SignIn() {
		try {
			const authData = await cc_pb
				.collection(PB_COLLECTION_USERS)
				.authWithPassword(email, password);
			location.reload();
		} catch (e: any) {}
	}
</script>

<div class="mt-20 flex items-center justify-center">
	<Card>
		<form class="flex flex-col space-y-6" action="/" on:submit|preventDefault={SignIn}>
			<h3 class="text-xl font-medium text-gray-900 dark:text-white">Login</h3>
			<Label class="space-y-2">
				<span>Email</span>
				<Input
					type="email"
					name="email"
					placeholder="name@company.com"
					required
					bind:value={email}
				/>
			</Label>
			<Label class="space-y-2">
				<span>Your password</span>
				<Input type="password" name="password" placeholder="•••••" required bind:value={password} />
			</Label>
			<!-- <div class="flex items-start">
            <Checkbox>Remember me</Checkbox>
            <a href="/" class="ms-auto text-sm text-primary-700 hover:underline dark:text-primary-500"> Lost password? </a>
          </div> -->
			<Button type="submit" class="w-full">Login to your account</Button>
			<!-- <div class="text-sm font-medium text-gray-500 dark:text-gray-300">
            Not registered? <a href="/" class="text-primary-700 hover:underline dark:text-primary-500"> Create account </a>
          </div> -->
		</form>
	</Card>
</div>
