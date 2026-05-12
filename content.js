const CONFIG = {
  tempoEsperaLeitura: 120000,   // 2 minutos por página
  tempoPensarResposta: 8000,    
  tempoProximaPergunta: 4000     
};

const URL_BANCO = "githubusercontent.com";

const esperar = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Função para buscar o banco de dados atualizado do seu GitHub
async function buscarBancoDeRespostas() {
  try {
    const resposta = await fetch(URL_BANCO);
    if (!resposta.ok) return [];
    return await resposta.json();
  } catch (erro) {
    console.error("[Leia SP Helper] Erro ao buscar banco de dados:", erro);
    return [];
  }
}

async function executarAutomacao() {
  console.log("[Leia SP Helper] Verificando estado da página...");

  // 1. MÓDULO DE LEITURA
  const areaLivro = document.querySelector('.book-reader, #reader-container, .pagina-livro'); 
  if (areaLivro) {
    console.log("[Leia SP Helper] Livro detectado. Iniciando leitura simulada...");
    
    for (let i = 0; i < 4; i++) {
      window.scrollBy({ top: window.innerHeight / 4, behavior: 'smooth' });
      await esperar(3000);
    }

    console.log("[Leia SP Helper] Pausa de segurança ativa: aguardando 2 minutos...");
    await esperar(CONFIG.tempoEsperaLeitura);

    const botaoAvancar = document.querySelector('.btn-next, [aria-label="Próxima página"], .next-page-btn');
    if (botaoAvancar) {
      botaoAvancar.click();
      console.log("[Leia SP Helper] 2 minutos concluídos. Avançando de página.");
    }
  }

  // 2. MÓDULO DO QUIZ INTELIGENTE
  const alternativas = document.querySelectorAll('.alternative-item, .opcao-resposta, [role="radio"], .quiz-option');
  if (alternativas.length > 0) {
    console.log("[Leia SP Helper] Quiz detectado. Buscando gabarito...");
    await esperar(CONFIG.tempoPensarResposta);

    // Tenta capturar os elementos de texto da página (classes comuns do Elefante Letrado)
    const elementoTitulo = document.querySelector('.book-title, .titulo-livro, h2');
    const elementoPergunta = document.querySelector('.question-text, .texto-pergunta, p');
    
    let tituloAtual = elementoTitulo ? elementoTitulo.innerText.trim() : "";
    let perguntaAtual = elementoPergunta ? elementoPergunta.innerText.trim() : "";

    const listaRespostas = await buscarBancoDeRespostas();
    
    // Procura se a pergunta exata desse livro já está no seu JSON
    const respostaEncontrada = listaRespostas.find(r => r.livro === tituloAtual && r.pergunta === perguntaAtual);
    let clicou = false;

    if (respostaEncontrada) {
      console.log("[Leia SP Helper] Resposta encontrada no gabarito: " + respostaEncontrada.correta);
      alternativas.forEach(opcao => {
        if (opcao.innerText.trim() === respostaEncontrada.correta) {
          opcao.click();
          clicou = true;
        }
      });
    }

    // Se não tiver a resposta salva no banco, chuta uma aleatória para não travar o fluxo
    if (!clicou) {
      console.log("[Leia SP Helper] Pergunta não mapeada. Selecionando opção aleatória...");
      const indiceAleatorio = Math.floor(Math.random() * alternativas.length);
      alternativas[indiceAleatorio].click();
    }

    await esperar(CONFIG.tempoProximaPergunta);
    const botaoConfirmar = document.querySelector('.btn-confirm, .responder-btn, .quiz-submit, button[type="submit"]');
    if (botaoConfirmar) {
      botaoConfirmar.click();
    }
  }
}

setInterval(executarAutomacao, 5000);
