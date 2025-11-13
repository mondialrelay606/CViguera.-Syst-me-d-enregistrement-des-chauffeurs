/**
 * Vérifie si une date donnée correspond à aujourd'hui.
 * @param someDate La date à vérifier.
 * @returns `true` si la date est aujourd'hui, sinon `false`.
 */
export const isToday = (someDate: Date): boolean => {
  const today = new Date();
  return someDate.getDate() === today.getDate() &&
    someDate.getMonth() === today.getMonth() &&
    someDate.getFullYear() === today.getFullYear();
};
