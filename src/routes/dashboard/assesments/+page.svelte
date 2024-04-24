<script lang="ts">
	import { Button } from '$lib/ui/button';
	import { createRender, createTable } from 'svelte-headless-table';
	import {
		addHiddenColumns,
		addPagination,
		addSelectedRows,
		addSortBy,
		addTableFilter
	} from 'svelte-headless-table/plugins';
	import { writable } from 'svelte/store';
	import { DataTable, DataTableCheckbox } from '$lib/ui/data-table';
	import DataTableActions from '$lib/ui/data-table/data-table-actions.svelte';
	import AddCourseModal from '../_components/add-course-modal.svelte';
	import type { PageData } from './$types';
	import { Trash2, Copy, BookOpen, CircleOff, Presentation } from 'lucide-svelte';
	import ConfirmDeleteModal from '../_components/confirm-delete-modal.svelte';

	import * as Select from '$lib/ui/select';
	import { goto } from '$app/navigation';
	import { navigating } from '$app/stores';
	import AddAssesmentModal from '../_components/add-assesment-modal.svelte';

	export let data: PageData;

	const assignedCourses = data.assignedCourses?.map((s) => ({
		value: s.id,
		label: s.name
	}));

	const programs = data.programs?.map((s) => ({
		value: s.id,
		label: s.name
	}));

	const lecturers = data.lecturers?.map((l) => ({
		value: l.employeeNumber,
		label: l.firstName + ' ' + l.lastName
	}));

	type Assesment = {
		id: string;
		name: string;
		createdAt: number;
		weight: number;
		courseId: string;
		due: number;
		assignedAt: number;
	};

	let confirmDelete: boolean;
	let toBeDeleted: string = '';

	let courses = writable<Assesment[]>(data.assesments);

	$: if ($navigating?.complete) {
		if (data.programs) $courses = data.assesments;
	}

	const onDelete = () => {
		$courses = $courses.filter((x) => x.id !== toBeDeleted);
	};

	const onAdd = (s: Assesment) => {
		$courses = [...$courses, s];
	};

	const table = createTable(courses, {
		sort: addSortBy({ disableMultiSort: true }),
		page: addPagination(),
		filter: addTableFilter({
			fn: ({ filterValue, value }) => value.includes(filterValue)
		}),
		select: addSelectedRows(),
		hide: addHiddenColumns()
	});

	const columns = table.createColumns([
		table.column({
			header: (_, { pluginStates }) => {
				const { allPageRowsSelected } = pluginStates.select;
				return createRender(DataTableCheckbox, {
					checked: allPageRowsSelected
				});
			},
			accessor: 'id',
			cell: ({ row }, { pluginStates }) => {
				const { getRowState } = pluginStates.select;
				const { isSelected } = getRowState(row);

				return createRender(DataTableCheckbox, {
					checked: isSelected
				});
			},
			plugins: {
				sort: {
					disable: true
				},
				filter: {
					exclude: true
				}
			}
		}),
		table.column({
			header: 'Name',
			accessor: 'name'
		}),
		table.column({
			header: 'Weight',
			accessor: ({ weight }) => weight
		}),
		table.column({
			header: 'Assigned at',
			accessor: ({ assignedAt }) => new Date(assignedAt).toDateString()
		}),
		table.column({
			header: 'Due',
			accessor: ({ due }) => new Date(due).toDateString()
		}),
		table.column({
			header: 'Actions',
			accessor: ({ id }) => id,
			cell: (item) => {
				return createRender(DataTableActions, {
					id: item.value,
					dropdownItem: [
						{
							type: 'label',
							label: 'Actions'
						},
						{
							type: 'button',
							icon: Copy,
							label: 'Copy ID',
							onClick: () => navigator.clipboard.writeText(item.value)
						},
						{
							type: 'separator'
						},
						{
							type: 'button',
							danger: true,
							label: 'Delete',
							icon: Trash2,
							onClick: () => {
								toBeDeleted = item.value;
								confirmDelete = true;
							}
						}
					]
				});
			},
			plugins: {
				sort: {
					disable: true
				}
			}
		})
	]);
	const hideableCols = ['name', 'createdAt', 'weight', 'courseId', 'due', 'assignedAt'];
	let isAddassesmentModalOpen: boolean = false;
</script>

{#if data.error === 'no_program'}
	<div class="mt-12 flex h-full w-full flex-col items-center justify-center">
		<div class="flex h-min max-w-96 flex-col items-center justify-center text-center">
			<div class="relative mb-6 flex h-36 w-36 items-center justify-center opacity-75">
				<CircleOff class="absolute left-0 top-0 h-36 w-36 stroke-1 opacity-100" />
				<BookOpen class="z-40 h-20 w-20 opacity-100" />
			</div>

			<h1 class="text-xl font-bold tracking-tight">There are no programs</h1>
			<p class="text-muted-foreground">Ask your admin to add a program to continue</p>
		</div>
	</div>
{:else if data.error === 'no_lecturer'}
	<div class="mt-12 flex h-full w-full flex-col items-center justify-center">
		<div class="flex h-min max-w-96 flex-col items-center justify-center text-center">
			<div class="relative mb-6 flex h-36 w-36 items-center justify-center opacity-75">
				<CircleOff class="absolute left-0 top-0 h-36 w-36 stroke-1 opacity-100" />
				<Presentation class="z-40 h-20 w-20 opacity-100" />
			</div>

			<h1 class="text-xl font-bold tracking-tight">There are no lecturers</h1>
			<p class="text-muted-foreground">Ask your admin to add a lecturer to continue</p>
		</div>
	</div>
{:else}
	<div class="flex-1 space-y-4 p-8 pt-6">
		<div class="flex items-center justify-between space-y-2">
			<h2 class="text-xl font-bold tracking-tight">Assesments</h2>
			<div class="flex gap-2">
				<Select.Root selected={{ value: data.currentCourse }}>
					<Select.Trigger value={data.currentCourse}>
						{assignedCourses?.find((s) => s.value === data.currentCourse)?.label}
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<Select.Label>Assigned course</Select.Label>
							{#if assignedCourses}
								{#each assignedCourses as s}
									<Select.Item
										on:click={() => goto('?courseId=' + s.value, {})}
										value={s.value}
										label={s.label}>{s.label}</Select.Item
									>
								{/each}
							{/if}
						</Select.Group>
					</Select.Content>
					<Select.Input name="schoolId" />
				</Select.Root>
				<Button on:click={() => (isAddassesmentModalOpen = true)}>Add assesment</Button>
			</div>
		</div>
		<DataTable {columns} {table} {hideableCols} />
	</div>
	<AddAssesmentModal
		courses={assignedCourses}
		onSuccess={(s) => onAdd({ ...s })}
		bind:open={isAddassesmentModalOpen}
	/>
	<ConfirmDeleteModal
		action="/dashboard/assesments?/delete"
		{onDelete}
		{toBeDeleted}
		bind:open={confirmDelete}
		description={`You are about to delete the school with ID: ${toBeDeleted} `}
	/>
{/if}
