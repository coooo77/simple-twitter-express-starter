# Simple Twitter

## 專案說明 (Project Title)：
![image](https://i.imgur.com/Z1MgMNi.png)
ALPHA Camp 全端網路開發課程，學期四期中分組作業，以Twitter網站為基礎，使用Node.js、Express建立的的簡易社群網站。
* 免安裝預覽連結 ([點我](https://simple-twitter-express.herokuapp.com/))


## 協作者：
### [coooo77](https://github.com/coooo77) (組長)：
* 前台推文瀏覽頁面
* 首頁使用者推薦名單
* 後台推文與使用者清單頁面
* 種子資料設計
* 主要功能檢查與修復
* Google Map打卡功能
* 執行專案自動化測試與佈署
* 專案任務分配
* master主分支與pull request管理

### [brendasy](https://github.com/brendasy)（協同開發）：
* 註冊與登入功能
* 前台推文瀏覽頁面
* 使用者個人頁面
* 推文與留言頁面功能
* 使用者追蹤與推文收藏功能
* Model關聯設定
* 線上即時對話功能
* 主要功能檢查與修復

### [appleeway](https://github.com/appleeway)（協同開發）：
* 種子資料設計
* 個人與其他使用者資訊頁面區別
* 追隨使用者功能
* 使用者個別資訊排序
* 主要功能檢查與修復

## 環境建置與需求 (prerequisites)：
* Node.js ([下載](https://nodejs.org/))
* MySQL ([下載](https://dev.mysql.com/downloads/mysql))
* MySQL Workbench ([下載](https://dev.mysql.com/downloads/workbench/))

## 安裝與執行步驟 (installation and execution)：
1. 下載Github頁面上內容
```console
git clone https://github.com/coooo77/simple-twitter-express-starter
```
2. 啟動Node.js cmd以指令cd移動至simple-twitter-express-starter資料夾底下
```console
cd 下載位置/simple-twitter-express-starter
```
3. 根據環境建置與需求安裝軟體與套件
```console
npm install
```
4. 取得 Imgur API([連結](https://api.imgur.com/oauth2/addclient))與Google Map API([連結](https://cloud.google.com/console/google/maps-apis/overview?hl=zh-tw))，在環境變數.env中設定
```console
touch .env
IMGUR_CLIENT_ID=<Imgur clientID>
Google_API_KEY=<Google_API_KEY>
```

5. MySQL Workbench建立資料庫
```console
create database ac_twitter_workspace;
use ac_twitter_workspace;
```

6. 在終端執行指令，建立Table與種子資料
```console
npx sequelize db:migrate
npx sequelize db:seed:all
```

7. 啟動專案
```console
npm run start
```

8. 開啟瀏覽器，輸入網址
> [localhost:3000/](https://localhost:3000/)

## 測試用帳號 (dummy)：
|使用者名稱   |帳號              |密碼            |權限           |
|:----------:|:-----------------:|:-------------:|:-------------:|
|root        |user1@example.com  |12345678       |admin          |
|使用者01    |user2@example.com   |12345678       |user           |
|使用者02    |user1@example.com   |12345678       |user           |

## 功能描述 (features)：

### 註冊/登入/登出
* 除了註冊和登入頁，使用者一定要登入才能使用網站
* 註冊時，使用者可以創建帳號，並設定名稱、信箱與密碼

### 前台
* 使用者能瀏覽所有的推播 (tweet)
* 使用者能在首頁看見跟隨者 (followers) 數量排列前 10 的使用者推薦名單
* 使用者能點擊其他使用者的名稱時，能瀏覽該使用者的個人資料及推播
* 使用者能新增推播、回覆別人的推播，字數限制在 140 以內，且不能為空白
* 使用者可以追蹤/取消追蹤其他使用者 (不能追蹤自己)
* 使用者能對別人的推播按 Like/Unlike
* 使用者能編輯自己的名稱、介紹和大頭照
* 使用者能瀏覽其他使用者的推播、關注對象、跟隨者、喜歡的推播

### 後台
* 管理者登入網站後，能夠經由瀏覽列進入後台頁面 (只有管理員能看見後台入口)
* 管理者可以瀏覽全站的推播清單
* 管理者可以直接在清單上快覽推播回覆內容前 50 個字
* 管理者可以在清單上刪除使用者的推播
* 管理者可以看到活躍數據，包括推播數量、關注人數、跟隨者人數、推播被 like 的數量

### 額外功能
* 線上即時對話，可與同時進入聊天室頁面的其他使用者，在線上即時發送文字訊息與所有人聊天
* 打卡功能，使用Google Maps API載入、搜尋地理資訊，可標注推文所在的地圖位置
