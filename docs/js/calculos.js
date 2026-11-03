// Tipos, efectividad y lectura de combates. Sin DOM: se puede probar por separado.
export const TN={normal:'Normal',fuego:'Fuego',agua:'Agua',electrico:'Eléctrico',planta:'Planta',hielo:'Hielo',lucha:'Lucha',veneno:'Veneno',tierra:'Tierra',volador:'Volador',psiquico:'Psíquico',bicho:'Bicho',roca:'Roca',fantasma:'Fantasma',dragon:'Dragón',siniestro:'Siniestro',acero:'Acero'};
export const TT=Object.keys(TN);
// Tabla de 5.ª generación (PokeMMO no tiene tipo Hada).
const CH={normal:{roca:.5,fantasma:0,acero:.5},fuego:{fuego:.5,agua:.5,planta:2,hielo:2,bicho:2,roca:.5,dragon:.5,acero:2},agua:{fuego:2,agua:.5,planta:.5,tierra:2,roca:2,dragon:.5},electrico:{agua:2,electrico:.5,planta:.5,tierra:0,volador:2,dragon:.5},planta:{fuego:.5,agua:2,planta:.5,veneno:.5,tierra:2,volador:.5,bicho:.5,roca:2,dragon:.5,acero:.5},hielo:{fuego:.5,agua:.5,planta:2,hielo:.5,tierra:2,volador:2,dragon:2,acero:.5},lucha:{normal:2,hielo:2,veneno:.5,volador:.5,psiquico:.5,bicho:.5,roca:2,fantasma:0,siniestro:2,acero:2},veneno:{planta:2,veneno:.5,tierra:.5,roca:.5,fantasma:.5,acero:0},tierra:{fuego:2,electrico:2,planta:.5,veneno:2,volador:0,bicho:.5,roca:2,acero:2},volador:{electrico:.5,planta:2,lucha:2,bicho:2,roca:.5,acero:.5},psiquico:{lucha:2,veneno:2,psiquico:.5,siniestro:0,acero:.5},bicho:{fuego:.5,planta:2,lucha:.5,veneno:.5,volador:.5,psiquico:2,fantasma:.5,siniestro:2,acero:.5},roca:{fuego:2,hielo:2,lucha:.5,tierra:.5,volador:2,bicho:2,acero:.5},fantasma:{normal:0,psiquico:2,fantasma:2,siniestro:.5,acero:.5},dragon:{dragon:2,acero:.5},siniestro:{lucha:.5,psiquico:2,fantasma:2,siniestro:.5,acero:.5},acero:{fuego:.5,agua:.5,electrico:.5,hielo:2,roca:2,acero:.5}};
export const ESPECIES={
 Serperior:{id:497,t:['planta']},Simipour:{id:516,t:['agua']},Graveler:{id:75,t:['roca','tierra'],evo:'Golem',cond:'por intercambio'},Golem:{id:76,t:['roca','tierra']},
 Dratini:{id:147,t:['dragon'],evo:'Dragonair',cond:'Nv.30'},Dragonair:{id:148,t:['dragon'],evo:'Dragonite',cond:'Nv.55'},Dragonite:{id:149,t:['dragon','volador']},
 Bagon:{id:371,t:['dragon'],evo:'Shelgon',cond:'Nv.30'},Shelgon:{id:372,t:['dragon'],evo:'Salamence',cond:'Nv.50'},Salamence:{id:373,t:['dragon','volador']},
 Golett:{id:622,t:['tierra','fantasma'],evo:'Golurk',cond:'Nv.43'},Golurk:{id:623,t:['tierra','fantasma']}};
export const CAPS={Teselia:[20,24,27,31,35,38,43,46,56],Kanto:[20,26,32,37,46,47,50,55,62],Johto:[20,24,29,32,37,39,41,46,48],Hoenn:[20,24,28,33,35,38,44,48,58],Sinnoh:[20,27,29,34,37,43,46,52,60]};
export const xf=m=>m===.5?'×½':m===.25?'×¼':'×'+m;
export function mult(at,defs,nombre,inm={}){let m=1;for(const d of defs){const c=CH[at]||{};m*=(d in c)?c[d]:1}if(nombre&&inm[nombre]===at)m=0;return m}
export function mejorGolpe(mon,r,inm){const esp=ESPECIES[mon.sp];let best=null;for(const[n,t,p]of mon.mov){if(!p)continue;const m=mult(t,r[3],r[0],inm);const v=p*m*(esp.t.includes(t)?1.5:1);if(!best||v>best.v)best={n,t,m,v}}return best||{n:'Sin ataques',t:'normal',m:0,v:0}}
export function golpeRecibido(r,mon){const defs=ESPECIES[mon.sp].t;let peor={m:0,n:''};for(const[n,t]of(r[4]||r[3].map(t=>[TN[t],t]))){const m=mult(t,defs);if(m>peor.m)peor={m,n}}return peor}
export function celda(mon,r,inm){const g=mejorGolpe(mon,r,inm),d=golpeRecibido(r,mon);return{g,d,s:g.v/Math.max(d.m,.25)}}
export function temporada(d=new Date()){return['Primavera','Verano','Otoño','Invierno'][d.getUTCMonth()%4]}
