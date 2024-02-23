<script>
  import {
    Listbox,
    ListboxButton,
    ListboxOptions,
    ListboxOption,
  } from "@rgossiaux/svelte-headlessui";
  import { onMount } from "svelte";

  const themes = [
    { id: 1, name: "Dark", unavailable: false },
    { id: 2, name: "Light", unavailable: false },
    { id: 3, name: "Halloween", unavailable: false },
    { id: 4, name: "Moon", unavailable: false },
    { id: 5, name: "Synthwave", unavailable: false },
  ];

  let html;
  let selectedTheme = themes[0];

  function changeTheme(e) {
    selectedTheme = e.detail;
    html.dataset.theme = selectedTheme.name.toLowerCase();
  }

  onMount(() => {
    html = document.documentElement;
  });
</script>

<Listbox
  class=" p-[0.375rem] w-full overflow-hidden"
  value={selectedTheme}
  on:change={changeTheme}
>
  <ListboxButton class="flex gap-[0.375rem] w-full overflow-hidden">
    <div><slot name="icon" /></div>
    <span>{selectedTheme.name}</span>
  </ListboxButton>
  <ListboxOptions class="bg-primary-toneer/95 absolute z-50 rounded-md w-48">
    {#each themes as theme (theme.id)}
      <ListboxOption
        class="p-2 cursor-pointer flex justify-between gap-[0.375rem] hover:bg-primary-toneer"
        value={theme}
        disabled={theme.unavailable}
        data-theme={theme.name.toLowerCase()}
      >
        <span>{theme.name}</span>
        <div class="flex gap-1">
          <div
            style:background-color="var(--color-primary)"
            class="w-2 h-full"
          />
          <div
            style:background-color="var(--color-accent)"
            class="w-2 h-full"
          />
        </div>
      </ListboxOption>
    {/each}
  </ListboxOptions>
</Listbox>
