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
	import { readable, writable } from 'svelte/store';
	import { DataTable, DataTableCheckbox } from '$lib/ui/data-table';
	import DataTableActions from '$lib/ui/data-table/data-table-actions.svelte';
	import AddSchoolModal from '../_components/add-school-modal.svelte';
	import type { PageData } from './$types';
	import { Trash2, Copy } from 'lucide-svelte';
	import ConfirmDeleteModal from '../_components/confirm-delete-modal.svelte';
	import AddLecturerModal from '../_components/add-lecturer-modal.svelte';

	type Lecturer = {
		employeeNumber: string;
		firstName: string;
		lastName: string;
		personalEmail: string;
	};

	let confirmDelete: boolean;
	let toBeDeleted: string = '';

	export let data: PageData;
	let lecturers = writable<Lecturer[]>(data.lecturers);

	const onDelete = () => {
		$lecturers = $lecturers.filter((x) => x.employeeNumber !== toBeDeleted);
	};

	const onAdd = (s: Lecturer) => {
		$lecturers = [...$lecturers, s];
	};

	const table = createTable(lecturers, {
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
			accessor: 'employeeNumber',
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
			header: 'Employee#',
			accessor: ({ employeeNumber }) => employeeNumber
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
			header: 'Email',
			accessor: 'personalEmail'
		}),
		table.column({
			header: 'Actions',
			accessor: ({ employeeNumber }) => employeeNumber,
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
	const hideableCols = ['name', 'numberOfPrograms', 'numberOfStudents'];
	let isAddSchoolModalOpen: boolean = false;
</script>

<div class="flex-1 space-y-4 p-8 pt-6">
	<div class="flex items-center justify-between space-y-2">
		<h2 class="text-xl font-bold tracking-tight">Lecturers</h2>
		<Button on:click={() => (isAddSchoolModalOpen = true)}>Add lecturer</Button>
	</div>
	<DataTable {columns} {table} {hideableCols} />
</div>
<AddLecturerModal onSuccess={(s) => onAdd({ ...s })} bind:open={isAddSchoolModalOpen} />
<ConfirmDeleteModal
	action="/dashboard/lecturers?/delete"
	{onDelete}
	{toBeDeleted}
	bind:open={confirmDelete}
	description={`You are about to delete the lecturer with ID: ${toBeDeleted} `}
/>
