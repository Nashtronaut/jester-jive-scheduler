<script lang="ts">
	import Helper from './helper.svelte';
	import { Fileupload, Button } from 'flowbite-svelte';
	import parseFile from '$lib/helpers/parseFile';
	import InitParse from './init-parse.svelte';
	import Schedule from './schedule.svelte';
	import type { RoughGroup } from '../../types';

	let data: any = null;
	let files: FileList | undefined = undefined;
	let isVerified: boolean = false;
	let showHelper: boolean = false;
	let groups: RoughGroup[] = [];
	let duplicateNames: string[] = [];
</script>

<div class="flex flex-col h-screen">
	<div class="flex justify-center items-center flex-1 text-gray-100">
		{#if !showHelper}
			{#if !files || !data}
				<div class="flex flex-col items-center gap-4 text-xl">
					<p class="text-4xl">Welcome to Jester Jive!</p>
					<p class="text-gray-400">Upload a csv file to get started.</p>
					<div class="flex gap-2 my-6">
						<Fileupload bind:files />
						<Button
							on:click={async () => {
								data = await parseFile(files);
							}}
							outline={files ? false : true}
							disabled={files ? false : true}
							color={`${files ? 'green' : 'red'}`}>Continue</Button
						>
					</div>
					<button on:click={() => showHelper = true} class="text-sm text-gray-400 hover:underline">How do I use this app?</button>
				</div>
			{/if}

			{#if files && data && !isVerified}
				<InitParse bind:data bind:files bind:isVerified bind:groups bind:duplicateNames />
			{/if}

			{#if isVerified && groups}
				<Schedule bind:isVerified {groups} {duplicateNames} />
			{/if}
		{:else}
			<Helper bind:showHelper />
		{/if}
	</div>
</div>
