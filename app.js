/* ===== 설정: PNG 파일 =====
   프로젝트 루트에 1.png, 2.png, 3.png ... 를 넣어두세요.
   필요 시 BASE/PREFIX/EXT만 바꿔 쓰면 됩니다.
*/
const TOTAL_PAGES = 4;          // 총 페이지 개수
const BASE = "";                // 경로 (예: "pages/")
const PREFIX = "";              // 접두어 (예: "page-")
const EXT = ".png";             // 확장자

const pageEl = document.getElementById("pageCurrent");
const overlay = document.getElementById("overlay");
let index = 1;                  // 현재 페이지(1부터)

/* 유틸 */
const urlOf = n => `${BASE}${PREFIX}${n}${EXT}`;
const preload = src => new Promise(res=>{
  const img = new Image(); img.onload=()=>res(src); img.onerror=()=>res(null); img.src=src;
});

/* 초기 로드 */
function setStatic(n){
  pageEl.style.backgroundImage = `url("${urlOf(n)}")`;
}

/* 넘김 시트 만들기
   dir="forward"  : 현재 페이지( index )가 왼쪽으로 넘어감 → front=현재 PNG
   dir="backward" : 이전 페이지( index-1 )가 오른쪽으로 닫히며 나타남 → front=이전 PNG
*/
function makeSheet(n, dir){
  const sheet = document.createElement("div");
  sheet.className = "sheet";
  const front = document.createElement("div");
  front.className = "face front";
  front.style.backgroundImage = `url("${urlOf(n)}")`;
  const back = document.createElement("div");
  back.className = "face back";

  sheet.appendChild(front); sheet.appendChild(back);
  overlay.appendChild(sheet);

  if(dir === "forward"){
    sheet.style.transform = "rotateY(0deg)"; // 시작 상태
    // 다음 프레임에 회전 시작
    requestAnimationFrame(()=> sheet.style.transform = "rotateY(-180deg)");
  }else{
    sheet.style.transform = "rotateY(-180deg)"; // 왼쪽에 뒤집혀 있음
    requestAnimationFrame(()=> sheet.style.transform = "rotateY(0deg)");
  }
  // 종료 후 제거
  sheet.addEventListener("transitionend", ()=> sheet.remove(), {once:true});
  return sheet;
}

/* 다음/이전 */
let busy = false;

async function goNext(){
  if(busy || index >= TOTAL_PAGES) return;
  busy = true;
  // 미리 다음 PNG 프리로드
  await preload(urlOf(index+1));
  // 넘김 시트(현재 페이지 그림)
  makeSheet(index, "forward");
  // 아래 정지면은 다음 페이지로 즉시 교체 (시트가 떠나며 다음이 드러남)
  setStatic(index+1);
  index++;
  // 애니메이션 종료 대기(transition과 동일 900ms 정도)
  setTimeout(()=> busy=false, 950);
}

async function goPrev(){
  if(busy || index <= 1) return;
  busy = true;
  await preload(urlOf(index-1));
  // 넘김 시트(이전 페이지 그림이 닫히며 나타남)
  makeSheet(index-1, "backward");
  // 정지면은 애니메이션 거의 끝날 때 교체
  setTimeout(()=> setStatic(index-1), 450);
  index--;
  setTimeout(()=> busy=false, 950);
}

/* 클릭/키보드/스와이프 네비게이션 */
document.querySelector(".nav.next").addEventListener("click", goNext);
document.querySelector(".nav.prev").addEventListener("click", goPrev);

document.addEventListener("keydown", (e)=>{
  if(e.key==="ArrowRight") goNext();
  if(e.key==="ArrowLeft")  goPrev();
});

let startX=null;
document.querySelector(".book").addEventListener("pointerdown", e=> startX=e.clientX);
document.querySelector(".book").addEventListener("pointerup", e=>{
  if(startX==null) return;
  const dx = e.clientX - startX; startX=null;
  if(dx < -40) goNext();
  if(dx >  40) goPrev();
});

/* 시작 */
(async function init(){
  await preload(urlOf(1));
  setStatic(1);
  // 다음/이전도 살짝 프리로드
  if(TOTAL_PAGES>1) preload(urlOf(2));
})();
