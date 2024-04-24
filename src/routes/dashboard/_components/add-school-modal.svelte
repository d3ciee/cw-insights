<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/ui/button';
	import * as Dialog from '$lib/ui/dialog';
	import { Input } from '$lib/ui/input';
	import { Label } from '$lib/ui/label';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { TSchool } from '../../../models/school/school';
	import { Loader2 } from 'lucide-svelte';

	export let open: boolean;
	export let error: string = '';
	let loading: boolean;

	export let onSuccess: (s: TSchool) => void;

	const onSubmit: SubmitFunction = (e) => {
		loading = true;
		return ({ result, formData }) => {
			loading = false;
			console.log(result);
			switch (result.type) {
				case 'error':
				case 'failure':
					error = (result as any).data?.message;
					return;
				case 'success':
					onSuccess((result as any).data);
					open = false;
					return;
			}
		};
	};
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Add school</Dialog.Title>
			<Dialog.Description>Create a new school by adding a name and id</Dialog.Description>
		</Dialog.Header>
		<form use:enhance={onSubmit} action="/dashboard/schools?/create" method="post">
			<div class="grid gap-4 py-4">
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="id" class="text-right">ID</Label>
					<Input id="id" name="id" disabled={loading} placeholder="IST" class="col-span-3" />
				</div>
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="name" class="text-right">NAME</Label>
					<Input
						disabled={loading}
						id="name"
						name="name"
						placeholder="Information, Sciences and Technology"
						class="col-span-3"
					/>
				</div>
			</div>
			<div class="h-6">
				<Label class="font-normal text-red-500">
					{error}
				</Label>
			</div>
			<Dialog.Footer>
				<Button disabled={loading} type="submit">
					{#if loading}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					{/if}
					Save school</Button
				>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
