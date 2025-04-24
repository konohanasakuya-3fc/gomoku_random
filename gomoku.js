// 定数
const BOARD_SIZE = 15;
const boardElement = document.getElementById("board");


let gamePhase = "waiting_place"; 
// 状態の種類：
// "waiting_place" … 石を置く段階
// "waiting_observe" … 石を置いた後、観測するか選ぶ段階

const observeControls = document.getElementById("observe-controls");
const observeBtn = document.getElementById("observe-button");
const skipObserveBtn = document.getElementById("skip-observe-button");
let preObservationState = null; // 観測前の盤面保存用
const revertBtn = document.getElementById("revert-button");

let gameEnded = false;


// 盤面データの2次元配列
const board = [];

// 盤面の初期化
function createBoard() {
  for (let y = 0; y < BOARD_SIZE; y++) {
    const row = [];
    for (let x = 0; x < BOARD_SIZE; x++) {
      // 空のマスを生成
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.x = x;
      cell.dataset.y = y;

      // 後で使う用のデータ
      row.push({
        x,
        y,
        element: cell,
        observed: false,
        owner: null, // 'black' or 'white'
        probability: null, // 0.9, 0.7, etc
      });

      boardElement.appendChild(cell);
    }
    board.push(row);
  }
}

// 各プレイヤーの確率候補
const blackProbs = [0.9, 0.7];
const whiteProbs = [0.3, 0.1];

// 現在の確率インデックス
let blackProbIndex = 0;
let whiteProbIndex = 0;

// 現在のターンに対応する確率を取得
function getNextProbability() {
  if (currentPlayer === "black") {
    const prob = blackProbs[blackProbIndex];
    blackProbIndex = (blackProbIndex + 1) % blackProbs.length;
    return prob;
  } else {
    const prob = whiteProbs[whiteProbIndex];
    whiteProbIndex = (whiteProbIndex + 1) % whiteProbs.length;
    return prob;
  }
}



let currentPlayer = "black"; // 初期ターン
const probabilitySelect = document.getElementById("probability-select");

// マスをクリックしたときの処理
boardElement.addEventListener("click", (e) => {
    const cellEl = e.target;
    if (!cellEl.classList.contains("cell")) return;
    if (gameEnded || gamePhase !== "waiting_place") return;
    const x = parseInt(cellEl.dataset.x, 10);
    const y = parseInt(cellEl.dataset.y, 10);
    const cellData = board[y][x];
  
    if (cellData.owner !== null) return;
  
    //const selectedProb = parseFloat(probabilitySelect.value);
    const selectedProb = getNextProbability();

  
    // 石データ更新
    cellData.owner = currentPlayer;
    cellData.probability = selectedProb;
    cellData.observed = false;
  

    cellData.owner = currentPlayer;
    cellData.probability = selectedProb;
    cellData.observed = false;
    
    const percent = Math.round(selectedProb * 100);
    cellData.element.textContent = percent;
    
    // スタイル設定：高確率は黒背景に白文字、低確率は白背景に黒文字
    if (selectedProb >= 0.5) {
        if(selectedProb>=0.8){
            cellData.element.style.backgroundColor = "black";
        }else{
            cellData.element.style.backgroundColor = "#696969";
        }
    cellData.element.style.color = "white";
    } else {
        if(selectedProb >= 0.2){
            cellData.element.style.backgroundColor = "#dcdcdc";
        }else{
            cellData.element.style.backgroundColor = "white";
        }
    cellData.element.style.color = "black";
    }
    
    cellData.element.classList.add("unobserved");
    
    // 💡 この時点で観測フェーズへ
    gamePhase = "waiting_observe";
    observeControls.style.display = "block";



    
  });
  
  
  function switchTurn() {
    currentPlayer = currentPlayer === "black" ? "white" : "black";
    //updateTurnDisplay();
    updateTurnIndicator();
    gamePhase = "waiting_place";
  }
  

const turnIndicator = document.getElementById("turn-indicator");

 function updateTurnIndicator() {
   turnIndicator.textContent = `現在のターン：${currentPlayer === "black" ? "黒" : "白"}`;
}

skipObserveBtn.addEventListener("click", () => {
    observeControls.style.display = "none";
    switchTurn();
  });
  

const observeButton = document.getElementById("observe-button");

observeButton.addEventListener("click", () => {
    // 保存：深いコピーを取って元に戻せるようにする
    if (gameEnded || gamePhase !== "waiting_observe") return;

preObservationState = board.map(row => row.map(cell => ({
    owner: cell.owner,
    probability: cell.probability,
    observed: cell.observed
  })));
  
  // 1. 石を観測して一時的に色を確定
  board.forEach(row => {
    row.forEach(cell => {
      if (cell.owner && !cell.observed) {
        const r = Math.random();
        const isBlack = r < cell.probability;
  
        cell.tempColor = isBlack ? "black" : "white";
        //cell.element.textContent = isBlack ? "●" : "○";
        cell.element.style.backgroundColor = isBlack ? "black" : "white";
        cell.element.style.color = isBlack ? "white" : "black";
      }

    });

  });
  setTimeout(() => {
    const winner = checkVictory();
    if (winner) {
        alert(`${winner === "black" ? "黒" : "白"}の勝ちです！`);
        winner=null;
        gameEnded = true;
      
        observeControls.style.display = "none";
        revertBtn.style.display = "none"; // 勝負がついたら戻るボタンも非表示に
      } else {
      // 勝ちがなければ戻るボタンを表示
      revertBtn.style.display = "inline-block";
    }
  
    //observeControls.style.display = "none";
  }, 100); // 少し遅延を入れることで"●"や"○"が先に表示される

});

revertBtn.addEventListener("click", () => {
    board.forEach((row, y) => {
      row.forEach((cell, x) => {
        const saved = preObservationState[y][x];
        cell.owner = saved.owner;
        cell.probability = saved.probability;
        cell.observed = saved.observed;
        delete cell.tempColor;
  
            if (cell.owner) {
            const percent = Math.round(cell.probability * 100);
            cell.element.textContent = percent;
    
            if (cell.probability >= 0.5) {
                if(cell.probability>=0.8){
                    cell.element.style.backgroundColor = "black";
                }else{
                    cell.element.style.backgroundColor = "#696969";
                }
                cell.element.style.color = "white";
            } else {
                
            if(cell.probability >= 0.2){
                cell.element.style.backgroundColor = "#dcdcdc";
            }else{
                cell.element.style.backgroundColor = "white";
            }
                cell.element.style.color = "black";
            }
        } else {
          cell.element.textContent = "";
          cell.element.style.backgroundColor = "";
          cell.element.style.color = "";
        }
      });
    });
  
    revertBtn.style.display = "none";
    switchTurn(); // 戻したあとターンを交代
  });
  
function checkVictory() {
    const directions = [
      [1, 0],  // 横
      [0, 1],  // 縦
      [1, 1],  // 斜め右下
      [1, -1], // 斜め右上
    ];
  
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const cell = board[y][x];
        if (!cell.owner || cell.tempColor === undefined) continue;
  
        const color = cell.tempColor;
  
        for (const [dx, dy] of directions) {
          let count = 1;
          for (let step = 1; step < 5; step++) {
            const nx = x + dx * step;
            const ny = y + dy * step;
            if (nx < 0 || ny < 0 || nx >= BOARD_SIZE || ny >= BOARD_SIZE) break;
            const nextCell = board[ny][nx];
            if (nextCell.tempColor === color) {
              count++;
            } else {
              break;
            }
          }
          if (count >= 5) {
            return color;
          }
        }
      }
    }
  
    return null;
  }
  

createBoard(); // 盤面を生成
updateTurnIndicator();