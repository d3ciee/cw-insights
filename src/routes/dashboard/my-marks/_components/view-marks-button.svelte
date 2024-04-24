<script lang="ts">
	import { buttonVariants } from '$lib/ui/button';
	import * as Dialog from '$lib/ui/dialog';
	import { Input } from '$lib/ui/input';

	export let marks: { mark: number; name: string }[] = [];
	export let courseName: string;
</script>

<Dialog.Root>
	<Dialog.Trigger class={buttonVariants({ variant: 'default', size: 'sm' })}>
		Show marks
	</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>My marks for {courseName}</Dialog.Title>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			{#each marks as m}
				<div class="grid grid-cols-4 items-center gap-4">
					<Input disabled value={m.name} type={'text'} class="col-span-2" />
					<Input disabled value={m.mark} type={'number'} class="col-span-2" />
				</div>
			{/each}
		</div>
	</Dialog.Content>
</Dialog.Root>
