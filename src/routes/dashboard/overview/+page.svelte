<script lang="ts">
	import * as Card from '$lib/ui/card';
	import { School, BookOpen, Presentation, GraduationCap } from 'lucide-svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="flex-1 space-y-4 p-8 pt-6">
	<div class="flex items-center justify-between space-y-2">
		<h2 class="text-xl font-bold tracking-tight">Overview</h2>
	</div>
	<div class="space-y-4">
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			<Card.Root class="rounded-none p-0">
				<Card.Header class="flex flex-row items-center justify-between space-y-0 px-4 pb-0 pt-4">
					<Card.Title class="text-sm font-medium">Schools</Card.Title>
					<School class="h-4 w-4 text-muted-foreground" />
				</Card.Header>
				<Card.Content class="px-4 pt-0">
					<div class="text-xl font-bold">{data.totals.schools}</div>
				</Card.Content>
				<Card.Footer
					class="flex h-9 items-center bg-primary p-0 px-4 text-center font-medium text-white"
				>
					<a href="/dashboard/schools"> Goto schools</a>
				</Card.Footer>
			</Card.Root>

			<Card.Root class="rounded-none p-0">
				<Card.Header class="flex flex-row items-center justify-between space-y-0 px-4 pb-0 pt-4">
					<Card.Title class="text-sm font-medium">Programs</Card.Title>
					<BookOpen class="h-4 w-4 text-muted-foreground" />
				</Card.Header>
				<Card.Content class="px-4 pt-0">
					<div class="text-xl font-bold">{data.totals.programs}</div>
				</Card.Content>
				<Card.Footer
					class="flex h-9 items-center bg-primary p-0 px-4 text-center font-medium text-white"
				>
					<a href="/dashboard/programs"> Goto programs</a>
				</Card.Footer>
			</Card.Root>

			<Card.Root class="rounded-none p-0">
				<Card.Header class="flex flex-row items-center justify-between space-y-0 px-4 pb-0 pt-4">
					<Card.Title class="text-sm font-medium">Lecturers</Card.Title>
					<Presentation class="h-4 w-4 text-muted-foreground" />
				</Card.Header>
				<Card.Content class="px-4 pt-0">
					<div class="text-xl font-bold">{data.totals.lecturers}</div>
				</Card.Content>
				<Card.Footer
					class="flex h-9 items-center bg-primary p-0 px-4 text-center font-medium text-white"
				>
					<a href="/dashboard/lecturers"> Goto lecturers</a>
				</Card.Footer>
			</Card.Root>

			<Card.Root class="rounded-none p-0">
				<Card.Header class="flex flex-row items-center justify-between space-y-0 px-4 pb-0 pt-4">
					<Card.Title class="text-sm font-medium">Students</Card.Title>
					<Presentation class="h-4 w-4 text-muted-foreground" />
				</Card.Header>
				<Card.Content class="px-4 pt-0">
					<div class="text-xl font-bold">{data.totals.students}</div>
				</Card.Content>
				<Card.Footer
					class="flex h-9 items-center bg-primary p-0 px-4 text-center font-medium text-white"
				>
					<a href="/dashboard/students"> Goto students</a>
				</Card.Footer>
			</Card.Root>
		</div>
	</div>
</div>
