/* Read-only presentation of the existing list. No writes or event overrides. */
(() => {
  'use strict';
  const bar = document.getElementById('listProgressBar');
  const fill = document.getElementById('progressFill');
  const count = document.getElementById('progressCount');
  const caption = document.getElementById('progressCaption');
  const note = document.getElementById('progressNote');
  function update() {
    const shopping = isShoppingMode();
    const visible = currentItems().filter(item => shopping || isTaskVisibleNow(item));
    // Active ranges are informational notes without a completion control.
    const items = visible.filter(item => shopping || !isRangeTask(item));
    const done = items.filter(item => item.done).length;
    const total = items.length;
    const percentage = total ? Math.round(done / total * 100) : 0;
    const summary = `${shopping ? 'נקנו' : 'בוצעו'} ${done} מתוך ${total}`;
    caption.textContent = shopping ? 'סוגרות את הרשימה' : 'בקצב שלך';
    count.textContent = summary;
    bar.setAttribute('aria-valuenow', String(percentage));
    bar.setAttribute('aria-valuetext', total ? summary : 'הרשימה ריקה');
    fill.style.transform = `scaleX(${total ? done / total : 0})`;
    bar.closest('.list-progress').classList.toggle('is-complete', total > 0 && done === total);
    note.textContent = !total ? 'מתחילות בדבר אחד קטן.' : done === total ? 'הכול מסומן. מגיע לך רגע לעצמך.' : done ? 'עוד דבר קטן ירד מהראש.' : 'בלי לחץ. דבר אחד בכל פעם.';
    if (!shopping && visible.some(isRangeTask)) note.textContent += ' טווחי תאריכים לא נספרים.';
  }
  new MutationObserver(update).observe(document.getElementById('taskList'), {childList: true});
  update();
})();
