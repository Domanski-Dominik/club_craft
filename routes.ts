/**
 * Tu są dostępne ściezki bez zalogowania się
 * @type {string[]}
 */
export const publicRoutes = ["/"];
/**
 * Te ścieżki używane są do autoryzacji
 * @type {string[]}
 */
export const authRoutes = ["/login", "/register"];
/**
 * Ścieżka autryzacyjna która w żadny wypadku nie powinna być zablokowana
 * @type {string}
 */
export const apiAuthPrefix = "/api/auth";
/**
 * Przekierowanie po zalogowaniu
 * @type {string}
 */
export const DEAFAULT_LOGIN_REDIRECT = "/home";
