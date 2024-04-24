<script lang="ts">
	import type { Writable } from 'svelte/store';
	import { Checkbox } from '$lib/ui/checkbox';

	export let checked: Writable<boolean>;
</script>

<Checkbox bind:checked={$checked} />
