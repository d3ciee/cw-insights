<script lang="ts">
	import { Button } from '$lib/ui/button';
	import * as DropdownMenu from '$lib/ui/dropdown-menu';
	import * as Avatar from '$lib/ui/avatar';
	import type { TUser } from '../../../models/user/user';

	export let user: Omit<TUser, 'passwordHash'> | null;
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button
			variant="secondary"
			builders={[builder]}
			class="dark relative h-min gap-2 rounded-full p-1 pl-4"
		>
			<div class="flex flex-col text-left opacity-90">
				<span> {user?.email} </span>
			</div>
			<Avatar.Root class="dark h-6 w-6">
				<Avatar.Image src="/avatars/01.png" alt="@shadcn" />
				<Avatar.Fallback class="bg-slate-700 text-xs">
					{user?.email.slice(0, 2).toUpperCase()}
				</Avatar.Fallback>
			</Avatar.Root>
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-56" align="end">
		<DropdownMenu.Label class="font-normal">
			<div class="flex flex-col space-y-1">
				<p class="text-sm font-medium leading-none">
					{user?.email}
				</p>
				<p class="text-xs capitalize leading-none text-muted-foreground">
					{user?.role}
				</p>
			</div>
		</DropdownMenu.Label>
		<DropdownMenu.Separator />
		<DropdownMenu.Group>
			<DropdownMenu.Item data-sveltekit-preload-data="off" href="/auth/sign-out"
				>Log out</DropdownMenu.Item
			>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
