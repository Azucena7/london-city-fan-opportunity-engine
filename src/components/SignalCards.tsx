"use client";
import { useLanguage } from "./LanguageProvider";
export function SignalCards(){const {lang}=useLanguage(); const es=lang==='es'; const rows=es?[
 ['Weather','EN ESPERA','Se activa dentro de la ventana fiable de forecast de 5–7 días.','Modifica conversión, viaje y mensaje para familias.'],
 ['Momentum de asistencia','EN ESPERA','Requiere ventas actuales, scans o rendimiento reciente.','Indica si la demanda está respondiendo.'],
 ['Competencia de atención','ACTIVA','Grandes eventos, TV, festivos y deporte competidor.','Mueve inversión y mensaje por partido.'],
 ['Hueco de calendario','ACTIVA','Palace, Charlton, Chelsea y otro inventario local.','Encuentra las mejores semanas para captar.']
 ]:[
 ['Weather','WAITING','Activate inside the reliable 5–7 day forecast window.','Modify conversion, travel and family messaging.'],
 ['Attendance momentum','WAITING','Requires current sales / scans / recent match performance.','Tell us whether demand is responding.'],
 ['Attention competition','ACTIVE','Major events, TV, holidays and competing sport.','Shift spend and message by fixture.'],
 ['Calendar whitespace','ACTIVE','Palace, Charlton, Chelsea and other local inventory.','Find the best weeks to acquire.']
 ]; return <div className="signalCards">{rows.map(([title,status,detail,use])=><article className="signalCard" key={title}><div className="signalTop"><h3>{title}</h3><span className={`signalStatus ${status==='ACTIVE'||status==='ACTIVA'?'active':''}`}>{status}</span></div><p>{detail}</p><div className="muted">{use}</div></article>)}</div>}
