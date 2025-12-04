<script lang="ts">
	import { isProfileOpen, user, selectedLocation, mapView, showToast } from '$lib/stores'
	import { supabase } from '$lib/supabaseClient'
	import { fly, fade } from 'svelte/transition'
	import XIcon from '$lib/icons/XIcon.svelte'
	import GoogleIcon from '$lib/icons/GoogleIcon.svelte'
	import LoadingIcon from '$lib/icons/LoadingIcon.svelte'
	import StarRating from '$lib/components/ui/StarRating.svelte' // Reutilizando estrelas

	let loading = false

	// Auth Fields
	let email = ''
	let password = ''
	let confirmPassword = ''
	let fullName = ''
	let isRegister = false

	// Profile Navigation
	let view: 'menu' | 'reviews' = 'menu'
	let myReviews: any[] = []
	let isLoadingReviews = false

	function close() {
		isProfileOpen.set(false)
		view = 'menu' // Reseta para o menu ao fechar
	}

	// --- AUTH LOGIC ---
	async function handleGoogle() {
		loading = true
		try {
			const { error } = await supabase.auth.signInWithOAuth({
				provider: 'google',
				options: { redirectTo: window.location.origin },
			})
			if (error) throw error
		} catch (err) {
			console.error(err)
			alert('Erro ao conectar com Google.')
			loading = false
		}
	}

	async function handleEmail() {
		if (!email || !password) return alert('Preencha email e senha.')
		if (isRegister) {
			if (!fullName) return alert('Digite seu nome completo.')
			if (password !== confirmPassword) return alert('As senhas não coincidem.')
		}

		loading = true
		try {
			if (isRegister) {
				const { error } = await supabase.auth.signUp({
					email,
					password,
					options: { data: { full_name: fullName } },
				})
				if (error) throw error
				showToast('Cadastro iniciado! Verifique seu e-mail.', 'success')
				isRegister = false
			} else {
				const { error } = await supabase.auth.signInWithPassword({ email, password })
				if (error) throw error
				close()
			}
		} catch (err: any) {
			if (err.message.includes('already registered')) {
				showToast('E-mail já cadastrado. Faça login.', 'error')
			} else {
				showToast(err.message || 'Erro na autenticação.', 'error')
			}
		} finally {
			loading = false
		}
	}

	async function handleLogout() {
		await supabase.auth.signOut()
		close()
	}

	// --- MY REVIEWS LOGIC ---

	async function openMyReviews() {
		view = 'reviews'
		isLoadingReviews = true

		try {
			// Busca reviews do usuário logado + dados do local (join)
			const { data, error } = await supabase
				.from('reviews')
				.select('*, locais(*)') // Pega tudo da review e tudo do local relacionado
				.eq('user_id', $user.id)
				.order('created_at', { ascending: false })

			if (error) throw error
			myReviews = data || []
		} catch (err) {
			console.error(err)
			alert('Erro ao carregar suas reviews.')
		} finally {
			isLoadingReviews = false
		}
	}

	async function handleDelete(reviewId: number) {
		if (!confirm('Tem certeza que deseja apagar esta avaliação?')) return

		try {
			const { error } = await supabase.from('reviews').delete().eq('id', reviewId)

			if (error) throw error

			// Remove da lista localmente
			myReviews = myReviews.filter(r => r.id !== reviewId)

			// Força atualização do mapa (para mudar cor do pin se necessário)
			mapView.update(v => ({ ...v, trigger: Date.now() }))
		} catch (err) {
			console.error(err)
			alert('Erro ao excluir.')
		}
	}

	function goToReview(review: any) {
		// 1. Fecha o perfil
		close()

		// 2. Move o mapa para o local
		mapView.set({
			lat: review.locais.lat,
			lon: review.locais.lon,
			zoom: 18,
			trigger: Date.now(),
		})

		// 3. Seleciona o local (Abre a BottomSheet do local)
		selectedLocation.set(review.locais)
	}
</script>

{#if $isProfileOpen}
	<div class="sheet" transition:fly={{ y: 300, duration: 300 }}>
		<div class="header">
			<div class="handle"></div>
			<button class="close" on:click={close}><XIcon /></button>
		</div>

		<div class="content">
			{#if $user}
				{#if view === 'menu'}
					<div class="profile-view" in:fade>
						<h3>Olá, {$user.user_metadata?.full_name || $user.email}</h3>

						<div class="menu">
							<button class="menu-item" on:click={openMyReviews}> 📝 Minhas Reviews </button>
							<button class="menu-item logout" on:click={handleLogout}> Sair da conta </button>
						</div>
					</div>
				{:else if view === 'reviews'}
					<div class="reviews-view" in:fade>
						<div class="sub-header">
							<button class="back-link" on:click={() => (view = 'menu')}>← Voltar</button>
							<h4>Suas Avaliações</h4>
						</div>

						{#if isLoadingReviews}
							<div class="loading-state"><LoadingIcon /></div>
						{:else if myReviews.length === 0}
							<p class="empty-msg">Você ainda não avaliou nenhum local.</p>
						{:else}
							<ul class="reviews-list">
								{#each myReviews as review}
									<li>
										<div class="review-item" on:click={() => goToReview(review)} role="button" tabindex="0" on:keydown>
											<div class="review-info">
												<strong>{review.locais?.nome || 'Local desconhecido'}</strong>
												<div class="mini-stars">
													<StarRating rating={review.rating} readonly={true} />
												</div>
												{#if review.comentario}
													<p class="comment-preview">{review.comentario}</p>
												{/if}
											</div>

											<button class="delete-btn" on:click|stopPropagation={() => handleDelete(review.id)}> 🗑️ </button>
										</div>
									</li>
								{/each}
							</ul>
						{/if}
					</div>
				{/if}
			{:else}
				<div class="auth-view">
					<h3>{isRegister ? 'Criar Conta' : 'Bem-vindo de volta'}</h3>
					<p>{isRegister ? 'Junte-se à comunidade.' : 'Entre para gerenciar suas reviews.'}</p>

					<button class="btn-google" on:click={handleGoogle} disabled={loading}>
						<div class="icon-wrap"><GoogleIcon /></div>
						<span>Continuar com Google</span>
					</button>

					<div class="divider">ou</div>

					<form on:submit|preventDefault={handleEmail}>
						{#if isRegister}
							<input type="text" placeholder="Nome completo" bind:value={fullName} required />
						{/if}
						<input type="email" placeholder="Seu e-mail" bind:value={email} required />
						<input type="password" placeholder="Sua senha" bind:value={password} required minlength="6" />
						{#if isRegister}
							<input type="password" placeholder="Confirme a senha" bind:value={confirmPassword} required minlength="6" />
						{/if}

						<button class="btn-primary" type="submit" disabled={loading}>
							{#if loading}
								<div class="loader-wrap"><LoadingIcon /></div>
							{:else}
								{isRegister ? 'Cadastrar' : 'Entrar'}
							{/if}
						</button>
					</form>

					<button class="btn-link" on:click={() => (isRegister = !isRegister)}>
						{isRegister ? 'Já tem conta? Entre aqui.' : 'Não tem conta? Cadastre-se.'}
					</button>
				</div>
			{/if}
		</div>
	</div>

	<button class="backdrop" on:click={close} transition:fade={{ duration: 200 }} aria-label="Fechar modal"></button>
{/if}

<style>
	.sheet {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		background: var(--bg-color);
		border-radius: var(--radius-3) var(--radius-3) 0 0;
		box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.2);
		z-index: var(--z-modal);
		padding-bottom: var(--xl);
		max-height: 90vh;
		overflow-y: auto;
	}
	.backdrop {
		appearance: none;
		border: none;
		outline: none;
		cursor: default;
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		z-index: calc(var(--z-modal) - 1);
	}

	.header {
		position: relative;
		display: flex;
		justify-content: center;
		padding: var(--sm);
	}
	.handle {
		width: 40px;
		height: 5px;
		background: #e0e0e0;
		border-radius: 10px;
	}
	.close {
		position: absolute;
		right: var(--md);
		top: var(--sm);
		width: var(--xl);
		height: var(--xl);
		border: none;
		background: transparent;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: var(--text-color);
	}
	.close :global(svg) {
		width: 100%;
		height: 100%;
	}

	.content {
		padding: 0 var(--md) var(--md);
	}

	h3 {
		margin: 0 0 var(--xs);
		font-size: 1.4rem;
		text-align: center;
	}
	p {
		margin: 0 0 var(--lg);
		text-align: center;
		color: var(--subtext-color);
		font-size: 0.95rem;
	}

	/* Auth & Menu Styles */
	.btn-google {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--sm);
		background: white;
		border: 1px solid var(--subbg-color);
		padding: var(--sm);
		border-radius: var(--radius-2);
		font-weight: 500;
		font-size: 1rem;
		color: #333;
		cursor: pointer;
		margin-bottom: var(--md);
	}
	.icon-wrap {
		width: 20px;
		height: 20px;
	}
	.divider {
		text-align: center;
		color: var(--subtext-color);
		margin-bottom: var(--md);
		font-size: 0.9rem;
	}
	form {
		display: flex;
		flex-direction: column;
		gap: var(--sm);
	}
	input {
		padding: var(--md);
		border: 1px solid var(--subbg-color);
		border-radius: var(--radius-2);
		background: #fff;
		font-size: 1rem;
	}
	.btn-primary {
		background: var(--primary-color);
		color: white;
		border: none;
		padding: var(--md);
		border-radius: var(--radius-2);
		font-weight: bold;
		font-size: 1rem;
		cursor: pointer;
	}
	.loader-wrap {
		width: 24px;
		height: 24px;
		margin: 0 auto;
	}
	.btn-link {
		background: none;
		border: none;
		color: var(--primary-color);
		margin-top: var(--md);
		font-size: 0.9rem;
		cursor: pointer;
		width: 100%;
		text-decoration: underline;
	}

	.menu {
		display: flex;
		flex-direction: column;
		gap: var(--sm);
		margin-top: var(--lg);
	}
	.menu-item {
		background: var(--subbg-color);
		border: none;
		padding: var(--md);
		border-radius: var(--radius-2);
		text-align: left;
		font-size: 1rem;
		cursor: pointer;
		color: var(--text-color);
	}
	.logout {
		background: #ffebee;
		color: #c62828;
	}

	/* --- Styles da Lista de Reviews --- */
	.sub-header {
		display: flex;
		align-items: center;
		margin-bottom: var(--md);
		position: relative;
	}
	.back-link {
		border: none;
		background: none;
		color: var(--primary-color);
		font-weight: 600;
		cursor: pointer;
		padding: 0;
	}
	h4 {
		margin: 0;
		flex: 1;
		text-align: center;
		font-size: 1.1rem;
	}

	.reviews-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--sm);
	}

	.review-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: var(--bg-color);
		border: 1px solid var(--subbg-color);
		padding: var(--md);
		border-radius: var(--radius-2);
		cursor: pointer;
		transition: background 0.2s;
	}
	.review-item:hover {
		background-color: rgba(0, 0, 0, 0.02);
	}

	.review-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.review-info strong {
		font-size: 1rem;
		color: var(--text-color);
	}
	.mini-stars {
		transform: scale(0.8);
		transform-origin: left center;
	}
	.comment-preview {
		font-size: 0.85rem;
		color: var(--subtext-color);
		margin: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 250px;
	}

	.delete-btn {
		background: none;
		border: none;
		font-size: 1.2rem;
		cursor: pointer;
		padding: var(--xs);
		opacity: 0.7;
		transition: opacity 0.2s;
	}
	.delete-btn:hover {
		opacity: 1;
		transform: scale(1.1);
	}

	.empty-msg {
		text-align: center;
		color: var(--subtext-color);
		margin-top: var(--xl);
	}
	.loading-state {
		display: flex;
		justify-content: center;
		padding: var(--xl);
		width: 100%;
	}
	.loading-state :global(svg) {
		width: 32px;
		height: 32px;
		color: var(--primary-color);
	}
</style>
