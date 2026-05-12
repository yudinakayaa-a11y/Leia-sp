const CONFIG = {
  tempoEsperaLeitura: 120000,   // 2 minutos (120.000ms) obrigatórios por página
  tempoPensarResposta: 8000,    // 8 segundos antes de clicar na resposta do quiz
  tempoProximaPergunta: 4000     // 4 segundos após responder para ir para a próxima
};

const esperar = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function executarAutomacao() {
  console.log("[Leia SP Helper] Verificando estado da página...");

  const areaLivro = document.querySelector('.book-reader, #reader-container, .pagina-livro'); 
  if (areaLivro) {
    console.log("[Leia SP Helper] Livro detectado. Iniciando leitura simulada...");
    
    for (let i = 0; i < 4; i++) {
      window.scrollBy({ top: window.innerHeight / 4, behavior: 'smooth' });
      await esperar(3000);
    }

    console.log(`[Leia SP Helper] Pausa de segurança ativa: aguardando 2 minutos nesta página...`);
    await esperar(CONFIG.tempoEsperaLeitura);

    const botaoAvancar = document.querySelector('.btn-next, [aria-label="Próxima página"], .next-page-btn');
    if (botaoAvancar) {
      botaoAvancar.click();
      console.log("[Leia SP Helper] 2 minutos concluídos. Avançando de página.");
    }
  }

  const alternativas = document.querySelectorAll('.alternative-item, .opcao-resposta, [role="radio"], .quiz-option');
  if (alternativas.length > 0) {
    console.log(`[Leia SP Helper] Quiz detectado com ${alternativas.length} alternativas.`);
    await esperar(CONFIG.tempoPensarResposta);

    const indiceAleatorio = Math.floor(Math.random() * alternativas.length);
    alternativas[indiceAleatorio].click();
    console.log(`[Leia SP Helper] Alternativa ${indiceAleatorio + 1} selecionada.`);

    await esperar(CONFIG.tempoProximaPergunta);

    const botaoConfirmar = document.querySelector('.btn-confirm, .responder-btn, .quiz-submit, button[type="submit"]');
    if (botaoConfirmar) {
      botaoConfirmar.click();
      console.log("[Leia SP Helper] Resposta confirmada.");
    }
  }
}

setInterval(executarAutomacao, 5000);
  
