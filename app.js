/* ===== 페이지 PNG 세팅 =====
   루트에 1.png, 2.png, 3.png, ... 를 넣어주세요.
*/
const TOTAL_PAGES = 8;   // 실제 페이지 수로 바꾸세요
const BASE = "";         // 경로(예: "pages/")
const EXT  = ".png";

const stack   = document.getElementById("stack");
const btnPrev = document.querySelector(".nav.prev");
const btnNext = document.querySelector(".nav.next");

const urlOf = n => `${BASE}${n}${EXT}`;
const preload = src => new Promise(r=>{ const i=new Image(); i.onload=()=>r(true); i.onerror=()=>r(false); i.src=src; });

/* 리프 개수: 한 장에 (왼쪽=홀수, 오른쪽=짝수) 2페이지 */
const LEAVES = Math.ceil(TOTAL_PAGES / 2);

/* 현재 왼쪽으로 넘겨진 장 수(=왼쪽에 쌓인 리프 수) */
let turnedCount = 1; // 초기: 1장을 넘겨서 1(왼쪽)과 2(오른쪽)이 보이도록

function buildLeaves(){
  for(let j=0; j<LEAVES; j++){
    const leaf = document.createElement("section");
    leaf.className = "leaf";
    leaf.style.setProperty("--z", `${LEAVES - j}`); // 앞장이 위로

    // 이 장이 담당하는 페이지 번호
    const leftPg  = 2*j + 1; // 홀수(왼쪽, back)
    const rightPg = 2*j + 2; // 짝수(오른쪽, front)

    const front = document.createElement("div"); // right
    front.className = "face front";
    if(rightPg <= TOTAL_PAGES) front.style.backgroundImage = `url("${urlOf(rightPg)}")`;

    const back  = document.createElement("div"); // left
    back.className = "face back";
    if(leftPg <= TOTAL_PAGES)  back.style.backgroundImage  = `url("${urlOf(leftPg)}")`;

    leaf.appendChild(front);
    leaf.appendChild(back);
    stack.appendChild(leaf);
  }

  // 초기: leaf0만 넘겨서 왼쪽(1) 보이게
  const leaves = getLeaves();
  if(leaves[0]) leaves[0].classList.add("turned");
}
function getLeaves(){ return Array.from(document.querySelectorAll(".leaf")); }

function canPrev(){ return turnedCount > 1; }
function canNext(){ return turnedCount < LEAVES; }

/* 다음 장으로 */
async function goNext(){
  if(!canNext()) return;
  const leaves = getLeaves();
  const target = leaves[turnedCount];

  // 프리로드(이 장의 좌/우)
  const leftPg  = 2*turnedCount + 1;
  const rightPg = 2*turnedCount + 2;
  if(leftPg  <= TOTAL_PAGES) preload(urlOf(leftPg));
  if(rightPg <= TOTAL_PAGES) preload(urlOf(rightPg));

  requestAnimationFrame(()=> target.classList.add("turned"));
  turnedCount++;
}

/* 이전 장으로 */
function goPrev(){
  if(!canPrev()) return;
  const leaves = getLeaves();
  const target = leaves[turnedCount-1];
  target.classList.remove("turned");
  turnedCount--;
}

/* 입력 */
btnNext.addEventListener("click", goNext);
btnPrev.addEventListener("click", goPrev);
document.addEventListener("keydown", e=>{
  if(e.key==="ArrowRight") goNext();
  if(e.key==="ArrowLeft")  goPrev();
});
let startX=null;
document.querySelector(".book").addEventListener("pointerdown", e=> startX=e.clientX);
document.querySelector(".book").addEventListener("pointerup",   e=>{
  if(startX==null) return; const dx=e.clientX-startX; startX=null;
  if(dx<-40) goNext(); if(dx>40) goPrev();
});

/* 시작 */
(async function init(){
  // 초기 spread(1,2)와 그 다음(3,4) 정도 프리로드
  for(let n=1; n<=Math.min(TOTAL_PAGES, 4); n++) preload(urlOf(n));
  buildLeaves();
})();
