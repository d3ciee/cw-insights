<script lang="ts">
	import { cn } from '$lib/ui/utils';
	import { page } from '$app/stores';
	import { twMerge } from 'tailwind-merge';
	import type { TUser } from '../../../models/user/user';

	export let availableViews: DashboardView[] | undefined;
	let className: string | undefined | null = undefined;

	$: currentPage = $page.url.pathname.split('/')[2];

	export { className as class };
</script>

{#if availableViews}
	<nav class={cn('flex items-center space-x-4 lg:space-x-6', className)}>
		{#each availableViews as v}
			<a
				href={`/dashboard/${v.path}`}
				class={twMerge(
					'text-sm font-medium opacity-60 transition-opacity hover:opacity-100',
					currentPage == v.path && 'opacity-100'
				)}
			>
				{v.label}
			</a>
		{/each}
	</nav>
{/if}
