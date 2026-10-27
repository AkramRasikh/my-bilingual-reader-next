export type SavedWordForms = {
  id?: string | null;
  baseForm?: string | null;
  surfaceForm?: string | null;
};

export function normalizeSavedWordForm(value: string | null | undefined) {
  return (value ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
}

function uniqueForms(word: SavedWordForms | null | undefined) {
  const forms = [
    normalizeSavedWordForm(word?.surfaceForm),
    normalizeSavedWordForm(word?.baseForm),
  ].filter((form) => form.length > 0);
  return [...new Set(forms)];
}

export function studiedWordIsInsideAnotherSavedWord(
  studied: SavedWordForms | null | undefined,
  savedWords: SavedWordForms[] | null | undefined,
) {
  const studiedForms = uniqueForms(studied);
  if (!studied || studiedForms.length === 0) {
    return false;
  }

  return (savedWords ?? []).some((other) => {
    if (!other || (studied.id != null && other.id === studied.id)) {
      return false;
    }
    return uniqueForms(other).some((container) =>
      studiedForms.some(
        (form) => container.length > form.length && container.includes(form),
      ),
    );
  });
}
