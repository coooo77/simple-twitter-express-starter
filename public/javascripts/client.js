// 建立一個 WebSocket 物件，並連上 socket server
const port = 3333


// const ws = new WebSocket(`ws://localhost:${port}`)

const ws = new WebSocket('wss://simple-twitter-a.herokuapp.com')

// 連線建立後,傳送user資料給webSocketServer
ws.onopen = () => {
  console.log('open connection to server')
  const data = {
    type: 'login',
    userData: { id: userData.id, name: userData.name, date: Date.now() }
  }
  ws.send(JSON.stringify(data))

  if (document.querySelector('.online-user')) {
    document.querySelector('#no-online-user').classList.remove('active', 'show')
    document.querySelector('#select-user-notice').classList.add('active', 'show')
  }
}

// 連線斷開後,傳送user資料給webSocketServer
ws.onclose = () => {
  console.log('close connection to server')
}

// 收到 server 事件時，將事件中的訊息印出來
ws.onmessage = event => {

  let messageIcon = document.querySelector('#message-icon')
  let data = JSON.parse(event.data)
  switch (data.type) {
    case 'onlineUserList': { //socket server更新線上用戶list

      let onlineUserTabList = document.querySelector('#v-pills-tab')  //user tabs container
      let messageContainer = document.querySelector('#v-pills-tabContent') //messages container

      for (user of data.onlineUser) {
        if (user.id !== userData.id) {  //有別的使用者登入
          if (document.querySelector('#no-online-user').classList.contains('active')) { //將no online user的提醒換成 choose a user
            document.querySelector('#no-online-user').classList.remove('active', 'show')
            document.querySelector('#select-user-notice').classList.add('active', 'show')
          }

          if (!document.querySelector(`#v-pills-${user.id}-tab`)) { //如果user tab不存在 就新增
            let userTab = `<a class="nav-link online-user p-2" data-id="${user.id}" data-name="${user.name}" id="v-pills-${user.id}-tab" data-toggle="pill" href="#v-pills-${user.id}" role="tab"
                aria-controls="v-pills-${user.id}" aria-selected="true">${user.name}</a>`

            onlineUserTabList.innerHTML += userTab
            if (document.querySelector(`#v-pills-${user.id}`)) {
              if (document.querySelector(`#v-pills-${user.id}`).classList.contains('active')) {
                document.querySelector('#chat-with').innerText = user.name
                document.querySelector(`#v-pills-${user.id}-tab`).classList.add('active', 'show')
              }
            }
          }

          if (!document.querySelector(`#v-pills-${user.id}`)) { //如果user message container不存在 就新增
            let userPanels = `<div class="tab-pane fade message-${user.id}-content" id="v-pills-${user.id}" role="tabpanel" aria-labelledby="v-pills-${user.id}-tab"></div>`

            messageContainer.innerHTML += userPanels
          }
        }
      }

      break;
    }
    case 'message': { //有用戶發送訊息
      if (Number(data.toId) === userData.id) {  //對比toId如果符合本身id則顯示訊息
        let message = document.createElement('p') //新增一個訊息氣泡
        message.classList.add("content", "message-from", "rounded", "fa", "p-2")

        let messageContainer = document.querySelector(`.message-${data.fromId}-content`)  //找出對應使用者id的對話框
        messageContainer.appendChild(message).innerHTML = data.content  //將訊息塞入對話框

        let modal = document.querySelector('#exampleModal')
        let userTab = document.querySelector(`#v-pills-${data.fromId}-tab`)


        if (!userTab.classList.contains('active')) { //如果發話者的tab不是active
          if (!document.querySelector(`#unread-${data.fromId}-tag`)) {  //如果沒有提醒有新訊息的badge
            document.querySelector(`#v-pills-${data.fromId}-tab`).innerHTML +=
              `<span class="badge badge-danger badge-new-message" id="unread-${data.fromId}-tag">new</span>` //新增提醒有新訊息的badge
          }
        }

        if (!modal.classList.contains('show')) {  //如果modal是關閉狀態
          if (messageIcon.classList.contains('fa-comment-o')) {
            messageIcon.classList.remove('fa-comment-o')
            messageIcon.classList.add('fa-commenting', 'text-danger')  //將訊息icon改為紅色有內容的樣式,已表示有新訊息未讀
          }
        } else {  //modal是開啟狀態但user tab不是active
          if (!userTab.classList.contains('active')) {
            if (messageIcon.classList.contains('fa-comment-o')) {
              messageIcon.classList.remove('fa-comment-o')
              messageIcon.classList.add('fa-commenting', 'text-danger')  //將訊息icon改為紅色有內容的樣式,已表示有新訊息未讀
            }
          }
        }
      }
      if (Number(data.fromId) === userData.id) {
        let message = document.createElement('p')
        message.classList.add("content", "message-to", "rounded", "fa", "p-2")
        document.querySelector('.message-' + data.toId + '-content').appendChild(message).innerHTML = data.content
      }
      break;
    }

    case 'logout': {

      if (document.querySelector(`#v-pills-${data.logoutUser.id}-tab`)) { //若user 離線,將user tab移除
        if (document.querySelector(`#unread-${data.logoutUser.id}-tag`)) { //若尚有未讀訊息
          if (messageIcon.classList.contains('fa-commenting')) {  //如果訊息icon仍為紅色,就改回原本樣式
            messageIcon.classList.remove('fa-commenting', 'text-danger')
            messageIcon.classList.add('fa-comment-o')
          }
        }
        document.querySelector(`#v-pills-${data.logoutUser.id}-tab`).remove()
      }
      if (document.querySelector(`#v-pills-${data.logoutUser.id}`).classList.contains('active')) {
        document.querySelector('#chat-with').innerText += ' (offline)'
      }
      break;
    }
  }
}

$('#exampleModal').on('show.bs.modal', function (event) { //開啟modal

  var modal = $(this)
  modal.find('.modal-title').text('Message to online users')

  let messageIcon = document.querySelector('#message-icon')
  if (!document.querySelector('.badge-new-message')) {  //如果已經沒有新訊息badge存在
    if (messageIcon.classList.contains('fa-commenting')) {  //如果訊息icon仍為紅色,就改回原本樣式
      messageIcon.classList.remove('fa-commenting', 'text-danger')
      messageIcon.classList.add('fa-comment-o')
    }
  }

})

document.querySelector('#send').addEventListener('click', function (event) {
  let content = document.querySelector('#message-text').value
  let messageToName = document.querySelector('#chat-with').innerText
  let messageToId = document.querySelector('#chat-with').dataset.id
  if (content && messageToName) {
    let data = {
      type: 'message',
      fromId: userData.id,
      toId: messageToId,
      content: content,
      date: Date.now()
    }
    ws.send(JSON.stringify(data))
    document.querySelector('#message-text').value = ''
  }
  else {
    if (!content) {
      alert('you can\'t sent empty messge')
    }
    if (!messageToName) {
      alert('please choose a user for sending messsages to!')
    }
  }
})


document.querySelector('#v-pills-tab').addEventListener('click', function (event) {

  let targetElement = event.target

  if (targetElement.classList.contains('online-user')) {

    let onlineUserId = targetElement.dataset.id
    let onlineUserName = targetElement.dataset.name

    if (document.querySelector(`#unread-${onlineUserId}-tag`)) {  //如果這個tab有未讀訊息badge
      document.querySelector(`#unread-${onlineUserId}-tag`).remove()  //將這個tab上的未讀badge移除
      let messageIcon = document.querySelector('#message-icon')
      if (!document.querySelector('.badge-new-message')) {  //如果已經沒有新訊息badge存在
        if (messageIcon.classList.contains('fa-commenting')) {  //如果訊息icon仍為紅色,就改回原本樣式
          messageIcon.classList.remove('fa-commenting', 'text-danger')
          messageIcon.classList.add('fa-comment-o')
        }
      }
    }
    document.querySelector('#chat-with').dataset.id = onlineUserId
    document.querySelector('#chat-with').innerText = onlineUserName

  }
})