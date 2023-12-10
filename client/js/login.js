function logData() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const userData = {
        email: email,
        password: password,
    };

    fetch('http://localhost:3003/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                alert('Veuillez verifier vos informations.');
                userData.reset();
                throw new Error('La connexion a échoué. Veuillez vérifier vos informations d\'identification.');
                
            }
        })
        .then(data => {
            console.log('Server response:', data);
            window.location.href = './index.html';
        })
        .catch(error => {
            console.error(error.message);
        });
}

  
  
  
  // Fonction pour valider le jeton JWT
 /* async function validateToken(token) {
    const response = await fetch('http://localhost:3003/validate-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
  
    if (response.ok) {
      // Le jeton est valide
      const data = await response.json();
      console.log('Token validation success:', data);
      
      // Redirigez l'utilisateur vers la page principale après la validation du jeton
      window.location.href = './index.html';
    } else {
      // Le jeton n'est pas valide
      const data = await response.json();
      console.error('Token validation error:', data.error);
    }
  } */
  
  