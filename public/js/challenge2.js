let usedHints = new Set();
let initialScore = 50; // Score initial du challenge
let currentChallengeScore = initialScore;
let finalChallengeScore = initialScore;
let hintCount = 0;
const totalHints = 4;

// Configuration des indices
const hints = {
    1: { cost: 0, icon: 'fa-unlock-alt' },
    2: { cost: 5, icon: 'fa-lock' },
    3: { cost: 10, icon: 'fa-lock' },
    4: { cost: 25, icon: 'fa-lock' }
};

// Fonction pour mettre à jour l'affichage des scores
function updateScoreDisplay() {
    const scoreInfo = document.getElementById('challenge-score-info');
    const hintCountDisplay = document.querySelector('.hint-count');
    const penaltyBar = document.getElementById('hintPenaltyBar');
    
    if (scoreInfo) {
        scoreInfo.innerHTML = `
            <div class="score-details">
                <p>Score initial: ${initialScore} points</p>
                <p class="penalty-text">Pénalités actuelles: -${initialScore - currentChallengeScore} points</p>
                <p class="final-score">Score actuel: ${currentChallengeScore} points</p>
            </div>
        `;
    }

    if (hintCountDisplay) {
        hintCountDisplay.textContent = `(${hintCount}/${totalHints} utilisés)`;
    }

    if (penaltyBar) {
        const percentage = (currentChallengeScore / initialScore) * 100;
        penaltyBar.style.width = `${percentage}%`;
        
        if (percentage > 75) {
            penaltyBar.className = 'progress-bar bg-success';
        } else if (percentage > 50) {
            penaltyBar.className = 'progress-bar bg-warning';
        } else {
            penaltyBar.className = 'progress-bar bg-danger';
        }
    }
}

// Fonction pour gérer l'ouverture des indices
function showHint(hintNumber) {
    const hintContent = document.getElementById(`hint${hintNumber}`);
    const hintButton = document.querySelector(`button[onclick="showHint(${hintNumber})"]`);
    
    if (!hintContent || !hintButton) return;

    const hintCost = hints[hintNumber].cost;

    // Si l'indice n'est pas encore déverrouillé
    if (!usedHints.has(hintNumber)) {
        // Pour l'indice gratuit (indice 1)
        if (hintNumber === 1) {
            unlockHint(hintNumber);
            showNotification(
                'info',
                'Indice gratuit',
                'Cet indice est gratuit et n\'entraînera aucune pénalité.',
                3000
            );
            return;
        }

        // Pour les indices payants
        if (currentChallengeScore < hintCost) {
            showNotification(
                'error',
                'Score insuffisant',
                'Vous n\'avez pas assez de points pour débloquer cet indice.',
                3000
            );
            return;
        }

        // Afficher la confirmation pour les indices payants
        const notification = document.createElement('div');
        notification.className = 'custom-notification notification-warning';
        notification.innerHTML = `
            <i class="fas fa-exclamation-triangle notification-icon"></i>
            <div class="notification-content">
                <div class="notification-title">Attention - Pénalité</div>
                <div class="notification-message">
                    L'utilisation de cet indice entraînera une pénalité de ${hintCost} points.<br>
                    Votre score actuel: ${currentChallengeScore} points
                </div>
                <div class="notification-buttons mt-2">
                    <button class="btn btn-sm btn-success confirm-hint">Confirmer</button>
                    <button class="btn btn-sm btn-danger cancel-hint">Annuler</button>
                </div>
            </div>
        `;

        document.getElementById('notification-container').appendChild(notification);

        notification.querySelector('.confirm-hint').addEventListener('click', () => {
            notification.remove();
            unlockHint(hintNumber);
            applyHintPenalty(hintNumber);
        });

        notification.querySelector('.cancel-hint').addEventListener('click', () => {
            notification.remove();
        });
        return;
    }

    // Si l'indice est déjà déverrouillé, basculer son affichage
    if (hintContent.style.display === 'none') {
        hintContent.style.display = 'block';
    } else {
        hintContent.style.display = 'none';
    }
}

// Fonction pour déverrouiller un indice
function unlockHint(hintNumber) {
    const hintContent = document.getElementById(`hint${hintNumber}`);
    const hintButton = document.querySelector(`button[onclick="showHint(${hintNumber})"]`);
    
    if (!hintContent || !hintButton) return;

    // Afficher l'indice
    hintContent.style.display = 'block';
    hintContent.classList.remove('locked');
    
    // Cacher l'overlay
    const overlay = hintContent.querySelector('.hint-lock-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }

    // Mettre à jour l'icône
    const icon = hintButton.querySelector('.hint-icon');
    if (icon) {
        icon.classList.remove('fa-lock');
        icon.classList.add('fa-unlock');
    }

    // Ajouter à la liste des indices utilisés
    if (!usedHints.has(hintNumber)) {
        usedHints.add(hintNumber);
        hintCount++;
        updateScoreDisplay();
        updateHintProgressBar();
    }
}

// Fonction pour appliquer la pénalité
function applyHintPenalty(hintNumber) {
    const hintCost = hints[hintNumber].cost;
    
    // Appliquer la pénalité
    currentChallengeScore = Math.max(0, currentChallengeScore - hintCost);
    
    // Sauvegarder l'état
    localStorage.setItem('challenge2Score', currentChallengeScore);
    localStorage.setItem('usedHints2', JSON.stringify([...usedHints]));
    
    // Mettre à jour les affichages
    updateScoreDisplay();
    updateHintProgressBar();
    updatePenaltyDisplay();

    showNotification(
        'success',
        'Indice débloqué',
        `Indice déverrouillé avec succès. Pénalité appliquée: -${hintCost} points`,
        3000
    );
}

// Fonction pour vérifier le flag
function submitFlag(event) {
    event.preventDefault();
    const flagInput = document.getElementById('flagInput');
    const userFlag = flagInput.value.trim().toUpperCase();
    const submittedFlag = userFlag.startsWith('FLAG{') ? userFlag : `FLAG{${userFlag}}`;
    const correctFlag = 'FLAG{IMAGE_SECRETE}';

    const resultMessage = document.getElementById('result-message');

    if (submittedFlag === correctFlag) {
        finalChallengeScore = currentChallengeScore;
        
        // Mettre à jour le score global
        let globalScore = parseInt(localStorage.getItem('ctfScore')) || 0;
        globalScore += finalChallengeScore;
        localStorage.setItem('ctfScore', globalScore);

        // Ajouter aux challenges complétés
        let completedChallenges = JSON.parse(localStorage.getItem('completedChallenges')) || [];
        if (!completedChallenges.includes('2')) {
            completedChallenges.push('2');
            localStorage.setItem('completedChallenges', JSON.stringify(completedChallenges));
        }

        resultMessage.innerHTML = `
            <div class="success-message">
                <h4>🎉 Félicitations !</h4>
                <p>Flag correct ! Vous avez gagné ${finalChallengeScore} points.</p>
                <div class="score-summary">
                    <p>Score initial: ${initialScore} points</p>
                    <p>Pénalités totales: -${initialScore - currentChallengeScore} points</p>
                    <p>Indices utilisés: ${hintCount}/${totalHints}</p>
                    <p class="final-score">Score final obtenu: ${finalChallengeScore} points</p>
                    <p>Score total: ${globalScore} points</p>
                </div>
                <div class="navigation-buttons mt-3">
                    <a href="/" class="btn btn-primary">
                        <i class="fas fa-home"></i> Retour à l'accueil
                    </a>
                    <a href="/challenge/3" class="btn btn-success">
                        <i class="fas fa-forward"></i> Challenge suivant
                    </a>
                </div>
            </div>
        `;

        updateHomePageScore();
        
        // Désactiver le formulaire
        flagInput.disabled = true;
        flagInput.form.querySelector('button[type="submit"]').disabled = true;

    } else {
        resultMessage.innerHTML = `
            <div class="error-message">
                <h4>❌ Incorrect</h4>
                <p>Ce n'est pas le bon flag. Réessayez !</p>
            </div>
        `;
        
        flagInput.value = '';
        flagInput.focus();
    }
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Cacher tous les indices au départ
    document.querySelectorAll('.hint-content').forEach(hint => {
        hint.style.display = 'none';
        hint.classList.add('locked');
    });

    // Restaurer l'état
    currentChallengeScore = parseInt(localStorage.getItem('challenge2Score')) || initialScore;
    const usedHintsStored = JSON.parse(localStorage.getItem('usedHints2')) || [];
    
    usedHintsStored.forEach(hintNumber => {
        usedHints.add(hintNumber);
        if (hintNumber !== 1) hintCount++;
        
        const hintContent = document.getElementById(`hint${hintNumber}`);
        const hintButton = document.querySelector(`button[onclick="showHint(${hintNumber})"]`);
        
        if (hintContent && hintButton) {
            const icon = hintButton.querySelector('.hint-icon');
            if (icon) {
                icon.classList.remove('fa-lock');
                icon.classList.add('fa-unlock');
            }
            hintContent.classList.remove('locked');
            const overlay = hintContent.querySelector('.hint-lock-overlay');
            if (overlay) overlay.style.display = 'none';
        }
    });

    updateScoreDisplay();

    // Gestionnaire de soumission
    const flagForm = document.getElementById('flagForm');
    if (flagForm) {
        flagForm.addEventListener('submit', submitFlag);
    }
});

// Fonction pour mettre à jour la barre de progression
function updateHintProgressBar() {
    const penaltyBar = document.getElementById('hintPenaltyBar');
    if (penaltyBar) {
        const percentage = (currentChallengeScore / initialScore) * 100;
        penaltyBar.style.width = `${percentage}%`;
        
        if (percentage > 75) {
            penaltyBar.className = 'progress-bar bg-success';
        } else if (percentage > 50) {
            penaltyBar.className = 'progress-bar bg-warning';
        } else {
            penaltyBar.className = 'progress-bar bg-danger';
        }
    }
}

// Fonction pour mettre à jour l'affichage des pénalités
function updatePenaltyDisplay() {
    const penaltyDisplay = document.getElementById('penalty-display');
    if (penaltyDisplay) {
        const penalties = initialScore - currentChallengeScore;
        if (penalties > 0) {
            penaltyDisplay.innerHTML = `
                <div class="penalty-alert">
                    <i class="fas fa-exclamation-triangle"></i>
                    Pénalités: -${penalties} points
                </div>
            `;
            penaltyDisplay.style.display = 'block';
        } else {
            penaltyDisplay.style.display = 'none';
        }
    }
} 