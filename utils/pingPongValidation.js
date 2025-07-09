// utils/pingPongValidation.js
const validatePingPongScore = (puntiA, puntiB) => {
  // Controllo che i punti siano numeri non negativi
  if (puntiA < 0 || puntiB < 0) {
    return { valid: false, message: 'I punti devono essere numeri non negativi' };
  }

  // Controllo che non ci sia pareggio
  if (puntiA === puntiB) {
    return { valid: false, message: 'Una partita non può finire in pareggio' };
  }

  const maxScore = Math.max(puntiA, puntiB);
  const minScore = Math.min(puntiA, puntiB);

  // Caso normale: primo a 11 punti vince
  if (maxScore === 11 && minScore < 10) {
    return { valid: true };
  }

  // Caso deuce: se si arriva a 10-10, serve 2 punti di vantaggio
  if (minScore >= 10) {
    if (maxScore - minScore === 2) {
      return { valid: true };
    } else {
      return { 
        valid: false, 
        message: 'In caso di 10-10, serve 2 punti di vantaggio per vincere' 
      };
    }
  }

  // Caso non valido: vincere prima di arrivare a 11 senza che l\'avversario abbia almeno 10
  if (maxScore < 11) {
    return { valid: false, message: 'Una partita deve arrivare almeno a 11 punti' };
  }

  // Caso non valido: vincere con 11 punti ma avversario ha 10 o più
  if (maxScore === 11 && minScore >= 10) {
    return { 
      valid: false, 
      message: 'Con punteggio 10-10 o superiore, serve 2 punti di vantaggio' 
    };
  }

  return { valid: false, message: 'Punteggio non valido secondo le regole del ping-pong' };
};

module.exports = { validatePingPongScore };