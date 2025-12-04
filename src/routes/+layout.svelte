<script lang="ts">
	import favicon from '$lib/assets/favicon.svg'
	import Splash from '$lib/components/ui/Splash.svelte'
	import '$lib/styles/all.css'

	let { children } = $props()
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Splash />
{@render children()}
