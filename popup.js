document.addEventListener('DOMContentLoaded', () => {
  const displayToggle = document.getElementById('display-toggle');
  const opacitySlider = document.getElementById('opacity-slider');
  const opacityValueSpan = document.getElementById('opacity-value');
  const clickOpacitySlider = document.getElementById('click-opacity-slider');
  const clickOpacityValueSpan = document.getElementById('click-opacity-value');
  const millisecondsToggle = document.getElementById('milliseconds-toggle');
  const mode24h = document.getElementById('mode-24');
  const mode12h = document.getElementById('mode-12');
  const themePattern1 = document.getElementById('theme-pattern1');
  const themePattern2 = document.getElementById('theme-pattern2');

  // 設定をロードしてUIに反映
  chrome.storage.local.get(['displayOn', 'opacity', 'defaultMode', 'clickOpacity', 'showMilliseconds', 'isPattern2'], (result) => {
    // 日時表示
    displayToggle.checked = result.displayOn !== false;
    // 透明度
    const savedOpacity = result.opacity !== undefined ? result.opacity : 80;
    opacitySlider.value = savedOpacity;
    opacityValueSpan.textContent = `(現在: ${savedOpacity}%)`;
    // クリック透明度
    const savedClickOpacity = result.clickOpacity !== undefined ? result.clickOpacity : 5;
    clickOpacitySlider.value = savedClickOpacity;
    clickOpacityValueSpan.textContent = `(現在: ${savedClickOpacity}%)`;
    // ミリ秒表示
    millisecondsToggle.checked = result.showMilliseconds !== false;
    // 表示形式
    const defaultMode = result.defaultMode !== undefined ? result.defaultMode : 0;
    if (defaultMode === 0) {
      mode24h.checked = true;
    } else {
      mode12h.checked = true;
    }
    // テーマ
    const isPattern2 = result.isPattern2 !== undefined ? result.isPattern2 : false;
    if (isPattern2) {
      themePattern2.checked = true;
    } else {
      themePattern1.checked = true;
    }
  });

  // 設定変更時の処理
  function updateSettings() {
    const displayOn = displayToggle.checked;
    const opacity = opacitySlider.value;
    const clickOpacity = clickOpacitySlider.value;
    const defaultMode = mode12h.checked ? 1 : 0;
    const showMilliseconds = millisecondsToggle.checked;
    const isPattern2 = themePattern2.checked;

    // スライダーの現在値を更新
    opacityValueSpan.textContent = `(現在: ${opacity}%)`;
    clickOpacityValueSpan.textContent = `(現在: ${clickOpacity}%)`;

    // chrome.storage.local に設定を保存
    chrome.storage.local.set({ displayOn, opacity, defaultMode, clickOpacity, showMilliseconds, isPattern2 });

    // コンテンツスクリプトにメッセージを送信
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: "updateSettings",
        displayOn: displayOn,
        opacity: opacity,
        defaultMode: defaultMode,
        clickOpacity: clickOpacity,
        showMilliseconds: showMilliseconds,
        isPattern2: isPattern2
      });
    });
  }

  // イベントリスナー
  displayToggle.addEventListener('change', updateSettings);
  opacitySlider.addEventListener('input', updateSettings);
  clickOpacitySlider.addEventListener('input', updateSettings);
  millisecondsToggle.addEventListener('change', updateSettings);
  mode24h.addEventListener('change', updateSettings);
  mode12h.addEventListener('change', updateSettings);
  themePattern1.addEventListener('change', updateSettings);
  themePattern2.addEventListener('change', updateSettings);
});