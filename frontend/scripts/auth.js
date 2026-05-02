function register(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(result => {
      if (result.success) {
        alert('Registro exitoso. Ahora puedes iniciar sesión.');
        window.location.href = '/views/login';
      } else {
        alert('Error en el registro: ' + result.message);
      }
    })
}
