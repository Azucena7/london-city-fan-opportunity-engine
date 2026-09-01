"use client";
import { SignalBadge } from "./SignalBadge";
import { useLanguage } from "./LanguageProvider";
import { useLiveMatch } from "./LiveMatchProvider";

export function WeatherLiveCard() {
 const {t,lang}=useLanguage(); const s=useLiveMatch();
 if(s.weatherSuitability===null) return <article className="weatherCard"><div className="liveSignalTop"><span>{t.common.weather}</span><SignalBadge type="WAITING"/></div><div className="weatherHeadline">{t.weather.outside}</div><div className="muted">{t.weather.outsideText}</div></article>;
 return <article className="weatherCard liveWeather"><div className="liveSignalTop"><span>{t.common.weather} · Hayes Lane</span><SignalBadge type="LIVE"/></div>
  <div className="weatherGrid"><div><div className="weatherScore">{s.weatherSuitability}</div><div className="muted">{t.weather.suitability}</div></div>
  <div><div className="weatherHeadline">{lang==='es'?'Señal live activada':'Live signal active'}</div><div className="weatherFacts"><span>{s.fixture.date}</span><span>{s.fixture.kickoff ?? 'TBC'}</span></div></div></div>
  <div className="weatherMeta"><span>{s.fixture.opponent}</span><span>{t.weather.refreshed}{s.updatedAt?` · ${new Date(s.updatedAt).toLocaleString(lang==='es'?'es-ES':'en-GB')}`:''}</span></div>
 </article>;
}
