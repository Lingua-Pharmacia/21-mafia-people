const splash = document.getElementById('splash-screen'), instr = document.getElementById('instructions-screen'),
      app = document.getElementById('main-app'), grid = document.getElementById('stations-grid'),
      playerZone = document.getElementById('player-zone'), audio = document.getElementById('audio-player'),
      transcript = document.getElementById('transcript-box'), popup = document.getElementById('translation-popup'),
      gameZone = document.getElementById('game-zone'), gameBoard = document.getElementById('game-board'),
      feedbackArea = document.getElementById('quiz-feedback-area'), ptsVal = document.getElementById('points-val');

let lifetimeScore = parseInt(localStorage.getItem('mafiaScore')) || 0;
let completedLessons = JSON.parse(localStorage.getItem('completedMafiaLessons')) || [];
if(ptsVal) ptsVal.innerText = lifetimeScore;

let wordBucket = []; let currentQ = 0; let attempts = 0; let totalScore = 0; let firstCard = null;

const stations = [
    {file:"01_AlCapone.mp3", title:"1. Al Capone"},
    {file:"02_ArnoldRothstein.mp3", title:"2. Arnold Rothstein"},
    {file:"03_BugsySiegel.mp3", title:"3. Bugsy Siegel"},
    {file:"04_BumpyJohnson.mp3", title:"4. Bumpy Johnson"},
    {file:"05_LuckyLuciano.mp3", title:"5. Lucky Luciano"},
    {file:"06_CurtisWarren.mp3", title:"6. Curtis Warren"},
    {file:"07_DawoodIbrahim.mp3", title:"7. Dawood Ibrahim"},
    {file:"08_DutchSchultz.mp3", title:"8. Dutch Schultz"},
    {file:"09_FrankLucas.mp3", title:"9. Frank Lucas"},
    {file:"10_GriseldaBlanco.mp3", title:"10. Griselda Blanco"},
    {file:"11_HisayukiMachii.mp3", title:"11. Hisayuki Machii"},
    {file:"12_WhiteyBulger.mp3", title:"12. Whitey Bulger"},
    {file:"13_ElChapo.mp3", title:"13. El Chapo"},
    {file:"14_JohnGotti.mp3", title:"14. John Gotti"},
    {file:"15_KhosrowTheKhan.mp3", title:"15. Khosrow The Khan"},
    {file:"16_MeyerLansky.mp3", title:"16. Meyer Lansky"},
    {file:"17_NickyBarnes.mp3", title:"17. Nicky Barnes"},
    {file:"18_PabloEscobar.mp3", title:"18. Pablo Escobar"},
    {file:"19_SemionMogilevich.mp3", title:"19. Semion Mogilevich"},
    {file:"20_StephanieStClair.mp3", title:"20. Stephanie St. Clair"},
    {file:"21_VitoGenovese.mp3", title:"21. Vito Genovese"}
];

function renderGrid() {
    grid.innerHTML = "";
    stations.forEach((s, i) => {
        const btn = document.createElement('div'); btn.className = 'station-tile';
        if(completedLessons.includes(s.file)) btn.classList.add('completed');
        btn.innerHTML = `<b>${i + 1}</b> ${s.title.replace(/^\d+\.\s*/, "")}`;
        btn.onclick = () => { 
            grid.classList.add('hidden'); playerZone.classList.remove('hidden'); 
            document.getElementById('now-playing-title').innerText = s.title; 
            audio.src = s.file; wordBucket = []; 
        };
        grid.appendChild(btn);
    });
}
renderGrid();

document.getElementById('btn-back').onclick = () => {
    audio.pause(); audio.currentTime = 0;
    playerZone.classList.add('hidden');
    transcript.classList.add('hidden');
    gameZone.classList.add('hidden');
    grid.classList.remove('hidden');
    currentQ = 0; attempts = 0;
};

document.getElementById('btn-start').onclick = () => { splash.classList.add('hidden'); instr.classList.remove('hidden'); };
document.getElementById('btn-enter').onclick = () => { instr.classList.add('hidden'); app.classList.remove('hidden'); };

document.getElementById('ctrl-play').onclick = () => audio.play();
document.getElementById('ctrl-pause').onclick = () => audio.pause();
document.getElementById('ctrl-stop').onclick = () => { audio.pause(); audio.currentTime = 0; };
document.getElementById('btn-blind').onclick = () => { transcript.classList.add('hidden'); gameZone.classList.add('hidden'); audio.play(); };

document.getElementById('btn-read').onclick = () => {
    if (typeof lessonData === 'undefined') { alert("🚨 Error: data.js failed!"); return; }
    let fn = decodeURIComponent(audio.src.split('/').pop()); 
    const data = lessonData[fn][0];
    transcript.classList.remove('hidden'); gameZone.classList.add('hidden'); transcript.innerHTML = "";
    data.text.split(" ").forEach(w => {
        const span = document.createElement('span'); 
        const clean = w.toLowerCase().replace(/[^a-z0-9ğüşöçı-]/gi, "");
        span.innerText = w + " "; span.className = "clickable-word";
        span.onclick = (e) => {
            const tr = data.dict[clean];
            if(tr) {
                if (!wordBucket.some(p => p.en === clean)) wordBucket.push({en: clean, tr: tr});
                popup.innerText = tr; popup.style.left = `${e.clientX}px`; popup.style.top = `${e.clientY - 50}px`;
                popup.classList.remove('hidden'); setTimeout(() => popup.classList.add('hidden'), 2000);
            }
        };
        transcript.appendChild(span);
    });
    audio.play();
};

document.getElementById('btn-game').onclick = () => {
    let fn = decodeURIComponent(audio.src.split('/').pop()); 
    const lesson = lessonData[fn][0];
    transcript.classList.add('hidden'); gameZone.classList.remove('hidden'); feedbackArea.innerHTML = "";
    gameBoard.innerHTML = ""; firstCard = null; gameBoard.style.display = "grid";
    let set = [...wordBucket];
    for (let k in lesson.dict) { if (set.length >= 8) break; if (!set.some(p => p.en === k)) set.push({en: k, tr: lesson.dict[k]}); }
    let deck = [];
    set.forEach(p => { deck.push({text: p.en, match: p.tr}); deck.push({text: p.tr, match: p.en}); });
    deck.sort(() => Math.random() - 0.5);
    deck.forEach(card => {
        const div = document.createElement('div'); div.className = 'game-card'; div.innerText = card.text;
        div.onclick = () => {
            if (div.classList.contains('correct') || div.classList.contains('selected')) return;
            if (firstCard) {
                if (firstCard.innerText === card.match) {
                    div.classList.add('correct'); firstCard.classList.add('correct'); firstCard = null;
                } else {
                    div.classList.add('wrong'); setTimeout(() => { div.classList.remove('wrong'); firstCard.classList.remove('selected'); firstCard = null; }, 500);
                }
            } else { firstCard = div; div.classList.add('selected'); }
        };
        gameBoard.appendChild(div);
    });
};

document.getElementById('btn-bowling').onclick = () => {
    let fn = decodeURIComponent(audio.src.split('/').pop()); 
    const lesson = lessonData[fn][0];
    transcript.classList.add('hidden'); gameZone.classList.remove('hidden'); gameBoard.style.display = "none";
    currentQ = 0; totalScore = 0; attempts = 0;
    runQuiz(lesson);
};

function runQuiz(lesson) {
    if (currentQ >= 7) { finishQuiz(); return; }
    const qData = lesson.questions[currentQ];
    const storyNum = parseInt(decodeURIComponent(audio.src.split('/').pop()).substring(0,2));
    feedbackArea.innerHTML = `
        <div id="quiz-container">
            <div class="score-badge">SCORE: ${totalScore} | Q: ${currentQ+1}/7</div>
            <button id="btn-hear-q" class="mode-btn neon-green">👂 LISTEN TO QUESTION</button>
            <div id="mic-box" class="hidden" style="margin-top:20px;">
                <button id="btn-speak" class="mic-btn">🎤</button>
                <p id="mic-status" style="color:#666; font-weight:bold;">Ready...</p>
            </div>
            <div id="res-area"></div>
        </div>`;
    document.getElementById('btn-hear-q').onclick = () => {
        const utter = new SpeechSynthesisUtterance(qData.q);
        utter.lang = 'en-US';
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            let v = voices.find(v => (v.name.includes(storyNum % 2 !== 0 ? "Female" : "Male")) && v.lang.startsWith('en'));
            utter.voice = v || voices.find(v => v.lang.startsWith('en')) || voices[0];
        }
        utter.onend = () => { document.getElementById('mic-box').classList.remove('hidden'); };
        window.speechSynthesis.speak(utter);
    };
    document.getElementById('btn-speak').onclick = function() {
        const btn = this; const status = document.getElementById('mic-status');
        window.currentRec = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
        window.currentRec.lang = 'en-US';
        window.currentRec.onstart = () => { btn.classList.add('active'); status.innerText = "Listening..."; };
        window.currentRec.onresult = (e) => {
            document.getElementById('mic-box').classList.add('hidden'); 
            const res = e.results[0][0].transcript.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
            const ans = qData.a_en.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
            if (res === ans) {
                let pts = (attempts === 0) ? 20 : 15; totalScore += pts;
                showResult(true, pts === 20 ? "STRIKE! (+20)" : "SPARE! (+15)", qData, lesson);
            } else {
                attempts++;
                if (attempts === 1) showResult(false, "MISS! TRY AGAIN", qData, lesson, true);
                else showResult(false, "MISS! (0 pts)", qData, lesson, false);
            }
        };
        window.currentRec.start();
    };
}

function showResult(isCorrect, msg, qData, lesson, canRetry = false) {
    const area = document.getElementById('res-area');
    area.innerHTML = `<h1 style="color:${isCorrect?'#39ff14':'#f44'}; font-size: 50px;">${msg}</h1>`;
    if (isCorrect || !canRetry) {
        area.innerHTML += `<p class="quiz-q-text">Q: ${qData.q}</p><p class="quiz-a-text">EN: ${qData.a_en}</p><p style="color:#888; font-size:30px; font-weight: bold;">TR: ${qData.a_tr}</p><button id="btn-nxt" class="action-btn-large">NEXT QUESTION ⮕</button>`;
        document.getElementById('btn-nxt').onclick = () => { currentQ++; attempts = 0; runQuiz(lesson); };
    } else {
        area.innerHTML += `<button id="btn-retry" class="action-btn-large">RETRY FOR SPARE</button>`;
        document.getElementById('btn-retry').onclick = () => { area.innerHTML = ""; document.getElementById('mic-box').classList.remove('hidden'); document.getElementById('btn-speak').classList.remove('active'); };
    }
}

function finishQuiz() {
    lifetimeScore += totalScore; localStorage.setItem('mafiaScore', lifetimeScore);
    const fn = decodeURIComponent(audio.src.split('/').pop());
    if(!completedLessons.includes(fn)) { 
        completedLessons.push(fn); 
        localStorage.setItem('completedMafiaLessons', JSON.stringify(completedLessons)); 
    }
    renderGrid(); 
    feedbackArea.innerHTML = `<h1 style="color:#ccff00; font-size: 60px;">FINISHED!</h1><h2 style="font-size: 40px;">QUIZ SCORE: ${totalScore}</h2><button id="btn-done" class="action-btn-large">SAVE & RETURN</button>`;
    document.getElementById('btn-done').onclick = () => {
        playerZone.classList.add('hidden');
        grid.classList.remove('hidden');
    };
}
