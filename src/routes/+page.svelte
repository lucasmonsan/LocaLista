<script>
	import Map from '$lib/components/map/Map.svelte'
	import Footer from '$lib/components/layout/Footer.svelte'
	import BottomSheet from '$lib/components/reviews/BottomSheet.svelte'
	import Blur from '$lib/components/ui/Blur.svelte'
	import { isSearching } from '$lib/stores/'
	import Toast from '$lib/components/ui/Toast.svelte'
	import ProfileSheet from '$lib/components/reviews/ProfileSheet.svelte'
</script>

<main>
	<Map />

	<Toast />

	{#if $isSearching}
		<Blur on:click={() => ($isSearching = false)} />
	{/if}

	<Footer />

	<BottomSheet />

	<ProfileSheet />
</main>
