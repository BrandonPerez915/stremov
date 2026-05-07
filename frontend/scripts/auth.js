import { apiClient } from "./utils/apiClient.js";

class AppError extends Error {
  constructor(message, statusCode, name, cause = null) {
    super(message);
    this.statusCode = statusCode;
    this.name = name || this.constructor.name;
    this.cause = cause;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

async function registerUser(username, email, password) {
  const payload = { username, email, password };

  try {
    const data = await apiClient.post('/users', payload);
    return data;
  } catch (error) {
    throw new AppError(
      error.message || 'Failed to register user',
      error.status,
      'RegisterUserError',
      error.cause
    );
  }
}

async function loginUser(username, password) {
  const payload = { username, password };

  try {
    const data = await apiClient.post('/login', payload);

    //guardar token
    localStorage.setItem('jwtToken', data.token);

    //guardamos datos del usuario para usarlos en el frontend sin llamadas extra
    if (data.token) {
      try {
        const jwtPayload = JSON.parse(atob(data.token.split('.')[1]));

        const userProfile = await apiClient.get(`/users/${jwtPayload.username}`);

        localStorage.setItem('userData', JSON.stringify({
          _id: userProfile.user._id,
          username: userProfile.user.username,
          email: userProfile.user.email,
          favoritesListId: userProfile.user.lists.find(list => list.name === 'Favoritos')?._id || null,
          role: jwtPayload.role
        }));

        if (userProfile.user.avatarUrl) {
          localStorage.setItem('avatarUrl', userProfile.user.avatarUrl);
        }
      } catch {}
    }

    window.toast({
      type: 'success',
      title: `Welcome ${username}!`,
      message: 'Redirecting to home page...',
      duration: 1000
    });

    setTimeout(() => {
      window.location.href = '/home';
    }, 1000);
  } catch (error) {
    throw new AppError(
      error.message || 'Failed to login user',
      error.status,
      'LoginUserError',
      error.cause
    );
  }
}

const registerForm = document.getElementById('register-form');
const registerSection = document.getElementById('register-section');
const loginForm = document.getElementById('login-form');
const loginSection = document.getElementById('login-section');

function validateForm(form, hasToConfirmPassword = false) {
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
  });

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

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formIsValid = validateForm(loginForm);

  if (!formIsValid) {
    window.toast({
      type: 'error',
      title: 'Validation Error',
      message: 'Please correct the errors in the form.',
      duration: 3000
    });
    return;
  }

  const usernameInput = e.target.querySelector('custom-input[name="username"]');
  const passwordInput = e.target.querySelector('custom-input[name="password"]');

  try {
    await loginUser(usernameInput.value || '', passwordInput.value || '');
  } catch (error) {
    window.toast({
      type: 'error',
      title: 'Login Error',
      message: error.message,
      duration: 3000
    });
  }
});

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formIsValid = validateForm(registerForm, true);

  if (!formIsValid) {
    window.toast({
      type: 'error',
      title: 'Validation Error',
      message: 'Please correct the errors in the form.',
      duration: 3000
    });
    return;
  }

  const usernameInput = e.target.querySelector('custom-input[name="username"]');
  const emailInput = e.target.querySelector('custom-input[name="email"]');
  const passwordInput = e.target.querySelector('custom-input[name="password"]');
  const confirmPasswordInput = e.target.querySelector('custom-input[name="confirm-password"]');

  const payload = {
    username: usernameInput.value || '',
    email: emailInput.value || '',
    password: passwordInput.value || ''
  };

  try {
    await registerUser(payload.username, payload.email, payload.password);

    usernameInput.value = '';
    emailInput.value = '';
    passwordInput.value = '';
    confirmPasswordInput.value = '';
    registerSection.classList.toggle('hidden');
    loginSection.classList.toggle('hidden');

    window.toast({
      type: 'success',
      title: 'Registration Successful',
      message: 'Your account has been created! You can now log in.',
      duration: 3000
    });
  } catch (error) {
    if (error.statusCode === 409) {
      const cause = error.cause || {};
      if (cause.field === 'username') {
        registerForm.querySelector('custom-input[name="username"]')?.showError('This username already exists');
      } else if (cause.field === 'email') {
        registerForm.querySelector('custom-input[name="email"]')?.showError('This email already exists');
      }
      return;
    }

    window.toast({
      type: 'error',
      title: 'Registration Error',
      message: error.message,
      duration: 3000
    });
  }
});
