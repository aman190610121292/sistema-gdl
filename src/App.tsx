import { useState, useCallback } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";

const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap";
document.head.appendChild(fontLink);

// ── CONTRASEÑAS — cambiá estas dos líneas cuando quieras ─────
const PASS_ADMIN  = "parrillas2024";   // acceso total
const PASS_LECTOR = "lector2024";      // solo lectura
// ────────────────────────────────────────────────────────────

const C = {
  bg:"#0d0f14", panel:"#13161e", card:"#1a1e2a", border:"#252a38",
  accent:"#e8c547", green:"#4ade80", red:"#f87171", blue:"#60a5fa",
  orange:"#f97316", purple:"#a78bfa", muted:"#5a6070", text:"#e2e6f0", textSub:"#8a92a6"
};
const COLORS = ["#e8c547","#60a5fa","#4ade80","#f97316","#a78bfa","#f472b6"];
const fmt = (n) => "$" + Math.round(n).toLocaleString("es-AR");

// ── GUARDADO AUTOMATICO ──────────────────────────────────────
function usePersistentState(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialValue;
    } catch { return initialValue; }
  });
  const setPersistent = useCallback((updater) => {
    setState(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [key]);
  return [state, setPersistent];
}

// ── DATOS INICIALES ──────────────────────────────────────────
const initEmpleados = [
  { id:1,  nombre:"Sanz, Mariano",            cargo:"Gerente de Operaciones",                     tipo:"mensual", base:2500000, extras:0, dias:22 },
  { id:2,  nombre:"Hodis, Amancay",            cargo:"Tesorera / Coord. General",                  tipo:"mensual", base:2500000, extras:0, dias:22 },
  { id:3,  nombre:"Guerrero, Karina",          cargo:"Enc. Locales — Lito's · Faro · Gauchito",    tipo:"mensual", base:1600000, extras:0, dias:22 },
  { id:4,  nombre:"Fleitas, Leonardo",         cargo:"Enc. Locales — Homero · DJ · Amp + Cad.",    tipo:"semanal", base:475000,  extras:0, dias:5  },
  { id:5,  nombre:"Mendez, Gabriel",           cargo:"Encargado de Reparto",                       tipo:"mensual", base:1800000, extras:0, dias:22 },
  { id:6,  nombre:"Millan, Benito",            cargo:"Encargado Mariano Acosta",                   tipo:"semanal", base:450000,  extras:0, dias:5  },
  { id:7,  nombre:"Ferreira Sosa, Valentina",  cargo:"Administrativa / Data Entry",                tipo:"mensual", base:1200000, extras:0, dias:22 },
  { id:8,  nombre:"Rodriguez, Regulo",         cargo:"Encargado Cruz",                             tipo:"semanal", base:350000,  extras:0, dias:5  },
  { id:9,  nombre:"Gabi",                      cargo:"Empleado Mariano Acosta",                    tipo:"jornal",  base:50000,   extras:0, dias:5  },
  { id:10, nombre:"Charly",                    cargo:"Empleado Mariano Acosta",                    tipo:"jornal",  base:50000,   extras:0, dias:5  },
  { id:11, nombre:"Fernando",                  cargo:"Empleado Mariano Acosta",                    tipo:"jornal",  base:50000,   extras:0, dias:5  },
  { id:12, nombre:"Naileth",                   cargo:"Corrección de Planillas",                    tipo:"mensual", base:500000,  extras:0, dias:22 },
  { id:13, nombre:"Sol",                       cargo:"Tickeo y Facturación",                       tipo:"mensual", base:350000,  extras:0, dias:22 },
  { id:14, nombre:"Valen Leo",                 cargo:"Tickeo y Facturación",                       tipo:"mensual", base:400000,  extras:0, dias:22 },
  { id:15, nombre:"Mendez, Enzo",              cargo:"Ayudante de Reparto",                        tipo:"jornal",  base:35000,   extras:0, dias:5  },
];

let _sid = 0;
const sk = (producto, deposito, categoria, stock, minimo=0, unidad="u") =>
  ({ id:++_sid, producto, deposito, categoria, stock, minimo, unidad });

const initStock = [
  sk("Cajas Hamburguesas",      1,"Congelados",19,5),    sk("Pan Paty",                1,"Congelados",816,100),
  sk("Salchichas U. Ganadera",  1,"Congelados",336,50),  sk("Salchichas Alemanas",     1,"Congelados",20,10),
  sk("Pan de Panchos",          1,"Congelados",324,50),  sk("Provoletas",              1,"Congelados",12,5),
  sk("Cajas Papas",             1,"Congelados",15,5),    sk("Veganas",                 1,"Congelados",120,20),
  sk("Nugget",                  1,"Congelados",1,5),     sk("Chori",                   1,"Congelados",14,5),
  sk("Bondiola Pieza",          1,"Congelados",0,1),     sk("Cajas de Bondiolas",      1,"Congelados",10,3),
  sk("B1",                      1,"Congelados",876,100), sk("B3",                      1,"Congelados",11,5),
  sk("BL Pieza",                1,"Congelados",0,1),     sk("BL1",                     1,"Congelados",677,80),
  sk("BL2",                     1,"Congelados",176,30),  sk("Bife de Chorizo Bolsa",   1,"Congelados",0,1),
  sk("Bife de Chorizo Feteado", 1,"Congelados",116,20),  sk("Nalga Pieza",             1,"Congelados",0,1),
  sk("N1",                      1,"Congelados",1208,100),sk("N2",                      1,"Congelados",170,30),
  sk("Jamón Pieza",             1,"Congelados",0,1),     sk("Jamón Feteado ROCA",      1,"Congelados",1600,200),
  sk("Jamón Feteado",           1,"Congelados",1620,200),sk("Queso Pieza",             1,"Congelados",0,1),
  sk("Queso Feteado ROCA",      1,"Congelados",1700,200),sk("Queso Feteado",           1,"Congelados",2620,200),
  sk("Papa Pay",                1,"Aderezos",3,2),       sk("Aceite",                  1,"Aderezos",14,5),
  sk("Vinagre",                 1,"Aderezos",15,5),      sk("Huevos",                  1,"Aderezos",8,5),
  sk("Coca CH",                 2,"Gaseosas",323,50),    sk("Fanta CH",                2,"Gaseosas",49,15),
  sk("Sprite CH",               2,"Gaseosas",128,30),    sk("Agua SG CH",              2,"Gaseosas",75,20),
  sk("Agua CG CH",              2,"Gaseosas",29,10),     sk("AQ Pomelo CH",            2,"Gaseosas",60,15),
  sk("AQ Manzana CH",           2,"Gaseosas",57.5,15),   sk("AQ Pera CH",              2,"Gaseosas",64,15),
  sk("AQ Rosa CH",              2,"Gaseosas",14,5),      sk("AQ Uva CH",               2,"Gaseosas",35,10),
  sk("Coca Z CH",               2,"Gaseosas",51.5,15),   sk("Sprite Z CH",             2,"Gaseosas",46,10),
  sk("Coca GR",                 2,"Gaseosas",21,10),     sk("Fanta GR",                2,"Gaseosas",23,8),
  sk("Sprite GR",               2,"Gaseosas",22,8),      sk("AQ Uva GR",               2,"Gaseosas",21,8),
  sk("AQ Naranja GR",           2,"Gaseosas",13,5),      sk("AQ Manzana GR",           2,"Gaseosas",17,5),
  sk("AQ Pera GR",              2,"Gaseosas",12,5),      sk("AQ Pomelo GR",            2,"Gaseosas",14,5),
  sk("Coca Z GR",               2,"Gaseosas",4,5),       sk("Sprite Z GR",             2,"Gaseosas",9,5),
  sk("Tónica GR",               2,"Gaseosas",5,5),       sk("Agua GR",                 2,"Gaseosas",19,8),
  sk("Power Uva",               2,"Gaseosas",17,5),      sk("Power Manzana",           2,"Gaseosas",13,5),
  sk("Power Azul",              2,"Gaseosas",9,5),       sk("Power Roja",              2,"Gaseosas",12,5),
  sk("Tónica CH",               2,"Gaseosas",13,5),      sk("Monster ML",              2,"Gaseosas",2,3),
  sk("Monster Blanca",          2,"Gaseosas",6,3),       sk("Monster Rossi",           2,"Gaseosas",16,5),
  sk("Monster Negra",           2,"Gaseosas",12,5),      sk("Monster Roja",            2,"Gaseosas",15,5),
  sk("Monster Punch",           2,"Gaseosas",13,5),      sk("Monster Ananá",           2,"Gaseosas",13,5),
  sk("Monster Sunrise",         2,"Gaseosas",15,5),      sk("Coca Lata",               2,"Gaseosas",0,1),
  sk("Mayonesa Sachet",         2,"Aderezos",38,10),     sk("Ketchup Pomo",            2,"Aderezos",169,30),
  sk("Servilleta",              2,"Papelería",63,15),    sk("Separador",               2,"Papelería",15,5),
  sk("Bandeja",                 2,"Papelería",40,10),    sk("Bandejas (100u)",         2,"Papelería",0,1),
  sk("Vasos",                   2,"Papelería",52,15),    sk("Guantes",                 2,"Papelería",8,3),
  sk("Camiseta CH",             2,"Papelería",15,5),     sk("Consorcio",               2,"Papelería",34,10),
  sk("Esponja Acero",           2,"Papelería",18,5),     sk("Esponja Común",           2,"Papelería",19,5),
  sk("Desengrasante",           2,"Papelería",13,5),     sk("Detergente",              2,"Papelería",20,5),
  sk("Lavandina",               2,"Papelería",17,5),     sk("Rejilla",                 2,"Papelería",32,10),
  sk("Trapo Piso",              2,"Papelería",34,10),    sk("Escoba",                  2,"Papelería",0,1),
  sk("Secador",                 2,"Papelería",0,1),      sk("Alcohol en Gel",          2,"Papelería",2,2),
  sk("Alcohol 70/30",           2,"Papelería",2,2),      sk("Film",                    2,"Papelería",0,1),
  sk("Marcadores",              2,"Papelería",0,1),
];

const initCostos = [
  { id:1, producto:"B1 (unidad)",          compra:0, gastos:0, margen:0 },
  { id:2, producto:"BL1 (unidad)",          compra:0, gastos:0, margen:0 },
  { id:3, producto:"Jamón Feteado ROCA",    compra:0, gastos:0, margen:0 },
  { id:4, producto:"Queso Feteado ROCA",    compra:0, gastos:0, margen:0 },
  { id:5, producto:"Coca CH (cajón)",       compra:0, gastos:0, margen:0 },
  { id:6, producto:"Pan Paty (unidad)",     compra:0, gastos:0, margen:0 },
  { id:7, producto:"Chori (unidad)",        compra:0, gastos:0, margen:0 },
  { id:8, producto:"Provoletas",            compra:0, gastos:0, margen:0 },
];

const localesNombres = ["LITO'S","FARO","HOMERO","DON JOSÉ","GAUCHITO","AMPARITO"];
const localesKeys    = ["LITOS","FARO","HOMERO","DONJOSE","GAUCHITO","AMPARITO"];
const initVentas = ["Oct","Nov","Dic","Ene","Feb","Mar"].map(mes =>
  ({ mes, LITOS:0, FARO:0, HOMERO:0, DONJOSE:0, GAUCHITO:0, AMPARITO:0 })
);
const catColors = { Congelados:"#60a5fa", Aderezos:"#e8c547", Gaseosas:"#4ade80", Papelería:"#a78bfa" };

// ── LOGIN ────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [pass, setPass]   = useState("");
  const [error, setError] = useState(false);
  const [show, setShow]   = useState(false);

  const intentar = () => {
    if (pass === PASS_ADMIN)       { onLogin("admin");  return; }
    if (pass === PASS_LECTOR)      { onLogin("lector"); return; }
    setError(true); setTimeout(()=>setError(false), 2000);
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex",
      alignItems:"center", justifyContent:"center", fontFamily:"'Syne',sans-serif" }}>
      <div style={{ background:C.panel, border:`1px solid ${C.border}`, borderRadius:12,
        padding:"48px 44px", width:340, display:"flex", flexDirection:"column", gap:24 }}>

        {/* Logo */}
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:36, marginBottom:8 }}>🔥</div>
          <div style={{ color:C.accent, fontWeight:800, fontSize:22, letterSpacing:-0.5 }}>PARRILLAS</div>
          <div style={{ color:C.muted, fontSize:11, fontFamily:"'DM Mono',monospace", marginTop:3 }}>
            sistema de gestión · costanera sur
          </div>
        </div>

        {/* Input */}
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          <label style={{ color:C.textSub, fontSize:11, fontFamily:"'DM Mono',monospace",
            textTransform:"uppercase", letterSpacing:1 }}>Contraseña</label>
          <div style={{ position:"relative" }}>
            <input
              type={show?"text":"password"}
              value={pass}
              onChange={e=>setPass(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&intentar()}
              placeholder="Ingresá tu contraseña"
              style={{ width:"100%", background:C.bg, border:`1px solid ${error?C.red:C.border}`,
                borderRadius:7, padding:"11px 40px 11px 14px", color:C.text, fontSize:13,
                fontFamily:"'DM Mono',monospace", outline:"none", boxSizing:"border-box",
                transition:"border-color .2s" }}
            />
            <button onClick={()=>setShow(!show)}
              style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
                background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:14 }}>
              {show?"🙈":"👁️"}
            </button>
          </div>
          {error && (
            <div style={{ color:C.red, fontSize:11, fontFamily:"'DM Mono',monospace",
              display:"flex", alignItems:"center", gap:5 }}>
              ✕ Contraseña incorrecta
            </div>
          )}
        </div>

        {/* Botón */}
        <button onClick={intentar}
          style={{ background:C.accent, color:C.bg, border:"none", borderRadius:8,
            padding:"13px", fontFamily:"'Syne',sans-serif", fontWeight:800,
            fontSize:14, cursor:"pointer", letterSpacing:0.3 }}>
          Ingresar
        </button>

        {/* Info roles */}
        <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:16,
          display:"flex", flexDirection:"column", gap:8 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ background:C.accent+"22", color:C.accent, border:`1px solid ${C.accent}44`,
              padding:"2px 8px", borderRadius:4, fontSize:10, fontFamily:"'DM Mono',monospace", fontWeight:600 }}>
              ADMIN
            </span>
            <span style={{ color:C.textSub, fontSize:11 }}>Acceso total · puede editar todo</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ background:C.blue+"22", color:C.blue, border:`1px solid ${C.blue}44`,
              padding:"2px 8px", borderRadius:4, fontSize:10, fontFamily:"'DM Mono',monospace", fontWeight:600 }}>
              LECTOR
            </span>
            <span style={{ color:C.textSub, fontSize:11 }}>Solo lectura · no puede modificar</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── UI helpers ───────────────────────────────────────────────
const Badge = ({ children, color=C.accent }) => (
  <span style={{ background:color+"22", color, border:`1px solid ${color}44`,
    padding:"2px 8px", borderRadius:4, fontSize:10, fontFamily:"'DM Mono',monospace",
    fontWeight:600, whiteSpace:"nowrap" }}>{children}</span>
);
const KPI = ({ label, value, sub, color=C.accent }) => (
  <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:8,
    padding:"15px 18px", borderLeft:`3px solid ${color}` }}>
    <div style={{ color:C.textSub, fontSize:10, fontFamily:"'DM Mono',monospace",
      textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>{label}</div>
    <div style={{ color, fontSize:20, fontFamily:"'Syne',sans-serif", fontWeight:700, lineHeight:1.1 }}>{value}</div>
    {sub && <div style={{ color:C.muted, fontSize:10, marginTop:3 }}>{sub}</div>}
  </div>
);
const Th = ({ children, style={} }) => (
  <th style={{ padding:"8px 12px", textAlign:"left", color:C.textSub, fontSize:10,
    fontFamily:"'DM Mono',monospace", textTransform:"uppercase", letterSpacing:1,
    borderBottom:`1px solid ${C.border}`, fontWeight:500, whiteSpace:"nowrap", ...style }}>{children}</th>
);
const Td = ({ children, style={}, colSpan }) => (
  <td colSpan={colSpan} style={{ padding:"7px 12px", color:C.text, fontSize:12,
    borderBottom:`1px solid ${C.border}16`, verticalAlign:"middle", ...style }}>{children}</td>
);
const rh = {
  onMouseEnter:ev=>ev.currentTarget.style.background=C.bg+"cc",
  onMouseLeave:ev=>ev.currentTarget.style.background="transparent"
};
const inpSty = { background:C.bg, border:`1px solid ${C.border}`, borderRadius:5,
  padding:"6px 9px", color:C.text, fontSize:12, fontFamily:"'DM Mono',monospace", outline:"none" };
const TabBtn = ({ active, onClick, children, color=C.accent }) => (
  <button onClick={onClick} style={{ background:active?color:C.bg,
    color:active?(color===C.accent?C.bg:"#000"):C.textSub,
    border:`1px solid ${active?color:C.border}`, borderRadius:5,
    padding:"4px 11px", fontFamily:"'DM Mono',monospace", fontSize:10, cursor:"pointer" }}>{children}</button>
);
const SmBtn = ({ onClick, children, color=C.green }) => (
  <button onClick={onClick} style={{ background:color, border:"none", borderRadius:4,
    padding:"3px 8px", color:"#000", cursor:"pointer", fontSize:10 }}>{children}</button>
);
const GhBtn = ({ onClick, children }) => (
  <button onClick={onClick} style={{ background:"transparent", border:`1px solid ${C.border}`,
    borderRadius:3, padding:"1px 5px", color:C.textSub, cursor:"pointer", fontSize:9 }}>{children}</button>
);
const SavedBadge = ({ show }) => (
  <span style={{ color:C.green, fontSize:10, fontFamily:"'DM Mono',monospace",
    opacity:show?1:0, transition:"opacity .4s", display:"inline-flex", alignItems:"center", gap:4 }}>
    ✓ guardado
  </span>
);

// ── SUELDOS ──────────────────────────────────────────────────
const calcPeriodo   = (e) => (e.tipo==="mensual"?e.base:e.tipo==="semanal"?e.base:e.base*e.dias)+(e.extras||0);
const calcMensualEq = (e) => e.tipo==="mensual"?calcPeriodo(e):calcPeriodo(e)*4.33;

function ModuloSueldos({ isAdmin }) {
  const [emps, setEmps]         = usePersistentState("parrillas-emps", initEmpleados);
  const [saved, setSaved]       = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editRow, setEditRow]   = useState({});
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nombre:"", cargo:"", tipo:"mensual", base:"", extras:"0", dias:"22" });

  const save = (next) => { setEmps(next); setSaved(true); setTimeout(()=>setSaved(false),2000); };

  const startEdit = (e) => {
    setEditingId(e.id);
    setEditRow({ nombre:e.nombre, cargo:e.cargo, tipo:e.tipo, base:e.base, extras:e.extras||0, dias:e.dias });
  };
  const saveEdit = (id) => {
    save(emps.map(e=>e.id===id?{...e,...editRow,base:+editRow.base,extras:+editRow.extras,dias:+editRow.dias}:e));
    setEditingId(null);
  };

  const byTipo  = (t) => emps.filter(e=>e.tipo===t);
  const totTipo = (t) => byTipo(t).reduce((a,e)=>a+calcPeriodo(e),0);
  const tc = (t) => t==="mensual"?C.blue:t==="semanal"?C.green:C.orange;
  const pl = (t) => t==="mensual"?"/mes":"/sem";

  const agregar = () => {
    if(!form.nombre||!form.base)return;
    save([...emps,{id:Date.now(),...form,base:+form.base,extras:+form.extras,dias:+form.dias}]);
    setForm({nombre:"",cargo:"",tipo:"mensual",base:"",extras:"0",dias:"22"}); setShowForm(false);
  };

  // Input pequeño para celdas de edición
  const ci = (extra={}) => ({...inpSty, padding:"3px 6px", fontSize:11, width:"100%", ...extra});

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        <KPI label="Costo mensual estimado" value={fmt(emps.reduce((a,e)=>a+calcMensualEq(e),0))} sub={`${emps.length} personas`}/>
        <KPI label="Mensuales" value={fmt(totTipo("mensual"))+"/mes"} sub={`${byTipo("mensual").length} emp.`} color={C.blue}/>
        <KPI label="Semanales" value={fmt(totTipo("semanal"))+"/sem"} sub={`${byTipo("semanal").length} emp.`} color={C.green}/>
        <KPI label="Jornales" value={fmt(totTipo("jornal"))+"/sem"} sub={`${byTipo("jornal").length} emp.`} color={C.orange}/>
      </div>

      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 16px",borderBottom:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{color:C.text,fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14}}>
              Liquidación · {new Date().toLocaleDateString("es-AR")}
            </span>
            {isAdmin && <SavedBadge show={saved}/>}
          </div>
          {isAdmin && (
            <button onClick={()=>{setShowForm(!showForm);setEditingId(null);}}
              style={{background:C.accent,color:C.bg,border:"none",borderRadius:6,padding:"6px 14px",
                fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:12,cursor:"pointer"}}>
              {showForm?"Cancelar":"+ Empleado"}
            </button>
          )}
        </div>

        {/* Formulario nuevo empleado */}
        {isAdmin && showForm && (
          <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,display:"grid",
            gridTemplateColumns:"2fr 2fr 1fr 1fr 1fr 1fr auto",gap:7,alignItems:"end",background:C.bg}}>
            {[["Nombre","nombre","text"],["Cargo","cargo","text"]].map(([l,k])=>(
              <div key={k}><div style={{color:C.textSub,fontSize:9,marginBottom:3}}>{l}</div>
                <input style={{...inpSty,width:"100%"}} value={form[k]}
                  onChange={e=>setForm({...form,[k]:e.target.value})} placeholder={l}/></div>
            ))}
            <div><div style={{color:C.textSub,fontSize:9,marginBottom:3}}>Tipo</div>
              <select style={{...inpSty,width:"100%"}} value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value})}>
                <option value="mensual">Mensual</option>
                <option value="semanal">Semanal</option>
                <option value="jornal">Jornal/día</option>
              </select></div>
            {[["Base ($)","base"],["Extras ($)","extras"],["Días","dias"]].map(([l,k])=>(
              <div key={k}><div style={{color:C.textSub,fontSize:9,marginBottom:3}}>{l}</div>
                <input style={{...inpSty,width:"100%"}} type="number" value={form[k]}
                  onChange={e=>setForm({...form,[k]:e.target.value})}/></div>
            ))}
            <button onClick={agregar} style={{background:C.green,border:"none",borderRadius:6,padding:"7px 14px",
              fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:12,cursor:"pointer",color:"#000"}}>Guardar</button>
          </div>
        )}

        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:900}}>
            <thead><tr>
              <Th>Empleado</Th><Th>Cargo</Th><Th>Tipo</Th><Th>Base</Th>
              <Th>Días</Th><Th>Extras ($)</Th><Th>Total período</Th><Th>Equiv./mes</Th>
              {isAdmin && <Th>Acciones</Th>}
            </tr></thead>
            <tbody>
              {emps.map(e => {
                const editing = isAdmin && editingId === e.id;
                return (
                  <tr key={e.id}
                    style={{background: editing ? C.bg+"ee" : "transparent", transition:"background .12s"}}
                    onMouseEnter={ev=>{ if(!editing) ev.currentTarget.style.background=C.bg+"cc"; }}
                    onMouseLeave={ev=>{ if(!editing) ev.currentTarget.style.background="transparent"; }}>

                    {/* NOMBRE */}
                    <Td>
                      {editing
                        ? <input style={ci({minWidth:130})} value={editRow.nombre}
                            onChange={ev=>setEditRow({...editRow,nombre:ev.target.value})}/>
                        : <span style={{fontWeight:600}}>{e.nombre}</span>}
                    </Td>

                    {/* CARGO */}
                    <Td>
                      {editing
                        ? <input style={ci({minWidth:160})} value={editRow.cargo}
                            onChange={ev=>setEditRow({...editRow,cargo:ev.target.value})}/>
                        : <span style={{color:C.textSub,fontSize:11}}>{e.cargo}</span>}
                    </Td>

                    {/* TIPO */}
                    <Td>
                      {editing
                        ? <select style={ci({minWidth:90})} value={editRow.tipo}
                            onChange={ev=>setEditRow({...editRow,tipo:ev.target.value})}>
                            <option value="mensual">Mensual</option>
                            <option value="semanal">Semanal</option>
                            <option value="jornal">Jornal/día</option>
                          </select>
                        : <Badge color={tc(e.tipo)}>{e.tipo}</Badge>}
                    </Td>

                    {/* BASE */}
                    <Td>
                      {editing
                        ? <input type="number" style={ci({minWidth:100})} value={editRow.base}
                            onChange={ev=>setEditRow({...editRow,base:ev.target.value})}/>
                        : <span style={{fontFamily:"'DM Mono',monospace"}}>
                            {fmt(e.base)}<span style={{color:C.muted,fontSize:9}}>{pl(e.tipo)}</span>
                          </span>}
                    </Td>

                    {/* DÍAS */}
                    <Td>
                      {editing
                        ? <input type="number" min="0" max="31" style={ci({width:55})} value={editRow.dias}
                            onChange={ev=>setEditRow({...editRow,dias:ev.target.value})}/>
                        : <span style={{fontFamily:"'DM Mono',monospace",
                            color:e.tipo==="mensual"?C.muted:C.text}}>{e.dias}d</span>}
                    </Td>

                    {/* EXTRAS */}
                    <Td>
                      {editing
                        ? <input type="number" style={ci({minWidth:90})} value={editRow.extras}
                            onChange={ev=>setEditRow({...editRow,extras:ev.target.value})}/>
                        : <span style={{fontFamily:"'DM Mono',monospace",
                            color:e.extras>0?C.accent:C.muted}}>
                            {e.extras>0?fmt(e.extras):"—"}
                          </span>}
                    </Td>

                    {/* TOTAL */}
                    <Td style={{fontFamily:"'DM Mono',monospace",
                      color:tc(editing?editRow.tipo:e.tipo),fontWeight:700,fontSize:13}}>
                      {fmt(calcPeriodo(editing
                        ? {...e,...editRow,base:+editRow.base,extras:+editRow.extras,dias:+editRow.dias}
                        : e))}
                      <span style={{color:C.muted,fontSize:9,fontWeight:400}}>
                        {pl(editing?editRow.tipo:e.tipo)}
                      </span>
                    </Td>

                    {/* EQUIV MES */}
                    <Td style={{fontFamily:"'DM Mono',monospace",color:C.textSub,fontSize:11}}>
                      {fmt(calcMensualEq(editing
                        ? {...e,...editRow,base:+editRow.base,extras:+editRow.extras,dias:+editRow.dias}
                        : e))}
                    </Td>

                    {/* ACCIONES */}
                    {isAdmin && (
                      <Td>
                        {editing ? (
                          <span style={{display:"flex",gap:5}}>
                            <SmBtn onClick={()=>saveEdit(e.id)}>✓ Guardar</SmBtn>
                            <SmBtn onClick={()=>setEditingId(null)} color={C.muted}>Cancelar</SmBtn>
                          </span>
                        ) : (
                          <span style={{display:"flex",gap:5,alignItems:"center"}}>
                            <GhBtn onClick={()=>startEdit(e)}>✎ Editar</GhBtn>
                            <button onClick={()=>save(emps.filter(x=>x.id!==e.id))}
                              style={{background:"transparent",border:"none",
                                color:C.red,cursor:"pointer",fontSize:14,opacity:.5}}>×</button>
                          </span>
                        )}
                      </Td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── STOCK ────────────────────────────────────────────────────
function ModuloStock({ isAdmin, stockExterno, setStockExterno }) {
  const [stock, setStock] = usePersistentState("parrillas-stock", initStock);
  const [saved, setSaved]     = useState(false);
  const [dep, setDep]         = useState(0);
  const [cat, setCat]         = useState("Todas");
  const [editingId, setEditingId] = useState(null);
  const [editRow, setEditRow] = useState({});
  const [search, setSearch]   = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newRow, setNewRow]   = useState({producto:"",deposito:"1",categoria:"Congelados",stock:"0",minimo:"0",unidad:"u"});

  const save = (next) => {
    setStock(next);
    if(setStockExterno) setStockExterno(next);
    setSaved(true); setTimeout(()=>setSaved(false),2000);
  };

  // Sync con estado externo (para pedidos)
  const stockData = stockExterno || stock;

  const alertas  = stockData.filter(s=>s.stock<=s.minimo);
  const depStock = dep===0?stockData:stockData.filter(s=>s.deposito===dep);
  const allCats  = [...new Set(depStock.map(s=>s.categoria))];
  const filtrado = depStock.filter(s=>
    (cat==="Todas"||s.categoria===cat)&&s.producto.toLowerCase().includes(search.toLowerCase())
  );

  const startEdit = (s) => {
    setEditingId(s.id);
    setEditRow({producto:s.producto,deposito:s.deposito,categoria:s.categoria,stock:s.stock,minimo:s.minimo,unidad:s.unidad||"u"});
  };
  const saveEdit = (id) => {
    save(stockData.map(s=>s.id===id?{...s,...editRow,deposito:+editRow.deposito,stock:+editRow.stock,minimo:+editRow.minimo}:s));
    setEditingId(null);
  };
  const agregar = () => {
    if(!newRow.producto)return;
    save([...stockData,{id:Date.now(),...newRow,deposito:+newRow.deposito,stock:+newRow.stock,minimo:+newRow.minimo}]);
    setNewRow({producto:"",deposito:"1",categoria:"Congelados",stock:"0",minimo:"0",unidad:"u"});
    setShowAdd(false);
  };

  const ci = (w="100%") => ({...inpSty,width:w,padding:"2px 5px",fontSize:11});

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {alertas.length>0 && (
        <div style={{background:C.red+"12",border:`1px solid ${C.red}40`,borderRadius:8,padding:"9px 14px",display:"flex",gap:9,alignItems:"flex-start"}}>
          <span>⚠️</span>
          <span style={{color:C.red,fontSize:11,fontFamily:"'DM Mono',monospace",lineHeight:1.6}}>
            <strong>{alertas.length} productos bajo mínimo:</strong><br/>
            {alertas.map(a=>`${a.producto} (${a.stock} ${a.unidad||"u"})`).join(" · ")}
          </span>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
        <KPI label="Total ítems" value={stockData.length.toString()} sub={`${stockData.filter(s=>s.stock===0).length} agotados · ${alertas.length} bajo mínimo`}/>
        <KPI label="Mariano Acosta" value={`${stockData.filter(s=>s.deposito===1).length} productos`} sub="Congelados + Aderezos" color={C.blue}/>
        <KPI label="Cruz" value={`${stockData.filter(s=>s.deposito===2).length} productos`} sub="Gaseosas + Aderezos + Papelería" color={C.green}/>
      </div>

      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
        <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <span style={{color:C.text,fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14}}>Inventario</span>
          {isAdmin && <SavedBadge show={saved}/>}
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar…"
            style={{...inpSty,width:140,padding:"4px 9px",marginLeft:4}}/>
          <div style={{display:"flex",gap:5,marginLeft:"auto"}}>
            {[0,1,2].map(d=>(
              <TabBtn key={d} active={dep===d} onClick={()=>{setDep(d);setCat("Todas")}}>
                {d===0?"Todos":d===1?"M. Acosta":"Cruz"}
              </TabBtn>
            ))}
          </div>
          {isAdmin && (
            <button onClick={()=>setShowAdd(!showAdd)}
              style={{background:C.accent,color:C.bg,border:"none",borderRadius:6,
                padding:"5px 12px",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:11,cursor:"pointer"}}>
              {showAdd?"Cancelar":"+ Producto"}
            </button>
          )}
          {dep!==0 && (
            <div style={{display:"flex",gap:4,flexWrap:"wrap",width:"100%"}}>
              {["Todas",...allCats].map(c=>(
                <TabBtn key={c} active={cat===c} onClick={()=>setCat(c)} color={catColors[c]||C.accent}>{c}</TabBtn>
              ))}
            </div>
          )}
        </div>

        {isAdmin && showAdd && (
          <div style={{padding:"11px 16px",borderBottom:`1px solid ${C.border}`,
            display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr auto",gap:7,alignItems:"end",background:C.bg}}>
            {[["Producto","producto","text"],["Stock","stock","number"],["Mínimo","minimo","number"],["Unidad","unidad","text"]].map(([l,k,t])=>(
              <div key={k}><div style={{color:C.textSub,fontSize:9,marginBottom:3}}>{l}</div>
                <input style={{...inpSty,width:"100%"}} type={t} value={newRow[k]}
                  onChange={e=>setNewRow({...newRow,[k]:e.target.value})}/></div>
            ))}
            <div><div style={{color:C.textSub,fontSize:9,marginBottom:3}}>Depósito</div>
              <select style={{...inpSty,width:"100%"}} value={newRow.deposito} onChange={e=>setNewRow({...newRow,deposito:e.target.value})}>
                <option value="1">M. Acosta</option><option value="2">Cruz</option>
              </select></div>
            <div><div style={{color:C.textSub,fontSize:9,marginBottom:3}}>Categoría</div>
              <select style={{...inpSty,width:"100%"}} value={newRow.categoria} onChange={e=>setNewRow({...newRow,categoria:e.target.value})}>
                <option>Congelados</option><option>Aderezos</option><option>Gaseosas</option><option>Papelería</option>
              </select></div>
            <SmBtn onClick={agregar}>OK</SmBtn>
          </div>
        )}

        <div style={{maxHeight:500,overflowY:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:700}}>
            <thead style={{position:"sticky",top:0,background:C.card,zIndex:2}}>
              <tr>
                <Th>Producto</Th><Th>Depósito</Th><Th>Categoría</Th>
                <Th>Stock</Th><Th>Unidad</Th><Th>Mínimo</Th><Th>Estado</Th>
                {isAdmin && <Th>Acciones</Th>}
              </tr>
            </thead>
            <tbody>
              {filtrado.length===0 && <tr><Td colSpan={8} style={{color:C.muted,textAlign:"center",padding:20}}>Sin resultados</Td></tr>}
              {filtrado.map(s=>{
                const editing = isAdmin && editingId===s.id;
                const bajo = s.stock<=s.minimo;
                const cc = catColors[s.categoria]||C.accent;
                return (
                  <tr key={s.id}
                    style={{background:editing?C.bg+"ee":"transparent",transition:"background .12s"}}
                    onMouseEnter={ev=>{if(!editing)ev.currentTarget.style.background=C.bg+"cc";}}
                    onMouseLeave={ev=>{if(!editing)ev.currentTarget.style.background="transparent";}}>

                    <Td>{editing
                      ? <input style={ci(140)} value={editRow.producto} onChange={e=>setEditRow({...editRow,producto:e.target.value})}/>
                      : <span style={{fontWeight:600}}>{s.producto}</span>}
                    </Td>

                    <Td>{editing
                      ? <select style={ci(90)} value={editRow.deposito} onChange={e=>setEditRow({...editRow,deposito:e.target.value})}>
                          <option value="1">M. Acosta</option><option value="2">Cruz</option>
                        </select>
                      : <Badge color={s.deposito===1?C.blue:C.green}>{s.deposito===1?"M. Acosta":"Cruz"}</Badge>}
                    </Td>

                    <Td>{editing
                      ? <select style={ci(100)} value={editRow.categoria} onChange={e=>setEditRow({...editRow,categoria:e.target.value})}>
                          <option>Congelados</option><option>Aderezos</option><option>Gaseosas</option><option>Papelería</option>
                        </select>
                      : <Badge color={cc}>{s.categoria}</Badge>}
                    </Td>

                    <Td>{editing
                      ? <input type="number" style={ci(65)} value={editRow.stock} onChange={e=>setEditRow({...editRow,stock:e.target.value})}/>
                      : <span style={{fontFamily:"'DM Mono',monospace",fontWeight:600,
                          color:s.stock===0?"#555":bajo?C.red:C.text}}>{s.stock}</span>}
                    </Td>

                    <Td>{editing
                      ? <input style={ci(55)} value={editRow.unidad} onChange={e=>setEditRow({...editRow,unidad:e.target.value})}/>
                      : <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:C.textSub}}>{s.unidad||"u"}</span>}
                    </Td>

                    <Td>{editing
                      ? <input type="number" style={ci(55)} value={editRow.minimo} onChange={e=>setEditRow({...editRow,minimo:e.target.value})}/>
                      : <span style={{fontFamily:"'DM Mono',monospace",color:C.muted,fontSize:11}}>{s.minimo}</span>}
                    </Td>

                    <Td>
                      {s.stock===0?<Badge color="#555">Agotado</Badge>
                        :bajo?<Badge color={C.red}>⚠ Bajo</Badge>
                        :<Badge color={C.green}>OK</Badge>}
                    </Td>

                    {isAdmin && (
                      <Td>
                        {editing ? (
                          <span style={{display:"flex",gap:5}}>
                            <SmBtn onClick={()=>saveEdit(s.id)}>✓ Guardar</SmBtn>
                            <SmBtn onClick={()=>setEditingId(null)} color={C.muted}>✕</SmBtn>
                          </span>
                        ) : (
                          <span style={{display:"flex",gap:5}}>
                            <GhBtn onClick={()=>startEdit(s)}>✎ Editar</GhBtn>
                            <button onClick={()=>save(stockData.filter(x=>x.id!==s.id))}
                              style={{background:"transparent",border:"none",color:C.red,cursor:"pointer",fontSize:13,opacity:.5}}>×</button>
                          </span>
                        )}
                      </Td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{padding:"8px 16px",borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between"}}>
          <span style={{color:C.muted,fontSize:10,fontFamily:"'DM Mono',monospace"}}>{filtrado.length} / {stockData.length} productos</span>
          <span style={{color:C.muted,fontSize:10,fontFamily:"'DM Mono',monospace"}}>{alertas.length} bajo mínimo · {stockData.filter(s=>s.stock===0).length} agotados</span>
        </div>
      </div>
    </div>
  );
}

// ── PEDIDOS ──────────────────────────────────────────────────
const destinosOpciones = ["LITO'S","FARO","HOMERO","DON JOSÉ","GAUCHITO","AMPARITO","Cliente externo"];

function ModuloPedidos({ isAdmin }) {
  const [stock, setStock]     = usePersistentState("parrillas-stock", initStock);
  const [pedidos, setPedidos] = usePersistentState("parrillas-pedidos", []);
  const [savedP, setSavedP]   = useState(false);
  const [form, setForm]       = useState({ destino:"LITO'S", tipo:"local", fecha:new Date().toISOString().slice(0,10), items:[] });
  const [itemForm, setItemForm] = useState({ stockId:"", cantidad:"1" });
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch]     = useState("");

  const saveP = (next) => { setPedidos(next); setSavedP(true); setTimeout(()=>setSavedP(false),2000); };

  const agregarItem = () => {
    if(!itemForm.stockId||!itemForm.cantidad)return;
    const prod = stock.find(s=>s.id===+itemForm.stockId);
    if(!prod)return;
    const existe = form.items.find(i=>i.stockId===+itemForm.stockId);
    if(existe) {
      setForm({...form,items:form.items.map(i=>i.stockId===+itemForm.stockId
        ?{...i,cantidad:i.cantidad+(+itemForm.cantidad)}:i)});
    } else {
      setForm({...form,items:[...form.items,{stockId:+itemForm.stockId,
        producto:prod.producto,cantidad:+itemForm.cantidad,unidad:prod.unidad||"u"}]});
    }
    setItemForm({stockId:"",cantidad:"1"});
  };

  const confirmarPedido = () => {
    if(!form.items.length)return;
    // Descontar del stock
    const newStock = stock.map(s=>{
      const item = form.items.find(i=>i.stockId===s.id);
      if(!item)return s;
      return {...s, stock: Math.max(0, s.stock - item.cantidad)};
    });
    setStock(newStock);
    const pedido = { id:Date.now(), ...form, estado:"confirmado",
      hora: new Date().toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit"}) };
    saveP([pedido,...pedidos]);
    setForm({ destino:"LITO'S", tipo:"local", fecha:new Date().toISOString().slice(0,10), items:[] });
    setShowForm(false);
  };

  const filtradoP = search
    ? pedidos.filter(p=>p.destino.toLowerCase().includes(search.toLowerCase()))
    : pedidos;

  const totalHoy = pedidos.filter(p=>p.fecha===new Date().toISOString().slice(0,10)).length;
  const totalItems = pedidos.reduce((a,p)=>a+p.items.reduce((b,i)=>b+i.cantidad,0),0);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
        <KPI label="Pedidos totales" value={pedidos.length.toString()} sub="Historial completo"/>
        <KPI label="Pedidos hoy" value={totalHoy.toString()} sub={new Date().toLocaleDateString("es-AR")} color={C.blue}/>
        <KPI label="Unidades despachadas" value={totalItems.toString()} sub="Total histórico" color={C.green}/>
      </div>

      {/* Formulario nuevo pedido */}
      {isAdmin && (
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
            padding:"12px 16px",borderBottom:`1px solid ${C.border}`}}>
            <span style={{color:C.text,fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14}}>
              Nuevo Pedido
            </span>
            <button onClick={()=>setShowForm(!showForm)}
              style={{background:showForm?C.muted:C.accent,color:C.bg,border:"none",borderRadius:6,
                padding:"6px 14px",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:12,cursor:"pointer"}}>
              {showForm?"Cancelar":"+ Cargar pedido"}
            </button>
          </div>

          {showForm && (
            <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:14,background:C.bg}}>
              {/* Cabecera del pedido */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                <div>
                  <div style={{color:C.textSub,fontSize:9,marginBottom:3,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1}}>Destino</div>
                  <select style={{...inpSty,width:"100%"}} value={form.destino}
                    onChange={e=>setForm({...form,destino:e.target.value})}>
                    {destinosOpciones.map(d=><option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{color:C.textSub,fontSize:9,marginBottom:3,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1}}>Tipo</div>
                  <select style={{...inpSty,width:"100%"}} value={form.tipo}
                    onChange={e=>setForm({...form,tipo:e.target.value})}>
                    <option value="local">Local propio</option>
                    <option value="cliente">Cliente externo</option>
                  </select>
                </div>
                <div>
                  <div style={{color:C.textSub,fontSize:9,marginBottom:3,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:1}}>Fecha</div>
                  <input type="date" style={{...inpSty,width:"100%"}} value={form.fecha}
                    onChange={e=>setForm({...form,fecha:e.target.value})}/>
                </div>
              </div>

              {/* Agregar ítems */}
              <div style={{border:`1px solid ${C.border}`,borderRadius:7,overflow:"hidden"}}>
                <div style={{padding:"10px 14px",background:C.panel,
                  display:"flex",gap:8,alignItems:"flex-end",flexWrap:"wrap"}}>
                  <div style={{flex:2,minWidth:160}}>
                    <div style={{color:C.textSub,fontSize:9,marginBottom:3,fontFamily:"'DM Mono',monospace"}}>PRODUCTO</div>
                    <select style={{...inpSty,width:"100%"}} value={itemForm.stockId}
                      onChange={e=>setItemForm({...itemForm,stockId:e.target.value})}>
                      <option value="">— elegí un producto —</option>
                      {stock.map(s=>(
                        <option key={s.id} value={s.id}>
                          {s.producto} ({s.deposito===1?"M.Acosta":"Cruz"}) — stock: {s.stock} {s.unidad||"u"}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{width:90}}>
                    <div style={{color:C.textSub,fontSize:9,marginBottom:3,fontFamily:"'DM Mono',monospace"}}>CANTIDAD</div>
                    <input type="number" min="1" style={{...inpSty,width:"100%"}} value={itemForm.cantidad}
                      onChange={e=>setItemForm({...itemForm,cantidad:e.target.value})}/>
                  </div>
                  <SmBtn onClick={agregarItem}>+ Agregar</SmBtn>
                </div>

                {form.items.length>0 && (
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead><tr>
                      <Th>Producto</Th><Th>Cantidad</Th><Th>Stock disponible</Th><Th></Th>
                    </tr></thead>
                    <tbody>
                      {form.items.map((item,idx)=>{
                        const prod = stock.find(s=>s.id===item.stockId);
                        const suficiente = prod && prod.stock >= item.cantidad;
                        return (
                          <tr key={idx} {...rh}>
                            <Td><span style={{fontWeight:600}}>{item.producto}</span></Td>
                            <Td style={{fontFamily:"'DM Mono',monospace",color:C.accent,fontWeight:700}}>
                              {item.cantidad} {item.unidad}
                            </Td>
                            <Td>
                              <Badge color={suficiente?C.green:C.red}>
                                {prod?`${prod.stock} ${prod.unidad||"u"}`:"?"}
                              </Badge>
                            </Td>
                            <Td>
                              <button onClick={()=>setForm({...form,items:form.items.filter((_,i)=>i!==idx)})}
                                style={{background:"transparent",border:"none",color:C.red,cursor:"pointer",fontSize:13,opacity:.6}}>×</button>
                            </Td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {form.items.length>0 && (
                <div style={{display:"flex",justifyContent:"flex-end",gap:10,alignItems:"center"}}>
                  <span style={{color:C.textSub,fontSize:11,fontFamily:"'DM Mono',monospace"}}>
                    {form.items.length} producto{form.items.length>1?"s":""} · {form.destino}
                  </span>
                  <button onClick={confirmarPedido}
                    style={{background:C.green,color:"#000",border:"none",borderRadius:7,
                      padding:"9px 22px",fontFamily:"'Syne',sans-serif",fontWeight:800,
                      fontSize:13,cursor:"pointer"}}>
                    ✓ Confirmar y descontar del stock
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Historial */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
          padding:"12px 16px",borderBottom:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{color:C.text,fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14}}>Historial de Pedidos</span>
            <SavedBadge show={savedP}/>
          </div>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar destino…"
            style={{...inpSty,width:160,padding:"4px 9px"}}/>
        </div>

        {filtradoP.length===0 ? (
          <div style={{padding:"36px",textAlign:"center",color:C.muted,fontFamily:"'DM Mono',monospace",fontSize:11}}>
            {isAdmin?"No hay pedidos registrados. Usá \"+ Cargar pedido\" para registrar el primero.":"Sin pedidos registrados aún."}
          </div>
        ) : (
          <div style={{maxHeight:480,overflowY:"auto"}}>
            {filtradoP.map(p=>(
              <div key={p.id} style={{borderBottom:`1px solid ${C.border}`,padding:"12px 16px"}}
                onMouseEnter={ev=>ev.currentTarget.style.background=C.bg+"88"}
                onMouseLeave={ev=>ev.currentTarget.style.background="transparent"}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontWeight:700,color:C.text,fontSize:13}}>{p.destino}</span>
                    <Badge color={p.tipo==="local"?C.blue:C.orange}>{p.tipo==="local"?"Local propio":"Cliente ext."}</Badge>
                    <span style={{color:C.muted,fontSize:10,fontFamily:"'DM Mono',monospace"}}>{p.fecha} · {p.hora}</span>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <Badge color={C.green}>{p.items.length} producto{p.items.length>1?"s":""}</Badge>
                    {isAdmin && (
                      <button onClick={()=>saveP(pedidos.filter(x=>x.id!==p.id))}
                        style={{background:"transparent",border:"none",color:C.red,cursor:"pointer",fontSize:13,opacity:.5}}>×</button>
                    )}
                  </div>
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {p.items.map((item,i)=>(
                    <span key={i} style={{background:C.bg,border:`1px solid ${C.border}`,
                      borderRadius:5,padding:"3px 10px",fontSize:11,fontFamily:"'DM Mono',monospace",color:C.text}}>
                      {item.producto} <span style={{color:C.accent,fontWeight:700}}>{item.cantidad} {item.unidad}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── COSTOS ───────────────────────────────────────────────────
function ModuloCostos({ isAdmin }) {
  const [items, setItems] = usePersistentState("parrillas-costos", initCostos);
  const [saved, setSaved]   = useState(false);
  const [editId, setEditId] = useState(null);
  const [editRow,setEditRow]= useState({});
  const [form,setForm]      = useState({producto:"",compra:"0",gastos:"0",margen:"0"});
  const [showForm,setShowForm]=useState(false);

  const save = (next) => { setItems(next); setSaved(true); setTimeout(()=>setSaved(false),2000); };
  const costo=i=>i.compra+i.gastos, venta=i=>costo(i)*(1+i.margen/100), ganancia=i=>venta(i)-costo(i);

  const saveRow = (id) => {
    save(items.map(i=>i.id===id?{...i,compra:+editRow.compra,gastos:+editRow.gastos,margen:+editRow.margen}:i));
    setEditId(null);
  };
  const agregar = () => {
    if(!form.producto)return;
    save([...items,{id:Date.now(),...form,compra:+form.compra,gastos:+form.gastos,margen:+form.margen}]);
    setForm({producto:"",compra:"0",gastos:"0",margen:"0"}); setShowForm(false);
  };

  const pieData = items.filter(i=>ganancia(i)>0).map(i=>({name:i.producto.split(" ")[0],value:Math.round(ganancia(i))}));
  const avgM = items.length?(items.reduce((a,i)=>a+i.margen,0)/items.length).toFixed(1):0;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
        <KPI label="Productos cargados" value={items.length.toString()} sub="Estructura de costos"/>
        <KPI label="Ganancia proyectada" value={fmt(items.reduce((a,i)=>a+ganancia(i),0))} sub="Según precios definidos" color={C.green}/>
        <KPI label="Margen promedio" value={avgM+"%"} sub="Sobre precio de costo" color={C.blue}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:16}}>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",borderBottom:`1px solid ${C.border}`}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{color:C.text,fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14}}>Estructura de Costos</span>
              {isAdmin && <SavedBadge show={saved}/>}
            </div>
            {isAdmin && (
              <button onClick={()=>setShowForm(!showForm)} style={{background:C.accent,color:C.bg,border:"none",borderRadius:6,
                padding:"5px 12px",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:11,cursor:"pointer"}}>
                {showForm?"Cancelar":"+ Producto"}
              </button>
            )}
          </div>
          {isAdmin && showForm && (
            <div style={{padding:"11px 16px",borderBottom:`1px solid ${C.border}`,display:"grid",
              gridTemplateColumns:"2fr 1fr 1fr 1fr auto",gap:7,alignItems:"end",background:C.bg}}>
              <div><div style={{color:C.textSub,fontSize:9,marginBottom:3}}>Producto</div>
                <input style={{...inpSty,width:"100%"}} value={form.producto} onChange={e=>setForm({...form,producto:e.target.value})}/></div>
              {[["P. Compra","compra"],["Gastos","gastos"],["Margen %","margen"]].map(([l,k])=>(
                <div key={k}><div style={{color:C.textSub,fontSize:9,marginBottom:3}}>{l}</div>
                  <input style={{...inpSty,width:"100%"}} type="number" value={form[k]}
                    onChange={e=>setForm({...form,[k]:e.target.value})}/></div>
              ))}
              <SmBtn onClick={agregar}>OK</SmBtn>
            </div>
          )}
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr>
              <Th>Producto</Th><Th>P. Compra</Th><Th>Gastos</Th>
              <Th>Costo total</Th><Th>Margen</Th><Th>P. Venta</Th><Th>Ganancia</Th>
              {isAdmin && <Th></Th>}
            </tr></thead>
            <tbody>
              {items.map(i=>(
                <tr key={i.id} {...rh}>
                  <Td><span style={{fontWeight:600,fontSize:11}}>{i.producto}</span></Td>
                  {isAdmin && editId===i.id ? (
                    <>
                      {["compra","gastos","margen"].map(k=>(
                        <Td key={k}><input type="number" value={editRow[k]}
                          onChange={e=>setEditRow({...editRow,[k]:e.target.value})}
                          style={{...inpSty,width:72,padding:"2px 5px"}}/></Td>
                      ))}
                      <Td colSpan={3} style={{color:C.textSub,fontSize:11,fontFamily:"'DM Mono',monospace"}}>Costo: {fmt((+editRow.compra)+(+editRow.gastos))}</Td>
                      <Td><SmBtn onClick={()=>saveRow(i.id)}>✓ Guardar</SmBtn></Td>
                    </>
                  ) : (
                    <>
                      {[i.compra,i.gastos].map((v,idx)=>(
                        <Td key={idx} style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:v===0?C.muted:C.text}}>{v===0?"—":fmt(v)}</Td>
                      ))}
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
                      {isAdmin && (
                        <Td>
                          <span style={{display:"flex",gap:4}}>
                            <GhBtn onClick={()=>{setEditId(i.id);setEditRow({compra:i.compra,gastos:i.gastos,margen:i.margen})}}>✎ Editar</GhBtn>
                            <button onClick={()=>save(items.filter(x=>x.id!==i.id))}
                              style={{background:"transparent",border:"none",color:C.red,cursor:"pointer",fontSize:12,opacity:.5}}>×</button>
                          </span>
                        </Td>
                      )}
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:16}}>
          <div style={{color:C.text,fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:13,marginBottom:12}}>Distribución de Ganancia</div>
          {pieData.length>0 ? (
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={85} dataKey="value"
                  label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={9}>
                  {pieData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Pie>
                <Tooltip formatter={v=>[fmt(v),"Ganancia"]} contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:6}}/>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{color:C.muted,textAlign:"center",padding:"40px 0",fontSize:11,fontFamily:"'DM Mono',monospace"}}>
              {isAdmin?"Cargá costos reales para ver el gráfico":"Sin datos de costos aún"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── PROVEEDORES ──────────────────────────────────────────────
function ModuloProveedores({ isAdmin }) {
  const [provs, setProvs]    = usePersistentState("parrillas-proveedores", []);
  const [saved, setSaved]    = useState(false);
  const [showForm,setShowForm]=useState(false);
  const [pago,setPago]       = useState({id:null,monto:""});
  const [form,setForm]       = useState({nombre:"",saldo:"",vencimiento:""});

  const save = (next) => { setProvs(next); setSaved(true); setTimeout(()=>setSaved(false),2000); };
  const ec = (e) => e==="pagado"?C.green:e==="vencido"?C.red:C.accent;

  const registrar = (id) => {
    const m=+pago.monto; if(!m)return;
    save(provs.map(p=>p.id===id?{...p,saldo:Math.max(0,p.saldo-m),
      ultimoPago:new Date().toISOString().slice(0,10),estado:p.saldo-m<=0?"pagado":p.estado}:p));
    setPago({id:null,monto:""});
  };
  const agregar = () => {
    if(!form.nombre)return;
    save([...provs,{id:Date.now(),...form,saldo:+form.saldo,ultimoPago:"—",estado:+form.saldo===0?"pagado":"vigente"}]);
    setForm({nombre:"",saldo:"",vencimiento:""}); setShowForm(false);
  };

  const totalDeuda=provs.reduce((a,p)=>a+p.saldo,0);
  const vencidos=provs.filter(p=>p.estado==="vencido");

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
        <KPI label="Deuda total" value={provs.length?fmt(totalDeuda):"—"} sub={`${provs.length} proveedores`} color={C.red}/>
        <KPI label="Cuentas vencidas" value={vencidos.length.toString()} sub={vencidos.map(v=>v.nombre.split(" ")[0]).join(", ")||"Ninguna"} color={vencidos.length>0?C.red:C.green}/>
        <KPI label="Saldadas" value={provs.filter(p=>p.estado==="pagado").length.toString()} sub="Cuentas al día" color={C.green}/>
      </div>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",borderBottom:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{color:C.text,fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14}}>Cuentas Corrientes</span>
            {isAdmin && <SavedBadge show={saved}/>}
          </div>
          {isAdmin && (
            <button onClick={()=>setShowForm(!showForm)} style={{background:C.accent,color:C.bg,border:"none",borderRadius:6,
              padding:"5px 12px",fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:11,cursor:"pointer"}}>
              {showForm?"Cancelar":"+ Proveedor"}
            </button>
          )}
        </div>
        {isAdmin && showForm && (
          <div style={{padding:"11px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",gap:8,alignItems:"flex-end",background:C.bg,flexWrap:"wrap"}}>
            {[["Proveedor","nombre","text","210px"],["Saldo ($)","saldo","number","120px"],["Vencimiento","vencimiento","date","145px"]].map(([l,k,t,w])=>(
              <div key={k}><div style={{color:C.textSub,fontSize:9,marginBottom:3}}>{l}</div>
                <input style={{...inpSty,width:w}} type={t} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/></div>
            ))}
            <button onClick={agregar} style={{background:C.green,border:"none",borderRadius:6,padding:"7px 14px",
              fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:11,cursor:"pointer",color:"#000"}}>Guardar</button>
          </div>
        )}
        {provs.length===0 ? (
          <div style={{padding:"36px",textAlign:"center",color:C.muted,fontFamily:"'DM Mono',monospace",fontSize:11}}>
            {isAdmin ? <><span style={{color:C.textSub}}>No hay proveedores cargados.</span><br/><span style={{color:C.accent}}>+ Proveedor</span> para agregar el primero.</>
              : "No hay proveedores cargados aún."}
          </div>
        ) : (
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr>
              <Th>Proveedor</Th><Th>Saldo</Th><Th>Último pago</Th><Th>Vencimiento</Th><Th>Estado</Th>
              {isAdmin && <Th>Registrar pago</Th>}
              {isAdmin && <Th></Th>}
            </tr></thead>
            <tbody>
              {provs.map(p=>(
                <tr key={p.id} {...rh}>
                  <Td><span style={{fontWeight:600}}>{p.nombre}</span></Td>
                  <Td style={{fontFamily:"'DM Mono',monospace",color:p.saldo>0?C.red:C.green,fontWeight:700}}>{p.saldo>0?fmt(p.saldo):"Saldado"}</Td>
                  <Td style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:C.textSub}}>{p.ultimoPago}</Td>
                  <Td style={{fontFamily:"'DM Mono',monospace",fontSize:11}}>{p.vencimiento||"—"}</Td>
                  <Td><Badge color={ec(p.estado)}>{p.estado}</Badge></Td>
                  {isAdmin && (
                    <Td>
                      {p.saldo>0 && (pago.id===p.id ? (
                        <span style={{display:"flex",gap:4,alignItems:"center"}}>
                          <input type="number" value={pago.monto} onChange={e=>setPago({...pago,monto:e.target.value})}
                            placeholder="Monto" style={{...inpSty,width:95,padding:"3px 6px"}}/>
                          <SmBtn onClick={()=>registrar(p.id)}>✓</SmBtn>
                          <SmBtn onClick={()=>setPago({id:null,monto:""})} color={C.muted}>✕</SmBtn>
                        </span>
                      ) : <GhBtn onClick={()=>setPago({id:p.id,monto:""})}>Registrar pago</GhBtn>)}
                    </Td>
                  )}
                  {isAdmin && (
                    <Td>
                      <button onClick={()=>save(provs.filter(x=>x.id!==p.id))}
                        style={{background:"transparent",border:"none",color:C.red,cursor:"pointer",fontSize:14,opacity:.5}}>×</button>
                    </Td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── VENTAS ───────────────────────────────────────────────────
function ModuloVentas({ isAdmin }) {
  const [datos, setDatos]     = usePersistentState("parrillas-ventas", initVentas);
  const [saved, setSaved]     = useState(false);
  const [vista, setVista]     = useState("barras");
  const [editCell,setEditCell]= useState(null);
  const [editVal, setEditVal] = useState("");

  const save = (next) => { setDatos(next); setSaved(true); setTimeout(()=>setSaved(false),2000); };
  const totalLocal=(k)=>datos.reduce((a,m)=>a+m[k],0);
  const totalGen=localesKeys.reduce((a,k)=>a+totalLocal(k),0);
  const mejorIdx=localesKeys.reduce((bi,k,i,arr)=>totalLocal(k)>totalLocal(arr[bi])?i:bi,0);
  const tieneData=totalGen>0;

  const saveCell=(mi,k)=>{save(datos.map((d,i)=>i===mi?{...d,[k]:+editVal}:d));setEditCell(null);};

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        <KPI label="Ventas totales 6M" value={tieneData?fmt(totalGen):"Sin datos"} sub="Suma todos los locales"/>
        <KPI label="Mejor local" value={tieneData?localesNombres[mejorIdx]:"—"} sub={tieneData?fmt(totalLocal(localesKeys[mejorIdx])):"Cargá ventas"} color={C.green}/>
        <KPI label="Promedio mensual" value={tieneData?fmt(totalGen/6):"—"} sub="Por período" color={C.blue}/>
        <KPI label="Locales" value="6" sub="Costanera Sur" color={C.purple}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:9}}>
        {localesNombres.map((l,i)=>(
          <div key={l} style={{background:C.card,border:`1px solid ${C.border}`,borderTop:`3px solid ${COLORS[i]}`,borderRadius:7,padding:"11px"}}>
            <div style={{color:C.textSub,fontSize:9,fontFamily:"'DM Mono',monospace",marginBottom:2}}>{l}</div>
            <div style={{color:COLORS[i],fontSize:12,fontFamily:"'Syne',sans-serif",fontWeight:700}}>{tieneData?fmt(totalLocal(localesKeys[i])):"—"}</div>
            <div style={{color:C.muted,fontSize:9,marginTop:2}}>6 meses</div>
          </div>
        ))}
      </div>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",borderBottom:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{color:C.text,fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14}}>Ventas por Local</span>
            {isAdmin && <SavedBadge show={saved}/>}
          </div>
          <div style={{display:"flex",gap:5}}>
            {[["Barras","barras"],["Líneas","lineas"],["Distribución","torta"]].map(([l,v])=>(
              <TabBtn key={v} active={vista===v} onClick={()=>setVista(v)}>{l}</TabBtn>
            ))}
          </div>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",minWidth:640}}>
            <thead><tr>
              <Th>Mes</Th>
              {localesNombres.map((l,i)=>(<Th key={l} style={{color:COLORS[i]}}>{l}</Th>))}
              <Th>Total mes</Th>
            </tr></thead>
            <tbody>
              {datos.map((d,mi)=>{
                const rowTotal=localesKeys.reduce((a,k)=>a+d[k],0);
                return (
                  <tr key={d.mes} {...rh}>
                    <Td style={{fontFamily:"'DM Mono',monospace",color:C.accent,fontWeight:600}}>{d.mes}</Td>
                    {localesKeys.map((k,i)=>(
                      <Td key={k}>
                        {isAdmin && editCell&&editCell[0]===mi&&editCell[1]===k ? (
                          <span style={{display:"flex",gap:4,alignItems:"center"}}>
                            <input type="number" value={editVal} onChange={e=>setEditVal(e.target.value)}
                              style={{...inpSty,width:90,padding:"2px 6px"}}/>
                            <SmBtn onClick={()=>saveCell(mi,k)}>✓</SmBtn>
                          </span>
                        ) : (
                          <span style={{display:"flex",gap:5,alignItems:"center",cursor:isAdmin?"pointer":"default"}}
                            onClick={()=>isAdmin&&(setEditCell([mi,k]),setEditVal(d[k]))}>
                            <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:d[k]===0?C.muted:COLORS[i]}}>
                              {d[k]===0?(isAdmin?"— clic para cargar":"—"):fmt(d[k])}
                            </span>
                          </span>
                        )}
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
          {!tieneData ? (
            <div style={{color:C.textSub,fontSize:11,fontFamily:"'DM Mono',monospace",textAlign:"center"}}>
              {isAdmin?"💡 Hacé clic en cualquier celda para cargar ventas. Los gráficos aparecen automáticamente.":"Sin datos de ventas cargados aún."}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              {vista==="barras" ? (
                <BarChart data={datos} barSize={10} barCategoryGap="22%">
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
                  <XAxis dataKey="mes" tick={{fill:C.textSub,fontSize:10}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fill:C.textSub,fontSize:9}} axisLine={false} tickLine={false} tickFormatter={v=>"$"+Math.round(v/1000)+"k"}/>
                  <Tooltip formatter={(v,n)=>[fmt(v),n]} contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:6}}/>
                  <Legend wrapperStyle={{fontFamily:"'DM Mono',monospace",fontSize:10}}/>
                  {localesKeys.map((k,i)=><Bar key={k} dataKey={k} name={localesNombres[i]} fill={COLORS[i]} radius={[3,3,0,0]}/>)}
                </BarChart>
              ) : vista==="lineas" ? (
                <LineChart data={datos}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border}/>
                  <XAxis dataKey="mes" tick={{fill:C.textSub,fontSize:10}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fill:C.textSub,fontSize:9}} axisLine={false} tickLine={false} tickFormatter={v=>"$"+Math.round(v/1000)+"k"}/>
                  <Tooltip formatter={(v,n)=>[fmt(v),n]} contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:6}}/>
                  <Legend wrapperStyle={{fontFamily:"'DM Mono',monospace",fontSize:10}}/>
                  {localesKeys.map((k,i)=><Line key={k} type="monotone" dataKey={k} name={localesNombres[i]} stroke={COLORS[i]} strokeWidth={2} dot={{r:3}}/>)}
                </LineChart>
              ) : (
                <PieChart>
                  <Pie data={localesNombres.map((l,i)=>({name:l,value:totalLocal(localesKeys[i])}))}
                    cx="50%" cy="50%" outerRadius={100} dataKey="value"
                    label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                    {localesNombres.map((_,i)=><Cell key={i} fill={COLORS[i]}/>)}
                  </Pie>
                  <Tooltip formatter={v=>[fmt(v),"Ventas"]} contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:6}}/>
                </PieChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

// ── APP ──────────────────────────────────────────────────────
const MODULOS = [
  { id:"sueldos",     label:"Sueldos",    icon:"👥", desc:"15 empleados" },
  { id:"stock",       label:"Stock",       icon:"📦", desc:"M. Acosta · Cruz" },
  { id:"pedidos",     label:"Pedidos",     icon:"🛒", desc:"Despacho · clientes" },
  { id:"costos",      label:"Costos",      icon:"💰", desc:"Márgenes · precios" },
  { id:"proveedores", label:"Proveedores", icon:"🤝", desc:"Cuentas corrientes" },
  { id:"ventas",      label:"Ventas",      icon:"📊", desc:"6 locales · costanera" },
];

export default function App() {
  const [role, setRole]     = useState(null);
  const [modulo, setModulo] = useState("sueldos");

  if (!role) return <LoginScreen onLogin={setRole}/>;

  const actual  = MODULOS.find(m=>m.id===modulo);
  const isAdmin = role === "admin";

  return (
    <div style={{display:"flex",minHeight:"100vh",background:C.bg,fontFamily:"'Syne',sans-serif",color:C.text}}>
      <div style={{width:200,background:C.panel,borderRight:`1px solid ${C.border}`,
        display:"flex",flexDirection:"column",flexShrink:0,position:"sticky",top:0,height:"100vh"}}>
        <div style={{padding:"20px 16px 16px",borderBottom:`1px solid ${C.border}`}}>
          <div style={{color:C.accent,fontWeight:800,fontSize:16,letterSpacing:-0.5}}>PARRILLAS</div>
          <div style={{color:C.muted,fontSize:9,fontFamily:"'DM Mono',monospace",marginTop:1}}>sistema de gestión</div>
        </div>
        <nav style={{flex:1,padding:"8px 6px",display:"flex",flexDirection:"column",gap:2,overflowY:"auto"}}>
          {MODULOS.map(m=>(
            <button key={m.id} onClick={()=>setModulo(m.id)}
              style={{display:"flex",alignItems:"center",gap:9,padding:"8px 9px",borderRadius:6,border:"none",
                cursor:"pointer",textAlign:"left",width:"100%",
                background:modulo===m.id?C.accent+"18":"transparent",
                borderLeft:modulo===m.id?`3px solid ${C.accent}`:"3px solid transparent",
                transition:"all .12s"}}>
              <span style={{fontSize:16}}>{m.icon}</span>
              <div>
                <div style={{color:modulo===m.id?C.accent:C.text,fontSize:12,fontWeight:modulo===m.id?700:500}}>{m.label}</div>
                <div style={{color:C.muted,fontSize:9,fontFamily:"'DM Mono',monospace"}}>{m.desc}</div>
              </div>
            </button>
          ))}
        </nav>
        <div style={{padding:"12px 16px",borderTop:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
            <span style={{
              background:isAdmin?C.accent+"22":C.blue+"22",
              color:isAdmin?C.accent:C.blue,
              border:`1px solid ${isAdmin?C.accent:C.blue}44`,
              padding:"2px 8px",borderRadius:4,fontSize:9,
              fontFamily:"'DM Mono',monospace",fontWeight:600
            }}>{isAdmin?"ADMIN":"LECTOR"}</span>
            <button onClick={()=>setRole(null)}
              style={{background:"transparent",border:"none",color:C.muted,cursor:"pointer",
                fontSize:9,fontFamily:"'DM Mono',monospace",textDecoration:"underline"}}>
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
            {!isAdmin && (
              <span style={{marginLeft:"auto",background:C.blue+"15",color:C.blue,
                border:`1px solid ${C.blue}30`,padding:"4px 12px",borderRadius:6,
                fontSize:10,fontFamily:"'DM Mono',monospace"}}>
                👁 modo lectura
              </span>
            )}
          </div>
        </div>
        <div style={{padding:"22px 26px"}}>
          {modulo==="sueldos"     && <ModuloSueldos     isAdmin={isAdmin}/>}
          {modulo==="stock"       && <ModuloStock        isAdmin={isAdmin}/>}
          {modulo==="pedidos"     && <ModuloPedidos      isAdmin={isAdmin}/>}
          {modulo==="costos"      && <ModuloCostos       isAdmin={isAdmin}/>}
          {modulo==="proveedores" && <ModuloProveedores  isAdmin={isAdmin}/>}
          {modulo==="ventas"      && <ModuloVentas       isAdmin={isAdmin}/>}
        </div>
      </div>
    </div>
  );
}
