<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/ui/button';
	import * as Dialog from '$lib/ui/dialog';
	import { Input } from '$lib/ui/input';
	import { Label } from '$lib/ui/label';
	import type { SubmitFunction } from '@sveltejs/kit';
	import * as Select from '$lib/ui/select';
	import { Loader2 } from 'lucide-svelte';
	import type { TCourse } from '../../../models/course/course';
	import type { TAssesment } from '../../../models/assesment/assesment';

	export let open: boolean;
	export let courses: { value: string; label: string }[] = [];

	export let error: string = '';
	let loading: boolean;

	export let onSuccess: (c: TAssesment) => void;

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
					onSuccess({ ...(result as any).data, schoolId: (result as any).data.school });
					open = false;
					return;
			}
		};
	};
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Add assesment</Dialog.Title>
			<Dialog.Description>Add a new assesment by adding the following fields</Dialog.Description>
		</Dialog.Header>

		<form use:enhance={onSubmit} action="/dashboard/assesments?/create" method="post">
			<div class="grid gap-4 py-4">
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="weight" class="text-right">WEIGHT</Label>
					<Input
						id="weight"
						name="weight"
						disabled={loading}
						type="number"
						required
						class="col-span-3"
					/>
				</div>
				<Label for="weight" class="-mt-2 text-xs font-normal italic text-secondary-foreground">
					NB: Weight is divided by the total of all the other assesment weights in the course
				</Label>

				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="name" class="text-right">NAME</Label>
					<Input
						disabled={loading}
						id="name"
						required
						name="name"
						placeholder="Test 1"
						class="col-span-3"
					/>
				</div>

				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="courseId" class="text-right">COURSE</Label>
					<Select.Root required>
						<Select.Trigger class="col-span-3">
							<Select.Value placeholder="Select a program" />
						</Select.Trigger>
						<Select.Content>
							<Select.Group>
								<Select.Label>COURSES</Select.Label>
								{#if courses}
									{#each courses as p}
										<Select.Item value={p.value} label={p.label}>{p.label}</Select.Item>
									{/each}
								{/if}
							</Select.Group>
						</Select.Content>
						<Select.Input required name="courseId" />
					</Select.Root>
				</div>

				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="assignedAt" class="text-right">ASSIGNED AT</Label>
					<Input
						id="assignedAt"
						name="assignedAt"
						disabled={loading}
						type="datetime-local"
						required
						max="2"
						class="col-span-3"
					/>
				</div>
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="due" class="text-right">DUE AT</Label>
					<Input
						id="due"
						name="due"
						disabled={loading}
						type="datetime-local"
						required
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
					Save assesment</Button
				>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
