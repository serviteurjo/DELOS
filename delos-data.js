/* ================================================================
   DELOS 2026 — DONNÉES ET GESTION DE L'ÉTAT (localStorage)
   Programme officiel V2 — 21 au 26 Septembre 2026
   ================================================================ */

const DAYS = [
  { n:1, name:'COMPRENDRE',   sub:'Les médias, le nouveau territoire d\'influence',      date:'Lun. 21 Sept' },
  { n:2, name:'CRÉER',        sub:'Le cinéma comme langage d\'influence',               date:'Mar. 22 Sept' },
  { n:3, name:'MAÎTRISER',    sub:'Devenir un créateur de médias',                      date:'Mer. 23 Sept' },
  { n:4, name:'INNOVER',      sub:'L\'Intelligence Artificielle au service de la création', date:'Jeu. 24 Sept' },
  { n:5, name:'ENTREPRENDRE', sub:'Transformer son talent en valeur',                   date:'Ven. 25 Sept' },
  { n:6, name:'ENVOYER',      sub:'Du contenu à l\'impact',                              date:'Sam. 26 Sept' }
];

const PANELS = [
  { code:'PAN01', day:1, time:'10h20 - 12h00', format:'Masterclass',     title:'Le pouvoir des médias dans la transformation des sociétés', axis:'Influence & Société', by:'FEMI', img:'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=70' },
  { code:'PAN02', day:1, time:'13h30 - 15h30', format:'DÉLOS Lab',       title:'Cartographier son écosystème d\'influence',                axis:'Stratégie d\'influence', by:'GILLES', img:'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=70' },
  { code:'PAN03', day:1, time:'16h00 - 17h00', format:'DÉLOS Experience',title:'Démonstration de production audiovisuelle',                axis:'Production Live', by:'FEMI', img:'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=600&q=70' },
  { code:'PAN04', day:1, time:'18h00 - 19h00', format:'DÉLOS Talk',      title:'Parcours d\'un créateur',                                  axis:'Témoignage', by:'FEMI', img:'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=70' },
  { code:'PAN05', day:1, time:'19h00 - 20h30', format:'Grand Panel',     title:'Qui façonne l\'imaginaire (la manière dont les jeunes pensent, rêvent, aiment, consomment et voient la vie) de notre génération ?', axis:'Imaginaire & Génération', by:'CRYSPUS', img:'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=600&q=70' },

  { code:'PAN06', day:2, time:'10h20 - 12h00', format:'Masterclass',     title:'De l\'inspiration au scénario : concevoir des histoires à fort impact', axis:'Écriture & Impact', by:'JOEL', img:'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=70' },
  { code:'PAN07', day:2, time:'13h30 - 15h30', format:'DÉLOS Lab / Atelier', title:'Écrire et construire une scène',                      axis:'Atelier d\'écriture', by:'JOEL', img:'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=70' },
  { code:'PAN08', day:2, time:'16h00 - 18h00', format:'DÉLOS Experience',title:'L\'art de la mise en scène & la direction d\'acteurs',    axis:'Mise en scène', by:'JOSEPH', img:'https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?auto=format&fit=crop&w=600&q=70' },
  { code:'PAN09', day:2, time:'18h00 - 19h00', format:'DÉLOS Talk',      title:'Mon parcours dans le cinéma',                            axis:'Témoignage Cinéma', by:'JOEL', img:'https://images.unsplash.com/photo-1485095329183-d0797cdc5676?auto=format&fit=crop&w=600&q=70' },
  { code:'PAN10', day:2, time:'19h00 - 20h30', format:'Grand Panel',     title:'Le cinéma chrétien peut-il changer l\'imaginaire ?',     axis:'Cinéma & Foi', by:'CRYSPUS', img:'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=70' },

  { code:'PAN11', day:3, time:'10h20 - 12h00', format:'Masterclass',     title:'Bâtir une stratégie média et une présence digitale qui influencent et transforment un ministère ou une marque', axis:'Stratégie Digitale', by:'ULRICH', img:'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=600&q=70' },
  { code:'PAN12', day:3, time:'13h30 - 15h30', format:'DÉLOS Lab / Atelier', title:'Créer une vidéo de A à Z',                          axis:'Atelier Vidéo', by:'FEMI', img:'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=600&q=70' },
  { code:'PAN13', day:3, time:'16h00 - 17h00', format:'DÉLOS Experience',title:'L\'art de l\'image : développer sa propre signature visuelle', axis:'Direction Artistique', by:'RUSTIQUE', img:'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=600&q=70' },
  { code:'PAN14', day:3, time:'18h00 - 19h00', format:'DÉLOS Talk',      title:'Les coulisses de la création de contenu',               axis:'Behind The Scenes', by:'ULRICH', img:'https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=600&q=70' },
  { code:'PAN15', day:3, time:'19h00 - 20h30', format:'Grand Panel',     title:'Médias & Réveil : comment toucher la génération digitale ?', axis:'Médias & Réveil', by:'CRYSPUS', img:'https://images.unsplash.com/photo-1531497865144-0464ef8fb9a9?auto=format&fit=crop&w=600&q=70' },

  { code:'PAN16', day:4, time:'10h20 - 12h00', format:'Masterclass',     title:'L\'IA au service de la création : outils, méthodes et opportunités', axis:'IA & Création', by:'GEOFFROY', img:'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=600&q=70' },
  { code:'PAN17', day:4, time:'13h30 - 15h30', format:'DÉLOS Lab / Atelier', title:'Générer des visuels, scripts et contenus avec l\'IA', axis:'Atelier IA', by:'GEOFFROY / RUSTIQUE', img:'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=600&q=70' },
  { code:'PAN18', day:4, time:'16h00 - 17h00', format:'DÉLOS Experience / AI Live', title:'Production d\'un projet média en direct',     axis:'AI Live Show', by:'GEOFFROY', img:'https://images.unsplash.com/photo-1581090700227-1e8e6efc2a0f?auto=format&fit=crop&w=600&q=70' },
  { code:'PAN19', day:4, time:'18h00 - 19h00', format:'DÉLOS Talk',      title:'IA, menace ou opportunité ?',                           axis:'Éthique & IA', by:'CRYSPUS', img:'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=600&q=70' },
  { code:'PAN20', day:4, time:'19h00 - 20h30', format:'Grand Panel',     title:'L\'IA au service de l\'Évangile et du business',         axis:'IA, Évangile & Business', by:'CRYSPUS', img:'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=600&q=70' },

  { code:'PAN21', day:5, time:'10h20 - 12h00', format:'Masterclass',     title:'Monétiser son talent créatif',                          axis:'Monétisation', by:'FEMI', img:'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=600&q=70' },
  { code:'PAN22', day:5, time:'13h30 - 15h30', format:'DÉLOS Lab / Atelier', title:'Construire son offre créative',                      axis:'Offre & Positionnement', by:'GILLES', img:'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=600&q=70' },
  { code:'PAN23', day:5, time:'16h00 - 17h00', format:'DÉLOS Experience / Pitch Lab', title:'Présenter son projet',                   axis:'Pitch & Storytelling', by:'GILLES', img:'https://images.unsplash.com/photo-1559223607-a43c990c692c?auto=format&fit=crop&w=600&q=70' },
  { code:'PAN24', day:5, time:'18h00 - 19h00', format:'DÉLOS Talk / Business Talk', title:'Entreprendre avec sa foi',                axis:'Foi & Entrepreneuriat', by:'SIMEON', img:'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=600&q=70' },
  { code:'PAN25', day:5, time:'19h00 - 20h30', format:'Grand Panel',     title:'Business chrétien, valeur & influence',                 axis:'Business & Foi', by:'SIMEON', img:'https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?auto=format&fit=crop&w=600&q=70' }
];

const J6_EVENTS = [
  { code:'PAN26', time:'10h00 - 12h30', format:'Masterclass Finale', title:'Masterclass Finale', desc:'Session conclusive de la semaine : synthèse des apprentissages et orientation stratégique.', img:'https://images.unsplash.com/photo-1475721027785-f74eccf67e82?auto=format&fit=crop&w=600&q=70' },
  { code:'PAN27', time:'13h30 - 15h30', format:'DÉLOS Challenge',   title:'Grande Finale : Présentation des projets DÉLOS Challenge', desc:'Les participants présentent leurs projets médias devant un jury d\'experts.', img:'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=70' },
  { code:'PAN28', time:'17h30 - 21h00', format:'Grand Panel Final', title:'Grand Panel Final : Quel média pour quel réveil ?', desc:'Table ronde d\'envoi et temps d\'impulsion spirituelle pour clore la conférence.', img:'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=70' }
];

const PILLARS = [
  { icon:'👁', name:'COMPRENDRE',  binomial:'Décoder les médias',    day:'Jour 1 — 21 Sept', color:'#8B5CF6', image:'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=600&q=70', pos:'center', desc:'Décoder les médias comme nouveau territoire d\'influence et mesurer leur rôle dans la transformation des sociétés.' },
  { icon:'🎬', name:'CRÉER',       binomial:'Le cinéma comme langage', day:'Jour 2 — 22 Sept', color:'#DC2626', image:'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=70', pos:'center 40%', desc:'Maîtriser le cinéma comme langage d\'influence : scénario, mise en scène et direction d\'acteurs.' },
  { icon:'🎯', name:'MAÎTRISER',   binomial:'Stratégie & présence',    day:'Jour 3 — 23 Sept', color:'#F59E0B', image:'https://images.unsplash.com/photo-1551817958-d9d86fb29431?auto=format&fit=crop&w=600&q=70', pos:'center', desc:'Bâtir une stratégie média et une présence digitale qui transforment un ministère ou une marque.' },
  { icon:'🤖', name:'INNOVER',     binomial:'IA & création',           day:'Jour 4 — 24 Sept', color:'#84CC16', image:'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=600&q=70', pos:'center 35%', desc:'Mettre l\'Intelligence Artificielle au service de la création : outils, méthodes et opportunités.' },
  { icon:'💼', name:'ENTREPRENDRE',binomial:'Du talent à l\'offre',     day:'Jour 5 — 25 Sept', color:'#F59E0B', image:'https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?auto=format&fit=crop&w=600&q=70', pos:'center', desc:'Transformer son talent créatif en offre viable : pitch, monétisation, business chrétien.' },
  { icon:'🕊', name:'ENVOYER',     binomial:'Du contenu à l\'impact',  day:'Jour 6 — 26 Sept', color:'#DC2626', image:'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=70', pos:'center 60%', desc:'Du contenu à l\'impact : finale DÉLOS Challenge, Grand Panel Final et impulsion spirituelle.' }
];

/* Portraits officiels des panélistes (assets/img-réels-panélistes/) — expert01..12 dans l'ordre */
const SPEAKERS = [
  { name:'ROMÉO ADAMOU', role:'Docteur • Acteur culturel • Prophète', img:'assets/img-réels-panélistes/expert01.webp', angle:'De consommateur à créateur d\u2019influence : l\u2019onction pour impacter les sphères de la société par les médias, le cinéma et l\u2019IA', bio:'Universitaire, Docteur en Environnement, acteur culturel béninois et Responsable de jeunes. Il met la science, la culture et la création audiovisuelle au service du développement durable et de la jeunesse chrétienne.' },
  { name:'ULRICH JOHNSON', role:'Directeur artistique • Designer graphique', img:'assets/img-réels-panélistes/expert02.webp', angle:'Bâtir une stratégie média et une présence digitale qui influencent et transforment un ministère ou une marque', bio:'Fondateur du média Acoustic Boulevard, graphiste éditorial et Social Media Manager. Depuis plus de 10 ans, il construit des présences digitales qui comptent, du branding visuel à la gestion de communautés.' },
  { name:'RUSTIQUE AKODOGBO', role:'Consultant • Formateur • Spécialiste IA', img:'assets/img-réels-panélistes/expert03.webp', angle:'IA, Foi & Business : transformer l\u2019intelligence artificielle en levier de croissance', bio:'Plus de dix ans d\u2019expérience dans l\u2019accompagnement des PME et entrepreneurs. Il conçoit des formations pratiques où l\u2019IA est appliquée directement aux problématiques métiers, avec une exigence de résultats.' },
  { name:'OLUWAFEMI HOUNGBO', role:'Pasteur • Réalisateur • Directeur artistique', img:'assets/img-réels-panélistes/expert04.webp', angle:'Le pouvoir des médias dans la transformation des sociétés', bio:'Pasteur et professionnel béninois de l\u2019audiovisuel. Réalisateur et directeur artistique, il accompagne ministères, institutions et entreprises vers des productions audiovisuelles à fort impact.' },
  { name:'SIMÉON MAHUKLO', role:'Entrepreneur • Leader • Développeur de projets', img:'assets/img-réels-panélistes/expert05.webp', angle:'De la vision à l\u2019action : transformer une idée en projet et bâtir une activité qui crée de la valeur', bio:'Entrepreneur et développeur de projets engagé dans l\u2019accompagnement des personnes. Il articule entrepreneuriat, leadership, développement personnel et foi chrétienne.' },
  { name:'JOEL HOSSOU', role:'Scénariste • Cinéaste chrétien', img:'assets/img-réels-panélistes/expert06.webp', angle:'De l\u2019idée à l\u2019écran : les fondamentaux de la production d\u2019un film chrétien', bio:'Scénariste, réalisateur et acteur engagé dans le cinéma chrétien au Bénin. Président de Yawheh Productions et promoteur du Festival Francophone du Cinéma Chrétien (FFCC).' },
  { name:'GILLES HOUNGBO', role:'Expert digital • Deejay • Designer', img:'assets/img-réels-panélistes/expert07.webp', angle:'Cartographier son écosystème d\u2019influence — Construire une offre créative pour un ministère ou un business', bio:'Créatif béninois polyvalent à la croisée de la musique, du design et du digital. Deejay Gospel, designer graphique et social media manager, il comprend la communication depuis le son, l\u2019image et le web.' },
  { name:'ORENS BOKO', role:'Artiste photographe • Artiste visuel', img:'assets/img-réels-panélistes/expert08.webp', angle:'La photographie professionnelle : créer des images qui racontent, influencent et valorisent une identité de ministère ou de business', bio:'Photographe béninois à la rencontre de l\u2019art, de la culture et de l\u2019identité. À travers son objectif, il explore les réalités de la société béninoise et valorise les histoires humaines.' },
  { name:'CRYSPUS AKODIGNA', role:'Médecin • Apologète • Créateur de contenus', img:'assets/img-réels-panélistes/expert09.webp', angle:'Défendre sa foi à l\u2019ère du numérique : comment les chrétiens peuvent utiliser les médias pour faire briller l\u2019Évangile', bio:'Médecin béninois engagé à la croisée de la médecine, du numérique et de la foi chrétienne. Il forme une génération de chrétiens capables de connaître, comprendre et défendre leur foi.' },
  { name:'ROCELIN TACOLODJOU', role:'Journaliste • Animateur • Manager d\u2019artiste', img:'assets/img-réels-panélistes/expert10.webp', angle:'Créateur de contenu, métier ou ministère ? Comment construire son image, développer son audience et exercer une influence ?', bio:'Professionnel béninois des médias à la croisée du journalisme, de l\u2019animation et de la création de contenus. Il décrypte les nouveaux usages du digital pour raconter et fédérer.' },
  { name:'CYRILLE BONOU', role:'Comédien • Professeur de Lettres', img:'assets/img-réels-panélistes/expert11.webp', angle:'L\u2019art de la mise en scène & la direction d\u2019acteurs', bio:'Acteur culturel béninois, professeur de lettres et comédien engagé dans la valorisation du théâtre comme outil d\u2019éducation, de transmission et de transformation sociale.' },
  { name:'OBAFEMI FOLAHAN', role:'Expert audiovisuel • Responsable Média', img:'assets/img-réels-panélistes/expert12.webp', angle:'Créer et diriger une équipe média de A à Z', bio:'Professionnel béninois de l\u2019audiovisuel spécialisé dans la réalisation vidéo, la photographie et les identités visuelles. Il dirige la production de contenus avec une vision centrée sur l\u2019excellence et le storytelling.' }
];

const INITIAL_INSCRIPTIONS = [
  { id:'INS-0001', nom:'AGBOSSI', prenom:'Marcel', email:'marcel.agbossi@gmail.com', phone:'+229 01 97 12 34 56', passType:'premium', panels:[], amount:5000, ref:'MM260921-88412', proof:'sms', status:'validated', createdAt:new Date('2026-08-02').toISOString(), tickets:[{code:'DELOS-SP-001', panel:'ALL'}], rejectReason:'' },
  { id:'INS-0002', nom:'KPOSSOU', prenom:'Prisca', email:'prisca.kp@yahoo.fr', phone:'+229 01 66 45 78 90', passType:'carte', panels:['PAN01','PAN04','PAN19'], amount:3000, ref:'MM260921-10293', proof:'sms', status:'validated', createdAt:new Date('2026-08-05').toISOString(), tickets:[{code:'PAN01-INS001',panel:'PAN01'},{code:'PAN04-INS001',panel:'PAN04'},{code:'PAN19-INS001',panel:'PAN19'}], rejectReason:'' },
  { id:'INS-0003', nom:'HOUNSOU', prenom:'David', email:'david.hounsou@gmail.com', phone:'+229 01 95 22 11 33', passType:'carte', panels:['PAN07','PAN10'], amount:2000, ref:'MM260922-55671', proof:'sms', status:'pending', createdAt:new Date('2026-09-10').toISOString(), tickets:[], rejectReason:'' },
  { id:'INS-0004', nom:'ADJOVI', prenom:'Carine', email:'carine.adjovi@outlook.com', phone:'+229 01 62 88 44 21', passType:'premium', panels:[], amount:5000, ref:'MM260922-78230', proof:'sms', status:'pending', createdAt:new Date('2026-09-11').toISOString(), tickets:[], rejectReason:'' },
  { id:'INS-0005', nom:'TOSSOU', prenom:'Emmanuel', email:'e.tossou@gmail.com', phone:'+229 01 90 33 55 77', passType:'carte', panels:['PAN13','PAN14','PAN25'], amount:3000, ref:'MM260812-30918', proof:'sms', status:'validated', createdAt:new Date('2026-08-12').toISOString(), tickets:[{code:'PAN13-INS001',panel:'PAN13'},{code:'PAN14-INS001',panel:'PAN14'},{code:'PAN25-INS001',panel:'PAN25'}], rejectReason:'' },
  { id:'INS-0006', nom:'DOSSOU', prenom:'Grâce', email:'grace.dossou@gmail.com', phone:'+229 01 55 66 77 88', passType:'carte', panels:['PAN22'], amount:1000, ref:'REF-INVALIDE', proof:null, status:'rejected', createdAt:new Date('2026-08-15').toISOString(), tickets:[], rejectReason:"Référence de transaction introuvable auprès de l'opérateur. Merci de vérifier le SMS de confirmation et de soumettre à nouveau." },
  { id:'INS-0007', nom:'ZINSOU', prenom:'Nathan', email:'nathan.zinsou@gmail.com', phone:'+229 01 44 55 66 77', passType:'premium', panels:[], amount:5000, ref:'MM260918-99021', proof:'sms', status:'validated', createdAt:new Date('2026-08-18').toISOString(), tickets:[{code:'DELOS-SP-002', panel:'ALL'}], rejectReason:'' },
  { id:'INS-0008', nom:'AHOUANSOU', prenom:'Ruth', email:'ruth.ahouansou@gmail.com', phone:'+229 01 33 44 55 66', passType:'carte', panels:['PAN02','PAN11'], amount:2000, ref:'MM260923-11223', proof:'sms', status:'pending', createdAt:new Date('2026-09-12').toISOString(), tickets:[], rejectReason:'' },
  { id:'INS-0009', nom:'GBENOU', prenom:'Josué', email:'josue.gbenou@gmail.com', phone:'+229 01 22 33 44 55', passType:'carte', panels:['PAN19','PAN20','PAN21','PAN24'], amount:4000, ref:'MM260920-66778', proof:'sms', status:'validated', createdAt:new Date('2026-08-20').toISOString(), tickets:[{code:'PAN19-INS002',panel:'PAN19'},{code:'PAN20-INS001',panel:'PAN20'},{code:'PAN21-INS001',panel:'PAN21'},{code:'PAN24-INS001',panel:'PAN24'}], rejectReason:'' },
  { id:'INS-0010', nom:'LOKO', prenom:'Sarah', email:'sarah.loko@gmail.com', phone:'+229 01 11 22 33 44', passType:'premium', panels:[], amount:5000, ref:'MM260923-44556', proof:'sms', status:'pending', createdAt:new Date('2026-09-13').toISOString(), tickets:[], rejectReason:'' }
];

const INITIAL_AMBASSADORS = [
  { code:'AMB-001', name:'Raïssa DANSOU', phone:'+229 01 90 11 22 33', refs:14, revenue:34000 },
  { code:'AMB-002', name:'Théodore HINVI', phone:'+229 01 91 22 33 44', refs:9, revenue:21000 },
  { code:'AMB-003', name:'Esther AGOSSA', phone:'+229 01 92 33 44 55', refs:6, revenue:12000 },
  { code:'AMB-004', name:'Isaac MEDJINOU', phone:'+229 01 93 44 55 66', refs:3, revenue:7000 }
];

// ---------- LOCAL STORAGE MANAGERS ----------
function loadInscriptions() {
  const data = localStorage.getItem('delos_2026_inscriptions');
  if (!data) {
    localStorage.setItem('delos_2026_inscriptions', JSON.stringify(INITIAL_INSCRIPTIONS));
    return INITIAL_INSCRIPTIONS;
  }
  try { return JSON.parse(data); } catch(e) { return INITIAL_INSCRIPTIONS; }
}

function saveInscriptions(items) {
  localStorage.setItem('delos_2026_inscriptions', JSON.stringify(items));
}

/* Sauvegarde anti-quota : si le stockage déborde (anciennes captures plein
   format), allège PROGRESSIVEMENT les preuves en partant des plus anciennes
   (la plus récente garde toujours sa capture) jusqu'à ce que ça tienne.
   Retourne true | 'degraded' | false. */
function saveInscriptionsSafe(items) {
  try { saveInscriptions(items); return true; }
  catch(e){
    const quota = e && (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014);
    if (!quota){ console.error('Sauvegarde inscriptions impossible', e); return false; }
    // items[0] = inscription la plus récente : on allège les anciennes d'abord,
    // une par une en partant de la fin, jusqu'à ce que la sauvegarde passe.
    let degraded = false;
    for (let k = items.length - 1; k >= 1; k--){
      if (!items[k].proof || items[k].proof === 'sms') continue;
      items[k] = { ...items[k], proof: null, proofRaw: false, proofDropped: true };
      degraded = true;
      try { saveInscriptions(items); console.warn('Quota localStorage : capture(s) ancienne(s) allégée(s), inscription conservée.'); return 'degraded'; }
      catch(e2){
        const stillQuota = e2 && (e2.name === 'QuotaExceededError' || e2.code === 22 || e2.code === 1014);
        if (!stillQuota){ console.error('Sauvegarde inscriptions impossible', e2); return false; }
      }
    }
    // Même allégées au maximum ça ne passe pas (ex: la nouvelle capture seule
    // dépasse le quota) : on ne perd rien, l'appelant garde items intact.
    try { saveInscriptions(items); return degraded ? 'degraded' : true; }
    catch(e3){ console.error('Sauvegarde inscriptions impossible même allégée', e3); return false; }
  }
}

function loadAmbassadors() {
  const data = localStorage.getItem('delos_2026_ambassadors');
  if (!data) {
    localStorage.setItem('delos_2026_ambassadors', JSON.stringify(INITIAL_AMBASSADORS));
    return INITIAL_AMBASSADORS;
  }
  try { return JSON.parse(data); } catch(e) { return INITIAL_AMBASSADORS; }
}

function saveAmbassadors(items) {
  localStorage.setItem('delos_2026_ambassadors', JSON.stringify(items));
}

function isAdminAuthed() {
  return localStorage.getItem('delos_admin_authed') === 'true';
}

function setAdminAuthed(val) {
  if (val) localStorage.setItem('delos_admin_authed', 'true');
  else localStorage.removeItem('delos_admin_authed');
}

// ---------- HELPERS ----------
const $ = id => document.getElementById(id);
const fmt = n => (n||0).toLocaleString('fr-FR') + ' FCFA';
const pad = (n,l=3) => String(n).padStart(l,'0');
const dstr = d => new Date(d).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric'});

/* Échappe une valeur pour injection sûre dans du HTML (texte ou attribut). */
function escH(s){
  return String(s == null ? '' : s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* Copie une référence de transaction dans le presse-papiers (bouton admin). */
function copyRef(txt){
  const t = String(txt == null ? '' : txt).trim();
  if (!t) return;
  const done = () => toast('📋 Référence copiée : ' + t, 'info');
  try {
    if (navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(t).then(done, () => fallbackCopy(t, done));
    } else fallbackCopy(t, done);
  } catch(e){ fallbackCopy(t, done); }
}
function fallbackCopy(t, done){
  try {
    const ta = document.createElement('textarea');
    ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); ta.remove(); done();
  } catch(e){ toast('Référence : ' + t, 'info'); }
}

function toast(msg, type='success'){
  const colors = { success:'border-equi/50 bg-[#0f2416]', error:'border-dynamo/50 bg-[#2a0f14]', info:'border-violet-soft/50 bg-[#1a0f2e]' };
  const icons = { success:'✅', error:'⚠️', info:'ℹ️' };
  const container = $('toasts');
  if (!container) return;
  const t = document.createElement('div');
  t.className = `toast-in border ${colors[type]} rounded-2xl px-4 py-3 text-sm shadow-2xl flex gap-3 items-start z-[100]`;
  t.innerHTML = `<span>${icons[type]}</span><span class="text-white/90">${msg}</span>`;
  container.appendChild(t);
  setTimeout(()=>{ t.style.transition='all .4s'; t.style.opacity='0'; t.style.transform='translateX(40px)'; setTimeout(()=>t.remove(),400); }, 4200);
}

// ---------- DATE OFFICIELLE DE LA CONFÉRENCE ----------
const CONFERENCE_DATES = {
  start: new Date('2026-09-21T09:00:00+01:00'),
  end:   new Date('2026-09-26T21:00:00+01:00'),
  displayShort: '21 → 26 Septembre 2026',
  displayLong:  'Du 21 au 26 Septembre 2026',
  venue: 'Centre CEV — Calavi-Tankpè, Bénin',
  mapsUrl: 'https://maps.app.goo.gl/RnfeZXjJmjsqLT7U9'
};