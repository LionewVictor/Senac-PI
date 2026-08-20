document.addEventListener("DOMContentLoaded", () => {
  // ============================================================
  // API
  // ============================================================

  const API_URL = `http://${window.location.hostname}:3000`;

  // ============================================================
  // ELEMENTOS
  // ============================================================

  const botoesSalvar = document.querySelectorAll(".save-button");

  const arquivoPlanilha = document.getElementById("arquivoPlanilha");

  const arquivoSelecionado = document.getElementById("arquivoSelecionado");

  const btnImportar = document.getElementById("btnImportar");

  const tipoImportacao = document.getElementById("tipoImportacao");

  const resultadoImportacao = document.getElementById("resultadoImportacao");

  // ============================================================
  // API
  // ============================================================

  async function requisicao(rota, opcoes = {}) {
    const resposta = await fetch(`${API_URL}${rota}`, {
      ...opcoes,
      credentials: "include",
    });

    let resultado;

    try {
      resultado = await resposta.json();
    } catch {
      throw new Error("O servidor retornou uma resposta inválida.");
    }

    if (!resposta.ok || !resultado.sucesso) {
      throw new Error(
        resultado.mensagem || "Erro na comunicação com o servidor.",
      );
    }

    return resultado;
  }

  // ============================================================
  // MENSAGEM
  // ============================================================

  function mostrarMensagem(mensagem, tipo = "success") {
    let elemento = document.getElementById("configMessage");

    if (!elemento) {
      elemento = document.createElement("div");

      elemento.id = "configMessage";

      elemento.className = "config-message";

      document.body.appendChild(elemento);
    }

    elemento.textContent = mensagem;

    elemento.className = `config-message show ${tipo}`;

    clearTimeout(elemento._timer);

    elemento._timer = setTimeout(() => {
      elemento.classList.remove("show");
    }, 4000);
  }

  // ============================================================
  // CONFIGURAÇÕES DO SISTEMA
  // ============================================================

  async function carregarConfiguracoes() {
    try {
      const resultado = await requisicao("/api/configuracoes");

      const dados = resultado.dados || {};

      Object.entries(dados).forEach(([chave, valor]) => {
        const campo = document.querySelector(`[data-setting="${chave}"]`);

        if (!campo) {
          return;
        }

        campo.value = valor ?? "";
      });
    } catch (erro) {
      console.error("Erro ao carregar configurações:", erro);
    }
  }

  // ============================================================
  // COLETAR CONFIGURAÇÕES
  // ============================================================

  function coletarConfiguracoes(grupo) {
    const botao = document.querySelector(`[data-save-group="${grupo}"]`);

    if (!botao) {
      return {};
    }

    const card = botao.closest(".settings-card");

    if (!card) {
      return {};
    }

    const campos = card.querySelectorAll("[data-setting]");

    const dados = {};

    campos.forEach((campo) => {
      dados[campo.dataset.setting] = campo.value;
    });

    return dados;
  }

  // ============================================================
  // SALVAR CONFIGURAÇÕES
  // ============================================================

  botoesSalvar.forEach((botao) => {
    botao.addEventListener("click", async () => {
      const grupo = botao.dataset.saveGroup;

      const dados = coletarConfiguracoes(grupo);

      if (Object.keys(dados).length === 0) {
        return;
      }

      const textoOriginal = botao.innerHTML;

      botao.disabled = true;

      botao.innerHTML = `
                            <i class="fa-solid fa-spinner fa-spin"></i>
                            Salvando...
                        `;

      try {
        await requisicao("/api/configuracoes", {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(dados),
        });

        mostrarMensagem("Configurações salvas com sucesso.");
      } catch (erro) {
        console.error("Erro ao salvar configurações:", erro);

        mostrarMensagem(erro.message, "error");
      } finally {
        botao.disabled = false;

        botao.innerHTML = textoOriginal;
      }
    });
  });

  // ============================================================
  // BOTÕES "GERENCIAR"
  // ============================================================

  document.querySelectorAll(".manage-link").forEach((botao) => {
    botao.addEventListener("click", () => {
      mostrarMensagem(
        `A área "${botao.dataset.section}" será implementada posteriormente.`,
      );
    });
  });

  // ============================================================
  // ARQUIVO
  // ============================================================

  arquivoPlanilha?.addEventListener("change", () => {
    const arquivo = arquivoPlanilha.files[0];

    if (!arquivo) {
      arquivoSelecionado.textContent = "Nenhum arquivo selecionado.";

      atualizarBotaoImportacao();

      return;
    }

    arquivoSelecionado.textContent = `${arquivo.name} (${formatarTamanho(arquivo.size)})`;

    atualizarBotaoImportacao();
  });

  tipoImportacao?.addEventListener("change", atualizarBotaoImportacao);

  function atualizarBotaoImportacao() {
    if (!btnImportar) {
      return;
    }

    btnImportar.disabled = !(
      tipoImportacao?.value && arquivoPlanilha?.files.length
    );
  }

  function formatarTamanho(bytes) {
    if (!bytes) {
      return "0 KB";
    }

    const kb = bytes / 1024;

    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    }

    return `${(kb / 1024).toFixed(1)} MB`;
  }

  // ============================================================
  // NORMALIZAR TEXTO
  // ============================================================

  function normalizarTexto(texto) {
    return String(texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  // ============================================================
  // NORMALIZAR CABEÇALHO
  // ============================================================

  function normalizarCabecalho(texto) {
    return String(texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  }

  // ============================================================
  // OBTER VALOR DE UMA COLUNA
  // ============================================================

  function obterValor(linha, aliases) {
    const chaves = Object.keys(linha);

    for (const chave of chaves) {
      const chaveNormalizada = normalizarCabecalho(chave);

      for (const alias of aliases) {
        if (chaveNormalizada === normalizarCabecalho(alias)) {
          return String(linha[chave] ?? "").trim();
        }
      }
    }

    return "";
  }

  // ============================================================
  // CONVERTER PROFESSOR
  // ============================================================

  function converterProfessor(linha) {
    return {
      nome: obterValor(linha, [
        "Nome Professor",
        "Professor",
        "Nome do Professor",
        "Pessoa",
        "Nome",
      ]),

      email: obterValor(linha, ["E-mail", "Email", "E mail"]),

      cpf: obterValor(linha, ["CPF"]),

      telefone: obterValor(linha, ["Telefone", "Celular"]),

      cidade: obterValor(linha, ["Cidade"]),

      area: obterValor(linha, ["Área", "Area"]),

      horas: obterValor(linha, [
        "Horas",
        "Horas Contratadas",
        "Carga Horária",
        "Carga Horaria",
      ]),

      status: obterValor(linha, ["Status"]) || "disponivel",
    };
  }

  // ============================================================
  // CONVERTER ALOCAÇÃO
  // ============================================================

  function converterAlocacao(linha) {
    return {
      nomeProfessor: obterValor(linha, [
        "Nome Professor",
        "Professor",
        "Nome do Professor",
        "Pessoa",
      ]),

      cidade: obterValor(linha, ["Cidade"]),

      edital: obterValor(linha, ["Edital"]),

      dia: obterValor(linha, ["Dia da Semana", "Dia", "Dia da semana"]),

      horario: obterValor(linha, ["Horário", "Horario", "Hora"]),

      codigo: obterValor(linha, ["Código", "Codigo"]),

      turma: obterValor(linha, ["Turma"]),

      curso: obterValor(linha, ["Curso", "Disciplina", "Curso / Disciplina"]),

      cronograma: obterValor(linha, ["Cronograma", "Cronogramas"]),

      assistente: obterValor(linha, [
        "Assistente Administrativo",
        "Assistente Adm",
        "Assistente",
      ]),

      periodo: obterValor(linha, ["Período", "Periodo"]),

      pratica: obterValor(linha, [
        "Prática / PI",
        "Pratica / PI",
        "Prática",
        "Pratica",
        "PI",
      ]),

      instrutor: obterValor(linha, ["Instrutor"]),

      insumos: obterValor(linha, ["Insumos"]),

      material: obterValor(linha, [
        "Material (PTD)",
        "Material PTD",
        "Material",
      ]),

      avaliacao: obterValor(linha, ["Avaliação", "Avaliacao"]),

      feedback: obterValor(linha, ["Feedback"]),
    };
  }

  // ============================================================
  // NORMALIZAR STATUS DA DISPONIBILIDADE
  // ============================================================

  function normalizarStatusDisponibilidade(status) {
    const valor = normalizarTexto(status);

    if (valor === "disponivel") {
      return "disponivel";
    }

    if (valor === "disponivelem breve" || valor === "disponivel em breve") {
      return "breve";
    }

    if (
      valor === "indisponivel" ||
      valor === "afastado" ||
      valor === "ferias"
    ) {
      return "indisponivel";
    }

    if (valor === "seminformacao" || valor === "sem informacao") {
      return "sem_info";
    }

    if (valor === "breve") {
      return "breve";
    }

    return "sem_info";
  }

  // ============================================================
  // CONVERTER DISPONIBILIDADE
  // ============================================================

  function converterDisponibilidade(linha) {
    return {
      nomeProfessor: obterValor(linha, [
        "Professor",
        "Nome Professor",
        "Nome do Professor",
      ]),

      dia: obterValor(linha, ["Dia da Semana", "Dia"]),

      periodo: obterValor(linha, ["Período", "Periodo"]),

      status: normalizarStatusDisponibilidade(obterValor(linha, ["Status"])),

      horarioInicio: obterValor(linha, [
        "Horário Inicial",
        "Horario Inicial",
        "Hora Inicial",
      ]),

      horarioFim: obterValor(linha, [
        "Horário Final",
        "Horario Final",
        "Hora Final",
      ]),

      observacao: obterValor(linha, ["Observação", "Observacao"]),
    };
  }

  // ============================================================
  // CARREGAR PROFESSORES
  // ============================================================

  async function carregarProfessores() {
    const resultado = await requisicao("/api/professores");

    return resultado.dados || [];
  }

  // ============================================================
  // ENCONTRAR PROFESSOR
  // ============================================================

  function encontrarProfessor(professores, nome) {
    return professores.find(
      (professor) => normalizarTexto(professor.nome) === normalizarTexto(nome),
    );
  }

  // ============================================================
  // CADASTRAR PROFESSOR
  // ============================================================

  async function cadastrarProfessor(dados) {
    if (!dados.nome) {
      throw new Error("O nome do professor não foi informado.");
    }

    if (!dados.email) {
      throw new Error(
        `O professor "${dados.nome}" não possui e-mail na planilha.`,
      );
    }

    const formData = new FormData();

    formData.append("nome_completo", dados.nome);

    formData.append("email", dados.email);

    if (dados.cpf) {
      formData.append("cpf", dados.cpf);
    }

    if (dados.telefone) {
      formData.append("telefone", dados.telefone);
    }

    if (dados.cidade) {
      formData.append("unidade_vinculo", dados.cidade);
    }

    if (dados.area) {
      formData.append("area", dados.area);
    }

    if (dados.horas) {
      formData.append("horas_contratadas", dados.horas);
    }

    formData.append("status", dados.status);

    const resposta = await fetch(`${API_URL}/api/professores`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    const resultado = await resposta.json();

    if (!resposta.ok || !resultado.sucesso) {
      throw new Error(resultado.mensagem || `Erro ao cadastrar ${dados.nome}.`);
    }

    return resultado;
  }

  // ============================================================
  // IMPORTAR PROFESSORES
  // ============================================================

  async function importarProfessores(linhas) {
    let professores = await carregarProfessores();

    const resultado = {
      total: linhas.length,

      importados: 0,

      existentes: 0,

      erros: 0,

      mensagens: [],
    };

    for (let indice = 0; indice < linhas.length; indice++) {
      const dados = converterProfessor(linhas[indice]);

      if (!dados.nome) {
        resultado.erros++;

        resultado.mensagens.push(`Linha ${indice + 2}: nome não informado.`);

        continue;
      }

      const existente = encontrarProfessor(professores, dados.nome);

      if (existente) {
        resultado.existentes++;

        continue;
      }

      try {
        await cadastrarProfessor(dados);

        resultado.importados++;

        professores = await carregarProfessores();
      } catch (erro) {
        resultado.erros++;

        resultado.mensagens.push(
          `Linha ${indice + 2} - ${dados.nome}: ${erro.message}`,
        );
      }
    }

    return resultado;
  }

  // ============================================================
  // IMPORTAR ALOCAÇÕES
  // ============================================================

  async function importarAlocacoes(linhas, professores) {
    const resultado = {
      total: linhas.length,

      importados: 0,

      ignorados: 0,

      erros: 0,

      professoresNaoEncontrados: [],

      mensagens: [],
    };

    for (let indice = 0; indice < linhas.length; indice++) {
      const dados = converterAlocacao(linhas[indice]);

      if (!dados.nomeProfessor) {
        resultado.ignorados++;

        resultado.mensagens.push(
          `Linha ${indice + 2}: professor não informado.`,
        );

        continue;
      }

      const professor = encontrarProfessor(professores, dados.nomeProfessor);

      if (!professor) {
        resultado.ignorados++;

        if (
          !resultado.professoresNaoEncontrados.includes(dados.nomeProfessor)
        ) {
          resultado.professoresNaoEncontrados.push(dados.nomeProfessor);
        }

        continue;
      }

      if (!dados.dia || !dados.horario) {
        resultado.ignorados++;

        resultado.mensagens.push(
          `Linha ${indice + 2}: dia ou horário não informado.`,
        );

        continue;
      }

      const corpo = {
        professor_id: Number(professor.id),

        instrutor: dados.instrutor,

        cidade: dados.cidade,

        edital: dados.edital,

        dia_da_semana: dados.dia,

        horario: dados.horario,

        codigo: dados.codigo,

        turma: dados.turma,

        curso: dados.curso,

        cronograma: dados.cronograma,

        assistente_administrativo: dados.assistente,

        periodo: dados.periodo,

        pratica_pi: dados.pratica,

        insumos: dados.insumos,

        material_ptd: dados.material,

        avaliacao: dados.avaliacao,

        feedback: dados.feedback,

        status: "pendente",
      };

      try {
        await requisicao("/api/alocacoes", {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(corpo),
        });

        resultado.importados++;
      } catch (erro) {
        resultado.erros++;

        resultado.mensagens.push(`Linha ${indice + 2}: ${erro.message}`);
      }
    }

    return resultado;
  }

  // ============================================================
  // IMPORTAR DISPONIBILIDADES
  // ============================================================

  async function importarDisponibilidades(linhas, professores) {
    const resultado = {
      total: linhas.length,

      professoresAtualizados: 0,

      celulasSalvas: 0,

      ignorados: 0,

      erros: 0,

      professoresNaoEncontrados: [],

      mensagens: [],
    };

    /*
     * Agrupa as 21 linhas de cada professor.
     */

    const grupos = new Map();

    linhas.forEach((linha, indice) => {
      const dados = converterDisponibilidade(linha);

      if (!dados.nomeProfessor) {
        resultado.ignorados++;

        resultado.mensagens.push(
          `Linha ${indice + 2}: professor não informado.`,
        );

        return;
      }

      if (!dados.dia || !dados.periodo) {
        resultado.ignorados++;

        resultado.mensagens.push(
          `Linha ${indice + 2}: dia ou período não informado.`,
        );

        return;
      }

      const chave = normalizarTexto(dados.nomeProfessor);

      if (!grupos.has(chave)) {
        grupos.set(chave, []);
      }

      grupos.get(chave).push(dados);
    });

    for (const [nomeNormalizado, lista] of grupos) {
      const primeira = lista[0];

      const professor = encontrarProfessor(professores, primeira.nomeProfessor);

      if (!professor) {
        resultado.ignorados++;

        if (
          !resultado.professoresNaoEncontrados.includes(primeira.nomeProfessor)
        ) {
          resultado.professoresNaoEncontrados.push(primeira.nomeProfessor);
        }

        continue;
      }

      const disponibilidades = lista.map((item) => ({
        dia_da_semana: item.dia,

        periodo: normalizarTexto(item.periodo),

        horario_inicio: item.horarioInicio || null,

        horario_fim: item.horarioFim || null,

        status: item.status,

        observacao: item.observacao || null,
      }));

      try {
        await requisicao(`/api/professores/${professor.id}/disponibilidade`, {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            disponibilidades,
          }),
        });

        resultado.professoresAtualizados++;

        resultado.celulasSalvas += disponibilidades.length;
      } catch (erro) {
        resultado.erros++;

        resultado.mensagens.push(
          `Professor ${professor.nome}: ${erro.message}`,
        );
      }
    }

    return resultado;
  }

  // ============================================================
  // RESULTADO
  // ============================================================

  function limparResultado() {
    if (resultadoImportacao) {
      resultadoImportacao.innerHTML = "";
    }
  }

  function adicionarResultado(titulo, html) {
    if (!resultadoImportacao) {
      return;
    }

    const bloco = document.createElement("div");

    bloco.className = "import-result-block";

    bloco.innerHTML = `
                <strong>
                    ${titulo}
                </strong>

                ${html}
            `;

    resultadoImportacao.appendChild(bloco);
  }

  function adicionarMensagens(mensagens) {
    if (!mensagens || !mensagens.length || !resultadoImportacao) {
      return;
    }

    const detalhes = document.createElement("details");

    const summary = document.createElement("summary");

    summary.textContent = "Ver detalhes";

    const lista = document.createElement("ul");

    mensagens.slice(0, 50).forEach((mensagem) => {
      const item = document.createElement("li");

      item.textContent = mensagem;

      lista.appendChild(item);
    });

    detalhes.appendChild(summary);

    detalhes.appendChild(lista);

    resultadoImportacao.appendChild(detalhes);
  }

  // ============================================================
  // IMPORTAR PLANILHA
  // ============================================================

  btnImportar?.addEventListener("click", async () => {
    const arquivo = arquivoPlanilha?.files[0];

    const tipo = tipoImportacao?.value;

    if (!arquivo) {
      mostrarMensagem("Selecione uma planilha.", "error");

      return;
    }

    if (!tipo) {
      mostrarMensagem("Selecione o tipo de dados.", "error");

      return;
    }

    if (typeof XLSX === "undefined") {
      mostrarMensagem("A biblioteca de Excel não foi carregada.", "error");

      return;
    }

    const textoOriginal = btnImportar.innerHTML;

    btnImportar.disabled = true;

    limparResultado();

    try {
      // ------------------------------------------------
      // LER TODAS AS ABAS
      // ------------------------------------------------

      btnImportar.innerHTML = `
                        <i class="fa-solid fa-spinner fa-spin"></i>
                        Lendo planilha...
                    `;

      const buffer = await arquivo.arrayBuffer();

      const workbook = XLSX.read(buffer, {
        type: "array",
        cellDates: true,
      });

      if (!workbook.SheetNames.length) {
        throw new Error("A planilha não possui nenhuma aba.");
      }

      const abas = {};

      workbook.SheetNames.forEach((nomeAba) => {
        const sheet = workbook.Sheets[nomeAba];

        abas[normalizarTexto(nomeAba)] = XLSX.utils.sheet_to_json(sheet, {
          defval: "",
        });
      });

      // ------------------------------------------------
      // DADOS DO PROFESSOR
      // ------------------------------------------------

      let professores = await carregarProfessores();

      let totalImportado = 0;

      // =================================================
      // PROFESSORES
      // =================================================

      let linhasProfessores = [];

      if (tipo === "professores" || tipo === "completo") {
        linhasProfessores = abas["professores"] || [];

        /*
         * Caso a planilha não tenha a aba Professores,
         * usamos a Importação Completa.
         */

        if (!linhasProfessores.length && abas["importacao completa"]) {
          linhasProfessores = abas["importacao completa"];
        }

        if (linhasProfessores.length) {
          btnImportar.innerHTML = `
                                <i class="fa-solid fa-spinner fa-spin"></i>
                                Importando professores...
                            `;

          const resultado = await importarProfessores(linhasProfessores);

          totalImportado += resultado.importados;

          adicionarResultado(
            "Professores",
            `
                                <p>
                                    Total:
                                    <strong>${resultado.total}</strong>
                                    · Novos:
                                    <strong>${resultado.importados}</strong>
                                    · Já existentes:
                                    <strong>${resultado.existentes}</strong>
                                    · Erros:
                                    <strong>${resultado.erros}</strong>
                                </p>
                            `,
          );

          adicionarMensagens(resultado.mensagens);

          professores = await carregarProfessores();
        }
      }

      // =================================================
      // ALOCAÇÕES
      // =================================================

      if (tipo === "alocacoes" || tipo === "completo") {
        const linhasAlocacoes =
          abas["importacao completa"] || abas["alocacoes"] || [];

        if (!linhasAlocacoes.length) {
          throw new Error("A planilha não possui uma aba de alocações.");
        }

        btnImportar.innerHTML = `
                            <i class="fa-solid fa-spinner fa-spin"></i>
                            Importando alocações...
                        `;

        const resultado = await importarAlocacoes(linhasAlocacoes, professores);

        totalImportado += resultado.importados;

        adicionarResultado(
          "Alocações",
          `
                            <p>
                                Total:
                                <strong>${resultado.total}</strong>
                                · Importadas:
                                <strong>${resultado.importados}</strong>
                                · Ignoradas:
                                <strong>${resultado.ignorados}</strong>
                                · Erros:
                                <strong>${resultado.erros}</strong>
                            </p>
                        `,
        );

        if (resultado.professoresNaoEncontrados.length) {
          adicionarResultado(
            "Professores não encontrados",
            `
                                <ul>
                                    ${resultado.professoresNaoEncontrados
                                      .map((nome) => `<li>${nome}</li>`)
                                      .join("")}
                                </ul>
                            `,
          );
        }

        adicionarMensagens(resultado.mensagens);
      }

      // =================================================
      // DISPONIBILIDADE
      // =================================================

      if (tipo === "completo") {
        const linhasDisponibilidade = abas["disponibilidade"] || [];

        if (linhasDisponibilidade.length) {
          btnImportar.innerHTML = `
                                <i class="fa-solid fa-spinner fa-spin"></i>
                                Importando disponibilidade...
                            `;

          const resultado = await importarDisponibilidades(
            linhasDisponibilidade,
            professores,
          );

          totalImportado += resultado.celulasSalvas;

          adicionarResultado(
            "Disponibilidade semanal",
            `
                                <p>
                                    Linhas:
                                    <strong>${resultado.total}</strong>
                                    · Professores atualizados:
                                    <strong>${resultado.professoresAtualizados}</strong>
                                    · Células salvas:
                                    <strong>${resultado.celulasSalvas}</strong>
                                    · Ignoradas:
                                    <strong>${resultado.ignorados}</strong>
                                    · Erros:
                                    <strong>${resultado.erros}</strong>
                                </p>
                            `,
          );

          if (resultado.professoresNaoEncontrados.length) {
            adicionarResultado(
              "Professores sem correspondência na disponibilidade",
              `
                                    <ul>
                                        ${resultado.professoresNaoEncontrados
                                          .map((nome) => `<li>${nome}</li>`)
                                          .join("")}
                                    </ul>
                                `,
            );
          }

          adicionarMensagens(resultado.mensagens);
        } else {
          adicionarResultado(
            "Disponibilidade semanal",
            `
                                <p>
                                    A aba "Disponibilidade" não foi encontrada.
                                </p>
                            `,
          );
        }
      }

      // =================================================
      // FINAL
      // =================================================

      if (totalImportado > 0) {
        mostrarMensagem("Importação concluída com sucesso.");
      } else {
        mostrarMensagem(
          "A importação terminou, mas nenhum novo dado foi gravado.",
          "error",
        );
      }
    } catch (erro) {
      console.error("Erro na importação:", erro);

      mostrarMensagem(erro.message || "Erro ao importar a planilha.", "error");

      adicionarResultado(
        "Erro na importação",
        `
                        <p>
                            ${erro.message}
                        </p>
                    `,
      );
    } finally {
      btnImportar.innerHTML = textoOriginal;

      atualizarBotaoImportacao();
    }
  });

  // ============================================================
  // INICIALIZAÇÃO
  // ============================================================

  carregarConfiguracoes();

  atualizarBotaoImportacao();
});
