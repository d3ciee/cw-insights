<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Button, buttonVariants } from '$lib/ui/button';
	import * as Dialog from '$lib/ui/dialog';
	import { Label } from '$lib/ui/label';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { Loader2 } from 'lucide-svelte';

	export let userId: string;
	export let sessionId: string;
	let loading: boolean = false;
	let open: boolean;
	let error: string = '';

	const onSubmit: SubmitFunction = () => {
		loading = true;

		return ({ result }) => {
			switch (result.type) {
				case 'failure':
				case 'error':
					console.log(result);
					error = (result as any).data?.message;
					loading = false;
					return;
				case 'success':
					goto('?', {
						invalidateAll: true
					});
					open = false;
					loading = false;
			}
		};
	};
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger class={buttonVariants({ variant: 'destructive', size: 'sm' })}>
		Delete session
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title></Dialog.Title>
		</Dialog.Header>
	</Dialog.Content>

	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete the session for user: {userId}?
			</Dialog.Description>
		</Dialog.Header>
		<form use:enhance={onSubmit} action="/dashboard/security-manager?/delete" method="post">
			<input type="hidden" name="sessionId" value={sessionId} />
			<Label class="text-red-500">
				{error}
			</Label>
			<Dialog.Footer class="mt-6 flex w-full gap-2">
				<Button disabled={loading} variant="destructive" type="submit" class="w-full">
					{#if loading}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					{/if}
					Yes, sure
				</Button>
				<Button disabled={loading} variant="outline" on:click={() => (open = false)} class="w-full"
					>Cancel</Button
				>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
