<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/ui/button';
	import * as Dialog from '$lib/ui/dialog';
	import { Input } from '$lib/ui/input';
	import { Label } from '$lib/ui/label';
	import type { SubmitFunction } from '@sveltejs/kit';
	import * as Select from '$lib/ui/select';
	import { Loader2 } from 'lucide-svelte';
	import type { TProgram } from '../../../models/program/program';

	export let open: boolean;
	export let schools: { value: string; label: string }[] = [];
	export let lecturers: { value: string; label: string }[] = [];

	export let error: string = '';
	let loading: boolean;

	export let onSuccess: (s: TProgram) => void;

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
			<Dialog.Title>Add program</Dialog.Title>
			<Dialog.Description>Create a new program by adding the following fields</Dialog.Description>
		</Dialog.Header>
		<form use:enhance={onSubmit} action="/dashboard/programs?/create" method="post">
			<div class="grid gap-4 py-4">
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="id" class="text-right">ID</Label>
					<Input
						id="id"
						name="id"
						disabled={loading}
						placeholder="SE"
						required
						class="col-span-3"
					/>
				</div>

				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="name" class="text-right">NAME</Label>
					<Input
						disabled={loading}
						id="name"
						required
						name="name"
						placeholder="Software Engineerimg"
						class="col-span-3"
					/>
				</div>

				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="numberOfYears" class="text-right">NUMBER OF YEARS</Label>
					<Input
						id="numberOfYears"
						name="numberOfYears"
						disabled={loading}
						type="number"
						required
						class="col-span-3"
					/>
				</div>

				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="name" class="text-right">SCHOOL</Label>
					<Select.Root required>
						<Select.Trigger class="col-span-3">
							<Select.Value placeholder="Select a school" />
						</Select.Trigger>
						<Select.Content>
							<Select.Group>
								<Select.Label>Schools</Select.Label>
								{#if schools}
									{#each schools as s}
										<Select.Item value={s.value} label={s.label}>{s.label}</Select.Item>
									{/each}
								{/if}
							</Select.Group>
						</Select.Content>
						<Select.Input required name="school" />
					</Select.Root>
				</div>

				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="headOfDepartment" class="text-right">HEAD OF DEPARTMENT</Label>
					<Select.Root required>
						<Select.Trigger class="col-span-3">
							<Select.Value placeholder="Select a lecturer" />
						</Select.Trigger>
						<Select.Content>
							<Select.Group>
								<Select.Label>Lecturers</Select.Label>
								{#if lecturers}
									{#each lecturers as l}
										<Select.Item value={l.value} label={l.label}>{l.label}</Select.Item>
									{/each}
								{/if}
							</Select.Group>
						</Select.Content>
						<Select.Input required name="headOfDepartment" />
					</Select.Root>
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
					Save program</Button
				>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
