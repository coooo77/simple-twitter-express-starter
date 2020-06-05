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
    case 'onlineUserList': { //socket server更新線上用戶list

      let onlineUserTabList = document.querySelector('#v-pills-tab')
      let tabContentContainer = document.querySelector('#v-pills-tabContent')
      onlineUserTabList.innerHTML = ''
      tabContentContainer.innerHTML = ''
      let userTab = ''
      let userPanels = ''
      for (user of data.onlineUser) {
        if (user.id !== userData.id) {
          // userTab += `<li class="online-user list-group-item list-group-item-action" value="${user.id}">${user.name}</li>`
          userTab += `<a class="nav-link online-user p-2" name="${user.id}" id="v-pills-${user.id}-tab" data-toggle="pill" href="#v-pills-${user.id}" role="tab"
                aria-controls="v-pills-${user.id}" aria-selected="true">${user.name}</a>`

          userPanels += `<div class="tab-pane fade message-${user.id}-content" id="v-pills-${user.id}" role="tabpanel" aria-labelledby="v-pills-${user.id}-tab">
                </div>`
        }
      }
      onlineUserTabList.innerHTML = userTab
      tabContentContainer.innerHTML = userPanels
      break;
    }
    case 'message': { //有用戶發送訊息,對比toId如果符合本身id則顯示訊息
      if (Number(data.toId) === userData.id) {
        let message = document.createElement('p') //新增一個訊息氣泡
        message.classList.add("content", "message-from", "rounded", "fa", "p-2")

        let messageContainer = document.querySelector(`.message-${data.fromId}-content`)  //找出對應使用者id的對話框
        messageContainer.appendChild(message).innerHTML = data.content  //將訊息塞入對話框

        let messageIcon = document.querySelector('#message-icon')
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
            messageIcon.classList.add('fa-commenting', 'text-success')  //將訊息icon改為綠色有內容的樣式,已表示有新訊息未讀
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
    case 'reorganize': { //有人離線時,每個人在重新send userData到socket server
      let data = {
        type: 'login',
        userData: {
          id: userData.id, name: userData.name, date: Date.now()
        }
      }
      ws.send(JSON.stringify(data))
      break;
    }
  }
}

$('#exampleModal').on('show.bs.modal', function (event) { //開啟modal

  var modal = $(this)
  modal.find('.modal-title').text('Message to online users')

})

document.querySelector('#send').addEventListener('click', function (event) {
  let content = document.querySelector('#message-text').value
  let messageToName = document.querySelector('#chat-with').innerText
  let messageToId = document.querySelector('#chat-with').value
  if (content && messageToId) {
    let data = {
      type: 'message',
      fromId: userData.id,
      toId: messageToId,
      content: content,
      date: Date.now()
    }
    ws.send(JSON.stringify(data))
  }
  else {
    if (!content) {
      alert('you can\'t sent empty messge')
    }
    if (!messageToId) {
      alert('please choose a user for sending messsages to!')
    }
  }
})

// document.querySelector('#online-user').addEventListener('click', function (event) {
document.querySelector('#v-pills-tab').addEventListener('click', function (event) {

  let targetElement = event.target
  if (targetElement.classList.contains('online-user')) {
    console.log('targetEle', targetElement.name)
    let onlineUserId = targetElement.name

    if (document.querySelector(`#unread-${onlineUserId}-tag`)) {  //如果這個tab有未讀訊息badge
      document.querySelector(`#unread-${onlineUserId}-tag`).remove()  //將這個tab上的未讀badge移除
      let messageIcon = document.querySelector('#message-icon')
      if (!document.querySelector('.badge-new-message')) {  //如果已經沒有新訊息badge存在
        if (messageIcon.classList.contains('fa-commenting')) {  //如果訊息icon仍為綠色,就改回原本樣式
          messageIcon.classList.remove('fa-commenting', 'text-success')
          messageIcon.classList.add('fa-comment-o')
        }
      }
    }
    document.querySelector('#chat-with').value = onlineUserId
    document.querySelector('#chat-with').innerText = targetElement.innerText

  }
})