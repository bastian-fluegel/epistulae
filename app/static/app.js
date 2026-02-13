document.querySelectorAll('.answer-btn').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var answerIndex = this.getAttribute('data-answer');
    console.log('Gewählte Antwort:', answerIndex);
    // Später: Request an Backend, dann nächsten Brief anzeigen
    this.setAttribute('aria-pressed', 'true');
    this.style.borderColor = 'var(--accent)';
  });
});
