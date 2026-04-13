// ============================================================
//  Auth Guard — protege páginas internas
// ============================================================
import { auth } from './firebase-config.js';
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

/**
 * Bloqueia a página até confirmar o login. Se não houver usuário,
 * redireciona para index.html. Se houver, chama onReady(user).
 */
export function requireAuth(onReady){
  // esconde o body até validar para evitar flash de conteúdo
  document.documentElement.style.visibility = 'hidden';
  onAuthStateChanged(auth, user => {
    if(!user){
      window.location.replace('index.html');
      return;
    }
    document.documentElement.style.visibility = '';
    if(typeof onReady === 'function') onReady(user);
  });
}

/** Logout e volta para o login */
export function logout(){
  signOut(auth).finally(()=>window.location.replace('index.html'));
}

/** Helper: pega iniciais para o avatar */
export function initialsFor(user){
  const base = (user.displayName || user.email || '?').trim();
  const parts = base.split(/[\s@.]+/).filter(Boolean);
  return ((parts[0]?.[0]||'') + (parts[1]?.[0]||'')).toUpperCase() || base[0].toUpperCase();
}
