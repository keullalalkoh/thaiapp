// ThaiSteps content. Add words as lines: "thai|romanisation|english|optional example (thai~romanisation~english)".
// Add a lesson by appending to RAW. Word ids are "<lessonIndex>-<lineIndex>", so append rather than reorder.
// ⚠ NEEDS NATIVE-SPEAKER REVIEW: all Thai, romanisation, tone marks and letter names were written without native verification.
export type Word={id:string;th:string;rom:string;en:string;ex?:string}
export type Lesson={id:number;title:string;intro:string;words:Word[]}
export const CONTENT_NOTE='Content is unverified by a native speaker. Please double-check spellings, tones and romanisation with a Thai teacher or friend.'
const RAW:[string,string,string][]=[
['Greetings and introductions','Women end polite statements with ค่ะ (khâ) and questions with คะ (khá). Men use ครับ (khráp) for both.',`สวัสดีค่ะ|sà-wàt-dii khâ|Hello / goodbye (polite, female)
สบายดีไหมคะ|sà-baai dii mǎi khá|How are you? (polite, female)
สบายดีค่ะ|sà-baai dii khâ|I'm fine (polite, female)
ขอบคุณค่ะ|khɔ̌ɔp-khun khâ|Thank you (female)
ขอโทษค่ะ|khɔ̌ɔ-thôot khâ|Sorry / excuse me (female)
ฉันชื่อ...ค่ะ|chǎn chûue … khâ|My name is … (female)
ยินดีที่ได้รู้จักค่ะ|yin-dii thîi dâai rúu-jàk khâ|Nice to meet you (female)`],
['Numbers and counting','Thai numbers 1–10. Say them slowly and listen to each tone.',`หนึ่ง|nʉ̀ng|one
สอง|sɔ̌ɔng|two
สาม|sǎam|three
สี่|sìi|four
ห้า|hâa|five
หก|hòk|six
เจ็ด|jèt|seven
แปด|pɛ̀ɛt|eight
เก้า|gâo|nine
สิบ|sìp|ten`],
['Ordering food and drinks','Add ค่ะ to sound polite. ขอ … หน่อยค่ะ means "may I have … please".',`น้ำ|náam|water|ขอน้ำหน่อยค่ะ~khɔ̌ɔ náam nɔ̀i khâ~Water, please.
กาแฟ|gaa-fɛɛ|coffee
ข้าว|khâao|rice; also "food"
อร่อย|à-rɔ̀i|delicious
ไม่เผ็ดค่ะ|mâi phèt khâ|Not spicy, please (female)
ขอเมนูหน่อยค่ะ|khɔ̌ɔ mee-nuu nɔ̀i khâ|Menu, please (female)
เก็บเงินด้วยค่ะ|gèp ngoen dûai khâ|The bill, please (female)`],
['Shopping and prices','Useful for markets and shops. Bargaining is polite at markets, less so in fixed-price shops.',`เท่าไหร่คะ|thâo-rài khá|How much? (female)
แพงไป|phɛɛng pai|Too expensive
ลดหน่อยได้ไหมคะ|lót nɔ̀i dâai mǎi khá|Can you lower the price? (female)
เอาอันนี้ค่ะ|ao an-níi khâ|I'll take this one (female)
ไม่เอาค่ะ|mâi ao khâ|No, thank you (female)
ขอดูหน่อยค่ะ|khɔ̌ɔ duu nɔ̀i khâ|Can I have a look? (female)`],
['Directions and transport','Ask where something is, then listen for left, right or straight.',`ห้องน้ำอยู่ที่ไหนคะ|hɔ̂ng-náam yùu thîi-nǎi khá|Where is the toilet? (female)
เลี้ยวซ้าย|líao sáai|Turn left
เลี้ยวขวา|líao khwǎa|Turn right
ตรงไป|dtrong pai|Go straight
ที่นี่|thîi-nîi|Here
แท็กซี่|tɛ́k-sîi|Taxi
ไปสนามบินค่ะ|pai sà-nǎam-bin khâ|To the airport, please (female)`],
['Everyday conversations','Phrases that save you when you get lost in a conversation.',`ใช่|châi|Yes, that's right
ไม่ใช่|mâi châi|No, that's not right
ไม่เข้าใจค่ะ|mâi khâo-jai khâ|I don't understand (female)
พูดช้าๆ ได้ไหมคะ|phûut cháa-cháa dâai mǎi khá|Can you speak slowly? (female)
ไม่เป็นไรค่ะ|mâi bpen rai khâ|It's okay / no problem (female)
ช่วยด้วยค่ะ|chûai dûai khâ|Help! / Please help me (female)`],
['Making friends','Small talk that opens conversations.',`คุณมาจากไหนคะ|khun maa jàak nǎi khá|Where are you from? (female)
ฉันมาจาก...ค่ะ|chǎn maa jàak … khâ|I'm from … (female)
ฉันกำลังเรียนภาษาไทยค่ะ|chǎn gam-lang riian phaa-sǎa thai khâ|I'm learning Thai (female)
คุณพูดภาษาอังกฤษได้ไหมคะ|khun phûut phaa-sǎa ang-grìt dâai mǎi khá|Can you speak English? (female)
ชอบมากค่ะ|chɔ̂ɔp mâak khâ|I like it a lot (female)
เจอกันใหม่นะคะ|jəə gan mài ná khá|See you again (female)`],
['Essential pronunciation and tones','Thai has 5 tones: mid (no mark), low (à), falling (â), high (á), rising (ǎ). The same sounds mean different things in different tones.',`มา|maa|come (mid tone)
ใหม่|mài|new (low tone)
ไม่|mâi|not (falling tone)
ม้า|máa|horse (high tone)
หมา|mǎa|dog (rising tone)
ไหม|mǎi|question word: "…or not?" (rising tone)`],
['Reading Thai script','Start with six consonants. Each has a sound and a keyword. Letter names here need native-speaker checking.',`ก|gɔɔ gài|"g" sound (ก ไก่, chicken)
ม|mɔɔ máa|"m" sound (ม ม้า, horse)
น|nɔɔ nǔu|"n" sound (น หนู, mouse)
ส|sɔ̌ɔ sʉ̌ʉa|"s" sound (ส เสือ, tiger)
ด|dɔɔ dèk|"d" sound (ด เด็ก, child)
อ|ɔɔ àang|silent starter / "ɔɔ" vowel (อ อ่าง, basin)`]]
export const lessons:Lesson[]=RAW.map(([title,intro,body],i)=>({id:i,title,intro,words:body.split('\n').map((l,j)=>{const [th,rom,en,ex]=l.split('|');return{id:`${i}-${j}`,th,rom,en,ex}})}))
export const allWords:Word[]=lessons.flatMap(l=>l.words)
export const wordById=(id:string)=>allWords.find(w=>w.id===id)
