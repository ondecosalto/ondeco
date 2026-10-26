// VARIÁVEIS GLOBAIS
let todosOsPontos = [];
let mapa = null;
let marcadoresGroup = null;
let categoriaAtiva = 'todos';

// INICIALIZAÇÃO DO MAPA
function inicializarMapa() {
  // Coordenadas centrais de Salto/SP
  mapa = L.map('map').setView([-23.2014, -47.2882], 13);

  // Layout do Mapa (OpenStreetMap)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(mapa);

  // Grupo para gerenciar e limpar os pinos/marcadores
  marcadoresGroup = L.layerGroup().addTo(mapa);
}

// CARREGAMENTO DOS DADOS (JSON)
async function carregarPontos() {
  try {
    // Caminho atualizado para a pasta assets/data/
    const resposta = await fetch('assets/data/pontos.json');
    todosOsPontos = await resposta.json();

    inicializarMapa();
    exibirPontosEMapa(todosOsPontos);
  } catch (erro) {
    console.error('Erro ao carregar os dados do arquivo pontos.json:', erro);
    const container = document.getElementById('cards-container');
    if (container) {
      container.innerHTML = '<p>Erro ao carregar os pontos de descarte.</p>';
    }
  }
}

// RENDERIZAÇÃO DOS CARDS E PINOS NO MAPA COM REENQUADRAMENTO AUTOMÁTICO
function exibirPontosEMapa(pontos) {
  const container = document.getElementById('cards-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (marcadoresGroup) {
    marcadoresGroup.clearLayers();
  }

  if (pontos.length === 0) {
    container.innerHTML = '<p style="text-align: center; padding: 1.5rem; color: var(--texto-mutado);">Nenhum ponto de descarte encontrado.</p>';
    if (mapa) {
      mapa.setView([-23.2014, -47.2882], 13);
    }
    return;
  }

  const bounds = [];

  pontos.forEach(ponto => {
    // Criação do Card na Lista
    const card = document.createElement('article');
    card.classList.add('point-card');

    card.innerHTML = `
      <h3>${ponto.nome}</h3>
      <p class="address">${ponto.endereco} - ${ponto.bairro}</p>
      <p class="materials"><strong>Aceita:</strong> ${ponto.materiais}</p>
      <button class="btn-detalhes" data-id="${ponto.id || ponto.nome}">Ver detalhes</button>
    `;

    card.querySelector('.btn-detalhes').addEventListener('click', () => {
      abrirModalDetalhes(ponto);
    });

    container.appendChild(card);

    // Criação do Pino no Mapa (Converte texto em número se necessário)
    const latitude = parseFloat(ponto.lat);
    const longitude = parseFloat(ponto.lng);

    if (!isNaN(latitude) && !isNaN(longitude) && marcadoresGroup) {
      const latLng = [latitude, longitude];
      bounds.push(latLng);

      const marker = L.marker(latLng);
      
      marker.bindPopup(`
        <div style="text-align: left;">
          <strong style="color: #245C43; font-size: 0.95rem;">${ponto.nome}</strong><br>
          <span style="font-size: 0.82rem; color: #555;">${ponto.bairro}</span><br>
        </div>
      `);

      // Ao clicar no pino, foca nele e abre o modal de detalhes
      marker.on('click', () => {
        abrirModalDetalhes(ponto);
      });

      marcadoresGroup.addLayer(marker);
    }
  });

  // Ajuste Automático do Zoom e Visão do Mapa
  if (mapa && bounds.length > 0) {
    // Garante que o Leaflet recalcule o tamanho do mapa na tela
    setTimeout(() => {
      mapa.invalidateSize();
      if (bounds.length === 1) {
        mapa.setView(bounds[0], 15);
      } else {
        mapa.fitBounds(bounds, { padding: [40, 40] });
      }
    }, 100);
  }
}

// FUNÇÃO AUXILIAR DE NORMALIZAÇÃO DE TEXTO
function normalizarTexto(texto) {
  if (!texto) return '';
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// FILTRAGEM (Busca por Texto + Botões de Categoria)
function aplicarFiltros() {
  const inputBusca = document.getElementById('input-busca');
  const termoBusca = normalizarTexto(inputBusca ? inputBusca.value.trim() : '');

  const pontosFiltrados = todosOsPontos.filter(ponto => {
    // Une todo o texto do ponto em uma única string normalizada para busca
    const textoPonto = normalizarTexto(
      `${ponto.nome} ${ponto.bairro} ${ponto.endereco} ${ponto.materiais} ${ponto.categoria} ${(ponto.categorias || []).join(' ')}`
    );

    const bateTexto = termoBusca === '' || textoPonto.includes(termoBusca);

    // Verificação de Categoria
    let bateCategoria = false;

    if (categoriaAtiva === 'todos') {
      bateCategoria = true;
    } else if (categoriaAtiva === 'pilhas') {
      // Se clicar em "Pilhas e baterias", busca por pilhas ou baterias nos materiais/categorias
      bateCategoria = textoPonto.includes('pilha') || textoPonto.includes('bateria');
    } else if (categoriaAtiva === 'outros') {
      // "Outros" inclui lâmpadas, entulho, móveis, podas, etc.
      bateCategoria = textoPonto.includes('outros') || 
                      textoPonto.includes('entulho') || 
                      textoPonto.includes('lampada') || 
                      textoPonto.includes('moveis') || 
                      textoPonto.includes('poda');
    } else {
      // Demais categorias (reciclaveis, eletronicos, oleo, medicamentos)
      const catBusca = normalizarTexto(categoriaAtiva);
      bateCategoria = textoPonto.includes(catBusca) || 
                      (Array.isArray(ponto.categorias) && ponto.categorias.some(c => normalizarTexto(c).includes(catBusca)));
    }

    return bateTexto && bateCategoria;
  });

  exibirPontosEMapa(pontosFiltrados);
}

// EVENTOS DE BUSCA E BOTÕES DE CATEGORIA

// Campo de busca por digitação
const inputBusca = document.getElementById('input-busca');
if (inputBusca) {
  inputBusca.addEventListener('input', () => {
    aplicarFiltros();
  });
}

// Form submit (evita recarregar a página ao dar Enter)
const formBusca = document.getElementById('form-busca');
if (formBusca) {
  formBusca.addEventListener('submit', (e) => {
    e.preventDefault();
    aplicarFiltros();
  });
}

// Botões de Categoria (Grid)
const botoesCategoria = document.querySelectorAll('.category-btn');
botoesCategoria.forEach(botao => {
  botao.addEventListener('click', () => {
    const cat = botao.getAttribute('data-category');

    // Alterna a categoria ativa se clicar no mesmo botão
    if (categoriaAtiva === cat) {
      categoriaAtiva = 'todos';
      botao.classList.remove('active');
    } else {
      botoesCategoria.forEach(b => b.classList.remove('active'));
      categoriaAtiva = cat;
      botao.classList.add('active');
    }

    aplicarFiltros();
  });
});

//  GERENCIAMENTO DOS MODAIS (SOBRE E DETALHES)
const modalSobre = document.getElementById('modal-sobre');
const btnOpenSobre = document.getElementById('btn-open-sobre');
const btnCloseSobre = document.getElementById('btn-close-sobre');

const modalDetalhes = document.getElementById('modal-detalhes');
const btnCloseDetalhes = document.getElementById('btn-close-detalhes');

// Modal Sobre
if (btnOpenSobre) {
  btnOpenSobre.addEventListener('click', () => modalSobre.classList.add('active'));
}
if (btnCloseSobre) {
  btnCloseSobre.addEventListener('click', () => modalSobre.classList.remove('active'));
}

// Modal Detalhes
function abrirModalDetalhes(ponto) {
  const modalBody = document.getElementById('modal-detalhes-body');
  
  let botaoMaps = '';
  if (ponto.link_maps) {
    botaoMaps = `
      <a href="${ponto.link_maps}" target="_blank" rel="noopener noreferrer" class="btn-maps" style="display:inline-block; margin-top: 1rem;">
        Ver no Google Maps 📍
      </a>
    `;
  }

  modalBody.innerHTML = `
    <h2 style="color: var(--verde-escuro); margin-bottom: 0.5rem;">${ponto.nome}</h2>
    <p><strong>Endereço:</strong> ${ponto.endereco} - ${ponto.bairro}</p>
    <p style="margin-top:0.5rem;"><strong>Materiais aceitos:</strong> ${ponto.materiais}</p>
    <p style="margin-top:0.5rem;"><strong>Horário de Funcionamento:</strong> ${ponto.horario || 'Não informado'}</p>
    ${botaoMaps}
  `;

  modalDetalhes.classList.add('active');
}

if (btnCloseDetalhes) {
  btnCloseDetalhes.addEventListener('click', () => modalDetalhes.classList.remove('active'));
}

// Fechar modais ao clicar no fundo escurecido ou apertar ESC
window.addEventListener('click', (e) => {
  if (e.target === modalSobre) modalSobre.classList.remove('active');
  if (e.target === modalDetalhes) modalDetalhes.classList.remove('active');
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (modalSobre) modalSobre.classList.remove('active');
    if (modalDetalhes) modalDetalhes.classList.remove('active');
  }
});

//  BOTÃO "VOLTAR AO TOPO"
const btnTop = document.getElementById('btn-top');

if (btnTop) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      btnTop.classList.add('show');
    } else {
      btnTop.classList.remove('show');
    }
  });

  btnTop.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

carregarPontos();