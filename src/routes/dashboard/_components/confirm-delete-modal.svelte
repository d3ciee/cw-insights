<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/ui/button';
	import * as Dialog from '$lib/ui/dialog';
	import { Label } from '$lib/ui/label';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { Loader2 } from 'lucide-svelte';

	export let open: boolean;
	export let description: string = '';
	export let action: string;

	export let onDelete: () => void;
	export let toBeDeleted: string = '';

	let loading: boolean;
	let error: string = '';

	const onSubmit: SubmitFunction = (e) => {
		loading = true;

		return ({ result }) => {
			switch (result.type) {
				case 'failure':
				case 'error':
					error = (result as any).data.message;
					loading = false;
					return;
				case 'success':
					onDelete();
					open = false;
					loading = false;
			}
		};
	};
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Are you sure absolutely sure?</Dialog.Title>
			<Dialog.Description>
				{description}
			</Dialog.Description>
		</Dialog.Header>
		<form {action} use:enhance={onSubmit} method="post">
			<input type="hidden" name="id" value={toBeDeleted} />
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
