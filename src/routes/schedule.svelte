<script lang="ts">
	import { open } from '@tauri-apps/api/shell';
	import {
		Button,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import type { RoughGroup } from '../../types';
	import { checkNames } from '$lib/helpers/sorter';
	import { onMount } from 'svelte';
	import { writeSchedule } from '$lib/helpers/writer';
	import { appDataDir } from '@tauri-apps/api/path';

	export let groups: RoughGroup[];
	export let isVerified: boolean;
	export let duplicateNames: string[];

	let placeables: RoughGroup[] = [];
	let unplaceables: RoughGroup[] = [];

	onMount(() => {
		unplaceables = groups.filter((group) => group.size === 'unplaceable');
		placeables = groups.filter((group) => group.size !== 'unplaceable');

        [unplaceables, placeables] = addGroupNumbers(unplaceables, placeables);
	});

    const addGroupNumbers = (unplaceables, placeables) =>  {
        let group_number = 1;

        for (let category of unplaceables) {
            for (let group of category.dancers) {
                group.group_number = group_number;
                group_number++;
            }
        }
        for (let category of placeables) {
            for (let group of category.dancers) {
                group.group_number = group_number;
                group_number++;
            }
        }

        return [unplaceables, placeables];
    };
</script>

<div class="">
	<div class="flex justify-between items-end py-10">
		<Button class="w-30" on:click={() => (isVerified = false)}>GO BACK</Button>
		<div class="flex flex-col gap-4">
			<p class="text-3xl text-center">Suggested Groupings</p>
			<div class="flex flex-col items-center gap-1 text-base">
				<p>
					Please note, the presented schedule may not be perfect. It is recommended to review the
					suggestions.
				</p>
				<p>
					Groups listed in <span class="text-purple-500">PURPLE</span> should be carefully checked, as
					this means duplicate dancers were detected
				</p>
                <p>I SORTED <span>{groups.reduce((acc, group) => acc + group.dancers.length, 0)}</span> DANCERS / GROUPS OF DANCERS.</p>
			</div>
		</div>
		<Button
			class="w-30"
			color="blue"
			on:click={async () => {
				await writeSchedule([unplaceables, placeables].flat());
				const appDataDirPath = await appDataDir();
				await open(`${appDataDirPath}/generatedSchedule.csv`);
			}}>EXPORT TO CSV</Button
		>
	</div>
	<div class="flex flex-col gap-14">
		{#each unplaceables as { category, size, level, dancers, time }, index}
			{#if dancers.length !== 0}
				<div class="mt-8">
					<p class="text-2xl text-center font-bold">Group {index + 1}</p>
					<div
						class={`${size === 'unplaceable' ? 'bg-red-500' : 'bg-green-800'} flex items-center justify-between gap-2 w-full my-2 py-4 px-6 rounded-lg`}
					>
						<p class="text-xl text-center font-bold">
							<span class="text-gray-400 font-normal">Category:</span>
							{category}
						</p>
						<p class="text-xl text-center font-bold">
							<span class="text-gray-400 font-normal">Size:</span>
							{size.slice(0, 1).toUpperCase() + size.slice(1, size.length)}
						</p>
						<p class="text-xl text-center font-bold">
							<span class="text-gray-400 font-normal">Levels:</span>
							{level.join(', ')}
						</p>
						<p class="text-xl text-center font-bold">
							<span class="text-gray-400 font-normal">Group Count:</span>
							{dancers.length}
						</p>
						<p class="text-xl text-center font-bold">
							<span class="text-gray-400 font-normal">Time:</span>
							{time} mins
						</p>
					</div>
					<Table color={`${size === 'unplaceable' ? 'red' : 'green'}`} striped shadow hoverable>
						<TableHead>
							<TableHeadCell>Group Number</TableHeadCell>
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
							{#each dancers as { group_number, age, dancers_names, discipline, group, level, name, perf_comp, studio, number_of_dancers }}
								<TableBodyRow
									color={`${size === 'unplaceable' ? 'red' : checkNames(dancers_names, duplicateNames) ? 'purple' : 'green'}`}
								>
									<TableBodyCell tdClass="px-6 py-4 text-sm">{group_number}</TableBodyCell>
									<TableBodyCell tdClass="px-6 py-4 text-sm">{name}</TableBodyCell>
									<TableBodyCell tdClass="px-6 py-4 text-sm">{age}</TableBodyCell>
									<TableBodyCell tdClass="px-6 py-4 text-sm">{level}</TableBodyCell>
									<TableBodyCell tdClass="px-6 py-4 text-sm">{discipline}</TableBodyCell>
									<TableBodyCell tdClass="px-6 py-4 text-sm">{perf_comp}</TableBodyCell>
									<TableBodyCell tdClass="px-6 py-4 text-sm">{group}</TableBodyCell>
									<TableBodyCell tdClass="px-6 py-4 text-sm">
										{#if number_of_dancers}
											{number_of_dancers}
										{:else}
											{dancers_names ? dancers_names.split(',').length : 'Unknown'}
										{/if}
									</TableBodyCell>
									<TableBodyCell
										class="whitespace-normal max-w-xl"
										tdClass="px-6 py-4 text-sm whitespace-normal"
										>{dancers_names ?? 'Unknown'}</TableBodyCell
									>
									<TableBodyCell tdClass="px-6 py-4 text-sm">{studio}</TableBodyCell>
								</TableBodyRow>
							{/each}
						</TableBody>
					</Table>
				</div>
			{/if}
		{/each}

		{#each placeables as { category, size, level, dancers, time }, index}
			{#if dancers.length !== 0}
				<div class="mt-8">
					<p class="text-2xl text-center font-bold">Group {index + 1}</p>
					<div
						class={`${size === 'unplaceable' ? 'bg-red-500' : 'bg-green-800'} flex items-center justify-between gap-2 w-full my-2 py-4 px-6 rounded-lg`}
					>
						<p class="text-xl text-center font-bold">
							<span class="text-gray-400 font-normal">Category:</span>
							{category}
						</p>
						<p class="text-xl text-center font-bold">
							<span class="text-gray-400 font-normal">Size:</span>
							{size.slice(0, 1).toUpperCase() + size.slice(1, size.length)}
						</p>
						<p class="text-xl text-center font-bold">
							<span class="text-gray-400 font-normal">Levels:</span>
							{level.join(', ')}
						</p>
						<p class="text-xl text-center font-bold">
							<span class="text-gray-400 font-normal">Group Count:</span>
							{dancers.length}
						</p>
						<p class="text-xl text-center font-bold">
							<span class="text-gray-400 font-normal">Time:</span>
							{time} mins
						</p>
					</div>
					<Table color={`${size === 'unplaceable' ? 'red' : 'green'}`} striped shadow hoverable>
						<TableHead>
							<TableHeadCell>Group Number</TableHeadCell>
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
							{#each dancers as { group_number, age, dancers_names, discipline, group, level, name, perf_comp, studio, number_of_dancers }}
								<TableBodyRow
									color={`${size === 'unplaceable' ? 'red' : checkNames(dancers_names, duplicateNames) ? 'purple' : 'green'}`}
								>
									<TableBodyCell tdClass="px-6 py-4 text-sm">{group_number}</TableBodyCell>
									<TableBodyCell tdClass="px-6 py-4 text-sm">{name}</TableBodyCell>
									<TableBodyCell tdClass="px-6 py-4 text-sm">{age}</TableBodyCell>
									<TableBodyCell tdClass="px-6 py-4 text-sm">{level}</TableBodyCell>
									<TableBodyCell tdClass="px-6 py-4 text-sm">{discipline}</TableBodyCell>
									<TableBodyCell tdClass="px-6 py-4 text-sm">{perf_comp}</TableBodyCell>
									<TableBodyCell tdClass="px-6 py-4 text-sm">{group}</TableBodyCell>
									<TableBodyCell tdClass="px-6 py-4 text-sm">
										{#if number_of_dancers}
											{number_of_dancers}
										{:else}
											{dancers_names ? dancers_names.split(',').length : 'Unknown'}
										{/if}
									</TableBodyCell>
									<TableBodyCell
										class="whitespace-normal max-w-xl"
										tdClass="px-6 py-4 text-sm whitespace-normal"
										>{dancers_names ?? 'Unknown'}</TableBodyCell
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

	<button on:click={() => (groups = [])}>Export</button>
</div>
