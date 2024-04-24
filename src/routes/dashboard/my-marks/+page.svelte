<script lang="ts">
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
	import type { PageData } from './$types';
	import { navigating } from '$app/stores';
	import ViewMarksButton from './_components/view-marks-button.svelte';

	export let data: PageData;

	type CourseworkMarks = {
		id: string;
		name: string;
		classAvarage: number;
		lecturer: string;
		total: number;
		programId: string;
		marks: { mark: number; name: string }[];
	};

	let studentsWithmarks = writable<CourseworkMarks[]>(data.courseworkMarks);

	$: if ($navigating?.complete) {
		if (data.courseworkMarks) $studentsWithmarks = data.courseworkMarks;
	}

	const table = createTable(studentsWithmarks, {
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
			header: 'Course',
			accessor: ({ name, id }) => id + ' - ' + name
		}),
		table.column({
			header: 'Lecturer',
			accessor: ({ lecturer }) => lecturer
		}),

		table.column({
			header: 'My mark',
			accessor: ({ total }) => total.toFixed(1) + '%'
		}),

		table.column({
			header: 'Class avarage',
			accessor: ({ classAvarage }) => classAvarage.toFixed(1) + '%'
		}),

		table.column({
			header: 'Actions',
			accessor: (c) => c,
			cell: (item) => {
				return createRender(ViewMarksButton, {
					marks: item.value.marks,
					courseName: item.value.name
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
</script>

<div class="flex-1 space-y-4 p-8 pt-6">
	<div class="flex items-center justify-between space-y-2">
		<h2 class="text-xl font-bold tracking-tight">My marks</h2>
	</div>
	<DataTable {columns} {table} {hideableCols} />
</div>
