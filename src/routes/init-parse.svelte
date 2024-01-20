<script lang="ts">
	import { createGroups, findSameNames } from '$lib/helpers/sorter.js';
import type { Dancer, RoughGroup } from './../../types.js';
	import {
		Button,
		ButtonGroup,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import { onMount } from 'svelte';

	export let data: Dancer[] | null;
	export let files;
    export let isVerified: boolean;
    export let groups: RoughGroup[];
    export let duplicateNames: string[] = [];

	let showableItems: Dancer[] = [];
	let showing = {
		start: 0,
		end: 0,
		total: 0
	};

	onMount(() => {
        if (data) {
            if (data.length > 15) {
                showing = {
                    start: 0,
                    end: 15,
                    total: data.length
                };
            } else {
                showing = {
                    start: 0,
                    end: data.length,
                    total: data.length
                };
            }
            showableItems = data.slice(showing.start, showing.end);
        }
	});

	const paginateForward = () => {
        if (data) {
            if (showing.end + 15 > data.length) {
                showing = {
                    start: showing.end,
                    end: data.length,
                    total: data.length
                };
            } else {
                showing = {
                    start: showing.end,
                    end: showing.end + 15,
                    total: data.length
                };
            }
    
            showableItems = data.slice(showing.start, showing.end);
    
            if (showableItems.length === 0) {
                paginateBackward();
            }
        }
	};

	const paginateBackward = () => {
        if (data) {
            if (showing.start - 15 < 0) {
                showing = {
                    start: 0,
                    end: 15,
                    total: data.length
                };
            } else {
                showing = {
                    start: showing.start - 15,
                    end: showing.start,
                    total: data.length
                };
            }
    
            showableItems = data.slice(showing.start, showing.end);
    
            if (showableItems.length === 0) {
                paginateForward();
            }
        }
	};
</script>

<div class="flex flex-col gap-4">
	<div class="w-full flex justify-between items-center">
		<Button
            class="w-40"
			on:click={() => {
				(data = null), (files = undefined);
			}}>Go Back</Button
		>
		<p class="flex-1 text-center">Please verify the information!</p>
		<Button
            class="w-40"
            color="blue"
			on:click={() => {
                if (data) {
					groups = createGroups(data);
					duplicateNames = Object.keys(findSameNames(groups));
                }
				isVerified = true;
			}}>Looks Good!</Button
		>
	</div>
	<div class="rounded-lg overflow-hidden">
		<Table color="green" striped shadow hoverable>
			<TableHead>
				<TableHeadCell>Name</TableHeadCell>
				<TableHeadCell>Age</TableHeadCell>
				<TableHeadCell>Level</TableHeadCell>
				<TableHeadCell>Discipline</TableHeadCell>
				<TableHeadCell>Perf/Comp</TableHeadCell>
				<TableHeadCell>Group</TableHeadCell>
				<TableHeadCell>Number of Dancers</TableHeadCell>
				<TableHeadCell>Dancers</TableHeadCell>
				<TableHeadCell>Studio</TableHeadCell>
			</TableHead>
			<TableBody tableBodyClass="divide-y">
				{#each showableItems as { age, dancers_names, discipline, group, level, name, perf_comp, studio }}
					<TableBodyRow>
						<TableBodyCell tdClass="px-6 py-4 text-sm">{name}</TableBodyCell>
						<TableBodyCell tdClass="px-6 py-4 text-sm">{age}</TableBodyCell>
						<TableBodyCell tdClass="px-6 py-4 text-sm">{level}</TableBodyCell>
						<TableBodyCell tdClass="px-6 py-4 text-sm">{discipline}</TableBodyCell>
						<TableBodyCell tdClass="px-6 py-4 text-sm">{perf_comp}</TableBodyCell>
						<TableBodyCell tdClass="px-6 py-4 text-sm">{group}</TableBodyCell>
						<TableBodyCell tdClass="px-6 py-4 text-sm"
							>{dancers_names ? dancers_names.split(',').length : 'Unknown'}</TableBodyCell
						>
						<TableBodyCell
							class="whitespace-normal max-w-xl"
							tdClass="px-6 py-4 text-sm whitespace-normal">{dancers_names ?? "Unknown"}</TableBodyCell
						>
						<TableBodyCell tdClass="px-6 py-4 text-sm">{studio}</TableBodyCell>
					</TableBodyRow>
				{/each}
			</TableBody>
		</Table>
	</div>
</div>
<div class="absolute bottom-4 flex flex-col items-center justify-center gap-2">
	<div class="text-sm text-gray-700 dark:text-gray-400">
		Showing <span class="font-semibold text-gray-500">{showing.start + 1}</span>
		to
		<span class="font-semibold text-gray-500">{showing.end}</span>
		of
		<span class="font-semibold text-gray-500">{showing.total}</span>
		Entries
	</div>

	<ButtonGroup>
		<Button on:click={paginateBackward}>Prev</Button>
		<Button on:click={paginateForward}>Next</Button>
	</ButtonGroup>
</div>
