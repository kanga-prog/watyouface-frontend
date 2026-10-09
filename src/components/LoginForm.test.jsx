import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LoginForm from './LoginForm';
import { api } from '../utils/api';

vi.mock('../utils/api', () => ({ api: { login: vi.fn() } }));

function renderForm() {
  return render(<BrowserRouter><LoginForm /></BrowserRouter>);
}

describe('LoginForm', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('sends credentials and relies on the HttpOnly cookie without storing a JWT', async () => {
    api.login.mockResolvedValue({ ok: true, json: async () => ({ username: 'alice', avatarUrl: '' }) });
    renderForm();
    fireEvent.change(screen.getByPlaceholderText('Adresse e-mail'), { target: { value: 'alice@example.test' } });
    fireEvent.change(screen.getByPlaceholderText('Mot de passe'), { target: { value: 'SecurePassword123!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }));

    await waitFor(() => expect(api.login).toHaveBeenCalledWith({ email: 'alice@example.test', password: 'SecurePassword123!' }));
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('username')).toBe('alice');
  });

  it('displays an API error without storing a token', async () => {
    api.login.mockResolvedValue({ ok: false, text: async () => 'Identifiants invalides' });
    renderForm();
    fireEvent.change(screen.getByPlaceholderText('Adresse e-mail'), { target: { value: 'alice@example.test' } });
    fireEvent.change(screen.getByPlaceholderText('Mot de passe'), { target: { value: 'WrongPassword123!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }));
    await waitFor(() => expect(screen.getByText(/Identifiants invalides/)).toBeInTheDocument());
    expect(localStorage.getItem('token')).toBeNull();
  });
});
