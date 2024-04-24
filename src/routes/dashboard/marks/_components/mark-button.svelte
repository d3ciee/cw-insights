<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, buttonVariants } from '$lib/ui/button';
	import * as Dialog from '$lib/ui/dialog';
	import { Input } from '$lib/ui/input';
	import { Loader2 } from 'lucide-svelte';
	import type { PageData } from '../$types';
	import type { Writable } from 'svelte/store';
	import { goto } from '$app/navigation';

	// {
	// 	id: string;
	// 	name: string;
	// 	createdAt: number;
	// 	weight: number;
	// 	courseId: string;
	// 	due: number;
	// 	assignedAt: number;
	// 	mark: number;
	// }

	export let mark: any = 0;
	export let assesmentId: string;
	export let registrationNumber: string;

	export let studentsWithmarks: Writable<
		{
			registrationNumber: string;
			firstName: string;
			lastName: string;
			programId: string;
			enrolledAt: number;
			personalEmail: string;
			year: number;
			semester: number;
			marks: any[];
			assesments: Record<string, any>;
			total: number;
		}[]
	>;

	let loading: boolean = false;
	let open: boolean;

	const onSubmit = () => {
		loading = true;
		return () => {
			loading = false;
			open = false;

			goto('?', {
				invalidateAll: true
			});
		};
	};
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger class={buttonVariants({ variant: 'secondary', size: 'sm' })}>
		{mark.mark}%
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-[425px]">
		<form use:enhance={onSubmit} action="/dashboard/marks?/create" method="post">
			<input type="hidden" name="studentId" bind:value={registrationNumber} />
			<input type="hidden" name="assesmentId" bind:value={assesmentId} />
			<Dialog.Header>
				<Dialog.Title>Edit mark</Dialog.Title>
			</Dialog.Header>
			<div class="grid gap-4 py-4">
				<div class="grid grid-cols-4 items-center gap-4">
					<Input
						disabled={loading}
						max="100"
						min="0"
						name="mark"
						bind:value={mark.mark}
						id="mark"
						type={'number'}
						class="col-span-3"
					/> %
				</div>
			</div>
			<Dialog.Footer>
				<Button disabled={loading} type="submit">
					{#if loading}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					{/if}
					Save changes</Button
				>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
