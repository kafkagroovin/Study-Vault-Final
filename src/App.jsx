import { useState, useEffect, useRef } from "react";

/* ═══ GEMINI AI (FREE) ═══════════════════════════════════════════════════════
   Get free key: https://aistudio.google.com/app/apikey  (no credit card!)
   ══════════════════════════════════════════════════════════════════════════ */
async function ai(prompt, key) {
  if (!key || key === "") return "⚠️ Add your free Gemini API key in Settings to enable AI!";
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.8, maxOutputTokens: 1000 },
        }),
      }
    );
    const d = await res.json();
    if (d.error) {
      console.error("AI error:", d.error);
      return "AI error: " + d.error.message;
    }
    if (!d.candidates || d.candidates.length === 0) {
      return "No response from AI. Check your API key.";
    }
    return d.candidates[0]?.content?.parts[0]?.text || "No response.";
  } catch (error) {
    console.error("Network error:", error);
    return "Network error. Check your connection and API key.";
  }
}

async function aiChat(history, key) {
  if (!key || key === "") return "⚠️ Add your free Gemini API key in Settings to chat!";
  try {
    // Format messages for Gemini
    const contents = [];
    
    // Add system instruction as first user message for context
    contents.push({
      role: "user",
      parts: [{ text: "You are StudyBot, a friendly AI tutor. Be concise, encouraging, helpful with any academic topic. Respond naturally without asterisks or markdown." }]
    });
    
    // Add the conversation history
    history.forEach(m => {
      contents.push({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      });
    });

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          generationConfig: { 
            temperature: 0.8, 
            maxOutputTokens: 1000,
            topK: 40,
            topP: 0.95
          },
        }),
      }
    );
    const d = await res.json();
    if (d.error) {
      console.error("AI chat error:", d.error);
      return "AI error: " + d.error.message;
    }
    if (!d.candidates || d.candidates.length === 0) {
      return "No response from AI. Check your API key.";
    }
    return d.candidates[0]?.content?.parts[0]?.text || "No response.";
  } catch (error) {
    console.error("Network error in chat:", error);
    return "Network error. Check your connection and API key.";
  }
}

/* ═══ STORAGE ════════════════════════════════════════════════════════════════ */
const LS = {
  get: (k, d) => { 
    try { 
      const v = localStorage.getItem(k); 
      return v ? JSON.parse(v) : d; 
    } catch { 
      return d; 
    }
  },
  set: (k, v) => { 
    try { 
      localStorage.setItem(k, JSON.stringify(v)); 
    } catch {} 
  },
};

/* ═══ HELPERS ════════════════════════════════════════════════════════════════ */
const uid     = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const fmtDur  = s => { if(s<60)return s+"s"; const h=Math.floor(s/3600),m=Math.floor((s%3600)/60); return h>0?h+"h "+m+"m":m+"m"; };
const timeAgo = ts => { const d=Date.now()-ts; if(d<60000)return"just now"; if(d<3600000)return Math.floor(d/60000)+"m ago"; if(d<86400000)return Math.floor(d/3600000)+"h ago"; return Math.floor(d/86400000)+"d ago"; };
const isMo    = s => { const d=new Date(s),n=new Date(); return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear(); };
const strip   = h => { const d=document.createElement("div"); d.innerHTML=h; return d.textContent||""; };
const hueOf   = s => { let h=0; for(const c of(s||"x"))h=c.charCodeAt(0)+h*31; return["#7c3aed","#db2777","#059669","#d97706","#2563eb","#dc2626"][Math.abs(h)%6]; };

function confetti(){
  const cols=["#7c3aed","#f472b6","#34d399","#fbbf24","#60a5fa","#fb923c"];
  for(let i=0;i<55;i++)setTimeout(()=>{
    const e=document.createElement("div"),sz=6+Math.random()*8;
    e.style.cssText=`position:fixed;left:${Math.random()*100}%;top:-20px;width:${sz}px;height:${sz}px;background:${cols[Math.floor(Math.random()*cols.length)]};border-radius:${Math.random()>.5?"50%":"3px"};z-index:9999;pointer-events:none;animation:cfFall ${1.5+Math.random()*2}s linear forwards`;
    document.body.appendChild(e);setTimeout(()=>e.remove(),4000);
  },i*25);
}
function beep(){try{const c=new AudioContext(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.frequency.value=880;g.gain.setValueAtTime(0.3,c.currentTime);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+0.5);o.start();o.stop(c.currentTime+0.5);}catch{}}

/* ═══ THEMES ═════════════════════════════════════════════════════════════════ */
const THEMES=[
  {id:"violet",  name:"Neon Violet", desc:"Default purple",  acc:"#7c3aed",acc2:"#a78bfa",glow:"rgba(124,58,237,0.4)", bg:"#070912",bg2:"#0d1021"},
  {id:"rose",    name:"Rose Gold",   desc:"Pink luxury",     acc:"#e11d48",acc2:"#fb7185",glow:"rgba(225,29,72,0.4)",  bg:"#0f0608",bg2:"#180a0e"},
  {id:"ocean",   name:"Ocean Deep",  desc:"Cool blue",       acc:"#0284c7",acc2:"#38bdf8",glow:"rgba(2,132,199,0.4)", bg:"#040d14",bg2:"#07131e"},
  {id:"emerald", name:"Emerald",     desc:"Fresh green",     acc:"#059669",acc2:"#34d399",glow:"rgba(5,150,105,0.4)", bg:"#040f0b",bg2:"#071810"},
  {id:"sunset",  name:"Sunset",      desc:"Warm orange",     acc:"#ea580c",acc2:"#fb923c",glow:"rgba(234,88,12,0.4)", bg:"#100805",bg2:"#1a0d07"},
  {id:"midnight",name:"Midnight",    desc:"Dark minimal",    acc:"#6366f1",acc2:"#818cf8",glow:"rgba(99,102,241,0.4)",bg:"#05050f",bg2:"#0a0a1a"},
];

const G1="rgba(255,255,255,0.04)",G2="rgba(255,255,255,0.08)";
const B1="rgba(255,255,255,0.09)",B2="rgba(255,255,255,0.16)";
const GRN="#34d399",RED="#f472b6",YEL="#fbbf24";
const TX="#eef0ff",TX2="#8b93b8",TX3="#4a5175",NAV=68;

const BASE_CSS=`
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
@keyframes cfFall{to{transform:translateY(110vh) rotate(720deg);opacity:0}}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes popIn{from{opacity:0;transform:scale(0.85)}to{opacity:1;transform:scale(1)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
@keyframes orb1{0%{transform:translate(0,0)}100%{transform:translate(40px,25px)}}
@keyframes orb2{0%{transform:translate(0,0)}100%{transform:translate(-30px,-35px)}}
@keyframes bk3{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-8px)}}
@keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes bkIn{from{opacity:0}to{opacity:1}}
@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(10px) scale(0.9)}to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}}
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
body{font-family:'Plus Jakarta Sans',sans-serif;color:#eef0ff;overflow-x:hidden;-webkit-font-smoothing:antialiased}
::-webkit-scrollbar{width:3px}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.15);border-radius:4px}
input,textarea,select,button{font-family:'Plus Jakarta Sans',sans-serif}
[contenteditable]:focus{outline:none}
[contenteditable] h1{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;margin:8px 0}
[contenteditable] h2{font-family:'Syne',sans-serif;font-size:18px;font-weight:700;margin:6px 0}
[contenteditable] blockquote{border-left:3px solid #7c3aed;padding-left:14px;color:#8b93b8;font-style:italic;margin:10px 0}
[contenteditable] ul,[contenteditable] ol{padding-left:22px}
[contenteditable] li{margin-bottom:4px}
`;

/* ═══ TOAST ══════════════════════════════════════════════════════════════════ */
let _pt;
const toast = msg => _pt && _pt(msg);
function Toasts() {
  const [list,setList]=useState([]);
  _pt = msg => { const id=uid(); setList(l=>[...l,{id,msg}]); setTimeout(()=>setList(l=>l.filter(x=>x.id!==id)),3000); };
  return (
    <div style={{position:"fixed",bottom:NAV+14,left:"50%",transform:"translateX(-50%)",zIndex:9900,display:"flex",flexDirection:"column",gap:6,pointerEvents:"none"}}>
      {list.map(x=><div key={x.id} style={{background:"#1a1d35",border:"1px solid "+B2,borderRadius:50,padding:"10px 20px",fontSize:13,fontWeight:600,color:TX,whiteSpace:"nowrap",boxShadow:"0 8px 28px rgba(0,0,0,0.5)",animation:"toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards"}}>{x.msg}</div>)}
    </div>
  );
}

/* ═══ UI COMPONENTS ══════════════════════════════════════════════════════════ */
const Card=({children,style,onClick})=>(
  <div onClick={onClick} style={{background:G1,border:"1px solid "+B1,borderRadius:18,padding:18,...(onClick?{cursor:"pointer"}:{}), ...style}}>{children}</div>
);

function Btn({children,onClick,variant,size,disabled,style,t}){
  const v=variant||"primary";
  const sz=size==="sm"?{padding:"7px 14px",fontSize:12}:{padding:"12px 22px",fontSize:14};
  const acc=t?.acc||"#7c3aed", glow=t?.glow||"rgba(124,58,237,0.4)";
  const vr=v==="ghost"?{background:G2,color:TX,border:"1px solid "+B1}
          :v==="danger"?{background:"rgba(239,68,68,0.12)",color:"#ef4444",border:"1px solid rgba(239,68,68,0.35)"}
          :{background:`linear-gradient(135deg,${acc},${acc}99)`,color:"#fff",border:"none",boxShadow:`0 4px 18px ${glow}`};
  return <button onClick={disabled?undefined:onClick} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:7,borderRadius:50,fontWeight:700,cursor:disabled?"not-allowed":"pointer",transition:"all 0.2s",opacity:disabled?0.5:1,...sz,...vr,...style}}>{children}</button>;
}

function Field({label,t,...p}){
  const acc=t?.acc||"#7c3aed",glow=t?.glow||"rgba(124,58,237,0.4)";
  return (
    <div style={{marginBottom:14}}>
      {label&&<div style={{fontSize:11,fontWeight:700,color:TX2,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:6}}>{label}</div>}
      <input style={{width:"100%",background:G1,border:"1px solid "+B1,borderRadius:12,padding:"12px 16px",color:TX,fontSize:14,outline:"none",...p.style}}
        onFocus={e=>{e.target.style.borderColor=acc;e.target.style.boxShadow=`0 0 0 3px ${glow}`;}}
        onBlur={e=>{e.target.style.borderColor=B1;e.target.style.boxShadow="none";}}
        {...p}/>
    </div>
  );
}

const Spin=({t})=><div style={{width:18,height:18,border:"2px solid "+B2,borderTopColor:t?.acc2||"#a78bfa",borderRadius:"50%",animation:"spin 0.7s linear infinite",flexShrink:0}}/>;
const Empty=({em,title,sub})=>(
  <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"44px 20px",textAlign:"center",gap:10}}>
    <div style={{fontSize:46,animation:"pulse 2.5s infinite"}}>{em}</div>
    <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:700}}>{title}</div>
    <div style={{fontSize:13,color:TX2,maxWidth:200,lineHeight:1.65}}>{sub}</div>
  </div>
);

function Sheet({open,onClose,title,children,bg2}){
  if(!open)return null;
  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(8px)",zIndex:600,display:"flex",alignItems:"flex-end",justifyContent:"center",animation:"bkIn 0.25s ease"}}>
      <div style={{background:bg2||"#0d1021",border:"1px solid "+B2,borderRadius:"24px 24px 0 0",padding:"24px 20px 40px",width:"100%",maxWidth:500,animation:"slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)",maxHeight:"88vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800}}>{title}</div>
          <button onClick={onClose} style={{background:G2,border:"1px solid "+B1,color:TX2,borderRadius:"50%",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,cursor:"pointer"}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ═══ ONBOARDING ═════════════════════════════════════════════════════════════ */
function Onboard({onDone,t}){
  const [name,setName]=useState("");
  const [stype,setStype]=useState("University");
  const [avatar,setAvatar]=useState("🎓");
  const TYPES=[["🏫","High School"],["🎓","University"],["📖","Self-learning"],["💼","Professional"]];
  const AVS=["🎓","🧑‍💻","🦊","🐼","🌟","🚀","🧠","🎯","🦁","🐉","🌈","⚡"];
  const go=()=>{if(!name.trim()){toast("Enter your name 😊");return;}onDone({name:name.trim(),type:stype,avatar});confetti();};
  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 20px",position:"relative",overflow:"hidden",background:t.bg}}>
      <div style={{position:"absolute",top:"-25%",left:"-20%",width:500,height:500,borderRadius:"50%",background:`radial-gradient(circle,${t.acc}38 0%,transparent 70%)`,animation:"orb1 7s ease-in-out infinite alternate",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:"-20%",right:"-15%",width:420,height:420,borderRadius:"50%",background:`radial-gradient(circle,${t.acc2}22 0%,transparent 70%)`,animation:"orb2 5s ease-in-out infinite alternate",pointerEvents:"none"}}/>
      <div style={{position:"relative",zIndex:1,width:"100%",maxWidth:400,animation:"fadeUp 0.6s ease"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:52,fontWeight:800,lineHeight:1}}>Study<span style={{color:t.acc2,textShadow:`0 0 40px ${t.acc}`}}>Vault</span></div>
          <div style={{fontSize:14,color:TX2,marginTop:8}}>Your studies, supercharged ⚡</div>
        </div>
        <div style={{background:"rgba(255,255,255,0.05)",border:"1px solid "+B2,borderRadius:24,padding:28,backdropFilter:"blur(24px)"}}>
          <div style={{textAlign:"center",fontSize:52,marginBottom:6}}>{avatar}</div>
          <div style={{textAlign:"center",fontSize:13,color:TX2,marginBottom:16}}>Pick your avatar</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:10,justifyContent:"center",marginBottom:22}}>
            {AVS.map(a=>(
              <span key={a} onClick={()=>setAvatar(a)} style={{fontSize:28,cursor:"pointer",transition:"all 0.2s",display:"inline-block",opacity:avatar===a?1:0.35,transform:avatar===a?"scale(1.25)":"scale(1)",filter:avatar===a?`drop-shadow(0 0 8px ${t.acc})`:"none"}}>{a}</span>
            ))}
          </div>
          <Field label="Your name" placeholder="e.g. Alex" value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} t={t}/>
          <div style={{fontSize:11,fontWeight:700,color:TX2,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:10}}>I'm studying…</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:22}}>
            {TYPES.map(([em,lb])=>(
              <button key={lb} onClick={()=>setStype(lb)} style={{padding:"8px 14px",borderRadius:50,fontSize:12,fontWeight:600,border:`1px solid ${stype===lb?t.acc:B1}`,background:stype===lb?t.acc+"28":G1,color:stype===lb?t.acc2:TX2,cursor:"pointer",transition:"all 0.2s"}}>{em} {lb}</button>
            ))}
          </div>
          <Btn style={{width:"100%"}} onClick={go} t={t}>Let's Go 🚀</Btn>
        </div>
        <div style={{textAlign:"center",marginTop:16,fontSize:11,color:TX3}}>No account needed — data stays on your device 🔒</div>
      </div>
    </div>
  );
}

/* ═══ HOME ═══════════════════════════════════════════════════════════════════ */
function Home({user,sessions,transactions,notes,streak,budget,apiKey,t}){
  const [tip,setTip]=useState(""), [tipLoad,setTipLoad]=useState(false);
  const hr=new Date().getHours();
  const greet=hr<12?"Good morning ☀️":hr<17?"Good afternoon 🌤":hr<21?"Good evening 🌆":"Late night grind 🌙";
  const today=new Date().toDateString();
  const todaySecs=sessions.filter(s=>new Date(s.date).toDateString()===today).reduce((a,s)=>a+s.duration,0);
  const spent=transactions.filter(tx=>tx.type==="expense"&&isMo(tx.date)).reduce((a,tx)=>a+tx.amount,0);
  const bleft=budget.monthly>0?budget.monthly-spent:null;
  const bpct=budget.monthly>0?Math.min(100,(spent/budget.monthly)*100):0;
  const wk=[0,0,0,0,0,0,0];
  sessions.forEach(s=>{const d=new Date(s.date),now=new Date(),df=Math.floor((now-d)/86400000);if(df<7){let dw=d.getDay();dw=dw===0?6:dw-1;wk[dw]+=s.duration/3600;}});
  const maxW=Math.max(...wk,0.1);
  const recent=[...notes].sort((a,b)=>b.updated-a.updated).slice(0,3);
  const getTip=()=>{
    if (!apiKey) {
      toast("Add your Gemini API key in Settings first!");
      return;
    }
    setTipLoad(true);
    setTip("");
    ai("Give one surprising actionable study tip. 2 sentences max. No asterisks or markdown.", apiKey)
      .then(r => {
        setTip(r);
        setTipLoad(false);
      })
      .catch(err => {
        setTip("Error getting tip. Check your API key.");
        setTipLoad(false);
      });
  };
  return(
    <div style={{paddingBottom:16}}>
      <div style={{padding:"22px 18px 6px",display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:12,fontWeight:700,color:TX2,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{greet}</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:800}}>Hey, {user.name}! 👋</div>
        </div>
        <div style={{width:46,height:46,borderRadius:"50%",background:`linear-gradient(135deg,${t.acc},${t.acc}77)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,border:"2px solid "+B2,flexShrink:0}}>{user.avatar}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,padding:"14px 14px 0"}}>
        <Card style={{background:"rgba(251,191,36,0.08)",borderColor:"rgba(251,191,36,0.2)"}}>
          <div style={{fontSize:11,fontWeight:700,color:TX2,textTransform:"uppercase",letterSpacing:0.8,marginBottom:8}}>Streak 🔥</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:40,fontWeight:800,color:YEL,lineHeight:1}}>{streak.current}</div>
          <div style={{fontSize:12,color:TX2,marginTop:4}}>days in a row</div>
        </Card>
        <Card>
          <div style={{fontSize:11,fontWeight:700,color:TX2,textTransform:"uppercase",letterSpacing:0.8,marginBottom:8}}>Today ⏱</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:30,fontWeight:800,color:t.acc2,lineHeight:1}}>{fmtDur(todaySecs)}</div>
          <div style={{fontSize:12,color:TX2,marginTop:4}}>studied today</div>
        </Card>
        <Card style={{gridColumn:"1/-1"}}>
          <div style={{fontSize:11,fontWeight:700,color:TX2,textTransform:"uppercase",letterSpacing:0.8,marginBottom:10}}>Budget 💸</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:800,color:bleft===null?TX3:bleft>0?GRN:"#ef4444",marginBottom:10}}>
            {bleft===null?"Set a budget →":(`${budget.currency||"$"}${Math.max(0,bleft).toFixed(0)} left`)}
          </div>
          {budget.monthly>0&&<div style={{background:G2,borderRadius:50,height:5,overflow:"hidden"}}><div style={{height:"100%",borderRadius:50,width:bpct+"%",background:bpct>80?"linear-gradient(90deg,#f59e0b,#ef4444)":`linear-gradient(90deg,${GRN},${t.acc})`,transition:"width 1s"}}/></div>}
        </Card>
        <Card style={{gridColumn:"1/-1",background:t.acc+"10",borderColor:t.acc+"35"}}>
        
