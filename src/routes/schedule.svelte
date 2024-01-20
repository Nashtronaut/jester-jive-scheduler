<script lang="ts">
	import { Button, Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell } from "flowbite-svelte";
	import type { RoughGroup } from "../../types";
	import { checkNames } from "$lib/helpers/sorter";
	import { onMount } from "svelte";

    export let groups: RoughGroup[];
    export let isVerified: boolean;
    export let duplicateNames: string[];

    let groupsWithDancers: RoughGroup[] = [];

    onMount(() => {
        groupsWithDancers = groups.filter(group => group.dancers.length !== 0);
    })
</script>

<div class="">
    <div class="flex justify-between items-end py-10">
        <Button class="w-30" on:click={() => isVerified = false}>GO BACK</Button>
        <div class="flex flex-col gap-4">
            <p class="text-3xl text-center">Suggested Groupings</p>
            <div class="flex flex-col gap-1 text-base">
                <p>Please note, the presented schedule may not be perfect. It is recommended to review the suggestions.</p>
                <p>Groups listed in <span class="text-purple-500">PURPLE</span> should be carefully checked, as this means duplicate dancers were detected </p>    
            </div>
        </div>
        <Button class="w-30"  color="blue" on:click={() => isVerified = false}>EXPORT TO CSV</Button>
    </div>
    <div class="flex flex-col gap-14">
        {#each groupsWithDancers as { category, size, level, dancers }, index}
        {#if dancers.length !== 0}
            <div class="mt-8">
                <p class="text-2xl text-center font-bold">Group {index + 1}</p>
                <div class="flex items-center justify-between bg-green-900 gap-2 w-full my-2 py-4 px-6 rounded-lg">
                    <p class="text-xl text-center font-bold"><span class="text-gray-400 font-normal">Category:</span> {category}</p>
                    <p class="text-xl text-center font-bold"><span class="text-gray-400 font-normal">Size:</span> {size.slice(0, 1).toUpperCase() + size.slice(1, size.length)}</p>
                    <p class="text-xl text-center font-bold"><span class="text-gray-400 font-normal">Levels:</span> {level.join(', ')}</p>
                    <p class="text-xl text-center font-bold"><span class="text-gray-400 font-normal">Group Count:</span> {dancers.length}</p>
                </div>
                    <Table color={`${category === 'unplaceable' ? "red" : "green"}`} striped shadow hoverable>
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
                            {#each dancers as { age, dancers_names, discipline, group, level, name, perf_comp, studio }}
                                <TableBodyRow color={`${checkNames(dancers_names, duplicateNames) ? 'purple' : 'green'}`}>
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
            {/if}
        {/each}
    </div>

    <button on:click={() => groups = []}>Export</button>
</div>