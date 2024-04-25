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
	import { DataTable } from '$lib/ui/data-table';
	import type { PageData } from './$types';
	import { navigating } from '$app/stores';
	import ViewMarksButton from './_components/delete-session-button.svelte';
	import DeleteSessionButton from './_components/delete-session-button.svelte';

	export let data: PageData;

	let sessions = writable(data.sessions);

	$: if ($navigating?.complete) {
		if (data.sessions) $sessions = data.sessions;
	}

	const table = createTable(sessions, {
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
			header: 'Email',
			id: 'role',
			accessor: ({ user }) => user.email
		}),

		table.column({
			header: 'Logged in at',
			id: 'loggedInAt',
			accessor: ({ loggedInAt }) => new Date(loggedInAt).toLocaleString()
		}),
		table.column({
			header: 'IP Address',
			id: 'ip',
			accessor: ({ ipAddress }) => (ipAddress === '::1' ? 'localhost' : ipAddress)
		}),

		table.column({
			header: 'Browser & OS Details',
			id: 'browser',
			accessor: ({ userAgent }) =>
				` ${userAgent.browser.name} on ${userAgent.os.name} ${userAgent.os.version}`
		}),

		table.column({
			header: 'Actions',
			accessor: (c) => c,
			cell: (item) => {
				return createRender(DeleteSessionButton, {
					sessionId: item.value.sessionId,
					userId: item.value.user.id
				});
			},
			plugins: {
				sort: {
					disable: true
				}
			}
		})
	]);
	const hideableCols = ['loggedInAt', 'browser', 'role', 'userId', 'sessionId', 'ip'];
</script>

<div class="flex-1 space-y-4 p-8 pt-6">
	<div class="flex items-center justify-between space-y-2">
		<h2 class="text-xl font-bold tracking-tight">My marks</h2>
	</div>
	<DataTable {columns} {table} {hideableCols} />
</div>
