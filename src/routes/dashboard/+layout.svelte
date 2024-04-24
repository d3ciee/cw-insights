<script lang="ts">
	import type { LayoutData } from './$types';
	import MainNav from './_components/main-nav.svelte';
	import UserNav from './_components/user-nav.svelte';

	export let data: LayoutData;
</script>

<div class="flex-col md:flex">
	<div class="border-b">
		<div class="flex h-16 items-center bg-primary px-4 text-white shadow-sm">
			<!-- <TeamSwitcher /> -->

			<MainNav availableViews={data.availableViews} class="mx-6" />
			<div class="ml-auto flex items-center space-x-4">
				<!-- <Search /> -->
				<UserNav user={data.user} />
			</div>
		</div>
	</div>
	<slot />
</div>
