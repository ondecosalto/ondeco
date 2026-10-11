let todosOsPontos = [];

// 1. Carrega os dados do arquivo JSON
async function carregarPontos() {
  try {
    const resposta = await fetch('pontos.json');
    todosOsPontos = await resposta.json();
    exibirPontos(todosOsPontos);
  } catch (erro) {
    console.error('Erro ao carregar os dados do arquivo pontos.json:', erro);
    document.getElementById('listaPontos').innerHTML = '<p>Erro ao carregar os pontos de descarte.</p>';
  }
}

// 2. Renderiza os cards na tela
function exibirPontos(pontos) {
  const container = document.getElementById('listaPontos');
  container.innerHTML = '';

  if (pontos.length === 0) {
    container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem;">Nenhum ponto de descarte encontrado com esses filtros.</p>';
    return;
  }

  pontos.forEach(ponto => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `
      <h3>${ponto.nome}</h3>
      <p><strong>Bairro:</strong> ${ponto.bairro}</p>
      <p><strong>Endereço:</strong> ${ponto.endereco}</p>
      <p><strong>Aceita:</strong> ${ponto.materiais}</p>
      <p><strong>Horário:</strong> ${ponto.horario}</p>
      <span class="tag">${ponto.categoria.toUpperCase()}</span>
      <br>
      <a href="${ponto.link_maps}" target="_blank" class="btn-maps">Ver no Google Maps 📍</a>
    `;
    container.appendChild(card);
  });
}

// Função auxiliar para remover acentos e deixar em minúsculas
function normalizarTexto(texto) {
  if (!texto) return '';
  return texto
    .toLowerCase()
    .normalize('NFD') // Separa as letras dos acentos (ex: 'ô' vira 'o' + '^')
    .replace(/[\u0300-\u036f]/g, ''); // Apaga os acentos isolados
}

// 3. Aplica os filtros (Busca por Texto + Seleção de Categoria)
function aplicarFiltros() {
  // Normaliza o termo digitado pelo usuário (com ou sem acento viram iguais)
  const termoBusca = normalizarTexto(document.getElementById('inputBusca').value.trim());
  const categoriaSelecionada = document.getElementById('selectCategoria').value;

  const pontosFiltrados = todosOsPontos.filter(ponto => {
    // Une todas as propriedades do ponto e remove os acentos
    const textoPonto = normalizarTexto(`${ponto.nome} ${ponto.bairro} ${ponto.materiais} ${ponto.categoria}`);

    // 1. Verifica se o texto digitado bate com os dados do ponto
    const bateTexto = termoBusca === '' || textoPonto.includes(termoBusca);

    // 2. Verifica se a categoria do select bate (ou se está em 'todos')
    const bateCategoria = (categoriaSelecionada === 'todos') || (ponto.categoria === categoriaSelecionada);

    return bateTexto && bateCategoria;
  });

  exibirPontos(pontosFiltrados);
}

// Eventos de escuta para filtrar em tempo real
// 1. Quando o usuário digita na busca, resetamos a categoria para "todos" e filtramos
document.getElementById('inputBusca').addEventListener('input', () => {
  if (document.getElementById('inputBusca').value.trim() !== '') {
    document.getElementById('selectCategoria').value = 'todos';
  }
  aplicarFiltros();
});

// 2. Quando o usuário escolhe uma categoria no menu, limpamos o texto da busca e filtramos
document.getElementById('selectCategoria').addEventListener('change', () => {
  if (document.getElementById('selectCategoria').value !== 'todos') {
    document.getElementById('inputBusca').value = '';
  }
  aplicarFiltros();
});

// Inicia o carregamento
carregarPontos();