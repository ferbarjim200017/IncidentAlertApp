import { useState, useEffect } from 'react';
import { User } from '../types';
import { Logo } from './Logo';
import * as firebaseService from '../firebaseService';
import './Login.css';

interface LoginProps {
  onLogin: (user: User) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Cargar credenciales guardadas
    const savedUsername = localStorage.getItem('saved_username');
    const savedPassword = localStorage.getItem('saved_password');
    if (savedUsername && savedPassword) {
      setUsername(savedUsername);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }

    try {
      // Buscar usuario en Firebase
      const user = await firebaseService.getUserByUsername(username.toLowerCase());

      if (user && user.password === password) {
        // Guardar credenciales si está marcado
        if (rememberMe) {
          localStorage.setItem('saved_username', username);
          localStorage.setItem('saved_password', password);
        } else {
          localStorage.removeItem('saved_username');
          localStorage.removeItem('saved_password');
        }
        
        // Guardar usuario en localStorage para sesión
        localStorage.setItem('current_user', JSON.stringify(user));
        onLogin(user);
      } else {
        setError('Usuario o contraseña incorrectos');
      }
    } catch (error) {
      console.error('Error durante login:', error);
      setError('Error al iniciar sesión. Intenta nuevamente.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <Logo />
          <h1>Sistema de Incidencias</h1>
          <p>Inicia sesión para continuar</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="login-error">
              ⚠️ {error}
            </div>
          )}

          <div className="login-field">
            <label htmlFor="username">Usuario</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu usuario"
              autoFocus
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
            />
          </div>

          <div className="login-remember">
            <label className="remember-checkbox">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Guardar credenciales</span>
            </label>
          </div>

          <button type="submit" className="btn-login">
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}
