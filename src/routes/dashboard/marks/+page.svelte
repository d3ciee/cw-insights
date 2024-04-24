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
	import { string } from 'zod';
	import MarkButton from './_components/mark-button.svelte';

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

	type StudentWithMarks = {
		registrationNumber: string;
		firstName: string;
		lastName: string;
		programId: string;
		enrolledAt: number;
		personalEmail: string;
		year: number;
		semester: number;
		marks: any[];
		assesments: Record<string, any>;
		total: number;
	};

	let confirmDelete: boolean;
	let toBeDeleted: string = '';

	let studentsWithmarks = writable<StudentWithMarks[]>(data.studentsWithAssesmentMarks);

	$: if ($navigating?.complete) {
		if (data.programs) $studentsWithmarks = data.studentsWithAssesmentMarks;
	}

	$: console.log($studentsWithmarks);

	const onDelete = () => {
		$studentsWithmarks = $studentsWithmarks.filter((x) => x.registrationNumber !== toBeDeleted);
	};

	const onAdd = (s: StudentWithMarks) => {
		$studentsWithmarks = [...$studentsWithmarks, s];
	};

	const editMark = () => {};

	const table = createTable(studentsWithmarks, {
		sort: addSortBy({ disableMultiSort: true }),
		page: addPagination(),
		filter: addTableFilter({
			fn: ({ filterValue, value }) => value.includes(filterValue)
		}),
		select: addSelectedRows(),
		hide: addHiddenColumns()
	});

	const genColumns =
		data.assesments?.map((a) =>
			table.column({
				header: a.name,
				accessor: ({ assesments, registrationNumber }) => ({
					assesmentId: a.id,
					registrationNumber,
					mark: assesments[a.id]
				}),

				cell: ({ row, value }, { pluginStates }) => {
					const { getRowState } = pluginStates.select;
					const { isSelected } = getRowState(row);

					return createRender(MarkButton, {
						...value,
						studentsWithmarks
					});
				},
				plugins: {
					filter: {
						exclude: true
					}
				}
			})
		) ?? [];

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
			header: 'Name',
			accessor: ({ firstName, lastName }) => firstName + lastName
		}),
		table.column({
			header: 'Program',
			accessor: ({ programId }) => programId
		}),
		...genColumns,
		table.column({
			header: 'Total',
			accessor: ({ total }) => total + '%'
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
			<h2 class="text-xl font-bold tracking-tight">Marks</h2>
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
				<!-- <Button on:click={() => (isAddassesmentModalOpen = true)}>Add assesment</Button> -->
			</div>
		</div>
		<DataTable {columns} {table} {hideableCols} />
	</div>
	<!-- <AddAssesmentModal
		courses={assignedCourses}
		onSuccess={(s) => onAdd({ ...s })}
		bind:open={isAddassesmentModalOpen}
	/> -->
	<ConfirmDeleteModal
		action="/dashboard/assesments?/delete"
		{onDelete}
		{toBeDeleted}
		bind:open={confirmDelete}
		description={`You are about to delete the school with ID: ${toBeDeleted} `}
	/>
{/if}
