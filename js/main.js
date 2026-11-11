// ==========================================
// VARIÁVEIS GLOBAIS
// ==========================================
let todosOsPontos = [];
let mapa = null;
let marcadoresGroup = null;
let categoriaAtiva = 'todos';


// ==========================================
// FUNÇÕES AUXILIARES DE SEGURANÇA E FALLBACK
// ==========================================

// Retorna um texto seguro.
// Caso o valor não exista, utiliza o fallback informado.
function obterTextoSeguro(valor, fallback = 'Não informado') {
  if (valor === null || valor === undefined) {
    return fallback;
  }

  const texto = String(valor).trim();

  return texto !== '' ? texto : fallback;
}


// Retorna as categorias somente se forem um array.
// Evita erros caso o JSON venha com o campo ausente ou inválido.
function obterCategoriasSeguras(ponto) {
  return Array.isArray(ponto.categorias)
    ? ponto.categorias
    : [];
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
  // Evita inicializar o mapa novamente caso ele já exista
  if (mapa) return;

  // Coordenadas centrais de Salto/SP
  mapa = L.map('map').setView([-23.2014, -47.2882], 13);

  // Layout do mapa usando OpenStreetMap
  L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }
  ).addTo(mapa);

  // Grupo utilizado para gerenciar os marcadores
  marcadoresGroup = L.layerGroup().addTo(mapa);
}


// ==========================================
// CARREGAMENTO DOS DADOS DO JSON
// ==========================================

async function carregarPontos() {
  const container = document.getElementById('cards-container');

  try {
    const resposta = await fetch('assets/data/pontos.json');

    // Verifica se a requisição HTTP realmente funcionou
    if (!resposta.ok) {
      throw new Error(
        `Erro HTTP ao carregar pontos.json: ${resposta.status}`
      );
    }

    const dados = await resposta.json();

    // Fallback caso o JSON não contenha um array
    if (!Array.isArray(dados)) {
      throw new Error(
        'O arquivo pontos.json não contém uma lista válida de pontos.'
      );
    }

    todosOsPontos = dados;

    inicializarMapa();
    exibirPontosEMapa(todosOsPontos);

  } catch (erro) {
    // Erro técnico fica disponível no console para desenvolvimento
    console.error(
      'Erro ao carregar os dados do arquivo pontos.json:',
      erro
    );

    // Mensagem amigável para o usuário
    if (container) {
      container.replaceChildren();

      const mensagemErro = document.createElement('p');

      mensagemErro.textContent =
        'Não foi possível carregar os pontos de descarte. Tente novamente mais tarde.';

      container.appendChild(mensagemErro);
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
// CRIAÇÃO SEGURA DOS CARDS
// ==========================================

function criarCardPonto(ponto) {
  const card = document.createElement('article');
  card.classList.add('point-card');


  // NOME
  const titulo = document.createElement('h3');

  titulo.textContent =
    obterTextoSeguro(ponto.nome, 'Ponto de descarte');


  // ENDEREÇO
  const endereco = document.createElement('p');
  endereco.classList.add('address');

  const textoEndereco =
    obterTextoSeguro(ponto.endereco);

  const textoBairro =
    obterTextoSeguro(ponto.bairro);

  endereco.textContent =
  textoBairro === 'Não informado'
    ? textoEndereco
    : `${textoEndereco} - ${textoBairro}`;


  // MATERIAIS
  const materiais = document.createElement('p');
  materiais.classList.add('materials');

  const tituloMateriais =
    document.createElement('strong');

  tituloMateriais.textContent = 'Aceita: ';

  const textoMateriais =
    document.createTextNode(
      obterTextoSeguro(
        ponto.materiais,
        'Materiais não informados'
      )
    );

  materiais.appendChild(tituloMateriais);
  materiais.appendChild(textoMateriais);


  // BOTÃO
  const botaoDetalhes =
    document.createElement('button');

  botaoDetalhes.classList.add('btn-detalhes');
  botaoDetalhes.type = 'button';

  botaoDetalhes.textContent = 'Ver detalhes';

  botaoDetalhes.setAttribute(
    'aria-label',
    `Ver detalhes de ${obterTextoSeguro(ponto.nome)}`
  );

  botaoDetalhes.dataset.id =
    obterTextoSeguro(
      ponto.id || ponto.nome,
      'ponto'
    );


  botaoDetalhes.addEventListener('click', () => {
    abrirModalDetalhes(ponto);
  });


  // ADICIONA OS ELEMENTOS AO CARD
  card.appendChild(titulo);
  card.appendChild(endereco);
  card.appendChild(materiais);
  card.appendChild(botaoDetalhes);


  return card;
}


// ==========================================
// RENDERIZAÇÃO DOS CARDS E MARCADORES
// ==========================================

function exibirPontosEMapa(pontos) {
  const container =
    document.getElementById('cards-container');

  if (!container) return;


  // Remove os cards anteriores de forma segura
  container.replaceChildren();


  // Limpa os marcadores anteriores
  if (marcadoresGroup) {
    marcadoresGroup.clearLayers();
  }


  // Fallback caso "pontos" não seja um array
  if (!Array.isArray(pontos)) {
    const mensagem = document.createElement('p');

    mensagem.textContent =
      'Não foi possível exibir os pontos de descarte.';

    container.appendChild(mensagem);

    return;
  }


  // Nenhum resultado encontrado
  if (pontos.length === 0) {
    const mensagem = document.createElement('p');

    mensagem.textContent =
      'Nenhum ponto de descarte encontrado.';

    mensagem.style.textAlign = 'center';
    mensagem.style.padding = '1.5rem';
    mensagem.style.color = 'var(--texto-mutado)';

    container.appendChild(mensagem);


    if (mapa) {
      mapa.setView(
        [-23.2014, -47.2882],
        13
      );
    }

    return;
  }


  // Coordenadas utilizadas para calcular o enquadramento
  const bounds = [];


  pontos.forEach(ponto => {
    // Ignora valores completamente inválidos dentro do array
    if (!ponto || typeof ponto !== 'object') {
      return;
    }


    // ==============================
    // CARD
    // ==============================

    const card = criarCardPonto(ponto);

    container.appendChild(card);


    // ==============================
    // COORDENADAS
    // ==============================

    const latitude =
      parseFloat(ponto.lat);

    const longitude =
      parseFloat(ponto.lng);


    // Só cria o marcador se as coordenadas forem válidas
    if (
      !isNaN(latitude) &&
      !isNaN(longitude) &&
      marcadoresGroup
    ) {
      const latLng =
        [latitude, longitude];

      bounds.push(latLng);


      // ==============================
      // MARCADOR
      // ==============================

      const marker =
        L.marker(latLng);


      // Popup criado usando elementos DOM
      // em vez de inserir dados do JSON via innerHTML
      const popup =
        document.createElement('div');

      popup.style.textAlign = 'left';


      const nomePopup =
        document.createElement('strong');

      nomePopup.style.color = '#245C43';
      nomePopup.style.fontSize = '0.95rem';

      nomePopup.textContent =
        obterTextoSeguro(
          ponto.nome,
          'Ponto de descarte'
        );


      const bairroPopup =
        document.createElement('span');

      bairroPopup.style.fontSize = '0.82rem';
      bairroPopup.style.color = '#555';

      bairroPopup.textContent =
        obterTextoSeguro(
          ponto.bairro
        );


      popup.appendChild(nomePopup);
      popup.appendChild(
        document.createElement('br')
      );

      popup.appendChild(bairroPopup);


      marker.bindPopup(popup);


      // Ao clicar no marcador,
      // abre o modal com os detalhes
      marker.on('click', () => {
        abrirModalDetalhes(ponto);
      });


      marcadoresGroup.addLayer(marker);
    }
  });


  // ==========================================
  // AJUSTE AUTOMÁTICO DO MAPA
  // ==========================================

  if (mapa && bounds.length > 0) {
    setTimeout(() => {
      // Corrige possíveis problemas de tamanho
      // quando o mapa é renderizado/redimensionado
      mapa.invalidateSize();


      if (bounds.length === 1) {
        mapa.setView(
          bounds[0],
          15
        );

      } else {
        mapa.fitBounds(
          bounds,
          {
            padding: [40, 40]
          }
        );
      }

    }, 100);
  }
}


// ==========================================
// NORMALIZAÇÃO DE TEXTO
// ==========================================

function normalizarTexto(texto) {
  if (
    texto === null ||
    texto === undefined
  ) {
    return '';
  }


  return String(texto)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}


// ==========================================
// FILTRAGEM (COM SKELETON)
// ==========================================

function filtrarPontos(termoBusca) {
  const termo = termoBusca.toLowerCase().trim();

  return pontos.filter(ponto => {
    const nome = ponto.nome ? ponto.nome.toLowerCase() : '';
    const bairro = ponto.bairro ? ponto.bairro.toLowerCase() : '';
    const tipo = ponto.tipo_ponto ? ponto.tipo_ponto.toLowerCase() : '';
    const materiais = ponto.materiais ? ponto.materiais.toLowerCase() : '';

    // Retorna true se a palavra pesquisada estiver em qualquer um desses campos
    return nome.includes(termo) || 
           bairro.includes(termo) || 
           tipo.includes(termo) || 
           materiais.includes(termo);
  });
}

function aplicarFiltros() {
  if (!Array.isArray(todosOsPontos) || todosOsPontos.length === 0) return;

  // Mostra a animação de carregamento enquanto filtra
  exibirSkeletonCards();


  const inputBusca =
    document.getElementById('input-busca');


  const termoBusca =
    normalizarTexto(
      inputBusca
        ? inputBusca.value.trim()
        : ''
    );


  const pontosFiltrados =
    todosOsPontos.filter(ponto => {

      if (
        !ponto ||
        typeof ponto !== 'object'
      ) {
        return false;
      }


      const categorias =
        obterCategoriasSeguras(ponto);


      // Une os campos pesquisáveis
      const textoPonto =
        normalizarTexto(
          `
            ${obterTextoSeguro(ponto.nome, '')}
            ${obterTextoSeguro(ponto.bairro, '')}
            ${obterTextoSeguro(ponto.endereco, '')}
            ${obterTextoSeguro(ponto.materiais, '')}
            ${obterTextoSeguro(ponto.categoria, '')}
            ${categorias.join(' ')}
          `
        );


      // ==============================
      // BUSCA POR TEXTO
      // ==============================

      const bateTexto =
        termoBusca === '' ||
        textoPonto.includes(termoBusca);


      // ==============================
      // BUSCA POR CATEGORIA
      // ==============================

      let bateCategoria = false;


      if (categoriaAtiva === 'todos') {
        bateCategoria = true;


      } else if (categoriaAtiva === 'pilhas') {
        bateCategoria =
          textoPonto.includes('pilha') ||
          textoPonto.includes('bateria');


      } else if (categoriaAtiva === 'outros') {
        bateCategoria =
          textoPonto.includes('outros') ||
          textoPonto.includes('entulho') ||
          textoPonto.includes('lampada') ||
          textoPonto.includes('moveis') ||
          textoPonto.includes('poda');


      } else {
        const catBusca =
          normalizarTexto(categoriaAtiva);


        bateCategoria =
          textoPonto.includes(catBusca) ||

          categorias.some(categoria =>
            normalizarTexto(categoria)
              .includes(catBusca)
          );
      }


      return bateTexto && bateCategoria;
    });


  setTimeout(() => {
    exibirPontosEMapa(
      pontosFiltrados
    );
  }, 250);
}


// ==========================================
// FUNÇÕES AUXILIARES DE UX
// ==========================================

// Rola a tela suavemente até a seção de resultados no mobile
function rolarParaResultados() {
  const secaoPontos = document.getElementById('pontos-de-coleta');
  if (secaoPontos) {
    secaoPontos.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Reseta a seleção visual e lógica das categorias para "Todos"
function resetarCategoriasParaTodos() {
  categoriaAtiva = 'todos';

  const botoesCategoria = document.querySelectorAll('.category-btn');
  botoesCategoria.forEach(botao => {
    botao.classList.remove('active');
    botao.setAttribute('aria-pressed', 'false');
  });

  const btnTodos = document.querySelector('.category-btn[data-category="todos"]');
  if (btnTodos) {
    btnTodos.classList.add('active');
    btnTodos.setAttribute('aria-pressed', 'true');
  }
}

// Timer para controlar o scroll suave enquanto o usuário digita
let timerScrollBusca = null;

// ==========================================
// EVENTOS DE BUSCA (BOTÃO BUSCAR / LIMPAR / INPUT)
// ==========================================

const inputBusca = document.getElementById('input-busca');
const btnBuscar = document.getElementById('btn-buscar');
const formBusca = document.getElementById('form-busca');

// Alterna o botão entre "Buscar" e "Limpar"
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
    const termo = inputBusca.value.trim();

    // Se começou a digitar, reseta a categoria ativa para "Todos"
    if (termo !== '') {
      resetarCategoriasParaTodos();
    }

    atualizarEstadoBotaoBusca();
    aplicarFiltros();

    // Aguarda o usuário fazer uma breve pausa na digitação (800ms) para rolar a tela
    clearTimeout(timerScrollBusca);
    if (termo.length >= 2) {
      timerScrollBusca = setTimeout(() => {
        rolarParaResultados();
      }, 800);
    }
  });
}

// Gerencia o envio do formulário (Clique no botão ou tecla Enter)
if (formBusca) {
  formBusca.addEventListener('submit', (evento) => {
    evento.preventDefault();

    // Se o botão está no estado "Limpar"
    if (inputBusca && inputBusca.value.trim() !== '') {
      inputBusca.value = '';
      clearTimeout(timerScrollBusca);
      atualizarEstadoBotaoBusca();
      aplicarFiltros();
      inputBusca.focus();
      // Não rola ao apenas limpar
    } else {
      aplicarFiltros();
      rolarParaResultados(); // Rola ao dar Enter ou clicar em Buscar
    }
  });
}

// ==========================================
// BOTÕES DE CATEGORIA (ARIA-PRESSED)
// ==========================================

const botoesCategoria = document.querySelectorAll('.category-btn');

botoesCategoria.forEach(botao => {
  botao.addEventListener('click', () => {
    const categoria = botao.getAttribute('data-category');

    // Ao clicar em uma categoria, limpa o texto digitado na busca
    if (inputBusca && inputBusca.value !== '') {
      inputBusca.value = '';
      clearTimeout(timerScrollBusca);
      atualizarEstadoBotaoBusca();
    }

    // Clicou novamente na categoria ativa: volta para "todos"
    if (categoriaAtiva === categoria) {
      resetarCategoriasParaTodos();
    } else {
      botoesCategoria.forEach(outroBotao => {
        outroBotao.classList.remove('active');
        outroBotao.setAttribute('aria-pressed', 'false');
      });

      categoriaAtiva = categoria;

      botao.classList.add('active');
      botao.setAttribute('aria-pressed', 'true');
    }

    aplicarFiltros();
    rolarParaResultados(); // Rola suavemente até os resultados no mobile
  });
});

// ==========================================
// MODAIS (ACESSÍVEIS)
// ==========================================

const modalSobre =
  document.getElementById('modal-sobre');

const btnOpenSobre =
  document.getElementById('btn-open-sobre');

const btnCloseSobre =
  document.getElementById('btn-close-sobre');


const modalDetalhes =
  document.getElementById('modal-detalhes');

const btnCloseDetalhes =
  document.getElementById('btn-close-detalhes');


// Abre um modal, atualiza o ARIA e foca no botão de fechar
function abrirModal(modal) {
  if (!modal) return;

  modal.classList.add('active');
  modal.removeAttribute('aria-hidden');

  const btnFechar = modal.querySelector('.modal-close');
  if (btnFechar) btnFechar.focus();
}


// Fecha um modal e atualiza o ARIA
function fecharModal(modal) {
  if (!modal) return;

  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
}


// ==========================================
// MODAL SOBRE
// ==========================================

if (
  btnOpenSobre &&
  modalSobre
) {
  btnOpenSobre.addEventListener(
    'click',
    () => {
      abrirModal(modalSobre);

      // Recalcula o tamanho do mapa após alterações
      // de layout causadas pela interface
      if (mapa) {
        setTimeout(() => {
          mapa.invalidateSize();
        }, 100);
      }
    }
  );
}


if (
  btnCloseSobre &&
  modalSobre
) {
  btnCloseSobre.addEventListener(
    'click',
    () => {
      fecharModal(modalSobre);
    }
  );
}


// ==========================================
// MODAL DE DETALHES
// ==========================================

function abrirModalDetalhes(ponto) {
  const modalBody = document.getElementById('modal-detalhes-body');

  if (!modalBody || !modalDetalhes || !ponto) {
    return;
  }

  // Remove o conteúdo anterior
  modalBody.replaceChildren();

  // ==============================
  // NOME
  // ==============================
  const titulo = document.createElement('h2');
  titulo.style.color = 'var(--verde-escuro)';
  titulo.style.marginBottom = '0.5rem';
  titulo.textContent = obterTextoSeguro(ponto.nome, 'Ponto de descarte');

  // ==============================
  // ENDEREÇO
  // ==============================
  const endereco = document.createElement('p');
  const enderecoStrong = document.createElement('strong');
  enderecoStrong.textContent = 'Endereço: ';

  const enderecoTexto = document.createTextNode(
    obterTextoSeguro(ponto.bairro) === 'Não informado'
      ? obterTextoSeguro(ponto.endereco)
      : `${obterTextoSeguro(ponto.endereco)} - ${obterTextoSeguro(ponto.bairro)}`
  );

  endereco.appendChild(enderecoStrong);
  endereco.appendChild(enderecoTexto);

  // ==============================
  // TELEFONE (NOVO BLOCO)
  // ==============================
  let telefoneEl = null;
  if (ponto.telefone && typeof ponto.telefone === 'string' && ponto.telefone.trim() !== '') {
    telefoneEl = document.createElement('p');
    telefoneEl.style.marginTop = '0.5rem';

    const telefoneStrong = document.createElement('strong');
    telefoneStrong.textContent = 'Telefone: ';

    const telefoneLink = document.createElement('a');
    telefoneLink.href = `tel:${ponto.telefone.replace(/\D/g, '')}`;
    telefoneLink.textContent = ponto.telefone;
    telefoneLink.style.color = 'var(--verde-escuro)';

    telefoneEl.appendChild(telefoneStrong);
    telefoneEl.appendChild(telefoneLink);
  }

  // ==============================
  // MATERIAIS
  // ==============================
  const materiais = document.createElement('p');
  materiais.style.marginTop = '0.5rem';

  const materiaisStrong = document.createElement('strong');
  materiaisStrong.textContent = 'Materiais aceitos: ';

  materiais.appendChild(materiaisStrong);
  materiais.appendChild(
    document.createTextNode(
      obterTextoSeguro(ponto.materiais, 'Não informado')
    )
  );

  // ==============================
  // HORÁRIO
  // ==============================
  const horario = document.createElement('p');
  horario.style.marginTop = '0.5rem';

  const horarioStrong = document.createElement('strong');
  horarioStrong.textContent = 'Horário de Funcionamento: ';

  horario.appendChild(horarioStrong);
  horario.appendChild(
    document.createTextNode(
      obterTextoSeguro(ponto.horario, 'Não informado')
    )
  );

  // Adiciona os elementos ao modal
  modalBody.appendChild(titulo);
  modalBody.appendChild(endereco);
  if (telefoneEl) {
    modalBody.appendChild(telefoneEl);
  }
  modalBody.appendChild(materiais);
  modalBody.appendChild(horario);

  // ==============================
  // GOOGLE MAPS
  // ==============================
  if (
    typeof ponto.link_maps === 'string' &&
    ponto.link_maps.trim() !== ''
  ) {
    try {
      const urlMaps = new URL(ponto.link_maps);

      // Aceita apenas HTTP ou HTTPS
      if (
        urlMaps.protocol === 'http:' ||
        urlMaps.protocol === 'https:'
      ) {
        const botaoMaps = document.createElement('a');
        botaoMaps.href = urlMaps.href;
        botaoMaps.target = '_blank';
        botaoMaps.rel = 'noopener noreferrer';
        botaoMaps.classList.add('btn-maps');
        botaoMaps.style.display = 'inline-block';
        botaoMaps.style.marginTop = '1rem';
        botaoMaps.textContent = 'Ver no Google Maps 📍';

        modalBody.appendChild(botaoMaps);
      }
    } catch {
      // Caso link_maps seja inválido, não exibe o botão.
    }
  }

  abrirModal(modalDetalhes);

  // Garante que o Leaflet recalcule o mapa
  if (mapa) {
    setTimeout(() => {
      mapa.invalidateSize();
    }, 100);
  }
}

// ==========================================
// FECHAMENTO DOS MODAIS
// ==========================================

if (
  btnCloseDetalhes &&
  modalDetalhes
) {
  btnCloseDetalhes.addEventListener(
    'click',
    () => {
      fecharModal(modalDetalhes);
    }
  );
}


// Fecha ao clicar no fundo escurecido
window.addEventListener(
  'click',
  (evento) => {

    if (
      modalSobre &&
      evento.target === modalSobre
    ) {
      fecharModal(modalSobre);
    }


    if (
      modalDetalhes &&
      evento.target === modalDetalhes
    ) {
      fecharModal(modalDetalhes);
    }
  }
);


// Fecha com ESC
window.addEventListener(
  'keydown',
  (evento) => {

    if (evento.key !== 'Escape') {
      return;
    }


    fecharModal(modalSobre);
    fecharModal(modalDetalhes);
  }
);


// ==========================================
// REDIMENSIONAMENTO DO MAPA
// ==========================================

window.addEventListener(
  'resize',
  () => {

    if (mapa) {
      mapa.invalidateSize();
    }
  }
);


// ==========================================
// BOTÃO "VOLTAR AO TOPO"
// ==========================================

const btnTop =
  document.getElementById('btn-top');


if (btnTop) {
  window.addEventListener(
    'scroll',
    () => {

      if (window.scrollY > 300) {
        btnTop.classList.add('show');

      } else {
        btnTop.classList.remove('show');
      }
    }
  );


  btnTop.addEventListener(
    'click',
    () => {

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  );
}


// ==========================================
// INICIALIZAÇÃO DO PROJETO
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  carregarPontos();
  ajustarPlaceholderBusca();
});

window.addEventListener('resize', ajustarPlaceholderBusca);