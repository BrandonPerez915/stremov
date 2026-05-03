const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');

function validateForm(form, hasToConfirmPassword=false) {
  let formIsValid = true;
  const inputs = form.querySelectorAll('custom-input');

  inputs.forEach(input => {
    if (!input.checkValidity()) {
      formIsValid = false;

      if (input.validity.valueMissing) {
        input.showError('Field is required');
      } else if (input.validity.typeMismatch) {
        input.showError('Invalid format');
      } else if (input.validity.tooShort) {
        input.showError('Minimum 6 characters');
      } else {
        input.showError('Invalid data');
      }
    }
  })

  if (hasToConfirmPassword) {
    const passwordInput = form.querySelector('.password-input');
    const confirmPasswordInput = form.querySelector('.confirm-password-input');

    if (passwordInput.value !== confirmPasswordInput.value) {
      confirmPasswordInput.showError('Passwords do not match');
      formIsValid = false;
    }
  }

  return formIsValid;
}

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const formIsValid = validateForm(loginForm);

  if (!formIsValid) {
    window.toast({
      type: 'error',
      title: 'Validation Error',
      message: 'Please correct the errors in the form.',
      duration: 3000
    })
    return
  }

  // TODO: implementar lógica de login (API, localStorage, etc)
  window.toast({
    type: 'success',
    title: 'Login Successful',
    message: 'Welcome back!',
    duration: 3000
  });
});

registerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const formIsValid = validateForm(registerForm, true);

  if (!formIsValid) {
    window.toast({
      type: 'error',
      title: 'Validation Error',
      message: 'Please correct the errors in the form.',
      duration: 3000
    })
    return
  }

  // TODO: implementar lógica de registro (API, localStorage, etc)
  window.toast({
    type: 'success',
    title: 'Registration Successful',
    message: 'Your account has been created!',
    duration: 3000
  });
})
