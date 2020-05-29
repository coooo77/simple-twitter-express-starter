const postTweet = document.querySelector('.post-tweet')
postTweet.addEventListener('input', function (event) {

  if (event.target.id === 'description' ||
    event.target.id === 'comment') {
    let input = event.target.value
    let count = input.length
    const feedback = document.querySelector('.invalid-feedback')
    if (count >= 100) {
      feedback.innerHTML = `${140 - count} words remain.`
      feedback.classList.add('text-danger')
      feedback.classList.add('d-block')
    } else {
      feedback.innerHTML = 'maximum 140 words.'
      feedback.classList.remove('text-danger')
      feedback.classList.add('text-success')
      feedback.classList.add('d-block')
    }
  }
})