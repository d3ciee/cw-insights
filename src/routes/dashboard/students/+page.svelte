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
	import type { PageData } from './$types';
	import { Trash2, Copy } from 'lucide-svelte';
	import ConfirmDeleteModal from '../_components/confirm-delete-modal.svelte';
	import AddStudentModal from '../_components/add-student-modal.svelte';

	type Student = {
		registrationNumber: string;
		firstName: string;
		lastName: string;
		programId: string;
		personalEmail: string;
		year: number;
		semester: number;
	};

	let confirmDelete: boolean;
	let toBeDeleted: string = '';

	export let data: PageData;

	const programs = data.programs.map((p) => ({ value: p.id, label: p.name }));

	let students = writable<Student[]>(data.students);

	const onDelete = () => {
		$students = $students.filter((x) => x.registrationNumber !== toBeDeleted);
	};

	const onAdd = (s: Student) => {
		$students = [...$students, s];
	};

	const table = createTable(students, {
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
			accessor: 'registrationNumber',
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
			header: 'Registration#',
			accessor: ({ registrationNumber }) => registrationNumber
		}),
		table.column({
			header: 'First name',
			accessor: 'firstName'
		}),
		table.column({
			header: 'Last name',
			accessor: 'lastName'
		}),
		table.column({
			header: 'Program',
			accessor: 'programId'
		}),
		table.column({
			header: 'Email',
			accessor: 'personalEmail'
		}),
		table.column({
			header: 'Year',
			accessor: 'year'
		}),
		table.column({
			header: 'Semester',
			accessor: 'semester'
		}),
		table.column({
			header: 'Actions',
			accessor: ({ registrationNumber }) => registrationNumber,
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
	const hideableCols = ['firstName', 'lastName', 'programId', 'personalEmail', 'year', 'semester'];
	let isAddSchoolModalOpen: boolean = false;
</script>

<div class="flex-1 space-y-4 p-8 pt-6">
	<div class="flex items-center justify-between space-y-2">
		<h2 class="text-xl font-bold tracking-tight">Students</h2>
		<Button on:click={() => (isAddSchoolModalOpen = true)}>Add student</Button>
	</div>
	<DataTable {columns} {table} {hideableCols} />
</div>
<AddStudentModal {programs} onSuccess={(s) => onAdd({ ...s })} bind:open={isAddSchoolModalOpen} />
<ConfirmDeleteModal
	action="/dashboard/students?/delete"
	{onDelete}
	{toBeDeleted}
	bind:open={confirmDelete}
	description={`You are about to delete the student with ID: ${toBeDeleted} `}
/>
