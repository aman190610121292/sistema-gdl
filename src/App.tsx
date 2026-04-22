import { useState, useCallback } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from "recharts";

// ── FUENTES ───────────────────────────────────────────────────
const fl = document.createElement("link");
fl.rel = "stylesheet";
fl.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap";
document.head.appendChild(fl);

// ── COLORES ───────────────────────────────────────────────────
const C = {
  bg:"#0d0f14", panel:"#13161e", card:"#1a1e2a", border:"#252a38",
  accent:"#e8c547", green:"#4ade80", red:"#f87171", blue:"#60a5fa",
  orange:"#f97316", purple:"#a78bfa", muted:"#5a6070", text:"#e2e6f0", textSub:"#8a92a6"
};
const COLORS = ["#e8c547","#60a5fa","#4ade80","#f97316","#a78bfa","#f472b6"];
const fmt = (n) => "$" + Math.round(n).toLocaleString("es-AR");

// ── CONTRASEÑAS ───────────────────────────────────────────────
const PASS_ADMIN  = "parrillas2026";
const PASS_LECTOR = "user1";

// ── PERSISTENCIA (localStorage con fallback) ──────────────────
function load(key, def) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; }
  catch { return def; }
}
function persist(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
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

const COSTOS_INIT = [
  {id:1,producto:"B1 (unidad)",compra:0,gastos:0,margen:0},
  {id:2,producto:"BL1 (unidad)",compra:0,gastos:0,margen:0},
  {id:3,producto:"Jamón Feteado ROCA",compra:0,gastos:0,margen:0},
  {id:4,producto:"Queso Feteado ROCA",compra:0,gastos:0,margen:0},
  {id:5,producto:"Coca CH (cajón)",compra:0,gastos:0,margen:0},
  {id:6,producto:"Pan Paty (unidad)",compra:0,gastos:0,margen:0},
  {id:7,producto:"Chori (unidad)",compra:0,gastos:0,margen:0},
  {id:8,producto:"Provoletas",compra:0,gastos:0,margen:0},
];

const LOCALES = ["LITO'S","FARO","HOMERO","DON JOSÉ","GAUCHITO","AMPARITO"];
const LKEYS   = ["LITOS","FARO","HOMERO","DONJOSE","GAUCHITO","AMPARITO"];
const VENTAS_INIT = ["Oct","Nov","Dic","Ene","Feb","Mar"].map(mes =>
  ({mes,...Object.fromEntries(LKEYS.map(k=>[k,0]))})
);

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
const inp = {background:C.bg,border:`1px solid ${C.border}`,borderRadius:5,
  padding:"7px 10px",color:C.text,fontSize:12,fontFamily:"'DM Mono',monospace",outline:"none"};

const Badge = ({children,color=C.accent}) => (
  <span style={{background:color+"22",color,border:`1px solid ${color}44`,
    padding:"2px 8px",borderRadius:4,fontSize:10,fontFamily:"'DM Mono',monospace",fontWeight:600,whiteSpace:"nowrap"}}>
    {children}
  </span>
);

const KPI = ({label,value,sub,color=C.accent}) => (
  <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"15px 18px",borderLeft:`3px solid ${color}`}}>
    <div style={{color:C.textSub,fontSize:10,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{label}</div>
    <div style={{color,fontSize:20,fontFamily:"'Syne',sans-serif",fontWeight:700,lineHeight:1.1}}>{value}</div>
    {sub && <div style={{color:C.muted,fontSize:10,marginTop:3}}>{sub}</div>}
  </div>
);

const Th = ({children,style={}}) => (
  <th style={{padding:"8px 12px",textAlign:"left",color:C.textSub,fontSize:10,
    fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1,
    borderBottom:`1px solid ${C.border}`,fontWeight:500,whiteSpace:"nowrap",...style}}>{children}</th>
);
const Td = ({children,style={},colSpan}) => (
  <td colSpan={colSpan} style={{padding:"7px 12px",color:C.text,fontSize:12,
    borderBottom:`1px solid ${C.border}16`,verticalAlign:"middle",...style}}>{children}</td>
);

const rh = {
  onMouseEnter: e => { e.currentTarget.style.background = C.bg+"cc"; },
  onMouseLeave: e => { e.currentTarget.style.background = "transparent"; }
};

const TabBtn = ({active,onClick,children,color=C.accent}) => (
  <button onClick={onClick} style={{background:active?color:C.bg,
    color:active?(color===C.accent?C.bg:"#000"):C.textSub,
    border:`1px solid ${active?color:C.border}`,borderRadius:5,
    padding:"4px 11px",fontFamily:"'DM Mono',monospace",fontSize:10,cursor:"pointer"}}>{children}</button>
);

const SmBtn = ({onClick,children,color=C.green}) => (
  <button onClick={onClick} style={{background:color,border:"none",borderRadius:4,
    padding:"3px 8px",color:"#000",cursor:"pointer",fontSize:10}}>{children}</button>
);

const GhBtn = ({onClick,children}) => (
  <button onClick={onClick} style={{background:"transparent",border:`1px solid ${C.border}`,
    borderRadius:3,padding:"1px 5px",color:C.textSub,cursor:"pointer",fontSize:9}}>{children}</button>
);

const Saved = ({show}) => (
  <span style={{color:C.green,fontSize:10,fontFamily:"'DM Mono',monospace",
    opacity:show?1:0,transition:"opacity .4s",display:"inline-flex",alignItems:"center",gap:4}}>
    ✓ guardado
  </span>
);

const PDFBtn = ({onClick}) => (
  <button onClick={onClick}
    style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:6,
      padding:"5px 12px",color:C.textSub,cursor:"pointer",fontSize:11,
      fontFamily:"'DM Mono',monospace",display:"inline-flex",alignItems:"center",gap:5}}
    onMouseEnter={e=>{e.currentTarget.style.borderColor=C.accent;e.currentTarget.style.color=C.accent;}}
    onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.textSub;}}>
    📄 PDF
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
  const [saved, setSaved] = useState(false);
  const [dep, setDep]     = useState(0);
  const [cat, setCat]     = useState("Todas");
  const [search, setSearch] = useState("");
  const [modal, setModal]   = useState(null);

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
  const [stock, setStock]     = useSaved("parrillas-stock", STOCK_INIT);
  const [pedidos, setPedidos] = useSaved("parrillas-pedidos", []);
  const [saved, setSaved]     = useState(false);
  const [search, setSearch]   = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({tipo:"local",destino:"LITO'S",clienteNombre:"",
    fecha:new Date().toISOString().slice(0,10),items:[]});
  const [itemForm, setItemForm] = useState({stockId:"",cantidad:"1"});

  const saveP = next => { setPedidos(next); setSaved(true); setTimeout(()=>setSaved(false),2000); };

  const addItem = () => {
    if(!itemForm.stockId) return;
    const prod = stock.find(s=>s.id===+itemForm.stockId);
    if(!prod) return;
    const cant = Math.max(1,+itemForm.cantidad);
    const existe = form.items.find(i=>i.stockId===prod.id);
    if(existe) setForm(f=>({...f,items:f.items.map(i=>i.stockId===prod.id?{...i,cantidad:i.cantidad+cant}:i)}));
    else setForm(f=>({...f,items:[...f.items,{stockId:prod.id,producto:prod.producto,cantidad:cant,unidad:prod.unidad||"u"}]}));
    setItemForm({stockId:"",cantidad:"1"});
  };

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
    setShowForm(false);
  };

  const filtrado  = search ? pedidos.filter(p=>(p.nombreMostrar||"").toLowerCase().includes(search.toLowerCase())) : pedidos;
  const hoy       = new Date().toISOString().slice(0,10);
  const pedidosHoy= pedidos.filter(p=>p.fecha===hoy).length;
  const totalU    = pedidos.reduce((a,p)=>a+p.items.reduce((b,i)=>b+i.cantidad,0),0);
  const clientes  = [...new Set(pedidos.filter(p=>p.tipo==="cliente").map(p=>p.nombreMostrar||p.destino))];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        <KPI label="Pedidos totales" value={pedidos.length.toString()} sub="Historial"/>
        <KPI label="Pedidos hoy" value={pedidosHoy.toString()} sub={new Date().toLocaleDateString("es-AR")} color={C.blue}/>
        <KPI label="Unidades despachadas" value={totalU.toString()} sub="Total histórico" color={C.green}/>
        <KPI label="Clientes externos" value={clientes.length.toString()} sub={clientes.slice(0,2).join(", ")||"—"} color={C.orange}/>
      </div>

      {isAdmin&&(
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",borderBottom:`1px solid ${C.border}`}}>
            <span style={{color:C.text,fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14}}>Nuevo Pedido</span>
            <button onClick={()=>setShowForm(!showForm)}
              style={{background:showForm?C.muted:C.accent,color:C.bg,border:"none",borderRadius:6,
                padding:"6px 14px",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:12,cursor:"pointer"}}>
              {showForm?"Cancelar":"+ Cargar pedido"}
            </button>
          </div>
          {showForm&&(
            <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:14,background:C.bg}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                <div>
                  <div style={{color:C.textSub,fontSize:9,fontFamily:"'DM Mono',monospace",marginBottom:3,textTransform:"uppercase",letterSpacing:1}}>Tipo</div>
                  <select style={{...inp,width:"100%"}} value={form.tipo}
                    onChange={e=>setForm(f=>({...f,tipo:e.target.value,destino:e.target.value==="local"?"LITO'S":"",clienteNombre:""}))}>
                    <option value="local">Local propio</option>
                    <option value="cliente">Cliente externo</option>
                  </select>
                </div>
                {form.tipo==="local"
                  ? <div>
                      <div style={{color:C.textSub,fontSize:9,fontFamily:"'DM Mono',monospace",marginBottom:3,textTransform:"uppercase",letterSpacing:1}}>Local</div>
                      <select style={{...inp,width:"100%"}} value={form.destino}
                        onChange={e=>setForm(f=>({...f,destino:e.target.value}))}>
                        {LOCALES_OPT.map(l=><option key={l}>{l}</option>)}
                      </select>
                    </div>
                  : <div>
                      <div style={{color:C.textSub,fontSize:9,fontFamily:"'DM Mono',monospace",marginBottom:3,textTransform:"uppercase",letterSpacing:1}}>Nombre del cliente</div>
                      <input style={{...inp,width:"100%"}} value={form.clienteNombre}
                        placeholder="Ej: Restaurante El Sur…"
                        onChange={e=>setForm(f=>({...f,clienteNombre:e.target.value}))}/>
                    </div>}
                <div>
                  <div style={{color:C.textSub,fontSize:9,fontFamily:"'DM Mono',monospace",marginBottom:3,textTransform:"uppercase",letterSpacing:1}}>Fecha</div>
                  <input type="date" style={{...inp,width:"100%"}} value={form.fecha}
                    onChange={e=>setForm(f=>({...f,fecha:e.target.value}))}/>
                </div>
              </div>

              <div style={{border:`1px solid ${C.border}`,borderRadius:7,overflow:"hidden"}}>
                <div style={{padding:"10px 14px",background:C.panel,display:"flex",gap:8,alignItems:"flex-end",flexWrap:"wrap"}}>
                  <div style={{flex:2,minWidth:160}}>
                    <div style={{color:C.textSub,fontSize:9,fontFamily:"'DM Mono',monospace",marginBottom:3}}>PRODUCTO</div>
                    <select style={{...inp,width:"100%"}} value={itemForm.stockId}
                      onChange={e=>setItemForm(f=>({...f,stockId:e.target.value}))}>
                      <option value="">— elegí un producto —</option>
                      {stock.map(s=><option key={s.id} value={s.id}>
                        {s.producto} ({s.deposito===1?"M.Acosta":"Cruz"}) — stock: {s.stock} {s.unidad||"u"}
                      </option>)}
                    </select>
                  </div>
                  <div style={{width:90}}>
                    <div style={{color:C.textSub,fontSize:9,fontFamily:"'DM Mono',monospace",marginBottom:3}}>CANTIDAD</div>
                    <input type="number" min="1" style={{...inp,width:"100%"}} value={itemForm.cantidad}
                      onChange={e=>setItemForm(f=>({...f,cantidad:e.target.value}))}/>
                  </div>
                  <SmBtn onClick={addItem}>+ Agregar</SmBtn>
                </div>
                {form.items.length>0&&(
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead><tr><Th>Producto</Th><Th>Cantidad</Th><Th>Stock</Th><Th></Th></tr></thead>
                    <tbody>
                      {form.items.map((it,i)=>{
                        const prod = stock.find(s=>s.id===it.stockId);
                        return (
                          <tr key={i} {...rh}>
                            <Td><strong>{it.producto}</strong></Td>
                            <Td style={{fontFamily:"'DM Mono',monospace",color:C.accent,fontWeight:700}}>{it.cantidad} {it.unidad}</Td>
                            <Td><Badge color={prod&&prod.stock>=it.cantidad?C.green:C.red}>{prod?`${prod.stock} ${prod.unidad||"u"}`:"?"}</Badge></Td>
                            <Td><button onClick={()=>setForm(f=>({...f,items:f.items.filter((_,j)=>j!==i)}))}
                              style={{background:"transparent",border:"none",color:C.red,cursor:"pointer",fontSize:13,opacity:.6}}>×</button></Td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {form.items.length>0&&(
                <div style={{display:"flex",justifyContent:"flex-end",gap:10,alignItems:"center"}}>
                  <span style={{color:C.textSub,fontSize:11,fontFamily:"'DM Mono',monospace"}}>
                    {form.items.length} producto{form.items.length>1?"s":""} · {form.tipo==="cliente"?form.clienteNombre||"Cliente externo":form.destino}
                  </span>
                  <button onClick={confirmar} style={{background:C.green,color:"#000",border:"none",
                    borderRadius:7,padding:"9px 22px",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:13,cursor:"pointer"}}>
                    ✓ Confirmar y descontar del stock
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",borderBottom:`1px solid ${C.border}`}}>
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
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar…"
              style={{...inp,width:150,padding:"4px 9px"}}/>
          </div>
        </div>
        {filtrado.length===0
          ? <div style={{padding:"36px",textAlign:"center",color:C.muted,fontFamily:"'DM Mono',monospace",fontSize:11}}>
              {isAdmin?"Sin pedidos aún. Usá \"+ Cargar pedido\" para registrar el primero.":"Sin pedidos registrados."}
            </div>
          : <div style={{maxHeight:480,overflowY:"auto"}}>
              {filtrado.map(p=>(
                <div key={p.id} style={{borderBottom:`1px solid ${C.border}`,padding:"12px 16px",transition:"background .12s"}}
                  onMouseEnter={e=>e.currentTarget.style.background=C.bg+"88"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <strong style={{color:C.text,fontSize:13}}>{p.nombreMostrar||p.destino}</strong>
                      <Badge color={p.tipo==="local"?C.blue:C.orange}>{p.tipo==="local"?"Local":"Cliente ext."}</Badge>
                      <span style={{color:C.muted,fontSize:10,fontFamily:"'DM Mono',monospace"}}>{p.fecha} · {p.hora}</span>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <Badge color={C.green}>{p.items.length} prod.</Badge>
                      {isAdmin&&<button onClick={()=>saveP(pedidos.filter(x=>x.id!==p.id))}
                        style={{background:"transparent",border:"none",color:C.red,cursor:"pointer",fontSize:13,opacity:.5}}>×</button>}
                    </div>
                  </div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {p.items.map((it,i)=>(
                      <span key={i} style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:5,
                        padding:"3px 10px",fontSize:11,fontFamily:"'DM Mono',monospace",color:C.text}}>
                        {it.producto} <span style={{color:C.accent,fontWeight:700}}>{it.cantidad} {it.unidad}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>}
      </div>
    </div>
  );
}

// ── COSTOS ────────────────────────────────────────────────────
function ModuloCostos({isAdmin}) {
  const [items, setItems] = useSaved("parrillas-costos", COSTOS_INIT);
  const [saved, setSaved] = useState(false);
  const [modal, setModal] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({producto:"",compra:"0",gastos:"0",margen:"0"});

  const doSave = next => { setItems(next); setSaved(true); setTimeout(()=>setSaved(false),2000); };
  const openEdit = i => setModal({id:i.id,compra:String(i.compra),gastos:String(i.gastos),margen:String(i.margen)});
  const saveEdit = () => {
    doSave(items.map(i=>i.id===modal.id?{...i,compra:+modal.compra,gastos:+modal.gastos,margen:+modal.margen}:i));
    setModal(null);
  };
  const agregar = () => {
    if(!form.producto) return;
    doSave([...items,{id:Date.now(),...form,compra:+form.compra,gastos:+form.gastos,margen:+form.margen}]);
    setForm({producto:"",compra:"0",gastos:"0",margen:"0"}); setShowForm(false);
  };

  const costo = i=>i.compra+i.gastos;
  const venta = i=>costo(i)*(1+i.margen/100);
  const ganancia = i=>venta(i)-costo(i);
  const pie = items.filter(i=>ganancia(i)>0).map(i=>({name:i.producto.split(" ")[0],value:Math.round(ganancia(i))}));
  const avgM = items.length?(items.reduce((a,i)=>a+i.margen,0)/items.length).toFixed(1):0;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {modal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center"}}
          onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:12,padding:"28px",width:400,
            display:"flex",flexDirection:"column",gap:16,boxShadow:"0 20px 60px rgba(0,0,0,.6)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{color:C.text,fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:16}}>Editar costos</span>
              <button onClick={()=>setModal(null)} style={{background:"transparent",border:"none",color:C.muted,cursor:"pointer",fontSize:20}}>×</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
              {[["P. Compra","compra"],["Gastos","gastos"],["Margen %","margen"]].map(([l,k])=>(
                <div key={k}>
                  <div style={{color:C.textSub,fontSize:10,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>{l}</div>
                  <input type="number" style={{...inp,width:"100%"}} value={modal[k]}
                    onChange={e=>setModal(m=>({...m,[k]:e.target.value}))}/>
                </div>
              ))}
            </div>
            <div style={{color:C.textSub,fontSize:11,fontFamily:"'DM Mono',monospace"}}>
              Costo total: {fmt((+modal.compra)+(+modal.gastos))} · P. Venta: {fmt(((+modal.compra)+(+modal.gastos))*(1+(+modal.margen)/100))}
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button onClick={()=>setModal(null)} style={{background:"transparent",border:`1px solid ${C.border}`,borderRadius:7,padding:"9px 20px",color:C.textSub,cursor:"pointer",fontFamily:"'Syne',sans-serif",fontWeight:600,fontSize:13}}>Cancelar</button>
              <button onClick={saveEdit} style={{background:C.accent,border:"none",borderRadius:7,padding:"9px 20px",color:C.bg,cursor:"pointer",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:13}}>✓ Guardar</button>
            </div>
          </div>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
        <KPI label="Productos" value={items.length.toString()} sub="Con estructura de costos"/>
        <KPI label="Ganancia proyectada" value={fmt(items.reduce((a,i)=>a+ganancia(i),0))} sub="Según precios definidos" color={C.green}/>
        <KPI label="Margen promedio" value={avgM+"%"} sub="Sobre precio de costo" color={C.blue}/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:16}}>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",borderBottom:`1px solid ${C.border}`}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{color:C.text,fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14}}>Estructura de Costos</span>
              <Saved show={saved}/>
            </div>
            <div style={{display:"flex",gap:8}}>
              <PDFBtn onClick={()=>exportPDF("Costos",items.map(i=>({producto:i.producto,
                compra:i.compra?fmt(i.compra):"—",gastos:i.gastos?fmt(i.gastos):"—",
                costo:fmt(costo(i)),margen:i.margen+"%",venta:venta(i)?fmt(venta(i)):"—",ganancia:ganancia(i)?fmt(ganancia(i)):"—"})),
                [{key:"producto",label:"Producto"},{key:"compra",label:"Compra"},{key:"gastos",label:"Gastos"},
                 {key:"costo",label:"Costo"},{key:"margen",label:"Margen"},{key:"venta",label:"P. Venta"},{key:"ganancia",label:"Ganancia"}])}/>
              {isAdmin&&<button onClick={()=>setShowForm(!showForm)} style={{background:C.accent,color:C.bg,border:"none",borderRadius:6,
                padding:"5px 12px",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:11,cursor:"pointer"}}>
                {showForm?"Cancelar":"+ Producto"}
              </button>}
            </div>
          </div>
          {isAdmin&&showForm&&(
            <div style={{padding:"11px 16px",borderBottom:`1px solid ${C.border}`,display:"grid",
              gridTemplateColumns:"2fr 1fr 1fr 1fr auto",gap:7,alignItems:"end",background:C.bg}}>
              {[["Producto","producto","text"],["P. Compra","compra","number"],["Gastos","gastos","number"],["Margen %","margen","number"]].map(([l,k,t])=>(
                <div key={k}>
                  <div style={{color:C.textSub,fontSize:9,marginBottom:3}}>{l}</div>
                  <input type={t} style={{...inp,width:"100%"}} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}/>
                </div>
              ))}
              <SmBtn onClick={agregar}>OK</SmBtn>
            </div>
          )}
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr>
              <Th>Producto</Th><Th>P. Compra</Th><Th>Gastos</Th><Th>Costo</Th><Th>Margen</Th><Th>P. Venta</Th><Th>Ganancia</Th>
              {isAdmin&&<Th></Th>}
            </tr></thead>
            <tbody>
              {items.map(i=>(
                <tr key={i.id} {...rh}>
                  <Td><strong style={{fontSize:11}}>{i.producto}</strong></Td>
                  {[i.compra,i.gastos].map((v,x)=><Td key={x} style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:v===0?C.muted:C.text}}>{v===0?"—":fmt(v)}</Td>)}
                  <Td style={{fontFamily:"'DM Mono',monospace",fontSize:11}}>{costo(i)===0?"—":fmt(costo(i))}</Td>
                  <Td>
                    <div style={{display:"flex",alignItems:"center",gap:5}}>
                      <div style={{width:36,height:3,background:C.border,borderRadius:2}}>
                        <div style={{width:`${Math.min(100,i.margen*2.5)}%`,height:"100%",background:C.green,borderRadius:2}}/>
                      </div>
                      <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:C.green}}>{i.margen}%</span>
                    </div>
                  </Td>
                  <Td style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:C.accent,fontWeight:600}}>{venta(i)===0?"—":fmt(venta(i))}</Td>
                  <Td style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:C.green}}>{ganancia(i)===0?"—":fmt(ganancia(i))}</Td>
                  {isAdmin&&<Td>
                    <span style={{display:"flex",gap:4}}>
                      <GhBtn onClick={()=>openEdit(i)}>✎ Editar</GhBtn>
                      <button onClick={()=>doSave(items.filter(x=>x.id!==i.id))}
                        style={{background:"transparent",border:"none",color:C.red,cursor:"pointer",fontSize:12,opacity:.5}}>×</button>
                    </span>
                  </Td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:16}}>
          <div style={{color:C.text,fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:13,marginBottom:12}}>Distribución de Ganancia</div>
          {pie.length>0
            ? <ResponsiveContainer width="100%" height={230}>
                <PieChart>
                  <Pie data={pie} cx="50%" cy="50%" outerRadius={85} dataKey="value"
                    label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={9}>
                    {pie.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                  </Pie>
                  <Tooltip formatter={v=>[fmt(v),"Ganancia"]} contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:6}}/>
                </PieChart>
              </ResponsiveContainer>
            : <div style={{color:C.muted,textAlign:"center",padding:"40px 0",fontSize:11,fontFamily:"'DM Mono',monospace"}}>
                Cargá costos para ver el gráfico
              </div>}
        </div>
      </div>
    </div>
  );
}

// ── PROVEEDORES ───────────────────────────────────────────────
function ModuloProveedores({isAdmin}) {
  const [provs, setProvs] = useSaved("parrillas-proveedores", []);
  const [saved, setSaved] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [pago, setPago]   = useState({id:null,monto:""});
  const [form, setForm]   = useState({nombre:"",saldo:"",vencimiento:""});

  const doSave = next => { setProvs(next); setSaved(true); setTimeout(()=>setSaved(false),2000); };
  const ec = e => e==="pagado"?C.green:e==="vencido"?C.red:C.accent;

  const registrar = id => {
    const m=+pago.monto; if(!m) return;
    doSave(provs.map(p=>p.id===id?{...p,saldo:Math.max(0,p.saldo-m),
      ultimoPago:new Date().toISOString().slice(0,10),estado:p.saldo-m<=0?"pagado":p.estado}:p));
    setPago({id:null,monto:""});
  };
  const agregar = () => {
    if(!form.nombre) return;
    doSave([...provs,{id:Date.now(),...form,saldo:+form.saldo,ultimoPago:"—",estado:+form.saldo===0?"pagado":"vigente"}]);
    setForm({nombre:"",saldo:"",vencimiento:""}); setShowForm(false);
  };

  const totalDeuda = provs.reduce((a,p)=>a+p.saldo,0);
  const vencidos   = provs.filter(p=>p.estado==="vencido");

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
        <KPI label="Deuda total" value={provs.length?fmt(totalDeuda):"—"} sub={`${provs.length} proveedores`} color={C.red}/>
        <KPI label="Cuentas vencidas" value={vencidos.length.toString()} sub={vencidos.map(v=>v.nombre.split(" ")[0]).join(", ")||"Ninguna"} color={vencidos.length>0?C.red:C.green}/>
        <KPI label="Saldadas" value={provs.filter(p=>p.estado==="pagado").length.toString()} sub="Al día" color={C.green}/>
      </div>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",borderBottom:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{color:C.text,fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14}}>Cuentas Corrientes</span>
            <Saved show={saved}/>
          </div>
          <div style={{display:"flex",gap:8}}>
            <PDFBtn onClick={()=>exportPDF("Proveedores",provs.map(p=>({
              nombre:p.nombre,saldo:p.saldo>0?fmt(p.saldo):"Saldado",
              ultimoPago:p.ultimoPago,vencimiento:p.vencimiento||"—",estado:p.estado})),
              [{key:"nombre",label:"Proveedor"},{key:"saldo",label:"Saldo"},
               {key:"ultimoPago",label:"Último pago"},{key:"vencimiento",label:"Vencimiento"},{key:"estado",label:"Estado"}])}/>
            {isAdmin&&<button onClick={()=>setShowForm(!showForm)} style={{background:C.accent,color:C.bg,border:"none",borderRadius:6,
              padding:"5px 12px",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:11,cursor:"pointer"}}>
              {showForm?"Cancelar":"+ Proveedor"}
            </button>}
          </div>
        </div>
        {isAdmin&&showForm&&(
          <div style={{padding:"11px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",gap:8,alignItems:"flex-end",background:C.bg,flexWrap:"wrap"}}>
            {[["Proveedor","nombre","text","210px"],["Saldo ($)","saldo","number","120px"],["Vencimiento","vencimiento","date","145px"]].map(([l,k,t,w])=>(
              <div key={k}>
                <div style={{color:C.textSub,fontSize:9,marginBottom:3}}>{l}</div>
                <input type={t} style={{...inp,width:w}} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}/>
              </div>
            ))}
            <button onClick={agregar} style={{background:C.green,border:"none",borderRadius:6,padding:"7px 14px",
              fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:11,cursor:"pointer",color:"#000"}}>Guardar</button>
          </div>
        )}
        {provs.length===0
          ? <div style={{padding:"36px",textAlign:"center",color:C.muted,fontFamily:"'DM Mono',monospace",fontSize:11}}>
              {isAdmin?"Sin proveedores. Usá + Proveedor para agregar el primero.":"Sin proveedores cargados aún."}
            </div>
          : <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr>
                <Th>Proveedor</Th><Th>Saldo</Th><Th>Último pago</Th><Th>Vencimiento</Th><Th>Estado</Th>
                {isAdmin&&<Th>Registrar pago</Th>}{isAdmin&&<Th></Th>}
              </tr></thead>
              <tbody>
                {provs.map(p=>(
                  <tr key={p.id} {...rh}>
                    <Td><strong>{p.nombre}</strong></Td>
                    <Td style={{fontFamily:"'DM Mono',monospace",color:p.saldo>0?C.red:C.green,fontWeight:700}}>{p.saldo>0?fmt(p.saldo):"Saldado"}</Td>
                    <Td style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:C.textSub}}>{p.ultimoPago}</Td>
                    <Td style={{fontFamily:"'DM Mono',monospace",fontSize:11}}>{p.vencimiento||"—"}</Td>
                    <Td><Badge color={ec(p.estado)}>{p.estado}</Badge></Td>
                    {isAdmin&&<Td>
                      {p.saldo>0&&(pago.id===p.id
                        ? <span style={{display:"flex",gap:4,alignItems:"center"}}>
                            <input type="number" value={pago.monto} placeholder="Monto"
                              onChange={e=>setPago(v=>({...v,monto:e.target.value}))}
                              style={{...inp,width:90,padding:"3px 6px"}}/>
                            <SmBtn onClick={()=>registrar(p.id)}>✓</SmBtn>
                            <SmBtn onClick={()=>setPago({id:null,monto:""})} color={C.muted}>✕</SmBtn>
                          </span>
                        : <GhBtn onClick={()=>setPago({id:p.id,monto:""})}>Registrar pago</GhBtn>
                      )}
                    </Td>}
                    {isAdmin&&<Td>
                      <button onClick={()=>doSave(provs.filter(x=>x.id!==p.id))}
                        style={{background:"transparent",border:"none",color:C.red,cursor:"pointer",fontSize:14,opacity:.5}}>×</button>
                    </Td>}
                  </tr>
                ))}
              </tbody>
            </table>}
      </div>
    </div>
  );
}

// ── VENTAS ────────────────────────────────────────────────────
function ModuloVentas({isAdmin}) {
  const [datos, setDatos]   = useSaved("parrillas-ventas", VENTAS_INIT);
  const [pedidos]           = useSaved("parrillas-pedidos", []);
  const [saved, setSaved]   = useState(false);
  const [vista, setVista]   = useState("barras");
  const [tab, setTab]       = useState("locales");
  const [editCell, setEditCell] = useState(null);
  const [editVal, setEditVal]   = useState("");

  const doSave = next => { setDatos(next); setSaved(true); setTimeout(()=>setSaved(false),2000); };
  const totLocal = k => datos.reduce((a,m)=>a+m[k],0);
  const totGen   = LKEYS.reduce((a,k)=>a+totLocal(k),0);
  const mejorIdx = LKEYS.reduce((bi,k,i,arr)=>totLocal(k)>totLocal(arr[bi])?i:bi,0);
  const tieneData= totGen>0;
  const saveCell = (mi,k) => { doSave(datos.map((d,i)=>i===mi?{...d,[k]:+editVal}:d)); setEditCell(null); };

  // Mayorista
  const pedExt = pedidos.filter(p=>p.tipo==="cliente");
  const cliMap  = {};
  pedExt.forEach(p=>{
    const n = p.nombreMostrar||p.destino||"Cliente externo";
    if(!cliMap[n]) cliMap[n]={nombre:n,pedidos:0,unidades:0};
    cliMap[n].pedidos++;
    cliMap[n].unidades += p.items.reduce((a,i)=>a+i.cantidad,0);
  });
  const cliList = Object.values(cliMap).sort((a,b)=>b.unidades-a.unidades);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",gap:8}}>
        <TabBtn active={tab==="locales"} onClick={()=>setTab("locales")}>🏪 Locales propios</TabBtn>
        <TabBtn active={tab==="mayorista"} onClick={()=>setTab("mayorista")} color={C.orange}>🏭 Venta mayorista</TabBtn>
      </div>

      {tab==="locales"&&(
        <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
            <KPI label="Ventas totales 6M" value={tieneData?fmt(totGen):"Sin datos"} sub="Todos los locales"/>
            <KPI label="Mejor local" value={tieneData?LOCALES[mejorIdx]:"—"} sub={tieneData?fmt(totLocal(LKEYS[mejorIdx])):"Cargá ventas"} color={C.green}/>
            <KPI label="Promedio mensual" value={tieneData?fmt(totGen/6):"—"} sub="Por período" color={C.blue}/>
            <KPI label="Locales" value="6" sub="Costanera Sur" color={C.purple}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:9}}>
            {LOCALES.map((l,i)=>(
              <div key={l} style={{background:C.card,border:`1px solid ${C.border}`,borderTop:`3px solid ${COLORS[i]}`,borderRadius:7,padding:"11px"}}>
                <div style={{color:C.textSub,fontSize:9,fontFamily:"'DM Mono',monospace",marginBottom:2}}>{l}</div>
                <div style={{color:COLORS[i],fontSize:12,fontFamily:"'Syne',sans-serif",fontWeight:700}}>{tieneData?fmt(totLocal(LKEYS[i])):"—"}</div>
                <div style={{color:C.muted,fontSize:9,marginTop:2}}>6 meses</div>
              </div>
            ))}
          </div>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",borderBottom:`1px solid ${C.border}`}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{color:C.text,fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14}}>Ventas por Local</span>
                {isAdmin&&<Saved show={saved}/>}
              </div>
              <div style={{display:"flex",gap:8}}>
                <PDFBtn onClick={()=>exportPDF("Ventas por Local",datos.map(d=>({mes:d.mes,
                  ...Object.fromEntries(LKEYS.map((k,i)=>[LOCALES[i],d[k]?fmt(d[k]):"—"])),
                  total:fmt(LKEYS.reduce((a,k)=>a+d[k],0))})),
                  [{key:"mes",label:"Mes"},...LOCALES.map(l=>({key:l,label:l})),{key:"total",label:"Total"}])}/>
                {[["Barras","barras"],["Líneas","lineas"],["Distribución","torta"]].map(([l,v])=>(
                  <TabBtn key={v} active={vista===v} onClick={()=>setVista(v)}>{l}</TabBtn>
                ))}
              </div>
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",minWidth:640}}>
                <thead><tr>
                  <Th>Mes</Th>
                  {LOCALES.map((l,i)=><Th key={l} style={{color:COLORS[i]}}>{l}</Th>)}
                  <Th>Total mes</Th>
                </tr></thead>
                <tbody>
                  {datos.map((d,mi)=>{
                    const rowTotal=LKEYS.reduce((a,k)=>a+d[k],0);
                    return (
                      <tr key={d.mes} {...rh}>
                        <Td style={{fontFamily:"'DM Mono',monospace",color:C.accent,fontWeight:600}}>{d.mes}</Td>
                        {LKEYS.map((k,i)=>(
                          <Td key={k}>
                            {isAdmin&&editCell&&editCell[0]===mi&&editCell[1]===k
                              ? <span style={{display:"flex",gap:4,alignItems:"center"}}>
                                  <input type="number" value={editVal} onChange={e=>setEditVal(e.target.value)}
                                    style={{...inp,width:90,padding:"2px 6px"}}/>
                                  <SmBtn onClick={()=>saveCell(mi,k)}>✓</SmBtn>
                                </span>
                              : <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,
                                  color:d[k]===0?C.muted:COLORS[i],cursor:isAdmin?"pointer":"default"}}
                                  onClick={()=>isAdmin&&(setEditCell([mi,k]),setEditVal(d[k]))}>
                                  {d[k]===0?(isAdmin?"— clic":"-"):fmt(d[k])}
                                </span>}
                          </Td>
                        ))}
                        <Td style={{fontFamily:"'DM Mono',monospace",fontWeight:700}}>{rowTotal===0?"—":fmt(rowTotal)}</Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{padding:"14px 16px",borderTop:`1px solid ${C.border}`}}>
              {!tieneData
                ? <div style={{color:C.textSub,fontSize:11,fontFamily:"'DM Mono',monospace",textAlign:"center"}}>
                    {isAdmin?"💡 Hacé clic en cualquier celda para cargar ventas.":"Sin datos cargados aún."}
                  </div>
                : <ResponsiveContainer width="100%" height={260}>
                    {vista==="barras"
                      ? <BarChart data={datos} barSize={10} barCategoryGap="22%">
                          <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
                          <XAxis dataKey="mes" tick={{fill:C.textSub,fontSize:10}} axisLine={false} tickLine={false}/>
                          <YAxis tick={{fill:C.textSub,fontSize:9}} axisLine={false} tickLine={false} tickFormatter={v=>"$"+Math.round(v/1000)+"k"}/>
                          <Tooltip formatter={(v,n)=>[fmt(v),n]} contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:6}}/>
                          <Legend wrapperStyle={{fontFamily:"'DM Mono',monospace",fontSize:10}}/>
                          {LKEYS.map((k,i)=><Bar key={k} dataKey={k} name={LOCALES[i]} fill={COLORS[i]} radius={[3,3,0,0]}/>)}
                        </BarChart>
                      : vista==="lineas"
                      ? <LineChart data={datos}>
                          <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
                          <XAxis dataKey="mes" tick={{fill:C.textSub,fontSize:10}} axisLine={false} tickLine={false}/>
                          <YAxis tick={{fill:C.textSub,fontSize:9}} axisLine={false} tickLine={false} tickFormatter={v=>"$"+Math.round(v/1000)+"k"}/>
                          <Tooltip formatter={(v,n)=>[fmt(v),n]} contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:6}}/>
                          <Legend wrapperStyle={{fontFamily:"'DM Mono',monospace",fontSize:10}}/>
                          {LKEYS.map((k,i)=><Line key={k} type="monotone" dataKey={k} name={LOCALES[i]} stroke={COLORS[i]} strokeWidth={2} dot={{r:3}}/>)}
                        </LineChart>
                      : <PieChart>
                          <Pie data={LOCALES.map((l,i)=>({name:l,value:totLocal(LKEYS[i])}))}
                            cx="50%" cy="50%" outerRadius={100} dataKey="value"
                            label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                            {LOCALES.map((_,i)=><Cell key={i} fill={COLORS[i]}/>)}
                          </Pie>
                          <Tooltip formatter={v=>[fmt(v),"Ventas"]} contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:6}}/>
                        </PieChart>}
                  </ResponsiveContainer>}
            </div>
          </div>
        </>
      )}

      {tab==="mayorista"&&(
        <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
            <KPI label="Clientes mayoristas" value={cliList.length.toString()} sub="Con pedidos registrados" color={C.orange}/>
            <KPI label="Pedidos externos" value={pedExt.length.toString()} sub="Total histórico" color={C.blue}/>
            <KPI label="Unidades despachadas" value={cliList.reduce((a,c)=>a+c.unidades,0).toString()} sub="A clientes externos" color={C.green}/>
          </div>
          <div style={{background:C.accent+"10",border:`1px solid ${C.accent}30`,borderRadius:8,padding:"10px 14px",display:"flex",gap:10,alignItems:"center"}}>
            <span>💡</span>
            <span style={{color:C.textSub,fontSize:11}}>
              Los clientes mayoristas se cargan en el módulo <strong style={{color:C.accent}}>Pedidos</strong> eligiendo tipo "Cliente externo".
              Cada cliente puede tener su propio precio — registrá los pedidos allí para que aparezcan acá.
            </span>
          </div>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",borderBottom:`1px solid ${C.border}`}}>
              <span style={{color:C.text,fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14}}>Resumen por Cliente</span>
              <PDFBtn onClick={()=>exportPDF("Venta Mayorista",cliList.map(c=>({nombre:c.nombre,pedidos:c.pedidos.toString(),unidades:c.unidades.toString()})),
                [{key:"nombre",label:"Cliente"},{key:"pedidos",label:"Pedidos"},{key:"unidades",label:"Unidades"}])}/>
            </div>
            {cliList.length===0
              ? <div style={{padding:"36px",textAlign:"center",color:C.muted,fontFamily:"'DM Mono',monospace",fontSize:11}}>
                  Sin clientes mayoristas aún.<br/>Cargá pedidos de tipo "Cliente externo" en el módulo Pedidos.
                </div>
              : <>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead><tr><Th>Cliente</Th><Th>Pedidos</Th><Th>Unidades despachadas</Th><Th>Último pedido</Th></tr></thead>
                    <tbody>
                      {cliList.map((c,i)=>{
                        const ult = pedExt.filter(p=>(p.nombreMostrar||p.destino)===c.nombre).sort((a,b)=>b.id-a.id)[0];
                        return (
                          <tr key={c.nombre} {...rh}>
                            <Td><span style={{display:"flex",alignItems:"center",gap:8}}>
                              <span style={{width:8,height:8,borderRadius:"50%",background:COLORS[i%COLORS.length],display:"inline-block"}}/>
                              <strong>{c.nombre}</strong>
                            </span></Td>
                            <Td style={{fontFamily:"'DM Mono',monospace",color:C.blue,fontWeight:700}}>{c.pedidos}</Td>
                            <Td style={{fontFamily:"'DM Mono',monospace",color:C.green,fontWeight:700}}>{c.unidades} u.</Td>
                            <Td style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:C.textSub}}>{ult?.fecha||"—"}</Td>
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
                        <Tooltip contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:6}}/>
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

// ── LOGIN ─────────────────────────────────────────────────────
function Login({onLogin}) {
  const [pass, setPass]   = useState("");
  const [error, setError] = useState(false);
  const [show, setShow]   = useState(false);

  const intentar = () => {
    if(pass===PASS_ADMIN)  { onLogin("admin");  return; }
    if(pass===PASS_LECTOR) { onLogin("lector"); return; }
    setError(true); setTimeout(()=>setError(false),2000);
  };

  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Syne',sans-serif"}}>
      <div style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:12,
        padding:"48px 44px",width:340,display:"flex",flexDirection:"column",gap:24}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:36,marginBottom:8}}>🔥</div>
          <div style={{color:C.accent,fontWeight:800,fontSize:22,letterSpacing:-0.5}}>PARRILLAS</div>
          <div style={{color:C.muted,fontSize:11,fontFamily:"'DM Mono',monospace",marginTop:3}}>sistema de gestión · costanera sur</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <label style={{color:C.textSub,fontSize:11,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1}}>Contraseña</label>
          <div style={{position:"relative"}}>
            <input type={show?"text":"password"} value={pass}
              onChange={e=>setPass(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&intentar()}
              placeholder="Ingresá tu contraseña"
              style={{width:"100%",background:C.bg,border:`1px solid ${error?C.red:C.border}`,
                borderRadius:7,padding:"11px 40px 11px 14px",color:C.text,fontSize:13,
                fontFamily:"'DM Mono',monospace",outline:"none",boxSizing:"border-box",transition:"border-color .2s"}}/>
            <button onClick={()=>setShow(!show)} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",
              background:"transparent",border:"none",color:C.muted,cursor:"pointer",fontSize:14}}>
              {show?"🙈":"👁️"}
            </button>
          </div>
          {error&&<div style={{color:C.red,fontSize:11,fontFamily:"'DM Mono',monospace"}}>✕ Contraseña incorrecta</div>}
        </div>
        <button onClick={intentar} style={{background:C.accent,color:C.bg,border:"none",borderRadius:8,
          padding:"13px",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:14,cursor:"pointer"}}>
          Ingresar
        </button>
        <div style={{borderTop:`1px solid ${C.border}`,paddingTop:16,display:"flex",flexDirection:"column",gap:8}}>
          {[["ADMIN",C.accent,"Acceso total · puede editar todo"],["LECTOR",C.blue,"Solo lectura · no puede modificar"]].map(([r,c,d])=>(
            <div key={r} style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{background:c+"22",color:c,border:`1px solid ${c}44`,padding:"2px 8px",borderRadius:4,fontSize:10,fontFamily:"'DM Mono',monospace",fontWeight:600}}>{r}</span>
              <span style={{color:C.textSub,fontSize:11}}>{d}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────
const MODS = [
  {id:"sueldos",     label:"Sueldos",    icon:"👥", desc:"15 empleados"},
  {id:"stock",       label:"Stock",      icon:"📦", desc:"M. Acosta · Cruz"},
  {id:"pedidos",     label:"Pedidos",    icon:"🛒", desc:"Despacho · clientes"},
  {id:"costos",      label:"Costos",     icon:"💰", desc:"Márgenes · precios"},
  {id:"proveedores", label:"Proveedores",icon:"🤝", desc:"Cuentas corrientes"},
  {id:"ventas",      label:"Ventas",     icon:"📊", desc:"6 locales · costanera"},
];

export default function App() {
  const [role, setRole]   = useState(null);
  const [mod, setMod]     = useState("sueldos");

  if(!role) return <Login onLogin={setRole}/>;

  const actual  = MODS.find(m=>m.id===mod);
  const isAdmin = role==="admin";

  return (
    <div style={{display:"flex",minHeight:"100vh",background:C.bg,fontFamily:"'Syne',sans-serif",color:C.text}}>
      <div style={{width:200,background:C.panel,borderRight:`1px solid ${C.border}`,
        display:"flex",flexDirection:"column",flexShrink:0,position:"sticky",top:0,height:"100vh"}}>
        <div style={{padding:"20px 16px 16px",borderBottom:`1px solid ${C.border}`}}>
          <div style={{color:C.accent,fontWeight:800,fontSize:16,letterSpacing:-0.5}}>PARRILLAS</div>
          <div style={{color:C.muted,fontSize:9,fontFamily:"'DM Mono',monospace",marginTop:1}}>sistema de gestión</div>
        </div>
        <nav style={{flex:1,padding:"8px 6px",display:"flex",flexDirection:"column",gap:2,overflowY:"auto"}}>
          {MODS.map(m=>(
            <button key={m.id} onClick={()=>setMod(m.id)}
              style={{display:"flex",alignItems:"center",gap:9,padding:"8px 9px",borderRadius:6,border:"none",
                cursor:"pointer",textAlign:"left",width:"100%",
                background:mod===m.id?C.accent+"18":"transparent",
                borderLeft:mod===m.id?`3px solid ${C.accent}`:"3px solid transparent",
                transition:"all .12s"}}>
              <span style={{fontSize:16}}>{m.icon}</span>
              <div>
                <div style={{color:mod===m.id?C.accent:C.text,fontSize:12,fontWeight:mod===m.id?700:500}}>{m.label}</div>
                <div style={{color:C.muted,fontSize:9,fontFamily:"'DM Mono',monospace"}}>{m.desc}</div>
              </div>
            </button>
          ))}
        </nav>
        <div style={{padding:"12px 16px",borderTop:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
            <span style={{background:isAdmin?C.accent+"22":C.blue+"22",
              color:isAdmin?C.accent:C.blue,border:`1px solid ${isAdmin?C.accent:C.blue}44`,
              padding:"2px 8px",borderRadius:4,fontSize:9,fontFamily:"'DM Mono',monospace",fontWeight:600}}>
              {isAdmin?"ADMIN":"LECTOR"}
            </span>
            <button onClick={()=>setRole(null)} style={{background:"transparent",border:"none",
              color:C.muted,cursor:"pointer",fontSize:9,fontFamily:"'DM Mono',monospace",textDecoration:"underline"}}>
              salir
            </button>
          </div>
          <div style={{color:C.muted,fontSize:9,fontFamily:"'DM Mono',monospace"}}>
            {new Date().toLocaleDateString("es-AR",{weekday:"short",day:"numeric",month:"short"})}
          </div>
        </div>
      </div>

      <div style={{flex:1,overflow:"auto"}}>
        <div style={{padding:"20px 26px",borderBottom:`1px solid ${C.border}`,background:C.panel,position:"sticky",top:0,zIndex:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:20}}>{actual.icon}</span>
            <div>
              <h1 style={{margin:0,fontSize:19,fontWeight:800,letterSpacing:-0.5}}>{actual.label}</h1>
              <p style={{margin:0,color:C.textSub,fontSize:10,fontFamily:"'DM Mono',monospace"}}>{actual.desc}</p>
            </div>
            {!isAdmin&&(
              <span style={{marginLeft:"auto",background:C.blue+"15",color:C.blue,
                border:`1px solid ${C.blue}30`,padding:"4px 12px",borderRadius:6,
                fontSize:10,fontFamily:"'DM Mono',monospace"}}>
                👁 modo lectura
              </span>
            )}
          </div>
        </div>
        <div style={{padding:"22px 26px"}}>
          {mod==="sueldos"     && <ModuloSueldos     isAdmin={isAdmin}/>}
          {mod==="stock"       && <ModuloStock        isAdmin={isAdmin}/>}
          {mod==="pedidos"     && <ModuloPedidos      isAdmin={isAdmin}/>}
          {mod==="costos"      && <ModuloCostos       isAdmin={isAdmin}/>}
          {mod==="proveedores" && <ModuloProveedores  isAdmin={isAdmin}/>}
          {mod==="ventas"      && <ModuloVentas       isAdmin={isAdmin}/>}
        </div>
      </div>
    </div>
  );
}
