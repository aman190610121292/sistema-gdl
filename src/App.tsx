import { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from "recharts";

// ── FUENTES ───────────────────────────────────────────────────
const fl = document.createElement("link");
fl.rel = "stylesheet";
fl.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Syne:wght@700;800&family=DM+Mono:wght@400;500&display=swap";
document.head.appendChild(fl);

// ── COLORES ───────────────────────────────────────────────────
const C = {
  bg:"#f4f6f9", panel:"#ffffff", card:"#ffffff", border:"#e2e8f0",
  accent:"#d97706", green:"#16a34a", red:"#dc2626", blue:"#2563eb",
  orange:"#ea580c", purple:"#7c3aed", muted:"#94a3b8", text:"#1e293b", textSub:"#64748b",
  accentDim:"#b45309", shadow:"0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.04)"
};
const COLORS = ["#e8c547","#60a5fa","#4ade80","#f97316","#a78bfa","#f472b6"];
const fmt = (n) => "$" + Math.round(n).toLocaleString("es-AR");

// ── CONTRASEÑAS ───────────────────────────────────────────────
const PASS_ADMIN    = "parrillas2026";
const PASS_OPERADOR = "ope2026";
const PASS_LECTOR   = "user1";

// ── CLOUD SYNC (JSONBin) + localStorage ──────────────────────
const BIN_ID  = "69e5fa2636566621a8d110ba";
const API_KEY = "$2a$10$JSXY/5XpnNHMvGEKC6y91eBfTdHScfFpVAcU76FDjsjG8id.2Uu12";
const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// Datos en memoria (cache global)
let _cloud = null;
let _syncTimer = null;
let _syncStatus = "idle"; // idle | saving | error

// Listeners para notificar a la UI del estado de sync
const _syncListeners = new Set();
const notifySync = (s) => { _syncStatus=s; _syncListeners.forEach(fn=>fn(s)); };

async function cloudRead() {
  try {
    const r = await fetch(BIN_URL+"/latest",{headers:{"X-Master-Key":API_KEY}});
    if(!r.ok) throw new Error("read fail");
    const d = await r.json();
    return d.record||{};
  } catch {
    // Fallback a localStorage
    const keys=["parrillas-emps","parrillas-stock","parrillas-pedidos","parrillas-costos",
      "parrillas-externas","parrillas-precios-cliente","parrillas-proveedores",
      "parrillas-ventas","parrillas-ventas2","parrillas-cierres","parrillas-vendidos","parrillas-productos"];
    const rec={};
    keys.forEach(k=>{try{const v=localStorage.getItem(k);if(v)rec[k]=JSON.parse(v);}catch{}});
    return rec;
  }
}

async function cloudWrite(record) {
  try {
    notifySync("saving");
    await fetch(BIN_URL,{method:"PUT",
      headers:{"Content-Type":"application/json","X-Master-Key":API_KEY},
      body:JSON.stringify(record)});
    notifySync("idle");
  } catch {
    notifySync("error");
    // Guardar en localStorage como fallback
    Object.entries(record).forEach(([k,v])=>{
      try{localStorage.setItem(k,JSON.stringify(v));}catch{}
    });
  }
}

function scheduleSync() {
  if(_syncTimer) clearTimeout(_syncTimer);
  _syncTimer = setTimeout(()=>{ if(_cloud) cloudWrite(_cloud); },1500);
}

function load(key, def) {
  // Primero cloud, luego localStorage
  if(_cloud && _cloud[key]!==undefined) return _cloud[key];
  try { const v=localStorage.getItem(key); return v?JSON.parse(v):def; }
  catch { return def; }
}

function persist(key, val) {
  if(!_cloud) _cloud={};
  _cloud[key]=val;
  try{localStorage.setItem(key,JSON.stringify(val));}catch{}
  scheduleSync();
}

function useSaved(key, def) {
  const [v, setV] = useState(() => load(key, def));
  const set = useCallback((upd) => {
    setV(prev => {
      const next = typeof upd === "function" ? upd(prev) : upd;
      persist(key, next);
      return next;
    });
  }, [key]);
  return [v, set];
}

// Hook para estado de sincronización
function useSyncStatus() {
  const [status, setStatus] = useState(_syncStatus);
  useEffect(()=>{ _syncListeners.add(setStatus); return ()=>_syncListeners.delete(setStatus); },[]);
  return status;
}

// ── DATOS INICIALES ───────────────────────────────────────────
const EMPLEADOS_INIT = [
  {id:1,  nombre:"Sanz, Mariano",           cargo:"Gerente de Operaciones",                   tipo:"mensual", base:2500000, extras:0, dias:22},
  {id:2,  nombre:"Hodis, Amancay",           cargo:"Tesorera / Coord. General",                tipo:"mensual", base:2500000, extras:0, dias:22},
  {id:3,  nombre:"Guerrero, Karina",         cargo:"Enc. Locales — Lito's · Faro · Gauchito",  tipo:"mensual", base:1600000, extras:0, dias:22},
  {id:4,  nombre:"Fleitas, Leonardo",        cargo:"Enc. Locales — Homero · DJ · Amp + Cad.",  tipo:"semanal", base:475000,  extras:0, dias:5},
  {id:5,  nombre:"Mendez, Gabriel",          cargo:"Encargado de Reparto",                     tipo:"mensual", base:1800000, extras:0, dias:22},
  {id:6,  nombre:"Millan, Benito",           cargo:"Encargado Mariano Acosta",                 tipo:"semanal", base:450000,  extras:0, dias:5},
  {id:7,  nombre:"Ferreira Sosa, Valentina", cargo:"Administrativa / Data Entry",              tipo:"mensual", base:1200000, extras:0, dias:22},
  {id:8,  nombre:"Rodriguez, Regulo",        cargo:"Encargado Cruz",                           tipo:"semanal", base:350000,  extras:0, dias:5},
  {id:9,  nombre:"Gabi",                     cargo:"Empleado Mariano Acosta",                  tipo:"jornal",  base:50000,   extras:0, dias:5},
  {id:10, nombre:"Charly",                   cargo:"Empleado Mariano Acosta",                  tipo:"jornal",  base:50000,   extras:0, dias:5},
  {id:11, nombre:"Fernando",                 cargo:"Empleado Mariano Acosta",                  tipo:"jornal",  base:50000,   extras:0, dias:5},
  {id:12, nombre:"Naileth",                  cargo:"Corrección de Planillas",                  tipo:"mensual", base:500000,  extras:0, dias:22},
  {id:13, nombre:"Sol",                      cargo:"Tickeo y Facturación",                     tipo:"mensual", base:350000,  extras:0, dias:22},
  {id:14, nombre:"Valen Leo",                cargo:"Tickeo y Facturación",                     tipo:"mensual", base:400000,  extras:0, dias:22},
  {id:15, nombre:"Mendez, Enzo",             cargo:"Ayudante de Reparto",                      tipo:"jornal",  base:35000,   extras:0, dias:5},
];

let _id = 0;
const sk = (p,d,c,s,m=0,u="u") => ({id:++_id,producto:p,deposito:d,categoria:c,stock:s,minimo:m,unidad:u});
const STOCK_INIT = [
  sk("Cajas Hamburguesas",1,"Congelados",19,5),     sk("Pan Paty",1,"Congelados",816,100),
  sk("Salchichas U. Ganadera",1,"Congelados",336,50), sk("Salchichas Alemanas",1,"Congelados",20,10),
  sk("Pan de Panchos",1,"Congelados",324,50),        sk("Provoletas",1,"Congelados",12,5),
  sk("Cajas Papas",1,"Congelados",15,5),             sk("Veganas",1,"Congelados",120,20),
  sk("Nugget",1,"Congelados",1,5),                   sk("Chori",1,"Congelados",14,5),
  sk("Bondiola Pieza",1,"Congelados",0,1),            sk("Cajas de Bondiolas",1,"Congelados",10,3),
  sk("B1",1,"Congelados",876,100),                   sk("B3",1,"Congelados",11,5),
  sk("BL Pieza",1,"Congelados",0,1),                 sk("BL1",1,"Congelados",677,80),
  sk("BL2",1,"Congelados",176,30),                   sk("Bife de Chorizo Bolsa",1,"Congelados",0,1),
  sk("Bife de Chorizo Feteado",1,"Congelados",116,20), sk("Nalga Pieza",1,"Congelados",0,1),
  sk("N1",1,"Congelados",1208,100),                  sk("N2",1,"Congelados",170,30),
  sk("Jamón Pieza",1,"Congelados",0,1),              sk("Jamón Feteado ROCA",1,"Congelados",1600,200),
  sk("Jamón Feteado",1,"Congelados",1620,200),        sk("Queso Pieza",1,"Congelados",0,1),
  sk("Queso Feteado ROCA",1,"Congelados",1700,200),   sk("Queso Feteado",1,"Congelados",2620,200),
  sk("Papa Pay",1,"Aderezos",3,2),    sk("Aceite",1,"Aderezos",14,5),
  sk("Vinagre",1,"Aderezos",15,5),    sk("Huevos",1,"Aderezos",8,5),
  sk("Coca CH",2,"Gaseosas",323,50),  sk("Fanta CH",2,"Gaseosas",49,15),
  sk("Sprite CH",2,"Gaseosas",128,30),sk("Agua SG CH",2,"Gaseosas",75,20),
  sk("Agua CG CH",2,"Gaseosas",29,10),sk("AQ Pomelo CH",2,"Gaseosas",60,15),
  sk("AQ Manzana CH",2,"Gaseosas",57,15), sk("AQ Pera CH",2,"Gaseosas",64,15),
  sk("AQ Rosa CH",2,"Gaseosas",14,5),  sk("AQ Uva CH",2,"Gaseosas",35,10),
  sk("Coca Z CH",2,"Gaseosas",51,15),  sk("Sprite Z CH",2,"Gaseosas",46,10),
  sk("Coca GR",2,"Gaseosas",21,10),    sk("Fanta GR",2,"Gaseosas",23,8),
  sk("Sprite GR",2,"Gaseosas",22,8),   sk("AQ Uva GR",2,"Gaseosas",21,8),
  sk("AQ Naranja GR",2,"Gaseosas",13,5),sk("AQ Manzana GR",2,"Gaseosas",17,5),
  sk("AQ Pera GR",2,"Gaseosas",12,5),  sk("AQ Pomelo GR",2,"Gaseosas",14,5),
  sk("Coca Z GR",2,"Gaseosas",4,5),    sk("Sprite Z GR",2,"Gaseosas",9,5),
  sk("Tónica GR",2,"Gaseosas",5,5),    sk("Agua GR",2,"Gaseosas",19,8),
  sk("Power Uva",2,"Gaseosas",17,5),   sk("Power Manzana",2,"Gaseosas",13,5),
  sk("Power Azul",2,"Gaseosas",9,5),   sk("Power Roja",2,"Gaseosas",12,5),
  sk("Tónica CH",2,"Gaseosas",13,5),   sk("Monster ML",2,"Gaseosas",2,3),
  sk("Monster Blanca",2,"Gaseosas",6,3),sk("Monster Rossi",2,"Gaseosas",16,5),
  sk("Monster Negra",2,"Gaseosas",12,5),sk("Monster Roja",2,"Gaseosas",15,5),
  sk("Monster Punch",2,"Gaseosas",13,5),sk("Monster Ananá",2,"Gaseosas",13,5),
  sk("Monster Sunrise",2,"Gaseosas",15,5),sk("Coca Lata",2,"Gaseosas",0,1),
  sk("Mayonesa Sachet",2,"Aderezos",38,10), sk("Ketchup Pomo",2,"Aderezos",169,30),
  sk("Servilleta",2,"Papelería",63,15), sk("Separador",2,"Papelería",15,5),
  sk("Bandeja",2,"Papelería",40,10),    sk("Bandejas (100u)",2,"Papelería",0,1),
  sk("Vasos",2,"Papelería",52,15),      sk("Guantes",2,"Papelería",8,3),
  sk("Camiseta CH",2,"Papelería",15,5), sk("Consorcio",2,"Papelería",34,10),
  sk("Esponja Acero",2,"Papelería",18,5),sk("Esponja Común",2,"Papelería",19,5),
  sk("Desengrasante",2,"Papelería",13,5),sk("Detergente",2,"Papelería",20,5),
  sk("Lavandina",2,"Papelería",17,5),   sk("Rejilla",2,"Papelería",32,10),
  sk("Trapo Piso",2,"Papelería",34,10), sk("Escoba",2,"Papelería",0,1),
  sk("Secador",2,"Papelería",0,1),      sk("Alcohol en Gel",2,"Papelería",2,2),
  sk("Alcohol 70/30",2,"Papelería",2,2),sk("Film",2,"Papelería",0,1),
  sk("Marcadores",2,"Papelería",0,1),
];

// Productos propios del stock (van a locales y/o clientes externos)
const PRODUCTOS_INIT = [
  {id:1, producto:"B1 (unidad)",          compra:0, gastos:0, pvLocal:0, pvMayorista:0, costo_muerto:false},
  {id:2, producto:"BL1 (unidad)",          compra:0, gastos:0, pvLocal:0, pvMayorista:0, costo_muerto:false},
  {id:3, producto:"Jamón Feteado ROCA",    compra:0, gastos:0, pvLocal:0, pvMayorista:0, costo_muerto:false},
  {id:4, producto:"Queso Feteado ROCA",    compra:0, gastos:0, pvLocal:0, pvMayorista:0, costo_muerto:false},
  {id:5, producto:"Coca CH (cajón)",       compra:0, gastos:0, pvLocal:0, pvMayorista:0, costo_muerto:false},
  {id:6, producto:"Pan Paty (unidad)",     compra:0, gastos:0, pvLocal:0, pvMayorista:0, costo_muerto:false},
  {id:7, producto:"Chori (unidad)",        compra:0, gastos:0, pvLocal:0, pvMayorista:0, costo_muerto:false},
  {id:8, producto:"Provoletas",            compra:0, gastos:0, pvLocal:0, pvMayorista:0, costo_muerto:false},
  {id:9, producto:"Mayonesa Sachet",       compra:0, gastos:0, pvLocal:0, pvMayorista:0, costo_muerto:true},
  {id:10,producto:"Ketchup Pomo",          compra:0, gastos:0, pvLocal:0, pvMayorista:0, costo_muerto:true},
  {id:11,producto:"Servilletas (paq.)",    compra:0, gastos:0, pvLocal:0, pvMayorista:0, costo_muerto:true},
  {id:12,producto:"Vasos (paq.)",          compra:0, gastos:0, pvLocal:0, pvMayorista:0, costo_muerto:true},
];

// Compras externas (proveedores externos, no en stock propio)
const COMPRAS_EXT_INIT = [
  {id:1, producto:"Verdura",      proveedor:"",  compra:0, cantidad:"",  frecuencia:"semanal"},
  {id:2, producto:"Garrafas",     proveedor:"",  compra:0, cantidad:"",  frecuencia:"semanal"},
  {id:3, producto:"Pan Francés",  proveedor:"",  compra:0, cantidad:"",  frecuencia:"diaria"},
];

const LOCALES = ["LITO'S","FARO","HOMERO","DON JOSÉ","GAUCHITO","AMPARITO"];
const LKEYS   = ["LITOS","FARO","HOMERO","DONJOSE","GAUCHITO","AMPARITO"];

const CAT_COL = {Congelados:"#60a5fa",Aderezos:"#e8c547",Gaseosas:"#4ade80",Papelería:"#a78bfa"};

// ── PDF ───────────────────────────────────────────────────────
const PDF_CSS = `
  body{font-family:Arial,sans-serif;font-size:12px;color:#111;padding:24px}
  h1{font-size:18px;margin-bottom:4px} .sub{color:#666;font-size:11px;margin-bottom:20px}
  table{width:100%;border-collapse:collapse;margin-top:12px}
  th{background:#f0f0f0;padding:7px 10px;text-align:left;font-size:11px;text-transform:uppercase;border-bottom:2px solid #ccc}
  td{padding:6px 10px;border-bottom:1px solid #eee}
  tr:nth-child(even) td{background:#fafafa}
  .footer{margin-top:24px;color:#999;font-size:10px;border-top:1px solid #eee;padding-top:8px}
`;
function exportPDF(titulo, rows, cols) {
  const fecha = new Date().toLocaleDateString("es-AR",{day:"numeric",month:"long",year:"numeric"});
  const ths = cols.map(c=>`<th>${c.label}</th>`).join("");
  const trs = rows.map(r=>`<tr>${cols.map(c=>`<td>${r[c.key]??""}</td>`).join("")}</tr>`).join("");
  const html = `<html><head><title>${titulo}</title><style>${PDF_CSS}</style></head><body>
    <h1>🔥 PARRILLAS — ${titulo}</h1>
    <div class="sub">Generado el ${fecha} · Costanera Sur</div>
    <table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>
    <div class="footer">Sistema de Gestión · Parrillas Costanera Sur</div>
  </body></html>`;
  const w = window.open("","_blank");
  if(!w) return alert("Permitir ventanas emergentes para descargar PDF");
  w.document.write(html); w.document.close();
  setTimeout(()=>w.print(),400);
}

// ── UI ────────────────────────────────────────────────────────
const inp = {background:"#ffffff",border:`1px solid ${C.border}`,borderRadius:7,
  padding:"8px 11px",color:C.text,fontSize:12,fontFamily:"'Inter',sans-serif",outline:"none",
  transition:"border-color .15s"};

const Badge = ({children,color=C.accent}) => (
  <span style={{background:color+"1a",color,border:`1px solid ${color}33`,
    padding:"2px 9px",borderRadius:20,fontSize:10,fontFamily:"'DM Mono',monospace",
    fontWeight:600,whiteSpace:"nowrap",letterSpacing:.3}}>
    {children}
  </span>
);

const KPI = ({label,value,sub,color=C.accent}) => (
  <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,
    padding:"16px 20px",borderLeft:`3px solid ${color}`,
    boxShadow:C.shadow}}>
    <div style={{color:C.textSub,fontSize:9,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1.5,marginBottom:6}}>{label}</div>
    <div style={{color,fontSize:22,fontFamily:"'Syne',sans-serif",fontWeight:800,lineHeight:1.1,letterSpacing:-.5}}>{value}</div>
    {sub && <div style={{color:C.muted,fontSize:10,marginTop:4,fontFamily:"'DM Mono',monospace"}}>{sub}</div>}
  </div>
);

const Th = ({children,style={}}) => (
  <th style={{padding:"9px 14px",textAlign:"left",color:C.textSub,fontSize:10,
    fontFamily:"'Inter',sans-serif",textTransform:"uppercase",letterSpacing:1,
    borderBottom:`1px solid ${C.border}`,fontWeight:600,whiteSpace:"nowrap",
    background:"#f8fafc",...style}}>{children}</th>
);
const Td = ({children,style={},colSpan}) => (
  <td colSpan={colSpan} style={{padding:"7px 12px",color:C.text,fontSize:12,
    borderBottom:`1px solid ${C.border}16`,verticalAlign:"middle",...style}}>{children}</td>
);

const rh = {
  onMouseEnter: e => { e.currentTarget.style.background = "#f8fafc"; },
  onMouseLeave: e => { e.currentTarget.style.background = "transparent"; }
};

const TabBtn = ({active,onClick,children,color=C.accent}) => (
  <button onClick={onClick} style={{
    background:active?color+"15":"transparent",
    color:active?color:C.textSub,
    border:`1px solid ${active?color+"60":C.border}`,borderRadius:7,
    padding:"6px 16px",fontFamily:"'Inter',sans-serif",fontWeight:active?600:400,
    fontSize:12,cursor:"pointer",transition:"all .15s"}}
    onMouseEnter={e=>{ if(!active) e.currentTarget.style.background="#f1f5f9"; }}
    onMouseLeave={e=>{ if(!active) e.currentTarget.style.background="transparent"; }}>
    {children}
  </button>
);

const SmBtn = ({onClick,children,color=C.green}) => (
  <button onClick={onClick} style={{background:color,border:"none",borderRadius:6,
    padding:"6px 14px",color:"#fff",cursor:"pointer",fontSize:11,
    fontFamily:"'Inter',sans-serif",fontWeight:600,whiteSpace:"nowrap"}}>{children}</button>
);

const GhBtn = ({onClick,children}) => (
  <button onClick={onClick} style={{background:"transparent",border:`1px solid ${C.border}`,
    borderRadius:5,padding:"3px 9px",color:C.textSub,cursor:"pointer",fontSize:10,
    fontFamily:"'DM Mono',monospace",transition:"all .12s"}}>{children}</button>
);

const Saved = ({show}) => (
  <span style={{color:C.green,fontSize:10,fontFamily:"'DM Mono',monospace",
    opacity:show?1:0,transition:"opacity .4s",display:"inline-flex",alignItems:"center",gap:4}}>
    ✓ guardado
  </span>
);

const PDFBtn = ({onClick}) => (
  <button onClick={onClick}
    style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:7,
      padding:"5px 12px",color:C.textSub,cursor:"pointer",fontSize:11,
      fontFamily:"'DM Mono',monospace",display:"inline-flex",alignItems:"center",gap:5,transition:"all .15s"}}
    onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent;e.currentTarget.style.color=C.accent;e.currentTarget.style.background=C.accent+"11";}}
    onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.textSub;e.currentTarget.style.background="transparent";}}>
    📄 Exportar PDF
  </button>
);

// ── MODAL DE EDICIÓN ──────────────────────────────────────────
function Modal({title,fields,values,onChange,onSave,onCancel}) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:999,
      display:"flex",alignItems:"center",justifyContent:"center"}}
      onClick={e=>e.target===e.currentTarget&&onCancel()}>
      <div style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:12,
        padding:"28px",width:520,maxWidth:"95vw",maxHeight:"90vh",overflowY:"auto",
        display:"flex",flexDirection:"column",gap:18,boxShadow:"0 20px 60px rgba(0,0,0,.6)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{color:C.text,fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:16}}>{title}</span>
          <button onClick={onCancel} style={{background:"transparent",border:"none",color:C.muted,cursor:"pointer",fontSize:20}}>×</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          {fields.map(f=>(
            <div key={f.key} style={{gridColumn:f.full?"1/-1":"auto"}}>
              <div style={{color:C.textSub,fontSize:10,fontFamily:"'DM Mono',monospace",
                textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>{f.label}</div>
              {f.type==="select"
                ? <select style={{...inp,width:"100%"}} value={values[f.key]||""}
                    onChange={e=>onChange(f.key,e.target.value)}>
                    {f.opts.map(o=><option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}
                  </select>
                : <input type={f.type||"text"} style={{...inp,width:"100%"}}
                    value={values[f.key]||""} placeholder={f.ph||""}
                    onChange={e=>onChange(f.key,e.target.value)}/>}
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:4}}>
          <button onClick={onCancel} style={{background:"transparent",border:`1px solid ${C.border}`,
            borderRadius:7,padding:"9px 20px",color:C.textSub,cursor:"pointer",
            fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:13}}>Cancelar</button>
          <button onClick={onSave} style={{background:C.accent,border:"none",borderRadius:7,
            padding:"9px 20px",color:C.bg,cursor:"pointer",
            fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:13}}>✓ Guardar</button>
        </div>
      </div>
    </div>
  );
}

// ── SUELDOS ───────────────────────────────────────────────────
const periodoBase = e => e.tipo==="jornal" ? e.base*e.dias : e.base;
const periodoTotal = e => periodoBase(e) + (e.extras||0);
const mensualEq   = e => e.tipo==="mensual" ? periodoTotal(e) : periodoTotal(e)*4.33;
const tipoColor   = t => t==="mensual"?C.blue:t==="semanal"?C.green:C.orange;
const tipoLabel   = t => t==="mensual"?"/mes":"/sem";

const EMP_FIELDS = [
  {key:"nombre",label:"Nombre",full:true},
  {key:"cargo", label:"Cargo", full:true},
  {key:"tipo",  label:"Tipo", type:"select",
   opts:[{v:"mensual",l:"Mensual"},{v:"semanal",l:"Semanal"},{v:"jornal",l:"Jornal/día"}]},
  {key:"base",  label:"Base ($)",   type:"number"},
  {key:"extras",label:"Extras ($)", type:"number"},
  {key:"dias",  label:"Días trab.", type:"number"},
];

function ModuloSueldos({isAdmin}) {
  const [emps, setEmps] = useSaved("parrillas-emps", EMPLEADOS_INIT);
  const [saved, setSaved] = useState(false);
  const [modal, setModal] = useState(null);

  const doSave = next => { setEmps(next); setSaved(true); setTimeout(()=>setSaved(false),2000); };
  const openNew  = () => setModal({mode:"new",  data:{nombre:"",cargo:"",tipo:"mensual",base:"",extras:"0",dias:"22"}});
  const openEdit = e  => setModal({mode:"edit", data:{...e,base:String(e.base),extras:String(e.extras||0),dias:String(e.dias)}});
  const chg  = (k,v)  => setModal(m=>({...m,data:{...m.data,[k]:v}}));
  const save = () => {
    const d = modal.data;
    if(!d.nombre||!d.base) return;
    const row = {...d,base:+d.base,extras:+d.extras,dias:+d.dias};
    if(modal.mode==="new") doSave([...emps,{id:Date.now(),...row}]);
    else doSave(emps.map(e=>e.id===d.id?{...e,...row}:e));
    setModal(null);
  };

  const byTipo  = t => emps.filter(e=>e.tipo===t);
  const totTipo = t => byTipo(t).reduce((a,e)=>a+periodoTotal(e),0);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {modal && <Modal title={modal.mode==="new"?"Nuevo Empleado":"Editar Empleado"}
        fields={EMP_FIELDS} values={modal.data} onChange={chg} onSave={save} onCancel={()=>setModal(null)}/>}

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        <KPI label="Costo mensual" value={fmt(emps.reduce((a,e)=>a+mensualEq(e),0))} sub={`${emps.length} personas`}/>
        <KPI label="Mensuales" value={fmt(totTipo("mensual"))+"/mes"} sub={`${byTipo("mensual").length} emp.`} color={C.blue}/>
        <KPI label="Semanales" value={fmt(totTipo("semanal"))+"/sem"} sub={`${byTipo("semanal").length} emp.`} color={C.green}/>
        <KPI label="Jornales" value={fmt(totTipo("jornal"))+"/sem"} sub={`${byTipo("jornal").length} emp.`} color={C.orange}/>
      </div>

      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
          padding:"13px 16px",borderBottom:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{color:C.text,fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14}}>
              Liquidación · {new Date().toLocaleDateString("es-AR")}
            </span>
            <Saved show={saved}/>
          </div>
          <div style={{display:"flex",gap:8}}>
            <PDFBtn onClick={()=>exportPDF("Liquidación de Haberes",
              emps.map(e=>({nombre:e.nombre,cargo:e.cargo,tipo:e.tipo,
                base:`$${e.base.toLocaleString("es-AR")}${tipoLabel(e.tipo)}`,dias:e.dias+"d",
                extras:e.extras>0?fmt(e.extras):"—",total:fmt(periodoTotal(e))+tipoLabel(e.tipo),
                equiv:fmt(mensualEq(e))+"/mes"})),
              [{key:"nombre",label:"Empleado"},{key:"cargo",label:"Cargo"},{key:"tipo",label:"Tipo"},
               {key:"base",label:"Base"},{key:"dias",label:"Días"},{key:"extras",label:"Extras"},
               {key:"total",label:"Total"},{key:"equiv",label:"Equiv./mes"}])}/>
            {isAdmin && <button onClick={openNew} style={{background:C.accent,color:C.bg,border:"none",
              borderRadius:6,padding:"6px 14px",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:12,cursor:"pointer"}}>
              + Empleado</button>}
          </div>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:800}}>
            <thead><tr>
              <Th>Empleado</Th><Th>Cargo</Th><Th>Tipo</Th><Th>Base</Th>
              <Th>Días</Th><Th>Extras</Th><Th>Total período</Th><Th>Equiv./mes</Th>
              {isAdmin&&<Th></Th>}
            </tr></thead>
            <tbody>
              {emps.map(e=>(
                <tr key={e.id} {...rh}>
                  <Td><strong>{e.nombre}</strong></Td>
                  <Td style={{color:C.textSub,fontSize:11}}>{e.cargo}</Td>
                  <Td><Badge color={tipoColor(e.tipo)}>{e.tipo}</Badge></Td>
                  <Td style={{fontFamily:"'DM Mono',monospace"}}>{fmt(e.base)}<span style={{color:C.muted,fontSize:9}}>{tipoLabel(e.tipo)}</span></Td>
                  <Td style={{fontFamily:"'DM Mono',monospace",color:e.tipo==="mensual"?C.muted:C.text}}>{e.dias}d</Td>
                  <Td style={{fontFamily:"'DM Mono',monospace",color:e.extras>0?C.accent:C.muted}}>{e.extras>0?fmt(e.extras):"—"}</Td>
                  <Td style={{fontFamily:"'DM Mono',monospace",color:tipoColor(e.tipo),fontWeight:700}}>{fmt(periodoTotal(e))}<span style={{color:C.muted,fontSize:9,fontWeight:400}}>{tipoLabel(e.tipo)}</span></Td>
                  <Td style={{fontFamily:"'DM Mono',monospace",color:C.textSub,fontSize:11}}>{fmt(mensualEq(e))}</Td>
                  {isAdmin&&<Td>
                    <span style={{display:"flex",gap:5}}>
                      <GhBtn onClick={()=>openEdit(e)}>✎ Editar</GhBtn>
                      <button onClick={()=>doSave(emps.filter(x=>x.id!==e.id))}
                        style={{background:"transparent",border:"none",color:C.red,cursor:"pointer",fontSize:14,opacity:.5}}>×</button>
                    </span>
                  </Td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── STOCK ─────────────────────────────────────────────────────
const STOCK_FIELDS = [
  {key:"producto", label:"Producto",   full:true},
  {key:"deposito", label:"Depósito", type:"select", opts:[{v:"1",l:"Mariano Acosta"},{v:"2",l:"Cruz"}]},
  {key:"categoria",label:"Categoría",type:"select", opts:["Congelados","Aderezos","Gaseosas","Papelería"]},
  {key:"stock",    label:"Stock actual", type:"number"},
  {key:"minimo",   label:"Stock mínimo", type:"number"},
  {key:"unidad",   label:"Unidad (u, kg, lt…)"},
];

function ModuloStock({isAdmin}) {
  const [stock, setStock] = useSaved("parrillas-stock", STOCK_INIT);
  const [saved, setSaved]       = useState(false);
  const [dep, setDep]           = useState(0);
  const [cat, setCat]           = useState("Todas");
  const [search, setSearch]     = useState("");
  const [modal, setModal]       = useState(null);
  const [showIngreso, setShowIngreso] = useState(false);
  const [ingresoItems, setIngresoItems] = useState([]); // [{stockId, producto, unidad, cantidad}]
  const [ingresoQ, setIngresoQ] = useState("");
  const [ingresoFecha, setIngresoFecha] = useState(new Date().toISOString().slice(0,10));
  const [ingresoObs, setIngresoObs]     = useState("");
  const [ingresoSaved, setIngresoSaved] = useState(false);

  const doSave = next => { setStock(next); setSaved(true); setTimeout(()=>setSaved(false),2000); };
  const openNew  = () => setModal({mode:"new",  data:{producto:"",deposito:"1",categoria:"Congelados",stock:"0",minimo:"0",unidad:"u"}});
  const openEdit = s  => setModal({mode:"edit", data:{...s,deposito:String(s.deposito),stock:String(s.stock),minimo:String(s.minimo),unidad:s.unidad||"u"}});
  const chg  = (k,v)  => setModal(m=>({...m,data:{...m.data,[k]:v}}));
  const save = () => {
    const d = modal.data;
    if(!d.producto) return;
    const row = {...d,deposito:+d.deposito,stock:+d.stock,minimo:+d.minimo};
    if(modal.mode==="new") doSave([...stock,{id:Date.now(),...row}]);
    else doSave(stock.map(s=>s.id===d.id?{...s,...row}:s));
    setModal(null);
  };

  // ── Ingreso de mercadería ────────────────────────────────────
  const ingresoFiltrado = ingresoQ.trim()===""
    ? stock
    : stock.filter(s=>s.producto.toLowerCase().includes(ingresoQ.toLowerCase()));

  const addIngreso = (prod, cant) => {
    const c = Math.max(1,+(cant||1));
    const existe = ingresoItems.find(i=>i.stockId===prod.id);
    if(existe) setIngresoItems(items=>items.map(i=>i.stockId===prod.id?{...i,cantidad:i.cantidad+c}:i));
    else setIngresoItems(items=>[...items,{stockId:prod.id,producto:prod.producto,unidad:prod.unidad||"u",cantidad:c}]);
  };

  const confirmarIngreso = () => {
    if(!ingresoItems.length) return;
    const newStock = stock.map(s=>{
      const it = ingresoItems.find(i=>i.stockId===s.id);
      return it ? {...s,stock:s.stock+it.cantidad} : s;
    });
    doSave(newStock);
    setIngresoItems([]); setIngresoQ(""); setIngresoObs("");
    setShowIngreso(false);
    setIngresoSaved(true); setTimeout(()=>setIngresoSaved(false),3000);
  };

  const alertas  = stock.filter(s=>s.stock<=s.minimo&&s.minimo>0);
  const depStock = dep===0?stock:stock.filter(s=>s.deposito===dep);
  const allCats  = [...new Set(depStock.map(s=>s.categoria))];
  const filtrado = depStock.filter(s=>
    (cat==="Todas"||s.categoria===cat)&&s.producto.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {modal && <Modal title={modal.mode==="new"?"Nuevo Producto":"Editar Producto"}
        fields={STOCK_FIELDS} values={modal.data} onChange={chg} onSave={save} onCancel={()=>setModal(null)}/>}

      {alertas.length>0&&(
        <div style={{background:C.red+"12",border:`1px solid ${C.red}40`,borderRadius:8,padding:"9px 14px",display:"flex",gap:9}}>
          <span>⚠️</span>
          <span style={{color:C.red,fontSize:11,fontFamily:"'DM Mono',monospace",lineHeight:1.6}}>
            <strong>{alertas.length} bajo mínimo:</strong>{" "}
            {alertas.map(a=>`${a.producto} (${a.stock} ${a.unidad||"u"})`).join(" · ")}
          </span>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
        <KPI label="Total ítems" value={stock.length.toString()} sub={`${stock.filter(s=>s.stock===0).length} agotados · ${alertas.length} bajo mínimo`}/>
        <KPI label="Mariano Acosta" value={`${stock.filter(s=>s.deposito===1).length} prod.`} sub="Congelados + Aderezos" color={C.blue}/>
        <KPI label="Cruz" value={`${stock.filter(s=>s.deposito===2).length} prod.`} sub="Gaseosas + Aderezos + Papelería" color={C.green}/>
      </div>

      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
        <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <span style={{color:C.text,fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14}}>Inventario</span>
          <Saved show={saved}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar…"
            style={{...inp,width:140,padding:"4px 9px",marginLeft:4}}/>
          <div style={{display:"flex",gap:5,marginLeft:"auto"}}>
            {[0,1,2].map(d=>(
              <TabBtn key={d} active={dep===d} onClick={()=>{setDep(d);setCat("Todas")}}>
                {d===0?"Todos":d===1?"M. Acosta":"Cruz"}
              </TabBtn>
            ))}
          </div>
          {isAdmin&&(
            <button onClick={()=>setShowIngreso(!showIngreso)}
              style={{background:showIngreso?"#dbeafe":C.green,color:"#fff",border:"none",
                borderRadius:8,padding:"5px 14px",fontFamily:"'Inter',sans-serif",
                fontWeight:600,fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
              📥 Ingresar mercadería
            </button>
          )}
          <PDFBtn onClick={()=>exportPDF("Control de Stock",filtrado.map(s=>({
            producto:s.producto,deposito:s.deposito===1?"M. Acosta":"Cruz",categoria:s.categoria,
            stock:s.stock,unidad:s.unidad||"u",minimo:s.minimo,
            estado:s.stock===0?"AGOTADO":s.stock<=s.minimo?"BAJO":"OK"})),
            [{key:"producto",label:"Producto"},{key:"deposito",label:"Depósito"},{key:"categoria",label:"Cat."},
             {key:"stock",label:"Stock"},{key:"unidad",label:"Unidad"},{key:"minimo",label:"Mínimo"},{key:"estado",label:"Estado"}])}/>
          {isAdmin&&<button onClick={openNew} style={{background:C.accent,color:C.bg,border:"none",
            borderRadius:6,padding:"5px 12px",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:11,cursor:"pointer"}}>
            + Producto</button>}
          {dep!==0&&(
            <div style={{display:"flex",gap:4,flexWrap:"wrap",width:"100%"}}>
              {["Todas",...allCats].map(c=>(
                <TabBtn key={c} active={cat===c} onClick={()=>setCat(c)} color={CAT_COL[c]||C.accent}>{c}</TabBtn>
              ))}
            </div>
          )}
        </div>
        {/* ── Panel de ingreso de mercadería ── */}
        {isAdmin&&showIngreso&&(
          <div style={{borderBottom:`1px solid ${C.border}`,background:"#f0fdf4"}}>
            <div style={{padding:"14px 16px",borderBottom:"1px solid #bbf7d0",
              display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:18}}>📥</span>
              <div>
                <div style={{fontWeight:700,fontSize:13,color:"#15803d"}}>Ingreso de Mercadería</div>
                <div style={{fontSize:11,color:"#4ade80"}}>Buscá los productos que llegaron y cargá las cantidades</div>
              </div>
              <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center"}}>
                <div>
                  <div style={{fontSize:9,color:"#15803d",marginBottom:3,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1}}>Fecha de ingreso</div>
                  <input type="date" style={{...inp,padding:"5px 8px",fontSize:11}} value={ingresoFecha}
                    onChange={e=>setIngresoFecha(e.target.value)}/>
                </div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0}}>
              {/* Buscador */}
              <div style={{borderRight:`1px solid ${C.border}`}}>
                <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,background:"#f0fdf4"}}>
                  <input value={ingresoQ} onChange={e=>setIngresoQ(e.target.value)}
                    placeholder="🔍 Buscar producto…"
                    style={{...inp,width:"100%",boxSizing:"border-box",background:"#fff"}}/>
                </div>
                <div style={{maxHeight:280,overflowY:"auto"}}>
                  {ingresoFiltrado.map(s=>{
                    const yaAgregado = ingresoItems.find(i=>i.stockId===s.id);
                    return (
                      <div key={s.id} style={{display:"flex",alignItems:"center",gap:8,
                        padding:"8px 14px",borderBottom:"1px solid #dcfce7",
                        background:yaAgregado?"#f0fdf4":"#fff",transition:"background .12s"}}
                        onMouseEnter={e=>{if(!yaAgregado)e.currentTarget.style.background="#f9fafb";}}
                        onMouseLeave={e=>{if(!yaAgregado)e.currentTarget.style.background=yaAgregado?"#f0fdf4":"#fff";}}>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:600,fontSize:12}}>{s.producto}</div>
                          <div style={{fontSize:10,color:"#64748b"}}>
                            Stock actual: <strong>{s.stock} {s.unidad||"u"}</strong> · {s.deposito===1?"M.Acosta":"Cruz"}
                          </div>
                        </div>
                        {yaAgregado&&<Badge color={C.green}>+{yaAgregado.cantidad}</Badge>}
                        <input type="number" min="1" defaultValue={1}
                          id={`ing-${s.id}`}
                          style={{...inp,width:52,padding:"3px 6px",fontSize:11,
                            textAlign:"center",background:"#fff"}}/>
                        <button onClick={()=>{
                            const el=document.getElementById(`ing-${s.id}`);
                            addIngreso(s,el?el.value:1);
                          }}
                          style={{background:C.green,border:"none",borderRadius:6,
                            padding:"4px 10px",color:"#fff",cursor:"pointer",
                            fontSize:11,fontFamily:"'Inter',sans-serif",fontWeight:600}}>
                          {yaAgregado?"+":"Agregar"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Resumen ingreso */}
              <div style={{display:"flex",flexDirection:"column"}}>
                <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,background:"#f0fdf4",
                  display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontWeight:600,fontSize:13,color:"#15803d"}}>Productos a ingresar</span>
                  <Badge color={C.green}>{ingresoItems.length} ítems</Badge>
                </div>
                <div style={{flex:1,overflowY:"auto",maxHeight:230}}>
                  {ingresoItems.length===0
                    ? <div style={{padding:"24px",textAlign:"center",color:"#86efac",fontSize:12}}>
                        Buscá y agregá los productos recibidos
                      </div>
                    : ingresoItems.map((it,i)=>(
                        <div key={i} style={{display:"flex",alignItems:"center",gap:8,
                          padding:"8px 14px",borderBottom:"1px solid #dcfce7"}}>
                          <div style={{flex:1}}>
                            <div style={{fontWeight:600,fontSize:12}}>{it.producto}</div>
                          </div>
                          <input type="number" min="1" value={it.cantidad}
                            onChange={e=>setIngresoItems(items=>items.map((x,j)=>j===i?{...x,cantidad:Math.max(1,+e.target.value)}:x))}
                            style={{...inp,width:60,padding:"3px 6px",fontSize:12,background:"#fff"}}/>
                          <span style={{fontSize:11,color:"#64748b"}}>{it.unidad}</span>
                          <button onClick={()=>setIngresoItems(items=>items.filter((_,j)=>j!==i))}
                            style={{background:"transparent",border:"none",color:C.red,cursor:"pointer",fontSize:14}}>×</button>
                        </div>
                      ))}
                </div>
                <div style={{padding:"10px 14px",borderTop:`1px solid ${C.border}`}}>
                  <input value={ingresoObs} onChange={e=>setIngresoObs(e.target.value)}
                    placeholder="Observaciones (opcional)…"
                    style={{...inp,width:"100%",boxSizing:"border-box",marginBottom:10,fontSize:12,background:"#fff"}}/>
                  <button onClick={confirmarIngreso} disabled={ingresoItems.length===0}
                    style={{width:"100%",background:ingresoItems.length>0?C.green:"#94a3b8",
                      color:"#fff",border:"none",borderRadius:8,padding:"10px",
                      fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:13,
                      cursor:ingresoItems.length>0?"pointer":"not-allowed"}}>
                    ✓ Confirmar ingreso de {ingresoItems.reduce((a,i)=>a+i.cantidad,0)} unidades
                  </button>
                  {ingresoSaved&&<div style={{color:C.green,fontSize:11,textAlign:"center",marginTop:6,fontFamily:"'DM Mono',monospace"}}>✓ Stock actualizado correctamente</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{maxHeight:500,overflowY:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead style={{position:"sticky",top:0,background:C.card,zIndex:2}}>
              <tr><Th>Producto</Th><Th>Depósito</Th><Th>Categoría</Th><Th>Stock</Th><Th>Unidad</Th><Th>Mínimo</Th><Th>Estado</Th>{isAdmin&&<Th></Th>}</tr>
            </thead>
            <tbody>
              {filtrado.length===0&&<tr><Td colSpan={8} style={{color:C.muted,textAlign:"center",padding:20}}>Sin resultados</Td></tr>}
              {filtrado.map(s=>{
                const bajo=s.stock<=s.minimo&&s.minimo>0;
                return (
                  <tr key={s.id} {...rh}>
                    <Td><strong>{s.producto}</strong></Td>
                    <Td><Badge color={s.deposito===1?C.blue:C.green}>{s.deposito===1?"M. Acosta":"Cruz"}</Badge></Td>
                    <Td><Badge color={CAT_COL[s.categoria]||C.accent}>{s.categoria}</Badge></Td>
                    <Td style={{fontFamily:"'DM Mono',monospace",fontWeight:600,color:s.stock===0?"#555":bajo?C.red:C.text}}>{s.stock}</Td>
                    <Td style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:C.textSub}}>{s.unidad||"u"}</Td>
                    <Td style={{fontFamily:"'DM Mono',monospace",color:C.muted,fontSize:11}}>{s.minimo}</Td>
                    <Td>{s.stock===0?<Badge color="#555">Agotado</Badge>:bajo?<Badge color={C.red}>⚠ Bajo</Badge>:<Badge color={C.green}>OK</Badge>}</Td>
                    {isAdmin&&<Td>
                      <span style={{display:"flex",gap:5}}>
                        <GhBtn onClick={()=>openEdit(s)}>✎ Editar</GhBtn>
                        <button onClick={()=>doSave(stock.filter(x=>x.id!==s.id))}
                          style={{background:"transparent",border:"none",color:C.red,cursor:"pointer",fontSize:13,opacity:.5}}>×</button>
                      </span>
                    </Td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{padding:"8px 16px",borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between"}}>
          <span style={{color:C.muted,fontSize:10,fontFamily:"'DM Mono',monospace"}}>{filtrado.length} / {stock.length} productos</span>
          <span style={{color:C.muted,fontSize:10,fontFamily:"'DM Mono',monospace"}}>{alertas.length} bajo mínimo · {stock.filter(s=>s.stock===0).length} agotados</span>
        </div>
      </div>
    </div>
  );
}

// ── PEDIDOS ───────────────────────────────────────────────────
const LOCALES_OPT = ["LITO'S","FARO","HOMERO","DON JOSÉ","GAUCHITO","AMPARITO"];

function ModuloPedidos({isAdmin}) {
  const [stock, setStock]     = useSaved("parrillas-stock",   STOCK_INIT);
  const [pedidos, setPedidos] = useSaved("parrillas-pedidos", []);
  const [saved,   setSaved]   = useState(false);
  const [tab, setTab]         = useState("nuevo"); // nuevo | historial | analisis
  const [search,  setSearch]  = useState("");      // historial search
  const [prodQ,   setProdQ]   = useState("");      // product search in form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    tipo:"local", destino:"LITO'S", clienteNombre:"",
    fecha:new Date().toISOString().slice(0,10), items:[]
  });
  const [itemCant, setItemCant] = useState({}); // stockId -> cantidad string

  const saveP = next => { setPedidos(next); setSaved(true); setTimeout(()=>setSaved(false),2000); };

  // Filtrar productos del stock según búsqueda
  const stockFiltrado = prodQ.trim()===""
    ? stock
    : stock.filter(s=>s.producto.toLowerCase().includes(prodQ.toLowerCase()));

  const addItem = (prod, cant) => {
    const c = Math.max(1, +(cant||1));
    const existe = form.items.find(i=>i.stockId===prod.id);
    if(existe) setForm(f=>({...f,items:f.items.map(i=>i.stockId===prod.id?{...i,cantidad:i.cantidad+c}:i)}));
    else setForm(f=>({...f,items:[...f.items,{stockId:prod.id,producto:prod.producto,cantidad:c,unidad:prod.unidad||"u"}]}));
    setItemCant(v=>({...v,[prod.id]:""}));
  };

  const removeItem = stockId => setForm(f=>({...f,items:f.items.filter(i=>i.stockId!==stockId)}));

  const confirmar = () => {
    if(!form.items.length) return;
    setStock(stock.map(s=>{
      const it = form.items.find(i=>i.stockId===s.id);
      return it ? {...s,stock:Math.max(0,s.stock-it.cantidad)} : s;
    }));
    const nombreMostrar = form.tipo==="cliente"&&form.clienteNombre
      ? form.clienteNombre : form.tipo==="local" ? form.destino : "Cliente externo";
    saveP([{id:Date.now(),...form,nombreMostrar,
      hora:new Date().toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit"})
    },...pedidos]);
    setForm({tipo:"local",destino:"LITO'S",clienteNombre:"",
      fecha:new Date().toISOString().slice(0,10),items:[]});
    setProdQ(""); setItemCant({});
    setTab("historial");
  };

  // Stats
  const hoy        = new Date().toISOString().slice(0,10);
  const pedidosHoy = pedidos.filter(p=>p.fecha===hoy).length;

  // ── Hoja de despacho diaria ──────────────────────────────────
  const hojaDespacho = () => {
    const pedidosDelDia = pedidos.filter(p=>p.fecha===hoy);
    if(pedidosDelDia.length===0) { alert("No hay pedidos cargados para hoy."); return; }
    
    // Agrupar por producto → totales
    const totales = {};
    pedidosDelDia.forEach(p=>{
      p.items.forEach(it=>{
        const key = it.producto;
        if(!totales[key]) totales[key]={producto:it.producto,unidad:it.unidad,total:0,detalle:[]};
        totales[key].total += it.cantidad;
        totales[key].detalle.push({destino:p.nombreMostrar||p.destino,cant:it.cantidad,tipo:p.tipo});
      });
    });

    const fecha = new Date().toLocaleDateString("es-AR",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
    const rows = Object.values(totales).sort((a,b)=>a.producto.localeCompare(b.producto));
    
    const detalleHtml = rows.map(r=>`
      <tr>
        <td style="font-weight:600;font-size:13px">${r.producto}</td>
        <td style="font-size:11px;color:#666">${r.unidad}</td>
        <td style="font-size:18px;font-weight:800;color:#d97706;text-align:center">${r.total}</td>
        <td style="font-size:11px;color:#555">${r.detalle.map(d=>`${d.destino} (${d.cant})`).join(" · ")}</td>
      </tr>`).join("");

    const html = `<html><head><title>Hoja de Despacho ${hoy}</title><style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'Inter',Arial,sans-serif;padding:32px;color:#1e293b;background:#fff}
      .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:20px;border-bottom:3px solid #d97706}
      .brand{font-size:24px;font-weight:800;color:#d97706;letter-spacing:-0.5px}
      .brand-sub{font-size:11px;color:#94a3b8;font-family:'DM Mono',monospace;margin-top:2px}
      .title{font-size:20px;font-weight:700;color:#1e293b;margin-bottom:4px}
      .date{font-size:12px;color:#64748b}
      .badge{background:#fef3c7;color:#d97706;border:1px solid #fcd34d;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600}
      table{width:100%;border-collapse:collapse;margin-top:8px}
      th{padding:10px 14px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:1px;
         color:#64748b;border-bottom:2px solid #e2e8f0;background:#f8fafc;font-weight:600}
      td{padding:12px 14px;border-bottom:1px solid #f1f5f9;vertical-align:middle}
      tr:last-child td{border-bottom:none}
      tr:hover td{background:#fefce8}
      .total-row td{background:#fef3c7;font-weight:700;border-top:2px solid #fcd34d}
      .footer{margin-top:28px;padding-top:16px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;font-size:10px;color:#94a3b8}
      .firma{border-top:1px solid #cbd5e1;padding-top:4px;margin-top:24px;width:200px;text-align:center;font-size:10px;color:#94a3b8}
      @media print{body{padding:20px}}
    </style></head><body>
      <div class="header">
        <div>
          <div class="brand">🔥 PARRILLAS</div>
          <div class="brand-sub">sistema de gestión · costanera sur</div>
        </div>
        <div style="text-align:right">
          <div class="title">Hoja de Despacho</div>
          <div class="date">${fecha}</div>
          <div style="margin-top:6px"><span class="badge">${pedidosDelDia.length} pedidos del día</span></div>
        </div>
      </div>
      
      <table>
        <thead><tr>
          <th>Producto</th><th>Unidad</th><th style="text-align:center">Total a despachar</th><th>Detalle por destino</th>
        </tr></thead>
        <tbody>
          ${detalleHtml}
          <tr class="total-row">
            <td colspan="2">TOTAL UNIDADES</td>
            <td style="text-align:center;font-size:18px">${rows.reduce((a,r)=>a+r.total,0)}</td>
            <td>${pedidosDelDia.map(p=>p.nombreMostrar||p.destino).join(", ")}</td>
          </tr>
        </tbody>
      </table>

      <div style="display:flex;gap:40px;margin-top:32px">
        <div class="firma">Preparado por</div>
        <div class="firma">Revisado por</div>
        <div class="firma">Entregado por</div>
      </div>

      <div class="footer">
        <span>Parrillas Costanera Sur — Sistema de Gestión</span>
        <span>Impreso el ${new Date().toLocaleString("es-AR")}</span>
      </div>
    </body></html>`;
    
    const w = window.open("","_blank");
    if(!w) return alert("Permitir ventanas emergentes para imprimir");
    w.document.write(html); w.document.close();
    setTimeout(()=>w.print(),500);
  };

  // ── PDF Análisis semanal / mensual ────────────────────────────
  const pdfAnalisis = (periodo) => {
    const hoyDate  = new Date();
    let desde;
    if(periodo==="semana") {
      desde = new Date(hoyDate); desde.setDate(hoyDate.getDate()-7);
    } else {
      desde = new Date(hoyDate); desde.setMonth(hoyDate.getMonth()-1);
    }
    const desdeStr = desde.toISOString().slice(0,10);
    const pedFiltrados = pedidos.filter(p=>p.fecha>=desdeStr);
    
    if(pedFiltrados.length===0) { alert(`Sin pedidos en la última ${periodo==="semana"?"semana":"mes"}.`); return; }

    // Totales por producto
    const totProd = {};
    pedFiltrados.forEach(p=>p.items.forEach(it=>{
      if(!totProd[it.producto]) totProd[it.producto]={producto:it.producto,unidad:it.unidad,total:0,locales:0,clientes:0};
      totProd[it.producto].total += it.cantidad;
      if(p.tipo==="local") totProd[it.producto].locales += it.cantidad;
      else totProd[it.producto].clientes += it.cantidad;
    }));
    const prodRows = Object.values(totProd).sort((a,b)=>b.total-a.total);

    // Totales por destino
    const totDest = {};
    pedFiltrados.forEach(p=>{
      const n = p.nombreMostrar||p.destino;
      if(!totDest[n]) totDest[n]={nombre:n,tipo:p.tipo,pedidos:0,unidades:0};
      totDest[n].pedidos++;
      totDest[n].unidades += p.items.reduce((a,i)=>a+i.cantidad,0);
    });
    const destRows = Object.values(totDest).sort((a,b)=>b.unidades-a.unidades);

    const fechaDesde = desde.toLocaleDateString("es-AR");
    const fechaHasta = hoyDate.toLocaleDateString("es-AR");
    const titulo = `Análisis ${periodo==="semana"?"Semanal":"Mensual"} de Mercadería Saliente`;

    const prodHtml = prodRows.map((r,i)=>`
      <tr>
        <td style="font-weight:600">${i+1}. ${r.producto}</td>
        <td style="text-align:center;font-weight:700;font-size:15px;color:#d97706">${r.total} ${r.unidad}</td>
        <td style="text-align:center;color:#2563eb">${r.locales} ${r.unidad}</td>
        <td style="text-align:center;color:#ea580c">${r.clientes} ${r.unidad}</td>
      </tr>`).join("");

    const destHtml = destRows.map(r=>`
      <tr>
        <td style="font-weight:600">${r.nombre}</td>
        <td><span style="background:${r.tipo==="local"?"#dbeafe":"#ffedd5"};color:${r.tipo==="local"?"#1d4ed8":"#9a3412"};padding:2px 8px;border-radius:20px;font-size:10px;font-weight:600">${r.tipo==="local"?"Local":"Cliente ext."}</span></td>
        <td style="text-align:center;font-weight:700">${r.pedidos}</td>
        <td style="text-align:center;font-weight:700;color:#16a34a">${r.unidades} u.</td>
      </tr>`).join("");

    const html = `<html><head><title>${titulo}</title><style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'Inter',Arial,sans-serif;padding:32px;color:#1e293b;background:#fff}
      .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:18px;border-bottom:3px solid #d97706}
      .brand{font-size:22px;font-weight:800;color:#d97706}
      .title{font-size:18px;font-weight:700;margin-bottom:3px}
      .period{font-size:12px;color:#64748b}
      .kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}
      .kpi{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;border-left:3px solid #d97706}
      .kpi-label{font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:600;margin-bottom:4px}
      .kpi-value{font-size:22px;font-weight:800;color:#d97706}
      .section{margin-bottom:24px}
      .section-title{font-size:14px;font-weight:700;margin-bottom:10px;color:#1e293b;border-left:3px solid #d97706;padding-left:10px}
      table{width:100%;border-collapse:collapse}
      th{padding:9px 12px;text-align:left;font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#64748b;border-bottom:2px solid #e2e8f0;background:#f8fafc;font-weight:600}
      td{padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:12px}
      .footer{margin-top:24px;padding-top:12px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;font-size:10px;color:#94a3b8}
    </style></head><body>
      <div class="header">
        <div>
          <div class="brand">🔥 PARRILLAS</div>
          <div style="font-size:10px;color:#94a3b8;margin-top:2px">costanera sur</div>
        </div>
        <div style="text-align:right">
          <div class="title">${titulo}</div>
          <div class="period">Del ${fechaDesde} al ${fechaHasta}</div>
        </div>
      </div>

      <div class="kpi-grid">
        <div class="kpi"><div class="kpi-label">Pedidos</div><div class="kpi-value">${pedFiltrados.length}</div></div>
        <div class="kpi"><div class="kpi-label">Unidades salientes</div><div class="kpi-value">${prodRows.reduce((a,r)=>a+r.total,0)}</div></div>
        <div class="kpi"><div class="kpi-label">Para locales</div><div class="kpi-value">${prodRows.reduce((a,r)=>a+r.locales,0)}</div></div>
        <div class="kpi"><div class="kpi-label">Para clientes ext.</div><div class="kpi-value">${prodRows.reduce((a,r)=>a+r.clientes,0)}</div></div>
      </div>

      <div class="section">
        <div class="section-title">Mercadería saliente por producto</div>
        <table>
          <thead><tr><th>Producto</th><th style="text-align:center">Total</th><th style="text-align:center">→ Locales</th><th style="text-align:center">→ Clientes ext.</th></tr></thead>
          <tbody>${prodHtml}</tbody>
        </table>
      </div>

      <div class="section">
        <div class="section-title">Pedidos por destino</div>
        <table>
          <thead><tr><th>Destino</th><th>Tipo</th><th style="text-align:center">Pedidos</th><th style="text-align:center">Unidades</th></tr></thead>
          <tbody>${destHtml}</tbody>
        </table>
      </div>

      <div class="footer">
        <span>Parrillas Costanera Sur — Sistema de Gestión</span>
        <span>Generado el ${new Date().toLocaleString("es-AR")}</span>
      </div>
    </body></html>`;

    const w = window.open("","_blank");
    if(!w) return alert("Permitir ventanas emergentes para imprimir");
    w.document.write(html); w.document.close();
    setTimeout(()=>w.print(),500);
  };
  const totalU     = pedidos.reduce((a,p)=>a+p.items.reduce((b,i)=>b+i.cantidad,0),0);
  const clientes   = [...new Set(pedidos.filter(p=>p.tipo==="cliente").map(p=>p.nombreMostrar||p.destino))];

  // Historial filtrado
  const filtrado = search
    ? pedidos.filter(p=>(p.nombreMostrar||"").toLowerCase().includes(search.toLowerCase())||
        p.items.some(i=>i.producto.toLowerCase().includes(search.toLowerCase())))
    : pedidos;

  // Análisis: por local
  const analisisLocales = LOCALES_OPT.map(local=>{
    const ps = pedidos.filter(p=>p.tipo==="local"&&p.destino===local);
    const unidades = ps.reduce((a,p)=>a+p.items.reduce((b,i)=>b+i.cantidad,0),0);
    // top productos
    const prodMap = {};
    ps.forEach(p=>p.items.forEach(i=>{
      prodMap[i.producto]=(prodMap[i.producto]||0)+i.cantidad;
    }));
    const topProd = Object.entries(prodMap).sort((a,b)=>b[1]-a[1]).slice(0,3);
    return {local, pedidos:ps.length, unidades, topProd};
  });

  // Análisis: por cliente externo
  const analisisClientes = clientes.map(nombre=>{
    const ps = pedidos.filter(p=>p.tipo==="cliente"&&(p.nombreMostrar||p.destino)===nombre);
    const unidades = ps.reduce((a,p)=>a+p.items.reduce((b,i)=>b+i.cantidad,0),0);
    const prodMap = {};
    ps.forEach(p=>p.items.forEach(i=>{
      prodMap[i.producto]=(prodMap[i.producto]||0)+i.cantidad;
    }));
    const topProd = Object.entries(prodMap).sort((a,b)=>b[1]-a[1]).slice(0,3);
    const ultimo  = ps[0]?.fecha||"—";
    return {nombre, pedidos:ps.length, unidades, topProd, ultimo};
  }).sort((a,b)=>b.unidades-a.unidades);

  const dm = {fontFamily:"'DM Mono',monospace"};

  // Item en form: cantidad actual
  const cantItem = stockId => itemCant[stockId]??1;
  const inFormItem = stockId => form.items.find(i=>i.stockId===stockId);

  // ── Edición de pedido ──────────────────────────────────────
  const [editingPedido, setEditingPedido] = useState(null); // pedido completo siendo editado
  const [editProdQ, setEditProdQ]         = useState("");

  const openEdit = (p) => {
    setEditingPedido({...p, items:[...p.items.map(i=>({...i}))]});
    setEditProdQ("");
    setTab("editar");
  };

  const editAddItem = (prod, cant) => {
    const c = Math.max(1, +(cant||1));
    const existe = editingPedido.items.find(i=>i.stockId===prod.id);
    if(existe) setEditingPedido(ep=>({...ep,items:ep.items.map(i=>i.stockId===prod.id?{...i,cantidad:i.cantidad+c}:i)}));
    else setEditingPedido(ep=>({...ep,items:[...ep.items,{stockId:prod.id,producto:prod.producto,cantidad:c,unidad:prod.unidad||"u"}]}));
  };

  const editRemoveItem = stockId => setEditingPedido(ep=>({...ep,items:ep.items.filter(i=>i.stockId!==stockId)}));

  const confirmarEdicion = () => {
    if(!editingPedido||!editingPedido.items.length) return;
    // Revertir stock del pedido original, aplicar el editado
    const original = pedidos.find(p=>p.id===editingPedido.id);
    let newStock = [...stock];
    if(original) {
      // Devolver stock original
      newStock = newStock.map(s=>{
        const oldIt = original.items.find(i=>i.stockId===s.id);
        return oldIt ? {...s,stock:s.stock+oldIt.cantidad} : s;
      });
    }
    // Descontar nuevo pedido
    newStock = newStock.map(s=>{
      const newIt = editingPedido.items.find(i=>i.stockId===s.id);
      return newIt ? {...s,stock:Math.max(0,s.stock-newIt.cantidad)} : s;
    });
    setStock(newStock);
    const nombreMostrar = editingPedido.tipo==="cliente"&&editingPedido.clienteNombre
      ? editingPedido.clienteNombre : editingPedido.tipo==="local" ? editingPedido.destino : "Cliente externo";
    saveP(pedidos.map(p=>p.id===editingPedido.id?{...editingPedido,nombreMostrar,editadoEl:new Date().toLocaleString("es-AR")}:p));
    setEditingPedido(null);
    setTab("historial");
  };

  // ── Borrado con contraseña ────────────────────────────────
  const [deleteModal, setDeleteModal] = useState(null); // {id, pass, error}
  const PASS_DELETE = PASS_ADMIN; // misma contraseña admin

  const confirmarBorrado = () => {
    if(deleteModal.pass !== PASS_DELETE) {
      setDeleteModal(m=>({...m,error:true,pass:""}));
      setTimeout(()=>setDeleteModal(m=>m?{...m,error:false}:null),1500);
      return;
    }
    saveP(pedidos.filter(x=>x.id!==deleteModal.id));
    setDeleteModal(null);
  };

  const editProdFiltrado = editProdQ.trim()===""
    ? stock
    : stock.filter(s=>s.producto.toLowerCase().includes(editProdQ.toLowerCase()));

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>

      {/* ── MODAL BORRADO CON CONTRASEÑA ── */}
      {deleteModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:999,
          display:"flex",alignItems:"center",justifyContent:"center"}}
          onClick={e=>e.target===e.currentTarget&&setDeleteModal(null)}>
          <div style={{background:"#fff",border:"1px solid #fecaca",borderRadius:14,
            padding:"32px",width:380,display:"flex",flexDirection:"column",gap:18,
            boxShadow:"0 20px 60px rgba(0,0,0,.15)"}}>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:36,marginBottom:8}}>🔐</div>
              <div style={{fontWeight:700,fontSize:16,color:"#1e293b",marginBottom:4}}>Confirmar eliminación</div>
              <div style={{fontSize:12,color:"#64748b"}}>Esta acción no se puede deshacer. Ingresá la contraseña de admin para continuar.</div>
            </div>
            <div>
              <div style={{fontSize:10,color:"#64748b",fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Contraseña de administrador</div>
              <input
                type="password"
                value={deleteModal.pass}
                autoFocus
                onChange={e=>setDeleteModal(m=>({...m,pass:e.target.value,error:false}))}
                onKeyDown={e=>e.key==="Enter"&&confirmarBorrado()}
                placeholder="Ingresá la contraseña…"
                style={{width:"100%",border:`1px solid ${deleteModal.error?"#f26c6c":"#e2e8f0"}`,borderRadius:8,
                  padding:"10px 14px",fontSize:13,fontFamily:"'Inter',sans-serif",
                  outline:"none",boxSizing:"border-box",transition:"border-color .2s",
                  background:deleteModal.error?"#fef2f2":"#fff",color:"#1e293b"}}/>
              {deleteModal.error&&(
                <div style={{color:"#dc2626",fontSize:11,marginTop:6,fontFamily:"'DM Mono',monospace"}}>
                  ✕ Contraseña incorrecta
                </div>
              )}
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setDeleteModal(null)}
                style={{flex:1,background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,
                  padding:"10px",fontFamily:"'Inter',sans-serif",fontWeight:600,fontSize:13,cursor:"pointer",color:"#64748b"}}>
                Cancelar
              </button>
              <button onClick={confirmarBorrado}
                style={{flex:1,background:"#dc2626",border:"none",borderRadius:8,
                  padding:"10px",fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:13,cursor:"pointer",color:"#fff"}}>
                Eliminar pedido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        <KPI label="Pedidos totales"       value={pedidos.length.toString()} sub="Historial completo"/>
        <KPI label="Pedidos hoy"           value={pedidosHoy.toString()} sub={new Date().toLocaleDateString("es-AR")} color={C.blue}/>
        <KPI label="Unidades despachadas"  value={totalU.toString()} sub="Total histórico" color={C.green}/>
        <KPI label="Clientes externos"     value={clientes.length.toString()} sub={clientes.slice(0,2).join(", ")||"—"} color={C.orange}/>
      </div>

      {/* Tabs + acciones rápidas */}
      <div style={{display:"flex",gap:8,alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",gap:8}}>
          {isAdmin&&<TabBtn active={tab==="nuevo"} onClick={()=>setTab("nuevo")}>+ Nuevo pedido</TabBtn>}
          <TabBtn active={tab==="historial"} onClick={()=>setTab("historial")}>📋 Historial</TabBtn>
          <TabBtn active={tab==="analisis"} onClick={()=>setTab("analisis")} color={C.purple}>📊 Análisis</TabBtn>
          {tab==="editar"&&<TabBtn active={true} onClick={()=>{}} color={C.blue}>✎ Editando pedido</TabBtn>}
        </div>
        {isAdmin&&(
          <div style={{display:"flex",gap:8}}>
            <button onClick={hojaDespacho}
              style={{background:C.accent,color:"#fff",border:"none",borderRadius:8,
                padding:"7px 16px",fontFamily:"'Inter',sans-serif",fontWeight:600,
                fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:6,
                boxShadow:`0 2px 8px ${C.accent}40`}}>
              🚚 Hoja de despacho del día
            </button>
          </div>
        )}
      </div>

      {/* ── NUEVO PEDIDO ── */}
      {tab==="nuevo"&&isAdmin&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>

          {/* Panel izquierdo: buscador de productos */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden",display:"flex",flexDirection:"column"}}>
            <div style={{padding:"14px 16px",borderBottom:`1px solid ${C.border}`,background:C.panel}}>
              <div style={{color:C.text,fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14,marginBottom:10}}>
                Buscador de productos
              </div>
              <input
                value={prodQ} onChange={e=>setProdQ(e.target.value)}
                placeholder="🔍  Buscar por nombre…"
                style={{...inp,width:"100%",boxSizing:"border-box",fontSize:13,padding:"9px 12px"}}
                autoFocus
              />
            </div>
            <div style={{overflowY:"auto",maxHeight:420}}>
              {stockFiltrado.length===0&&(
                <div style={{padding:"24px",textAlign:"center",color:C.muted,fontFamily:"'DM Mono',monospace",fontSize:11}}>
                  Sin resultados para "{prodQ}"
                </div>
              )}
              {stockFiltrado.map(s=>{
                const enForm = inFormItem(s.id);
                const bajo   = s.stock<=s.minimo&&s.minimo>0;
                return (
                  <div key={s.id}
                    style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",
                      borderBottom:`1px solid ${C.border}16`,
                      background:enForm?C.accent+"08":"transparent",
                      transition:"background .12s"}}
                    onMouseEnter={e=>{ if(!enForm) e.currentTarget.style.background=C.bg+"cc"; }}
                    onMouseLeave={e=>{ if(!enForm) e.currentTarget.style.background="transparent"; }}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:600,fontSize:12,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.producto}</div>
                      <div style={{display:"flex",gap:6,marginTop:3,alignItems:"center"}}>
                        <Badge color={s.deposito===1?C.blue:C.green}>{s.deposito===1?"M.Acosta":"Cruz"}</Badge>
                        <span style={{...dm,fontSize:10,color:bajo?C.red:C.muted}}>{s.stock} {s.unidad||"u"}</span>
                        {bajo&&<Badge color={C.red}>⚠</Badge>}
                        {enForm&&<Badge color={C.accent}>✓ {enForm.cantidad} agregados</Badge>}
                      </div>
                    </div>
                    <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
                      <input
                        type="number" min="1" max={s.stock}
                        value={cantItem(s.id)}
                        onChange={e=>setItemCant(v=>({...v,[s.id]:e.target.value}))}
                        style={{...inp,width:52,padding:"4px 6px",fontSize:12,textAlign:"center"}}
                      />
                      <button
                        onClick={()=>addItem(s, cantItem(s.id))}
                        style={{background:enForm?C.accent:C.green,border:"none",borderRadius:6,
                          padding:"5px 10px",color:"#000",cursor:"pointer",fontSize:11,
                          fontFamily:"'Syne',sans-serif",fontWeight:700,whiteSpace:"nowrap"}}>
                        {enForm?"+":"Agregar"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Panel derecho: resumen del pedido */}
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {/* Datos del pedido */}
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:"16px",display:"flex",flexDirection:"column",gap:12}}>
              <div style={{color:C.text,fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14}}>Datos del pedido</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <div style={{color:C.textSub,fontSize:9,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Tipo</div>
                  <select style={{...inp,width:"100%"}} value={form.tipo}
                    onChange={e=>setForm(f=>({...f,tipo:e.target.value,destino:e.target.value==="local"?"LITO'S":"",clienteNombre:""}))}>
                    <option value="local">Local propio</option>
                    <option value="cliente">Cliente externo</option>
                  </select>
                </div>
                <div>
                  <div style={{color:C.textSub,fontSize:9,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>
                    {form.tipo==="local"?"Local destino":"Nombre del cliente"}
                  </div>
                  {form.tipo==="local"
                    ? <select style={{...inp,width:"100%"}} value={form.destino}
                        onChange={e=>setForm(f=>({...f,destino:e.target.value}))}>
                        {LOCALES_OPT.map(l=><option key={l}>{l}</option>)}
                      </select>
                    : <input style={{...inp,width:"100%"}} value={form.clienteNombre}
                        placeholder="Ej: Restaurante El Sur…"
                        onChange={e=>setForm(f=>({...f,clienteNombre:e.target.value}))}/>}
                </div>
                <div style={{gridColumn:"1/-1"}}>
                  <div style={{color:C.textSub,fontSize:9,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Fecha</div>
                  <input type="date" style={{...inp,width:"100%"}} value={form.fecha}
                    onChange={e=>setForm(f=>({...f,fecha:e.target.value}))}/>
                </div>
              </div>
            </div>

            {/* Items del pedido */}
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden",flex:1}}>
              <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{color:C.text,fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14}}>
                  Productos seleccionados
                </span>
                <Badge color={form.items.length>0?C.accent:C.muted}>
                  {form.items.length} producto{form.items.length!==1?"s":""}
                </Badge>
              </div>
              {form.items.length===0
                ? <div style={{padding:"28px 16px",textAlign:"center",color:C.muted,fontFamily:"'DM Mono',monospace",fontSize:11}}>
                    Buscá y agregá productos desde el panel izquierdo
                  </div>
                : <>
                    <div style={{maxHeight:220,overflowY:"auto"}}>
                      {form.items.map((it,i)=>{
                        const prod = stock.find(s=>s.id===it.stockId);
                        const ok   = prod&&prod.stock>=it.cantidad;
                        return (
                          <div key={i} style={{display:"flex",alignItems:"center",gap:10,
                            padding:"8px 14px",borderBottom:`1px solid ${C.border}16`}}>
                            <div style={{flex:1}}>
                              <div style={{fontWeight:600,fontSize:12}}>{it.producto}</div>
                              <div style={{...dm,fontSize:11,color:C.accent,fontWeight:700}}>{it.cantidad} {it.unidad}</div>
                            </div>
                            <Badge color={ok?C.green:C.red}>{prod?`stock: ${prod.stock}`:"sin stock"}</Badge>
                            <button onClick={()=>removeItem(it.stockId)}
                              style={{background:"transparent",border:"none",color:C.red,cursor:"pointer",fontSize:16,opacity:.6}}>×</button>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{padding:"14px 16px",borderTop:`1px solid ${C.border}`}}>
                      <button onClick={confirmar}
                        style={{width:"100%",background:C.green,color:"#000",border:"none",borderRadius:8,
                          padding:"12px",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:14,cursor:"pointer",
                          letterSpacing:.3}}>
                        ✓ Confirmar pedido y descontar stock
                      </button>
                    </div>
                  </>}
            </div>
          </div>
        </div>
      )}

      {/* ── HISTORIAL ── */}
      {tab==="historial"&&(
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 16px",borderBottom:`1px solid ${C.border}`}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{color:C.text,fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14}}>Historial de Pedidos</span>
              <Saved show={saved}/>
            </div>
            <div style={{display:"flex",gap:8}}>
              <PDFBtn onClick={()=>exportPDF("Historial de Pedidos",filtrado.map(p=>({
                fecha:p.fecha,hora:p.hora,destino:p.nombreMostrar||p.destino,
                tipo:p.tipo==="local"?"Local":"Cliente ext.",
                productos:p.items.map(i=>`${i.producto} x${i.cantidad}`).join(", ")})),
                [{key:"fecha",label:"Fecha"},{key:"hora",label:"Hora"},{key:"destino",label:"Destino"},
                 {key:"tipo",label:"Tipo"},{key:"productos",label:"Productos"}])}/>
              <input value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="🔍  Buscar…"
                style={{...inp,width:180,padding:"5px 10px",fontSize:12}}/>
            </div>
          </div>
          {filtrado.length===0
            ? <div style={{padding:"40px",textAlign:"center",color:C.muted,fontFamily:"'DM Mono',monospace",fontSize:11}}>
                {isAdmin?"Sin pedidos. Usá la pestaña \"+ Nuevo pedido\".":"Sin pedidos registrados."}
              </div>
            : <div style={{maxHeight:500,overflowY:"auto"}}>
                {filtrado.map(p=>(
                  <div key={p.id}
                    style={{borderBottom:`1px solid ${C.border}`,padding:"12px 16px",transition:"background .12s"}}
                    onMouseEnter={e=>e.currentTarget.style.background=C.bg+"88"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <strong style={{color:C.text,fontSize:13}}>{p.nombreMostrar||p.destino}</strong>
                        <Badge color={p.tipo==="local"?C.blue:C.orange}>{p.tipo==="local"?"Local":"Cliente ext."}</Badge>
                        <span style={{...dm,fontSize:10,color:C.muted}}>{p.fecha} · {p.hora}</span>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <Badge color={C.green}>{p.items.reduce((a,i)=>a+i.cantidad,0)} u. totales</Badge>
                        {p.editadoEl&&<Badge color={C.muted}>✎ editado</Badge>}
                        {isAdmin&&(
                          <>
                            <button onClick={()=>openEdit(p)}
                              style={{background:"transparent",border:`1px solid ${C.border}`,color:C.blue,
                                cursor:"pointer",fontSize:11,borderRadius:6,padding:"3px 10px",
                                fontFamily:"'Inter',sans-serif",fontWeight:500}}>
                              ✎ Editar
                            </button>
                            <button onClick={()=>setDeleteModal({id:p.id,pass:"",error:false})}
                              style={{background:"transparent",border:`1px solid #fecaca`,color:C.red,
                                cursor:"pointer",fontSize:11,borderRadius:6,padding:"3px 10px",
                                fontFamily:"'Inter',sans-serif",fontWeight:500}}>
                              Eliminar
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                      {p.items.map((it,i)=>(
                        <span key={i} style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:5,
                          padding:"3px 10px",fontSize:11,...dm,color:C.text}}>
                          {it.producto} <span style={{color:C.accent,fontWeight:700}}>{it.cantidad} {it.unidad}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>}
        </div>
      )}

      {/* ── EDITAR PEDIDO ── */}
      {tab==="editar"&&editingPedido&&isAdmin&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {/* Header */}
          <div style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:10,padding:"14px 18px",
            display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontWeight:700,fontSize:14,color:"#1e40af"}}>Editando pedido de {editingPedido.nombreMostrar||editingPedido.destino}</div>
              <div style={{fontSize:11,color:"#3b82f6",marginTop:2}}>
                {editingPedido.fecha} · {editingPedido.hora} — Podés modificar productos y cantidades
              </div>
            </div>
            <button onClick={()=>{setEditingPedido(null);setTab("historial");}}
              style={{background:"transparent",border:"1px solid #bfdbfe",borderRadius:7,
                padding:"6px 14px",color:"#3b82f6",cursor:"pointer",fontSize:12,fontFamily:"'Inter',sans-serif",fontWeight:500}}>
              ← Volver sin guardar
            </button>
          </div>

          {/* Datos del pedido */}
          <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:"16px",display:"flex",flexDirection:"column",gap:10}}>
            <div style={{fontWeight:600,fontSize:13,color:"#1e293b",marginBottom:4}}>Datos del pedido</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
              <div>
                <div style={{fontSize:9,color:"#64748b",fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Tipo</div>
                <select style={{...inp,width:"100%"}} value={editingPedido.tipo}
                  onChange={e=>setEditingPedido(ep=>({...ep,tipo:e.target.value,
                    destino:e.target.value==="local"?"LITO'S":"",clienteNombre:""}))}>
                  <option value="local">Local propio</option>
                  <option value="cliente">Cliente externo</option>
                </select>
              </div>
              {editingPedido.tipo==="local"
                ? <div>
                    <div style={{fontSize:9,color:"#64748b",fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Local</div>
                    <select style={{...inp,width:"100%"}} value={editingPedido.destino}
                      onChange={e=>setEditingPedido(ep=>({...ep,destino:e.target.value}))}>
                      {LOCALES_OPT.map(l=><option key={l}>{l}</option>)}
                    </select>
                  </div>
                : <div>
                    <div style={{fontSize:9,color:"#64748b",fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Nombre del cliente</div>
                    <input style={{...inp,width:"100%"}} value={editingPedido.clienteNombre||""}
                      onChange={e=>setEditingPedido(ep=>({...ep,clienteNombre:e.target.value}))}/>
                  </div>}
              <div>
                <div style={{fontSize:9,color:"#64748b",fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Fecha</div>
                <input type="date" style={{...inp,width:"100%"}} value={editingPedido.fecha}
                  onChange={e=>setEditingPedido(ep=>({...ep,fecha:e.target.value}))}/>
              </div>
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            {/* Buscador productos */}
            <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,overflow:"hidden",display:"flex",flexDirection:"column"}}>
              <div style={{padding:"12px 16px",borderBottom:"1px solid #e2e8f0",background:"#f8fafc"}}>
                <div style={{fontWeight:600,fontSize:13,color:"#1e293b",marginBottom:8}}>Agregar / modificar productos</div>
                <input value={editProdQ} onChange={e=>setEditProdQ(e.target.value)}
                  placeholder="🔍  Buscar producto…"
                  style={{...inp,width:"100%",boxSizing:"border-box"}}/>
              </div>
              <div style={{overflowY:"auto",maxHeight:360}}>
                {editProdFiltrado.map(s=>{
                  const enForm = editingPedido.items.find(i=>i.stockId===s.id);
                  return (
                    <div key={s.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",
                      borderBottom:"1px solid #f1f5f9",background:enForm?"#fffbeb":"transparent",
                      transition:"background .12s"}}
                      onMouseEnter={e=>{if(!enForm)e.currentTarget.style.background="#f8fafc";}}
                      onMouseLeave={e=>{if(!enForm)e.currentTarget.style.background=enForm?"#fffbeb":"transparent";}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:600,fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.producto}</div>
                        <div style={{fontSize:10,color:"#94a3b8",marginTop:2}}>stock: {s.stock} {s.unidad||"u"} · {s.deposito===1?"M.Acosta":"Cruz"}</div>
                      </div>
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        <input type="number" min="1" defaultValue={1}
                          id={`edit-cant-${s.id}`}
                          style={{...inp,width:50,padding:"3px 6px",fontSize:11,textAlign:"center"}}/>
                        <button onClick={()=>{
                            const el=document.getElementById(`edit-cant-${s.id}`);
                            editAddItem(s, el?el.value:1);
                          }}
                          style={{background:enForm?C.accent:C.green,border:"none",borderRadius:6,
                            padding:"4px 10px",color:"#fff",cursor:"pointer",fontSize:11,
                            fontFamily:"'Inter',sans-serif",fontWeight:600,whiteSpace:"nowrap"}}>
                          {enForm?"+":"Agregar"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Items actuales */}
            <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,overflow:"hidden",display:"flex",flexDirection:"column"}}>
              <div style={{padding:"12px 16px",borderBottom:"1px solid #e2e8f0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontWeight:600,fontSize:13,color:"#1e293b"}}>Productos en el pedido</span>
                <Badge color={C.accent}>{editingPedido.items.length} productos</Badge>
              </div>
              {editingPedido.items.length===0
                ? <div style={{padding:"24px",textAlign:"center",color:"#94a3b8",fontSize:12}}>Sin productos</div>
                : <div style={{flex:1,overflowY:"auto",maxHeight:290}}>
                    {editingPedido.items.map((it,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",
                        borderBottom:"1px solid #f1f5f9"}}>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:600,fontSize:12}}>{it.producto}</div>
                          <div style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}>
                            <input type="number" min="1" value={it.cantidad}
                              onChange={e=>setEditingPedido(ep=>({...ep,
                                items:ep.items.map((x,j)=>j===i?{...x,cantidad:Math.max(1,+e.target.value)}:x)}))}
                              style={{...inp,width:60,padding:"3px 6px",fontSize:12}}/>
                            <span style={{fontSize:11,color:"#94a3b8"}}>{it.unidad}</span>
                          </div>
                        </div>
                        <button onClick={()=>editRemoveItem(it.stockId)}
                          style={{background:"transparent",border:"1px solid #fecaca",color:"#dc2626",
                            cursor:"pointer",fontSize:12,borderRadius:6,padding:"3px 8px"}}>×</button>
                      </div>
                    ))}
                  </div>}
              <div style={{padding:"14px 16px",borderTop:"1px solid #e2e8f0"}}>
                <button onClick={confirmarEdicion}
                  style={{width:"100%",background:"#2563eb",color:"#fff",border:"none",borderRadius:8,
                    padding:"12px",fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:13,cursor:"pointer"}}>
                  ✓ Guardar cambios en el pedido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ANÁLISIS ── */}
      {tab==="analisis"&&(
        <div style={{display:"flex",flexDirection:"column",gap:16}}>

          {/* Botones PDF análisis */}
          <div style={{display:"flex",gap:10,padding:"14px 18px",
            background:C.panel,border:`1px solid ${C.border}`,borderRadius:10,
            alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={{fontWeight:600,fontSize:13,color:C.text,marginBottom:2}}>Reportes de análisis</div>
              <div style={{fontSize:11,color:C.textSub}}>Exportá el resumen de mercadería saliente por período</div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>pdfAnalisis("semana")}
                style={{background:"#dbeafe",color:"#1d4ed8",border:"1px solid #93c5fd",borderRadius:8,
                  padding:"8px 16px",fontFamily:"'Inter',sans-serif",fontWeight:600,fontSize:12,cursor:"pointer",
                  display:"flex",alignItems:"center",gap:6}}>
                📊 Análisis semanal
              </button>
              <button onClick={()=>pdfAnalisis("mes")}
                style={{background:"#f3e8ff",color:"#7c3aed",border:"1px solid #c4b5fd",borderRadius:8,
                  padding:"8px 16px",fontFamily:"'Inter',sans-serif",fontWeight:600,fontSize:12,cursor:"pointer",
                  display:"flex",alignItems:"center",gap:6}}>
                📅 Análisis mensual
              </button>
            </div>
          </div>

          {/* Por local */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden"}}>
            <div style={{padding:"13px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{color:C.text,fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14}}>Consumo por Local</span>
              <PDFBtn onClick={()=>exportPDF("Análisis por Local",
                analisisLocales.map(a=>({local:a.local,pedidos:a.pedidos.toString(),unidades:a.unidades.toString(),
                  top:a.topProd.map(([p,u])=>`${p} (${u}u)`).join(", ")||"—"})),
                [{key:"local",label:"Local"},{key:"pedidos",label:"Pedidos"},{key:"unidades",label:"Unidades"},{key:"top",label:"Top productos"}])}/>
            </div>
            {pedidos.filter(p=>p.tipo==="local").length===0
              ? <div style={{padding:"30px",textAlign:"center",color:C.muted,fontFamily:"'DM Mono',monospace",fontSize:11}}>Sin pedidos de locales aún.</div>
              : <>
                  <div style={{overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",minWidth:600}}>
                      <thead><tr>
                        <Th>Local</Th><Th>Pedidos</Th><Th>Unidades totales</Th><Th>Top 3 productos</Th>
                      </tr></thead>
                      <tbody>
                        {analisisLocales.filter(a=>a.pedidos>0).map((a,i)=>(
                          <tr key={a.local} {...rh}>
                            <Td>
                              <span style={{display:"flex",alignItems:"center",gap:8}}>
                                <span style={{width:10,height:10,borderRadius:"50%",background:COLORS[i%COLORS.length],display:"inline-block"}}/>
                                <strong>{a.local}</strong>
                              </span>
                            </Td>
                            <Td style={{...dm,color:C.blue,fontWeight:700}}>{a.pedidos}</Td>
                            <Td style={{...dm,color:C.green,fontWeight:700}}>{a.unidades} u.</Td>
                            <Td>
                              <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                                {a.topProd.map(([prod,u],j)=>(
                                  <span key={j} style={{background:C.bg,border:`1px solid ${C.border}`,
                                    borderRadius:4,padding:"2px 8px",fontSize:10,...dm,color:C.text}}>
                                    {prod.split(" ").slice(0,2).join(" ")} <span style={{color:C.accent,fontWeight:700}}>{u}u</span>
                                  </span>
                                ))}
                                {a.topProd.length===0&&<span style={{color:C.muted,fontSize:11}}>—</span>}
                              </div>
                            </Td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{padding:"14px 16px",borderTop:`1px solid ${C.border}`}}>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={analisisLocales.filter(a=>a.pedidos>0).map(a=>({name:a.local,unidades:a.unidades}))}>
                        <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
                        <XAxis dataKey="name" tick={{fill:C.textSub,fontSize:10}} axisLine={false} tickLine={false}/>
                        <YAxis tick={{fill:C.textSub,fontSize:9}} axisLine={false} tickLine={false}/>
                        <Tooltip contentStyle={{background:"#ffffff",border:`1px solid ${C.border}`,borderRadius:8,boxShadow:"0 4px 12px rgba(0,0,0,.1)"}} formatter={v=>[v+" u.","Unidades"]}/>
                        <Bar dataKey="unidades" name="Unidades" radius={[4,4,0,0]}>
                          {analisisLocales.filter(a=>a.pedidos>0).map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>}
          </div>

          {/* Por cliente externo */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden"}}>
            <div style={{padding:"13px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{color:C.text,fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14}}>Consumo por Cliente Externo</span>
              <PDFBtn onClick={()=>exportPDF("Análisis Clientes Externos",
                analisisClientes.map(a=>({nombre:a.nombre,pedidos:a.pedidos.toString(),unidades:a.unidades.toString(),
                  ultimo:a.ultimo,top:a.topProd.map(([p,u])=>`${p} (${u}u)`).join(", ")||"—"})),
                [{key:"nombre",label:"Cliente"},{key:"pedidos",label:"Pedidos"},{key:"unidades",label:"Unidades"},
                 {key:"ultimo",label:"Último pedido"},{key:"top",label:"Top productos"}])}/>
            </div>
            {analisisClientes.length===0
              ? <div style={{padding:"30px",textAlign:"center",color:C.muted,fontFamily:"'DM Mono',monospace",fontSize:11}}>
                  Sin clientes externos registrados aún. Cargá pedidos de tipo "Cliente externo".
                </div>
              : <>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead><tr>
                      <Th>Cliente</Th><Th>Pedidos</Th><Th>Unidades</Th><Th>Último pedido</Th><Th>Top productos</Th>
                    </tr></thead>
                    <tbody>
                      {analisisClientes.map((a,i)=>(
                        <tr key={a.nombre} {...rh}>
                          <Td>
                            <span style={{display:"flex",alignItems:"center",gap:8}}>
                              <span style={{width:10,height:10,borderRadius:"50%",background:COLORS[i%COLORS.length],display:"inline-block"}}/>
                              <strong>{a.nombre}</strong>
                            </span>
                          </Td>
                          <Td style={{...dm,color:C.blue,fontWeight:700}}>{a.pedidos}</Td>
                          <Td style={{...dm,color:C.orange,fontWeight:700}}>{a.unidades} u.</Td>
                          <Td style={{...dm,fontSize:11,color:C.muted}}>{a.ultimo}</Td>
                          <Td>
                            <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                              {a.topProd.map(([prod,u],j)=>(
                                <span key={j} style={{background:C.bg,border:`1px solid ${C.border}`,
                                  borderRadius:4,padding:"2px 8px",fontSize:10,...dm,color:C.text}}>
                                  {prod.split(" ").slice(0,2).join(" ")} <span style={{color:C.accent,fontWeight:700}}>{u}u</span>
                                </span>
                              ))}
                            </div>
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>}
          </div>
        </div>
      )}
    </div>
  );
}


// ── COSTOS ────────────────────────────────────────────────────
function ModuloCostos({isAdmin}) {
  const [productos, setProductos] = useSaved("parrillas-productos", PRODUCTOS_INIT);
  const [externas,  setExternas]  = useSaved("parrillas-externas",  COMPRAS_EXT_INIT);
  const [savedP, setSavedP] = useState(false);
  const [savedE, setSavedE] = useState(false);
  const [tab, setTab]       = useState("productos");
  const [modal, setModal]   = useState(null);
  const [modalE, setModalE] = useState(null);
  const [showNuevo,  setShowNuevo]  = useState(false);
  const [showNuevoE, setShowNuevoE] = useState(false);
  const [newP, setNewP] = useState({producto:"",compra:"0",gastos:"0",pvLocal:"0",pvMayorista:"0",costo_muerto:false});
  const [newE, setNewE] = useState({producto:"",proveedor:"",compra:"0",cantidad:"",frecuencia:"semanal"});
  const [preciosCliente, setPreciosCliente] = useSaved("parrillas-precios-cliente", []);
  const [savedPC, setSavedPC] = useState(false);
  const [showPC,  setShowPC]  = useState(false);
  const [newPC,   setNewPC]   = useState({productoId:"",precio:"",cliente:"",notas:""});
  const savePC = next => { setPreciosCliente(next); setSavedPC(true); setTimeout(()=>setSavedPC(false),2000); };


  const saveP = next => { setProductos(next); setSavedP(true); setTimeout(()=>setSavedP(false),2000); };
  const saveE = next => { setExternas(next);  setSavedE(true); setTimeout(()=>setSavedE(false),2000); };

  const costo     = p => p.compra + p.gastos;
  const margenL   = p => costo(p)>0 ? ((p.pvLocal - costo(p))/costo(p)*100).toFixed(1) : 0;
  const margenM   = p => costo(p)>0 ? ((p.pvMayorista - costo(p))/costo(p)*100).toFixed(1) : 0;

  const costoMensual = e => {
    const c = +e.compra * (+e.cantidad||1);
    if(e.frecuencia==="diaria")    return c*26;
    if(e.frecuencia==="semanal")   return c*4;
    if(e.frecuencia==="quincenal") return c*2;
    return c;
  };

  const productosActivos = productos.filter(p=>!p.costo_muerto);
  const costosMuertos    = productos.filter(p=>p.costo_muerto);
  const totalCostoExt    = externas.reduce((a,e)=>a+costoMensual(e),0);
  const totalCostoMuerto = costosMuertos.reduce((a,p)=>a+costo(p),0);

  const openEditP = p => setModal({...p,compra:String(p.compra),gastos:String(p.gastos),pvLocal:String(p.pvLocal),pvMayorista:String(p.pvMayorista),costo_muerto:p.costo_muerto});
  const saveModalP = () => {
    saveP(productos.map(p=>p.id===modal.id?{...p,...modal,compra:+modal.compra,gastos:+modal.gastos,pvLocal:+modal.pvLocal,pvMayorista:+modal.pvMayorista}:p));
    setModal(null);
  };
  const openEditE = e => setModalE({...e,compra:String(e.compra)});
  const saveModalE = () => {
    saveE(externas.map(e=>e.id===modalE.id?{...e,...modalE,compra:+modalE.compra}:e));
    setModalE(null);
  };

  const dm = {fontFamily:"'DM Mono',monospace"};
  const mon = (v,color=C.text) => <span style={{...dm,fontSize:11,color:+v>0?color:C.muted}}>{+v>0?fmt(v):"—"}</span>;
  const pct = (v,color) => <span style={{...dm,fontSize:10,color:+v>0?color:C.muted}}>{+v>0?v+"%":"—"}</span>;

  const pdfProductos = () => exportPDF("Estructura de Costos",
    productos.map(p=>({
      producto:p.producto, tipo:p.costo_muerto?"Costo muerto":"Activo",
      compra:p.compra?fmt(p.compra):"—", gastos:p.gastos?fmt(p.gastos):"—",
      costo:fmt(costo(p)), pvLocal:p.pvLocal?fmt(p.pvLocal):"—",
      margenL:p.pvLocal?margenL(p)+"%":"—",
      pvMay:p.pvMayorista?fmt(p.pvMayorista):"—",
      margenM:p.pvMayorista?margenM(p)+"%":"—",
    })),
    [{key:"producto",label:"Producto"},{key:"tipo",label:"Tipo"},
     {key:"compra",label:"Compra"},{key:"gastos",label:"Gastos"},{key:"costo",label:"Costo total"},
     {key:"pvLocal",label:"PV Local"},{key:"margenL",label:"Margen L"},
     {key:"pvMay",label:"PV Mayorista"},{key:"margenM",label:"Margen M"}]);

  const pdfExternas = () => exportPDF("Compras Externas",
    externas.map(e=>({
      producto:e.producto, proveedor:e.proveedor||"—", compra:fmt(e.compra),
      cantidad:e.cantidad||"—", frecuencia:e.frecuencia, costoMes:fmt(costoMensual(e))})),
    [{key:"producto",label:"Producto"},{key:"proveedor",label:"Proveedor"},
     {key:"compra",label:"Precio compra"},{key:"cantidad",label:"Cantidad hab."},
     {key:"frecuencia",label:"Frecuencia"},{key:"costoMes",label:"Costo/mes est."}]);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>

      {modal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center"}}
          onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:12,
            padding:"28px",width:520,maxWidth:"95vw",display:"flex",flexDirection:"column",gap:18,
            boxShadow:"0 20px 60px rgba(0,0,0,.7)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{color:C.text,fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:16}}>{modal.producto}</span>
              <button onClick={()=>setModal(null)} style={{background:"transparent",border:"none",color:C.muted,cursor:"pointer",fontSize:20}}>x</button>
            </div>
            <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
              <input type="checkbox" checked={!!modal.costo_muerto}
                onChange={e=>setModal(m=>({...m,costo_muerto:e.target.checked}))}
                style={{width:16,height:16,accentColor:C.orange}}/>
              <span style={{color:C.textSub,fontSize:12}}>Es <strong style={{color:C.orange}}>costo muerto</strong> (consumo interno, no genera margen directo)</span>
            </label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              {[["P. Compra ($)","compra"],["Gastos adicionales ($)","gastos"]].map(([l,k])=>(
                <div key={k}>
                  <div style={{color:C.textSub,fontSize:10,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>{l}</div>
                  <input type="number" style={{...inp,width:"100%"}} value={modal[k]} onChange={e=>setModal(m=>({...m,[k]:e.target.value}))}/>
                </div>
              ))}
            </div>
            {!modal.costo_muerto&&(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                {[["Precio venta a locales ($)","pvLocal"],["Precio venta mayorista ($)","pvMayorista"]].map(([l,k])=>(
                  <div key={k}>
                    <div style={{color:C.textSub,fontSize:10,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>{l}</div>
                    <input type="number" style={{...inp,width:"100%"}} value={modal[k]} onChange={e=>setModal(m=>({...m,[k]:e.target.value}))}/>
                  </div>
                ))}
              </div>
            )}
            {!modal.costo_muerto&&(+modal.compra>0)&&(
              <div style={{background:C.bg,borderRadius:7,padding:"12px 14px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <div style={{color:C.textSub,fontSize:10,fontFamily:"'DM Mono',monospace",marginBottom:3}}>MARGEN LOCAL</div>
                  <div style={{color:C.green,fontFamily:"'DM Mono',monospace",fontWeight:700,fontSize:14}}>
                    {+modal.pvLocal>0?(((+modal.pvLocal-(+modal.compra+ +modal.gastos))/(+modal.compra+ +modal.gastos))*100).toFixed(1)+"%":"—"}
                  </div>
                </div>
                <div>
                  <div style={{color:C.textSub,fontSize:10,fontFamily:"'DM Mono',monospace",marginBottom:3}}>MARGEN MAYORISTA</div>
                  <div style={{color:C.accent,fontFamily:"'DM Mono',monospace",fontWeight:700,fontSize:14}}>
                    {+modal.pvMayorista>0?(((+modal.pvMayorista-(+modal.compra+ +modal.gastos))/(+modal.compra+ +modal.gastos))*100).toFixed(1)+"%":"—"}
                  </div>
                </div>
              </div>
            )}
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button onClick={()=>setModal(null)} style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:7,padding:"9px 20px",color:C.textSub,cursor:"pointer",fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:13}}>Cancelar</button>
              <button onClick={saveModalP} style={{background:C.accent,border:"none",borderRadius:7,padding:"9px 20px",color:C.bg,cursor:"pointer",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:13}}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {modalE&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center"}}
          onClick={e=>e.target===e.currentTarget&&setModalE(null)}>
          <div style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:12,
            padding:"28px",width:460,maxWidth:"95vw",display:"flex",flexDirection:"column",gap:16,
            boxShadow:"0 20px 60px rgba(0,0,0,.7)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{color:C.text,fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:16}}>Editar compra externa</span>
              <button onClick={()=>setModalE(null)} style={{background:"transparent",border:"none",color:C.muted,cursor:"pointer",fontSize:20}}>x</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              {[["Producto","producto","text"],["Proveedor","proveedor","text"],["Precio compra ($)","compra","number"],["Cantidad habitual","cantidad","text"]].map(([l,k,t])=>(
                <div key={k}>
                  <div style={{color:C.textSub,fontSize:10,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>{l}</div>
                  <input type={t} style={{...inp,width:"100%"}} value={modalE[k]||""} onChange={e=>setModalE(m=>({...m,[k]:e.target.value}))}/>
                </div>
              ))}
              <div style={{gridColumn:"1/-1"}}>
                <div style={{color:C.textSub,fontSize:10,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>Frecuencia de compra</div>
                <select style={{...inp,width:"100%"}} value={modalE.frecuencia} onChange={e=>setModalE(m=>({...m,frecuencia:e.target.value}))}>
                  {["diaria","semanal","quincenal","mensual"].map(f=><option key={f}>{f}</option>)}
                </select>
              </div>
            </div>
            <div style={{background:C.bg,borderRadius:7,padding:"10px 14px",fontFamily:"'DM Mono',monospace",fontSize:11,color:C.textSub}}>
              Costo mensual estimado: <strong style={{color:C.orange,fontSize:13}}>{fmt(costoMensual({...modalE,compra:+modalE.compra}))}</strong>
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button onClick={()=>setModalE(null)} style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:7,padding:"9px 20px",color:C.textSub,cursor:"pointer",fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:13}}>Cancelar</button>
              <button onClick={saveModalE} style={{background:C.accent,border:"none",borderRadius:7,padding:"9px 20px",color:C.bg,cursor:"pointer",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:13}}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      <div style={{display:"flex",gap:8}}>
        <TabBtn active={tab==="productos"} onClick={()=>setTab("productos")}>Productos propios</TabBtn>
        <TabBtn active={tab==="externas"} onClick={()=>setTab("externas")} color={C.purple}>Compras externas</TabBtn>
        <TabBtn active={tab==="resumen"} onClick={()=>setTab("resumen")} color={C.blue}>Resumen</TabBtn>
        <TabBtn active={tab==="precios"} onClick={()=>setTab("precios")} color={C.orange}>💰 Precios por cliente</TabBtn>
      </div>

      {tab==="productos"&&(
        <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
            <KPI label="Productos activos" value={productosActivos.length.toString()} sub="Con precios de venta"/>
            <KPI label="Costos muertos" value={costosMuertos.length.toString()} sub="Aderezos, papeleria, etc." color={C.orange}/>
            <KPI label="Mayor margen local" value={productosActivos.filter(p=>p.pvLocal>0).length>0?Math.max(...productosActivos.filter(p=>p.pvLocal>0).map(p=>+margenL(p))).toFixed(1)+"%":"—"} sub="Sobre costo" color={C.green}/>
            <KPI label="Mayor margen mayorista" value={productosActivos.filter(p=>p.pvMayorista>0).length>0?Math.max(...productosActivos.filter(p=>p.pvMayorista>0).map(p=>+margenM(p))).toFixed(1)+"%":"—"} sub="Sobre costo" color={C.accent}/>
          </div>
          <div style={{background:C.accent+"10",border:`1px solid ${C.accent}30`,borderRadius:8,padding:"10px 14px",display:"flex",gap:10,alignItems:"center"}}>
            <span>💡</span>
            <span style={{color:C.textSub,fontSize:11}}>
              Cada producto puede tener precio diferente para locales y para clientes mayoristas.
              Marca <strong style={{color:C.orange}}>Costo muerto</strong> a aderezos y papeleria (consumo interno sin margen directo).
            </span>
          </div>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",borderBottom:`1px solid ${C.border}`}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{color:C.text,fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14}}>Productos del Stock Propio</span>
                <Saved show={savedP}/>
              </div>
              <div style={{display:"flex",gap:8}}>
                <PDFBtn onClick={pdfProductos}/>
                {isAdmin&&<button onClick={()=>setShowNuevo(!showNuevo)} style={{background:C.accent,color:C.bg,border:"none",borderRadius:6,padding:"5px 12px",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:11,cursor:"pointer"}}>{showNuevo?"Cancelar":"+ Producto"}</button>}
              </div>
            </div>
            {isAdmin&&showNuevo&&(
              <div style={{padding:"14px 16px",borderBottom:`1px solid ${C.border}`,display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr auto",gap:8,alignItems:"end",background:C.bg}}>
                {[["Nombre del producto","producto","text"],["P. Compra","compra","number"],["Gastos","gastos","number"],["PV Local","pvLocal","number"],["PV Mayorista","pvMayorista","number"]].map(([l,k,t])=>(
                  <div key={k}>
                    <div style={{color:C.textSub,fontSize:9,marginBottom:3}}>{l}</div>
                    <input type={t} style={{...inp,width:"100%"}} value={newP[k]} onChange={e=>setNewP(v=>({...v,[k]:e.target.value}))}/>
                  </div>
                ))}
                <SmBtn onClick={()=>{
                  if(!newP.producto)return;
                  saveP([...productos,{id:Date.now(),...newP,compra:+newP.compra,gastos:+newP.gastos,pvLocal:+newP.pvLocal,pvMayorista:+newP.pvMayorista,costo_muerto:false}]);
                  setNewP({producto:"",compra:"0",gastos:"0",pvLocal:"0",pvMayorista:"0",costo_muerto:false});
                  setShowNuevo(false);
                }}>OK</SmBtn>
              </div>
            )}
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",minWidth:780}}>
                <thead><tr>
                  <Th>Producto</Th><Th>Tipo</Th><Th>P. Compra</Th><Th>Gastos</Th><Th>Costo total</Th>
                  <Th>PV Local</Th><Th>Margen L</Th><Th>PV Mayorista</Th><Th>Margen M</Th>
                  {isAdmin&&<Th></Th>}
                </tr></thead>
                <tbody>
                  {productos.map(p=>(
                    <tr key={p.id} {...rh}>
                      <Td><strong style={{fontSize:11}}>{p.producto}</strong></Td>
                      <Td>{p.costo_muerto?<Badge color={C.orange}>Costo muerto</Badge>:<Badge color={C.green}>Activo</Badge>}</Td>
                      <Td>{mon(p.compra)}</Td>
                      <Td>{mon(p.gastos)}</Td>
                      <Td style={{fontFamily:"'DM Mono',monospace",fontSize:11,fontWeight:600}}>{costo(p)>0?fmt(costo(p)):"—"}</Td>
                      <Td>{p.costo_muerto?<span style={{color:C.muted,fontSize:11}}>N/A</span>:mon(p.pvLocal,C.blue)}</Td>
                      <Td>{p.costo_muerto?<span style={{color:C.muted,fontSize:11}}>N/A</span>:pct(margenL(p),C.green)}</Td>
                      <Td>{p.costo_muerto?<span style={{color:C.muted,fontSize:11}}>N/A</span>:mon(p.pvMayorista,C.accent)}</Td>
                      <Td>{p.costo_muerto?<span style={{color:C.muted,fontSize:11}}>N/A</span>:pct(margenM(p),C.accent)}</Td>
                      {isAdmin&&<Td>
                        <span style={{display:"flex",gap:4}}>
                          <GhBtn onClick={()=>openEditP(p)}>Editar</GhBtn>
                          <button onClick={()=>saveP(productos.filter(x=>x.id!==p.id))} style={{background:"transparent",border:"none",color:C.red,cursor:"pointer",fontSize:12,opacity:.5}}>x</button>
                        </span>
                      </Td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab==="externas"&&(
        <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
            <KPI label="Productos externos" value={externas.length.toString()} sub="De otros proveedores"/>
            <KPI label="Costo mensual estimado" value={fmt(totalCostoExt)} sub="Suma todas las frecuencias" color={C.purple}/>
            <KPI label="Costo anual estimado" value={fmt(totalCostoExt*12)} sub="Proyeccion 12 meses" color={C.orange}/>
          </div>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",borderBottom:`1px solid ${C.border}`}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{color:C.text,fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14}}>Compras a Proveedores Externos</span>
                <Saved show={savedE}/>
              </div>
              <div style={{display:"flex",gap:8}}>
                <PDFBtn onClick={pdfExternas}/>
                {isAdmin&&<button onClick={()=>setShowNuevoE(!showNuevoE)} style={{background:C.accent,color:C.bg,border:"none",borderRadius:6,padding:"5px 12px",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:11,cursor:"pointer"}}>{showNuevoE?"Cancelar":"+ Compra"}</button>}
              </div>
            </div>
            {isAdmin&&showNuevoE&&(
              <div style={{padding:"14px 16px",borderBottom:`1px solid ${C.border}`,display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr auto",gap:8,alignItems:"end",background:C.bg}}>
                {[["Producto","producto","text"],["Proveedor","proveedor","text"],["Precio compra ($)","compra","number"],["Cantidad habitual","cantidad","text"]].map(([l,k,t])=>(
                  <div key={k}>
                    <div style={{color:C.textSub,fontSize:9,marginBottom:3}}>{l}</div>
                    <input type={t} style={{...inp,width:"100%"}} value={newE[k]} onChange={e=>setNewE(v=>({...v,[k]:e.target.value}))}/>
                  </div>
                ))}
                <div>
                  <div style={{color:C.textSub,fontSize:9,marginBottom:3}}>Frecuencia</div>
                  <select style={{...inp,width:"100%"}} value={newE.frecuencia} onChange={e=>setNewE(v=>({...v,frecuencia:e.target.value}))}>
                    {["diaria","semanal","quincenal","mensual"].map(f=><option key={f}>{f}</option>)}
                  </select>
                </div>
                <SmBtn onClick={()=>{
                  if(!newE.producto)return;
                  saveE([...externas,{id:Date.now(),...newE,compra:+newE.compra}]);
                  setNewE({producto:"",proveedor:"",compra:"0",cantidad:"",frecuencia:"semanal"});
                  setShowNuevoE(false);
                }}>OK</SmBtn>
              </div>
            )}
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr>
                <Th>Producto</Th><Th>Proveedor</Th><Th>Precio compra</Th>
                <Th>Cantidad hab.</Th><Th>Frecuencia</Th><Th>Costo/mes est.</Th>
                {isAdmin&&<Th></Th>}
              </tr></thead>
              <tbody>
                {externas.length===0&&<tr><Td colSpan={7} style={{color:C.muted,textAlign:"center",padding:20}}>Sin compras externas. Agrega verdura, garrafas, pan frances y otros.</Td></tr>}
                {externas.map(e=>(
                  <tr key={e.id} {...rh}>
                    <Td><strong>{e.producto}</strong></Td>
                    <Td style={{color:C.textSub,fontSize:11}}>{e.proveedor||"—"}</Td>
                    <Td>{mon(e.compra)}</Td>
                    <Td style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:C.textSub}}>{e.cantidad||"—"}</Td>
                    <Td><Badge color={C.purple}>{e.frecuencia}</Badge></Td>
                    <Td style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:C.orange,fontWeight:700}}>{fmt(costoMensual(e))}</Td>
                    {isAdmin&&<Td>
                      <span style={{display:"flex",gap:4}}>
                        <GhBtn onClick={()=>openEditE(e)}>Editar</GhBtn>
                        <button onClick={()=>saveE(externas.filter(x=>x.id!==e.id))} style={{background:"transparent",border:"none",color:C.red,cursor:"pointer",fontSize:12,opacity:.5}}>x</button>
                      </span>
                    </Td>}
                  </tr>
                ))}
                {externas.length>0&&(
                  <tr style={{background:C.bg}}>
                    <Td colSpan={5} style={{fontWeight:700,color:C.textSub,fontSize:11}}>TOTAL MENSUAL ESTIMADO</Td>
                    <Td style={{fontFamily:"'DM Mono',monospace",fontSize:14,color:C.orange,fontWeight:800}}>{fmt(totalCostoExt)}</Td>
                    {isAdmin&&<Td/>}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab==="resumen"&&(
        <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
            <KPI label="Costo compras externas/mes" value={fmt(totalCostoExt)} sub="Verdura, garrafas, pan, etc." color={C.purple}/>
            <KPI label="Costo muerto stock" value={fmt(totalCostoMuerto)} sub="Aderezos, papeleria (referencial)" color={C.orange}/>
            <KPI label="Productos con margen cargado" value={productosActivos.filter(p=>p.pvLocal>0||p.pvMayorista>0).length.toString()} sub={"de "+productosActivos.length+" activos"} color={C.green}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
              <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`}}>
                <span style={{color:C.text,fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:13}}>Margenes por Producto - Local</span>
              </div>
              {productosActivos.filter(p=>p.pvLocal>0).length===0
                ? <div style={{padding:"30px",textAlign:"center",color:C.muted,fontFamily:"'DM Mono',monospace",fontSize:11}}>Carga precios de venta local en la pestana Productos</div>
                : <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={productosActivos.filter(p=>p.pvLocal>0).map(p=>({name:p.producto.split(" ")[0],margen:+margenL(p)}))} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
                      <XAxis type="number" tick={{fill:C.textSub,fontSize:9}} axisLine={false} tickLine={false} unit="%"/>
                      <YAxis type="category" dataKey="name" width={80} tick={{fill:C.text,fontSize:10}} axisLine={false} tickLine={false}/>
                      <Tooltip formatter={v=>[v+"%","Margen local"]} contentStyle={{background:"#ffffff",border:`1px solid ${C.border}`,borderRadius:8,boxShadow:"0 4px 12px rgba(0,0,0,.1)"}}/>
                      <Bar dataKey="margen" fill={C.blue} radius={[0,4,4,0]}/>
                    </BarChart>
                  </ResponsiveContainer>}
            </div>
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
              <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`}}>
                <span style={{color:C.text,fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:13}}>Margenes por Producto - Mayorista</span>
              </div>
              {productosActivos.filter(p=>p.pvMayorista>0).length===0
                ? <div style={{padding:"30px",textAlign:"center",color:C.muted,fontFamily:"'DM Mono',monospace",fontSize:11}}>Carga precios mayoristas en la pestana Productos</div>
                : <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={productosActivos.filter(p=>p.pvMayorista>0).map(p=>({name:p.producto.split(" ")[0],margen:+margenM(p)}))} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
                      <XAxis type="number" tick={{fill:C.textSub,fontSize:9}} axisLine={false} tickLine={false} unit="%"/>
                      <YAxis type="category" dataKey="name" width={80} tick={{fill:C.text,fontSize:10}} axisLine={false} tickLine={false}/>
                      <Tooltip formatter={v=>[v+"%","Margen mayorista"]} contentStyle={{background:"#ffffff",border:`1px solid ${C.border}`,borderRadius:8,boxShadow:"0 4px 12px rgba(0,0,0,.1)"}}/>
                      <Bar dataKey="margen" fill={C.accent} radius={[0,4,4,0]}/>
                    </BarChart>
                  </ResponsiveContainer>}
            </div>
          </div>
          {costosMuertos.length>0&&(
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
              <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`}}>
                <span style={{color:C.text,fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:13}}>Costos Muertos (consumo interno)</span>
              </div>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr><Th>Producto</Th><Th>P. Compra</Th><Th>Gastos</Th><Th>Costo unitario</Th></tr></thead>
                <tbody>
                  {costosMuertos.map(p=>(
                    <tr key={p.id} {...rh}>
                      <Td><strong>{p.producto}</strong></Td>
                      <Td>{mon(p.compra)}</Td>
                      <Td>{mon(p.gastos)}</Td>
                      <Td style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:C.orange,fontWeight:600}}>{costo(p)>0?fmt(costo(p)):"Sin costo cargado"}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}


// ── PROVEEDORES ───────────────────────────────────────────────
// Estructura de cada proveedor:
// { id, nombre, vencimiento ("sin vencimiento" | fecha), estado,
//   entregas: [{id, fecha, monto, descripcion}],
//   pagos:    [{id, fecha, monto, nota}] }
// saldo = sum(entregas.monto) - sum(pagos.monto)

function calcSaldo(p) {
  const totalEntregas = (p.entregas||[]).reduce((a,e)=>a+e.monto,0);
  const totalPagos    = (p.pagos||[]).reduce((a,pg)=>a+pg.monto,0);
  return Math.max(0, totalEntregas - totalPagos);
}

function calcEstado(p) {
  const saldo = calcSaldo(p);
  if(saldo===0) return "pagado";
  if(p.vencimiento && p.vencimiento!=="sin vencimiento" && p.vencimiento < new Date().toISOString().slice(0,10)) return "vencido";
  return "vigente";
}

function ModuloProveedores({isAdmin}) {
  const [provs, setProvs] = useSaved("parrillas-proveedores", []);
  const [saved, setSaved] = useState(false);
  const [tab, setTab]     = useState("lista");     // lista | detalle
  const [provSel, setProvSel] = useState(null);    // id del proveedor en detalle
  const [showNuevo, setShowNuevo] = useState(false);
  const [formNuevo, setFormNuevo] = useState({nombre:"", vencimiento:"", sinVenc:false});
  // Modales de movimiento
  const [modalMov, setModalMov] = useState(null);  // {tipo:"entrega"|"pago", provId}
  const [formMov, setFormMov]   = useState({monto:"", fecha:new Date().toISOString().slice(0,10), desc:""});

  const doSave = next => { setProvs(next); setSaved(true); setTimeout(()=>setSaved(false),2000); };
  const ec = e => e==="pagado"?C.green:e==="vencido"?C.red:C.accent;

  // Agregar proveedor
  const agregarProv = () => {
    if(!formNuevo.nombre) return;
    const venc = formNuevo.sinVenc ? "sin vencimiento" : (formNuevo.vencimiento||"sin vencimiento");
    doSave([...provs,{id:Date.now(),nombre:formNuevo.nombre,vencimiento:venc,
      entregas:[], pagos:[]}]);
    setFormNuevo({nombre:"",vencimiento:"",sinVenc:false});
    setShowNuevo(false);
  };

  // Agregar movimiento (entrega o pago)
  const agregarMov = () => {
    if(!formMov.monto||+formMov.monto<=0) return;
    const {tipo, provId} = modalMov;
    const mov = {id:Date.now(), monto:+formMov.monto, fecha:formMov.fecha, desc:formMov.desc};
    doSave(provs.map(p=>{
      if(p.id!==provId) return p;
      if(tipo==="entrega") return {...p, entregas:[...(p.entregas||[]),mov]};
      return {...p, pagos:[...(p.pagos||[]),mov]};
    }));
    setModalMov(null);
    setFormMov({monto:"", fecha:new Date().toISOString().slice(0,10), desc:""});
  };

  // Eliminar movimiento
  const eliminarMov = (provId, tipo, movId) => {
    doSave(provs.map(p=>{
      if(p.id!==provId) return p;
      if(tipo==="entrega") return {...p, entregas:(p.entregas||[]).filter(e=>e.id!==movId)};
      return {...p, pagos:(p.pagos||[]).filter(pg=>pg.id!==movId)};
    }));
  };

  const provsConSaldo = provs.map(p=>({...p, saldo:calcSaldo(p), estado:calcEstado(p)}));
  const totalDeuda    = provsConSaldo.reduce((a,p)=>a+p.saldo,0);
  const vencidos      = provsConSaldo.filter(p=>p.estado==="vencido");
  const provDetalleData = provSel ? provsConSaldo.find(p=>p.id===provSel) : null;

  const dm = {fontFamily:"'DM Mono',monospace"};

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>

      {/* Modal movimiento */}
      {modalMov&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:999,
          display:"flex",alignItems:"center",justifyContent:"center"}}
          onClick={e=>e.target===e.currentTarget&&setModalMov(null)}>
          <div style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:14,
            padding:"28px",width:420,display:"flex",flexDirection:"column",gap:16,
            boxShadow:"0 20px 60px rgba(0,0,0,.15)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontWeight:700,fontSize:16,color:C.text}}>
                  {modalMov.tipo==="entrega"?"📦 Registrar entrega":"💸 Registrar pago"}
                </div>
                <div style={{fontSize:12,color:C.textSub,marginTop:2}}>
                  {provsConSaldo.find(p=>p.id===modalMov.provId)?.nombre}
                </div>
              </div>
              <button onClick={()=>setModalMov(null)}
                style={{background:"transparent",border:"none",color:C.muted,cursor:"pointer",fontSize:20}}>×</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div>
                <div style={{fontSize:10,color:C.textSub,...dm,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>
                  {modalMov.tipo==="entrega"?"Monto entregado ($)":"Monto pagado ($)"}
                </div>
                <input type="number" autoFocus style={{...inp,width:"100%"}}
                  value={formMov.monto} onChange={e=>setFormMov(v=>({...v,monto:e.target.value}))}
                  placeholder="0"/>
              </div>
              <div>
                <div style={{fontSize:10,color:C.textSub,...dm,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>Fecha</div>
                <input type="date" style={{...inp,width:"100%"}}
                  value={formMov.fecha} onChange={e=>setFormMov(v=>({...v,fecha:e.target.value}))}/>
              </div>
              <div style={{gridColumn:"1/-1"}}>
                <div style={{fontSize:10,color:C.textSub,...dm,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>
                  {modalMov.tipo==="entrega"?"Descripción (factura, producto…)":"Nota (transferencia, cheque…)"}
                </div>
                <input style={{...inp,width:"100%"}} value={formMov.desc}
                  onChange={e=>setFormMov(v=>({...v,desc:e.target.value}))}
                  placeholder="Opcional…"/>
              </div>
            </div>
            {/* Preview saldo */}
            {formMov.monto&&+formMov.monto>0&&(()=>{
              const prov = provsConSaldo.find(p=>p.id===modalMov.provId);
              if(!prov) return null;
              const nuevoSaldo = modalMov.tipo==="entrega"
                ? prov.saldo + (+formMov.monto)
                : Math.max(0, prov.saldo - (+formMov.monto));
              return (
                <div style={{background:"#f8fafc",border:`1px solid ${C.border}`,borderRadius:8,
                  padding:"10px 14px",display:"flex",justifyContent:"space-between",fontSize:12}}>
                  <span style={{color:C.textSub}}>Saldo actual: <strong>{fmt(prov.saldo)}</strong></span>
                  <span style={{color:nuevoSaldo>prov.saldo?C.red:C.green,fontWeight:700}}>
                    → Nuevo saldo: {fmt(nuevoSaldo)}
                  </span>
                </div>
              );
            })()}
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button onClick={()=>setModalMov(null)}
                style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:8,
                  padding:"9px 20px",color:C.textSub,cursor:"pointer",
                  fontFamily:"'Inter',sans-serif",fontWeight:600,fontSize:13}}>Cancelar</button>
              <button onClick={agregarMov}
                style={{background:modalMov.tipo==="entrega"?C.red:C.green,border:"none",borderRadius:8,
                  padding:"9px 20px",color:"#fff",cursor:"pointer",
                  fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:13}}>
                {modalMov.tipo==="entrega"?"Registrar entrega":"Registrar pago"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        <KPI label="Deuda total" value={provsConSaldo.length?fmt(totalDeuda):"—"} sub={`${provs.length} proveedores`} color={C.red}/>
        <KPI label="Cuentas vencidas" value={vencidos.length.toString()} sub={vencidos.map(v=>v.nombre.split(" ")[0]).join(", ")||"Ninguna"} color={vencidos.length>0?C.red:C.green}/>
        <KPI label="Saldadas" value={provsConSaldo.filter(p=>p.estado==="pagado").length.toString()} sub="Al día" color={C.green}/>
        <KPI label="Vigentes con deuda" value={provsConSaldo.filter(p=>p.estado==="vigente"&&p.saldo>0).length.toString()} sub="En curso" color={C.accent}/>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:8,alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",gap:8}}>
          <TabBtn active={tab==="lista"} onClick={()=>{setTab("lista");setProvSel(null);}}>📋 Cuentas corrientes</TabBtn>
          {provDetalleData&&<TabBtn active={tab==="detalle"} onClick={()=>setTab("detalle")} color={C.blue}>📊 {provDetalleData.nombre}</TabBtn>}
        </div>
        <div style={{display:"flex",gap:8}}>
          <PDFBtn onClick={()=>exportPDF("Estado de Cuentas",
            provsConSaldo.map(p=>({nombre:p.nombre,saldo:p.saldo>0?fmt(p.saldo):"Saldado",
              entregas:fmt((p.entregas||[]).reduce((a,e)=>a+e.monto,0)),
              pagos:fmt((p.pagos||[]).reduce((a,pg)=>a+pg.monto,0)),
              vencimiento:p.vencimiento||"—",estado:p.estado})),
            [{key:"nombre",label:"Proveedor"},{key:"entregas",label:"Total entregas"},
             {key:"pagos",label:"Total pagos"},{key:"saldo",label:"Saldo actual"},
             {key:"vencimiento",label:"Vencimiento"},{key:"estado",label:"Estado"}])}/>
          {isAdmin&&<button onClick={()=>setShowNuevo(!showNuevo)}
            style={{background:C.accent,color:"#fff",border:"none",borderRadius:7,
              padding:"6px 14px",fontFamily:"'Inter',sans-serif",fontWeight:600,fontSize:12,cursor:"pointer"}}>
            {showNuevo?"Cancelar":"+ Proveedor"}
          </button>}
        </div>
      </div>

      {/* Formulario nuevo proveedor */}
      {isAdmin&&showNuevo&&(
        <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:10,padding:"16px"}}>
          <div style={{fontWeight:600,fontSize:13,color:C.text,marginBottom:12}}>Nuevo proveedor</div>
          <div style={{display:"flex",gap:12,alignItems:"flex-end",flexWrap:"wrap"}}>
            <div style={{flex:2,minWidth:180}}>
              <div style={{fontSize:10,color:C.textSub,...dm,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>Nombre</div>
              <input style={{...inp,width:"100%"}} value={formNuevo.nombre}
                onChange={e=>setFormNuevo(v=>({...v,nombre:e.target.value}))}
                placeholder="Nombre del proveedor…"/>
            </div>
            {!formNuevo.sinVenc&&(
              <div>
                <div style={{fontSize:10,color:C.textSub,...dm,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>Vencimiento</div>
                <input type="date" style={{...inp}} value={formNuevo.vencimiento}
                  onChange={e=>setFormNuevo(v=>({...v,vencimiento:e.target.value}))}/>
              </div>
            )}
            <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:12,color:C.textSub,paddingBottom:2}}>
              <input type="checkbox" checked={formNuevo.sinVenc}
                onChange={e=>setFormNuevo(v=>({...v,sinVenc:e.target.checked,vencimiento:""}))}
                style={{width:15,height:15,accentColor:C.accent}}/>
              Sin vencimiento
            </label>
            <button onClick={agregarProv}
              style={{background:C.green,border:"none",borderRadius:8,padding:"9px 20px",
                color:"#fff",cursor:"pointer",fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:13}}>
              Guardar
            </button>
          </div>
        </div>
      )}

      {/* ── LISTA DE PROVEEDORES ── */}
      {tab==="lista"&&(
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden"}}>
          {provsConSaldo.length===0
            ? <div style={{padding:"40px",textAlign:"center",color:C.muted,...dm,fontSize:11}}>
                {isAdmin?"Sin proveedores. Usá \"+ Proveedor\" para agregar el primero.":"Sin proveedores cargados aún."}
              </div>
            : <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr>
                  <Th>Proveedor</Th><Th>Total entregas</Th><Th>Total pagado</Th>
                  <Th>Saldo actual</Th><Th>Vencimiento</Th><Th>Estado</Th>
                  {isAdmin&&<Th>Acciones</Th>}
                  <Th></Th>
                </tr></thead>
                <tbody>
                  {provsConSaldo.map(p=>(
                    <tr key={p.id} style={{cursor:"pointer"}}
                      onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <Td>
                        <button onClick={()=>{setProvSel(p.id);setTab("detalle");}}
                          style={{background:"transparent",border:"none",cursor:"pointer",
                            fontWeight:700,color:C.blue,textDecoration:"underline",
                            fontSize:13,padding:0,fontFamily:"'Inter',sans-serif"}}>
                          {p.nombre}
                        </button>
                      </Td>
                      <Td style={{...dm,fontSize:11,color:C.red}}>
                        {(p.entregas||[]).length>0?fmt((p.entregas||[]).reduce((a,e)=>a+e.monto,0)):"—"}
                        <span style={{color:C.muted,marginLeft:4,fontSize:9}}>{(p.entregas||[]).length} movs.</span>
                      </Td>
                      <Td style={{...dm,fontSize:11,color:C.green}}>
                        {(p.pagos||[]).length>0?fmt((p.pagos||[]).reduce((a,pg)=>a+pg.monto,0)):"—"}
                        <span style={{color:C.muted,marginLeft:4,fontSize:9}}>{(p.pagos||[]).length} pagos</span>
                      </Td>
                      <Td style={{...dm,fontWeight:700,fontSize:14,color:p.saldo>0?C.red:C.green}}>
                        {p.saldo>0?fmt(p.saldo):"Saldado"}
                      </Td>
                      <Td style={{...dm,fontSize:11,color:C.textSub}}>
                        {p.vencimiento==="sin vencimiento"
                          ? <Badge color={C.muted}>Sin vencimiento</Badge>
                          : p.vencimiento||"—"}
                      </Td>
                      <Td><Badge color={ec(p.estado)}>{p.estado}</Badge></Td>
                      {isAdmin&&<Td>
                        <div style={{display:"flex",gap:6}}>
                          <button onClick={()=>setModalMov({tipo:"entrega",provId:p.id})}
                            style={{background:"#fee2e2",color:"#dc2626",border:"1px solid #fca5a5",
                              borderRadius:6,padding:"4px 10px",fontSize:11,cursor:"pointer",
                              fontFamily:"'Inter',sans-serif",fontWeight:500}}>
                            + Entrega
                          </button>
                          <button onClick={()=>setModalMov({tipo:"pago",provId:p.id})}
                            style={{background:"#dcfce7",color:"#16a34a",border:"1px solid #86efac",
                              borderRadius:6,padding:"4px 10px",fontSize:11,cursor:"pointer",
                              fontFamily:"'Inter',sans-serif",fontWeight:500}}>
                            + Pago
                          </button>
                        </div>
                      </Td>}
                      <Td>
                        <div style={{display:"flex",gap:4}}>
                          <GhBtn onClick={()=>{setProvSel(p.id);setTab("detalle");}}>Ver detalle</GhBtn>
                          {isAdmin&&<button onClick={()=>doSave(provs.filter(x=>x.id!==p.id))}
                            style={{background:"transparent",border:"none",color:C.red,cursor:"pointer",fontSize:13,opacity:.4}}>×</button>}
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>}
        </div>
      )}

      {/* ── DETALLE DE PROVEEDOR ── */}
      {tab==="detalle"&&provDetalleData&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {/* Header */}
          <div style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:10,
            padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontWeight:800,fontSize:18,color:C.blue}}>{provDetalleData.nombre}</div>
              <div style={{fontSize:12,color:"#3b82f6",marginTop:3,...dm}}>
                Vencimiento: {provDetalleData.vencimiento==="sin vencimiento"?"Sin vencimiento":provDetalleData.vencimiento||"—"}
                {" · "}<Badge color={ec(provDetalleData.estado)}>{provDetalleData.estado}</Badge>
              </div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:11,color:C.textSub,marginBottom:4,...dm}}>SALDO ACTUAL</div>
              <div style={{fontSize:28,fontWeight:800,...dm,color:provDetalleData.saldo>0?C.red:C.green}}>
                {provDetalleData.saldo>0?fmt(provDetalleData.saldo):"✓ Saldado"}
              </div>
            </div>
          </div>

          {/* Resumen */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
            <KPI label="Total entregas"
              value={fmt((provDetalleData.entregas||[]).reduce((a,e)=>a+e.monto,0))}
              sub={`${(provDetalleData.entregas||[]).length} movimientos`} color={C.red}/>
            <KPI label="Total pagado"
              value={fmt((provDetalleData.pagos||[]).reduce((a,pg)=>a+pg.monto,0))}
              sub={`${(provDetalleData.pagos||[]).length} pagos`} color={C.green}/>
            <KPI label="Saldo pendiente"
              value={provDetalleData.saldo>0?fmt(provDetalleData.saldo):"Saldado"}
              color={provDetalleData.saldo>0?C.red:C.green}/>
          </div>

          {isAdmin&&(
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setModalMov({tipo:"entrega",provId:provDetalleData.id})}
                style={{background:"#fee2e2",color:"#dc2626",border:"1px solid #fca5a5",
                  borderRadius:8,padding:"9px 20px",fontSize:13,cursor:"pointer",
                  fontFamily:"'Inter',sans-serif",fontWeight:600,display:"flex",alignItems:"center",gap:6}}>
                📦 Registrar nueva entrega
              </button>
              <button onClick={()=>setModalMov({tipo:"pago",provId:provDetalleData.id})}
                style={{background:"#dcfce7",color:"#16a34a",border:"1px solid #86efac",
                  borderRadius:8,padding:"9px 20px",fontSize:13,cursor:"pointer",
                  fontFamily:"'Inter',sans-serif",fontWeight:600,display:"flex",alignItems:"center",gap:6}}>
                💸 Registrar pago
              </button>
            </div>
          )}

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            {/* Entregas */}
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden"}}>
              <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,
                display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontWeight:700,fontSize:13,color:C.red}}>📦 Historial de entregas</span>
                <Badge color={C.red}>{(provDetalleData.entregas||[]).length}</Badge>
              </div>
              {(provDetalleData.entregas||[]).length===0
                ? <div style={{padding:"24px",textAlign:"center",color:C.muted,...dm,fontSize:11}}>
                    Sin entregas registradas aún
                  </div>
                : <div style={{maxHeight:340,overflowY:"auto"}}>
                    {[...(provDetalleData.entregas||[])].reverse().map((e,i)=>(
                      <div key={e.id} style={{padding:"10px 16px",borderBottom:`1px solid ${C.border}`,
                        display:"flex",alignItems:"center",gap:10}}
                        onMouseEnter={ev=>ev.currentTarget.style.background="#f8fafc"}
                        onMouseLeave={ev=>ev.currentTarget.style.background="transparent"}>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:700,...dm,fontSize:14,color:C.red}}>{fmt(e.monto)}</div>
                          <div style={{fontSize:11,color:C.textSub,marginTop:2}}>
                            {e.fecha}{e.desc?` · ${e.desc}`:""}
                          </div>
                        </div>
                        {isAdmin&&<button onClick={()=>eliminarMov(provDetalleData.id,"entrega",e.id)}
                          style={{background:"transparent",border:"none",color:C.red,cursor:"pointer",fontSize:13,opacity:.4}}>×</button>}
                      </div>
                    ))}
                    <div style={{padding:"10px 16px",background:"#fef2f2",
                      display:"flex",justifyContent:"space-between",fontSize:12,fontWeight:700}}>
                      <span style={{color:C.textSub}}>Total entregas</span>
                      <span style={{...dm,color:C.red}}>{fmt((provDetalleData.entregas||[]).reduce((a,e)=>a+e.monto,0))}</span>
                    </div>
                  </div>}
            </div>

            {/* Pagos */}
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden"}}>
              <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,
                display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontWeight:700,fontSize:13,color:C.green}}>💸 Historial de pagos</span>
                <Badge color={C.green}>{(provDetalleData.pagos||[]).length}</Badge>
              </div>
              {(provDetalleData.pagos||[]).length===0
                ? <div style={{padding:"24px",textAlign:"center",color:C.muted,...dm,fontSize:11}}>
                    Sin pagos registrados aún
                  </div>
                : <div style={{maxHeight:340,overflowY:"auto"}}>
                    {[...(provDetalleData.pagos||[])].reverse().map((pg)=>(
                      <div key={pg.id} style={{padding:"10px 16px",borderBottom:`1px solid ${C.border}`,
                        display:"flex",alignItems:"center",gap:10}}
                        onMouseEnter={ev=>ev.currentTarget.style.background="#f8fafc"}
                        onMouseLeave={ev=>ev.currentTarget.style.background="transparent"}>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:700,...dm,fontSize:14,color:C.green}}>{fmt(pg.monto)}</div>
                          <div style={{fontSize:11,color:C.textSub,marginTop:2}}>
                            {pg.fecha}{pg.desc?` · ${pg.desc}`:""}
                          </div>
                        </div>
                        {isAdmin&&<button onClick={()=>eliminarMov(provDetalleData.id,"pago",pg.id)}
                          style={{background:"transparent",border:"none",color:C.red,cursor:"pointer",fontSize:13,opacity:.4}}>×</button>}
                      </div>
                    ))}
                    <div style={{padding:"10px 16px",background:"#f0fdf4",
                      display:"flex",justifyContent:"space-between",fontSize:12,fontWeight:700}}>
                      <span style={{color:C.textSub}}>Total pagado</span>
                      <span style={{...dm,color:C.green}}>{fmt((provDetalleData.pagos||[]).reduce((a,pg)=>a+pg.monto,0))}</span>
                    </div>
                  </div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ── VENTAS ────────────────────────────────────────────────────
const VENTAS_INIT = ["Oct","Nov","Dic","Ene","Feb","Mar"].map(mes =>
  ({mes,...Object.fromEntries(LKEYS.map(k=>[k,{t1:0,t2:0}]))})
);

function ModuloVentas({isAdmin}) {
  const [datos,   setDatos]  = useSaved("parrillas-ventas2", VENTAS_INIT);
  const [cierres, setCierres]= useSaved("parrillas-cierres", []);
  const [vendidos,setVendidos]= useSaved("parrillas-vendidos",[]);
  const [pedidos]            = useSaved("parrillas-pedidos",  []);
  const [stock]              = useSaved("parrillas-stock",    STOCK_INIT);
  const [saved,  setSaved]   = useState(false);
  const [tab,    setTab]     = useState("cierres");
  const [vista,  setVista]   = useState("barras");
  const [showPeriodos, setShowPeriodos] = useState(false);
  const [showNuevoCierre, setShowNuevoCierre] = useState(false);
  const [showNuevoVendido, setShowNuevoVendido] = useState(false);

  // Form nuevo cierre de caja
  const [formCierre, setFormCierre] = useState({
    fecha: new Date().toISOString().slice(0,10),
    local: "LITO'S", turno:"7hs", monto:""
  });

  // Form mercadería vendida
  const [formVend, setFormVend] = useState({
    fecha: new Date().toISOString().slice(0,10),
    local:"LITO'S", turno:"7hs", items:[]
  });
  const [vendQ, setVendQ] = useState("");
  const [vendCant, setVendCant] = useState({});

  const MESES_OPT = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  const TURNOS = ["7hs","19hs"];

  const doSave = next => { setDatos(next); setSaved(true); setTimeout(()=>setSaved(false),2000); };

  // Períodos dinámicos
  const agregarPeriodo  = mes => { if(datos.find(d=>d.mes===mes)) return; doSave([...datos,{mes,...Object.fromEntries(LKEYS.map(k=>[k,{t1:0,t2:0}]))}]); };
  const eliminarPeriodo = mes => { if(datos.length<=1) return; doSave(datos.filter(d=>d.mes!==mes)); };
  const mesesDisponibles = MESES_OPT.filter(m=>!datos.find(d=>d.mes===m));

  // Cierres de caja
  const saveCierre = next => { setCierres(next); setSaved(true); setTimeout(()=>setSaved(false),2000); };
  const agregarCierre = () => {
    if(!formCierre.monto||+formCierre.monto<=0) return;
    saveCierre([{id:Date.now(),...formCierre,monto:+formCierre.monto},...cierres]);
    setFormCierre(f=>({...f,monto:""}));
    setShowNuevoCierre(false);
  };

  // Mercadería vendida
  const saveVend = next => { setVendidos(next); setSaved(true); setTimeout(()=>setSaved(false),2000); };
  const stockFiltrado = vendQ.trim()===""?stock:stock.filter(s=>s.producto.toLowerCase().includes(vendQ.toLowerCase()));

  const addVendItem = (prod, cant) => {
    const c = Math.max(1,+(cant||1));
    const existe = formVend.items.find(i=>i.stockId===prod.id);
    if(existe) setFormVend(f=>({...f,items:f.items.map(i=>i.stockId===prod.id?{...i,cantidad:i.cantidad+c}:i)}));
    else setFormVend(f=>({...f,items:[...f.items,{stockId:prod.id,producto:prod.producto,cantidad:c,unidad:prod.unidad||"u"}]}));
    setVendCant(v=>({...v,[prod.id]:""}));
  };

  const confirmarVendido = () => {
    if(!formVend.items.length) return;
    saveVend([{id:Date.now(),...formVend},...vendidos]);
    setFormVend(f=>({...f,items:[]}));
    setVendQ(""); setVendCant({});
    setShowNuevoVendido(false);
  };

  // Métricas cierres
  const totalCierres = cierres.reduce((a,c)=>a+c.monto,0);
  const cierresHoy   = cierres.filter(c=>c.fecha===new Date().toISOString().slice(0,10));
  const totalHoy     = cierresHoy.reduce((a,c)=>a+c.monto,0);

  // Mayorista: desde pedidos
  const pedExt = pedidos.filter(p=>p.tipo==="cliente");
  const cliMap  = {};
  pedExt.forEach(p=>{
    const n = p.nombreMostrar||p.destino||"Cliente externo";
    if(!cliMap[n]) cliMap[n]={nombre:n,pedidos:0,unidades:0};
    cliMap[n].pedidos++;
    cliMap[n].unidades += p.items.reduce((a,i)=>a+i.cantidad,0);
  });
  const cliList = Object.values(cliMap).sort((a,b)=>b.unidades-a.unidades);

  // Métricas locales (ventas manuales por período)
  const totLocal  = k => datos.reduce((a,m)=>a+(m[k]?.t1||0)+(m[k]?.t2||0),0);
  const totGen    = LKEYS.reduce((a,k)=>a+totLocal(k),0);
  const mejorIdx  = LKEYS.reduce((bi,k,i,arr)=>totLocal(k)>totLocal(arr[bi])?i:bi,0);
  const tieneData = totGen>0;
  const nPeriodos = datos.length;

  const dm = {fontFamily:"'DM Mono',monospace"};

  // Helper: editar celda de tabla ventas
  const [editCell, setEditCell] = useState(null); // {mi, lkey, turno}
  const [editVal,  setEditVal]  = useState("");
  const saveCell = () => {
    if(!editCell) return;
    const {mi,lkey,turno} = editCell;
    doSave(datos.map((d,i)=>i!==mi?d:{...d,[lkey]:{...(d[lkey]||{t1:0,t2:0}),[turno]:+editVal}}));
    setEditCell(null);
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>

      {/* Tabs */}
      <div style={{display:"flex",gap:8,alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",gap:8}}>
          <TabBtn active={tab==="cierres"} onClick={()=>setTab("cierres")} color={C.green}>💰 Cierres de caja</TabBtn>
          <TabBtn active={tab==="vendidos"} onClick={()=>setTab("vendidos")} color={C.blue}>📦 Mercadería vendida</TabBtn>
          <TabBtn active={tab==="locales"} onClick={()=>setTab("locales")}>📊 Ventas por local</TabBtn>
          <TabBtn active={tab==="mayorista"} onClick={()=>setTab("mayorista")} color={C.orange}>🏭 Venta mayorista</TabBtn>
        </div>
        {isAdmin&&tab==="locales"&&(
          <button onClick={()=>setShowPeriodos(!showPeriodos)}
            style={{background:showPeriodos?"#dbeafe":"transparent",color:showPeriodos?C.blue:C.textSub,
              border:`1px solid ${showPeriodos?C.blue:C.border}`,borderRadius:8,
              padding:"6px 14px",fontFamily:"'Inter',sans-serif",fontWeight:500,fontSize:12,cursor:"pointer"}}>
            📅 Gestionar períodos
          </button>
        )}
      </div>

      {/* ── CIERRES DE CAJA ── */}
      {tab==="cierres"&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
            <KPI label="Total histórico" value={fmt(totalCierres)} sub="Suma de todos los cierres"/>
            <KPI label="Recaudado hoy" value={fmt(totalHoy)} sub={`${cierresHoy.length} cierre${cierresHoy.length!==1?"s":""} hoy`} color={C.green}/>
            <KPI label="Cierre 7hs hoy" value={fmt(cierresHoy.filter(c=>c.turno==="7hs").reduce((a,c)=>a+c.monto,0))} sub="Turno mañana" color={C.blue}/>
            <KPI label="Cierre 19hs hoy" value={fmt(cierresHoy.filter(c=>c.turno==="19hs").reduce((a,c)=>a+c.monto,0))} sub="Turno tarde" color={C.purple}/>
          </div>

          {/* Form nuevo cierre */}
          {isAdmin&&(
            <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"14px 18px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div style={{fontWeight:700,fontSize:13,color:"#15803d"}}>Registrar cierre de caja</div>
                <button onClick={()=>setShowNuevoCierre(!showNuevoCierre)}
                  style={{background:C.green,color:"#fff",border:"none",borderRadius:7,
                    padding:"6px 14px",fontFamily:"'Inter',sans-serif",fontWeight:600,fontSize:12,cursor:"pointer"}}>
                  {showNuevoCierre?"Cancelar":"+ Nuevo cierre"}
                </button>
              </div>
              {showNuevoCierre&&(
                <div style={{display:"flex",gap:12,alignItems:"flex-end",flexWrap:"wrap"}}>
                  <div>
                    <div style={{fontSize:9,color:"#15803d",...dm,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Fecha</div>
                    <input type="date" style={{...inp,background:"#fff"}} value={formCierre.fecha}
                      onChange={e=>setFormCierre(f=>({...f,fecha:e.target.value}))}/>
                  </div>
                  <div>
                    <div style={{fontSize:9,color:"#15803d",...dm,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Local</div>
                    <select style={{...inp,background:"#fff"}} value={formCierre.local}
                      onChange={e=>setFormCierre(f=>({...f,local:e.target.value}))}>
                      {LOCALES.map(l=><option key={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{fontSize:9,color:"#15803d",...dm,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Turno</div>
                    <select style={{...inp,background:"#fff"}} value={formCierre.turno}
                      onChange={e=>setFormCierre(f=>({...f,turno:e.target.value}))}>
                      {TURNOS.map(t=><option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{fontSize:9,color:"#15803d",...dm,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Monto ($)</div>
                    <input type="number" style={{...inp,background:"#fff",width:140}} value={formCierre.monto}
                      placeholder="0"
                      onChange={e=>setFormCierre(f=>({...f,monto:e.target.value}))}
                      onKeyDown={e=>e.key==="Enter"&&agregarCierre()}/>
                  </div>
                  <button onClick={agregarCierre}
                    style={{background:C.green,border:"none",borderRadius:8,padding:"9px 20px",
                      color:"#fff",cursor:"pointer",fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:13}}>
                    ✓ Registrar
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tabla de cierres */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontWeight:700,fontSize:14,color:C.text}}>Historial de cierres</span>
              <PDFBtn onClick={()=>exportPDF("Cierres de Caja",
                cierres.map(c=>({fecha:c.fecha,local:c.local,turno:c.turno,monto:fmt(c.monto)})),
                [{key:"fecha",label:"Fecha"},{key:"local",label:"Local"},{key:"turno",label:"Turno"},{key:"monto",label:"Monto"}])}/>
            </div>
            {cierres.length===0
              ? <div style={{padding:"36px",textAlign:"center",color:C.muted,...dm,fontSize:11}}>
                  Sin cierres registrados. Empezá cargando el cierre del día.
                </div>
              : <div style={{maxHeight:460,overflowY:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead style={{position:"sticky",top:0,background:"#f8fafc",zIndex:2}}>
                      <tr><Th>Fecha</Th><Th>Local</Th><Th>Turno</Th><Th>Monto</Th>{isAdmin&&<Th></Th>}</tr>
                    </thead>
                    <tbody>
                      {cierres.map(c=>(
                        <tr key={c.id} {...rh}>
                          <Td style={{...dm,fontSize:11,color:C.textSub}}>{c.fecha}</Td>
                          <Td><strong>{c.local}</strong></Td>
                          <Td><Badge color={c.turno==="7hs"?C.blue:C.purple}>{c.turno}</Badge></Td>
                          <Td style={{...dm,fontWeight:700,fontSize:14,color:C.green}}>{fmt(c.monto)}</Td>
                          {isAdmin&&<Td>
                            <button onClick={()=>saveCierre(cierres.filter(x=>x.id!==c.id))}
                              style={{background:"transparent",border:"none",color:C.red,cursor:"pointer",fontSize:13,opacity:.4}}>×</button>
                          </Td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>}
          </div>

          {/* Mini resumen por local */}
          {cierres.length>0&&(
            <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:9}}>
              {LOCALES.map((l,i)=>{
                const total = cierres.filter(c=>c.local===l).reduce((a,c)=>a+c.monto,0);
                const hoyL  = cierres.filter(c=>c.local===l&&c.fecha===new Date().toISOString().slice(0,10)).reduce((a,c)=>a+c.monto,0);
                return (
                  <div key={l} style={{background:C.card,border:`1px solid ${C.border}`,
                    borderTop:`3px solid ${COLORS[i]}`,borderRadius:8,padding:"12px",
                    boxShadow:C.shadow}}>
                    <div style={{color:C.textSub,fontSize:9,...dm,marginBottom:3}}>{l}</div>
                    <div style={{color:COLORS[i],fontSize:13,fontWeight:700,...dm}}>{total>0?fmt(total):"—"}</div>
                    <div style={{color:C.muted,fontSize:9,marginTop:2}}>Hoy: {hoyL>0?fmt(hoyL):"—"}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── MERCADERÍA VENDIDA ── */}
      {tab==="vendidos"&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
            <KPI label="Registros de ventas" value={vendidos.length.toString()} sub="Mercadería saliente por venta"/>
            <KPI label="Registros hoy" value={vendidos.filter(v=>v.fecha===new Date().toISOString().slice(0,10)).length.toString()} sub="Del día" color={C.blue}/>
            <KPI label="Unidades totales vendidas" value={vendidos.reduce((a,v)=>a+v.items.reduce((b,i)=>b+i.cantidad,0),0).toString()} sub="Histórico" color={C.green}/>
          </div>

          {isAdmin&&(
            <div style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:10,padding:"14px 18px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:showNuevoVendido?12:0}}>
                <div style={{fontWeight:700,fontSize:13,color:C.blue}}>Registrar mercadería vendida</div>
                <button onClick={()=>setShowNuevoVendido(!showNuevoVendido)}
                  style={{background:C.blue,color:"#fff",border:"none",borderRadius:7,
                    padding:"6px 14px",fontFamily:"'Inter',sans-serif",fontWeight:600,fontSize:12,cursor:"pointer"}}>
                  {showNuevoVendido?"Cancelar":"+ Cargar venta"}
                </button>
              </div>

              {showNuevoVendido&&(
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                    {[["Fecha","fecha","date"],["Local","local","select"],["Turno","turno","select"]].map(([l,k,t])=>(
                      <div key={k}>
                        <div style={{fontSize:9,color:C.blue,...dm,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{l}</div>
                        {t==="select"
                          ? <select style={{...inp,background:"#fff"}} value={formVend[k]}
                              onChange={e=>setFormVend(f=>({...f,[k]:e.target.value}))}>
                              {(k==="local"?LOCALES:TURNOS).map(o=><option key={o}>{o}</option>)}
                            </select>
                          : <input type={t} style={{...inp,background:"#fff"}} value={formVend[k]}
                              onChange={e=>setFormVend(f=>({...f,[k]:e.target.value}))}/>}
                      </div>
                    ))}
                  </div>

                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                    {/* Buscador */}
                    <div style={{background:"#fff",border:"1px solid #bfdbfe",borderRadius:9,overflow:"hidden"}}>
                      <div style={{padding:"10px 14px",borderBottom:"1px solid #bfdbfe",background:"#f0f9ff"}}>
                        <div style={{fontWeight:600,fontSize:12,color:C.blue,marginBottom:7}}>Buscá los productos vendidos</div>
                        <input value={vendQ} onChange={e=>setVendQ(e.target.value)}
                          placeholder="🔍 Buscar producto…"
                          style={{...inp,width:"100%",boxSizing:"border-box",background:"#fff"}}/>
                      </div>
                      <div style={{maxHeight:280,overflowY:"auto"}}>
                        {stockFiltrado.map(s=>{
                          const en = formVend.items.find(i=>i.stockId===s.id);
                          return (
                            <div key={s.id} style={{display:"flex",alignItems:"center",gap:8,
                              padding:"8px 12px",borderBottom:"1px solid #f0f9ff",
                              background:en?"#eff6ff":"#fff",transition:"background .12s"}}
                              onMouseEnter={e=>{if(!en)e.currentTarget.style.background="#f8fafc";}}
                              onMouseLeave={e=>{if(!en)e.currentTarget.style.background=en?"#eff6ff":"#fff";}}>
                              <div style={{flex:1,minWidth:0}}>
                                <div style={{fontWeight:600,fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.producto}</div>
                                {en&&<Badge color={C.blue}>✓ {en.cantidad} cargados</Badge>}
                              </div>
                              <input type="number" min="1" defaultValue={1} id={`vend-${s.id}`}
                                style={{...inp,width:50,padding:"3px 6px",fontSize:11,textAlign:"center",background:"#fff"}}/>
                              <button onClick={()=>{
                                  const el=document.getElementById(`vend-${s.id}`);
                                  addVendItem(s,el?el.value:1);
                                }}
                                style={{background:en?C.blue:C.green,border:"none",borderRadius:6,
                                  padding:"4px 10px",color:"#fff",cursor:"pointer",
                                  fontSize:11,fontFamily:"'Inter',sans-serif",fontWeight:600}}>
                                {en?"+":"Agregar"}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Items cargados */}
                    <div style={{background:"#fff",border:"1px solid #bfdbfe",borderRadius:9,overflow:"hidden",display:"flex",flexDirection:"column"}}>
                      <div style={{padding:"10px 14px",borderBottom:"1px solid #bfdbfe",background:"#f0f9ff",
                        display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{fontWeight:600,fontSize:12,color:C.blue}}>Productos cargados</span>
                        <Badge color={C.blue}>{formVend.items.length}</Badge>
                      </div>
                      {formVend.items.length===0
                        ? <div style={{padding:"24px",textAlign:"center",color:C.muted,fontSize:12}}>
                            Agregá los productos vendidos en este turno
                          </div>
                        : <>
                            <div style={{flex:1,overflowY:"auto",maxHeight:230}}>
                              {formVend.items.map((it,i)=>(
                                <div key={i} style={{display:"flex",alignItems:"center",gap:8,
                                  padding:"8px 12px",borderBottom:"1px solid #f0f9ff"}}>
                                  <div style={{flex:1}}>
                                    <div style={{fontWeight:600,fontSize:12}}>{it.producto}</div>
                                    <div style={{display:"flex",alignItems:"center",gap:6,marginTop:3}}>
                                      <input type="number" min="1" value={it.cantidad}
                                        onChange={e=>setFormVend(f=>({...f,items:f.items.map((x,j)=>j===i?{...x,cantidad:Math.max(1,+e.target.value)}:x)}))}
                                        style={{...inp,width:55,padding:"2px 6px",fontSize:12,background:"#fff"}}/>
                                      <span style={{fontSize:11,color:C.textSub}}>{it.unidad}</span>
                                    </div>
                                  </div>
                                  <button onClick={()=>setFormVend(f=>({...f,items:f.items.filter((_,j)=>j!==i)}))}
                                    style={{background:"transparent",border:"none",color:C.red,cursor:"pointer",fontSize:14}}>×</button>
                                </div>
                              ))}
                            </div>
                            <div style={{padding:"12px 14px",borderTop:"1px solid #bfdbfe"}}>
                              <button onClick={confirmarVendido}
                                style={{width:"100%",background:C.blue,color:"#fff",border:"none",borderRadius:8,
                                  padding:"10px",fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:13,cursor:"pointer"}}>
                                ✓ Registrar venta ({formVend.local} · {formVend.turno})
                              </button>
                            </div>
                          </>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Historial mercadería vendida */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden"}}>
            <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontWeight:700,fontSize:14,color:C.text}}>Historial de ventas registradas</span>
            </div>
            {vendidos.length===0
              ? <div style={{padding:"36px",textAlign:"center",color:C.muted,...dm,fontSize:11}}>Sin registros de ventas aún.</div>
              : <div style={{maxHeight:400,overflowY:"auto"}}>
                  {vendidos.map(v=>(
                    <div key={v.id} style={{borderBottom:`1px solid ${C.border}`,padding:"10px 16px",
                      transition:"background .12s"}}
                      onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <strong style={{fontSize:13}}>{v.local}</strong>
                          <Badge color={v.turno==="7hs"?C.blue:C.purple}>{v.turno}</Badge>
                          <span style={{...dm,fontSize:10,color:C.muted}}>{v.fecha}</span>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <Badge color={C.green}>{v.items.reduce((a,i)=>a+i.cantidad,0)} u. vendidas</Badge>
                          {isAdmin&&<button onClick={()=>saveVend(vendidos.filter(x=>x.id!==v.id))}
                            style={{background:"transparent",border:"none",color:C.red,cursor:"pointer",fontSize:13,opacity:.4}}>×</button>}
                        </div>
                      </div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                        {v.items.map((it,i)=>(
                          <span key={i} style={{background:"#f0f9ff",border:"1px solid #bfdbfe",
                            borderRadius:5,padding:"2px 9px",fontSize:11,...dm}}>
                            {it.producto} <span style={{color:C.blue,fontWeight:700}}>{it.cantidad} {it.unidad}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>}
          </div>
        </div>
      )}

      {/* ── VENTAS POR LOCAL (tabla manual por período) ── */}
      {tab==="locales"&&(
        <>
          {isAdmin&&showPeriodos&&(
            <div style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:10,padding:"16px"}}>
              <div style={{fontWeight:700,fontSize:13,color:C.blue,marginBottom:12}}>Gestión de Períodos</div>
              <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
                <div style={{flex:1,minWidth:200}}>
                  <div style={{fontSize:11,color:C.textSub,marginBottom:8,fontWeight:600}}>Períodos activos</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {datos.map(d=>(
                      <div key={d.mes} style={{display:"flex",alignItems:"center",gap:4,
                        background:"#fff",border:"1px solid #bfdbfe",borderRadius:7,
                        padding:"4px 10px",fontSize:12,fontWeight:600,color:C.blue}}>
                        {d.mes}
                        <button onClick={()=>eliminarPeriodo(d.mes)}
                          style={{background:"transparent",border:"none",color:C.red,cursor:"pointer",fontSize:14,opacity:.6,padding:"0 2px"}}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{flex:1,minWidth:200}}>
                  <div style={{fontSize:11,color:C.textSub,marginBottom:8,fontWeight:600}}>Agregar período</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {mesesDisponibles.map(m=>(
                      <button key={m} onClick={()=>agregarPeriodo(m)}
                        style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:7,
                          padding:"4px 12px",fontSize:12,color:C.textSub,cursor:"pointer",
                          fontFamily:"'Inter',sans-serif",fontWeight:500}}
                        onMouseEnter={e=>{e.currentTarget.style.background="#dbeafe";e.currentTarget.style.color=C.blue;}}
                        onMouseLeave={e=>{e.currentTarget.style.background="#fff";e.currentTarget.style.color=C.textSub;}}>
                        + {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
            <KPI label={`Ventas ${nPeriodos} períodos`} value={tieneData?fmt(totGen):"Sin datos"} sub="Suma todos los locales"/>
            <KPI label="Mejor local" value={tieneData?LOCALES[mejorIdx]:"—"} sub={tieneData?fmt(totLocal(LKEYS[mejorIdx])):"Cargá ventas"} color={C.green}/>
            <KPI label="Promedio mensual" value={tieneData&&nPeriodos>0?fmt(totGen/nPeriodos):"—"} sub="Por período" color={C.blue}/>
            <KPI label="Períodos activos" value={nPeriodos.toString()} sub={datos.map(d=>d.mes).join(" · ")} color={C.purple}/>
          </div>

          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",borderBottom:`1px solid ${C.border}`}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{color:C.text,fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14}}>Ventas por Local y Turno</span>
                <Saved show={saved}/>
              </div>
              <div style={{display:"flex",gap:8}}>
                <PDFBtn onClick={()=>exportPDF("Ventas por Local",
                  datos.map(d=>({mes:d.mes,
                    ...Object.fromEntries(LKEYS.map((k,i)=>[LOCALES[i], ((d[k]?.t1||0)+(d[k]?.t2||0))>0?fmt((d[k]?.t1||0)+(d[k]?.t2||0)):"—"])),
                    total:fmt(LKEYS.reduce((a,k)=>a+(d[k]?.t1||0)+(d[k]?.t2||0),0))})),
                  [{key:"mes",label:"Mes"},...LOCALES.map(l=>({key:l,label:l})),{key:"total",label:"Total"}])}/>
                {[["Barras","barras"],["Líneas","lineas"]].map(([l,v])=>(
                  <TabBtn key={v} active={vista===v} onClick={()=>setVista(v)}>{l}</TabBtn>
                ))}
              </div>
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",minWidth:700}}>
                <thead>
                  <tr>
                    <Th rowSpan={2}>Mes</Th>
                    {LOCALES.map((l,i)=>(
                      <Th key={l} colSpan={2} style={{color:COLORS[i],textAlign:"center",borderBottom:"none"}}>{l}</Th>
                    ))}
                    <Th rowSpan={2}>Total mes</Th>
                  </tr>
                  <tr>
                    {LOCALES.map(l=>(
                      ["7hs","19hs"].map(t=>(
                        <Th key={l+t} style={{fontSize:8,color:C.muted,borderTop:`1px solid ${C.border}`}}>{t}</Th>
                      ))
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {datos.map((d,mi)=>{
                    const rowTotal = LKEYS.reduce((a,k)=>a+(d[k]?.t1||0)+(d[k]?.t2||0),0);
                    return (
                      <tr key={d.mes} {...rh}>
                        <Td style={{...dm,color:C.accent,fontWeight:600}}>{d.mes}</Td>
                        {LKEYS.map((k,i)=>(
                          ["t1","t2"].map((turno,ti)=>{
                            const val = d[k]?.[turno]||0;
                            const isEditing = editCell&&editCell.mi===mi&&editCell.lkey===k&&editCell.turno===turno;
                            return (
                              <Td key={k+turno}>
                                {isAdmin&&isEditing
                                  ? <span style={{display:"flex",gap:4,alignItems:"center"}}>
                                      <input type="number" autoFocus value={editVal}
                                        onChange={e=>setEditVal(e.target.value)}
                                        onKeyDown={e=>e.key==="Enter"&&saveCell()}
                                        style={{...inp,width:85,padding:"2px 6px",fontSize:11,background:"#fff"}}/>
                                      <SmBtn onClick={saveCell}>✓</SmBtn>
                                    </span>
                                  : <span style={{...dm,fontSize:11,color:val===0?C.muted:COLORS[i],
                                      cursor:isAdmin?"pointer":"default"}}
                                      onClick={()=>isAdmin&&(setEditCell({mi,lkey:k,turno}),setEditVal(val))}>
                                      {val===0?(isAdmin?"—":"—"):fmt(val)}
                                    </span>}
                              </Td>
                            );
                          })
                        ))}
                        <Td style={{...dm,fontWeight:700,color:C.text}}>{rowTotal===0?"—":fmt(rowTotal)}</Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{padding:"14px 16px",borderTop:`1px solid ${C.border}`}}>
              {!tieneData
                ? <div style={{color:C.textSub,fontSize:11,...dm,textAlign:"center"}}>
                    {isAdmin?"💡 Hacé clic en cualquier celda para cargar las ventas del turno.":"Sin datos cargados aún."}
                  </div>
                : <ResponsiveContainer width="100%" height={240}>
                    {vista==="barras"
                      ? <BarChart data={datos.map(d=>({mes:d.mes,...Object.fromEntries(LKEYS.map(k=>[k,(d[k]?.t1||0)+(d[k]?.t2||0)]))}))} barSize={10} barCategoryGap="22%">
                          <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
                          <XAxis dataKey="mes" tick={{fill:C.textSub,fontSize:10}} axisLine={false} tickLine={false}/>
                          <YAxis tick={{fill:C.textSub,fontSize:9}} axisLine={false} tickLine={false} tickFormatter={v=>"$"+Math.round(v/1000)+"k"}/>
                          <Tooltip formatter={(v,n)=>[fmt(v),n]} contentStyle={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:8}}/>
                          <Legend wrapperStyle={{fontFamily:"'DM Mono',monospace",fontSize:10}}/>
                          {LKEYS.map((k,i)=><Bar key={k} dataKey={k} name={LOCALES[i]} fill={COLORS[i]} radius={[3,3,0,0]}/>)}
                        </BarChart>
                      : <LineChart data={datos.map(d=>({mes:d.mes,...Object.fromEntries(LKEYS.map(k=>[k,(d[k]?.t1||0)+(d[k]?.t2||0)]))}))}>
                          <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
                          <XAxis dataKey="mes" tick={{fill:C.textSub,fontSize:10}} axisLine={false} tickLine={false}/>
                          <YAxis tick={{fill:C.textSub,fontSize:9}} axisLine={false} tickLine={false} tickFormatter={v=>"$"+Math.round(v/1000)+"k"}/>
                          <Tooltip formatter={(v,n)=>[fmt(v),n]} contentStyle={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:8}}/>
                          <Legend wrapperStyle={{fontFamily:"'DM Mono',monospace",fontSize:10}}/>
                          {LKEYS.map((k,i)=><Line key={k} type="monotone" dataKey={k} name={LOCALES[i]} stroke={COLORS[i]} strokeWidth={2} dot={{r:3}}/>)}
                        </LineChart>}
                  </ResponsiveContainer>}
            </div>
          </div>
        </>
      )}

      {/* ── MAYORISTA ── */}
      {tab==="mayorista"&&(
        <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
            <KPI label="Clientes mayoristas" value={cliList.length.toString()} sub="Con pedidos registrados" color={C.orange}/>
            <KPI label="Pedidos externos" value={pedExt.length.toString()} sub="Total histórico" color={C.blue}/>
            <KPI label="Unidades despachadas" value={cliList.reduce((a,c)=>a+c.unidades,0).toString()} sub="A clientes externos" color={C.green}/>
          </div>
          <div style={{background:"#fffbeb",border:`1px solid #fde68a`,borderRadius:8,padding:"10px 14px",display:"flex",gap:10,alignItems:"center"}}>
            <span>💡</span>
            <span style={{color:C.textSub,fontSize:11}}>
              Los clientes mayoristas se cargan en el módulo <strong style={{color:C.accent}}>Pedidos</strong> eligiendo tipo "Cliente externo".
            </span>
          </div>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",borderBottom:`1px solid ${C.border}`}}>
              <span style={{color:C.text,fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14}}>Resumen por Cliente</span>
              <PDFBtn onClick={()=>exportPDF("Venta Mayorista",cliList.map(c=>({nombre:c.nombre,pedidos:c.pedidos.toString(),unidades:c.unidades.toString()})),
                [{key:"nombre",label:"Cliente"},{key:"pedidos",label:"Pedidos"},{key:"unidades",label:"Unidades"}])}/>
            </div>
            {cliList.length===0
              ? <div style={{padding:"36px",textAlign:"center",color:C.muted,...dm,fontSize:11}}>
                  Sin clientes mayoristas aún.
                </div>
              : <>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead><tr><Th>Cliente</Th><Th>Pedidos</Th><Th>Unidades despachadas</Th><Th>Último pedido</Th></tr></thead>
                    <tbody>
                      {cliList.map((c,i)=>{
                        const ult=pedExt.filter(p=>(p.nombreMostrar||p.destino)===c.nombre).sort((a,b)=>b.id-a.id)[0];
                        return (
                          <tr key={c.nombre} {...rh}>
                            <Td><span style={{display:"flex",alignItems:"center",gap:8}}>
                              <span style={{width:8,height:8,borderRadius:"50%",background:COLORS[i%COLORS.length],display:"inline-block"}}/>
                              <strong>{c.nombre}</strong>
                            </span></Td>
                            <Td style={{...dm,color:C.blue,fontWeight:700}}>{c.pedidos}</Td>
                            <Td style={{...dm,color:C.orange,fontWeight:700}}>{c.unidades} u.</Td>
                            <Td style={{...dm,fontSize:11,color:C.muted}}>{ult?.fecha||"—"}</Td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div style={{padding:"14px 16px",borderTop:`1px solid ${C.border}`}}>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={cliList} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
                        <XAxis type="number" tick={{fill:C.textSub,fontSize:10}} axisLine={false} tickLine={false}/>
                        <YAxis type="category" dataKey="nombre" width={130} tick={{fill:C.text,fontSize:11}} axisLine={false} tickLine={false}/>
                        <Tooltip contentStyle={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:8}}/>
                        <Bar dataKey="unidades" name="Unidades" radius={[0,4,4,0]}>
                          {cliList.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>}
          </div>
        </>
      )}
    </div>
  );
}


// ── PRECIOS POR CLIENTE ──────────────────────────────────────
// Vista matriz: productos en filas, clientes en columnas
// Se edita celda por celda directamente en la grilla
// Data: parrillas-lista-precios = [{id, nombre, notas, precios:[{stockId, producto, precio, unidad, notas}]}]

function pdfListaPrecios(cliente) {
  const fecha = new Date().toLocaleDateString("es-AR",{day:"numeric",month:"long",year:"numeric"});
  const filas = (cliente.precios||[]).map((p,i)=>`
    <tr>
      <td style="font-weight:500;padding:11px 14px;border-bottom:1px solid #f1f5f9">${i+1}. ${p.producto}</td>
      <td style="text-align:center;padding:11px 14px;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:11px">${p.unidad||"u"}</td>
      <td style="text-align:right;padding:11px 14px;border-bottom:1px solid #f1f5f9;font-weight:700;font-size:16px;color:#d97706">$${Math.round(p.precio).toLocaleString("es-AR")}</td>
      <td style="padding:11px 14px;border-bottom:1px solid #f1f5f9;font-size:11px;color:#94a3b8">${p.notas||""}</td>
    </tr>`).join("");

  const html = `<html><head><title>Lista de Precios — ${cliente.nombre}</title><style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Inter',Arial,sans-serif;padding:36px;color:#1e293b;background:#fff}
    .header{display:flex;justify-content:space-between;align-items:flex-start;
      margin-bottom:28px;padding-bottom:20px;border-bottom:3px solid #d97706}
    .brand{font-size:22px;font-weight:800;color:#d97706}
    .cliente-box{background:#f8fafc;border-radius:10px;padding:14px 18px;margin-bottom:20px;
      border:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center}
    table{width:100%;border-collapse:collapse}
    thead tr{background:#f8fafc;border-bottom:2px solid #e2e8f0}
    th{padding:10px 14px;text-align:left;font-size:9px;text-transform:uppercase;
       letter-spacing:1.2px;color:#64748b;font-weight:700}
    .footer{margin-top:24px;padding-top:12px;border-top:1px solid #e2e8f0;
      display:flex;justify-content:space-between;font-size:10px;color:#94a3b8}
    @media print{body{padding:20px}}
  </style></head><body>
    <div class="header">
      <div><div class="brand">🔥 PARRILLAS</div>
        <div style="font-size:10px;color:#94a3b8;font-family:monospace;margin-top:2px">costanera sur · sistema de gestión</div></div>
      <div style="text-align:right">
        <div style="font-size:11px;color:#94a3b8;margin-bottom:3px;text-transform:uppercase;letter-spacing:1px">Lista de precios para</div>
        <div style="font-size:20px;font-weight:800">${cliente.nombre}</div>
        <div style="font-size:11px;color:#64748b;margin-top:2px">Emitida el ${fecha}</div>
      </div>
    </div>
    <div class="cliente-box">
      <span style="font-weight:600">${(cliente.precios||[]).length} productos en esta lista</span>
      <span style="font-size:11px;color:#64748b">Precios sujetos a modificación sin previo aviso</span>
    </div>
    <table>
      <thead><tr><th>Producto</th><th style="text-align:center">Unidad</th><th style="text-align:right">Precio</th><th>Obs.</th></tr></thead>
      <tbody>${filas}</tbody>
    </table>
    <div class="footer">
      <span>Parrillas Costanera Sur</span>
      <span>Generado el ${new Date().toLocaleString("es-AR")}</span>
    </div>
  </body></html>`;
  const w = window.open("","_blank");
  if(!w) return alert("Permitir ventanas emergentes");
  w.document.write(html); w.document.close();
  setTimeout(()=>w.print(),500);
}

function ModuloPrecios({isAdmin}) {
  const [clientes,  setClientes]  = useSaved("parrillas-lista-precios", []);
  const [stock]                   = useSaved("parrillas-stock",          STOCK_INIT);
  const [productos]               = useSaved("parrillas-productos",      PRODUCTOS_INIT);
  const [saved, setSaved]         = useState(false);
  const [showNuevoCli, setShowNuevoCli] = useState(false);
  const [formCli, setFormCli]     = useState({nombre:"", notas:""});
  const [prodSearch, setProdSearch] = useState("");
  // Celda en edición: {productoId, clienteId}
  const [editCell, setEditCell]   = useState(null);
  const [editVal,  setEditVal]    = useState("");

  const doSave = next => { setClientes(next); setSaved(true); setTimeout(()=>setSaved(false),2000); };

  // Lista unificada de productos (stock + propios, sin duplicados)
  const todosProductos = [
    ...stock.map(s=>({id:"s"+s.id, nombre:s.producto, unidad:s.unidad||"u"})),
    ...productos.filter(p=>!p.costo_muerto).map(p=>({id:"p"+p.id, nombre:p.producto, unidad:"u"})),
  ].filter((p,i,arr)=>arr.findIndex(x=>x.nombre===p.nombre)===i)
   .sort((a,b)=>a.nombre.localeCompare(b.nombre));

  const prodFiltrados = prodSearch.trim()===""
    ? todosProductos
    : todosProductos.filter(p=>p.nombre.toLowerCase().includes(prodSearch.toLowerCase()));

  // Obtener precio de un producto para un cliente
  const getPrecio = (clienteId, prodId) => {
    const cli = clientes.find(c=>c.id===clienteId);
    if(!cli) return "";
    const prod = todosProductos.find(p=>p.id===prodId);
    if(!prod) return "";
    const p = (cli.precios||[]).find(p=>p.producto===prod.nombre);
    return p?.precio||"";
  };

  // Guardar precio en la matriz
  const setPrecio = (clienteId, prodId, valor) => {
    const prod = todosProductos.find(p=>p.id===prodId);
    if(!prod) return;
    const precio = parseFloat(valor);
    doSave(clientes.map(c=>{
      if(c.id!==clienteId) return c;
      const precios = c.precios||[];
      if(!valor || isNaN(precio) || precio<=0) {
        // Eliminar precio si se borra
        return {...c, precios: precios.filter(p=>p.producto!==prod.nombre)};
      }
      const existe = precios.find(p=>p.producto===prod.nombre);
      if(existe) return {...c, precios: precios.map(p=>p.producto===prod.nombre?{...p,precio}:p)};
      return {...c, precios:[...precios,{stockId:prodId,producto:prod.nombre,precio,unidad:prod.unidad}]};
    }));
  };

  const confirmarEdicion = () => {
    if(!editCell) return;
    setPrecio(editCell.clienteId, editCell.prodId, editVal);
    setEditCell(null);
  };

  // Agregar cliente
  const agregarCliente = () => {
    if(!formCli.nombre) return;
    doSave([...clientes,{id:Date.now(),nombre:formCli.nombre,notas:formCli.notas,precios:[]}]);
    setFormCli({nombre:"",notas:""}); setShowNuevoCli(false);
  };

  const dm = {fontFamily:"'DM Mono',monospace"};

  // Stats
  const totalPrecios = clientes.reduce((a,c)=>a+(c.precios||[]).length,0);
  const prodConPrecio = [...new Set(clientes.flatMap(c=>(c.precios||[]).map(p=>p.producto)))].length;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        <KPI label="Clientes con lista" value={clientes.length.toString()} sub="Precios personalizados"/>
        <KPI label="Productos con precio" value={prodConPrecio.toString()} sub="En al menos una lista" color={C.blue}/>
        <KPI label="Total precios cargados" value={totalPrecios.toString()} sub="Combinaciones cliente × producto" color={C.green}/>
        <KPI label="Precios faltantes" value={Math.max(0,clientes.length*prodFiltrados.length-totalPrecios).toString()} sub="Celdas vacías" color={C.orange}/>
      </div>

      {/* Barra de acciones */}
      <div style={{display:"flex",gap:8,alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <input value={prodSearch} onChange={e=>setProdSearch(e.target.value)}
            placeholder="🔍 Filtrar productos…"
            style={{...inp,width:220,padding:"6px 11px",fontSize:12}}/>
          {prodSearch&&<button onClick={()=>setProdSearch("")}
            style={{background:"transparent",border:"none",color:C.muted,cursor:"pointer",fontSize:18}}>×</button>}
          <span style={{color:C.muted,fontSize:11,...dm}}>
            {prodFiltrados.length} de {todosProductos.length} productos
          </span>
        </div>
        {isAdmin&&(
          <button onClick={()=>setShowNuevoCli(!showNuevoCli)}
            style={{background:C.accent,color:"#fff",border:"none",borderRadius:8,
              padding:"7px 16px",fontFamily:"'Inter',sans-serif",fontWeight:600,
              fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
            + Agregar cliente
          </button>
        )}
      </div>

      {/* Formulario nuevo cliente */}
      {isAdmin&&showNuevoCli&&(
        <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:10,padding:"14px 18px"}}>
          <div style={{fontWeight:600,fontSize:13,color:"#92400e",marginBottom:10}}>Nuevo cliente</div>
          <div style={{display:"flex",gap:10,alignItems:"flex-end",flexWrap:"wrap"}}>
            <div style={{flex:2,minWidth:180}}>
              <div style={{fontSize:9,color:C.textSub,...dm,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Nombre</div>
              <input autoFocus style={{...inp,width:"100%"}} value={formCli.nombre}
                onChange={e=>setFormCli(v=>({...v,nombre:e.target.value}))}
                onKeyDown={e=>e.key==="Enter"&&agregarCliente()}
                placeholder="Ej: Restaurante El Sur…"/>
            </div>
            <div style={{flex:1,minWidth:140}}>
              <div style={{fontSize:9,color:C.textSub,...dm,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Notas (opcional)</div>
              <input style={{...inp,width:"100%"}} value={formCli.notas}
                onChange={e=>setFormCli(v=>({...v,notas:e.target.value}))}
                placeholder="Condición de pago…"/>
            </div>
            <button onClick={agregarCliente}
              style={{background:C.green,border:"none",borderRadius:8,padding:"9px 20px",
                color:"#fff",cursor:"pointer",fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:13}}>
              Guardar
            </button>
            <button onClick={()=>setShowNuevoCli(false)}
              style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:8,
                padding:"9px 14px",color:C.textSub,cursor:"pointer",fontFamily:"'Inter',sans-serif",fontSize:13}}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* ── MATRIZ PRINCIPAL ── */}
      {clientes.length===0
        ? <div style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:12,
            padding:"60px",textAlign:"center",boxShadow:C.shadow}}>
            <div style={{fontSize:40,marginBottom:12}}>🏷️</div>
            <div style={{fontWeight:700,fontSize:16,color:C.text,marginBottom:6}}>Sin clientes todavía</div>
            <div style={{color:C.textSub,fontSize:12}}>
              {isAdmin?"Hacé clic en \"+ Agregar cliente\" para crear la primera lista de precios.":"Sin listas de precios cargadas aún."}
            </div>
          </div>
        : (
          <div style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:12,
            overflow:"hidden",boxShadow:C.shadow}}>

            {/* Header con clientes */}
            <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,
              display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontWeight:700,fontSize:14,color:C.text}}>
                  Matriz de precios — hacé clic en cualquier celda para editar
                </span>
                <Saved show={saved}/>
              </div>
              <div style={{display:"flex",gap:6}}>
                {clientes.map((c,i)=>(
                  <button key={c.id} onClick={()=>pdfListaPrecios(c)}
                    style={{background:COLORS[i%COLORS.length]+"15",
                      color:COLORS[i%COLORS.length],
                      border:`1px solid ${COLORS[i%COLORS.length]}40`,
                      borderRadius:7,padding:"4px 10px",fontSize:10,cursor:"pointer",
                      fontFamily:"'Inter',sans-serif",fontWeight:600,
                      display:"flex",alignItems:"center",gap:4}}>
                    📄 {c.nombre.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Tip */}
            <div style={{padding:"8px 16px",background:"#f8fafc",borderBottom:`1px solid ${C.border}`,
              fontSize:11,color:C.textSub,display:"flex",alignItems:"center",gap:8}}>
              <span>💡</span>
              <span>Hacé clic en una celda para escribir el precio. <strong>Enter</strong> para confirmar · <strong>Tab</strong> para ir a la siguiente · <strong>Esc</strong> para cancelar. Dejá vacío para eliminar el precio.</span>
            </div>

            <div style={{overflowX:"auto",maxHeight:"calc(100vh - 380px)",overflowY:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",minWidth:400+clientes.length*140}}>
                <thead style={{position:"sticky",top:0,zIndex:3}}>
                  <tr>
                    <th style={{padding:"10px 16px",textAlign:"left",background:"#f8fafc",
                      borderBottom:`2px solid ${C.border}`,fontSize:11,fontWeight:700,
                      color:C.textSub,whiteSpace:"nowrap",minWidth:220,
                      position:"sticky",left:0,zIndex:4,boxShadow:"2px 0 4px rgba(0,0,0,.04)"}}>
                      Producto
                    </th>
                    {clientes.map((c,i)=>(
                      <th key={c.id} style={{padding:"10px 14px",textAlign:"center",
                        background:"#f8fafc",borderBottom:`2px solid ${C.border}`,
                        borderLeft:`1px solid ${C.border}`,minWidth:140,whiteSpace:"nowrap"}}>
                        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <div style={{width:10,height:10,borderRadius:"50%",
                              background:COLORS[i%COLORS.length],flexShrink:0}}/>
                            <span style={{fontWeight:700,fontSize:12,color:C.text}}>{c.nombre}</span>
                            {isAdmin&&<button onClick={()=>doSave(clientes.filter(x=>x.id!==c.id))}
                              style={{background:"transparent",border:"none",color:C.muted,
                                cursor:"pointer",fontSize:12,opacity:.5,padding:0,marginLeft:2}}>×</button>}
                          </div>
                          <span style={{fontSize:9,...dm,color:C.muted}}>
                            {(c.precios||[]).length} precios cargados
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {prodFiltrados.map((prod, ri)=>{
                    const esPar = ri%2===0;
                    return (
                      <tr key={prod.id}
                        style={{background:esPar?"#fff":"#fafafa"}}
                        onMouseEnter={e=>e.currentTarget.style.background="#fefce8"}
                        onMouseLeave={e=>e.currentTarget.style.background=esPar?"#fff":"#fafafa"}>

                        {/* Columna producto (fija) */}
                        <td style={{padding:"9px 16px",borderBottom:`1px solid ${C.border}`,
                          position:"sticky",left:0,zIndex:1,
                          background:esPar?"#fff":"#fafafa",
                          boxShadow:"2px 0 4px rgba(0,0,0,.04)"}}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <div>
                              <div style={{fontWeight:600,fontSize:12,color:C.text}}>{prod.nombre}</div>
                              <div style={{fontSize:9,...dm,color:C.muted,marginTop:1}}>{prod.unidad}</div>
                            </div>
                          </div>
                        </td>

                        {/* Celdas de precio por cliente */}
                        {clientes.map((cli,ci)=>{
                          const precio = getPrecio(cli.id, prod.id);
                          const isEditing = editCell?.clienteId===cli.id && editCell?.prodId===prod.id;
                          const color = COLORS[ci%COLORS.length];

                          return (
                            <td key={cli.id}
                              style={{padding:"6px 10px",borderBottom:`1px solid ${C.border}`,
                                borderLeft:`1px solid ${C.border}`,textAlign:"center",
                                cursor:isAdmin?"pointer":"default"}}>
                              {isAdmin&&isEditing ? (
                                <input
                                  type="number"
                                  autoFocus
                                  value={editVal}
                                  onChange={e=>setEditVal(e.target.value)}
                                  onKeyDown={e=>{
                                    if(e.key==="Enter"){ confirmarEdicion(); }
                                    if(e.key==="Escape"){ setEditCell(null); }
                                    if(e.key==="Tab"){
                                      e.preventDefault();
                                      confirmarEdicion();
                                      // Mover a la siguiente celda (siguiente cliente, mismo producto)
                                      const nextCi = (ci+1)%clientes.length;
                                      const nextPi = ci+1>=clientes.length?(ri+1)%prodFiltrados.length:ri;
                                      if(nextPi!==ri||nextCi!==0) {
                                        const nextProd = prodFiltrados[nextPi];
                                        const nextCli  = clientes[nextCi];
                                        if(nextProd&&nextCli) {
                                          const v = getPrecio(nextCli.id, nextProd.id);
                                          setEditCell({clienteId:nextCli.id, prodId:nextProd.id});
                                          setEditVal(v||"");
                                        }
                                      }
                                    }
                                  }}
                                  onBlur={confirmarEdicion}
                                  style={{
                                    width:110,textAlign:"right",fontWeight:700,fontSize:14,
                                    border:`2px solid ${color}`,borderRadius:7,
                                    padding:"5px 8px",color:C.text,outline:"none",
                                    fontFamily:"'DM Mono',monospace",background:"#fff"
                                  }}
                                  placeholder="precio…"
                                />
                              ) : (
                                <div
                                  onClick={()=>{
                                    if(!isAdmin) return;
                                    setEditCell({clienteId:cli.id, prodId:prod.id});
                                    setEditVal(precio||"");
                                  }}
                                  style={{
                                    minHeight:34,display:"flex",alignItems:"center",
                                    justifyContent:"center",borderRadius:7,
                                    transition:"all .12s",
                                    background:precio?color+"12":"transparent",
                                    border:precio?`1px solid ${color}30`:"1px solid transparent",
                                    padding:"4px 8px"
                                  }}
                                  onMouseEnter={e=>{if(isAdmin&&!isEditing)e.currentTarget.style.background=color+"20";}}
                                  onMouseLeave={e=>{if(isAdmin&&!isEditing)e.currentTarget.style.background=precio?color+"12":"transparent";}}>
                                  {precio
                                    ? <span style={{fontWeight:700,fontSize:14,...dm,color}}>
                                        ${Math.round(precio).toLocaleString("es-AR")}
                                      </span>
                                    : isAdmin
                                      ? <span style={{fontSize:11,color:C.muted,fontStyle:"italic"}}>— cargar —</span>
                                      : <span style={{fontSize:11,color:C.muted}}>—</span>}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer con totales por cliente */}
            <div style={{borderTop:`2px solid ${C.border}`,display:"flex",
              position:"sticky",bottom:0,background:"#f8fafc",zIndex:2}}>
              <div style={{padding:"10px 16px",minWidth:220,fontWeight:700,fontSize:11,
                color:C.textSub,display:"flex",alignItems:"center",
                position:"sticky",left:0,background:"#f8fafc",
                boxShadow:"2px 0 4px rgba(0,0,0,.04)"}}>
                Precios cargados
              </div>
              {clientes.map((c,i)=>(
                <div key={c.id} style={{flex:1,minWidth:140,padding:"10px 14px",
                  textAlign:"center",borderLeft:`1px solid ${C.border}`}}>
                  <span style={{fontWeight:700,...dm,fontSize:13,color:COLORS[i%COLORS.length]}}>
                    {(c.precios||[]).length}
                  </span>
                  <span style={{...dm,fontSize:10,color:C.muted}}> / {todosProductos.length}</span>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}


// ── COBROS ───────────────────────────────────────────────────
// Genera boletas para clientes externos basándose en sus pedidos
// y la lista de precios cargada en el módulo Listas precio.
// cobros guardados: parrillas-cobros = [{id, clienteNombre, desde, hasta, items, total, estado, fecha}]

function generarPDFBoleta(boleta) {
  const emitida = new Date().toLocaleDateString("es-AR",{day:"numeric",month:"long",year:"numeric"});
  const periodo = boleta.desde===boleta.hasta
    ? boleta.desde
    : `${boleta.desde} al ${boleta.hasta}`;

  const filas = boleta.items.map((it,i)=>`
    <tr>
      <td style="font-weight:500;padding:11px 14px;border-bottom:1px solid #f1f5f9">${i+1}. ${it.producto}</td>
      <td style="text-align:center;padding:11px 14px;border-bottom:1px solid #f1f5f9;color:#64748b">${it.unidad||"u"}</td>
      <td style="text-align:center;padding:11px 14px;border-bottom:1px solid #f1f5f9;font-weight:700;font-size:15px">${it.cantidad}</td>
      <td style="text-align:right;padding:11px 14px;border-bottom:1px solid #f1f5f9;color:#64748b">
        ${it.precioUnitario>0?"$"+Math.round(it.precioUnitario).toLocaleString("es-AR"):"Sin precio"}
      </td>
      <td style="text-align:right;padding:11px 14px;border-bottom:1px solid #f1f5f9;font-weight:700;font-size:15px;color:#d97706">
        ${it.subtotal>0?"$"+Math.round(it.subtotal).toLocaleString("es-AR"):"—"}
      </td>
      ${it.sinPrecio?`<td style="padding:11px 14px;border-bottom:1px solid #f1f5f9"><span style="background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600">Sin precio cargado</span></td>`:"<td style='border-bottom:1px solid #f1f5f9'></td>"}
    </tr>`).join("");

  const totalSinPrecio = boleta.items.filter(it=>it.sinPrecio).length;

  const html = `<html><head><title>Boleta — ${boleta.clienteNombre}</title><style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Inter',Arial,sans-serif;padding:36px;color:#1e293b;background:#fff;font-size:13px}
    .header{display:flex;justify-content:space-between;align-items:flex-start;
      margin-bottom:28px;padding-bottom:20px;border-bottom:3px solid #d97706}
    .brand{font-size:22px;font-weight:800;color:#d97706}
    .brand-sub{font-size:10px;color:#94a3b8;font-family:monospace;margin-top:2px}
    .boleta-info{text-align:right}
    .boleta-num{font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px}
    .cliente-box{background:#f8fafc;border-radius:10px;padding:16px 20px;margin-bottom:24px;
      display:flex;justify-content:space-between;align-items:center;border:1px solid #e2e8f0}
    .cliente-name{font-size:20px;font-weight:800;color:#1e293b}
    .cliente-sub{font-size:11px;color:#64748b;margin-top:3px}
    table{width:100%;border-collapse:collapse}
    thead tr{background:#f8fafc;border-bottom:2px solid #e2e8f0}
    th{padding:10px 14px;text-align:left;font-size:9px;text-transform:uppercase;
       letter-spacing:1.2px;color:#64748b;font-weight:700}
    .total-row{background:#fef3c7;border-top:2px solid #fde68a}
    .total-row td{padding:14px;font-weight:800;font-size:16px}
    .warning{background:#fef3c7;border:1px solid #fde68a;border-radius:8px;
      padding:10px 14px;margin-top:16px;font-size:11px;color:#92400e}
    .footer{margin-top:28px;padding-top:14px;border-top:1px solid #e2e8f0;
      display:flex;justify-content:space-between;font-size:10px;color:#94a3b8}
    .firma-area{display:flex;gap:40px;margin-top:32px}
    .firma{border-top:1px solid #cbd5e1;padding-top:6px;width:200px;
      text-align:center;font-size:10px;color:#94a3b8}
    @media print{body{padding:20px}}
  </style></head><body>
    <div class="header">
      <div>
        <div class="brand">🔥 PARRILLAS</div>
        <div class="brand-sub">costanera sur · sistema de gestión</div>
      </div>
      <div class="boleta-info">
        <div class="boleta-num">Boleta de cobro</div>
        <div style="font-size:18px;font-weight:700;color:#1e293b">Período: ${periodo}</div>
        <div style="font-size:11px;color:#64748b;margin-top:3px">Emitida el ${emitida}</div>
      </div>
    </div>

    <div class="cliente-box">
      <div>
        <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Cliente</div>
        <div class="cliente-name">${boleta.clienteNombre}</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:10px;color:#94a3b8;margin-bottom:4px">Total a cobrar</div>
        <div style="font-size:28px;font-weight:800;color:#d97706">$${Math.round(boleta.total).toLocaleString("es-AR")}</div>
      </div>
    </div>

    <table>
      <thead><tr>
        <th>Producto</th>
        <th style="text-align:center">Unidad</th>
        <th style="text-align:center">Cantidad</th>
        <th style="text-align:right">Precio unit.</th>
        <th style="text-align:right">Subtotal</th>
        <th></th>
      </tr></thead>
      <tbody>
        ${filas}
        <tr class="total-row">
          <td colspan="2" style="color:#92400e">TOTAL</td>
          <td style="text-align:center;color:#92400e">${boleta.items.reduce((a,i)=>a+i.cantidad,0)} u.</td>
          <td></td>
          <td style="text-align:right;color:#d97706">$${Math.round(boleta.total).toLocaleString("es-AR")}</td>
          <td></td>
        </tr>
      </tbody>
    </table>

    ${totalSinPrecio>0?`<div class="warning">⚠ ${totalSinPrecio} producto${totalSinPrecio>1?"s":""} sin precio cargado en la lista — no se incluyeron en el total.</div>`:""}

    <div class="firma-area">
      <div class="firma">Emitido por</div>
      <div class="firma">Recibido por</div>
    </div>

    <div class="footer">
      <span>Parrillas Costanera Sur</span>
      <span>Generado el ${new Date().toLocaleString("es-AR")}</span>
    </div>
  </body></html>`;

  const w = window.open("","_blank");
  if(!w) return alert("Permitir ventanas emergentes para imprimir");
  w.document.write(html); w.document.close();
  setTimeout(()=>w.print(),500);
}

function ModuloCobros({isAdmin}) {
  const [pedidos]   = useSaved("parrillas-pedidos",       []);
  const [clientes]  = useSaved("parrillas-lista-precios", []);
  const [cobros, setCobros] = useSaved("parrillas-cobros", []);
  const [saved, setSaved]   = useState(false);

  // Formulario de generación de boleta
  const hoy = new Date().toISOString().slice(0,10);
  const [clienteSel, setClienteSel] = useState("");
  const [desde,      setDesde]      = useState(hoy);
  const [hasta,      setHasta]      = useState(hoy);
  const [preview,    setPreview]    = useState(null); // boleta preview

  const doSave = next => { setCobros(next); setSaved(true); setTimeout(()=>setSaved(false),2000); };

  // Clientes externos únicos desde pedidos
  const clientesConPedidos = [...new Set(
    pedidos.filter(p=>p.tipo==="cliente").map(p=>p.nombreMostrar||p.destino)
  )].sort();

  // Generar boleta preview
  const generarPreview = () => {
    if(!clienteSel) return;
    // Pedidos del cliente en el período
    const pedsPeriodo = pedidos.filter(p=>
      p.tipo==="cliente" &&
      (p.nombreMostrar||p.destino)===clienteSel &&
      p.fecha>=desde && p.fecha<=hasta
    );
    if(!pedsPeriodo.length) { alert(`Sin pedidos para ${clienteSel} en ese período.`); return; }

    // Agrupar ítems
    const itemsMap = {};
    pedsPeriodo.forEach(ped=>ped.items.forEach(it=>{
      if(!itemsMap[it.producto]) itemsMap[it.producto]={producto:it.producto,unidad:it.unidad||"u",cantidad:0};
      itemsMap[it.producto].cantidad += it.cantidad;
    }));

    // Buscar precios del cliente
    const listaCliente = clientes.find(c=>c.nombre===clienteSel);
    const precios = listaCliente?.precios||[];

    const items = Object.values(itemsMap).map(it=>{
      const precioObj = precios.find(p=>p.producto===it.producto);
      const precioUnitario = precioObj?.precio||0;
      const subtotal = precioUnitario * it.cantidad;
      return {...it, precioUnitario, subtotal, sinPrecio:!precioObj};
    });

    const total = items.reduce((a,it)=>a+it.subtotal,0);
    setPreview({clienteNombre:clienteSel, desde, hasta, items, total,
      pedidos:pedsPeriodo.length, estado:"pendiente"});
  };

  // Registrar cobro
  const registrarCobro = (estado) => {
    if(!preview) return;
    const nuevo = {id:Date.now(), ...preview, estado, registradoEl:new Date().toLocaleString("es-AR")};
    doSave([nuevo,...cobros]);
    setPreview(null);
  };

  // Stats
  const totalCobrado  = cobros.filter(c=>c.estado==="cobrado").reduce((a,c)=>a+c.total,0);
  const totalPendiente= cobros.filter(c=>c.estado==="pendiente").reduce((a,c)=>a+c.total,0);
  const dm = {fontFamily:"'DM Mono',monospace"};

  const [filtroCli, setFiltroCli] = useState("");
  const cobrosFiltrados = filtroCli
    ? cobros.filter(c=>c.clienteNombre.toLowerCase().includes(filtroCli.toLowerCase()))
    : cobros;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        <KPI label="Boletas emitidas" value={cobros.length.toString()} sub="Histórico total"/>
        <KPI label="Total cobrado" value={totalCobrado>0?fmt(totalCobrado):"—"} sub="Confirmados" color={C.green}/>
        <KPI label="Pendiente de cobro" value={totalPendiente>0?fmt(totalPendiente):"—"} sub="Sin confirmar" color={C.orange}/>
        <KPI label="Clientes externos" value={clientesConPedidos.length.toString()} sub="Con pedidos registrados" color={C.blue}/>
      </div>

      {/* ── GENERADOR DE BOLETA ── */}
      {isAdmin&&(
        <div style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden",
          boxShadow:C.shadow}}>
          <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.border}`,
            background:"linear-gradient(135deg,#fffbeb,#fff7ed)"}}>
            <div style={{fontWeight:700,fontSize:15,color:"#92400e",marginBottom:2}}>💵 Generar boleta de cobro</div>
            <div style={{fontSize:11,color:"#b45309"}}>
              Seleccioná el cliente y el período — se calculará automáticamente en base a los pedidos y la lista de precios.
            </div>
          </div>

          <div style={{padding:"20px",display:"flex",flexDirection:"column",gap:16}}>
            {/* Controles */}
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr auto",gap:12,alignItems:"flex-end"}}>
              <div>
                <div style={{fontSize:9,color:C.textSub,...dm,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>Cliente externo</div>
                <select style={{...inp,width:"100%"}} value={clienteSel}
                  onChange={e=>{ setClienteSel(e.target.value); setPreview(null); }}>
                  <option value="">— elegí un cliente —</option>
                  {clientesConPedidos.map(c=>(
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {clientesConPedidos.length===0&&(
                  <div style={{fontSize:10,color:C.orange,marginTop:4,...dm}}>
                    ⚠ No hay clientes externos. Cargá pedidos de tipo "Cliente externo" en el módulo Pedidos.
                  </div>
                )}
              </div>
              <div>
                <div style={{fontSize:9,color:C.textSub,...dm,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>Desde</div>
                <input type="date" style={{...inp,width:"100%"}} value={desde}
                  onChange={e=>{ setDesde(e.target.value); setPreview(null); }}/>
              </div>
              <div>
                <div style={{fontSize:9,color:C.textSub,...dm,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>Hasta</div>
                <input type="date" style={{...inp,width:"100%"}} value={hasta}
                  onChange={e=>{ setHasta(e.target.value); setPreview(null); }}/>
              </div>
              <button onClick={generarPreview}
                style={{background:C.accent,color:"#fff",border:"none",borderRadius:9,
                  padding:"10px 20px",fontFamily:"'Inter',sans-serif",fontWeight:700,fontSize:13,
                  cursor:"pointer",whiteSpace:"nowrap",
                  boxShadow:`0 2px 8px ${C.accent}40`}}>
                Calcular boleta →
              </button>
            </div>

            {/* Preview boleta */}
            {preview&&(
              <div style={{border:`2px solid #fde68a`,borderRadius:10,overflow:"hidden",
                background:"#fffbeb"}}>
                {/* Header preview */}
                <div style={{padding:"14px 20px",borderBottom:"1px solid #fde68a",
                  display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontWeight:800,fontSize:16,color:"#92400e"}}>{preview.clienteNombre}</div>
                    <div style={{fontSize:11,color:"#b45309",marginTop:2,...dm}}>
                      {preview.desde===preview.hasta?preview.desde:`${preview.desde} al ${preview.hasta}`}
                      {" · "}{preview.pedidos} pedido{preview.pedidos!==1?"s":""}
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:10,color:"#b45309",marginBottom:3,...dm}}>TOTAL A COBRAR</div>
                    <div style={{fontWeight:900,fontSize:28,...dm,color:"#d97706"}}>
                      {fmt(preview.total)}
                    </div>
                  </div>
                </div>

                {/* Items table */}
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead>
                      <tr style={{background:"#fef3c7"}}>
                        <Th>Producto</Th>
                        <Th>Unidad</Th>
                        <Th style={{textAlign:"center"}}>Cantidad</Th>
                        <Th style={{textAlign:"right"}}>Precio unit.</Th>
                        <Th style={{textAlign:"right"}}>Subtotal</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.items.map((it,i)=>(
                        <tr key={i}
                          onMouseEnter={e=>e.currentTarget.style.background="#fef9ee"}
                          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          <Td>
                            <strong style={{fontSize:13}}>{it.producto}</strong>
                            {it.sinPrecio&&(
                              <span style={{marginLeft:8,background:"#fef3c7",color:"#92400e",
                                border:"1px solid #fde68a",borderRadius:10,
                                padding:"1px 7px",fontSize:9,fontWeight:700}}>
                                Sin precio
                              </span>
                            )}
                          </Td>
                          <Td style={{...dm,fontSize:11,color:C.textSub}}>{it.unidad}</Td>
                          <Td style={{textAlign:"center",...dm,fontWeight:700,fontSize:15,color:C.text}}>
                            {it.cantidad}
                          </Td>
                          <Td style={{textAlign:"right",...dm,fontSize:12,color:C.textSub}}>
                            {it.precioUnitario>0?fmt(it.precioUnitario):<span style={{color:C.orange}}>—</span>}
                          </Td>
                          <Td style={{textAlign:"right",...dm,fontWeight:700,fontSize:15,
                            color:it.sinPrecio?C.muted:C.accent}}>
                            {it.sinPrecio?"—":fmt(it.subtotal)}
                          </Td>
                        </tr>
                      ))}
                      {/* Totales */}
                      <tr style={{background:"#fef3c7",borderTop:"2px solid #fde68a"}}>
                        <Td colSpan={2} style={{fontWeight:800,color:"#92400e",fontSize:14}}>TOTAL</Td>
                        <Td style={{textAlign:"center",...dm,fontWeight:700,color:"#92400e"}}>
                          {preview.items.reduce((a,i)=>a+i.cantidad,0)} u.
                        </Td>
                        <Td/>
                        <Td style={{textAlign:"right",...dm,fontWeight:900,fontSize:18,color:"#d97706"}}>
                          {fmt(preview.total)}
                        </Td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Advertencia sin precio */}
                {preview.items.some(it=>it.sinPrecio)&&(
                  <div style={{margin:"10px 20px",padding:"9px 14px",background:"#fff7ed",
                    border:"1px solid #fed7aa",borderRadius:8,fontSize:11,color:"#9a3412"}}>
                    ⚠️ <strong>{preview.items.filter(it=>it.sinPrecio).length} producto{preview.items.filter(it=>it.sinPrecio).length!==1?"s":""}</strong> sin precio en la lista de {preview.clienteNombre}.
                    Cargalos en <strong>Listas precio</strong> para incluirlos en el total.
                  </div>
                )}

                {/* Acciones */}
                <div style={{padding:"14px 20px",borderTop:"1px solid #fde68a",
                  display:"flex",gap:10,justifyContent:"flex-end",alignItems:"center"}}>
                  <span style={{fontSize:11,color:"#b45309",...dm,marginRight:8}}>
                    ¿Qué querés hacer con esta boleta?
                  </span>
                  <button onClick={()=>generarPDFBoleta(preview)}
                    style={{background:"#fff",color:"#d97706",border:"2px solid #fde68a",
                      borderRadius:8,padding:"9px 18px",fontFamily:"'Inter',sans-serif",
                      fontWeight:600,fontSize:12,cursor:"pointer",
                      display:"flex",alignItems:"center",gap:6}}>
                    📄 Ver PDF
                  </button>
                  <button onClick={()=>registrarCobro("pendiente")}
                    style={{background:"#fff7ed",color:"#ea580c",border:"1px solid #fed7aa",
                      borderRadius:8,padding:"9px 18px",fontFamily:"'Inter',sans-serif",
                      fontWeight:600,fontSize:12,cursor:"pointer"}}>
                    💾 Guardar como pendiente
                  </button>
                  <button onClick={()=>registrarCobro("cobrado")}
                    style={{background:C.green,color:"#fff",border:"none",
                      borderRadius:8,padding:"9px 18px",fontFamily:"'Inter',sans-serif",
                      fontWeight:700,fontSize:12,cursor:"pointer"}}>
                    ✓ Guardar como cobrado
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── HISTORIAL DE COBROS ── */}
      <div style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden",boxShadow:C.shadow}}>
        <div style={{padding:"13px 20px",borderBottom:`1px solid ${C.border}`,
          display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontWeight:700,fontSize:14,color:C.text}}>Historial de cobros</span>
            <Saved show={saved}/>
          </div>
          <input value={filtroCli} onChange={e=>setFiltroCli(e.target.value)}
            placeholder="🔍 Buscar cliente…"
            style={{...inp,width:180,padding:"5px 10px",fontSize:12}}/>
        </div>

        {cobros.length===0
          ? <div style={{padding:"48px",textAlign:"center",color:C.muted,...dm,fontSize:11}}>
              <div style={{fontSize:32,marginBottom:12}}>💵</div>
              <div>Sin boletas registradas aún.</div>
              {isAdmin&&<div style={{marginTop:6,color:C.textSub}}>Generá la primera boleta con el formulario de arriba.</div>}
            </div>
          : <div style={{maxHeight:520,overflowY:"auto"}}>
              {cobrosFiltrados.map(cobro=>{
                const esHoy = cobro.registradoEl?.startsWith(new Date().toLocaleDateString("es-AR"));
                return (
                  <div key={cobro.id}
                    style={{borderBottom:`1px solid ${C.border}`,padding:"14px 20px",
                      transition:"background .12s"}}
                    onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                      <div>
                        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                          <strong style={{fontSize:15,color:C.text}}>{cobro.clienteNombre}</strong>
                          <Badge color={cobro.estado==="cobrado"?C.green:C.orange}>
                            {cobro.estado==="cobrado"?"✓ Cobrado":"⏳ Pendiente"}
                          </Badge>
                          {esHoy&&<Badge color={C.blue}>Hoy</Badge>}
                        </div>
                        <div style={{fontSize:11,color:C.textSub,...dm}}>
                          Período: {cobro.desde===cobro.hasta?cobro.desde:`${cobro.desde} al ${cobro.hasta}`}
                          {" · "}{cobro.pedidos} pedido{cobro.pedidos!==1?"s":""}
                          {" · "}{cobro.registradoEl}
                        </div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontWeight:900,fontSize:20,...dm,
                            color:cobro.estado==="cobrado"?C.green:C.orange}}>
                            {fmt(cobro.total)}
                          </div>
                          <div style={{fontSize:10,color:C.muted,...dm}}>
                            {cobro.items.reduce((a,i)=>a+i.cantidad,0)} unidades · {cobro.items.length} productos
                          </div>
                        </div>
                        <div style={{display:"flex",gap:6,flexDirection:"column"}}>
                          <button onClick={()=>generarPDFBoleta(cobro)}
                            style={{background:"#fef3c7",color:"#92400e",border:"1px solid #fde68a",
                              borderRadius:7,padding:"5px 12px",fontSize:11,cursor:"pointer",
                              fontFamily:"'Inter',sans-serif",fontWeight:600}}>
                            📄 PDF
                          </button>
                          {isAdmin&&cobro.estado==="pendiente"&&(
                            <button onClick={()=>doSave(cobros.map(c=>c.id===cobro.id?{...c,estado:"cobrado"}:c))}
                              style={{background:"#dcfce7",color:"#15803d",border:"1px solid #86efac",
                                borderRadius:7,padding:"5px 12px",fontSize:11,cursor:"pointer",
                                fontFamily:"'Inter',sans-serif",fontWeight:600}}>
                              ✓ Marcar cobrado
                            </button>
                          )}
                          {isAdmin&&<button onClick={()=>doSave(cobros.filter(x=>x.id!==cobro.id))}
                            style={{background:"transparent",border:"none",color:C.red,
                              cursor:"pointer",fontSize:12,opacity:.4,textAlign:"center"}}>× eliminar</button>}
                        </div>
                      </div>
                    </div>
                    {/* Items resumidos */}
                    <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                      {cobro.items.map((it,i)=>(
                        <span key={i} style={{background:"#f1f5f9",border:"1px solid #e2e8f0",
                          borderRadius:5,padding:"2px 9px",fontSize:11,...dm}}>
                          {it.producto}
                          <span style={{fontWeight:700,color:C.accent,marginLeft:4}}>{it.cantidad}</span>
                          {it.sinPrecio&&<span style={{color:C.orange,marginLeft:3}}>⚠</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>}
      </div>

      {/* Resumen por cliente */}
      {cobros.length>0&&(
        <div style={{background:"#fff",border:`1px solid ${C.border}`,borderRadius:12,padding:"16px 20px",boxShadow:C.shadow}}>
          <div style={{fontWeight:700,fontSize:13,color:C.text,marginBottom:12}}>Resumen por cliente</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
            {clientesConPedidos.map((nombre,i)=>{
              const cobrosCliente = cobros.filter(c=>c.clienteNombre===nombre);
              if(!cobrosCliente.length) return null;
              const totalC = cobrosCliente.filter(c=>c.estado==="cobrado").reduce((a,c)=>a+c.total,0);
              const totalP = cobrosCliente.filter(c=>c.estado==="pendiente").reduce((a,c)=>a+c.total,0);
              return (
                <div key={nombre} style={{background:"#f8fafc",border:`1px solid ${C.border}`,
                  borderRadius:10,padding:"12px 16px",minWidth:200,
                  borderLeft:`3px solid ${COLORS[i%COLORS.length]}`}}>
                  <div style={{fontWeight:700,fontSize:13,color:C.text,marginBottom:6}}>{nombre}</div>
                  <div style={{display:"flex",gap:16}}>
                    {totalC>0&&<div>
                      <div style={{fontSize:9,...dm,textTransform:"uppercase",letterSpacing:1,color:C.green,marginBottom:2}}>Cobrado</div>
                      <div style={{fontWeight:700,...dm,color:C.green}}>{fmt(totalC)}</div>
                    </div>}
                    {totalP>0&&<div>
                      <div style={{fontSize:9,...dm,textTransform:"uppercase",letterSpacing:1,color:C.orange,marginBottom:2}}>Pendiente</div>
                      <div style={{fontWeight:700,...dm,color:C.orange}}>{fmt(totalP)}</div>
                    </div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── ROLES ─────────────────────────────────────────────────────
// admin    → ve y edita todo
// operador → ve y edita todo EXCEPTO Sueldos y Costos (ocultos)
// lector   → solo lectura, solo Stock y Pedidos

const MODS_ALL = [
  {id:"sueldos",     label:"Sueldos",      icon:"👥", desc:"15 empleados",        roles:["admin"]},
  {id:"stock",       label:"Stock",        icon:"📦", desc:"M. Acosta · Cruz",    roles:["admin","operador","lector"]},
  {id:"pedidos",     label:"Pedidos",      icon:"🛒", desc:"Despacho · clientes", roles:["admin","operador","lector"]},
  {id:"precios",     label:"Listas precio",icon:"🏷️", desc:"Precios por cliente",  roles:["admin","operador"]},
  {id:"cobros",      label:"Cobros",       icon:"💵", desc:"Boletas · clientes",   roles:["admin","operador"]},
  {id:"costos",      label:"Costos",       icon:"💰", desc:"Márgenes · costos",   roles:["admin"]},
  {id:"proveedores", label:"Proveedores",  icon:"🤝", desc:"Cuentas corrientes",   roles:["admin","operador"]},
  {id:"ventas",      label:"Ventas",       icon:"📊", desc:"6 locales · costanera",roles:["admin","operador"]},
];

const ROLE_META = {
  admin:    {label:"ADMIN",    color:"#d97706", desc:"Acceso total"},
  operador: {label:"OPERADOR", color:"#16a34a", desc:"Operaciones"},
  lector:   {label:"LECTOR",   color:"#2563eb", desc:"Solo lectura"},
};

// ── LOGIN ─────────────────────────────────────────────────────
function Login({onLogin}) {
  const [pass, setPass]   = useState("");
  const [error, setError] = useState(false);
  const [show, setShow]   = useState(false);

  const intentar = () => {
    if(pass===PASS_ADMIN)    { onLogin("admin");    return; }
    if(pass===PASS_OPERADOR) { onLogin("operador"); return; }
    if(pass===PASS_LECTOR)   { onLogin("lector");  return; }
    setError(true); setTimeout(()=>setError(false),2000);
  };

  const ROLES_INFO = [
    {label:"ADMIN",    color:"#d97706", desc:"Acceso total · todos los módulos"},
    {label:"OPERADOR", color:"#16a34a", desc:"Operaciones · sin Sueldos ni Costos"},
    {label:"LECTOR",   color:"#2563eb", desc:"Solo lectura · Stock y Pedidos"},
  ];

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg, #fef3c7 0%, #fff7ed 50%, #fef9ee 100%)",
      display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',sans-serif"}}>
      <div style={{background:"#ffffff",border:"1px solid #e2e8f0",borderRadius:16,
        padding:"48px 44px",width:380,display:"flex",flexDirection:"column",gap:24,
        boxShadow:"0 20px 60px rgba(0,0,0,.12)"}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:36,marginBottom:8}}>🔥</div>
          <div style={{color:"#d97706",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:22,letterSpacing:-0.5}}>PARRILLAS</div>
          <div style={{color:"#94a3b8",fontSize:11,fontFamily:"'DM Mono',monospace",marginTop:3}}>sistema de gestión · costanera sur</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <label style={{color:"#64748b",fontSize:11,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1}}>Contraseña</label>
          <div style={{position:"relative"}}>
            <input type={show?"text":"password"} value={pass}
              onChange={e=>setPass(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&intentar()}
              placeholder="Ingresá tu contraseña"
              style={{width:"100%",background:"#f8fafc",
                border:`1.5px solid ${error?"#dc2626":"#e2e8f0"}`,
                borderRadius:9,padding:"12px 42px 12px 14px",color:"#1e293b",fontSize:13,
                fontFamily:"'Inter',sans-serif",outline:"none",boxSizing:"border-box",transition:"border-color .2s"}}/>
            <button onClick={()=>setShow(!show)} style={{position:"absolute",right:12,top:"50%",
              transform:"translateY(-50%)",background:"transparent",border:"none",
              color:"#94a3b8",cursor:"pointer",fontSize:15}}>
              {show?"🙈":"👁️"}
            </button>
          </div>
          {error&&<div style={{color:"#dc2626",fontSize:11,fontFamily:"'DM Mono',monospace"}}>✕ Contraseña incorrecta</div>}
        </div>
        <button onClick={intentar}
          style={{background:"#d97706",color:"#fff",border:"none",borderRadius:10,
            padding:"14px",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:14,cursor:"pointer",
            boxShadow:"0 4px 20px rgba(217,119,6,.35)",letterSpacing:.3,transition:"all .2s"}}
          onMouseEnter={e=>e.currentTarget.style.transform="translateY(-1px)"}
          onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
          Ingresar →
        </button>
        <div style={{borderTop:"1px solid #e2e8f0",paddingTop:16,display:"flex",flexDirection:"column",gap:9}}>
          {ROLES_INFO.map(r=>(
            <div key={r.label} style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{background:r.color+"18",color:r.color,border:`1px solid ${r.color}44`,
                padding:"2px 9px",borderRadius:20,fontSize:9,fontFamily:"'DM Mono',monospace",
                fontWeight:700,whiteSpace:"nowrap",minWidth:68,textAlign:"center"}}>
                {r.label}
              </span>
              <span style={{color:"#64748b",fontSize:11}}>{r.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────
export default function App() {
  const [role,    setRole]   = useState(null);
  const [mod,     setMod]    = useState(null); // null until we know role
  const [loading, setLoading]= useState(!_cloud);
  const syncStatus = useSyncStatus();

  useEffect(()=>{
    if(_cloud) { setLoading(false); return; }
    cloudRead().then(record=>{
      _cloud = record;
      Object.entries(record).forEach(([k,v])=>{
        try{localStorage.setItem(k,JSON.stringify(v));}catch{}
      });
      setLoading(false);
    }).catch(()=>{ _cloud={}; setLoading(false); });
  },[]);

  // When role is set, pick the first allowed module
  const handleLogin = (r) => {
    setRole(r);
    const firstMod = MODS_ALL.find(m=>m.roles.includes(r));
    setMod(firstMod?.id||"stock");
  };

  if(loading) return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#fef3c7,#fff7ed)",
      display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,
      fontFamily:"'Inter',sans-serif"}}>
      <div style={{fontSize:40}}>🔥</div>
      <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:20,color:"#d97706"}}>PARRILLAS</div>
      <div style={{display:"flex",alignItems:"center",gap:10,color:"#64748b",fontSize:13}}>
        <div style={{width:18,height:18,border:"2px solid #e2e8f0",borderTop:"2px solid #d97706",
          borderRadius:"50%",animation:"spin .8s linear infinite"}}/>
        Sincronizando datos…
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if(!role) return <Login onLogin={handleLogin}/>;

  const isAdmin = role==="admin";
  const canEdit = role==="admin" || role==="operador"; // lector no puede editar
  const modsFiltrados = MODS_ALL.filter(m=>m.roles.includes(role));
  const actual = modsFiltrados.find(m=>m.id===mod) || modsFiltrados[0];
  const roleMeta = ROLE_META[role];

  return (
    <div style={{display:"flex",height:"100vh",width:"100vw",background:C.bg,fontFamily:"'Inter',sans-serif",color:C.text,overflow:"hidden"}}>
      {/* Sidebar */}
      <div style={{width:220,background:C.panel,borderRight:`1px solid ${C.border}`,
        display:"flex",flexDirection:"column",flexShrink:0,height:"100vh",
        boxShadow:"2px 0 8px rgba(0,0,0,.06)"}}>
        <div style={{padding:"22px 18px 18px",borderBottom:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
            <div style={{width:36,height:36,borderRadius:9,background:C.accent,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🔥</div>
            <div>
              <div style={{color:C.text,fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:15,letterSpacing:-0.5}}>PARRILLAS</div>
              <div style={{color:C.muted,fontSize:9,fontFamily:"'DM Mono',monospace"}}>costanera sur</div>
            </div>
          </div>
        </div>
        <nav style={{flex:1,padding:"8px 6px",display:"flex",flexDirection:"column",gap:2,overflowY:"auto"}}>
          {modsFiltrados.map(m=>(
            <button key={m.id} onClick={()=>setMod(m.id)}
              style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",borderRadius:8,border:"none",
                cursor:"pointer",textAlign:"left",width:"100%",
                background:actual?.id===m.id?"#fef3c7":"transparent",
                transition:"all .15s"}}
              onMouseEnter={e=>{ if(actual?.id!==m.id) e.currentTarget.style.background="#f8fafc"; }}
              onMouseLeave={e=>{ if(actual?.id!==m.id) e.currentTarget.style.background="transparent"; }}>
              <div style={{width:32,height:32,borderRadius:8,
                background:actual?.id===m.id?C.accent+"20":"#f1f5f9",
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>
                {m.icon}
              </div>
              <div>
                <div style={{color:actual?.id===m.id?C.accent:C.text,fontSize:12,fontWeight:actual?.id===m.id?600:400}}>{m.label}</div>
                <div style={{color:C.muted,fontSize:9,fontFamily:"'DM Mono',monospace",marginTop:1}}>{m.desc}</div>
              </div>
            </button>
          ))}
        </nav>
        <div style={{padding:"12px 16px",borderTop:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8,fontSize:10,color:C.muted,fontFamily:"'DM Mono',monospace"}}>
            <div style={{width:6,height:6,borderRadius:"50%",flexShrink:0,
              background:syncStatus==="saving"?C.orange:syncStatus==="error"?C.red:C.green,
              animation:syncStatus==="saving"?"pulse .8s ease-in-out infinite":"none"}}/>
            {syncStatus==="saving"?"guardando…":syncStatus==="error"?"error al sincronizar":"sincronizado"}
          </div>
          <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
            <span style={{background:roleMeta.color+"18",color:roleMeta.color,
              border:`1px solid ${roleMeta.color}44`,
              padding:"2px 9px",borderRadius:20,fontSize:9,fontFamily:"'DM Mono',monospace",fontWeight:700}}>
              {roleMeta.label}
            </span>
            <button onClick={()=>{setRole(null);setMod(null);}}
              style={{background:"transparent",border:"none",
                color:C.muted,cursor:"pointer",fontSize:9,fontFamily:"'DM Mono',monospace",textDecoration:"underline"}}>
              salir
            </button>
          </div>
          <div style={{color:C.muted,fontSize:9,fontFamily:"'DM Mono',monospace"}}>
            {new Date().toLocaleDateString("es-AR",{weekday:"short",day:"numeric",month:"short"})}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div style={{flex:1,overflow:"auto",display:"flex",flexDirection:"column",minWidth:0}}>
        <div style={{padding:"18px 28px",borderBottom:`1px solid ${C.border}`,background:C.panel,
          position:"sticky",top:0,zIndex:10,
          boxShadow:`0 1px 0 ${C.border}, 0 2px 4px rgba(0,0,0,.04)`}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:40,height:40,borderRadius:10,background:C.accent+"18",
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,
              border:`1px solid ${C.accent}22`}}>{actual?.icon}</div>
            <div>
              <h1 style={{margin:0,fontSize:18,fontWeight:800,letterSpacing:-0.5,color:C.text}}>{actual?.label}</h1>
              <p style={{margin:0,color:C.textSub,fontSize:10,fontFamily:"'DM Mono',monospace",marginTop:1}}>{actual?.desc}</p>
            </div>
            {!canEdit&&(
              <span style={{marginLeft:"auto",background:C.blue+"15",color:C.blue,
                border:`1px solid ${C.blue}30`,padding:"4px 12px",borderRadius:6,
                fontSize:10,fontFamily:"'DM Mono',monospace"}}>
                👁 modo lectura
              </span>
            )}
          </div>
        </div>
        <div style={{padding:"24px 32px",flex:1}}>
          {actual?.id==="sueldos"     && <ModuloSueldos     isAdmin={isAdmin}/>}
          {actual?.id==="stock"       && <ModuloStock        isAdmin={canEdit}/>}
          {actual?.id==="pedidos"     && <ModuloPedidos      isAdmin={canEdit}/>}
          {actual?.id==="costos"      && <ModuloCostos       isAdmin={isAdmin}/>}
          {actual?.id==="precios"     && <ModuloPrecios      isAdmin={canEdit}/>}
          {actual?.id==="cobros"      && <ModuloCobros       isAdmin={canEdit}/>}
          {actual?.id==="proveedores" && <ModuloProveedores  isAdmin={canEdit}/>}
          {actual?.id==="ventas"      && <ModuloVentas       isAdmin={canEdit}/>}
        </div>
      </div>
    </div>
  );
}
