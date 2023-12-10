const form = document.getElementById('signup');

form.addEventListener('submit', async function (event) {
  event.preventDefault();

  const formData = new FormData(form);
  const email = formData.get('email');

  // Effectuez une requête pour vérifier si l'e-mail est unique
  const isEmailUnique = await checkEmailUniqueness(email);

  if (!isEmailUnique) {
    alert('Cet e-mail est déjà enregistré. Veuillez utiliser un e-mail différent.');
  } else {
    submitForm(formData);
  }
});

async function checkEmailUniqueness(email) {
  const response = await fetch('http://localhost:3003/check-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
  const data = await response.json();
  return data.isEmailUnique;
}

function submitForm(formData) {
  fetch('http://localhost:3003/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(Object.fromEntries(formData)),
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        return response.json().then(data => {
          throw new Error(data.error);
        });
      }
    })
    .then(data => {
      console.log('Server response:', data);

      localStorage.setItem('jwtToken', data.token);
      
      form.reset(); // Réinitialisez le formulaire
    })
    .catch(error => {
      console.error(error.message);
    });
}