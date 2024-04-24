<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/ui/button';
	import * as Dialog from '$lib/ui/dialog';
	import { Input } from '$lib/ui/input';
	import { Label } from '$lib/ui/label';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { Loader2 } from 'lucide-svelte';
	import type { TUserProfileLecturer } from '../../../models/user/user-profile-lecturer';

	export let open: boolean;
	export let error: string = '';
	let loading: boolean;

	export let onSuccess: (s: TUserProfileLecturer) => void;

	const onSubmit: SubmitFunction = (e) => {
		loading = true;
		return ({ result, formData }) => {
			loading = false;
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
			<Dialog.Title>Add lecturer</Dialog.Title>
			<Dialog.Description>Add a new lecturer by entering the following details</Dialog.Description>
		</Dialog.Header>
		<form use:enhance={onSubmit} action="/dashboard/lecturers?/create" method="post">
			<div class="grid gap-4 py-4">
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="employeeNumber" class="text-right">EMPLOYEE NUMBER</Label>
					<Input
						id="employeeNumber"
						name="employeeNumber"
						disabled={loading}
						placeholder="H994E22K"
						class="col-span-3"
					/>
				</div>
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="firstName" class="text-right">FIRST NAME</Label>
					<Input
						disabled={loading}
						id="firstName"
						name="firstName"
						placeholder="John"
						class="col-span-3"
					/>
				</div>
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="lastName" class="text-right">LAST NAME</Label>
					<Input
						disabled={loading}
						id="lastName"
						name="lastName"
						placeholder="Doe"
						class="col-span-3"
					/>
				</div>
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="personalEmail" class="text-right">PERSONAL EMAIL</Label>
					<Input
						disabled={loading}
						id="personalEmail"
						type="email"
						name="personalEmail"
						placeholder="johndoe@gmail.com"
						class="col-span-3"
					/>
				</div>
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="defaultPassword" class="text-right">DEFAULT PASSWORD</Label>
					<Input
						disabled={loading}
						id="defaultPassword"
						type="password"
						name="defaultPassword"
						placeholder="********"
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
					Save lecturer</Button
				>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
