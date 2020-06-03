// 建立一個 WebSocket 物件，並連上 socket server
const ws = new WebSocket('ws://localhost:3333')

// 連線建立後,傳送user資料給webSocketServer
ws.onopen = () => {
  console.log('open connection to server')
  const data = {
    type: 'login',
    userData: { id: userData.id, name: userData.name, date: Date.now() }
  }
  ws.send(JSON.stringify(data))
}

// 連線斷開後,傳送user資料給webSocketServer
ws.onclose = () => {
  console.log('close connection to server')
}

// 收到 server 事件時，將事件中的訊息印出來
ws.onmessage = event => {
  let data = JSON.parse(event.data)
  switch (data.type) {
    case 'message':
      if (Number(data.toId) === userData.id) {
        document.querySelector('#message-text').value = data.content
      }
      break;
    case 'reorganize': {
      let data = {
        type: 'login',
        userData: {
          id: userData.id, name: userData.name, date: Date.now()
        }
      }
      ws.send(JSON.stringify(data))
    }
      break;

  }
  console.log('message', data)
}

$('#exampleModal').on('show.bs.modal', function (event) {
  var button = $(event.relatedTarget) // Button that triggered the modal
  var recipient = button.data('whatever') // Extract info from data-* attributes
  // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
  // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
  var modal = $(this)
  modal.find('.modal-title').text('New message to ' + recipient)
  modal.find('.modal-body input').val(recipient)
})

document.querySelector('#send').addEventListener('click', function (event) {
  let content = document.querySelector('#message-text').value
  let data = {
    type: 'message',
    fromId: userData.id,
    toId: document.querySelector('#recipient-name').value,
    content: content,
    date: Date.now()
  }
  ws.send(JSON.stringify(data))
})
