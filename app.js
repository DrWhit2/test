/* =========================
   설정: PNG 파일 이름 & 개수
   1.png, 2.png, 3.png, 4.png ... (1부터 시작)
========================= */
const TOTAL_PAGES = 8;   // 페이지 총수에 맞게 바꾸세요
const BASE = "";         // 경로 (예: "pages/")
const EXT  = ".png";     // 확장자

const stack = document.getElementById("stack");
const btnPrev = document.querySelector(".nav.prev");
const btnNext = document.querySelector(".nav.next");

/* 유틸 */
const urlOf = n => `${BASE}${n}${EXT}`;
const preload = src => new Promise(resolve => { const i=new Image(); i.onload=()=>resolve(true); i.onerror=()=>resolve(false); i.src=src; });

/* 리프(한 장) 개수: page0(빈 앞면) + 1..TOTAL_PAGES 를 담기 위해 */
const LEAVES = Math.ceil((TOTAL_PAGES + 1) / 2); // +1은 첫 앞면(0) 자리
let turnedCount = 1; // 처음엔 leaf0이 넘겨져 있어서 왼쪽에 1p, 오른쪽에 2p

/* 리프 DOM 생성: 
   leaf j 의 front = page(2*j) [짝수], back = page(2*j+1) [홀수]
   j=0 -> front=0(빈), back=1(왼쪽 첫 페이지)
   j=1 -> front=2(오른쪽), back=3(왼쪽) ...
*/
function buildLeaves(){
  for(let j=0; j<LEAVES; j++){
    const leaf = document.createElement("section");
    leaf.className = "leaf";
    leaf.style.setProperty("--z", `${LEAVES - j}`); // 앞장이 위에

    const front = document.createElement("div");
    front.className = "face front";
    const fnum = 2*j;             // 짝수(오른쪽)
    if(fnum >= 1 && fnum <= TOTAL_PAGES){
      front.style.backgroundImage = `url("${urlOf(fnum)}")`;
    } else {
      front.style.background = "linear-gradient(180deg,#efe6cd,#e5d9bf)";
    }

    const back = document.createElement("div");
    back.className = "face back";
    const bnum = 2*j + 1;         // 홀수(왼쪽)
    if(bnum >= 1 && bnum <= TOTAL_PAGES){
      back.style.backgroundImage = `url("${urlOf(bnum)}")`;
    } else {
      back.style.background = "linear-gradient(180deg,#efe6cd,#e5d9bf)";
    }

    leaf.appendChild(front);
    leaf.appendChild(back);
    stack.appendChild(leaf);
  }

  // 초기 상태: leaf0만 뒤집어 왼쪽 1p가 보이게
  const leaves = getLeaves();
  leaves[0]?.classList.add("turned");
}
function getLeaves(){ return Array.from(document.querySelectorAll(".leaf")); }

/* 이동 가능 여부 검사 */
function canPrev(){ return turnedCount > 1; }
function canNext(){ return turnedCount < LEAVES; }

/* 다음 장: 아직 안 넘긴 다음 리프를 뒤집기 */
async function goNext(){
  if(!canNext()) return;
  const leaves = getLeaves();
  const target = leaves[turnedCount]; // 다음에 넘길 장
  // 미리 다음 이미지들 프리로드 (앞/뒤)
  const f = 2*turnedCount;       // 이 장의 앞면(짝수)
  const b = 2*turnedCount + 1;   // 이 장의 뒷면(홀수)
  if(f>=1 && f<=TOTAL_PAGES) preload(urlOf(f));
  if(b>=1 && b<=TOTAL_PAGES) preload(urlOf(b));

  requestAnimationFrame(()=> target.classList.add("turned"));
  turnedCount++;
}

/* 이전 장: 마지막으로 넘긴 리프를 되돌리기 */
function goPrev(){
  if(!canPrev()) return;
  const leaves = getLeaves();
  const target = leaves[turnedCount-1]; // 이미 넘긴 가장 위 장
  target.classList.remove("turned");
  turnedCount--;
}

/* 네비: 클릭/키보드/스와이프 */
btnNext.addEventListener("click", goNext);
btnPrev.addEventListener("click", goPrev);

document.addEventListener("keydown", (e)=>{
  if(e.key==="ArrowRight") goNext();
  if(e.key==="ArrowLeft")  goPrev();
});

let startX=null;
document.querySelector(".book").addEventListener("pointerdown", e=> startX=e.clientX);
document.querySelector(".book").addEventListener("pointerup", e=>{
  if(startX==null) return; const dx=e.clientX-startX; startX=null;
  if(dx<-40) goNext();
  if(dx> 40) goPrev();
});

/* 시작 */
(async function init(){
  // 1,2,3,4 … 일부 미리 프리로드
  for(let n=1; n<=Math.min(TOTAL_PAGES, 6); n++) preload(urlOf(n));
  buildLeaves();
})();
