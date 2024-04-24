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
	import AddProgramModal from '../_components/add-program-modal.svelte';
	import type { PageData } from './$types';
	import { Trash2, Copy, SchoolIcon, CircleOff, Presentation } from 'lucide-svelte';
	import ConfirmDeleteModal from '../_components/confirm-delete-modal.svelte';

	import * as Select from '$lib/ui/select';
	import { goto } from '$app/navigation';
	import { navigating } from '$app/stores';
	export let data: PageData;
	$: console.log(data);

	const schools = data.schools?.map((s) => ({
		value: s.id,
		label: s.name
	}));

	const lecturers = data.lecturers?.map((l) => ({
		value: l.employeeNumber,
		label: l.firstName + ' ' + l.lastName
	}));

	type Program = {
		id: string;
		name: string;
		numberOfYears: number;
		schoolId: string;
		headOfDepartment: string;
		numberOfStudents: number;
		numberOfCourses: number;
	};

	let confirmDelete: boolean;
	let toBeDeleted: string = '';

	let programs = writable<Program[]>(data.programs);

	$: if ($navigating?.complete) {
		if (data.programs) $programs = data.programs;
	}

	const onDelete = () => {
		$programs = $programs.filter((x) => x.id !== toBeDeleted);
	};

	const onAdd = (s: Program) => {
		// goto('?schoolId=' + s.schoolId);
		$programs = [...$programs, s];
	};

	const table = createTable(programs, {
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
			header: 'ID',
			accessor: ({ id }) => id
		}),
		table.column({
			header: 'Name',
			accessor: 'name'
		}),
		table.column({
			header: 'Head of Department',
			accessor: 'headOfDepartment'
		}),
		table.column({
			header: '#Years',
			accessor: 'numberOfYears'
		}),
		table.column({
			header: '#Courses',
			accessor: 'numberOfCourses'
		}),
		table.column({
			header: '#Students',
			accessor: 'numberOfStudents'
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
	const hideableCols = ['name', 'numberOfCourses', 'numberOfYears', 'numberOfStudents'];
	let isAddSchoolModalOpen: boolean = false;
</script>

{#if data.error === 'no_school'}
	<div class="mt-12 flex h-full w-full flex-col items-center justify-center">
		<div class="flex h-min max-w-96 flex-col items-center justify-center text-center">
			<div class="relative mb-6 flex h-36 w-36 items-center justify-center opacity-75">
				<CircleOff class="absolute left-0 top-0 h-36 w-36 stroke-1 opacity-100" />
				<SchoolIcon class="z-40 h-20 w-20 opacity-100" />
			</div>

			<h1 class="text-xl font-bold tracking-tight">There are no schools</h1>
			<p class="text-muted-foreground">
				Start by adding a school from the school dashboard to create and view programs
			</p>
			<Button class="mt-6" href="/dashboard/schools">Goto school dashboard</Button>
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
			<p class="text-muted-foreground">
				Start by adding a lecturer to assign as head of department from the lecturers dashboard to
				create and view programs
			</p>
			<Button class="mt-6" href="/dashboard/lecturers">Goto lecturers dashboard</Button>
		</div>
	</div>
{:else}
	<div class="flex-1 space-y-4 p-8 pt-6">
		<div class="flex items-center justify-between space-y-2">
			<h2 class="text-xl font-bold tracking-tight">Programs</h2>
			<div class="flex gap-2">
				<Select.Root selected={{ value: data.currentSchool }}>
					<Select.Trigger value={data.currentSchool}>
						{schools?.find((s) => s.value === data.currentSchool)?.label}
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<Select.Label>Schools</Select.Label>
							{#if schools}
								{#each schools as s}
									<Select.Item
										on:click={() => goto('?schoolId=' + s.value, {})}
										value={s.value}
										label={s.label}>{s.label}</Select.Item
									>
								{/each}
							{/if}
						</Select.Group>
					</Select.Content>
					<Select.Input name="schoolId" />
				</Select.Root>
				<Button on:click={() => (isAddSchoolModalOpen = true)}>Add program</Button>
			</div>
		</div>
		<DataTable {columns} {table} {hideableCols} />
	</div>
	<AddProgramModal
		{schools}
		{lecturers}
		onSuccess={(s) => onAdd({ ...s, numberOfCourses: 0, numberOfStudents: 0 })}
		bind:open={isAddSchoolModalOpen}
	/>
	<ConfirmDeleteModal
		action="/dashboard/programs?/delete"
		{onDelete}
		{toBeDeleted}
		bind:open={confirmDelete}
		description={`You are about to delete the school with ID: ${toBeDeleted} `}
	/>
{/if}
