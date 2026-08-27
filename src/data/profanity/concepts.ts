import type { LanguageId } from '../../types/settings'

export type ProfanityConcept = Record<LanguageId, readonly string[]>

export const profanityConcepts: readonly ProfanityConcept[] = [
  {
    en: ['dick', 'dicks', 'dickhead', 'dickheads'],
    es: ['polla', 'pollas', 'cipote', 'cipotes', 'verga', 'vergas'],
    fr: ['bite', 'bites', 'queue', 'queues'],
    de: ['schwanz', 'schwänze', 'pimmel'],
    it: ['cazzo', 'cazzi', 'pisello', 'piselli'],
  },
  {
    en: ['fuck', 'fucked', 'fucker', 'fuckers', 'fucking', 'fucks', 'fuck you'],
    es: ['joder', 'jodido', 'jodida', 'jodidos', 'jodidas', 'follar', 'chingar'],
    fr: ['enculé', 'enculés', 'enculée', 'enculées', 'va te faire foutre'],
    de: ['fick', 'fick dich', 'ficken', 'gefickt'],
    it: ['fottere', 'fottiti', 'fottuto', 'fottuta', 'fottuti', 'fottute'],
  },
  {
    en: ['shit', 'shits', 'shitty', 'bullshit', 'dipshit', 'piece of shit'],
    es: ['mierda', 'mierdas', 'comemierda', 'comemierdas'],
    fr: ['merde', 'merdes'],
    de: ['scheiße', 'scheisse', 'beschissen'],
    it: ['merda', 'merde', 'pezzo di merda', 'pezzi di merda'],
  },
  {
    en: ['whore', 'whores', 'slut', 'sluts', 'son of a bitch', 'sons of bitches'],
    es: ['puta', 'putas', 'putón', 'putona', 'hijo de puta', 'hija de puta'],
    fr: ['pute', 'putes', 'salope', 'salopes', 'fils de pute', 'fille de pute'],
    de: ['hure', 'huren', 'schlampe', 'schlampen', 'hurensohn', 'hurensöhne'],
    it: ['puttana', 'puttane', 'troia', 'troie', 'figlio di puttana', 'figlia di puttana'],
  },
  {
    en: ['asshole', 'assholes', 'arsehole', 'arseholes'],
    es: ['gilipollas', 'capullo', 'capullos', 'cabrón', 'cabrones'],
    fr: ['connard', 'connards', 'connasse', 'connasses', 'trou du cul'],
    de: ['arschloch', 'arschlöcher', 'drecksau', 'mistkerl'],
    it: ['stronzo', 'stronzi', 'stronza', 'stronze', 'coglione', 'coglioni'],
  },
  {
    en: ['wank', 'wanking', 'wanker', 'wankers', 'jerkoff', 'jerkoffs'],
    es: ['pajero', 'pajera', 'pajeros', 'pajeras', 'pajillero', 'pajillera'],
    fr: ['branler', 'branleur', 'branleurs', 'branleuse', 'branleuses'],
    de: ['wichsen', 'wichser', 'wichserin', 'wichserinnen'],
    it: ['segaiolo', 'segaioli', 'segaiola', 'segaiole'],
  },
  {
    en: ['blowjob', 'blowjobs', 'cocksucker', 'cocksuckers'],
    es: ['chupapollas'],
    fr: ['pipe', 'pipes', 'suceur', 'suceurs', 'suceuse', 'suceuses'],
    de: ['blasen', 'schwanzlutscher'],
    it: ['pompino', 'pompini'],
  },
]
