// Store for effects data and channel info
let effectsData = [];
let channelInfo = null;

// Initialize with StreamElements JWT
async function initialize(jwt) {
    try {
        // Get channel info from JWT
        const payload = jwt.split('.')[1];
        const padding = 4 - (payload.length % 4);
        const paddedPayload = payload + '='.repeat(padding);
        const decoded = JSON.parse(atob(paddedPayload));
        channelInfo = {
            channelId: decoded.channel,
            channelName: decoded.displayName
        };

        // Load initial effects
        await loadEffects(jwt);
    } catch (error) {
        console.error('Failed to initialize:', error);
    }
}

// Load effects from StreamElements
async function loadEffects(jwt) {
    try {
        const response = await fetch(`https://api.streamelements.com/kappa/v2/store/${channelInfo.channelId}/items`, {
            headers: {
                'Authorization': `Bearer ${jwt}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch effects: ${response.statusText}`);
        }

        const items = await response.json();
        effectsData = items
            .filter(item => item.name.startsWith('[Effect]')) // Only get effect items
            .map(item => ({
                name: item.name.replace('[Effect] ', ''),
                description: item.description,
                amount: item.cost,
                game: item.category
            }));
        
        renderEffects();
    } catch (error) {
        console.error('Failed to load effects:', error);
    }
}

// Render the effects list
function renderEffects() {
    const effectsList = document.getElementById('effects-list');
    effectsList.innerHTML = '';

    for (const effect of effectsData) {
        const card = document.createElement('div');
        card.className = 'effect-card';
        
        card.innerHTML = `
            <div class="effect-info">
                <div class="effect-name">${effect.name}</div>
                <div class="effect-description">${effect.description}</div>
                <div class="effect-amount">$${effect.amount.toFixed(2)}</div>
                ${effect.game ? `<div class="effect-game">Game: ${effect.game}</div>` : ''}
            </div>
            <button class="tip-button" onclick="openTipPage(${effect.amount})">Tip</button>
        `;
        
        effectsList.appendChild(card);
    }
}

// Open the StreamElements tip page with the pre-filled amount
function openTipPage(amount) {
    if (!channelInfo) {
        console.error('Channel info not available');
        return;
    }
    const tipUrl = `https://streamelements.com/${channelInfo.channelName}/tip?amount=${amount}`;
    window.open(tipUrl, '_blank');
} 