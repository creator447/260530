const _HEHES   = 'img_hehes.webp';
const _RUREONG = 'img_rureong.webp';

const SK='hjs_v5';
let S={yr:{},th:{}};
function ld(){try{const s=localStorage.getItem(SK);if(s)S=JSON.parse(s);}catch(e){}}
function sv(){localStorage.setItem(SK,JSON.stringify(S));}
ld();

let ses={mode:null,key:null,qs:[],ans:{},memos:{},cur:0};
const RD={"2014":"2회","2015":"3회","2016":"4회","2017":"5회","2018":"6회","2019":"7회","2020":"8회","2021":"9회","2022":"10회","2023":"11회","2024":"12회","2025":"13회"};
const LB=['①','②','③','④','⑤'];
const SS={'민법':{dot:'var(--bl)',nb:'var(--bls)',nc:'var(--bl)'},'행정법':{dot:'var(--yw)',nb:'var(--yws)',nc:'var(--yw)'},'행정학개론':{dot:'var(--gn)',nb:'var(--gns)',nc:'var(--gn)'}};

function show(id){document.querySelectorAll('.scr').forEach(s=>s.classList.remove('on'));document.getElementById(id).classList.add('on');window.scrollTo(0,0);}
function goHome(){renderHome();show('s-home');}

function switchTab(t,el){
  document.querySelectorAll('.mtab').forEach(e=>e.classList.remove('on'));el.classList.add('on');
  document.querySelectorAll('.tc').forEach(e=>e.classList.remove('on'));
  document.getElementById('tab-'+t).classList.add('on');
}

function getYrSt(year){
  const qs=QUESTIONS_DB[year]||[];
  const res=S.yr[year]||{};
  const ans=res.answers||{};
  let ok=0,ng=0,sk=0;
  const hasAns=qs.some(q=>q.answer!==null&&q.answer!==undefined);
  qs.forEach((q,i)=>{
    const c=ans[i];
    if(c===undefined){sk++;return;}
    if(q.answer===null||q.answer===undefined)return;
    const cs=Array.isArray(q.answer)?q.answer:[q.answer];
    if(cs.includes(c))ok++;else ng++;
  });
  const answered=Object.keys(ans).length;
  const isDone=answered===qs.length;
  const pct=hasAns&&answered>0?Math.round(ok/answered*100):null;
  return{qs,ans,ok,ng,sk,answered,isDone,pct,hasAns,total:qs.length};
}

function renderHome(){renderYr();renderTh();}

function renderYr(){
  const years=Object.keys(QUESTIONS_DB).sort((a,b)=>b-a);
  const done=[],todo=[];
  years.forEach(year=>{
    const st=getYrSt(year);
    const lbl=year+'년 제'+(RD[year]||'');
    const hasAns=st.hasAns;
    let card=`<div class="yc ${st.isDone?'done':''}" onclick="startYear('${year}')">
      <div class="yi ${st.isDone?'d':'u'}">${st.isDone?'✓':year.slice(2)+'년'}</div>
      <div class="yinfo">
        <div class="ytl">${lbl}${!hasAns?' <span class="nano">정답미제공</span>':''}</div>
        <div class="ymeta">${st.total}문제 · 민법·행정법·행정학개론</div>`;
    if(!st.isDone&&st.answered>0){
      card+=`<div class="mpb"><div class="mpbar"><div class="mpfill" style="width:${Math.round(st.answered/st.total*100)}%;background:var(--bl)"></div></div><div class="mplbl">${st.answered}/${st.total} 진행중</div></div>`;
    }
    card+=`</div>`;
    if(st.isDone&&hasAns&&st.pct!==null){
      const c=st.pct>=60?'var(--gn)':st.pct>=40?'var(--yw)':'var(--rd)';
      card+=`<div class="yscore"><span class="sp" style="color:${c}">${st.pct}%</span><span class="sf">${st.ok}/${st.total}</span></div>`;
    }
    card+=`<div class="yarr"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg></div></div>`;
    if(st.isDone)done.push(card);else todo.push(card);
  });
  document.getElementById('yd-list').innerHTML=done.join('');
  document.getElementById('yt-list').innerHTML=todo.join('');
  document.getElementById('yd-sec').style.display=done.length?'':'none';
}

function getThQs(theme){
  const subj=theme.id.startsWith('민법_')?'민법':theme.id.startsWith('행정법_')?'행정법':'행정학개론';
  const res=[];
  Object.entries(QUESTIONS_DB).forEach(([yr,qs])=>{
    qs.forEach(q=>{
      if(q.subj!==subj)return;
      const hay=(q.text+' '+q.choices.join(' ')).toLowerCase();
      if(theme.keywords.some(kw=>hay.includes(kw.toLowerCase())))
        res.push({...q,year:yr});
    });
  });
  return res;
}

function getThSt(tid,tqs){
  const res=S.th[tid]||{};const ans=res.answers||{};
  let ok=0,ng=0;
  tqs.forEach((q,i)=>{
    const c=ans[i];if(c===undefined)return;
    if(q.answer===null||q.answer===undefined)return;
    const cs=Array.isArray(q.answer)?q.answer:[q.answer];
    if(cs.includes(c))ok++;else ng++;
  });
  const answered=Object.keys(ans).length;
  const isDone=answered===tqs.length&&tqs.length>0;
  const hasAns=tqs.some(q=>q.answer!==null&&q.answer!==undefined);
  const pct=hasAns&&answered>0?Math.round(ok/answered*100):null;
  return{ok,ng,answered,isDone,pct,hasAns,total:tqs.length};
}

function renderTh(){
  const wrap=document.getElementById('theme-wrap');let html='';
  [['민법','민법'],['행정법','행정법'],['행정학개론','행정학개론']].forEach(([key])=>{
    const st=SS[key];
    let tq=0;Object.values(QUESTIONS_DB).forEach(qs=>qs.forEach(q=>{if(q.subj===key)tq++;}));
    html+=`<div class="ss"><div class="shdr"><div class="sdot" style="background:${st.dot}"></div><span class="slbl">${key}</span><span class="scnt">${tq}문제</span></div>`;
    THEMES[key].forEach((th,i)=>{
      const tqs=getThQs(th);const ts=getThSt(th.id,tqs);
      const sc=ts.pct===null?'var(--tx3)':ts.pct>=60?'var(--gn)':ts.pct>=40?'var(--yw)':'var(--rd)';
      html+=`<div class="thc ${ts.isDone?'done':''}" onclick="startTheme('${th.id}')">
        <div class="tn" style="background:${ts.isDone?'var(--gns)':st.nb};color:${ts.isDone?'var(--gn)':st.nc}">${ts.isDone?'✓':i+1}</div>
        <div class="thi"><div class="thnm">${th.name}</div><div class="thdc">${th.desc} · ${tqs.length}문제</div>
        ${!ts.isDone&&ts.answered>0?`<div class="mpbar" style="margin-top:4px"><div class="mpfill" style="width:${Math.round(ts.answered/ts.total*100)}%;background:var(--bl)"></div></div>`:''}
        </div>
        ${ts.isDone?`<span class="thsc" style="color:${sc}">${ts.pct!==null?ts.pct+'%':ts.answered+'개'}</span>`:''}
      </div>`;
    });
    html+='</div>';
  });
  wrap.innerHTML=html;
}

// ── 시작 ──
function startYear(year){
  const qs=(QUESTIONS_DB[year]||[]).map((q,i)=>({...q,year,idx:i}));
  const ex=S.yr[year]||{};
  ses={mode:'year',key:year,qs,ans:{...(ex.answers||{})},memos:{...(ex.memos||{})},cur:0};
  if(Object.keys(ses.ans).length>0&&Object.keys(ses.ans).length<qs.length){
    for(let i=0;i<qs.length;i++){if(ses.ans[i]===undefined){ses.cur=i;break;}}
  }
  document.getElementById('exam-title').textContent=year+'년 제'+(RD[year]||'');
  document.getElementById('exam-chip').textContent=qs.length+'문제';
  document.getElementById('q-ychip').style.display='none';
  show('s-exam');renderQ();
}

function startTheme(tid){
  const th=Object.values(THEMES).flat().find(t=>t.id===tid);
  const qs=getThQs(th).map((q,i)=>({...q,idx:i}));
  if(!qs.length){alert('해당 테마의 문제가 없습니다.');return;}
  const ex=S.th[tid]||{};
  ses={mode:'theme',key:tid,qs,ans:{...(ex.answers||{})},memos:{...(ex.memos||{})},cur:0};
  if(Object.keys(ses.ans).length>0&&Object.keys(ses.ans).length<qs.length){
    for(let i=0;i<qs.length;i++){if(ses.ans[i]===undefined){ses.cur=i;break;}}
  }
  document.getElementById('exam-title').textContent=th.name;
  document.getElementById('exam-chip').textContent=qs.length+'문제';
  document.getElementById('q-ychip').style.display='';
  show('s-exam');renderQ();
}

function retryExam(){
  const k=ses.mode==='year'?'yr':'th';
  S[k][ses.key]={answers:{},memos:{}};sv();
  if(ses.mode==='year')startYear(ses.key);else startTheme(ses.key);
}

// ── 문제 렌더 ──
function renderQ(){
  const q=ses.qs[ses.cur],tot=ses.qs.length;
  const done=Object.keys(ses.ans).length;
  document.getElementById('q-ctr').textContent=(ses.cur+1)+'/'+tot;
  document.getElementById('q-pct').textContent=Math.round(done/tot*100)+'%';
  document.getElementById('p-fill').style.width=(done/tot*100)+'%';
  if(ses.mode==='year'){
    document.getElementById('q-num').textContent='문제 '+q.num;
  } else {
    document.getElementById('q-num').textContent='Q'+(ses.cur+1);
    document.getElementById('q-ychip').textContent=q.year+'년 '+q.num+'번';
  }
  document.getElementById('q-subj').textContent=q.subj;
  document.getElementById('q-text').textContent=q.text;
  const hasAns=q.answer!==null&&q.answer!==undefined;
  document.getElementById('q-noanswer').style.display=hasAns?'none':'';

  const el=document.getElementById('choices');el.innerHTML='';
  q.choices.forEach((c,i)=>{
    if(!c)return;
    const btn=document.createElement('button');
    btn.className='cb';
    btn.innerHTML='<span class="cl">'+LB[i]+'</span><span>'+c+'</span>';
    btn.onclick=()=>pick(i);
    el.appendChild(btn);
  });

  document.getElementById('ex-box').classList.remove('on');
  document.getElementById('ex-btn').style.display='none';
  document.getElementById('memo').value=ses.memos[ses.cur]||'';
  document.getElementById('memo-ok').style.opacity='0';
  document.getElementById('btn-prev').disabled=ses.cur===0;
  document.getElementById('btn-next').innerHTML=ses.cur===tot-1
    ?'채점하기 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>'
    :'다음 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>';

  if(ses.ans[ses.cur]!==undefined)restorePick(q);
}

function showAnsPop(ok){
  const pop=document.getElementById('anspop');
  const im=document.getElementById('popup-img');
  const ms=document.getElementById('popup-msg');
  pop.className='anspop '+(ok?'ok':'ng');
  im.src=ok?_HEHES:_RUREONG;
  ms.textContent=ok?'헤헷! 정답이에요~ ⭐':'으르렁~ 다시 도전! 🦁';
  requestAnimationFrame(()=>{
    pop.classList.add('show');
    setTimeout(()=>{pop.classList.remove('show');setTimeout(()=>{pop.className='anspop';},300);},1800);
  });
}

// ★ 변경 1: 답 재선택 가능 — 이미 답을 골랐어도 다시 선택할 수 있음
function pick(idx){
  // 기존: if(ses.ans[ses.cur]!==undefined)return;  ← 이 줄을 제거해서 재선택 허용
  ses.ans[ses.cur]=idx;persist();
  markChs(ses.qs[ses.cur],idx);updateProg();
  const _q=ses.qs[ses.cur];
  if(_q.answer!==null&&_q.answer!==undefined){
    const _cs=Array.isArray(_q.answer)?_q.answer:[_q.answer];
    showAnsPop(_cs.includes(idx));
  }
}

function markChs(q,chosen){
  const btns=document.querySelectorAll('.cb');
  // ★ 변경 1: disabled 제거 — 버튼을 잠그지 않음 (재선택 허용)
  // btns.forEach(b=>b.disabled=true);  ← 삭제
  btns.forEach(b=>{b.classList.remove('ok','ng','sel');});  // 기존 표시 초기화
  const hasAns=q.answer!==null&&q.answer!==undefined;
  if(hasAns){
    const cs=Array.isArray(q.answer)?q.answer:[q.answer];
    btns.forEach((b,i)=>{
      if(cs.includes(i))b.classList.add('ok');
      else if(i===chosen&&!cs.includes(i))b.classList.add('ng');
    });
  } else {
    btns[chosen]?.classList.add('sel');
  }
  document.getElementById('ex-btn').style.display='block';
}

function restorePick(q){markChs(q,ses.ans[ses.cur]);}

function updateProg(){
  const done=Object.keys(ses.ans).length,tot=ses.qs.length;
  document.getElementById('q-pct').textContent=Math.round(done/tot*100)+'%';
  document.getElementById('p-fill').style.width=(done/tot*100)+'%';
}

function prevQ(){if(ses.cur>0){ses.cur--;renderQ();}}
function nextQ(){if(ses.cur<ses.qs.length-1){ses.cur++;renderQ();}else showResult();}

function saveMemo(){
  ses.memos[ses.cur]=document.getElementById('memo').value;persist();
  const el=document.getElementById('memo-ok');el.style.opacity='1';setTimeout(()=>el.style.opacity='0',1500);
}
function confirmBack(){
  persist();
  if(Object.keys(ses.ans).length>0&&Object.keys(ses.ans).length<ses.qs.length){
    if(!confirm('진행 중입니다. 저장 후 홈으로 가시겠어요?'))return;
  }
  goHome();
}
function persist(){
  const k=ses.mode==='year'?'yr':'th';
  S[k][ses.key]={answers:{...ses.ans},memos:{...ses.memos}};sv();
}

// ── AI 해설 ──
async function askExplain(q_override,chosen_override,targetEl,btnEl){
  const q=q_override||ses.qs[ses.cur];
  const chosen=chosen_override!==undefined?chosen_override:ses.ans[ses.cur];
  const box=targetEl||document.getElementById('ex-box');
  const textEl=targetEl?targetEl.querySelector('.rvext||.extxt')||targetEl:document.getElementById('ex-text');

  if(!targetEl){box.classList.add('on');document.getElementById('ex-btn').style.display='none';}
  if(btnEl){btnEl.disabled=true;btnEl.textContent='로딩중...';}

  const hasAns=q.answer!==null&&q.answer!==undefined;
  const cs=hasAns?(Array.isArray(q.answer)?q.answer:[q.answer]):null;
  const clbl=cs?cs.map(a=>LB[a]).join(','):'정답 미제공';
  const slbl=chosen!==undefined?LB[chosen]:'미선택';
  const isOk=cs&&chosen!==undefined&&cs.includes(chosen);

  const prompt=`행정사 1차 시험 ${q.year||''}년 ${q.subj} 문제입니다.

[문제] ${q.text}

[선택지]
${q.choices.filter(c=>c).map((c,i)=>`${LB[i]} ${c}`).join('\n')}

[정답] ${clbl} / [수험생 선택] ${slbl}${hasAns?(isOk?' ✓ 정답':' ✗ 오답'):''}

아래 형식으로 간결하게 해설해주세요 (총 4~6문장):
1. 정답 근거: ${clbl}이 정답인 핵심 이유
2. 오답 분석: ${!isOk&&chosen!==undefined?slbl+'이 틀린 이유 또는':''} 주요 오답 선택지 오류
3. 핵심 정리: 관련 법령/이론 핵심 1~2줄`;

  if(!targetEl){
    textEl.innerHTML='<span class="spin"></span>AI가 해설을 작성 중입니다...';
  } else {
    box.innerHTML='<span class="spin"></span>로딩 중...';
    box.classList.add('on');
  }

  try{
    const r=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({model:MODEL,max_tokens:800,messages:[{role:'user',content:prompt}]})
    });
    const d=await r.json();
    const txt=d.content?.map(c=>c.text||'').join('')||'해설을 불러올 수 없습니다.';
    const formatted=txt.replace(/\n/g,'<br>');
    if(!targetEl){textEl.innerHTML=formatted;}
    else{box.innerHTML='<div class="rvext">'+formatted+'</div>';}
    if(btnEl)btnEl.style.display='none';
  }catch(e){
    const err='해설 로딩 실패. 네트워크를 확인해주세요.';
    if(!targetEl){textEl.innerHTML=err;}
    else{box.innerHTML=err;}
    if(btnEl){btnEl.disabled=false;btnEl.textContent='💡 다시 시도';}
  }
}

// ── 채점 결과 ──
function showResult(){
  persist();
  const qs=ses.qs,tot=qs.length;
  let ok=0,ng=0,sk=0;

  // ★ 변경 2: 과목별 집계
  const subjStats={};
  qs.forEach((q,i)=>{
    const c=ses.ans[i];
    const subj=q.subj||'기타';
    if(!subjStats[subj])subjStats[subj]={ok:0,ng:0,sk:0,total:0,hasAns:false};
    subjStats[subj].total++;
    if(q.answer!==null&&q.answer!==undefined)subjStats[subj].hasAns=true;

    if(c===undefined){sk++;subjStats[subj].sk++;return;}
    if(q.answer===null||q.answer===undefined)return;
    const cs=Array.isArray(q.answer)?q.answer:[q.answer];
    if(cs.includes(c)){ok++;subjStats[subj].ok++;}
    else{ng++;subjStats[subj].ng++;}
  });

  const answered=tot-sk;
  const hasAns=qs.some(q=>q.answer!==null&&q.answer!==undefined);
  const pct=hasAns&&answered>0?Math.round(ok/answered*100):null;

  document.getElementById('res-title').textContent=ses.mode==='year'
    ?ses.key+'년 제'+(RD[ses.key]||'')+' 결과'
    :Object.values(THEMES).flat().find(t=>t.id===ses.key)?.name+' 결과';
  document.getElementById('r-sb').textContent=hasAns
    ?`${tot}문제 · 정답 ${ok}개 · 오답 ${ng}개 · 미선택 ${sk}개`
    :`${tot}문제 · ${answered}개 선택 완료`;

  if(pct!==null){
    document.getElementById('r-pct').textContent=pct+'%';
    document.getElementById('r-sub').textContent='정답률';
    const cl=pct>=60?'#22d172':pct>=40?'#f5c842':'#ff5a5a';
    document.getElementById('r-fill').style.stroke=cl;
    setTimeout(()=>{document.getElementById('r-fill').style.strokeDashoffset=289*(1-pct/100);},100);
  } else {
    document.getElementById('r-pct').textContent=Math.round(answered/tot*100)+'%';
    document.getElementById('r-sub').textContent='완료율';
    setTimeout(()=>{document.getElementById('r-fill').style.strokeDashoffset=289*(1-answered/tot);},100);
  }
  document.getElementById('st-ok').textContent=hasAns?ok:'-';
  document.getElementById('st-ng').textContent=hasAns?ng:'-';
  document.getElementById('st-sk').textContent=sk;
  document.getElementById('st-tt').textContent=tot;

  // ★ 변경 2: 과목별 점수 블록 렌더
  const subjOrder=['민법','행정법','행정학개론'];
  const subjColors={'민법':'var(--bl)','행정법':'var(--yw)','행정학개론':'var(--gn)'};
  const subjEmoji={'민법':'⚖️','행정법':'📋','행정학개론':'🏛️'};

  let subjHtml='';
  subjOrder.forEach(subj=>{
    const st=subjStats[subj];
    if(!st||st.total===0)return;
    const answeredSubj=st.ok+st.ng;
    const pctSubj=st.hasAns&&answeredSubj>0?Math.round(st.ok/answeredSubj*100):null;
    const col=pctSubj===null?'var(--tx3)':pctSubj>=60?'var(--gn)':pctSubj>=40?'var(--yw)':'var(--rd)';
    const dotColor=subjColors[subj]||'var(--bl)';
    subjHtml+=`
      <div class="subj-card">
        <div class="subj-card-left">
          <div class="subj-dot" style="background:${dotColor}"></div>
          <div>
            <div class="subj-name">${subjEmoji[subj]||''} ${subj}</div>
            <div class="subj-detail">${st.total}문제 · 정답 ${st.ok} · 오답 ${st.ng} · 미선택 ${st.sk}</div>
          </div>
        </div>
        <div class="subj-score" style="color:${col}">
          ${pctSubj!==null?pctSubj+'%':'-'}
        </div>
      </div>`;
  });

  // 과목별 블록을 결과 화면의 dvd(구분선) 위에 삽입
  const dvd=document.querySelector('#s-result .dvd');
  if(dvd){
    // 기존에 삽입된 과목블록이 있으면 제거
    const old=document.getElementById('subj-breakdown');
    if(old)old.remove();
    const subjBlock=document.createElement('div');
    subjBlock.id='subj-breakdown';
    subjBlock.innerHTML=`<div class="shdr2" style="margin-bottom:8px"><h3>📊 과목별 점수</h3></div>${subjHtml}`;
    dvd.parentNode.insertBefore(subjBlock,dvd);
  }

  // 오답 가이드 (오답 + 미선택 + 메모)
  const items=[];
  qs.forEach((q,i)=>{
    const c=ses.ans[i],memo=ses.memos[i]||'';
    const hasA=q.answer!==null&&q.answer!==undefined;
    const cs=hasA?(Array.isArray(q.answer)?q.answer:[q.answer]):null;
    const isWrong=c!==undefined&&cs&&!cs.includes(c);
    const isSkip=c===undefined;
    if(isWrong||isSkip||memo)items.push({q,i,c,memo,isWrong,isSkip,cs,hasA});
  });

  document.getElementById('wc-lbl').textContent=items.length+'개';
  const rl=document.getElementById('rv-list');
  if(!items.length){
    rl.innerHTML='<div class="empty">🎉 오답이 없습니다!</div>';
  } else {
    rl.innerHTML=items.map(({q,i,c,memo,isWrong,isSkip,cs,hasA},ri)=>{
      const ql=ses.mode==='year'?'문제 '+q.num:`Q${i+1}(${q.year}년 ${q.num}번)`;
      const stat=isSkip
        ?'<span style="color:var(--tx3)">○ 미선택</span>'
        :isWrong
          ?`<span style="color:var(--rd)">✗ ${LB[c]} 선택 (정답: ${cs.map(a=>LB[a]).join(',')})</span>`
          :`<span style="color:var(--gn)">✓ ${LB[c]}</span>`;
      return `<div class="rvi">
        <div class="rvq"><b>${ql}</b> · <span style="color:var(--tx3)">${q.subj}</span><br>${q.text.length>80?q.text.slice(0,80)+'…':q.text}</div>
        <div class="rvchs">
          ${q.choices.map((ch,ci)=>{
            if(!ch)return'';
            const isCok=cs&&cs.includes(ci);
            const isCng=ci===c&&!isCok;
            return`<div class="rc ${isCok?'ok':isCng?'ng':''}"><span class="rclb">${LB[ci]}</span><span>${ch.length>50?ch.slice(0,50)+'…':ch}</span></div>`;
          }).join('')}
        </div>
        <div class="rvft">
          <span class="rvmt">${stat}${memo?' · 📝'+memo.slice(0,20):''}</span>
          ${(isWrong||isSkip)?`<button class="rveb" id="rvb${ri}" onclick="rvExplain(${i},${ri})">💡 해설</button>`:''}
        </div>
        <div class="rvexbox" id="rvex${ri}"></div>
      </div>`;
    }).join('');
  }
  show('s-result');
}

function rvExplain(qi,ri){
  const q=ses.qs[qi],c=ses.ans[qi];
  const box=document.getElementById('rvex'+ri);
  const btn=document.getElementById('rvb'+ri);
  askExplain(q,c,box,btn);
}

renderHome();
