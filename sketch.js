let stopSheet;
let walkSheet;
let attackSheet;
let questionBank; // 儲存從 CSV 載入的題庫
let askSheet;
let runSheet2;
let fallDownSheet2;
let stopSheet3; // 角色3的圖片精靈
let imagesLoaded = false;

let charX, charY; // 用來儲存角色的位置
let char2X, char2Y; // 新增角色的位置
let char3X, char3Y; // 角色3的位置
let facingDirection = 1; // 角色面向的方向：1 是右邊, -1 是左邊 
let char2FacingDirection = 1; // 角色2的面向：1 是右邊, -1 是左邊
let char3FacingDirection = 1; // 角色3的面向，設為圖片原始方向 (朝右)
let charState = 'idle'; // 角色狀態: 'idle', 'walking', 'attacking'
let attackFrameCounter = 0; // 攻擊動畫的計數器
let char2State = 'idle'; // 角色2的狀態: 'idle', 'running'
let hit2FrameCounter = 0; // 角色2受擊動畫的計數器

let nameInput; // 用來儲存 p5.dom 的輸入框元素
let retryButton; // 答錯時顯示的「再作答一次」按鈕
let acceptChallengeButton; // 接受小露考驗的按鈕
let declineChallengeButton; // 拒絕小露考驗的按鈕
let dialogueState = 'none'; // 對話狀態: 'none', 'asking', 'answered', 'battle', 'victory_question', 'quiz_wait', 'quiz_question', 'quiz_feedback', 'quiz_retry', 'challenge_小露'
let playerName = ''; // 用來儲存玩家輸入的名字
let score = 0; // 計分
let hasHitThisAttack = false; // 用來防止單次攻擊重複計分
let answeredFrame = 0; // 用來計時對話框的顯示
let victoryFrame = 0; // 用來計時勝利訊息的顯示，以觸發問答
let feedbackFrame = 0; // 用來計時問答回饋的顯示
let textBoxText = ''; // 將 textBoxText 提升為全域變數
let currentQuestion; // 儲存當前抽到的題目物件

const moveSpeed = 4; // 角色移動速度

// 站立動畫的設定
const stopSpriteWidth = 880; // 站立圖片精靈的總寬度
const stopTotalFrames = 10;
const stopFrameH = 160; // 單一影格的高度

// 走路動畫的設定 (517px / 3 frames = 172.33px)
const walkTotalFrames = 3;
const walkSpriteWidth = 517; // 走路圖片精靈的總寬度
const walkFrameH = 156; // 走路動畫單一影格的高度

// 攻擊動畫的設定 (5275px / 12 frames)
const attackTotalFrames =15;
const attackSpriteWidth = 5275;
const attackFrameH = 198;

// 新增角色(ask)動畫的設定
const askTotalFrames = 12;
const askSpriteWidth = 2260;
const askFrameH = 175;

// 角色2(run)動畫的設定 - 請根據您的 run.png 檔案修改這些值
const run2TotalFrames = 4;
const run2SpriteWidth = 737;
const run2FrameH = 142;

// 角色2(fall-down)動畫的設定
const fallDown2TotalFrames = 5;
const fallDown2SpriteWidth = 1005;
const fallDown2FrameH = 223;

// 角色3(stop)動畫的設定
const stop3TotalFrames = 5;
const stop3SpriteWidth = 235;
const stop3FrameH = 61;

const scaleFactor = 2; // 放大倍率，可依喜好調整
const animSpeed = 4; // 動畫速度，數字越小動畫越快 (每 4 個 draw() 迴圈換一幀)
const animSpeed3 = 10; // 角色3的動畫速度，數字越大越慢

function preload() {
  // 載入題庫 CSV，並指定有 header
  questionBank = loadTable(
    'questions.csv', 'csv', 'header',
    () => { checkAllImagesLoaded(); },
    (err) => { console.error('載入 questions.csv 失敗，請確認路徑與檔案是否存在：', err); }
  );
  // 使用載入成功/失敗回呼並把回傳的 img 指定回全域變數，確保取得正確的寬度/高度
  stopSheet = loadImage(
    '1/stop/stop.png',
    (img) => { stopSheet = img; checkAllImagesLoaded(); },
    (err) => { console.error('載入 stop.png 失敗，請確認路徑：', '1/stop/stop.png', err); }
  );
  walkSheet = loadImage(
    '1/walk/walk.png',
    (img) => { walkSheet = img; checkAllImagesLoaded(); },
    (err) => { console.error('載入 walk.png 失敗，請確認路徑：', '1/walk/walk.png', err); }
  );
  attackSheet = loadImage(
    '1/attrack/attrack.png',
    (img) => { attackSheet = img; checkAllImagesLoaded(); },
    (err) => { console.error('載入 attrack.png 失敗，請確認路徑：', '1/attrack/attrack.png', err); }
  );
  askSheet = loadImage(
    '2/ask/ask.png',
    (img) => { askSheet = img; checkAllImagesLoaded(); },
    (err) => { console.error('載入 ask.png 失敗，請確認路徑：', '2/ask/ask.png', err); }
  );
  runSheet2 = loadImage(
    '2/run/run.png',
    (img) => { runSheet2 = img; checkAllImagesLoaded(); },
    (err) => { console.error('載入 run.png 失敗，請確認路徑：', '2/run/run.png', err); }
  );
  fallDownSheet2 = loadImage(
    '2/fall-down/fall-down.png',
    (img) => { fallDownSheet2 = img; checkAllImagesLoaded(); },
    (err) => { console.error('載入 fall-down.png 失敗，請確認路徑：', '2/fall-down/fall-down.png', err); }
  );
  stopSheet3 = loadImage(
    '3/stop/stop.png',
    (img) => { stopSheet3 = img; checkAllImagesLoaded(); },
    (err) => { console.error('載入 stop.png (角色3) 失敗，請確認路徑：', '3/stop/stop.png', err); }
  );
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
  noSmooth(); // 讓像素風格的圖片放大後保持清晰，不會模糊
  charX = width * 0.66; // 角色初始 X 位置
  charY = height / 2; // 角色初始 Y 位置
  char2X = width * 0.33; // 新角色初始 X 位置
  char2Y = height / 2; // 新角色初始 Y 位置
  char3X = width * 0.85; // 角色3初始 X 位置 (畫布右方)
  char3Y = height / 2; // 角色3初始 Y 位置

  // 創建輸入框並在初始時隱藏
  nameInput = createInput();
  nameInput.position(-width, -height); // 先移出畫面避免閃爍
  nameInput.size(150);
  nameInput.hide();

  // 創建「再作答一次」按鈕並在初始時隱藏
  retryButton = createButton('再作答一次');
  retryButton.position(-width, -height);
  retryButton.mousePressed(retryQuestion); // 綁定點擊事件
  retryButton.hide();

  // 創建小露的考驗按鈕
  acceptChallengeButton = createButton('沒問題');
  acceptChallengeButton.position(-width, -height);
  acceptChallengeButton.mousePressed(acceptChallenge);
  acceptChallengeButton.hide();

  declineChallengeButton = createButton('嗯...我再想想');
  declineChallengeButton.position(-width, -height);
  declineChallengeButton.mousePressed(declineChallenge);
  declineChallengeButton.hide();
}

function checkAllImagesLoaded() {
  if (stopSheet?.width && walkSheet?.width && attackSheet?.width && askSheet?.width && runSheet2?.width && fallDownSheet2?.width && stopSheet3?.width && questionBank?.columns) imagesLoaded = true;
}

function draw() {
  background('#d1b3c4');

  if (!imagesLoaded) {
    push();
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(18);
    text('圖片尚未載入或路徑錯誤。請檢查 Console 的 404/Network。', width/2, height/2);
    pop();
    return;
  }

  // --- 角色1狀態管理 ---
  let currentSheet, frameW, frameH, totalFrames;

  // 如果正在攻擊，就不能被走路中斷
  if (charState !== 'attacking') {
    if (keyIsDown(RIGHT_ARROW) && !keyIsDown(LEFT_ARROW)) {
      charState = 'walking';
    } else if (keyIsDown(LEFT_ARROW) && !keyIsDown(RIGHT_ARROW)) {
      charState = 'walking';
    } else {
      charState = 'idle';
    }
  }

  // 根據狀態設定動畫和行為
  if (charState === 'attacking') {
    currentSheet = attackSheet;
    frameW = Math.floor(attackSpriteWidth / attackTotalFrames);
    frameH = attackFrameH;
    totalFrames = attackTotalFrames;

    // 當動畫播放完畢
    if (attackFrameCounter >= totalFrames * animSpeed) {
      attackFrameCounter = 0; // 重置計數器給下一個動畫
      charState = 'idle'; // ***攻擊結束後，回到站立狀態***
    } else {
      attackFrameCounter++;
    }
  } else if (charState === 'walking') {
    if (keyIsDown(RIGHT_ARROW)) {
      currentSheet = walkSheet;
      frameW = Math.floor(walkSpriteWidth / walkTotalFrames);
      frameH = walkFrameH;
      totalFrames = walkTotalFrames;
      const halfCharWidth = (frameW * scaleFactor) / 2;
      if (charX < width - halfCharWidth) charX += moveSpeed;
      facingDirection = 1;
    } else if (keyIsDown(LEFT_ARROW)) {
      currentSheet = walkSheet;
      frameW = Math.floor(walkSpriteWidth / walkTotalFrames);
      frameH = walkFrameH;
      totalFrames = walkTotalFrames;
      const halfCharWidth = (frameW * scaleFactor) / 2;
      if (charX > halfCharWidth) charX -= moveSpeed;
      facingDirection = -1;
    }
  } else { // idle
    currentSheet = stopSheet;
    frameW = Math.floor(stopSpriteWidth / stopTotalFrames);
    frameH = stopFrameH;
    totalFrames = stopTotalFrames;
  }

  // --- 繪製分數 ---
  if (dialogueState === 'battle') {
    textSize(32);
    fill(0);
    text(`Score: ${score}`, 30, 40);
  }

  // --- 角色2狀態管理 ---
  // 'hit' 狀態有最高優先級，動畫播放完前不能被打斷
  if (char2State === 'hit') {
    if (hit2FrameCounter >= fallDown2TotalFrames * animSpeed) {
      hit2FrameCounter = 0;
      char2State = 'idle'; // 受擊動畫結束後，回到待機狀態
    } else {
      hit2FrameCounter++;
    }
  } else { // 只有在非受擊狀態下，才能移動或待機
    if (keyIsDown(68) && !keyIsDown(65)) { // 'D' key
      char2State = 'running';
      char2FacingDirection = 1;
      char2X += moveSpeed;
    } else if (keyIsDown(65) && !keyIsDown(68)) { // 'A' key
      char2State = 'running';
      char2FacingDirection = -1;
      char2X -= moveSpeed;
    } else {
      char2State = 'idle';
    }
  }

  // --- 繪製左邊的新角色 ---
  let char2Sheet, char2FrameW, char2TotalFrames, char2FrameH;
  let char2CurrentFrame;

  if (char2State === 'hit') {
    char2Sheet = fallDownSheet2;
    char2FrameW = Math.floor(fallDown2SpriteWidth / fallDown2TotalFrames);
    char2TotalFrames = fallDown2TotalFrames;
    char2FrameH = fallDown2FrameH;
    char2CurrentFrame = floor(hit2FrameCounter / animSpeed);
  } else if (char2State === 'running') {
    char2Sheet = runSheet2;
    char2FrameW = Math.floor(run2SpriteWidth / run2TotalFrames);
    char2TotalFrames = run2TotalFrames;
    char2FrameH = run2FrameH;
  } else {
    char2Sheet = askSheet;
    char2FrameW = Math.floor(askSpriteWidth / askTotalFrames);
    char2TotalFrames = askTotalFrames;
    char2FrameH = askFrameH;

    // 只有在待機時，才根據角色1的位置自動轉向
    if (charX < char2X) {
      char2FacingDirection = -1; // 角色1在左邊，角色2朝左
    } else {
      char2FacingDirection = 1; // 角色1在右邊，角色2朝右 (恢復原狀)
    }
  }

  // 如果不是受擊狀態，則使用通用的循環動畫計算方式
  if (char2State !== 'hit') {
    char2CurrentFrame = floor(frameCount / animSpeed) % char2TotalFrames;
  }
  const char2Sx = char2CurrentFrame * char2FrameW;
  const char2Sy = 0;

  push();
  translate(char2X, char2Y);
  scale(char2FacingDirection, 1); // 根據面向翻轉角色2
  image(
    char2Sheet,
    0, 0, // 因為已經 translate，所以在新原點 (0,0) 繪製
    char2FrameW * scaleFactor,
    char2FrameH * scaleFactor,
    char2Sx, char2Sy,
    char2FrameW, char2FrameH
  );
  pop();
  // --- 新角色繪製結束 ---

  // --- 繪製角色3 ---
  const char3Sheet = stopSheet3;
  const char3FrameW = Math.floor(stop3SpriteWidth / stop3TotalFrames);
  const char3FrameH = stop3FrameH;
  const char3CurrentFrame = floor(frameCount / animSpeed3) % stop3TotalFrames;
  const char3Sx = char3CurrentFrame * char3FrameW;
  const char3Sy = 0;

  push();
  translate(char3X, char3Y);
  scale(char3FacingDirection, 1); // 直接使用 scale 翻轉
  image(
    char3Sheet,
    0, 0, // 因為是 CENTER 模式，在原點繪製即可
    char3FrameW * scaleFactor,
    char3FrameH * scaleFactor,
    char3Sx, char3Sy,
    char3FrameW, char3FrameH
  );
  pop();
  // --- 角色3繪製結束 ---

  // --- 繪製角色3的名稱 ---
  push();
  // 計算文字應該在的位置 (角色3頭頂上方)
  const nameYOffset = - (char3FrameH * scaleFactor) / 2 - 20;

  // 設定文字樣式
  textSize(22);
  textAlign(CENTER, CENTER);
  stroke(0);       // 黑色外框
  strokeWeight(4); // 外框粗細

  // 使用 HSB 色彩模式來產生彩虹效果
  colorMode(HSB, 360, 100, 100);
  const hue = frameCount % 360; // 色相隨時間變化 (0-360)
  fill(hue, 90, 100); // 設定飽和度和亮度都較高的顏色

  // 在角色3頭上繪製文字
  text('小露', char3X, char3Y + nameYOffset);
  pop(); // 恢復原本的繪圖設定 (包含色彩模式會變回 RGB)
  // --- 角色3名稱繪製結束 ---


  // --- 檢查距離並顯示對話框 ---
  const proximityThreshold2 = 200; // 觸發與角色2對話框的距離
  const distance2 = abs(charX - char2X);

  // 勝利條件檢查
  if (dialogueState === 'battle' && score >= 5) {
    dialogueState = 'victory_question';
  }
  // --- 與角色2的互動邏輯 ---
  if (distance2 < proximityThreshold2) {
    if (dialogueState === 'none') {
      dialogueState = 'asking';
    }

    if (dialogueState === 'asking') {
      textBoxText = '你叫什麼名字';
      // 顯示並定位輸入框在角色1頭上
      nameInput.position(charX - nameInput.width / 2, charY - (frameH * scaleFactor) / 2 - 40);
      nameInput.show();
    } else if (dialogueState === 'answered') {
      textBoxText = `${playerName}，久仰大名，來戰鬥吧!`;
      nameInput.hide(); // 確保輸入框被隱藏

      // 在顯示完回答後，等待約3秒 (180幀) 後進入戰鬥狀態
      if (frameCount > answeredFrame + 180) {
        dialogueState = 'battle';
        textBoxText = ''; // 切換到戰鬥時，清空文字框內容
      }
    } else if (dialogueState === 'victory_question') {
      textBoxText = '甘拜下風，讓我來考考你幾個問題吧!';
      // 顯示並定位輸入框在角色1頭上
      nameInput.hide(); // 確保此階段輸入框是隱藏的
      
      // 如果這是第一次進入此狀態，記錄當前幀數
      if (victoryFrame === 0) {
        victoryFrame = frameCount;
      }

      // 等待 5 秒 (5 * 60fps = 300 frames)
      if (frameCount > victoryFrame + 300) {
        dialogueState = 'quiz_question';
        // 從題庫隨機抽一題
        const questionIndex = floor(random(questionBank.getRowCount()));
        currentQuestion = questionBank.getRow(questionIndex);
      }
    } else if (dialogueState === 'quiz_question') {
      textBoxText = currentQuestion.getString('題目');
      nameInput.position(charX - nameInput.width / 2, charY - (frameH * scaleFactor) / 2 - 40);
      nameInput.show();
    } else if (dialogueState === 'quiz_feedback') {
      // textBoxText 已經在 keyPressed() 中被設定為回饋文字
      nameInput.hide(); // 在顯示回饋時隱藏輸入框
      // 顯示回饋 3 秒 (180 幀) 後，重置遊戲狀態
      if (frameCount > feedbackFrame + 180) {
        dialogueState = 'none';
        victoryFrame = 0; // 重置計時器
        feedbackFrame = 0;
      }
    } else if (dialogueState === 'quiz_retry') {
      // 在此狀態下，textBoxText 已被設為答錯回饋
      // 按鈕的位置和顯示將在繪製對話框後處理
      nameInput.hide();
    }
    // 根據狀態繪製對話框
    if (textBoxText) {
      // 對話框Y軸偏移量，使其出現在角色2頭頂上方
      const textYOffset = - (char2FrameH * scaleFactor) / 2 - 30; 
      
      push();
      translate(char2X, char2Y); 
      
      textSize(18);
      textAlign(CENTER, CENTER);
      const textW = textWidth(textBoxText);
      const boxPadding = 10;
      const boxW = textW + boxPadding * 2;
      const boxH = 35;

      fill(255, 255, 255, 220);
      stroke(0);
      rect(-boxW / 2, textYOffset - boxH / 2, boxW, boxH, 8);
      fill(0);
      noStroke();
      text(textBoxText, 0, textYOffset);
      pop();

      // 如果是答錯重試狀態，在文字框上方顯示按鈕
      if (dialogueState === 'quiz_retry') {
        const buttonX = char2X - retryButton.width / 2;
        const buttonY = char2Y + textYOffset - boxH / 2 - 35; // 35 是按鈕高度+間距
        retryButton.position(buttonX, buttonY);
        retryButton.show();
      }
    }

  // --- 與角色3的互動邏輯 ---
  } else if (dialogueState === 'challenge_小露' || (abs(charX - char3X) < 150 && dialogueState === 'none')) {
    const proximityThreshold3 = 150;
    const distance3 = abs(charX - char3X);

    if (distance3 < proximityThreshold3 && dialogueState === 'none') {
      dialogueState = 'challenge_小露';
    } else if (distance3 >= proximityThreshold3 && dialogueState === 'challenge_小露') {
      // 如果玩家在選擇時離開，則重置狀態
      declineChallenge();
    }

    if (dialogueState === 'challenge_小露') {
      const challengeText = '現在來接受考驗吧!';
      const textYOffset = - (char3FrameH * scaleFactor) / 2 - 60; // 將 Y 軸偏移量增加，讓文字框更往上
      
      // 在角色3頭上繪製文字框
      push();
      translate(char3X, char3Y);
      textSize(18);
      textAlign(CENTER, CENTER);
      const boxW = textWidth(challengeText) + 20;
      const boxH = 35;
      fill(255, 255, 255, 220);
      stroke(0);
      rect(-boxW / 2, textYOffset - boxH / 2, boxW, boxH, 8);
      fill(0);
      noStroke();
      text(challengeText, 0, textYOffset);
      pop();

      // 在角色1下方顯示按鈕
      acceptChallengeButton.position(charX - acceptChallengeButton.width - 5, charY + (frameH * scaleFactor) / 2 + 10);
      declineChallengeButton.position(charX + 5, charY + (frameH * scaleFactor) / 2 + 10);
      acceptChallengeButton.show();
      declineChallengeButton.show();
    }

  } else { // 如果不靠近任何可互動角色，則重置狀態
    // 隱藏所有可能顯示的UI元素
    nameInput.hide();
    retryButton.hide();
    acceptChallengeButton.hide();
    declineChallengeButton.hide();
    textBoxText = ''; // 清空對話框

    // 將遊戲狀態重設為初始狀態
    dialogueState = 'none';
    score = 0;
    playerName = '';
  }

  // 計算當前影格
  let currentFrame;
  if (charState === 'attacking') {
    // 讓攻擊動畫的每一幀都按順序播放，這樣角色和技能特效會一起出現並成長
    currentFrame = floor(attackFrameCounter / animSpeed);
  } else {
    currentFrame = floor(frameCount / animSpeed) % totalFrames;
  }
  const sx = currentFrame * frameW;
  const sy = 0;

  // 計算攻擊時的 Y 軸位移
  let yOffset = 0;
  if (charState === 'attacking') {
    // 使用 sin 函式製造一個從 0 -> 峰值 -> 0 的平滑上下移動曲線
    const currentAttackFrame = floor(attackFrameCounter / animSpeed);

    // 當動畫在第 9 幀到第 15 幀時 (索引 8 到 14)，讓角色移動
    if (currentAttackFrame >= 8 && currentAttackFrame < 15) {
      const attackMoveSpeed = moveSpeed * 1.5; // 攻擊時的移動速度可以快一點
      const halfCharWidth = (frameW * scaleFactor) / 2;

      if (facingDirection === 1 && charX < width - halfCharWidth) { // 向右移動
        charX += attackMoveSpeed;
      } else if (facingDirection === -1 && charX > halfCharWidth) { // 向左移動
        charX -= attackMoveSpeed;
      }

      // 在攻擊有效幀內進行碰撞檢測
      const hitDistance = abs(charX - char2X);
      const hitThreshold = (frameW * scaleFactor) / 2 + (char2FrameW * scaleFactor) / 2; // 兩個角色寬度的一半
      
      if (hitDistance < hitThreshold && !hasHitThisAttack && dialogueState === 'battle') {
        score++;
        char2State = 'hit'; // 將角色2狀態設為受擊
        hit2FrameCounter = 0; // 重置受擊動畫計數器
        hasHitThisAttack = true; // 標記本次攻擊已計分
      }
    }

    const attackProgress = (attackFrameCounter / (totalFrames * animSpeed)); // 0.0 ~ 1.0
    yOffset = -sin(attackProgress * PI) * 30; // 向上移動最多 30 像素
  }

  // --- 繪製角色1 ---
  push();
  translate(charX, charY + yOffset);
  scale(facingDirection, 1);

  image(
    currentSheet,
    0, 0,
    frameW * scaleFactor,
    frameH * scaleFactor,
    sx, sy,
    frameW, frameH
  );

  pop();
  // --- 角色1繪製結束 ---
}

function keyPressed() {
  // 當按下空白鍵且角色不在攻擊狀態時，開始攻擊
  if (key === ' ' && charState !== 'attacking') {
    charState = 'attacking';
    attackFrameCounter = 0; // 重置攻擊動畫計數器
    hasHitThisAttack = false; // 重置攻擊計分標記
  }

  // 當玩家在輸入框中按下 Enter 鍵
  if (keyCode === ENTER && dialogueState === 'asking') {
    playerName = nameInput.value();
    if (playerName.trim() !== '') { // 確保玩家有輸入內容
      dialogueState = 'answered';
      answeredFrame = frameCount; // 記錄當前幀數
      nameInput.value(''); // 清空輸入框
    }
  } else if (keyCode === ENTER && dialogueState === 'quiz_question') {
    const userAnswer = nameInput.value().trim();
    const correctAnswer = currentQuestion.getString('答案');

    if (userAnswer === correctAnswer) {
      // 答對了，進入回饋狀態
      textBoxText = currentQuestion.getString('答對回饋');
      dialogueState = 'quiz_feedback';
      feedbackFrame = frameCount;
    } else {
      // 答錯了，進入重試狀態
      textBoxText = `${currentQuestion.getString('答錯回饋')} ${currentQuestion.getString('提示')}`;
      dialogueState = 'quiz_retry';
    }

    nameInput.value(''); 
    nameInput.hide(); 
  }
}

function retryQuestion() {
  // 當「再作答一次」按鈕被點擊時觸發
  dialogueState = 'quiz_question'; // 將狀態切換回提問狀態
  retryButton.hide(); // 隱藏按鈕
  // textBoxText 會在下一個 draw() 循環中自動更新為題目
}

function acceptChallenge() {
  // 點擊「沒問題」後的行為
  console.log("玩家接受了考驗！"); // 在控制台顯示訊息，方便除錯
  // 在這裡可以加入考驗開始的邏輯，例如切換到一個新的遊戲狀態
  declineChallenge(); // 暫時先用重置狀態代替
}

function declineChallenge() {
  // 點擊「嗯...我再想想」或玩家遠離時的行為
  dialogueState = 'none';
  acceptChallengeButton.hide();
  declineChallengeButton.hide();
}


function windowResized() {
  // 當瀏覽器視窗大小改變時，自動調整畫布大小
  resizeCanvas(windowWidth, windowHeight);
  // 避免角色在視窗縮放後位置跑掉，可以選擇是否要重置位置
  // charX = width / 2;
}
