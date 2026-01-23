// --- Configurações Globais ---
const GRAVITY = 900; // Pixels por segundo ao quadrado
const ARROW_SPEED_MULTIPLIER = 0.8; // Escala a força do arrasto para a velocidade da flecha
const MAX_PLAYER_POWER = 250; // Potência máxima de arrasto do jogador
const ENEMY_SHOOT_INTERVAL = 2; // Tempo (segundos) entre os tiros do inimigo
const CHARACTER_HEIGHT = 50;
const CHARACTER_WIDTH = 20;
const GROUND_HEIGHT = 50;

// --- Elementos do Canvas e DOM ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameOverlay = document.getElementById('game-overlay');
const overlayText = document.getElementById('overlay-text');
const restartButton = document.getElementById('restartButton');
const currentLevelSpan = document.getElementById('current-level');

// --- Variáveis de Estado do Jogo ---
let player, enemy;
let arrows = [];
let particles = [];
let gameState = 'playing'; // 'playing', 'win', 'lose', 'aiming'
let lastTime = 0;
let enemyShootTimer = 0;
let level = 1;
let screenShakeX = 0, screenShakeY = 0;
let screenShakeDuration = 0; // segundos
let screenShakeIntensity = 0; // pixels

// --- Variáveis de Input do Jogador ---
let isAiming = false;
let startAimMousePos = { x: 0, y: 0 };
let currentAimMousePos = { x: 0, y: 0 };
let playerAimAngle = 0;
let playerAimPower = 0;

// --- Áudio (Opcional, com placeholders) ---
const soundArrow = new Audio('arrow.mp3'); // Substitua por seus próprios arquivos de áudio
const soundHit = new Audio('hit.mp3');     // Substitua por seus próprios arquivos de áudio
const soundWin = new Audio('win.mp3');     // Substitua por seus próprios arquivos de áudio
const soundLose = new Audio('lose.mp3');   // Substitua por seus próprios arquivos de áudio

// Função para tocar som (com tratamento de erro)
function playSound(audioElement) {
    if (audioElement) {
        audioElement.currentTime = 0; // Reinicia o áudio se já estiver tocando
        audioElement.play().catch(e => console.log("Erro ao tocar áudio:", e));
    }
}

// --- Classes de Entidades ---

class Character {
    constructor(x, y, isPlayer = true) {
        this.x = x;
        this.y = y;
        this.health = 100;
        this.isPlayer = isPlayer;
        this.width = CHARACTER_WIDTH;
        this.height = CHARACTER_HEIGHT;
        this.color = isPlayer ? 'blue' : 'red';
        this.angle = 0; // Ângulo atual do arco para o desenho
        this.power = 0; // Potência atual do arco para o desenho
    }

    draw(ctx) {
        // Aplica offset para tremida de tela
        ctx.save();
        if (this.isPlayer) { // A tremida só afeta o cenário e o inimigo
            ctx.translate(screenShakeX, screenShakeY);
        }

        // Desenha barra de vida
        ctx.fillStyle = 'black';
        ctx.fillRect(this.x - 25, this.y - 70, 50, 7); // Fundo
        ctx.fillStyle = this.health > 50 ? 'green' : (this.health > 20 ? 'orange' : 'red');
        ctx.fillRect(this.x - 25, this.y - 70, this.health / 2, 7); // Vida atual
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x - 25, this.y - 70, 50, 7);

        // Desenha Stickman
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        // Cabeça
        ctx.arc(this.x, this.y - this.height / 2, 10, 0, Math.PI * 2);
        // Corpo
        ctx.moveTo(this.x, this.y - this.height / 2 + 10);
        ctx.lineTo(this.x, this.y + this.height / 2 - 10);
        // Braços
        ctx.moveTo(this.x - 15, this.y - 10);
        ctx.lineTo(this.x + 15, this.y - 10);
        // Pernas
        ctx.moveTo(this.x, this.y + this.height / 2 - 10);
        ctx.lineTo(this.x - 10, this.y + this.height / 2 + 10);
        ctx.moveTo(this.x, this.y + this.height / 2 - 10);
        ctx.lineTo(this.x + 10, this.y + this.height / 2 + 10);
        ctx.stroke();

        // Desenha Arco (se estiver mirando ou for inimigo)
        if (this.isPlayer && isAiming || !this.isPlayer) {
            ctx.save();
            ctx.translate(this.x, this.y - 10); // Origem do arco (mão)
            ctx.rotate(this.angle);
            ctx.strokeStyle = 'brown';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(this.power / 5, 0); // Comprimento do arco baseado na potência
            ctx.stroke();
            ctx.restore();
        }
        ctx.restore();
    }

    takeDamage(damage) {
        this.health -= damage;
        if (this.health < 0) this.health = 0;
        playSound(soundHit);
        screenShakeDuration = 0.2; // 0.2 segundos de tremida
        screenShakeIntensity = damage / 5; // Intensidade baseada no dano
    }
}

class Arrow {
    constructor(x, y, angle, power, owner) {
        this.x = x;
        this.y = y;
        this.owner = owner;
         this.hit = false;
        this.bounces = 0; // Flechas podem ter um pequeno ricochete
        this.maxBounces = 0; // Desabilitar ricochete por padrão

        // Calcular componentes de velocidade
        // vx deve ter direção correta (owner.x < target.x => vx positivo)
        let direction = (owner.isPlayer && enemy.x > owner.x) || (!owner.isPlayer && player.x < owner.x) ? 1 : -1;
        this.vx = Math.cos(angle) * power * ARROW_SPEED_MULTIPLIER * direction;
        this.vy = Math.sin(angle) * power * ARROW_SPEED_MULTIPLIER;

        playSound(soundArrow);
    }

    update(deltaTime) {
        if (this.hit) return;

        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        this.vy += GRAVITY * deltaTime; // Aplicar gravidade

        // Colisão com o chão
        if (this.y > canvas.height - GROUND_HEIGHT) {
            this.y = canvas.height - GROUND_HEIGHT;
            this.vx *= 0.2; // Reduzir velocidade horizontal
            this.vy *= -0.4; // Rebater com menos força
            this.bounces++;
            if (this.bounces > this.maxBounces || Math.abs(this.vy) < 50) { // Parar se ricochetear demais ou for muito devagar
                this.hit = true;
                this.vx = 0;
                this.vy = 0;
            }
        }
    }

    draw(ctx) {
        if (this.hit) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        // Calcula o ângulo de rotação da flecha com base na sua velocidade atual
        const currentAngle = Math.atan2(this.vy, this.vx);
        ctx.rotate(currentAngle);
        ctx.strokeStyle = 'brown';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-10, 0); // Ponta da flecha
        ctx.lineTo(10, 0);  // Cauda da flecha
        ctx.stroke();
        // Desenha ponta (simples)
        ctx.fillStyle = 'gray';
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(5, -3);
        ctx.lineTo(5, 3);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 200;
        this.vy = (Math.random() - 0.5) * 200 - 100; // Algum impulso para cima
        this.life = 0.5 + Math.random() * 0.5; // Vida entre 0.5 e 1 segundo
        this.maxLife = this.life;
        this.color = color;
        this.radius = Math.random() * 2 + 1; // Raio entre 1 e 3
    }

    update(deltaTime) {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        this.vy += GRAVITY * deltaTime * 0.5; // Gravidade mais leve para partículas
        this.life -= deltaTime;
    }

    draw(ctx) {
        if (this.life <= 0) return;
        ctx.globalAlpha = this.life / this.maxLife;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// --- Funções de Ajuda ---

function distance(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

// Calcula o ângulo e potência para atingir um alvo com velocidade inicial fixa
function calculateProjectileAngle(startX, startY, targetX, targetY, initialSpeed, gravity) {
    const dx = targetX - startX;
    const dy = targetY - startY;

    // A * tan^2(theta) + B * tan(theta) + C = 0
    // K = g * dx^2 / (2 * v0^2)
    // A_quad = K
    // B_quad = -dx
    // C_quad = dy + K

    const K = gravity * dx * dx / (2 * initialSpeed * initialSpeed);
    const A_quad = K;
    const B_quad = -dx;
    const C_quad = dy + K;

    const discriminant = B_quad * B_quad - 4 * A_quad * C_quad;

    if (discriminant < 0) {
        return null; // Nenhum ângulo real possível
    }

    const tanTheta1 = (-B_quad + Math.sqrt(discriminant)) / (2 * A_quad);
    const tanTheta2 = (-B_quad - Math.sqrt(discriminant)) / (2 * A_quad);

    let angle1 = Math.atan(tanTheta1);
    let angle2 = Math.atan(tanTheta2);

    // Preferir o  ângulo mais raso se ambos forem válidos para a direção
    // Para dx positivo (atirando para a direita), queremos cos(angle) > 0
    // Para dx negativo (atirando para a esquerda), queremos cos(angle) < 0
    const desiredCosSign = Math.sign(dx);

    let validAngle1 = (Math.sign(Math.cos(angle1)) === desiredCosSign) && (Math.sign(Math.sin(angle1)) === Math.sign(dy));
    let validAngle2 = (Math.sign(Math.cos(angle2)) === desiredCosSign) && (Math.sign(Math.sin(angle2)) === Math.sign(dy));

    if (dx < 0) { // Se o alvo estiver à esquerda, precisamos ajustar os ângulos para que o cosseno seja negativo
        angle1 = (angle1 > 0 ? Math.PI - angle1 : -Math.PI - angle1);
        angle2 = (angle2 > 0 ? Math.PI - angle2 : -Math.PI - angle2);
    }
    
    // Retornar o ângulo mais raso (menor valor absoluto, ou mais próximo de 0/PI)
    if (validAngle1 && validAngle2) {
        return Math.abs(angle1) < Math.abs(angle2) ? angle1 : angle2;
    } else if (validAngle1) {
        return angle1;
    } else if (validAngle2) {
        return angle2;
    }
    
    return null;
}


// --- Lógica de Colisão ---

function checkArrowCollisions() {
    arrows.forEach(arrow => {
        if (arrow.hit) return;

        let target = (arrow.owner === player) ? enemy : player;

        // Bounding box geral do personagem
        const charLeft = target.x - target.width / 2 - 5;
        const charRight = target.x + target.width / 2 + 5;
        const charTop = target.y - target.height / 2 - 15; // Inclui um pouco acima da cabeça
        const charBottom = target.y + target.height / 2 + 15; // Inclui um pouco abaixo dos pés

        if (arrow.x > charLeft && arrow.x < charRight &&
            arrow.y > charTop && arrow.y < charBottom) {

            let damage = 0;
            let hitPart = 'limb';
            let particleColor = 'red';

            // Cabeça (círculo)
            const headCenterY = target.y - target.height / 2 - 10;
            if (distance(arrow.x, arrow.y, target.x, headCenterY) < 15) { // Raio da cabeça + buffer
                damage = 50;
                hitPart = 'head';
                particleColor = 'darkred';
            }
            // Corpo (retângulo)
            else if (arrow.y > headCenterY + 5 && arrow.y < target.y + target.height / 2 - 15) {
                damage = 25;
                hitPart = 'body';
                particleColor = 'red';
            }
            // Braços/Pernas (qualquer outra parte dentro do bounding box)
            else {
                damage = 10;
                hitPart = 'limb';
                particleColor = 'orange';
            }

            target.takeDamage(damage);
            arrow.hit = true;

            // Criar partículas no ponto de impacto
            for (let i = 0; i < 8; i++) {
                particles.push(new Particle(arrow.x, arrow.y, particleColor));
            }

            // Remova a flecha do array após o hit
            arrows = arrows.filter(a => a !== arrow);
        }
    });
}

// --- Inteligência Artificial do Inimigo ---

function updateEnemyAI(deltaTime) {
    if (enemy.health <= 0 || gameState !== 'playing') return;

    enemyShootTimer += deltaTime;

    // A dificuldade aumenta com o nível
    const difficultyFactor = 1 + (level - 1) * 0.1; // Nível 1 = 1, Nível 2 = 1.1, etc.
    const enemyShootInterval = ENEMY_SHOOT_INTERVAL / difficultyFactor; // Tira mais rápido em níveis altos

    if (enemyShootTimer >= enemyShootInterval) {
        enemyShootTimer = 0;

        const targetX = player.x + (Math.random() - 0.5) * (100 / difficultyFactor); // Inacurácia horizontal
        const targetY = player.y - 10 + (Math.random() - 0.5) * (50 / difficultyFactor); // Inacurácia vertical

        const shooterX = enemy.x;
        const shooterY = enemy.y - 10; // Posição do arco

        const baseSpeed = 400 + level * 20; // Aumenta a velocidade da flecha do inimigo
        let calculatedAngle =  canvas.height - GROUND_HEIGHT);
    ctx.stroke();
    
    ctx.restore(); // Restaura contexto para que a tremida não afete os personagens

    // Desenha personagens
    player.draw(ctx);
    enemy.draw(ctx);

    // Desenha flechas
    arrows.forEach(arrow => arrow.draw(ctx));

    // Desenha partículas
    particles.forEach(p => p.draw(ctx));

    // Desenha a linha de mira do jogador
    if (isAiming && gameState === 'playing') {
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(player.x, player.y - 10);
        ctx.lineTo(currentAimMousePos.x, currentAimMousePos.y);
        ctx.stroke();

        // Opcional: Desenhar um arco de trajetória aproximado (requer mais física)
        // Para simplificar, vou deixar a linha de mira direta por enquanto.
        // Se a potência for suficiente, desenhe um indicador de força
        if (playerAimPower > 0) {
            ctx.fillStyle = 'black';
            ctx.font = '16px Arial';
            ctx.fillText(Math.round(playerAimPower) + '%', player.x + playerAimPower / 4 + 20, player.y - 30);
        }
    }

    // Desenha nível atual (já tratado com DOM)
}

function gameLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const deltaTime = (timestamp - lastTime) / 1000; // Delta em segundos
    lastTime = timestamp;

    update(deltaTime);
    draw();

    requestAnimationFrame(gameLoop);
}

function resetLevel() {
    player = new Character(canvas.width / 4, canvas.height - GROUND_HEIGHT, true);
    enemy = new Character(canvas.width * 3 / 4, canvas.height - GROUND_HEIGHT, false);
    arrows = [];
    particles = [];
    gameState = 'playing';
    enemyShootTimer = 0;
    screenShakeDuration = 0;
    gameOverlay.classList.remove('active');
}

restartButton.addEventListener('click', initGame);


// --- Manipulação de Input (Mouse e Toque) ---

function getClientCoords(event) {
    if (event.touches && event.touches[0]) {
        return { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }
    return { x: event.clientX, y: event.clientY };
}

canvas.addEventListener('mousedown', (e) => {
    if (gameState !== 'playing') return;
    isAiming = true;
    startAimMousePos = getClientCoords(e);
    player.angle = 0; // Resetar ângulo para o desenho do arco
    player.power = 0;
    canvas.style.cursor = 'grabbing';
});

canvas.addEventListener('mousemove', (e) => {
    if (isAiming && gameState === 'playing') {
        currentAimMousePos = getClientCoords(e);
        let dx = startAimMousePos.x - currentAimMousePos.x;
        let dy = startAimMousePos.y - currentAimMousePos.y;

        playerAimPower = Math.min(Math.sqrt(dx * dx + dy * dy), MAX_PLAYER_POWER);
        playerAimAngle = Math.atan2(dy, dx); // Ângulo para a flecha

        // Atualiza ângulo e potência para o desenho do arco do personagem
        player.angle = playerAimAngle;
        player.power = playerAimPower;
    }
});

canvas.addEventListener('mouseup', (e) => {
    if (isAiming && gameState === 'playing') {
        isAiming = false;
        canvas.style.cursor = 'grab';

        if (playerAimPower > 10) { // Disparar apenas se houver potência suficiente
            arrows.push(new Arrow(player.x, player.y - 10, playerAimAngle, playerAimPower, player));
        }
        player.angle = 0; // Resetar desenho do arco
        player.power = 0;
        playerAimPower = 0; // Resetar potência de mira
    }
});

// Eventos de Toque
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Previne o scroll padrão em mobile
    if (gameState !== 'playing') return;
    isAiming = true;
    startAimMousePos = getClientCoords(e);
    player.angle = 0;
    player.power = 0;
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (isAiming && gameState === 'playing') {
        currentAimMousePos = getClientCoords(e);
        let dx = startAimMousePos.x - currentAimMousePos.x;
        let dy = startAimMousePos.y -  calculateProjectileAngle(shooterX, shooterY, targetX, targetY, baseSpeed, GRAVITY);

        if (calculatedAngle !== null) {
            enemy.angle = calculatedAngle;
            enemy.power = baseSpeed; // Usa a velocidade como potência para o desenho do arco
            arrows.push(new Arrow(shooterX, shooterY, enemy.angle, enemy.power, enemy));
        } else {
            // Se o alvo for inatingível, atire em uma trajetória genérica para a esquerda
            const randomAngle = Math.random() * Math.PI / 4 + Math.PI / 8; // Entre 22.5 e 67.5 graus
            enemy.angle = Math.PI - randomAngle; // Aponta para a esquerda
            enemy.power = baseSpeed * 0.8;
            arrows.push(new Arrow(shooterX, shooterY, enemy.angle, enemy.power, enemy));
        }
    }
}

// --- Funções Principais do Jogo ---

function initGame() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    player = new Character(canvas.width / 4, canvas.height - GROUND_HEIGHT, true);
    enemy = new Character(canvas.width * 3 / 4, canvas.height - GROUND_HEIGHT, false);
    arrows = [];
    particles = [];
    level = 1;
    currentLevelSpan.textContent = level;
    gameState = 'playing';
    enemyShootTimer = 0;
    screenShakeDuration = 0;
    gameOverlay.classList.remove('active'); // Esconde o overlay no início

    // Adiciona listener de redimensionamento
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // Reposicionar personagens no centro da tela redimensionada
        player.x = canvas.width / 4;
        player.y = canvas.height - GROUND_HEIGHT;
        enemy.x = canvas.width * 3 / 4;
        enemy.y = canvas.height - GROUND_HEIGHT;
    });

    // Inicia o loop do jogo
    requestAnimationFrame(gameLoop);
}

function update(deltaTime) {
    if (gameState !== 'playing') {
        return;
    }

    // Atualizar tremida de tela
    screenShakeDuration -= deltaTime;
    if (screenShakeDuration > 0) {
        screenShakeX = (Math.random() - 0.5) * screenShakeIntensity;
        screenShakeY = (Math.random() - 0.5) * screenShakeIntensity;
    } else {
        screenShakeX = 0;
        screenShakeY = 0;
    }

    // Atualizar flechas
    arrows.forEach(arrow => arrow.update(deltaTime));
    arrows = arrows.filter(arrow => !arrow.hit || (arrow.hit && arrow.owner === player && arrow.y < canvas.height - GROUND_HEIGHT)); // Remover flechas que acertaram e estão no chão

    // Atualizar partículas
    particles.forEach(p => p.update(deltaTime));
    particles = particles.filter(p => p.life > 0);

    // Verificar colisões
    checkArrowCollisions();

    // Lógica da IA do inimigo
    updateEnemyAI(deltaTime);

    // Verificar condição de vitória/derrota
    if (player.health <= 0) {
        gameState = 'lose';
        overlayText.textContent = `Você Perdeu! Nível ${level}`;
        gameOverlay.classList.add('active');
        playSound(soundLose);
    } else if (enemy.health <= 0) {
        gameState = 'win';
        overlayText.textContent = `Você Venceu o Nível ${level}!`;
        gameOverlay.classList.add('active');
        playSound(soundWin);
        setTimeout(() => {
            if (gameState === 'win') { // Evitar múltiplos resets se o jogador clicar rápido
                level++;
                currentLevelSpan.textContent = level;
                resetLevel();
            }
        }, 2000); // Dar um tempo para o jogador ver a vitória
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Aplica tremida de tela ao cenário (fundo, chão)
    ctx.save();
    ctx.translate(screenShakeX, screenShakeY);

    // Desenha cenário (chão)
    ctx.fillStyle = '#6B8E23'; // Cor de grama
    ctx.fillRect(0, canvas.height - GROUND_HEIGHT, canvas.width, GROUND_HEIGHT);
    ctx.strokeStyle = '#556B2F';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - GROUND_HEIGHT);
    ctx.lineTo(canvas.width,
     currentAimMousePos.y;

        playerAimPower = Math.min(Math.sqrt(dx * dx + dy * dy), MAX_PLAYER_POWER);
        playerAimAngle = Math.atan2(dy, dx);
        
        player.angle = playerAimAngle;
        player.power = playerAimPower;
    }
});

canvas.addEventListener('touchend', (e) => {
    if (isAiming && gameState === 'playing') {
        isAiming = false;
        if (playerAimPower > 10) {
            arrows.push(new Arrow(player.x, player.y - 10, playerAimAngle, playerAimPower, player));
        }
        player.angle = 0;
        player.power = 0;
        playerAimPower = 0;
    }
});

// Iniciar o jogo
initGame();