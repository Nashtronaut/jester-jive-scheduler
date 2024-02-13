<script lang="ts">
	import { Button } from "flowbite-svelte";

    export let showHelper: boolean;
</script>


<div class="flex flex-col gap-2">
    <Button on:click={() => showHelper = false} class="w-40">Go Back</Button>
    <div class="flex gap-2 col-span-2">
        <div class="flex flex-col gap-4 bg-gray-800 p-8 rounded-lg w-[40rem]">
            <p class="text-2xl text-center">Step 1</p>
            <div class="flex flex-col gap-1">
                <p class="text-xl">Use Excel to organize the data with the following order and headers.</p>
                <p class="text-sm text-gray-400">Note that the parenthesis explain the content, do not include in header.</p>
            </div>
            <ul>
                <li>Name (name of group)</li>
                <li>Age (of dancers)</li>
                <li>Level (Group level)</li>
                <li>Discipline (Dance Type)</li>
                <li>Group (Size of group)</li>
                <li>Perf/Comp (Performance or Competitive)</li>       
                <li>Number of Dancers</li>         
                <li>Dancers Names (Names of Dancers)</li>
                <li>Studio</li>
            </ul>
    
            <p><span class="text-red-400">IMPORTANT:</span> Dancers Names should be formatted as dancer1, dancer2, dancer3 in the same column</p>
            <p>Values for GROUP are more accurate when numberical. Ex. 1 = Junior </p>
        </div>
    
        <div class="flex flex-col gap-4 bg-gray-800 p-8 rounded-lg w-[40rem]">
            <p class="text-2xl text-center">Step 2</p>
            <p>If format is inline with the previous step, export the spreadsheet as COMMA SEPERATED VALUE (.csv) and upload to application!</p>
            <p>If you are still having issues, or want to report a bug, please email <a class="text-green-300 hover:text-green-500 transition" href="mailto:nashboisvert1@gmail.com">the developer.</a></p>
        </div>
    </div>
</div>