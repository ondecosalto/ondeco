// ==========================================
// VARIÁVEIS GLOBAIS
// ==========================================
let todosOsPontos = [];
let mapa = null;
let marcadoresGroup = null;
let categoriaAtiva = 'todos';

// ==========================================
// FUNÇÕES AUXILIARES DE SEGURANÇA E TEXTO
// ==========================================

function obterTextoSeguro(valor, fallback = 'Não informado') {
  if (valor === null || valor === undefined) return fallback;
  const texto = String(valor).trim();
  return texto !== '' ? texto : fallback;
}

function obterCategoriasSeguras(ponto) {
  return Array.isArray(ponto.categorias) ? ponto.categorias : [];
}

function normalizarTexto(texto) {
  if (texto === null || texto === undefined) return '';
  return String(texto)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

// ==========================================
// ADAPTAÇÃO RESPONSIVA (PLACEHOLDER MOBILE)
// ==========================================

function ajustarPlaceholderBusca() {
  const inputBusca = document.getElementById('input-busca');
  if (!inputBusca) return;

  if (window.innerWidth < 600) {
    inputBusca.placeholder = 'Qual resíduo quer descartar?';
  } else {
    inputBusca.placeholder = 'Qual resíduo você quer descartar? (ex: lâmpada, bairro...)';
  }
}

// ==========================================
// INICIALIZAÇÃO DO MAPA
// ==========================================

function inicializarMapa() {
  if (mapa) return;

  // Coordenadas centrais de Salto/SP
  mapa = L.map('map').setView([-23.2014, -47.2882], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(mapa);

  marcadoresGroup = L.layerGroup().addTo(mapa);
}

// ==========================================
// CARREGAMENTO DOS DADOS (JSON)
// ==========================================

async function carregarPontos() {
  try {
    const resposta = await fetch('assets/data/pontos.json');
    
    if (!resposta.ok) {
      throw new Error(`Erro HTTP: ${resposta.status}`);
    }

    todosOsPontos = await resposta.json();

    inicializarMapa();
    exibirPontosEMapa(todosOsPontos);
  } catch (erro) {
    console.error('Erro ao carregar os dados do arquivo pontos.json:', erro);
    const container = document.getElementById('cards-container');
    if (container) {
      container.innerHTML = '<p style="text-align:center; padding:1.5rem;">Erro ao carregar os pontos de descarte.</p>';
    }
  }
}

// ==========================================
// ANIMAÇÃO DE CARREGAMENTO (SKELETON)
// ==========================================

function exibirSkeletonCards() {
  const container = document.getElementById('cards-container');
  if (!container) return;

  container.replaceChildren();

  for (let i = 0; i < 3; i++) {
    const skeletonCard = document.createElement('article');
    skeletonCard.className = 'card-skeleton';

    const linhaTitulo = document.createElement('div');
    linhaTitulo.className = 'skeleton-line title';

    const linhaEndereco = document.createElement('div');
    linhaEndereco.className = 'skeleton-line text';

    const linhaMateriais = document.createElement('div');
    linhaMateriais.className = 'skeleton-line text';

    const linhaBtn = document.createElement('div');
    linhaBtn.className = 'skeleton-line btn';

    skeletonCard.appendChild(linhaTitulo);
    skeletonCard.appendChild(linhaEndereco);
    skeletonCard.appendChild(linhaMateriais);
    skeletonCard.appendChild(linhaBtn);

    container.appendChild(skeletonCard);
  }
}

// ==========================================
// RENDERIZAÇÃO DOS CARDS E MAPA
// ==========================================

function exibirPontosEMapa(pontos) {
  const container = document.getElementById('cards-container');
  if (!container) return;
  
  container.replaceChildren();
  
  if (marcadoresGroup) {
    marcadoresGroup.clearLayers();
  }

  if (!Array.isArray(pontos) || pontos.length === 0) {
    container.innerHTML = '<p style="text-align: center; padding: 1.5rem; color: var(--texto-mutado);">Nenhum ponto de descarte encontrado.</p>';
    if (mapa) {
      mapa.setView([-23.2014, -47.2882], 13);
    }
    return;
  }

  const bounds = [];

  pontos.forEach(ponto => {
    const card = document.createElement('article');
    card.classList.add('point-card');

    const enderecoFormatado = ponto.bairro 
      ? `${obterTextoSeguro(ponto.endereco)} - ${obterTextoSeguro(ponto.bairro)}`
      : obterTextoSeguro(ponto.endereco);

    card.innerHTML = `
      <h3>${obterTextoSeguro(ponto.nome, 'Ponto de descarte')}</h3>
      <p class="address">${enderecoFormatado}</p>
      <p class="materials"><strong>Aceita:</strong> ${obterTextoSeguro(ponto.materiais, 'Não informado')}</p>
      <button class="btn-detalhes" data-id="${ponto.id || ponto.nome}" aria-label="Ver detalhes de ${obterTextoSeguro(ponto.nome)}">Ver detalhes</button>
    `;

    card.querySelector('.btn-detalhes').addEventListener('click', () => {
      abrirModalDetalhes(ponto);
    });

    container.appendChild(card);

    const latitude = parseFloat(ponto.lat);
    const longitude = parseFloat(ponto.lng);

    if (!isNaN(latitude) && !isNaN(longitude) && marcadoresGroup) {
      const latLng = [latitude, longitude];
      bounds.push(latLng);

      const marker = L.marker(latLng);
      
      marker.bindPopup(`
        <div style="text-align: left;">
          <strong style="color: #245C43; font-size: 0.95rem;">${obterTextoSeguro(ponto.nome)}</strong><br>
          <span style="font-size: 0.82rem; color: #555;">${obterTextoSeguro(ponto.bairro)}</span><br>
        </div>
      `);

      marker.on('click', () => {
        abrirModalDetalhes(ponto);
      });

      marcadoresGroup.addLayer(marker);
    }
  });

  if (mapa && bounds.length > 0) {
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

// ==========================================
// LÓGICA DE FILTRAGEM COM SKELETON
// ==========================================

function aplicarFiltros() {
  if (!Array.isArray(todosOsPontos) || todosOsPontos.length === 0) return;

  exibirSkeletonCards();

  const inputBusca = document.getElementById('input-busca');
  const termoBusca = normalizarTexto(inputBusca ? inputBusca.value.trim() : '');

  const pontosFiltrados = todosOsPontos.filter(ponto => {
    if (!ponto || typeof ponto !== 'object') return false;

    const categorias = obterCategoriasSeguras(ponto);

    const textoPonto = normalizarTexto(
      `
        ${obterTextoSeguro(ponto.nome, '')}
        ${obterTextoSeguro(ponto.bairro, '')}
        ${obterTextoSeguro(ponto.endereco, '')}
        ${obterTextoSeguro(ponto.materiais, '')}
        ${obterTextoSeguro(ponto.categoria, '')}
        ${categorias.join(' ')}
      `
    );

    const bateTexto = termoBusca === '' || textoPonto.includes(termoBusca);

    let bateCategoria = false;

    if (categoriaAtiva === 'todos') {
      bateCategoria = true;
    } else if (categoriaAtiva === 'pilhas') {
      bateCategoria = textoPonto.includes('pilha') || textoPonto.includes('bateria');
    } else if (categoriaAtiva === 'outros') {
      bateCategoria = textoPonto.includes('outros') || 
                      textoPonto.includes('entulho') || 
                      textoPonto.includes('lampada') || 
                      textoPonto.includes('moveis') || 
                      textoPonto.includes('poda');
    } else {
      const catBusca = normalizarTexto(categoriaAtiva);
      bateCategoria = textoPonto.includes(catBusca) || 
                      categorias.some(c => normalizarTexto(c).includes(catBusca));
    }

    return bateTexto && bateCategoria;
  });

  setTimeout(() => {
    exibirPontosEMapa(pontosFiltrados);
  }, 250);
}

// ==========================================
// SOLUÇÃO DINÂMICA DO BOTÃO BUSCAR / LIMPAR
// ==========================================

const inputBusca = document.getElementById('input-busca');
const btnBuscar = document.getElementById('btn-buscar');
const formBusca = document.getElementById('form-busca');

function atualizarEstadoBotaoBusca() {
  if (!inputBusca || !btnBuscar) return;

  if (inputBusca.value.trim() !== '') {
    btnBuscar.textContent = 'Limpar';
    btnBuscar.classList.add('btn-limpar');
    btnBuscar.setAttribute('aria-label', 'Limpar texto da busca');
  } else {
    btnBuscar.textContent = 'Buscar';
    btnBuscar.classList.remove('btn-limpar');
    btnBuscar.setAttribute('aria-label', 'Realizar busca de pontos de coleta');
  }
}

if (inputBusca) {
  inputBusca.addEventListener('input', () => {
    atualizarEstadoBotaoBusca();
    aplicarFiltros();
  });
}

if (formBusca) {
  formBusca.addEventListener('submit', (e) => {
    e.preventDefault();

    if (inputBusca && inputBusca.value.trim() !== '') {
      inputBusca.value = '';
      atualizarEstadoBotaoBusca();
      aplicarFiltros();
      inputBusca.focus();
    } else {
      aplicarFiltros();
    }
  });
}

// ==========================================
// BOTÕES DE CATEGORIA (ARIA-PRESSED)
// ==========================================

const botoesCategoria = document.querySelectorAll('.category-btn');

botoesCategoria.forEach(botao => {
  botao.addEventListener('click', () => {
    const cat = botao.getAttribute('data-category');

    if (categoriaAtiva === cat) {
      categoriaAtiva = 'todos';
      botoesCategoria.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      const btnTodos = document.querySelector('.category-btn[data-category="todos"]');
      if (btnTodos) {
        btnTodos.classList.add('active');
        btnTodos.setAttribute('aria-pressed', 'true');
      }
    } else {
      botoesCategoria.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      categoriaAtiva = cat;
      botao.classList.add('active');
      botao.setAttribute('aria-pressed', 'true');
    }

    aplicarFiltros();
  });
});

// ==========================================
// GERENCIAMENTO DE MODAIS (ACESSÍVEL)
// ==========================================

const modalSobre = document.getElementById('modal-sobre');
const btnOpenSobre = document.getElementById('btn-open-sobre');
const btnCloseSobre = document.getElementById('btn-close-sobre');

const modalDetalhes = document.getElementById('modal-detalhes');
const btnCloseDetalhes = document.getElementById('btn-close-detalhes');

function abrirModal(modal) {
  if (!modal) return;
  modal.classList.add('active');
  modal.removeAttribute('aria-hidden');
  
  const btnFechar = modal.querySelector('.modal-close');
  if (btnFechar) btnFechar.focus();
}

function fecharModal(modal) {
  if (!modal) return;
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
}

if (btnOpenSobre) {
  btnOpenSobre.addEventListener('click', () => abrirModal(modalSobre));
}
if (btnCloseSobre) {
  btnCloseSobre.addEventListener('click', () => fecharModal(modalSobre));
}

function abrirModalDetalhes(ponto) {
  const modalBody = document.getElementById('modal-detalhes-body');
  if (!modalBody) return;
  
  let botaoMaps = '';
  if (ponto.link_maps) {
    botaoMaps = `
      <a href="${ponto.link_maps}" target="_blank" rel="noopener noreferrer" class="btn-maps">
        Ver no Google Maps 📍
      </a>
    `;
  }

  const enderecoFormatado = ponto.bairro 
    ? `${obterTextoSeguro(ponto.endereco)} - ${obterTextoSeguro(ponto.bairro)}`
    : obterTextoSeguro(ponto.endereco);

  modalBody.innerHTML = `
    <h2 style="color: var(--verde-escuro); margin-bottom: 0.5rem;">${obterTextoSeguro(ponto.nome)}</h2>
    <p><strong>Endereço:</strong> ${enderecoFormatado}</p>
    <p style="margin-top:0.5rem;"><strong>Materiais aceitos:</strong> ${obterTextoSeguro(ponto.materiais)}</p>
    <p style="margin-top:0.5rem;"><strong>Horário de Funcionamento:</strong> ${obterTextoSeguro(ponto.horario)}</p>
    ${botaoMaps}
  `;

  abrirModal(modalDetalhes);
}

if (btnCloseDetalhes) {
  btnCloseDetalhes.addEventListener('click', () => fecharModal(modalDetalhes));
}

window.addEventListener('click', (e) => {
  if (e.target === modalSobre) fecharModal(modalSobre);
  if (e.target === modalDetalhes) fecharModal(modalDetalhes);
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    fecharModal(modalSobre);
    fecharModal(modalDetalhes);
  }
});

// ==========================================
// BOTÃO "VOLTAR AO TOPO" E CARREGAMENTO
// ==========================================

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

// Inicialização segura da aplicação
document.addEventListener('DOMContentLoaded', () => {
  carregarPontos();
  ajustarPlaceholderBusca();
});

window.addEventListener('resize', ajustarPlaceholderBusca);