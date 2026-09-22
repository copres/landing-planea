<script>
    import { slide } from 'svelte/transition';
    export let items = [];
    let selected = 0;

    console.log({items});

    function toggle(index) {
        if (selected === index) {
            selected = null;
        } else {
            selected = index;
        }
    }
</script>

<dl class="-mt-3">
    {#each items as item, index}
    <div
        class="rounded-3xl px-4 transition {selected === index
            ? 'bg-primary-500/10 dark:bg-primary-400/10'
            : ''}"
    >
        <dt
            class="border-b text-lg transition {selected === index ||
            (selected !== null && selected === index + 1)
                ? 'border-transparent'
                : 'border-primary-900/10 dark:border-primary-300/10'}"
        >
            <button
                type="button"
                class="group block w-full py-6 text-left transition focus-visible:outline-none"
                aria-controls={item.id}
                on:click={() => toggle(index)}
                aria-expanded={selected === index}
            >
                <div class="group-focus-visible:outline-primary-950 dark:group-focus-visible:outline-primary-200 flex items-center justify-between rounded-3xl group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-2">
                    <span class="font-medium">{item.title}</span>
                    <span class="ml-6 flex h-7 items-center">
                        <svg
                            class="text-primary-600 dark:text-primary-400 h-6 w-6 transform transition duration-200 ease-in-out {selected ===
                            index
                                ? '-rotate-180'
                                : 'rotate-0'}"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path d="M11.9997 13.1714L16.9495 8.22168L18.3637 9.63589L11.9997 15.9999L5.63574 9.63589L7.04996 8.22168L11.9997 13.1714Z" />
                        </svg>
                    </span>
                </div>
            </button>
        </dt>
        {#if selected === index}
        <dd class="pb-6 pr-6" id={item.id} transition:slide|local>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                {#if index % 2 !== 0}
                    <!-- Even numbers: Image first, then description -->
                    <div class="order-1 lg:order-1">
                        <img 
                            src={item.image || '/assets/about.jpg'} 
                            alt={item.title} 
                            class="w-full h-64 object-cover rounded-lg shadow-lg"
                        />
                    </div>
                    <div class="order-2 lg:order-2">
                        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                            <p class="text-primary-950/70 dark:text-primary-200/70 text-base leading-relaxed mb-4">
                                {@html item.answer}
                            </p>
                            {#if item.items && item.items.length > 0}
                                <div class="mt-4">
                                    <div class="space-y-2">
                                        {#each item.items as listItem}
                                            {#if typeof listItem === 'object' && listItem.url}
                                                <a href={listItem.url} target="_blank" rel="noopener noreferrer" class="w-full flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors duration-200 text-left no-underline">
                                                    <span class="text-primary-950/80 dark:text-primary-200/80 text-sm font-medium flex-1 text-center">
                                                        {listItem.text}
                                                    </span>
                                                    <svg class="w-4 h-4 text-primary-600 dark:text-primary-400 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                                    </svg>
                                                </a>
                                            {:else}
                                                <button class="w-full flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors duration-200 text-left">
                                                    <span class="text-primary-950/80 dark:text-primary-200/80 text-sm font-medium flex-1 text-center">
                                                        {listItem}
                                                    </span>
                                                    <svg class="w-4 h-4 text-primary-600 dark:text-primary-400 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                                    </svg>
                                                </button>
                                            {/if}
                                        {/each}
                                        {#if item.callToAction}
                                            <div class="py-4 sm:py-5 mt-10">
                                                {#if typeof item.callToAction === 'object' && item.callToAction.url}
                                                    <a href={item.callToAction.url} target="_blank" rel="noopener noreferrer" class="font-extrabold text-primary-900 dark:text-primary-100 block text-center text-xl lg:text-2xl tracking-tight bg-primary-200 dark:bg-primary-800 hover:bg-primary-300 dark:hover:bg-primary-700 px-6 py-3 rounded-lg transition-colors duration-200 shadow-md">
                                                        {item.callToAction.text}
                                                    </a>
                                                {:else}
                                                    <span class="font-extrabold text-primary-900 dark:text-primary-100 block text-center text-xl lg:text-2xl tracking-tight">{item.callToAction}</span>
                                                {/if}
                                            </div>
                                        {/if}
                                    </div>
                                </div>
                            {/if}
                        </div>
                    </div>
                {:else}
                    <!-- Odd numbers: Description first, then image -->
                    <div class="order-2 lg:order-1">
                        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                            <p class="text-primary-950/70 dark:text-primary-200/70 text-base leading-relaxed mb-4">
                                {@html item.answer}
                            </p>
                            {#if item.items && item.items.length > 0}
                                <div class="mt-4">
                                    <div class="space-y-2">
                                        {#each item.items as listItem}
                                            {#if typeof listItem === 'object' && listItem.url}
                                                <a href={listItem.url} target="_blank" rel="noopener noreferrer" class="w-full flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors duration-200 text-left no-underline">
                                                    <span class="text-primary-950/80 dark:text-primary-200/80 text-sm font-medium flex-1 text-center">
                                                        {listItem.text}
                                                    </span>
                                                    <svg class="w-4 h-4 text-primary-600 dark:text-primary-400 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                                    </svg>
                                                </a>
                                            {:else}
                                                <button class="w-full flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors duration-200 text-left">
                                                    <span class="text-primary-950/80 dark:text-primary-200/80 text-sm font-medium flex-1 text-center">
                                                        {listItem}
                                                    </span>
                                                    <svg class="w-4 h-4 text-primary-600 dark:text-primary-400 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                                    </svg>
                                                </button>
                                            {/if}
                                        {/each}
                                        {#if item.callToAction}
                                            <div class="py-4 sm:py-5 mt-10">
                                                {#if typeof item.callToAction === 'object' && item.callToAction.url}
                                                    <a href={item.callToAction.url} target="_blank" rel="noopener noreferrer" class="font-extrabold text-primary-900 dark:text-primary-100 block text-center text-xl lg:text-2xl tracking-tight bg-primary-200 dark:bg-primary-800 hover:bg-primary-300 dark:hover:bg-primary-700 px-6 py-3 rounded-lg transition-colors duration-200 shadow-md">
                                                        {item.callToAction.text}
                                                    </a>
                                                {:else}
                                                    <span class="font-extrabold text-primary-900 dark:text-primary-100 block text-center text-xl lg:text-2xl tracking-tight">{item.callToAction}</span>
                                                {/if}
                                            </div>
                                        {/if}
                                    </div>
                                </div>
                            {/if}
                        </div>
                    </div>
                    <div class="order-1 lg:order-2">
                        <img 
                            src={item.image || '/assets/about.jpg'} 
                            alt={item.title} 
                            class="w-full h-64 object-cover rounded-lg shadow-lg"
                        />
                    </div>
                {/if}
            </div>
        </dd>
        {/if}
    </div>
    {/each}
</dl> 