<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Pagination, type LinkType, PaginationItem } from 'flowbite-svelte';

	export let data: any;

	export let isFirstPage: boolean;
	export let isLastPage: boolean;
	export let pageIndex: number;

	// $: activeUrl = $page.url.searchParams.get('page');
	let pagedIndices: number[] = [pageIndex];

	const totalPage = data.totalPages;

	for (let index = 0; index < 3; index++) {
		const prev = pagedIndices[0] - 1;
		if (prev > 0) {
			pagedIndices = [prev, ...pagedIndices];
		}
		const next = pagedIndices[pagedIndices.length - 1] + 1;
		if (next <= totalPage) {
			pagedIndices = [...pagedIndices, next];
		}
	}

	let pages: Array<LinkType> = [];
	pagedIndices.forEach((v) => {
		pages.push({
			active: pageIndex == v,
			name: `${v}`,
			href: `${page.url.pathname}?page=${v}`
		});
	});

	const previous = () => {
		if (!isFirstPage) {
			// alert('Prev btn clicked. Make a call to your server to fetch data.');
			// page.url.searchParams.set('page', `${pageIndex - 1}`);
			// goto(`?${page.url.searchParams.toString()}`);
			goto(`${page.url.pathname}?page=${pageIndex - 1}`);
		}
	};
	const next = () => {
		// !isLastPage && goto(`${page.url.pathname}?page=${pageIndex + 1}`);
		if (!isLastPage) {
			// alert('Next btn clicked. Make a call to your server to fetch data.');
			// page.url.searchParams.set('page', `${pageIndex + 1}`);
			// goto(`?${page.url.searchParams.toString()}`);
			goto(`${page.url.pathname}?page=${pageIndex + 1}`);
		}
	};
</script>

<Pagination {pages} large on:previous={previous} on:next={next}></Pagination>
