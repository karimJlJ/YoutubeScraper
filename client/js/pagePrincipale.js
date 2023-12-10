function submitChannel() {
    const channelURL = document.querySelector('.channel-input').value;
    fetch('http://localhost:3003/creators', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ channelURL })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadCreators(); // Rechargez la liste des créateurs après en avoir ajouté un nouveau.
        } else {
            console.error('Erreur lors de l\'ajout du créateur :', data.error);
        }
    });
}

function newEl(type, attrs = {}) {
    const el = document.createElement(type);
    for (let attr in attrs) {
        const value = attrs[attr];
        if (attr === 'innerText') el.innerText = value;
        else el.setAttribute(attr, value);
    }
    return el;
}

async function loadCreators() {
const res = await fetch('http://localhost:3003/creators');
const creators = await res.json();

const ctr = document.querySelector('.container');
ctr.innerHTML = ''; // Effacez le contenu existant avant de recharger les créateurs.

creators.forEach(creator => {
const card = newEl('div', {
    class: `card creator-${creator.id}`
});

const title = newEl('h2', {
    innerText: creator.name,
    id: 'creator-title'
});

title.addEventListener('click', function() {
    const creatorURL = creator.ytURL; 
// Redirection vers une nouvelle page (page vierge) lorsque l'élément est cliqué.
window.location.href = `creator.html?url=${encodeURIComponent(creatorURL)}`;
});

// Utilisez les données du créateur pour extraire le nombre d'abonnés et de vidéos
const subscriberCount = creator.subscriberCount;
const videoCount = creator.videoCount;

const subscriberCountElement = newEl('h4', {
    innerText: `Abonnés : ${subscriberCount}`
});

const videoCountElement = newEl('h4', {
    innerText: `Vidéos : ${videoCount}`
});

const img = newEl('img', {
    src: creator.img
});
img.style.width = '100px';

const deleteBtn = newEl('button', {
    innerText: 'Supprimer',
    class: 'delete-button' // Ajoutez la classe ici
});

// Ajoutez un gestionnaire d'événements pour le bouton de suppression
deleteBtn.onclick = () => deleteCreator(creator.id);

card.appendChild(title);
card.appendChild(subscriberCountElement);
card.appendChild(videoCountElement);
card.appendChild(img);
card.appendChild(deleteBtn);
ctr.appendChild(card);
});
}

loadCreators();

function deleteCreator(creatorId) {
    fetch(`http://localhost:3003/creators/${creatorId}`, {
        method: 'DELETE',
    })
    .then(res => {
        if (res.ok) {
            // Supprimez le créateur de l'affichage ici
            const creatorElement = document.querySelector(`.creator-${creatorId}`);
            if (creatorElement) {
                creatorElement.remove();
            }
        } else if (res.status === 404) {
            console.error('Créateur non trouvé');
        } else {
            console.error('Erreur lors de la suppression du créateur');
        }
    })
    .catch(error => {
        console.error('Erreur lors de la suppression du créateur :', error);
    });
}
