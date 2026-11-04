function updateListProgress(visible) {
  const shopping = isShoppingMode();
  const items = shopping ? visible : visible.filter(belongsToToday);
  const done = items.filter(item => item.done).length;
  const total = items.length;
  const complete = total > 0 && done === total;
  const later = shopping ? 0 : visible.filter(item => !item.done && !isRangeTask(item) && !belongsToToday(item)).length;
  const bar = document.getElementById('listProgressBar');
  const panel = bar.closest('.list-progress');
  const note = document.getElementById('progressNote');
  const summary = (shopping ? 'נקנו ' : 'בוצעו ') + done + ' מתוך ' + total;
  const laterCopy = later === 1 ? 'תזכורת אחת להמשך' : later + ' תזכורות להמשך';
  const caption = document.getElementById('progressCaption');
  caption.textContent = shopping ? 'סוגרות את הרשימה' : 'היום';
  caption.hidden = !shopping && (!total || complete);
  const count = document.getElementById('progressCount');
  count.textContent = shopping ? summary : !total ? 'אין משימות להיום' :
    complete ? 'סיימת להיום' : summary;
  bar.setAttribute('aria-valuenow', String(total ? Math.round(100 * done / total) : 0));
  bar.setAttribute('aria-valuetext', total ? summary : count.textContent);
  document.getElementById('progressFill').style.transform = 'scaleX(' + (total ? done / total : 0) + ')';
  panel.classList.toggle('is-complete', complete);
  panel.classList.toggle('no-tasks', !total && !shopping);
  if (shopping) {
    note.textContent = !total ? 'מתחילות בדבר אחד קטן.' : complete ? 'הכול מסומן. מגיע לך רגע לעצמך.' :
      done ? 'עוד דבר קטן ירד מהראש.' : 'בלי לחץ. דבר אחד בכל פעם.';
  } else {
    const detail = [];
    if (complete) detail.push(summary);
    if ((!total || complete) && later) detail.push(laterCopy);
    note.textContent = detail.join(' · ');
  }
  note.hidden = !note.textContent;
}
