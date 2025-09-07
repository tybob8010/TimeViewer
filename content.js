// 日時表示用の要素を作成
let datetimeDiv = document.getElementById('datetime-display-ext');

if (!datetimeDiv) {
    datetimeDiv = document.createElement('div');
    datetimeDiv.id = 'datetime-display-ext';
    datetimeDiv.style.cssText = `
        position: fixed;
        bottom: 10px;
        right: 10px;
        color: rgba(255, 255, 255, 0.8);
        background-color: rgba(0, 0, 0, 0.8);
        padding: 5px;
        font-size: 12px;
        z-index: 999999;
        font-family: monospace;
        border-radius: 5px;
        text-shadow: 1px 1px 2px black;
        cursor: pointer;
        transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
        user-select: none;
    `;
    document.body.appendChild(datetimeDiv);
}

// 状態管理
let mode = 0; // 0: 24h, 1: 12h
let updateInterval = null;
let defaultMode = 0; // デフォルトのモード (0: 24h, 1: 12h)
let clickOpacity = 0.05; // シングルクリックで切り替わる透明度を管理する変数
let showMilliseconds = true; // ミリ秒の表示/非表示状態
let isPattern2 = false; // テーマの状態管理 (false: パターン1, true: パターン2)

// テーマを適用する関数
function applyTheme() {
    if (isPattern2) {
        // パターン2: 白地に黒い文字
        datetimeDiv.style.color = `rgba(0, 0, 0, 0.8)`;
        datetimeDiv.style.backgroundColor = `rgba(255, 255, 255, 0.8)`;
        datetimeDiv.style.textShadow = 'none';
    } else {
        // パターン1: 黒地に白い文字
        datetimeDiv.style.color = `rgba(255, 255, 255, 0.8)`;
        datetimeDiv.style.backgroundColor = `rgba(0, 0, 0, 0.8)`;
        datetimeDiv.style.textShadow = '1px 1px 2px black';
    }
}

// 時間のフォーマットを更新する関数
function updateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const week = ["日", "月", "火", "水", "木", "金", "土"][now.getDay()];
    let hour = now.getHours();
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');

    let timeString = '';
    
    if (mode === 1) { // 12時間表記
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12;
        hour = hour ? hour : 12;
        timeString = `${hour}:${minute}:${second} ${ampm}`;
    } else { // 24時間表記
        timeString = `${String(hour).padStart(2, '0')}:${minute}:${second}`;
    }

    // ミリ秒の表示/非表示
    if (showMilliseconds) {
        const millisecond = String(now.getMilliseconds()).padStart(3, '0');
        timeString += `.${millisecond}`;
    }

    const dateString = `${year}年${month}月${day}日(${week})`;
    datetimeDiv.innerHTML = `${dateString}<br>${timeString}`;
}

// ポップアップからのメッセージを受信
chrome.runtime.onMessage.addListener((request) => {
    if (request.type === "updateSettings") {
        if (request.displayOn) {
            datetimeDiv.style.visibility = 'visible';
            datetimeDiv.style.opacity = '1';
            if (!updateInterval) {
                updateInterval = setInterval(updateTime, 1);
            }
        } else {
            datetimeDiv.style.visibility = 'hidden';
            datetimeDiv.style.opacity = '0';
            if (updateInterval) {
                clearInterval(updateInterval);
                updateInterval = null;
            }
        }
        
        // 透明度を更新
        const opacityValue = request.opacity / 100;
        datetimeDiv.style.backgroundColor = `rgba(0, 0, 0, ${opacityValue})`;
        datetimeDiv.style.color = `rgba(255, 255, 255, ${opacityValue})`;

        // デフォルトモード、クリック透明度、ミリ秒表示、テーマを設定
        defaultMode = request.defaultMode;
        mode = defaultMode;
        showMilliseconds = request.showMilliseconds;
        isPattern2 = request.isPattern2;
        applyTheme();
        updateTime();
        clickOpacity = parseFloat(request.clickOpacity) / 100;
    }
});

// 日時表示部分のクリックイベント
datetimeDiv.addEventListener('click', () => {
    // 現在の透明度が完全な不透明（1）なら、設定された透明度にする
    if (parseFloat(datetimeDiv.style.opacity) > 0.99) {
        datetimeDiv.style.opacity = clickOpacity;
    } 
    // そうでなければ、完全な不透明（1）に戻す
    else {
        datetimeDiv.style.opacity = '1';
    }
});

// 拡張機能起動時の初期設定
chrome.storage.local.get(['displayOn', 'opacity', 'defaultMode', 'clickOpacity', 'showMilliseconds', 'isPattern2'], (result) => {
    // 表示/非表示
    if (result.displayOn === false) {
        datetimeDiv.style.visibility = 'hidden';
        datetimeDiv.style.opacity = '0';
    } else {
        datetimeDiv.style.visibility = 'visible';
        datetimeDiv.style.opacity = '1';
        if (!updateInterval) {
            updateInterval = setInterval(updateTime, 1);
        }
    }
    // 透明度
    const savedOpacity = result.opacity !== undefined ? result.opacity : 80;
    const opacityValue = savedOpacity / 100;
    datetimeDiv.style.backgroundColor = `rgba(0, 0, 0, ${opacityValue})`;
    datetimeDiv.style.color = `rgba(255, 255, 255, ${opacityValue})`;

    // デフォルトモード、クリック透明度、ミリ秒表示、テーマを設定
    defaultMode = result.defaultMode !== undefined ? result.defaultMode : 0;
    mode = defaultMode;
    showMilliseconds = result.showMilliseconds !== undefined ? result.showMilliseconds : true;
    isPattern2 = result.isPattern2 !== undefined ? result.isPattern2 : false;
    applyTheme();
    updateTime();
    clickOpacity = result.clickOpacity !== undefined ? parseFloat(result.clickOpacity) / 100 : 0.05;
});