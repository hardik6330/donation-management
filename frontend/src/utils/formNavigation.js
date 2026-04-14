export const handleFormNavigation = (e) => {
  const { key, target } = e;
  const isArrowKey = key === 'ArrowDown' || key === 'ArrowUp' || key === 'ArrowLeft' || key === 'ArrowRight';
  const isEnterKey = key === 'Enter';

  if (!isArrowKey && !isEnterKey) return false;

  // For text inputs, only move focus on Left/Right if cursor is at the boundary
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
    if (key === 'ArrowLeft' && target.selectionStart !== 0) return false;
    if (key === 'ArrowRight' && target.selectionEnd !== target.value.length) return false;
  }

  const form = target.form;
  if (!form) return false;

  // Get all focusable elements in the form
  const elements = Array.from(form.elements).filter(el => 
    (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.tagName === 'BUTTON') &&
    !el.disabled && el.type !== 'hidden'
  );

  const index = elements.indexOf(target);
  if (index === -1) return false;

  if (key === 'ArrowDown' || key === 'ArrowRight' || (isEnterKey && target.tagName !== 'TEXTAREA' && target.type !== 'submit')) {
    if (index < elements.length - 1) {
      e.preventDefault();
      elements[index + 1].focus();
      return true;
    }
  } else if (key === 'ArrowUp' || key === 'ArrowLeft') {
    if (index > 0) {
      e.preventDefault();
      elements[index - 1].focus();
      return true;
    }
  }

  return false;
};
