<script lang="ts">
	import { MoreVertical } from 'lucide-svelte';
	import { Button } from '$lib/ui/button';
	import * as DropdownMenu from '$lib/ui/dropdown-menu';
	import { twMerge } from 'tailwind-merge';
	export let id: string;

	type DropdownItem =
		| {
				type: 'button';
				icon: any;
				label: any;
				danger?: boolean;
				onClick: () => void;
		  }
		| {
				type: 'separator';
		  }
		| {
				type: 'label';
				label: string;
		  };

	export let dropdownItem: DropdownItem[] = [];
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button variant="ghost" builders={[builder]} class="relative h-8 w-8 p-0">
			<span class="sr-only">Open menu</span>
			<MoreVertical class="h-4 w-4" />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		{#each dropdownItem as d}
			{#if d.type === 'label'}
				<DropdownMenu.Label>{d.label}</DropdownMenu.Label>
			{:else if d.type === 'separator'}
				<DropdownMenu.Separator />
			{:else if d.type === 'button'}
				<DropdownMenu.Item on:click={d.onClick} class={twMerge(d.danger && '!text-red-500')}>
					<svelte:component this={d.icon} class="mr-2 h-4 w-4" />
					{d.label}
				</DropdownMenu.Item>
			{/if}
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
