module.exports = (server) => {

  const SocketServer = require('ws').Server

  const wss = new SocketServer({ server: server })
  let onlineUser = []
  // 監聽是否有新的 client 連上線
  wss.on('connection', ws => {
    console.log('One client has connected.')

    let clients = wss.clients

    // 監聽 client 傳來的訊息
    ws.on('message', event => {
      let data = JSON.parse(event)
      switch (data.type) {
        //紀錄當前線上用戶
        case 'login': {
          let userData = {
            ...data.userData,
            ws
          }
          onlineUser.push(userData);
          let userList = {
            type: 'onlineUserList',
            onlineUser: JSON.parse(JSON.stringify(onlineUser))
          }
          clients.forEach(client => {
            client.send(JSON.stringify(userList))
          })
          break;
        }
        //當用戶send message to socket server將訊息廣播到每個用戶讓id符合toId的使用者認領
        case 'message': {
          if (data.toId && data.content) {
            clients.forEach(client => {
              client.send(JSON.stringify(data))
            })
            // ws.send(JSON.stringify(data))
          }
          break;
        }
      }

    })

    //當 WebSocket 的連線關閉時執行
    ws.on('close', (event) => {
      console.log('One client has disconnected.')

      let logoutUser = -1
      onlineUser.map((user, index) => {
        if (user.ws === ws) {

          logoutUser = index
          clients.forEach(client => {
            let data = { type: 'logout', logoutUser: user }
            client.send(JSON.stringify(data)) //廣播告知哪一位user離線了
          })
        }
      })
      onlineUser.splice(logoutUser, 1)
    })
  })
}
