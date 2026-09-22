<script>
    import { slide } from 'svelte/transition';
    export let items = [];
    let selected = null;

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
        class="rounded-3xl px-4 transition-all duration-300 ease-in-out hover:bg-primary-500/5 hover:shadow-md hover:scale-[1.02] {selected === index
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
                class="group block w-full py-6 text-left transition-all duration-300 ease-in-out hover:text-primary-600 focus-visible:outline-none"
                aria-controls={item.id}
                on:click={() => toggle(index)}
                aria-expanded={selected === index}
            >
                <div class="group-focus-visible:outline-primary-950 dark:group-focus-visible:outline-primary-200 flex items-center justify-between rounded-3xl group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-2">
                    <span class="font-medium">{item.title}</span>
                    <span class="ml-6 flex h-7 items-center">
                        <svg
                            class="text-primary-600 dark:text-primary-400 h-6 w-6 transform transition-all duration-300 ease-in-out group-hover:scale-110 {selected ===
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
            {#if item.image}
            <img src={item.image} alt={item.title} class="w-full h-48 {(item.image && item.image.includes('empresario.png')) || (item.image && item.image.includes('inteligencia_artificial.png')) ? 'object-top' : 'object-center'} object-cover rounded-lg shadow-lg mb-4" style="{item.image && item.image.includes('empresario.png') ? 'object-position: center -40px;' : (item.image && item.image.includes('inteligencia_artificial.png') ? 'object-position: center -100px;' : '')}" />
            {/if}
            <p class="text-primary-950/70 dark:text-primary-200/70 text-base">
                {@html item.answer}
            </p>
        </dd>
        {/if}
    </div>
    {/each}
</dl> 