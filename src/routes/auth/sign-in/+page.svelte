<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/ui/button';
	import { Input } from '$lib/ui/input';
	import { Label } from '$lib/ui/label';
	import { cn } from '$lib/ui/utils';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { Loader2 } from 'lucide-svelte';

	let className: string | undefined | null = undefined;
	export { className as class };

	let error: string = '';

	let isLoading = false;

	const onSubmit: SubmitFunction = (e) => {
		error = '';
		isLoading = true;

		return ({ result }: { result: any }) => {
			isLoading = false;
			console.log(result);
			switch (result.type) {
				case 'redirect':
					location.href = result.location;
					return;
				case 'error':
				case 'failure':
					error = result.data?.message;
					return;
			}
		};
	};
</script>

<div class="lg:p-8">
	<div class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
		<div class="flex flex-col space-y-2 text-center">
			<h1 class="text-2xl font-semibold tracking-tight">Sign into your account</h1>
			<p class="text-sm text-muted-foreground">Enter your hit email below to continue</p>
		</div>
		<div class={cn('grid gap-6', className)} {...$$restProps}>
			<form method="post" use:enhance={onSubmit}>
				<div class="grid min-w-96 gap-2">
					<div class="grid gap-1">
						<Label class="sr-only" for="email">Email</Label>
						<Input
							id="email"
							name="email"
							placeholder="h2xxxxxx@hit.ac.zw"
							type="email"
							autocapitalize="none"
							required
							autocomplete="email"
							autocorrect="off"
							disabled={isLoading}
						/>
					</div>
					<div class="grid gap-1">
						<Label class="sr-only" for="email">Email</Label>
						<Input
							id="password"
							name="password"
							placeholder="********"
							type="password"
							minlength={7}
							autocorrect="off"
							required
							disabled={isLoading}
						/>
					</div>
					<Label class="h-4 font-normal text-red-500">
						{error}
					</Label>
					<Button type="submit" class="mt-6" disabled={isLoading}>
						{#if isLoading}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						{/if}
						Sign In with Email
					</Button>
				</div>
			</form>
		</div>
	</div>
</div>
