import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLandingForServe } from "@/domains/landing/service";

/**
 * 광고 랜딩페이지 동적 서빙 + 리드 게이트웨이 주입
 *
 * 어드민에 등록된 HTML을 원본 그대로 text/html로 응답하되,
 * <head>에 "리드 게이트웨이" 스크립트를 주입한다. 이 스크립트는
 * 업로드된 HTML이 어떤 형태든 다음을 보장한다:
 *
 *  1) 유입 구분: /api/webhook/lead 로 가는 모든 요청에 landing_page_id=slug를
 *     서버 권위로 강제 주입 → consultations.source 가 항상 slug 로 기록됨
 *     (HTML이 보낸 값에 의존하지 않음 → "홈페이지로 잘못 분류" 방지)
 *  2) 표준 폼 연동: 우리 fetch 규약을 쓰지 않는 일반 <form> 제출도 가로채
 *     name/phone 휴리스틱으로 webhook에 JSON POST (외부 빌더 HTML 대응)
 *  3) 누락 방지: 전송 실패 시 localStorage 큐에 보존하고, 재접속/online 시
 *     자동 재전송 (모바일 약전계·탭 종료로 인한 유실 복구)
 *
 * 활성(is_active=true) slug만 서빙, 없으면 404.
 * CSP(script-src/style-src 'unsafe-inline')가 인라인 스크립트를 허용한다.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const supabase = await createClient();
  const landing = await getLandingForServe(supabase, slug);

  if (!landing) {
    return new Response("Not Found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const gateway = buildGatewayScript(slug);
  const html = landing.html_content.includes("</head>")
    ? landing.html_content.replace("</head>", `${gateway}</head>`)
    : `${gateway}${landing.html_content}`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}

/** 업로드 HTML에 주입되는 리드 게이트웨이(인라인 IIFE) */
function buildGatewayScript(slug: string): string {
  const SLUG = JSON.stringify(slug);
  // 주의: 이 문자열은 브라우저에서 실행되는 바닐라 JS다. 백틱/한글 따옴표 사용 금지.
  return `<script>(function(){
var SLUG=${SLUG},EP="/api/webhook/lead",QK="lead_queue_v1";
window.__LP_DATA__={clinicId:"studycore_1_0",landingPageId:SLUG};
function lq(){try{return JSON.parse(localStorage.getItem(QK)||"[]")}catch(e){return[]}}
function sq(q){try{localStorage.setItem(QK,JSON.stringify(q))}catch(e){}}
function enq(p){var q=lq();if(q.length>50)q.shift();q.push({k:Date.now()+"."+Math.random().toString(36).slice(2),p:p});sq(q)}
function deq(k){sq(lq().filter(function(x){return x.k!==k}))}
var _f=window.fetch?window.fetch.bind(window):null;
function isLead(u){return String(u).indexOf(EP)>=0}
if(_f){window.fetch=function(u,o){
  if(o&&o.body&&isLead(u)){
    var p=null;try{p=JSON.parse(o.body);p.landing_page_id=SLUG;o.body=JSON.stringify(p)}catch(e){}
    return _f(u,o).then(function(r){if(!r.ok&&r.status>=500&&p)enq(p);return r}).catch(function(e){if(p)enq(p);throw e});
  }
  return _f(u,o);
};}
function flush(){if(!_f)return;lq().forEach(function(it){_f(EP,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(it.p)}).then(function(r){if(r.ok)deq(it.k)}).catch(function(){})})}
document.addEventListener("submit",function(e){
  if(e.defaultPrevented)return;
  var f=e.target;if(!f||f.tagName!=="FORM")return;
  var fd;try{fd=new FormData(f)}catch(e2){return}
  function pk(){var a=[].slice.call(arguments),it;for(it of fd.entries()){var k=String(it[0]).toLowerCase();for(var i=0;i<a.length;i++){if(k.indexOf(a[i])>=0&&it[1])return it[1]}}return undefined}
  var nm=pk("name","이름"),ph=pk("phone","tel","연락");
  if(!nm||!ph)return;
  e.preventDefault();
  var p={name:nm,phoneNumber:ph,landing_page_id:SLUG,inflowUrl:location.href,custom_data:{school:pk("school","학교"),grade:pk("grade","학년"),marketing_consent:!!pk("marketing","마케팅")}};
  if(!_f){enq(p);alert("\\uc2e0\\uccad\\uc774 \\uc811\\uc218\\ub418\\uc5c8\\uc2b5\\ub2c8\\ub2e4.");return}
  window.fetch(EP,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(p)}).then(function(r){if(r.ok){try{f.style.display="none"}catch(e3){}alert("\\uc2e0\\uccad\\uc774 \\uc811\\uc218\\ub418\\uc5c8\\uc2b5\\ub2c8\\ub2e4.")}else{alert("\\uc7a0\\uc2dc \\ud6c4 \\ub2e4\\uc2dc \\uc2dc\\ub3c4\\ud574 \\uc8fc\\uc138\\uc694.")}}).catch(function(){alert("\\ub124\\ud2b8\\uc6cc\\ud06c \\uc624\\ub958 \\u2014 \\uc7a0\\uc2dc \\ud6c4 \\uc790\\ub3d9 \\uc7ac\\uc804\\uc1a1\\ub429\\ub2c8\\ub2e4.")})
},false);
window.addEventListener("online",flush);
if(document.readyState==="loading")window.addEventListener("DOMContentLoaded",flush);else flush();
})();</script>`;
}
