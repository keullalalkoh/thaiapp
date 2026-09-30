import {useEffect,useMemo,useRef,useState} from 'react'
import type {ReactNode} from 'react'
import {Home,BookOpen,RotateCcw,BarChart3,Volume2,Star,Mic,Check,Search,Flame,ChevronRight,X} from 'lucide-react'
import {lessons,allWords,wordById,CONTENT_NOTE} from './data'
import type {Word} from './data'

/* ---------- state & storage ---------- */
type Card={due:number;iv:number;ease:number;reps:number;lapses:number}
type State={onboarded:boolean;rom:boolean;goal:number;speed:number;cards:Record<string,Card>;done:number[];favs:string[];days:Record<string,number>}
const KEY='thaisteps-v1',DAY=864e5
const init:State={onboarded:false,rom:true,goal:10,speed:0.8,cards:{},done:[],favs:[],days:{}}
const dayKey=(d=new Date())=>d.toLocaleDateString('en-CA')
const load=():State=>{try{return{...init,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return init}}
const streakOf=(days:Record<string,number>)=>{let n=0;const d=new Date();if(!days[dayKey(d)])d.setDate(d.getDate()-1);while(days[dayKey(d)]){n++;d.setDate(d.getDate()-1)}return n}
const sh=<T,>(a:T[])=>[...a].sort(()=>Math.random()-.5)
const dueIds=(s:State)=>Object.keys(s.cards).filter(id=>s.cards[id].due<=Date.now()).sort((a,b)=>s.cards[a].due-s.cards[b].due)
/* Spaced repetition: r 0=Again 1=Hard 2=Good 3=Easy */
function rate(c:Card,r:number):Card{const now=Date.now()
 if(r===0)return{...c,iv:0,due:now+6e5,lapses:c.lapses+1,ease:Math.max(1.3,c.ease-.2),reps:0}
 const base=c.iv||.5
 const iv=r===1?Math.max(1,base*1.2):r===2?(c.reps===0?1:base*c.ease):Math.max(3,base*c.ease*1.5)
 return{...c,iv,due:now+iv*DAY,reps:c.reps+1,ease:r===1?Math.max(1.3,c.ease-.15):r===3?c.ease+.1:c.ease}}
type Up=(f:(s:State)=>State)=>void

/* ---------- audio ---------- */
const supported=typeof window!=='undefined'&&'speechSynthesis' in window
const getVoice=()=>supported?speechSynthesis.getVoices().find(v=>v.lang.replace('_','-').toLowerCase().startsWith('th')):undefined
let RATE=.8
function useThai(){const [ok,setOk]=useState(!!getVoice())
 useEffect(()=>{if(!supported)return;const f=()=>setOk(!!getVoice());speechSynthesis.addEventListener('voiceschanged',f);f();return()=>speechSynthesis.removeEventListener('voiceschanged',f)},[]);return ok}
function Speak({text,label='Play audio'}:{text:string;label?:string}){
 const ok=useThai();const [on,setOn]=useState(false)
 if(!ok)return<button disabled className="btn btn-s text-stone-500" title="No Thai (th-TH) voice found on this device"><Volume2 size={20}/>Audio unavailable</button>
 const play=()=>{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text.replace(/\.\.\.|…/g,' '));u.lang='th-TH';u.voice=getVoice()||null;u.rate=RATE;u.onend=u.onerror=()=>setOn(false);setOn(true);speechSynthesis.speak(u)}
 return<button onClick={play} aria-label={label} className={`btn btn-s ${on?'bg-leaf-100':''}`}><Volume2 size={20}/>{on?'Playing…':label}</button>}

/* ---------- small UI pieces ---------- */
function Btn({children,onClick,kind='s',disabled,cls=''}:{children:ReactNode;onClick?:()=>void;kind?:'p'|'s';disabled?:boolean;cls?:string}){
 return<button disabled={disabled} onClick={onClick} className={`btn ${kind==='p'?'btn-p':'btn-s'} ${cls}`}>{children}</button>}
const Bar=({v,max}:{v:number;max:number})=><div className="h-2.5 rounded-full bg-stone-200" role="progressbar" aria-valuenow={v} aria-valuemax={max}><div className="h-full rounded-full bg-leaf-500 transition-all" style={{width:`${max?Math.min(100,v/max*100):0}%`}}/></div>
function WordCard({w,rom,fav,onFav}:{w:Word;rom:boolean;fav:boolean;onFav:()=>void}){
 const [t,r,e]=(w.ex||'~~').split('~')
 return<div className="card text-center relative">
  <button aria-label={fav?'Remove from saved':'Save word'} onClick={onFav} className="absolute right-3 top-3 p-2 rounded-full hover:bg-leaf-50"><Star size={20} className={fav?'fill-amber-400 text-amber-500':'text-stone-400'}/></button>
  <div lang="th" className="text-5xl font-medium mt-4 leading-relaxed">{w.th}</div>
  {rom&&<div className="text-lg text-leaf-700 mt-1">{w.rom}</div>}
  <div className="text-xl mt-2">{w.en}</div>
  {w.ex&&<div className="mt-3 text-sm text-stone-600 border-t border-stone-200 pt-3"><span lang="th">{t}</span>{rom&&<> ({r})</>} — {e}</div>}
  <div className="mt-4 flex justify-center"><Speak text={w.th}/></div></div>}

/* ---------- lesson exercises ---------- */
type Step={k:'mc'|'listen'|'fill'|'match'|'speak';w?:Word;ws?:Word[];opts?:string[];ans?:string}
function build(ws:Word[]):Step[]{
 const other=(w:Word)=>sh(allWords.filter(x=>x.id!==w.id&&x.en!==w.en&&x.th!==w.th)).slice(0,3)
 const s:Step[]=[]
 sh(ws).slice(0,3).forEach(w=>s.push({k:'mc',w,ans:w.en,opts:sh([w.en,...other(w).map(x=>x.en)])}))
 sh(ws).slice(0,2).forEach(w=>s.push({k:'listen',w,ans:w.th,opts:sh([w.th,...other(w).map(x=>x.th)])}))
 s.push({k:'match',ws:sh(ws).slice(0,4)})
 const f=sh(ws.filter(w=>/(ค่ะ|คะ)$/.test(w.th)))[0]
 if(f)s.push({k:'fill',w:f,ans:f.th.endsWith('ค่ะ')?'ค่ะ':'คะ',opts:['ค่ะ','คะ','ครับ']})
 sh(ws).slice(0,2).forEach(w=>s.push({k:'speak',w}))
 return s}
const Feedback=({ok,text}:{ok:boolean;text:string})=><p role="status" className={`mt-4 rounded-xl p-3 ${ok?'bg-leaf-100 text-leaf-700':'bg-red-50 text-red-800'}`}>{ok?'Correct! ':'Not quite. '}{text}</p>
function Choice({step,rom,onNext}:{step:Step;rom:boolean;onNext:(m:string[])=>void}){
 const [sel,setSel]=useState<string|null>(null);const [bad,setBad]=useState(false)
 const w=step.w!;const ok=sel===step.ans
 const why=step.k==='fill'?'Statements end with ค่ะ (khâ, falling tone). Questions end with คะ (khá, high tone). ครับ is what men say.':step.k==='listen'?`You heard ${w.rom}, which means "${w.en}".`:`${w.th} (${w.rom}) means "${w.en}".`
 const blank=w.th.replace(/(ค่ะ|คะ)$/,'____')
 return<div className="card">
  {step.k==='mc'&&<><p className="text-stone-600">What does this mean?</p><div lang="th" className="text-4xl my-3">{w.th}</div>{rom&&<p className="text-leaf-700">{w.rom}</p>}<div className="mt-2"><Speak text={w.th}/></div></>}
  {step.k==='listen'&&<><p className="text-stone-600 mb-3">Play the audio and choose what you heard.</p><Speak text={w.th}/></>}
  {step.k==='fill'&&<><p className="text-stone-600">Choose the ending that fits: "{w.en}"</p><div lang="th" className="text-4xl my-3">{blank}</div></>}
  <div className="grid gap-2 mt-5">{step.opts!.map(o=>{const st=sel===o?(o===step.ans?'border-leaf-600 bg-leaf-100':'border-red-400 bg-red-50'):'';return<button key={o} disabled={sel!==null} lang={step.k!=='mc'?'th':undefined} onClick={()=>setSel(o)} className={`btn btn-s justify-start text-left ${step.k!=='mc'?'text-2xl':''} ${st}`}>{o}</button>})}</div>
  {sel&&<Feedback ok={ok} text={ok?'':why}/>}
  {sel&&(ok?<Btn kind="p" cls="mt-4 w-full" onClick={()=>onNext(bad?[w.id]:[])}>Continue</Btn>:<Btn cls="mt-4 w-full" onClick={()=>{setSel(null);setBad(true)}}>Try again</Btn>)}</div>}
function Match({ws,rom,onNext}:{ws:Word[];rom:boolean;onNext:(m:string[])=>void}){
 const left=useMemo(()=>sh(ws),[ws]),right=useMemo(()=>sh(ws),[ws])
 const [a,setA]=useState<string|null>(null);const [done,setDone]=useState<string[]>([]);const [miss,setMiss]=useState<string[]>([]);const [msg,setMsg]=useState('')
 const pick=(id:string)=>{if(!a)return;if(a===id){setDone([...done,id]);setMsg('')}else{setMiss([...miss,a]);setMsg('Not a match. Listen to the word and try again.')};setA(null)}
 return<div className="card"><p className="text-stone-600 mb-4">Tap a Thai word, then its meaning.</p>
  <div className="grid grid-cols-2 gap-3"><div className="grid gap-2">{left.map(w=><button key={w.id} disabled={done.includes(w.id)} onClick={()=>setA(w.id)} lang="th" className={`btn btn-s flex-col ${a===w.id?'border-leaf-600 bg-leaf-100':''} ${done.includes(w.id)?'bg-leaf-100':''}`}><span className="text-xl">{w.th}</span>{rom&&<span className="text-xs text-leaf-700">{w.rom}</span>}</button>)}</div>
  <div className="grid gap-2">{right.map(w=><button key={w.id} disabled={done.includes(w.id)||!a} onClick={()=>pick(w.id)} className={`btn btn-s text-sm ${done.includes(w.id)?'bg-leaf-100':''}`}>{w.en}</button>)}</div></div>
  {msg&&<Feedback ok={false} text={msg}/>}
  {done.length===ws.length&&<Btn kind="p" cls="mt-4 w-full" onClick={()=>onNext(miss)}>Continue</Btn>}</div>}
function SpeakStep({w,rom,onNext}:{w:Word;rom:boolean;onNext:(m:string[])=>void}){
 const SR=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition
 const [fb,setFb]=useState('');const [rec,setRec]=useState(false)
 const go=()=>{const r=new SR();r.lang='th-TH';r.onresult=(e:any)=>{const t:string=e.results[0][0].transcript;const strip=(x:string)=>x.replace(/[\s.…ๆ]|ค่ะ|คะ/g,'');setFb(strip(t).includes(strip(w.th))||strip(w.th).includes(strip(t))&&strip(t).length>0?`I heard "${t}". That matches the words. I can't judge your tones, so compare with the audio.`:`I heard "${t}". Listen again and try once more. I can't judge tones, only the words.`)};r.onerror=()=>setFb('Could not hear you. Check microphone permission and try again.');r.onend=()=>setRec(false);setRec(true);r.start()}
 return<div className="card text-center"><p className="text-stone-600">Listen, then say it out loud.</p><div lang="th" className="text-4xl my-3">{w.th}</div>{rom&&<p className="text-leaf-700">{w.rom}</p>}<p className="mb-4">{w.en}</p>
  <div className="flex flex-wrap gap-2 justify-center"><Speak text={w.th}/>{SR?<Btn onClick={go} disabled={rec}><Mic size={20}/>{rec?'Listening…':'Record me'}</Btn>:<span className="text-sm text-stone-500 self-center">Speech recognition isn't available in this browser. Just repeat it aloud.</span>}</div>
  {fb&&<p role="status" className="mt-4 rounded-xl bg-leaf-50 p-3 text-sm">{fb}</p>}
  <Btn kind="p" cls="mt-4 w-full" onClick={()=>onNext([])}>I practised it</Btn></div>}

function LessonView({idx,s,up,onExit}:{idx:number;s:State;up:Up;onExit:()=>void}){
 const l=lessons[idx];const [ph,setPh]=useState<'learn'|'quiz'|'done'>('learn');const [i,setI]=useState(0);const [q,setQ]=useState(0)
 const steps=useMemo(()=>build(l.words),[l]);const missed=useRef(new Set<string>())
 const fav=(id:string)=>up(x=>({...x,favs:x.favs.includes(id)?x.favs.filter(f=>f!==id):[...x.favs,id]}))
 const next=(m:string[])=>{m.forEach(id=>missed.current.add(id));if(q+1<steps.length)return setQ(q+1);finish()}
 const finish=()=>{const now=Date.now();up(x=>{const cards={...x.cards};l.words.forEach(w=>{if(!cards[w.id])cards[w.id]=missed.current.has(w.id)?{due:now,iv:0,ease:2.5,reps:0,lapses:1}:{due:now+DAY,iv:1,ease:2.5,reps:0,lapses:0}});const k=dayKey();return{...x,cards,done:x.done.includes(idx)?x.done:[...x.done,idx],days:{...x.days,[k]:(x.days[k]||0)+l.words.length}}});setPh('done')}
 const st=steps[q]
 return<div className="space-y-4">
  <div className="flex items-center justify-between"><h1 className="text-xl font-semibold">{l.title}</h1><button aria-label="Close lesson" onClick={onExit} className="p-2 rounded-full hover:bg-stone-200"><X/></button></div>
  {ph==='learn'&&<>{i===0&&<p className="card bg-leaf-50 border-leaf-100 text-sm">{l.intro}</p>}<Bar v={i+1} max={l.words.length}/>
   <WordCard w={l.words[i]} rom={s.rom} fav={s.favs.includes(l.words[i].id)} onFav={()=>fav(l.words[i].id)}/>
   <div className="flex gap-3"><Btn disabled={i===0} onClick={()=>setI(i-1)}>Back</Btn><Btn kind="p" cls="flex-1" onClick={()=>i+1<l.words.length?setI(i+1):setPh('quiz')}>{i+1<l.words.length?'Next word':'Start practice'}</Btn></div></>}
  {ph==='quiz'&&<><Bar v={q} max={steps.length}/>
   {(st.k==='mc'||st.k==='listen'||st.k==='fill')&&<Choice key={q} step={st} rom={s.rom} onNext={next}/>}
   {st.k==='match'&&<Match key={q} ws={st.ws!} rom={s.rom} onNext={next}/>}
   {st.k==='speak'&&<SpeakStep key={q} w={st.w!} rom={s.rom} onNext={next}/>}</>}
  {ph==='done'&&<div className="card text-center space-y-3"><div className="mx-auto w-14 h-14 rounded-full bg-leaf-100 grid place-items-center"><Check className="text-leaf-700" size={30}/></div><h2 className="text-2xl font-semibold">Lesson complete</h2>
   <p>{l.words.length} words added to your review.{missed.current.size>0&&` ${missed.current.size} tricky ones will come back sooner.`}</p>
   <Btn kind="p" cls="w-full" onClick={onExit}>Done</Btn></div>}</div>}

/* ---------- review ---------- */
function Review({s,up,onExit}:{s:State;up:Up;onExit:()=>void}){
 const [queue,setQueue]=useState(()=>dueIds(s));const [show,setShow]=useState(false);const [n,setN]=useState(0)
 const id=queue[0];const w=id?wordById(id):undefined
 const answer=(r:number)=>{const c=rate(s.cards[id],r);up(x=>({...x,cards:{...x.cards,[id]:c},days:{...x.days,[dayKey()]:(x.days[dayKey()]||0)+1}}));setQueue(r===0?[...queue.slice(1),id]:queue.slice(1));setShow(false);setN(n+1)}
 if(!w)return<div className="card text-center space-y-3"><Check className="mx-auto text-leaf-600" size={36}/><h2 className="text-xl font-semibold">{n?'Review finished':'Nothing due right now'}</h2><p className="text-stone-600">{n?`You reviewed ${n} cards.`:Object.keys(s.cards).length?'Come back later, your next words are scheduled.':'Complete a lesson first and your words will appear here.'}</p><Btn kind="p" onClick={onExit}>Back</Btn></div>
 return<div className="space-y-4"><div className="flex justify-between text-sm text-stone-600"><span>{queue.length} left</span><button onClick={onExit} className="underline">End session</button></div>
  <div className="card text-center"><div lang="th" className="text-5xl my-4 leading-relaxed">{w.th}</div>{s.rom&&show&&<p className="text-lg text-leaf-700">{w.rom}</p>}<div className="my-3"><Speak text={w.th}/></div>
   {show?<p className="text-xl">{w.en}</p>:<Btn kind="p" cls="w-full" onClick={()=>setShow(true)}>Show meaning</Btn>}</div>
  {show&&<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{['Again','Hard','Good','Easy'].map((t,r)=><Btn key={t} kind={r===2?'p':'s'} onClick={()=>answer(r)}>{t}</Btn>)}</div>}</div>}

/* ---------- tabs ---------- */
function HomeTab({s,go,open,review}:{s:State;go:(t:string)=>void;open:(i:number)=>void;review:()=>void}){
 const today=s.days[dayKey()]||0,due=dueIds(s).length,next=lessons.findIndex((_,i)=>!s.done.includes(i)),tl=next<0?0:next
 const hr=new Date().getHours(),g=hr<12?'Good morning':hr<18?'Good afternoon':'Good evening'
 const week=[...Array(7)].map((_,k)=>{const d=new Date();d.setDate(d.getDate()-(6-k));return{l:d.toLocaleDateString('en',{weekday:'narrow'}),n:s.days[dayKey(d)]||0}})
 const mx=Math.max(1,...week.map(x=>x.n))
 return<div className="space-y-5"><div><h1 className="text-2xl font-semibold">{g}! สวัสดีค่ะ</h1><p className="text-stone-600">Five minutes a day is enough.</p></div>
  <div className="card space-y-3"><div className="flex gap-6"><div><div className="flex items-center gap-1 text-2xl font-semibold"><Flame className="text-orange-500" size={22}/>{streakOf(s.days)}</div><div className="text-sm text-stone-600">day streak</div></div><div><div className="text-2xl font-semibold">{Object.keys(s.cards).length}</div><div className="text-sm text-stone-600">words learned</div></div></div>
   <div><div className="text-sm mb-1">Today: {Math.min(today,s.goal)} / {s.goal}</div><Bar v={today} max={s.goal}/></div>
   <Btn kind="p" cls="w-full text-lg" onClick={()=>next<0?(due?review():go('learn')):open(next)}>Continue learning</Btn></div>
  <div className="card"><div className="text-sm text-stone-600">Today's lesson</div><button onClick={()=>open(tl)} className="mt-1 w-full flex items-center justify-between text-left"><span className="text-lg font-medium">{lessons[tl].title}</span><ChevronRight/></button></div>
  <div className="card flex items-center justify-between gap-3"><div><div className="text-lg font-medium">{due} {due===1?'word':'words'} due</div><div className="text-sm text-stone-600">{due?'A quick review keeps them fresh.':'You are all caught up.'}</div></div><Btn kind={due?'p':'s'} disabled={!due} onClick={review}>Review due words</Btn></div>
  <div className="card"><div className="text-sm text-stone-600 mb-2">Last 7 days</div><div className="flex items-end gap-2 h-16">{week.map((d,k)=><div key={k} className="flex-1 text-center text-xs text-stone-500"><div className="bg-leaf-500 rounded mx-auto w-full" style={{height:`${d.n?8+d.n/mx*40:3}px`,opacity:d.n?1:.25}}/>{d.l}</div>)}</div></div></div>}

function LearnTab({s,up,open}:{s:State;up:Up;open:(i:number)=>void}){
 const [q,setQ]=useState('');const [saved,setSaved]=useState(false)
 const res=allWords.filter(w=>(!saved||s.favs.includes(w.id))&&(q===''||[w.th,w.rom,w.en].some(x=>x.toLowerCase().includes(q.toLowerCase()))))
 const fav=(id:string)=>up(x=>({...x,favs:x.favs.includes(id)?x.favs.filter(f=>f!==id):[...x.favs,id]}))
 const lib=q!==''||saved
 return<div className="space-y-4"><h1 className="text-2xl font-semibold">Learn</h1>
  <div className="flex gap-2"><div className="relative flex-1"><Search className="absolute left-3 top-3.5 text-stone-400" size={20}/><input value={q} onChange={e=>setQ(e.target.value)} aria-label="Search vocabulary" placeholder="Search Thai, romanisation or English" className="w-full rounded-xl border border-stone-300 bg-white pl-10 pr-3 py-3 focus:outline-leaf-600"/></div><Btn kind={saved?'p':'s'} onClick={()=>setSaved(!saved)}><Star size={18}/>Saved</Btn></div>
  {lib?<div className="space-y-2">{res.length===0&&<p className="card text-center text-stone-600">{saved&&!q?'No saved words yet. Tap the star on any word card.':'No words match your search.'}</p>}
   {res.map(w=><div key={w.id} className="card !p-4 flex items-center gap-3"><div className="flex-1"><div lang="th" className="text-2xl">{w.th}</div>{s.rom&&<div className="text-sm text-leaf-700">{w.rom}</div>}<div>{w.en}</div></div><Speak text={w.th} label="Play"/><button aria-label="Save word" onClick={()=>fav(w.id)} className="p-2"><Star className={s.favs.includes(w.id)?'fill-amber-400 text-amber-500':'text-stone-400'}/></button></div>)}</div>
  :<><div className="space-y-2">{lessons.map((l,i)=>{const d=s.done.includes(i);return<button key={i} onClick={()=>open(i)} className="card !p-4 w-full flex items-center gap-3 text-left hover:bg-leaf-50"><span className={`w-9 h-9 rounded-full grid place-items-center shrink-0 ${d?'bg-leaf-600 text-white':'bg-stone-100'}`}>{d?<Check size={18}/>:i+1}</span><span className="flex-1"><span className="font-medium block">{l.title}</span><span className="text-sm text-stone-600">{l.words.length} words</span></span><ChevronRight className="text-stone-400"/></button>})}</div>
   <p className="text-xs text-stone-500">⚠ {CONTENT_NOTE}</p></>}</div>}

function ProgressTab({s,up}:{s:State;up:Up}){
 const [sure,setSure]=useState(false)
 const stat=(v:string|number,l:string)=><div className="card !p-4"><div className="text-2xl font-semibold">{v}</div><div className="text-sm text-stone-600">{l}</div></div>
 const pick=<T extends number>(label:string,val:T,opts:T[],fn:(v:T)=>void,fmt:(v:T)=>string)=><div><div className="mb-1 text-sm">{label}</div><div className="flex gap-2">{opts.map(o=><Btn key={o} kind={o===val?'p':'s'} onClick={()=>fn(o)}>{fmt(o)}</Btn>)}</div></div>
 return<div className="space-y-5"><h1 className="text-2xl font-semibold">Progress</h1>
  <div className="grid grid-cols-2 gap-3">{stat(`${Object.keys(s.cards).length} / ${allWords.length}`,'words learned')}{stat(`${s.done.length} / ${lessons.length}`,'lessons completed')}{stat(streakOf(s.days),'day streak')}{stat(dueIds(s).length,'due for review')}</div>
  <div className="card space-y-3"><h2 className="font-medium">Topic completion</h2>{lessons.map((l,i)=>{const n=l.words.filter(w=>s.cards[w.id]).length;return<div key={i}><div className="flex justify-between text-sm"><span>{l.title}</span><span>{n}/{l.words.length}</span></div><Bar v={n} max={l.words.length}/></div>})}</div>
  <div className="card space-y-4"><h2 className="font-medium">Settings</h2>
   {pick('Daily goal (items)',s.goal,[5,10,20],v=>up(x=>({...x,goal:v})),v=>String(v))}
   {pick('Audio speed',s.speed,[.6,.8,1],v=>up(x=>({...x,speed:v})),v=>v===1?'Normal':v===.8?'Slow':'Very slow')}
   <label className="flex items-center gap-3"><input type="checkbox" className="w-5 h-5 accent-green-700" checked={s.rom} onChange={e=>up(x=>({...x,rom:e.target.checked}))}/>Show romanisation</label>
   <Btn onClick={()=>up(x=>({...x,onboarded:false}))}>Show intro again</Btn>
   {sure?<div className="rounded-xl bg-red-50 p-3 space-y-2"><p className="text-red-800">This deletes all progress, words and settings. This can't be undone.</p><div className="flex gap-2"><Btn onClick={()=>up(()=>({...init,onboarded:true}))} cls="!bg-red-700 !text-white">Yes, reset everything</Btn><Btn onClick={()=>setSure(false)}>Cancel</Btn></div></div>:<Btn onClick={()=>setSure(true)}>Reset progress</Btn>}</div></div>}

function Intro({onClose}:{onClose:()=>void}){return<div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4"><div role="dialog" aria-modal="true" className="card max-w-md w-full space-y-3"><h2 className="text-xl font-semibold">Welcome to ThaiSteps</h2>
 <ul className="list-disc pl-5 space-y-1"><li><b>Learn:</b> short lessons of 6–10 words, then quick practice.</li><li><b>Review:</b> words you learned come back at the right time. Rate each one Again, Hard, Good or Easy.</li><li>Tap the speaker to hear Thai as often as you like. Turn romanisation off in Progress when you're ready to read Thai.</li><li>Your progress stays on this device.</li></ul>
 <div className="flex gap-2"><Btn kind="p" cls="flex-1" onClick={onClose}>Start</Btn><Btn onClick={onClose}>Skip</Btn></div></div></div>}

export default function App(){
 const [s,setS]=useState<State>(load);const [tab,setTab]=useState('home');const [lesson,setLesson]=useState<number|null>(null);const [rev,setRev]=useState(false);const [err,setErr]=useState(false)
 const ok=useThai()
 useEffect(()=>{RATE=s.speed;try{localStorage.setItem(KEY,JSON.stringify(s));setErr(false)}catch{setErr(true)}},[s])
 const up:Up=f=>setS(f)
 const nav=[['home','Home',Home],['learn','Learn',BookOpen],['review','Review',RotateCcw],['progress','Progress',BarChart3]] as const
 const goTab=(t:string)=>{setTab(t);setLesson(null);setRev(false)}
 const due=dueIds(s).length
 return<div className="min-h-screen bg-cream text-ink">
  {!s.onboarded&&<Intro onClose={()=>up(x=>({...x,onboarded:true}))}/>}
  <nav aria-label="Main" className="fixed z-40 bottom-0 inset-x-0 bg-white border-t border-stone-200 flex md:top-0 md:bottom-0 md:right-auto md:w-48 md:flex-col md:border-t-0 md:border-r md:p-3 md:gap-1">
   <div className="hidden md:block px-3 py-4 text-xl font-semibold text-leaf-700">ThaiSteps</div>
   {nav.map(([id,l,Ic])=><button key={id} onClick={()=>goTab(id)} aria-current={tab===id?'page':undefined} className={`flex-1 md:flex-none flex flex-col md:flex-row items-center gap-1 md:gap-3 py-2 md:px-3 md:py-3 md:rounded-xl text-sm md:text-base ${tab===id?'text-leaf-700 font-semibold md:bg-leaf-50':'text-stone-600'}`}><Ic size={22}/>{l}{id==='review'&&due>0&&<span className="text-xs bg-leaf-600 text-white rounded-full px-1.5">{due}</span>}</button>)}</nav>
  <main className="max-w-2xl mx-auto px-4 pt-6 pb-28 md:ml-48 md:pb-10 space-y-4">
   {!ok&&<p className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm">No Thai voice was found in this browser, so audio buttons are disabled. Install a Thai voice in your device's speech settings (Chrome, Edge or Safari work best), then reload.</p>}
   {err&&<p className="rounded-xl bg-red-50 p-3 text-sm">Couldn't save progress (browser storage is blocked or full).</p>}
   {lesson!==null?<LessonView key={lesson} idx={lesson} s={s} up={up} onExit={()=>setLesson(null)}/>
   :tab==='review'||rev?<Review s={s} up={up} onExit={()=>goTab('home')}/>
   :tab==='home'?<HomeTab s={s} go={goTab} open={setLesson} review={()=>{setTab('review');setRev(true)}}/>
   :tab==='learn'?<LearnTab s={s} up={up} open={setLesson}/>
   :<ProgressTab s={s} up={up}/>}
  </main></div>}
