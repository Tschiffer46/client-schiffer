import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.photoLabel.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.relationship.deleteMany();
  await prisma.person.deleteMany();
  await prisma.timelineEvent.deleteMany();
  await prisma.routeStop.deleteMany();
  await prisma.researchGap.deleteMany();

  // --- PERSONS ---
  const persons = [
    // GENERATION 1
    { id: "gyorgy1", name: "György Schiffer (äldre)", born: "Okänt, Mörs, Ruhrområdet, Tyskland", died: "Under första världskriget (förlorade ett ben)", role: "Farfars far", country: "de", generation: 1, branch: "father", story: "Den äldsta kända personen i Schiffer-grenen. Född i Mörs i Ruhrområdet i Tyskland. Var schwab — en del av den tyska yrkesbefolkningen som invandrade till Ungern. Dog i första världskriget efter att ha förlorat ett ben. Hans hustru Susanna Horesni dog senare i Rastadt nära Baden-Baden.", sortOrder: 1 },
    { id: "susanna", name: "Susanna Horesni", born: "Okänt", died: "Rastadt, nära Baden-Baden, Tyskland", role: "Farfars mor", country: "", generation: 1, branch: "father", story: "Gift med György Schiffer (äldre). Dog i Rastadt i närheten av Baden-Baden. Mer information behövs.", sortOrder: 2 },
    { id: "hans", name: "Hans Lindberg", born: "21 januari 1873", died: "28 oktober 1947", role: "Susannes mormorsfar", country: "se", generation: 1, branch: "in-law", story: "Äldsta personen med känt födelsedatum i trädet. Född 1873.", sortOrder: 3 },

    // GENERATION 2
    { id: "gyorgy2", name: "György Schiffer (farfar)", born: "Okänt födelseår", died: "Okänt", role: "Farfar — Vagnmakare, Schwab", country: "hu", generation: 2, branch: "father", story: "Vagnmakare och schwab (tyskt yrkesfolk). Hade en relation med Maria Kiss men de gifte sig aldrig på grund av kulturella skillnader. Fick två söner: Laszlo (1933) och Ference (1936/1938). Gifte sig senare med änkan Julia från Királyegyháza och flyttade till Harkány. Laszlo besökte honom julen 1956, strax innan flykten.", sortOrder: 1 },
    { id: "maria_kiss", name: "Maria Kiss", born: "1911, S:t Ivan (Királyegyháza)", died: "Juni 1995", role: "Farmor", country: "hu", generation: 2, branch: "father", story: "Född 1911 i S:t Ivan — byn bytte namn till Királyegyháza (\"Kungens första hus\") när den slogs samman med grannbyn S:t Gál under 1930-talet. Marias föräldrar bodde i S:t Gál. Hade aldrig äktenskap med György Schiffer trots att de fick två söner; kulturkrocken mellan schwabisk och ungersk kultur var för stor. Flyttade med Laszlo och Ference till sina egna föräldrar. Dog i juni 1995, ett år efter sin son Ference.", sortOrder: 2 },
    { id: "julia", name: "Julia", born: "Királyegyháza, Ungern", died: "Okänt", role: "Farfars andra fru", country: "hu", generation: 2, branch: "father", story: "Änka som gifte sig med farfar György. Också från Királyegyháza. De flyttade till Harkány, där Laszlo besökte dem julen 1956.", sortOrder: 3 },
    { id: "ase_sand", name: "Aase Cecilie Strømsem (f. Sand)", born: "~1924, Trondheim, Norge", died: "Maj 2010, begravd 6 maj 2010", role: "Mormor — 3 relationer, 4 barn", country: "no", generation: 2, branch: "mother", story: "Thomas mormor hette Aase Cecilie Sand och växte upp i centrala Trondheim. Hon hade två systrar: Helga Marie (gift Rønning) och Turid. Under den tyska ockupationen fick hon dottern Åse Karin med soldaten Weber från Dresden 1944. I efterkrigstiden fick hon ytterligare barn med en norsk man vid namn Grinde (Leif Kristian och Georg), men den mannen vägrade acceptera Åse Karin i hemmet och var våldsam. Slutligen mötte hon Odd Strømsem, brevbärare och omtyckt av alla, med vilken hon fick Jarle och tog efternamnet Strømsem.", sortOrder: 1 },
    { id: "weber_soldat", name: "Okänd Weber (tysk soldat)", born: "Okänt, Dresden, Tyskland", died: "Försvann i rysk fångenskap, norra Norge", role: "Åses biologiske far", country: "de", generation: 2, branch: "mother", story: "En tysk soldat med efternamnet Weber, ursprungligen från Dresden, som stationerades i det ockuperade Norge 1940–45. Hans familj ägde en slakteriaffär i Dresden — en hantverk- och handelsfamilj i en av Sachsens viktigaste städer. Fick ett barn med Åse Sand i Trondheim — Åse Karin, född 8 september 1944. Mot krigets slut förflyttades han till norra Norge, tillfångatogs av ryska styrkor och försvann spårlöst. Hans förnamn är okänt. Dresden förstördes i den allierade bombningen i februari 1945. Familjens slaktarbutik kan ha gett spår i handelsregister och adressböcker.", sortOrder: 2 },
    { id: "grinde_far", name: "Okänd Grinde", born: "Okänt, Norge", died: "Hjärtattack (datum okänt)", role: "Far till Leif Kristian & Georg", country: "no", generation: 2, branch: "mother", story: "En norsk man vid namn Grinde som hade en relation med mormor Åse Sand och fick två söner med henne: Leif Kristian och Georg (f. 1948). Han vägrade acceptera Åse Karins närvaro i hemmet — han kallade henne \"tysketøs\" och var våldsam i hemmet. Dog sedermera i en hjärtattack. Hans förnamn är okänt.", sortOrder: 3 },
    { id: "odd", name: "Odd Strømsem", born: "Okänt, Norge", died: "Okänt", role: "Mormorns siste man — brevbärare", country: "no", generation: 2, branch: "mother", story: "Odd Strømsem var brevbärare och omtyckt av alla som kände honom. Han träffade Åse Sand och fick sonen Jarle med henne. Åse tog hans efternamn och blev Åse Strømsem. Thomas minns att Odd var en positiv och uppskattad person i familjen — en kontrast till den våldsamma Grinde-fadern.", sortOrder: 4 },

    // GENERATION 3
    { id: "laszlo", name: "Laszlo György Schiffer", born: "27 dec 1933, Pécs, Ungern", died: "2011, Helsingborg (~78 år)", role: "Far", country: "hu", generation: 3, branch: "father", story: "Laszlo föddes i Pécs i södra Ungern som son till vagnmakaren György Schiffer och Maria Kiss. Föräldrarna gifte sig aldrig på grund av kulturella skillnader — farfar var schwab (tyskt yrkesfolk) medan farmor var ungerska. De bodde hos farmors föräldrar i Királyegyháza. 1949 tog morbror Julius den 16-årige Laszlo till Budapest för yrkesutbildning; Laszlo bodde med Julius och hans dåvarande fru Maria. Han jobbade i en stor fabrik på Csepelön som tillverkade svarvar och fräsmaskiner — 30 stycken i månaden, samtliga skickade till Ryssland som krigsskadestånd. Han gjorde militärtjänst 1953–55 och deltog aktivt i den ungerska revolutionen 1956 — bland annat kastade han molotovcocktails på ryska tanks. Angiven av någon och eftersökt flydde han den 13 januari 1957, via tåg till den jugoslaviska gränsen, till Palitce/Gerovo-lägret i bergen, och slutligen med Svenska Röda Korsets första transport — 250 utvalda — via Škrivenica och ett chartrat tåg genom Österrike och Tyskland till Malmö. I Sverige hamnade han i Öregrund och sedan Norrtälje, där han bodde tre år och jobbade på ett gjuteri.", sortOrder: 1 },
    { id: "ase", name: "Åse Karin Schiffer (f. Weber)", born: "8 sep 1944, Trondheim, Norge", died: "Helsingborg (bouppteckning dec 2016)", role: "Mor — Kriegskind", country: "no", generation: 3, branch: "mother", story: "Åse Karin föddes som krigsbarn — dotter till Aase Cecilie Sand och den tyske soldaten Weber från Dresden. I efterkrigstidens Norge bar dessa barn ett tungt stigma och kallades nedsättande \"tysketøs\" eller \"tyskeunge\". Hennes mors andre man (Grinde-fadern) vägrade ha henne hemma och var våldsam mot familjen. Åse gick därför under mellannamnet \"Karin\" när familjen besökte Trondheim, för att undvika att förknippas med det tyska efternamnet Weber. Hennes biologiske far tillfångatogs av ryska styrkor i norra Norge mot krigets slut och försvann spårlöst. Åse emigrerade senare till Sverige, träffade Laszlo Schiffer, gifte sig och tog namnet Schiffer.", sortOrder: 2 },
    { id: "ference", name: "Ference Kiss (Ferri)", born: "Aug 1938, Királyegyháza", died: "Maj 1994", role: "Farbror", country: "hu", generation: 3, branch: "father", story: "Laszlos lillebror, också född utanför äktenskapet (har moderns efternamn Kiss). Jobbade vid en urangruva utanför Pécs och körde lastbilar med uranmaterial från gruvorna till järnvägen för vidare transport till Ryssland. Jobbade även med vinodling hos farfar György. Halva av farfars mark i Harkány köptes av tyskar som byggde ett hotell. Laszlo trodde att Ferri fick en åkomma av uranet — han dog vid ca 56 års ålder av vad som troligen var en blodpropp vid ljumskarna, efter lång sjukskrivning.", sortOrder: 3 },
    { id: "julius", name: "Julius (Gyula) Kiss", born: "Okänt", died: "6 jan 1997, Budapest", role: "Morbror — yrkesmilitär", country: "hu", generation: 3, branch: "father", story: "Laszlos morbror och en av de viktigaste personerna i hans tidiga liv. Julius var yrkesmilitär — högrest och lite stel. Han jobbade som inköpschef på en befälsskola i Transsylvanien. När ryssarna gick in i Rumänien 1943 evakuerades skolan tills Julius hamnade som krigsfånge i Danmark. Han återvände 1947 och blev fabriksarbetare i en fabrik med 35 000 anställda. Han bodde i Budapest XXI:a distriktet vid Csepelstadion. Gifte sig två gånger: första frun Maria, sedan Ilonka. Det var Julius som 1949 tog den 16-årige Laszlo till Budapest. Under 1956 varnade Julius Laszlo att militären sökte honom, och Laszlo kunde fly.", sortOrder: 4 },
    { id: "leif", name: "Leif Kristian Grinde", born: "Okänt, Norge", died: "—", role: "Morbror — halvbror med Åse", country: "no", generation: 3, branch: "mother", story: "Leif Kristian Grinde är Åse Karins halvbror — de delar mormor Åse Sand men har olika fäder. Hans tre barn är Tone, Mikael och Knut Grinde. Tones barn heter Erika och Odin Grinde Kristiansen.", sortOrder: 5 },
    { id: "georg", name: "Georg Grinde", born: "1948, Norge", died: "—", role: "Morbror — halvbror med Åse", country: "no", generation: 3, branch: "mother", story: "Georg Grinde är Åse Karins halvbror — de delar mormor Åse Sand men Georg har fadern Grinde, Åse Karin hade den tyske soldaten Weber. Har barnen Stig Roar och Espen.", sortOrder: 6 },
    { id: "jarle", name: "Jarle Strømsem", born: "Okänt, Norge", died: "—", role: "Morbror — halvbror med Åse", country: "no", generation: 3, branch: "mother", story: "Jarle Strømsem är Åse Karins halvbror — de delar mormor Åse Sand, men Jarle har fadern Odd Strømsem. Skild, ex-fru Elisabeth Lyshaug. Har barnen Tommy, Kenneth (f. 1992) och Ida (f. 1998).", sortOrder: 7 },

    // GENERATION 4 — Thomas generation
    { id: "lars", name: "Lars Göran Schiffer", nickname: "Lasse", born: "16 apr 1969", died: "—", role: "Bror", country: "se", generation: 4, branch: "thomas", story: "Thomas äldre bror. Dotter: Elin Schiffer (f. 1996).", sortOrder: 1 },
    { id: "susanne_s", name: "Susanne Schiffer", born: "1970", died: "—", role: "Svägerska", country: "se", generation: 4, branch: "in-law", story: "Registrerad som svägerska. Hennes släkt (Eriksson/Larsson/Lindberg) är delvis kartlagd tillbaka till 1870-talet.", sortOrder: 2 },
    { id: "thomas", name: "Thomas Schiffer", born: "27 jul 1972, Linköping", died: "—", role: "Arkivets skapare", country: "se", generation: 4, branch: "thomas", story: "Tredje generationen Schiffer i Sverige. Två döttrar: Anna Karin (2003) och Sara (2008). Bor i Lund-området. Håller på att samla ihop familjens historia i detta arkiv.", sortOrder: 3 },
    { id: "marina", name: "Marina Novakov", born: "", died: "—", role: "Partner", country: "", generation: 4, branch: "in-law", story: "", sortOrder: 4 },
    { id: "maria_j", name: "Maria Cecilia Jansson", born: "1 okt 1973, Lund", died: "—", role: "Ex-maka", country: "se", generation: 4, branch: "in-law", story: "Registrerad i MyHeritage.", sortOrder: 5 },

    // GENERATION 4 — Norwegian cousins
    { id: "stig_roar", name: "Stig Roar Grinde", born: "Okänt", died: "—", role: "Kusin — Georgs son", country: "no", generation: 4, branch: "cousins-no", story: "", sortOrder: 10 },
    { id: "espen", name: "Espen Grinde", born: "Okänt", died: "—", role: "Kusin — Georgs son", country: "no", generation: 4, branch: "cousins-no", story: "", sortOrder: 11 },
    { id: "tone", name: "Tone Grinde", born: "Okänt", died: "—", role: "Kusin — Leif Kristians dotter", country: "no", generation: 4, branch: "cousins-no", story: "Tone Grinde är Thomas kusin via morbror Leif Kristian Grinde. Hon har bröderna Mikael och Knut Grinde. Tones barn: Erika och Odin Grinde Kristiansen.", sortOrder: 12 },
    { id: "mikael", name: "Mikael Grinde", born: "Okänt", died: "—", role: "Kusin — Leif Kristians son", country: "no", generation: 4, branch: "cousins-no", story: "", sortOrder: 13 },
    { id: "knut", name: "Knut Grinde", born: "Okänt", died: "—", role: "Kusin — Leif Kristians son", country: "no", generation: 4, branch: "cousins-no", story: "", sortOrder: 14 },
    { id: "tommy", name: "Tommy Strømsem", born: "Okänt", died: "—", role: "Kusin — Jarles son", country: "no", generation: 4, branch: "cousins-no", story: "", sortOrder: 15 },
    { id: "kenneth", name: "Kenneth Strømsem", born: "1992", died: "—", role: "Kusin — Jarles son", country: "no", generation: 4, branch: "cousins-no", story: "", sortOrder: 16 },
    { id: "ida", name: "Ida Strømsem", born: "1998", died: "—", role: "Kusin — Jarles dotter", country: "no", generation: 4, branch: "cousins-no", story: "", sortOrder: 17 },

    // GENERATION 5
    { id: "elin", name: "Elin Schiffer", born: "1996", died: "—", role: "Brorsdotter", country: "se", generation: 5, branch: "children", story: "", sortOrder: 1 },
    { id: "anna_karin", name: "Anna Karin Schiffer", born: "2003", died: "—", role: "Dotter", country: "se", generation: 5, branch: "children", story: "", sortOrder: 2 },
    { id: "sara", name: "Sara Schiffer", born: "1 sep 2008, Lund", died: "—", role: "Dotter", country: "se", generation: 5, branch: "children", story: "", sortOrder: 3 },
    { id: "erika", name: "Erika Grinde Kristiansen", born: "Okänt", died: "—", role: "Tones dotter", country: "no", generation: 5, branch: "cousins-no", story: "", sortOrder: 10 },
    { id: "odin", name: "Odin Grinde Kristiansen", born: "Okänt", died: "—", role: "Tones son", country: "no", generation: 5, branch: "cousins-no", story: "", sortOrder: 11 },
    { id: "mia", name: "Mia Grinde", born: "Okänt", died: "—", role: "Leif Kristians barnbarn", country: "no", generation: 5, branch: "cousins-no", story: "", sortOrder: 12 },
    { id: "emil", name: "Emil", born: "Okänt", died: "—", role: "Leif Kristians barnbarn", country: "no", generation: 5, branch: "cousins-no", story: "", sortOrder: 13 },
    { id: "heather", name: "Heather Cameron", born: "Okänt", died: "—", role: "Syskonbarn till Tone", country: "no", generation: 5, branch: "cousins-no", story: "", sortOrder: 14 },
  ];

  for (const p of persons) {
    await prisma.person.create({ data: p });
  }
  console.log(`  Created ${persons.length} persons`);

  // --- RELATIONSHIPS ---
  const relationships = [
    // Generation 1 partnerships
    { fromId: "gyorgy1", toId: "susanna", type: "partner" },

    // Generation 2 partnerships
    { fromId: "gyorgy2", toId: "maria_kiss", type: "partner" },
    { fromId: "gyorgy2", toId: "julia", type: "partner" },
    { fromId: "ase_sand", toId: "weber_soldat", type: "partner" },
    { fromId: "ase_sand", toId: "grinde_far", type: "partner" },
    { fromId: "ase_sand", toId: "odd", type: "partner" },

    // Generation 2 → 3 parent-child
    { fromId: "gyorgy2", toId: "laszlo", type: "parent" },
    { fromId: "maria_kiss", toId: "laszlo", type: "parent" },
    { fromId: "gyorgy2", toId: "ference", type: "parent" },
    { fromId: "maria_kiss", toId: "ference", type: "parent" },
    { fromId: "ase_sand", toId: "ase", type: "parent" },
    { fromId: "weber_soldat", toId: "ase", type: "parent" },
    { fromId: "ase_sand", toId: "leif", type: "parent" },
    { fromId: "grinde_far", toId: "leif", type: "parent" },
    { fromId: "ase_sand", toId: "georg", type: "parent" },
    { fromId: "grinde_far", toId: "georg", type: "parent" },
    { fromId: "ase_sand", toId: "jarle", type: "parent" },
    { fromId: "odd", toId: "jarle", type: "parent" },

    // Generation 3 partnerships
    { fromId: "laszlo", toId: "ase", type: "partner" },

    // Generation 3 → 4 parent-child
    { fromId: "laszlo", toId: "lars", type: "parent" },
    { fromId: "ase", toId: "lars", type: "parent" },
    { fromId: "laszlo", toId: "thomas", type: "parent" },
    { fromId: "ase", toId: "thomas", type: "parent" },
    { fromId: "georg", toId: "stig_roar", type: "parent" },
    { fromId: "georg", toId: "espen", type: "parent" },
    { fromId: "leif", toId: "tone", type: "parent" },
    { fromId: "leif", toId: "mikael", type: "parent" },
    { fromId: "leif", toId: "knut", type: "parent" },
    { fromId: "jarle", toId: "tommy", type: "parent" },
    { fromId: "jarle", toId: "kenneth", type: "parent" },
    { fromId: "jarle", toId: "ida", type: "parent" },

    // Generation 4 partnerships
    { fromId: "lars", toId: "susanne_s", type: "partner" },
    { fromId: "thomas", toId: "marina", type: "partner" },
    { fromId: "thomas", toId: "maria_j", type: "ex-partner" },

    // Generation 4 → 5 parent-child
    { fromId: "lars", toId: "elin", type: "parent" },
    { fromId: "susanne_s", toId: "elin", type: "parent" },
    { fromId: "thomas", toId: "anna_karin", type: "parent" },
    { fromId: "thomas", toId: "sara", type: "parent" },
    { fromId: "tone", toId: "erika", type: "parent" },
    { fromId: "tone", toId: "odin", type: "parent" },
  ];

  for (const r of relationships) {
    await prisma.relationship.create({ data: r });
  }
  console.log(`  Created ${relationships.length} relationships`);

  // --- TIMELINE EVENTS ---
  const events = [
    { year: "~1870-talet", title: "Hans Lindberg föds", description: "Äldsta kända personen i släkten med känt datum. Född 21 jan 1873, Susannes mormorsfar.", type: "family", major: false, sortOrder: 1 },
    { year: "Sent 1800-tal", title: "György Schiffer föds i Mörs", description: "Den äldsta kända Schiffer-generationen. Schwab — tyskt yrkesfolk som invandrat till Ungern.", type: "family", major: false, sortOrder: 2 },
    { year: "1914–1918", title: "Första världskriget", description: "György Schiffer (äldre) förlorar ett ben och dör i kriget. Susanna Horesni blir ensam.", type: "history", major: false, sortOrder: 3 },
    { year: "~1930-talet", title: "St. Ivan och St. Gál slås samman", description: "Orterna bildar Királyegyháza (\"Kungens första hus\"). Maria Kiss familj kommer härifrån.", type: "history", major: false, sortOrder: 4 },
    { year: "27 dec 1933", title: "Laszlo György Schiffer föds i Pécs", description: "Thomas far föds i Pécs, södra Ungern. Son till György Schiffer och Maria Kiss. Föräldrarna var aldrig gifta.", type: "family", major: true, sortOrder: 5 },
    { year: "Aug 1938", title: "Ference (Ferri) Kiss föds", description: "Laszlos lillebror, också utanför äktenskapet. Familjen bor hos farmors föräldrar i Királyegyháza.", type: "family", major: false, sortOrder: 6 },
    { year: "1943", title: "Ryssarna går in i Rumänien", description: "Julius befälsskola i Transsylvanien evakueras allt längre västerut. Hamnar till slut i Danmark som krigsfånge.", type: "history", major: false, sortOrder: 7 },
    { year: "8 sep 1944", title: "Åse Karin Weber föds i Trondheim", description: "Thomas mor föds i Norge under andra världskrigets sista år. Krigsbarn — dotter till norsk mor och tysk soldat.", type: "family", major: true, sortOrder: 8 },
    { year: "1947", title: "Julius återvänder till Ungern", description: "Efter krigsfångenskapen börjar Julius som fabriksarbetare. 35 000 personer arbetar i fabriken.", type: "history", major: false, sortOrder: 9 },
    { year: "1949", title: "Laszlo flyttar till Budapest", description: "Morbror Julius tar 16-årige Laszlo till Budapest för yrkesutbildning. Bor i 21:a distriktet vid Csepel. Tillverkar svarvar och fräsmaskiner.", type: "migration", major: false, sortOrder: 10 },
    { year: "1953–1955", title: "Laszlo gör militärtjänst", description: "Avslutas mellan jul och nyår 1955 — ett år före revolutionen.", type: "family", major: false, sortOrder: 11 },
    { year: "23 okt 1956", title: "Ungerska revolutionen börjar", description: "Folkresning mot kommunistregimen och sovjetiskt förtryck. 30 fräsmaskiner i månaden tillverkas — samtliga till Ryssland som krigsskadestånd.", type: "history", major: true, sortOrder: 12 },
    { year: "6 nov 1956", title: "Sovjetunionen slår till", description: "Ryssarna omringar Budapest. Den ungerska militären var för svag. Västvärlden fokuserade på Suezkrisen.", type: "history", major: false, sortOrder: 13 },
    { year: "Julen 1956", title: "Laszlo besöker farfar i Harkány", description: "Sista besöket hos farfar György och Julia innan flykten.", type: "family", major: false, sortOrder: 14 },
    { year: "11 jan 1957", title: "Sista upproret i Csepel", description: "Militären söker efter Laszlo hemma hos Julius. Via Julius får han veta att han är eftersökt.", type: "history", major: true, sortOrder: 15 },
    { year: "13 jan 1957", title: "Laszlo flyr Budapest", description: "Västgränsen stängd efter att 250 000 flytt. Laszlo flyr söderut med två kamrater, hoppar på och av tåget vid varje station.", type: "migration", major: true, sortOrder: 16 },
    { year: "Jan 1957", title: "Gränsövergång till Jugoslavien", description: "Vandrar över pusztan i mörkret. Möts av jugoslaviska soldater. Tusentals ungrare flyr samma natt.", type: "migration", major: false, sortOrder: 17 },
    { year: "Jan–mars 1957", title: "Flyktingläger vid Adriatiska havet", description: "Palitce/Gerovo — gammalt tyskt koncentrationsläger. 1 200 ungerska flyktingar. Knapp mat, oljefat för värme.", type: "migration", major: false, sortOrder: 18 },
    { year: "Mars 1957", title: "Svenska Röda Korset anländer", description: "250 av 1 200 väljs ut baserat på yrkesutbildning. Laszlo blir utvald.", type: "migration", major: true, sortOrder: 19 },
    { year: "Mars 1957", title: "Ankomst till Sverige — Malmö", description: "Laszlo anländer till Malmö. Placeras i Öregrund, sedan Norrtälje. Börjar arbeta på gjuteri.", type: "migration", major: true, sortOrder: 20 },
    { year: "16 apr 1969", title: "Lars Göran Schiffer föds", description: "Thomas äldre bror.", type: "family", major: false, sortOrder: 21 },
    { year: "27 jul 1972", title: "Thomas Schiffer föds i Linköping", description: "Tredje generationen i Sverige.", type: "family", major: true, sortOrder: 22 },
    { year: "Maj 1994", title: "Ference Kiss (Ferri) dör", description: "Laszlos bror, ca 56 år. Hade arbetat vid urangruvan utanför Pécs. Troligen sjuk av strålning.", type: "family", major: false, sortOrder: 23 },
    { year: "1995–1997", title: "Flera familjemedlemmar går bort", description: "Farmor Maria Kiss (juni 1995), Ilonka (okt 1995). Julius dör 6 jan 1997 — arvsskattekrav HUF 202 256 på Laszlo.", type: "family", major: false, sortOrder: 24 },
    { year: "1998", title: "Szava Klára testamenterar lägenheten", description: "Szava Klára ger sin 39 m² lägenhet i Siklós till Laszlo. Döttrarna Edit och Ágnes Todenbier godtar testamentet. Laszlos namnbyte behandlas (dec 1998).", type: "family", major: false, sortOrder: 25 },
    { year: "1999", title: "Inkasso för Julius arvsskatt", description: "Sigma Company Ltd. kräver SEK 7 294 av Laszlo — arvsskatt efter Julius dödsbo. Oklart om skulden betalades.", type: "family", major: false, sortOrder: 26 },
    { year: "2003–2008", title: "Thomas döttrar föds", description: "Anna Karin (2003) och Sara (2008, Lund). Femte generationen sedan farfars far.", type: "family", major: false, sortOrder: 27 },
    { year: "2011", title: "Laszlo György Schiffer dör", description: "Thomas far går bort i Helsingborg vid ca 78 års ålder. Från revolutionär i Budapest till nytt liv i Sverige. Arvsrätten till Siklós-lägenheten övergår till Thomas och Lars.", type: "family", major: true, sortOrder: 28 },
  ];

  await prisma.timelineEvent.createMany({ data: events });
  console.log(`  Created ${events.length} timeline events`);

  // --- ROUTE STOPS ---
  const stops = [
    { number: 1, place: "Budapest", detail: "Csepel, 21:a distriktet", date: "13 jan 1957", color: "#c4463a" },
    { number: 2, place: "Pécs", detail: "Tåg via S:t Elisabeth", color: "#c4463a" },
    { number: 3, place: "Subotica", detail: "Till fots över pusztan", color: "#7b4a8e" },
    { number: 4, place: "Palitce / Gerovo", detail: "Flyktingläger, ~6 veckor", color: "#7b4a8e" },
    { number: 5, place: "Rijeka", detail: "Röda Korset, hotell vid kusten", color: "#7b4a8e" },
    { number: 6, place: "Österrike", detail: "Chartrat tåg", color: "#666" },
    { number: 7, place: "Tyskland", detail: "Coca-Cola vid stationerna", color: "#666" },
    { number: 8, place: "Malmö", detail: "Ankomst Sverige", date: "Mars 1957", color: "#1d6aa5" },
    { number: 9, place: "Öregrund", detail: "Stadshotellet", color: "#1d6aa5" },
    { number: 10, place: "Norrtälje", detail: "Gjuteriet, 3 år", color: "#1d6aa5" },
  ];

  await prisma.routeStop.createMany({ data: stops });
  console.log(`  Created ${stops.length} route stops`);

  // --- RESEARCH GAPS ---
  const gaps = [
    { title: "Den tyske soldaten Weber", description: "Efternamnet Weber, från Dresden. Försvann i rysk fångenskap i norra Norge ~1945. Förnamnet är den saknade nyckeln. Bundesarchiv-Militärarchiv (Freiburg), ryska krigsfångenskapsdatabaser och Norges Krigsbarnforbund kan hjälpa.", priority: "high" },
    { title: "Lägenheten i Siklós", description: "Szava Klára (f. 1942) testamenterade 1998 en 39 m² lägenhet till Laszlo. Thomas och Lars är rättmätiga arvingar sedan 2011. Nästa steg: samla svenska arvsdokument, kontakta ungersk advokat i Baranya-regionen.", priority: "high" },
    { title: "Mormorns föräldrar", description: "Aase Cecilie Sand, f. ~1924 Trondheim. Hennes systrar: Helga Marie Rønning och Turid. Faderns och moderns namn okända. Digitalarkivet (folkräkningar 1910/1920) kan ge uppgifter.", priority: "medium" },
    { title: "Farfar György Schiffer", description: "Inget exakt födelse- eller dödsdatum. Vagnmakare — kan finnas i skråregister eller yrkesföreningsarkiv i Pécs/Baranya.", priority: "medium" },
    { title: "Ferences födelsedatum", description: "MyHeritage anger 1936, dokumentet anger augusti 1938. Ungerska civilregistret (anyakönyv) i Pécs bör kunna verifiera.", priority: "medium" },
    { title: "Åse Karin Webers bakgrund", description: "Född Trondheim 1944. Hennes föräldrar finns som \"Aase\" och \"Okänd\" i MyHeritage. Digitalarkivet och norska kyrkoböcker bör ha mer.", priority: "medium" },
    { title: "Grinde-fadern", description: "Okänt förnamn. Far till Leif Kristian och Georg. Norsk man som dog i hjärtattack. Leif Kristian eller Georg kan ha mer information.", priority: "low" },
    { title: "Bouppteckning dec 2016", description: "Behöver läsas manuellt. Bör innehålla Åses fullständiga namn, personnummer, dödsbodelägare.", priority: "medium" },
    { title: "Laszlo och Åses giftermål", description: "Var och när gifte de sig? Vigselbevis från Helsingborg eller Linköping?", priority: "low" },
    { title: "Laszlos ankomst till Sverige", description: "Röda Korsets arkiv och Migrationsverket bör ha dokumentation om kontingenten på 250 personer.", priority: "low" },
    { title: "DNA-matchningar", description: "9 077 DNA-matchningar i MyHeritage. Kan avslöja okända släktgrenar, speciellt på ungerska och tyska sidan.", priority: "medium" },
    { title: "Norska Krigsbarnsarkiv", description: "Norges Riksarkiv har dokumentation om krigsbarn. Åse Karin Weber borde finnas i dessa register. Kontakt via riksarkivet.no.", priority: "high" },
  ];

  await prisma.researchGap.createMany({ data: gaps });
  console.log(`  Created ${gaps.length} research gaps`);

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
