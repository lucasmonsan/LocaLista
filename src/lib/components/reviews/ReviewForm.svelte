<script lang="ts">
	import { supabase } from '$lib/supabaseClient'
	// ATUALIZADO: Import showToast
	import { selectedLocation, mapView, user, showToast } from '$lib/stores'
	import StarRating from '$lib/components/ui/StarRating.svelte'
	import TagsInput from '$lib/components/ui/TagsInput.svelte'
	import LoadingIcon from '$lib/icons/LoadingIcon.svelte'

	export let onCancel: () => void
	export let onSuccess: () => void

	// ... variáveis iguais ...
	let formRating = 0
	let formTags: string[] = []
	let formComment = ''
	let formNumero = ''
	let formComplemento = ''
	let formSemNumero = false
	let isSubmitting = false

	$: if (formSemNumero) {
		formNumero = 'S/N'
	} else if (formNumero === 'S/N') {
		formNumero = ''
	}

	async function submitReview() {
		// MUDANÇA: Alerts viram Toasts
		if (formRating === 0) return showToast('Selecione uma nota!', 'error')
		if (!formSemNumero && !formNumero.trim()) return showToast('Digite o número ou marque "Sem número".', 'error')

		if (isSubmitting) return
		isSubmitting = true

		try {
			let localId = $selectedLocation.id

			if (!localId) {
				// ... lógica de criar local igual ...
				const osm_id = $selectedLocation.endereco?.properties?.osm_id
					? `${$selectedLocation.endereco.properties.osm_type}/${$selectedLocation.endereco.properties.osm_id}`
					: `custom/${Date.now()}`

				const { data: newLocal, error: localError } = await supabase
					.from('locais')
					.upsert(
						{
							osm_id: osm_id,
							nome: $selectedLocation.nome,
							numero: formNumero,
							complemento: formComplemento,
							lat: $selectedLocation.lat,
							lon: $selectedLocation.lon,
							endereco: $selectedLocation.endereco,
						},
						{ onConflict: 'osm_id' }
					)
					.select()
					.single()

				if (localError) throw localError
				localId = newLocal.id
			}

			const userId = $user ? $user.id : null

			const { error: reviewError } = await supabase.from('reviews').insert({
				local_id: localId,
				rating: formRating,
				tags: formTags,
				comentario: formComment,
				user_id: userId,
			})

			if (reviewError) throw reviewError

			// MUDANÇA: Sucesso via Toast
			showToast('Avaliação enviada com sucesso!', 'success')

			selectedLocation.update(l => ({ ...l, id: localId }))
			mapView.update(v => ({ ...v, trigger: Date.now() }))
			onSuccess()
		} catch (err) {
			console.error(err)
			// MUDANÇA: Erro via Toast
			showToast('Erro ao salvar avaliação.', 'error')
		} finally {
			isSubmitting = false
		}
	}
</script>

<div class="form-container">
	<div class="address-grid">
		<div class="field number-field">
			<label for="num">Número</label>
			<input id="num" type="text" placeholder="Ex: 920" bind:value={formNumero} disabled={formSemNumero} />
		</div>
		<div class="field comp-field">
			<label for="comp">Complemento</label>
			<input id="comp" type="text" placeholder="Ex: Apto 101" bind:value={formComplemento} />
		</div>
	</div>

	<div class="checkbox-row">
		<input type="checkbox" id="sn" bind:checked={formSemNumero} />
		<label for="sn" class="inline-label">Este local não tem numeração</label>
	</div>

	<p class="hint-text">Não se preocupe se o pino não estiver exato. O importante é o número correto.</p>
	<hr class="divider" />

	<span class="label-text">Sua nota:</span>
	<div class="center-stars"><StarRating bind:rating={formRating} /></div>

	<span class="label-text">O que se destaca?</span>
	<TagsInput bind:selectedTags={formTags} />

	<label for="review-comment">Comentário (Opcional):</label>
	<textarea id="review-comment" bind:value={formComment} placeholder="Conte sua experiência..." rows="3"></textarea>

	<div class="form-actions">
		<p class="privacy-note">🔒 Sua review será postada anonimamente.</p>
		<button class="btn-primary full" disabled={isSubmitting} on:click={submitReview}>
			{#if isSubmitting}
				<div class="btn-loader"><LoadingIcon /></div>
			{:else}
				Publicar Avaliação
			{/if}
		</button>
		<button class="btn-outline full" on:click={onCancel}> Cancelar </button>
	</div>
</div>

<style>
	/* ... CSS igual ... */
	.form-container {
		display: flex;
		flex-direction: column;
		gap: var(--sm);
		animation: fadeIn 0.3s;
	}
	label,
	.label-text {
		font-weight: 600;
		font-size: 0.9rem;
		color: var(--text-color);
		margin-top: var(--xs);
		display: block;
	}
	.center-stars {
		align-self: center;
		margin-bottom: var(--xs);
	}
	textarea {
		width: 100%;
		padding: var(--sm);
		border: 1px solid var(--subbg-color);
		border-radius: var(--radius-2);
		background: #fff;
		font-family: inherit;
		resize: none;
		outline: none;
	}
	button {
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		border-radius: var(--radius-2);
		padding: var(--sm);
		border: none;
	}
	.btn-primary {
		background: var(--primary-color);
		color: white;
	}
	.btn-outline {
		background: transparent;
		border: 2px solid var(--subbg-color);
		color: var(--text-color);
		margin-top: var(--xs);
	}
	.full {
		width: 100%;
	}
	.btn-loader {
		width: var(--md);
		height: var(--md);
		margin: 0 auto;
	}
	.address-grid {
		display: flex;
		gap: var(--sm);
	}
	.field {
		display: flex;
		flex-direction: column;
	}
	.number-field {
		flex: 1;
	}
	.comp-field {
		flex: 2;
	}
	input[type='text'] {
		padding: var(--sm);
		border: 1px solid var(--subbg-color);
		border-radius: var(--radius-2);
		background: #fff;
		font-size: 1rem;
	}
	input:disabled {
		background: var(--bg-color);
		color: var(--subtext-color);
	}
	.checkbox-row {
		display: flex;
		align-items: center;
		gap: var(--xs);
		margin-top: -8px;
	}
	.inline-label {
		margin: 0;
		font-weight: 400;
		font-size: 0.9rem;
	}
	.hint-text {
		font-size: 0.8rem;
		color: var(--subtext-color);
		font-style: italic;
		margin: var(--xs) 0;
	}
	.divider {
		border: 0;
		border-top: 1px solid var(--subbg-color);
		margin: var(--sm) 0;
		width: 100%;
	}
	.privacy-note {
		font-size: 0.8rem;
		color: var(--subtext-color);
		text-align: center;
		margin-top: var(--xs);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 4px;
	}
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
