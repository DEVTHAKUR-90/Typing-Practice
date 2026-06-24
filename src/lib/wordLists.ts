import { WordListKey } from "@/types";

export const COMMON_WORDS = [
  "the","be","to","of","and","a","in","that","have","it","for","not","on","with","he",
  "as","you","do","at","this","but","his","by","from","they","we","say","her","she","or",
  "an","will","my","one","all","would","there","their","what","so","up","out","if","about",
  "who","get","which","go","me","when","make","can","like","time","no","just","him","know",
  "take","people","into","year","your","good","some","could","them","see","other","than",
  "then","now","look","only","come","its","over","think","also","back","after","use","two",
  "how","our","work","first","well","way","even","new","want","because","any","these","give",
  "day","most","us","is","water","long","find","here","thing","great","man","world","life",
  "still","hand","part","child","eye","place","work","week","case","point","government","company",
  "number","group","problem","fact","light","night","morning","city","river","mountain","ocean",
  "forest","desert","garden","music","color","sound","story","dream","memory","journey","silence",
  "shadow","mirror","window","bridge","candle","ember","feather","horizon","whisper","crystal",
  "thunder","breeze","harbor","meadow","canyon","glacier","comet","lantern","compass","anchor",
  "velvet","marble","amber","cobalt","ivory","ash","spark","frost","blossom","tide","drift",
  "echo","pulse","glow","flame","stream","cliff","valley","summit","orbit","galaxy","nebula",
];

export const PROGRAMMING_WORDS = [
  "function","const","let","var","return","import","export","class","interface","extends",
  "async","await","promise","array","object","string","number","boolean","null","undefined",
  "component","render","useState","useEffect","props","state","callback","reducer","context",
  "module","package","compile","build","deploy","server","client","database","query","schema",
  "endpoint","request","response","middleware","router","handler","exception","try","catch",
  "finally","loop","iterate","recursion","algorithm","pointer","memory","cache","buffer","thread",
  "process","kernel","compiler","parser","token","syntax","runtime","debug","breakpoint","stack",
  "queue","tree","graph","node","edge","vertex","hash","index","sort","search","merge","branch",
  "commit","repository","pipeline","container","cluster","instance","variable","constant","scope",
  "closure","prototype","inheritance","polymorphism","abstraction","encapsulation","interface",
  "generic","template","namespace","library","framework","dependency","version","release","patch",
];

export const QUOTES = [
  "The only way to do great work is to love what you do and keep moving forward.",
  "In the middle of difficulty lies opportunity, waiting quietly for those who look.",
  "Simplicity is the ultimate sophistication when every element earns its place.",
  "The future belongs to those who prepare for it today and learn from yesterday.",
  "Code is read far more often than it is written, so clarity always wins.",
  "Speed without accuracy is just motion, but accuracy without speed is hesitation.",
  "Every keystroke is a small decision repeated thousands of times until it becomes skill.",
  "The quieter you become, the more you are able to hear your own steady rhythm.",
  "Practice does not make perfect, practice makes permanent, so practice with intention.",
  "A smooth sea never made a skilled sailor, nor did an easy sentence build real speed.",
  "Patience and persistence carry a typist farther than raw talent ever could alone.",
  "What you focus on expands, so let your attention rest gently on the next word only.",
  "Great design is invisible, it simply lets the right thing happen at the right moment.",
  "The keyboard remembers nothing, but your fingers remember everything you teach them.",
  "Flow is the place where skill meets challenge and time quietly disappears.",
];

export function getWordList(key: WordListKey): string[] {
  switch (key) {
    case "programming":
      return PROGRAMMING_WORDS;
    case "quotes":
      return QUOTES;
    default:
      return COMMON_WORDS;
  }
}
