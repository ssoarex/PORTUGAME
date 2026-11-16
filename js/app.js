(function () {
  const data = window.PortugameData;
  const worlds = data.worlds;
  const phases = worlds.flatMap((world) => world.phases.map((phase) => ({ ...phase, world })));
  const phaseById = new Map(phases.map((phase) => [phase.id, phase]));
  const avatars = [
    { icon: "🧙", name: "Mago", cost: 0 },
    { icon: "🧝", name: "Elfo", cost: 30 },
    { icon: "🦸", name: "Herói", cost: 45 },
    { icon: "🧑‍🚀", name: "Astronauta", cost: 60 },
    { icon: "🧚", name: "Fada", cost: 75 },
    { icon: "🧑‍🎓", name: "Estudante", cost: 90 },
    { icon: "🦊", name: "Raposa", cost: 110 },
    { icon: "🐉", name: "Dragão", cost: 130 }
  ];
  const defaultState = { name: "Aventureiro", avatar: "🧙", ownedAvatars: ["🧙"], xp: 0, coins: 0, played: 0, history: [], skill: {}, completed: [] };
  let state = loadState();
  let current = null;
  let questionIndex = 0;
  let correctAnswers = 0;
  let answerLocked = false;
  let selectedAvatar = state.avatar;
  const expandedWorlds = new Set();

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem("portugame-save") || "{}");
      const loaded = { ...defaultState, ...saved };
      loaded.completed = Array.isArray(loaded.completed) ? loaded.completed : [];
      loaded.history = Array.isArray(loaded.history) ? loaded.history : [];
      loaded.skill = loaded.skill && typeof loaded.skill === "object" ? loaded.skill : {};
      const savedAvatars = Array.isArray(saved.ownedAvatars) ? saved.ownedAvatars : [defaultState.avatar, loaded.avatar];
      loaded.ownedAvatars = [...new Set(savedAvatars.filter((avatar) => avatars.some((item) => item.icon === avatar)))];
      if (!loaded.ownedAvatars.includes(defaultState.avatar)) loaded.ownedAvatars.push(defaultState.avatar);
      if (avatars.some((item) => item.icon === loaded.avatar) && !loaded.ownedAvatars.includes(loaded.avatar)) loaded.ownedAvatars.push(loaded.avatar);
      ["interpretacao", "gramatica", "palavras"].forEach((legacyId) => {
        if (loaded.completed.includes(legacyId)) {
          loaded.completed = loaded.completed.filter((id) => id !== legacyId);
          const firstPhase = `${legacyId}-1`;
          if (!loaded.completed.includes(firstPhase)) loaded.completed.push(firstPhase);
        }
      });
      return loaded;
    } catch (error) {
      return { ...defaultState };
    }
  }

  function save() {
    try {
      localStorage.setItem("portugame-save", JSON.stringify(state));
    } catch (error) {
      showToast("Não foi possível salvar neste navegador.");
    }
    render();
  }

  function level() {
    return Math.floor(state.xp / 100) + 1;
  }

  function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 2100);
  }

  function renderWorlds() {
    document.getElementById("worlds").innerHTML = worlds.map((world) => {
      const completedCount = world.phases.filter((phase) => state.completed.includes(phase.id)).length;
      const isOpen = expandedWorlds.has(world.id);
      const phaseList = world.phases.map((phase, index) => {
        const complete = state.completed.includes(phase.id);
        return `<button class="phase-button" type="button" data-action="start-phase" data-phase="${phase.id}">
          <span><strong>Fase ${index + 1}: ${phase.title}</strong><small>${phase.description}</small></span>
          <span class="phase-status${complete ? " complete" : ""}">${complete ? "CONCLUÍDA ✓" : "JOGAR →"}</span>
        </button>`;
      }).join("");
      return `<article class="world-card${isOpen ? " is-open" : ""}">
        <div class="world-heading"><div class="world-icon" aria-hidden="true">${world.icon}</div><h3>${world.title}</h3></div>
        <p>${world.description}</p>
        <div class="world-foot"><span>${completedCount}/${world.phases.length} fases • ${world.skill}</span>
          <button class="secondary" type="button" data-action="toggle-world" data-world="${world.id}" aria-expanded="${isOpen}">${isOpen ? "Recolher" : "Ver fases"}</button></div>
        ${isOpen ? `<div class="phase-list">${phaseList}</div>` : ""}
      </article>`;
    }).join("");
  }

  function renderSkills() {
    const names = Object.keys(state.skill);
    document.getElementById("skills").innerHTML = names.length
      ? names.map((name) => {
        const skill = state.skill[name];
        const percent = skill.total ? Math.round((skill.correct / skill.total) * 100) : 0;
        return `<div class="skill"><div class="skill-top"><span>${name}</span><strong>${percent}%</strong></div><div class="progress"><i style="width:${percent}%"></i></div></div>`;
      }).join("")
      : '<p class="empty">Complete fases para visualizar seu desempenho em cada competência.</p>';
  }

  function renderAchievements() {
    const achievements = [];
    const completedCount = phases.filter((phase) => state.completed.includes(phase.id)).length;
    if (state.played >= 1) achievements.push(["🎮", "Primeira aventura", "Você iniciou sua jornada."]);
    if (state.xp >= 100) achievements.push(["⚡", "Centena de XP", "Você acumulou 100 pontos de experiência."]);
    if (completedCount >= 1) achievements.push(["🏅", "Fase concluída", "Você conquistou sua primeira fase."]);
    if (completedCount === phases.length) achievements.push(["👑", "Lenda do PORTUGAME", "Você concluiu todas as fases."]);
    document.getElementById("achievements").innerHTML = achievements.length
      ? achievements.map((achievement) => `<div class="achievement"><div class="medal">${achievement[0]}</div><div><strong>${achievement[1]}</strong><small>${achievement[2]}</small></div></div>`).join("")
      : '<p class="empty">Suas medalhas aparecerão aqui conforme você avançar.</p>';
  }

  function render() {
    document.getElementById("playerName").textContent = state.name;
    document.getElementById("avatar").textContent = state.avatar;
    document.getElementById("xp").textContent = state.xp;
    document.getElementById("coins").textContent = state.coins;
    document.getElementById("played").textContent = state.played;
    const currentLevel = level();
    const xpIntoLevel = state.xp % 100;
    document.getElementById("levelName").textContent = currentLevel >= 5 ? "Mestre das Palavras" : currentLevel >= 3 ? "Guardião do Conhecimento" : currentLevel >= 2 ? "Explorador Literário" : "Aprendiz das Palavras";
    document.getElementById("levelLabel").textContent = `Nível ${currentLevel}`;
    document.getElementById("nextXp").textContent = `${xpIntoLevel} / 100 XP`;
    document.getElementById("levelBar").style.width = `${xpIntoLevel}%`;
    document.getElementById("levelBar").parentElement.setAttribute("aria-valuenow", String(xpIntoLevel));
    renderWorlds();
    renderSkills();
    renderAchievements();
  }

  function renderAvatarChoices() {
    document.getElementById("shopCoins").textContent = state.coins;
    document.getElementById("avatarChoices").innerHTML = avatars.map((avatar) => {
      const owned = state.ownedAvatars.includes(avatar.icon);
      const equipped = state.avatar === avatar.icon;
      const selected = selectedAvatar === avatar.icon;
      const action = owned ? (equipped ? "Em uso" : "Equipar") : `Comprar • ${avatar.cost} moedas`;
      return `<button class="avatar-option${selected ? " selected" : ""}${owned ? "" : " locked"}" type="button" data-avatar="${avatar.icon}" data-cost="${avatar.cost}" data-owned="${owned}" aria-label="${avatar.name}: ${action}" aria-pressed="${selected}" ${!owned && state.coins < avatar.cost ? "disabled" : ""}>
        <span class="avatar-option-icon" aria-hidden="true">${avatar.icon}</span><strong>${avatar.name}</strong><span class="avatar-option-action">${action}</span>
      </button>`;
    }).join("");
  }

  function openProfile() {
    const nameInput = document.getElementById("nameInput");
    nameInput.value = state.name === "Aventureiro" ? "" : state.name;
    selectedAvatar = state.avatar;
    renderAvatarChoices();
    setModal("profileModal", true);
    nameInput.focus();
  }

  function saveProfile() {
    const name = document.getElementById("nameInput").value.trim();
    if (name) state.name = name;
    if (state.ownedAvatars.includes(selectedAvatar)) state.avatar = selectedAvatar;
    save();
    setModal("profileModal", false);
    showToast("Personagem atualizado!");
  }

  function setModal(id, isOpen) {
    const modal = document.getElementById(id);
    modal.classList.toggle("show", isOpen);
    modal.setAttribute("aria-hidden", String(!isOpen));
  }

  function startPhase(phaseId) {
    const phase = phaseById.get(phaseId);
    if (!phase || !Array.isArray(data.questions[phaseId]) || data.questions[phaseId].length === 0) {
      showToast("Esta fase ainda não tem perguntas.");
      return;
    }
    current = phaseId;
    questionIndex = 0;
    correctAnswers = 0;
    answerLocked = false;
    setModal("gameModal", true);
    showQuestion();
  }

  function showQuestion() {
    const phase = phaseById.get(current);
    const questions = data.questions[current];
    const question = questions[questionIndex];
    document.getElementById("gameDialog").innerHTML = `<div class="dialog-head"><h2 id="gameTitle">${phase.title}</h2><button class="close" type="button" data-action="close-game" aria-label="Fechar">×</button></div>
      <div class="question-meta"><span>QUESTÃO ${questionIndex + 1} DE ${questions.length}</span><span>✦ +10 XP POR ACERTO</span></div>
      <div class="progress"><i style="width:${questionIndex / questions.length * 100}%"></i></div>
      <div class="qtext">${question.q}</div>
      <div class="answers">${question.a.map((answer, index) => `<button class="answer" type="button" data-action="answer" data-answer="${index}">${String.fromCharCode(65 + index)}) ${answer}</button>`).join("")}</div>
      <div class="feedback" id="feedback"></div>
      <div class="dialog-actions"><span class="muted">Responda com atenção!</span><button class="primary" id="nextBtn" type="button" data-action="next-question" hidden>Próxima →</button></div>`;
  }

  function answer(index) {
    if (answerLocked) return;
    answerLocked = true;
    const question = data.questions[current][questionIndex];
    const buttons = [...document.querySelectorAll(".answer")];
    const feedback = document.getElementById("feedback");
    buttons.forEach((button, buttonIndex) => {
      button.disabled = true;
      if (buttonIndex === question.c) button.classList.add("correct");
      else if (buttonIndex === index) button.classList.add("wrong");
    });
    if (index === question.c) {
      correctAnswers++;
      state.xp += 10;
      state.coins += 3;
      feedback.innerHTML = `<strong class="is-correct">✓ Resposta correta! +10 XP e +3 moedas</strong>${question.e}`;
    } else {
      feedback.innerHTML = `<strong class="is-wrong">✕ Ainda não foi dessa vez.</strong>Resposta correta: <b>${question.a[question.c]}</b><br>${question.e}`;
    }
    feedback.classList.add("show");
    document.getElementById("nextBtn").hidden = false;
    save();
  }

  function nextQuestion() {
    questionIndex++;
    if (questionIndex < data.questions[current].length) {
      answerLocked = false;
      showQuestion();
    } else {
      finishPhase();
    }
  }

  function finishPhase() {
    const phase = phaseById.get(current);
    const questions = data.questions[current];
    const total = questions.length;
    const percent = Math.round((correctAnswers / total) * 100);
    const firstCompletion = !state.completed.includes(current);
    state.played++;
    if (firstCompletion) {
      state.completed.push(current);
      state.xp += 25;
      state.coins += 10;
    }
    if (!state.skill[phase.world.skill]) state.skill[phase.world.skill] = { correct: 0, total: 0 };
    state.skill[phase.world.skill].correct += correctAnswers;
    state.skill[phase.world.skill].total += total;
    state.history.push({ phase: current, correct: correctAnswers, total, date: new Date().toLocaleDateString("pt-BR") });
    save();
    const resultMessage = percent >= 80 ? "Excelente desempenho! Você dominou este desafio." : percent >= 60 ? "Bom trabalho! Continue praticando para evoluir." : "Cada tentativa é uma oportunidade de aprender. Revise as explicações e tente novamente.";
    document.getElementById("gameDialog").innerHTML = `<div class="result"><div class="result-icon">${percent >= 80 ? "🏆" : percent >= 60 ? "⭐" : "📚"}</div>
      <div class="eyebrow">FASE FINALIZADA</div><h2 id="gameTitle">${phase.title}</h2><div class="result-score">${percent}%</div>
      <p>Você acertou <b>${correctAnswers} de ${total}</b> questões.</p><p class="muted">${resultMessage}</p>
      <div class="panel result-rewards"><b>Recompensas desta partida</b><p class="muted">+${correctAnswers * 10} XP por acertos${firstCompletion ? " • +25 XP por concluir a fase" : ""} • +${correctAnswers * 3 + (firstCompletion ? 10 : 0)} moedas</p></div>
      <button class="primary" type="button" data-action="close-game">Voltar ao mapa</button></div>`;
  }

  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action], [data-avatar]");
    if (!target) return;
    if (target.dataset.avatar) {
      const avatar = target.dataset.avatar;
      if (state.ownedAvatars.includes(avatar)) {
        selectedAvatar = avatar;
        state.avatar = avatar;
        save();
        renderAvatarChoices();
      } else {
        const cost = Number(target.dataset.cost);
        if (state.coins < cost) {
          showToast("Você ainda não tem moedas suficientes.");
          return;
        }
        state.coins -= cost;
        state.ownedAvatars.push(avatar);
        state.avatar = avatar;
        selectedAvatar = avatar;
        save();
        renderAvatarChoices();
        showToast("Avatar desbloqueado e equipado!");
      }
      return;
    }
    switch (target.dataset.action) {
      case "open-profile": openProfile(); break;
      case "close-profile": setModal("profileModal", false); break;
      case "save-profile": saveProfile(); break;
      case "toggle-world": {
        const worldId = target.dataset.world;
        if (expandedWorlds.has(worldId)) expandedWorlds.delete(worldId);
        else expandedWorlds.add(worldId);
        renderWorlds();
        break;
      }
      case "start-phase": startPhase(target.dataset.phase); break;
      case "answer": answer(Number(target.dataset.answer)); break;
      case "next-question": nextQuestion(); break;
      case "close-game": setModal("gameModal", false); current = null; break;
      default: break;
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (document.getElementById("profileModal").classList.contains("show")) setModal("profileModal", false);
      if (document.getElementById("gameModal").classList.contains("show")) {
        setModal("gameModal", false);
        current = null;
      }
    }
  });

  render();
})();