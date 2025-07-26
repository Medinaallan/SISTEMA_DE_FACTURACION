import React, { useState } from 'react';

interface LoginProps {
  onLogin: (success: boolean) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simular delay de autenticación
    setTimeout(() => {
      if (credentials.username === 'ADMIN' && credentials.password === '1234') {
        localStorage.setItem('erp_authenticated', 'true');
        localStorage.setItem('erp_user', 'ADMIN');
        localStorage.setItem('erp_login_time', new Date().toISOString());
        onLogin(true);
      } else {
        setError('Usuario o contraseña incorrectos');
        setLoading(false);
      }
    }, 1000);
  };

  return React.createElement('div', { className: 'min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4' },
    React.createElement('div', { className: 'max-w-md w-full' },
      // Logo y título
      React.createElement('div', { className: 'text-center mb-8' },
        React.createElement('div', { className: 'text-6xl mb-4' }, '🏢'),
        React.createElement('h1', { className: 'text-3xl font-bold text-white mb-2' }, 
          'ERP HONDURAS'
        ),
        React.createElement('p', { className: 'text-blue-200' }, 
          'Sistema de Facturación Profesional'
        )
      ),

      // Formulario de login
      React.createElement('div', { className: 'bg-white rounded-xl shadow-2xl p-8' },
        React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-6' },
          React.createElement('div', {},
            React.createElement('label', { 
              className: 'block text-sm font-medium text-gray-700 mb-2' 
            }, '👤 Usuario'),
            React.createElement('input', {
              type: 'text',
              required: true,
              value: credentials.username,
              onChange: (e: any) => setCredentials(prev => ({ ...prev, username: e.target.value })),
              className: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
              placeholder: 'Ingrese su usuario',
              disabled: loading
            })
          ),

          React.createElement('div', {},
            React.createElement('label', { 
              className: 'block text-sm font-medium text-gray-700 mb-2' 
            }, '🔒 Contraseña'),
            React.createElement('input', {
              type: 'password',
              required: true,
              value: credentials.password,
              onChange: (e: any) => setCredentials(prev => ({ ...prev, password: e.target.value })),
              className: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
              placeholder: 'Ingrese su contraseña',
              disabled: loading
            })
          ),

          error ? React.createElement('div', { 
            className: 'bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm' 
          }, '❌ ' + error) : null,

          React.createElement('button', {
            type: 'submit',
            disabled: loading,
            className: `w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              loading 
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
            }`
          }, loading ? '⏳ Iniciando sesión...' : '🚀 Iniciar Sesión')
        ),

        // Información de acceso
        React.createElement('div', { className: 'mt-6 p-4 bg-gray-50 rounded-lg' },
          React.createElement('h3', { className: 'text-sm font-medium text-gray-900 mb-2' }, 
            '🔑 Credenciales de Acceso:'
          ),
          React.createElement('div', { className: 'text-sm text-gray-600 space-y-1' },
            React.createElement('div', {}, '👤 Usuario: ADMIN'),
            React.createElement('div', {}, '🔒 Contraseña: 1234')
          )
        )
      )
    )
  );
}
