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

	type School = {
		id: string;
		name: string;
		createdAt: number;
		numberOfPrograms: number;
		numberOfStudents: number;
	};

	let confirmDelete: boolean;
	let toBeDeleted: string = '';

	export let data: PageData;
	console.log(data);
	let schools = writable<School[]>(data.schools);

	const onDelete = () => {
		$schools = $schools.filter((x) => x.id !== toBeDeleted);
	};

	const onAdd = (s: School) => {
		$schools = [...$schools, s];
	};

	const table = createTable(schools, {
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
			header: '#Programs',
			accessor: 'numberOfPrograms'
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
	const hideableCols = ['name', 'numberOfPrograms', 'numberOfStudents'];
	let isAddSchoolModalOpen: boolean = false;
</script>

<div class="flex-1 space-y-4 p-8 pt-6">
	<div class="flex items-center justify-between space-y-2">
		<h2 class="text-xl font-bold tracking-tight">Schools</h2>
		<Button on:click={() => (isAddSchoolModalOpen = true)}>Add school</Button>
	</div>
	<DataTable {columns} {table} {hideableCols} />
</div>
<AddSchoolModal
	onSuccess={(s) => onAdd({ ...s, numberOfPrograms: 0, numberOfStudents: 0 })}
	bind:open={isAddSchoolModalOpen}
/>
<ConfirmDeleteModal
	action="/dashboard/schools?/delete"
	{onDelete}
	{toBeDeleted}
	bind:open={confirmDelete}
	description={`You are about to delete the school with ID: ${toBeDeleted} `}
/>
