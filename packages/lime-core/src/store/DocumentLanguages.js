/*
 * Copyright (c) 2014 - Copyright holders CIRSFID and Department of
 * Computer Science and Engineering of the University of Bologna
 *
 * Authors:
 * Monica Palmirani – CIRSFID of the University of Bologna
 * Fabio Vitali – Department of Computer Science and Engineering of the University of Bologna
 * Luca Cervone – CIRSFID of the University of Bologna
 *
 * Permission is hereby granted to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The Software can be used by anyone for purposes without commercial gain,
 * including scientific, individual, and charity purposes. If it is used
 * for purposes having commercial gains, an agreement with the copyright
 * holders is required. The above copyright notice and this permission
 * notice shall be included in all copies or substantial portions of the
 * Software.
 *
 * Except as contained in this notice, the name(s) of the above copyright
 * holders and authors shall not be used in advertising or otherwise to
 * promote the sale, use or other dealings in this Software without prior
 * written authorization.
 *
 * The end-user documentation included with the redistribution, if any,
 * must include the following acknowledgment: "This product includes
 * software developed by University of Bologna (CIRSFID and Department of
 * Computer Science and Engineering) and its authors (Monica Palmirani,
 * Fabio Vitali, Luca Cervone)", in the same place and form as other
 * third-party acknowledgments. Alternatively, this acknowledgment may
 * appear in the software itself, in the same form and location as other
 * such third-party acknowledgments.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// This store lists the languages a document can be written in and
// their ISO 639-2 alpha-3 code.
Ext.define('LIME.store.DocumentLanguages', {
    extend : 'Ext.data.Store',
    fields : [
        'code',
        'name'
    ],

    data: [
        {
            "code": "﻿aar",
            "name": "Afar"
        },
        {
            "code": "abk",
            "name": "Abkhazian"
        },
        {
            "code": "ace",
            "name": "Achinese"
        },
        {
            "code": "ach",
            "name": "Acoli"
        },
        {
            "code": "ada",
            "name": "Adangme"
        },
        {
            "code": "ady",
            "name": "Adyghe"
        },
        {
            "code": "afa",
            "name": "Afro-Asiatic languages"
        },
        {
            "code": "afh",
            "name": "Afrihili"
        },
        {
            "code": "afr",
            "name": "Afrikaans"
        },
        {
            "code": "ain",
            "name": "Ainu"
        },
        {
            "code": "aka",
            "name": "Akan"
        },
        {
            "code": "akk",
            "name": "Akkadian"
        },
        {
            "code": "alb",
            "name": "Albanian"
        },
        {
            "code": "ale",
            "name": "Aleut"
        },
        {
            "code": "alg",
            "name": "Algonquian languages"
        },
        {
            "code": "alt",
            "name": "Southern Altai"
        },
        {
            "code": "amh",
            "name": "Amharic"
        },
        {
            "code": "ang",
            "name": "English, Old (ca.450-1100)"
        },
        {
            "code": "anp",
            "name": "Angika"
        },
        {
            "code": "apa",
            "name": "Apache languages"
        },
        {
            "code": "ara",
            "name": "Arabic"
        },
        {
            "code": "arc",
            "name": "Official Aramaic (700-300 BCE)"
        },
        {
            "code": "arg",
            "name": "Aragonese"
        },
        {
            "code": "arm",
            "name": "Armenian"
        },
        {
            "code": "arn",
            "name": "Mapudungun"
        },
        {
            "code": "arp",
            "name": "Arapaho"
        },
        {
            "code": "art",
            "name": "Artificial languages"
        },
        {
            "code": "arw",
            "name": "Arawak"
        },
        {
            "code": "asm",
            "name": "Assamese"
        },
        {
            "code": "ast",
            "name": "Asturian"
        },
        {
            "code": "ath",
            "name": "Athapascan languages"
        },
        {
            "code": "aus",
            "name": "Australian languages"
        },
        {
            "code": "ava",
            "name": "Avaric"
        },
        {
            "code": "ave",
            "name": "Avestan"
        },
        {
            "code": "awa",
            "name": "Awadhi"
        },
        {
            "code": "aym",
            "name": "Aymara"
        },
        {
            "code": "aze",
            "name": "Azerbaijani"
        },
        {
            "code": "bad",
            "name": "Banda languages"
        },
        {
            "code": "bai",
            "name": "Bamileke languages"
        },
        {
            "code": "bak",
            "name": "Bashkir"
        },
        {
            "code": "bal",
            "name": "Baluchi"
        },
        {
            "code": "bam",
            "name": "Bambara"
        },
        {
            "code": "ban",
            "name": "Balinese"
        },
        {
            "code": "baq",
            "name": "Basque"
        },
        {
            "code": "bas",
            "name": "Basa"
        },
        {
            "code": "bat",
            "name": "Baltic languages"
        },
        {
            "code": "bej",
            "name": "Beja"
        },
        {
            "code": "bel",
            "name": "Belarusian"
        },
        {
            "code": "bem",
            "name": "Bemba"
        },
        {
            "code": "ben",
            "name": "Bengali"
        },
        {
            "code": "ber",
            "name": "Berber languages"
        },
        {
            "code": "bho",
            "name": "Bhojpuri"
        },
        {
            "code": "bih",
            "name": "Bihari languages"
        },
        {
            "code": "bik",
            "name": "Bikol"
        },
        {
            "code": "bin",
            "name": "Bini"
        },
        {
            "code": "bis",
            "name": "Bislama"
        },
        {
            "code": "bla",
            "name": "Siksika"
        },
        {
            "code": "bnt",
            "name": "Bantu (Other)"
        },
        {
            "code": "bos",
            "name": "Bosnian"
        },
        {
            "code": "bra",
            "name": "Braj"
        },
        {
            "code": "bre",
            "name": "Breton"
        },
        {
            "code": "btk",
            "name": "Batak languages"
        },
        {
            "code": "bua",
            "name": "Buriat"
        },
        {
            "code": "bug",
            "name": "Buginese"
        },
        {
            "code": "bul",
            "name": "Bulgarian"
        },
        {
            "code": "bur",
            "name": "Burmese"
        },
        {
            "code": "byn",
            "name": "Blin"
        },
        {
            "code": "cad",
            "name": "Caddo"
        },
        {
            "code": "cai",
            "name": "Central American Indian languages"
        },
        {
            "code": "car",
            "name": "Galibi Carib"
        },
        {
            "code": "cat",
            "name": "Catalan"
        },
        {
            "code": "cau",
            "name": "Caucasian languages"
        },
        {
            "code": "ceb",
            "name": "Cebuano"
        },
        {
            "code": "cel",
            "name": "Celtic languages"
        },
        {
            "code": "cha",
            "name": "Chamorro"
        },
        {
            "code": "chb",
            "name": "Chibcha"
        },
        {
            "code": "che",
            "name": "Chechen"
        },
        {
            "code": "chg",
            "name": "Chagatai"
        },
        {
            "code": "chi",
            "name": "Chinese"
        },
        {
            "code": "chk",
            "name": "Chuukese"
        },
        {
            "code": "chm",
            "name": "Mari"
        },
        {
            "code": "chn",
            "name": "Chinook jargon"
        },
        {
            "code": "cho",
            "name": "Choctaw"
        },
        {
            "code": "chp",
            "name": "Chipewyan"
        },
        {
            "code": "chr",
            "name": "Cherokee"
        },
        {
            "code": "chu",
            "name": "Church Slavic"
        },
        {
            "code": "chv",
            "name": "Chuvash"
        },
        {
            "code": "chy",
            "name": "Cheyenne"
        },
        {
            "code": "cmc",
            "name": "Chamic languages"
        },
        {
            "code": "cop",
            "name": "Coptic"
        },
        {
            "code": "cor",
            "name": "Cornish"
        },
        {
            "code": "cos",
            "name": "Corsican"
        },
        {
            "code": "cpe",
            "name": "Creoles and pidgins, English based"
        },
        {
            "code": "cpf",
            "name": "Creoles and pidgins, French-based "
        },
        {
            "code": "cpp",
            "name": "Creoles and pidgins, Portuguese-based "
        },
        {
            "code": "cre",
            "name": "Cree"
        },
        {
            "code": "crh",
            "name": "Crimean Tatar"
        },
        {
            "code": "crp",
            "name": "Creoles and pidgins "
        },
        {
            "code": "csb",
            "name": "Kashubian"
        },
        {
            "code": "cus",
            "name": "Cushitic languages"
        },
        {
            "code": "cze",
            "name": "Czech"
        },
        {
            "code": "dak",
            "name": "Dakota"
        },
        {
            "code": "dan",
            "name": "Danish"
        },
        {
            "code": "dar",
            "name": "Dargwa"
        },
        {
            "code": "day",
            "name": "Land Dayak languages"
        },
        {
            "code": "del",
            "name": "Delaware"
        },
        {
            "code": "den",
            "name": "Slave (Athapascan)"
        },
        {
            "code": "dgr",
            "name": "Dogrib"
        },
        {
            "code": "din",
            "name": "Dinka"
        },
        {
            "code": "div",
            "name": "Divehi"
        },
        {
            "code": "doi",
            "name": "Dogri"
        },
        {
            "code": "dra",
            "name": "Dravidian languages"
        },
        {
            "code": "dsb",
            "name": "Lower Sorbian"
        },
        {
            "code": "dua",
            "name": "Duala"
        },
        {
            "code": "dum",
            "name": "Dutch, Middle (ca.1050-1350)"
        },
        {
            "code": "dut",
            "name": "Dutch"
        },
        {
            "code": "dyu",
            "name": "Dyula"
        },
        {
            "code": "dzo",
            "name": "Dzongkha"
        },
        {
            "code": "efi",
            "name": "Efik"
        },
        {
            "code": "egy",
            "name": "Egyptian (Ancient)"
        },
        {
            "code": "eka",
            "name": "Ekajuk"
        },
        {
            "code": "elx",
            "name": "Elamite"
        },
        {
            "code": "eng",
            "name": "English"
        },
        {
            "code": "enm",
            "name": "English, Middle (1100-1500)"
        },
        {
            "code": "epo",
            "name": "Esperanto"
        },
        {
            "code": "est",
            "name": "Estonian"
        },
        {
            "code": "ewe",
            "name": "Ewe"
        },
        {
            "code": "ewo",
            "name": "Ewondo"
        },
        {
            "code": "fan",
            "name": "Fang"
        },
        {
            "code": "fao",
            "name": "Faroese"
        },
        {
            "code": "fat",
            "name": "Fanti"
        },
        {
            "code": "fij",
            "name": "Fijian"
        },
        {
            "code": "fil",
            "name": "Filipino"
        },
        {
            "code": "fin",
            "name": "Finnish"
        },
        {
            "code": "fiu",
            "name": "Finno-Ugrian languages"
        },
        {
            "code": "fon",
            "name": "Fon"
        },
        {
            "code": "fra",
            "name": "French"
        },
        {
            "code": "frm",
            "name": "French, Middle (ca.1400-1600)"
        },
        {
            "code": "fro",
            "name": "French, Old (842-ca.1400)"
        },
        {
            "code": "frr",
            "name": "Northern Frisian"
        },
        {
            "code": "frs",
            "name": "Eastern Frisian"
        },
        {
            "code": "fry",
            "name": "Western Frisian"
        },
        {
            "code": "ful",
            "name": "Fulah"
        },
        {
            "code": "fur",
            "name": "Friulian"
        },
        {
            "code": "gaa",
            "name": "Ga"
        },
        {
            "code": "gay",
            "name": "Gayo"
        },
        {
            "code": "gba",
            "name": "Gbaya"
        },
        {
            "code": "gem",
            "name": "Germanic languages"
        },
        {
            "code": "geo",
            "name": "Georgian"
        },
        {
            "code": "deu",
            "name": "German"
        },
        {
            "code": "gez",
            "name": "Geez"
        },
        {
            "code": "gil",
            "name": "Gilbertese"
        },
        {
            "code": "gla",
            "name": "Gaelic"
        },
        {
            "code": "gle",
            "name": "Irish"
        },
        {
            "code": "glg",
            "name": "Galician"
        },
        {
            "code": "glv",
            "name": "Manx"
        },
        {
            "code": "gmh",
            "name": "German, Middle High (ca.1050-1500)"
        },
        {
            "code": "goh",
            "name": "German, Old High (ca.750-1050)"
        },
        {
            "code": "gon",
            "name": "Gondi"
        },
        {
            "code": "gor",
            "name": "Gorontalo"
        },
        {
            "code": "got",
            "name": "Gothic"
        },
        {
            "code": "grb",
            "name": "Grebo"
        },
        {
            "code": "grc",
            "name": "Greek, Ancient (to 1453)"
        },
        {
            "code": "gre",
            "name": "Greek, Modern (1453-)"
        },
        {
            "code": "grn",
            "name": "Guarani"
        },
        {
            "code": "gsw",
            "name": "Swiss German"
        },
        {
            "code": "guj",
            "name": "Gujarati"
        },
        {
            "code": "gwi",
            "name": "Gwich'in"
        },
        {
            "code": "hai",
            "name": "Haida"
        },
        {
            "code": "hat",
            "name": "Haitian"
        },
        {
            "code": "hau",
            "name": "Hausa"
        },
        {
            "code": "haw",
            "name": "Hawaiian"
        },
        {
            "code": "heb",
            "name": "Hebrew"
        },
        {
            "code": "her",
            "name": "Herero"
        },
        {
            "code": "hil",
            "name": "Hiligaynon"
        },
        {
            "code": "him",
            "name": "Himachali languages"
        },
        {
            "code": "hin",
            "name": "Hindi"
        },
        {
            "code": "hit",
            "name": "Hittite"
        },
        {
            "code": "hmn",
            "name": "Hmong"
        },
        {
            "code": "hmo",
            "name": "Hiri Motu"
        },
        {
            "code": "hrv",
            "name": "Croatian"
        },
        {
            "code": "hsb",
            "name": "Upper Sorbian"
        },
        {
            "code": "hun",
            "name": "Hungarian"
        },
        {
            "code": "hup",
            "name": "Hupa"
        },
        {
            "code": "iba",
            "name": "Iban"
        },
        {
            "code": "ibo",
            "name": "Igbo"
        },
        {
            "code": "ice",
            "name": "Icelandic"
        },
        {
            "code": "ido",
            "name": "Ido"
        },
        {
            "code": "iii",
            "name": "Sichuan Yi"
        },
        {
            "code": "ijo",
            "name": "Ijo languages"
        },
        {
            "code": "iku",
            "name": "Inuktitut"
        },
        {
            "code": "ile",
            "name": "Interlingue"
        },
        {
            "code": "ilo",
            "name": "Iloko"
        },
        {
            "code": "ina",
            "name": "Interlingua (International Auxiliary Language Association)"
        },
        {
            "code": "inc",
            "name": "Indic languages"
        },
        {
            "code": "ind",
            "name": "Indonesian"
        },
        {
            "code": "ine",
            "name": "Indo-European languages"
        },
        {
            "code": "inh",
            "name": "Ingush"
        },
        {
            "code": "ipk",
            "name": "Inupiaq"
        },
        {
            "code": "ira",
            "name": "Iranian languages"
        },
        {
            "code": "iro",
            "name": "Iroquoian languages"
        },
        {
            "code": "ita",
            "name": "Italian"
        },
        {
            "code": "jav",
            "name": "Javanese"
        },
        {
            "code": "jbo",
            "name": "Lojban"
        },
        {
            "code": "jpn",
            "name": "Japanese"
        },
        {
            "code": "jpr",
            "name": "Judeo-Persian"
        },
        {
            "code": "jrb",
            "name": "Judeo-Arabic"
        },
        {
            "code": "kaa",
            "name": "Kara-Kalpak"
        },
        {
            "code": "kab",
            "name": "Kabyle"
        },
        {
            "code": "kac",
            "name": "Kachin"
        },
        {
            "code": "kal",
            "name": "Kalaallisut"
        },
        {
            "code": "kam",
            "name": "Kamba"
        },
        {
            "code": "kan",
            "name": "Kannada"
        },
        {
            "code": "kar",
            "name": "Karen languages"
        },
        {
            "code": "kas",
            "name": "Kashmiri"
        },
        {
            "code": "kau",
            "name": "Kanuri"
        },
        {
            "code": "kaw",
            "name": "Kawi"
        },
        {
            "code": "kaz",
            "name": "Kazakh"
        },
        {
            "code": "kbd",
            "name": "Kabardian"
        },
        {
            "code": "kha",
            "name": "Khasi"
        },
        {
            "code": "khi",
            "name": "Khoisan languages"
        },
        {
            "code": "khm",
            "name": "Central Khmer"
        },
        {
            "code": "kho",
            "name": "Khotanese"
        },
        {
            "code": "kik",
            "name": "Kikuyu"
        },
        {
            "code": "kin",
            "name": "Kinyarwanda"
        },
        {
            "code": "kir",
            "name": "Kirghiz"
        },
        {
            "code": "kmb",
            "name": "Kimbundu"
        },
        {
            "code": "kok",
            "name": "Konkani"
        },
        {
            "code": "kom",
            "name": "Komi"
        },
        {
            "code": "kon",
            "name": "Kongo"
        },
        {
            "code": "kor",
            "name": "Korean"
        },
        {
            "code": "kos",
            "name": "Kosraean"
        },
        {
            "code": "kpe",
            "name": "Kpelle"
        },
        {
            "code": "krc",
            "name": "Karachay-Balkar"
        },
        {
            "code": "krl",
            "name": "Karelian"
        },
        {
            "code": "kro",
            "name": "Kru languages"
        },
        {
            "code": "kru",
            "name": "Kurukh"
        },
        {
            "code": "kua",
            "name": "Kuanyama"
        },
        {
            "code": "kum",
            "name": "Kumyk"
        },
        {
            "code": "kur",
            "name": "Kurdish"
        },
        {
            "code": "kut",
            "name": "Kutenai"
        },
        {
            "code": "lad",
            "name": "Ladino"
        },
        {
            "code": "lah",
            "name": "Lahnda"
        },
        {
            "code": "lam",
            "name": "Lamba"
        },
        {
            "code": "lao",
            "name": "Lao"
        },
        {
            "code": "lat",
            "name": "Latin"
        },
        {
            "code": "lav",
            "name": "Latvian"
        },
        {
            "code": "lez",
            "name": "Lezghian"
        },
        {
            "code": "lim",
            "name": "Limburgan"
        },
        {
            "code": "lin",
            "name": "Lingala"
        },
        {
            "code": "lit",
            "name": "Lithuanian"
        },
        {
            "code": "lol",
            "name": "Mongo"
        },
        {
            "code": "loz",
            "name": "Lozi"
        },
        {
            "code": "ltz",
            "name": "Luxembourgish"
        },
        {
            "code": "lua",
            "name": "Luba-Lulua"
        },
        {
            "code": "lub",
            "name": "Luba-Katanga"
        },
        {
            "code": "lug",
            "name": "Ganda"
        },
        {
            "code": "lui",
            "name": "Luiseno"
        },
        {
            "code": "lun",
            "name": "Lunda"
        },
        {
            "code": "luo",
            "name": "Luo (Kenya and Tanzania)"
        },
        {
            "code": "lus",
            "name": "Lushai"
        },
        {
            "code": "mac",
            "name": "Macedonian"
        },
        {
            "code": "mad",
            "name": "Madurese"
        },
        {
            "code": "mag",
            "name": "Magahi"
        },
        {
            "code": "mah",
            "name": "Marshallese"
        },
        {
            "code": "mai",
            "name": "Maithili"
        },
        {
            "code": "mak",
            "name": "Makasar"
        },
        {
            "code": "mal",
            "name": "Malayalam"
        },
        {
            "code": "man",
            "name": "Mandingo"
        },
        {
            "code": "mao",
            "name": "Maori"
        },
        {
            "code": "map",
            "name": "Austronesian languages"
        },
        {
            "code": "mar",
            "name": "Marathi"
        },
        {
            "code": "mas",
            "name": "Masai"
        },
        {
            "code": "may",
            "name": "Malay"
        },
        {
            "code": "mdf",
            "name": "Moksha"
        },
        {
            "code": "mdr",
            "name": "Mandar"
        },
        {
            "code": "men",
            "name": "Mende"
        },
        {
            "code": "mga",
            "name": "Irish, Middle (900-1200)"
        },
        {
            "code": "mic",
            "name": "Mi'kmaq"
        },
        {
            "code": "min",
            "name": "Minangkabau"
        },
        {
            "code": "mis",
            "name": "Uncoded languages"
        },
        {
            "code": "mkh",
            "name": "Mon-Khmer languages"
        },
        {
            "code": "mlg",
            "name": "Malagasy"
        },
        {
            "code": "mlt",
            "name": "Maltese"
        },
        {
            "code": "mnc",
            "name": "Manchu"
        },
        {
            "code": "mni",
            "name": "Manipuri"
        },
        {
            "code": "mno",
            "name": "Manobo languages"
        },
        {
            "code": "moh",
            "name": "Mohawk"
        },
        {
            "code": "mon",
            "name": "Mongolian"
        },
        {
            "code": "mos",
            "name": "Mossi"
        },
        {
            "code": "mul",
            "name": "Multiple languages"
        },
        {
            "code": "mun",
            "name": "Munda languages"
        },
        {
            "code": "mus",
            "name": "Creek"
        },
        {
            "code": "mwl",
            "name": "Mirandese"
        },
        {
            "code": "mwr",
            "name": "Marwari"
        },
        {
            "code": "myn",
            "name": "Mayan languages"
        },
        {
            "code": "myv",
            "name": "Erzya"
        },
        {
            "code": "nah",
            "name": "Nahuatl languages"
        },
        {
            "code": "nai",
            "name": "North American Indian languages"
        },
        {
            "code": "nap",
            "name": "Neapolitan"
        },
        {
            "code": "nau",
            "name": "Nauru"
        },
        {
            "code": "nav",
            "name": "Navajo"
        },
        {
            "code": "nbl",
            "name": "Ndebele, South"
        },
        {
            "code": "nde",
            "name": "Ndebele, North"
        },
        {
            "code": "ndo",
            "name": "Ndonga"
        },
        {
            "code": "nds",
            "name": "Low German"
        },
        {
            "code": "nep",
            "name": "Nepali"
        },
        {
            "code": "new",
            "name": "Nepal Bhasa"
        },
        {
            "code": "nia",
            "name": "Nias"
        },
        {
            "code": "nic",
            "name": "Niger-Kordofanian languages"
        },
        {
            "code": "niu",
            "name": "Niuean"
        },
        {
            "code": "nno",
            "name": "Norwegian Nynorsk"
        },
        {
            "code": "nob",
            "name": "Bokmål, Norwegian"
        },
        {
            "code": "nog",
            "name": "Nogai"
        },
        {
            "code": "non",
            "name": "Norse, Old"
        },
        {
            "code": "nor",
            "name": "Norwegian"
        },
        {
            "code": "nqo",
            "name": "N'Ko"
        },
        {
            "code": "nso",
            "name": "Pedi"
        },
        {
            "code": "nub",
            "name": "Nubian languages"
        },
        {
            "code": "nwc",
            "name": "Classical Newari"
        },
        {
            "code": "nya",
            "name": "Chichewa"
        },
        {
            "code": "nym",
            "name": "Nyamwezi"
        },
        {
            "code": "nyn",
            "name": "Nyankole"
        },
        {
            "code": "nyo",
            "name": "Nyoro"
        },
        {
            "code": "nzi",
            "name": "Nzima"
        },
        {
            "code": "oci",
            "name": "Occitan (post 1500)"
        },
        {
            "code": "oji",
            "name": "Ojibwa"
        },
        {
            "code": "ori",
            "name": "Oriya"
        },
        {
            "code": "orm",
            "name": "Oromo"
        },
        {
            "code": "osa",
            "name": "Osage"
        },
        {
            "code": "oss",
            "name": "Ossetian"
        },
        {
            "code": "ota",
            "name": "Turkish, Ottoman (1500-1928)"
        },
        {
            "code": "oto",
            "name": "Otomian languages"
        },
        {
            "code": "paa",
            "name": "Papuan languages"
        },
        {
            "code": "pag",
            "name": "Pangasinan"
        },
        {
            "code": "pal",
            "name": "Pahlavi"
        },
        {
            "code": "pam",
            "name": "Pampanga"
        },
        {
            "code": "pan",
            "name": "Panjabi"
        },
        {
            "code": "pap",
            "name": "Papiamento"
        },
        {
            "code": "pau",
            "name": "Palauan"
        },
        {
            "code": "peo",
            "name": "Persian, Old (ca.600-400 B.C.)"
        },
        {
            "code": "per",
            "name": "Persian"
        },
        {
            "code": "phi",
            "name": "Philippine languages"
        },
        {
            "code": "phn",
            "name": "Phoenician"
        },
        {
            "code": "pli",
            "name": "Pali"
        },
        {
            "code": "pol",
            "name": "Polish"
        },
        {
            "code": "pon",
            "name": "Pohnpeian"
        },
        {
            "code": "por",
            "name": "Portuguese"
        },
        {
            "code": "pra",
            "name": "Prakrit languages"
        },
        {
            "code": "pro",
            "name": "Provençal, Old (to 1500)"
        },
        {
            "code": "pus",
            "name": "Pushto"
        },
        {
            "code": "qaa-qtz",
            "name": "Reserved for local use"
        },
        {
            "code": "que",
            "name": "Quechua"
        },
        {
            "code": "raj",
            "name": "Rajasthani"
        },
        {
            "code": "rap",
            "name": "Rapanui"
        },
        {
            "code": "rar",
            "name": "Rarotongan"
        },
        {
            "code": "roa",
            "name": "Romance languages"
        },
        {
            "code": "roh",
            "name": "Romansh"
        },
        {
            "code": "rom",
            "name": "Romany"
        },
        {
            "code": "rum",
            "name": "Romanian"
        },
        {
            "code": "run",
            "name": "Rundi"
        },
        {
            "code": "rup",
            "name": "Aromanian"
        },
        {
            "code": "rus",
            "name": "Russian"
        },
        {
            "code": "sad",
            "name": "Sandawe"
        },
        {
            "code": "sag",
            "name": "Sango"
        },
        {
            "code": "sah",
            "name": "Yakut"
        },
        {
            "code": "sai",
            "name": "South American Indian (Other)"
        },
        {
            "code": "sal",
            "name": "Salishan languages"
        },
        {
            "code": "sam",
            "name": "Samaritan Aramaic"
        },
        {
            "code": "san",
            "name": "Sanskrit"
        },
        {
            "code": "sas",
            "name": "Sasak"
        },
        {
            "code": "sat",
            "name": "Santali"
        },
        {
            "code": "scn",
            "name": "Sicilian"
        },
        {
            "code": "sco",
            "name": "Scots"
        },
        {
            "code": "sel",
            "name": "Selkup"
        },
        {
            "code": "sem",
            "name": "Semitic languages"
        },
        {
            "code": "sga",
            "name": "Irish, Old (to 900)"
        },
        {
            "code": "sgn",
            "name": "Sign Languages"
        },
        {
            "code": "shn",
            "name": "Shan"
        },
        {
            "code": "sid",
            "name": "Sidamo"
        },
        {
            "code": "sin",
            "name": "Sinhala"
        },
        {
            "code": "sio",
            "name": "Siouan languages"
        },
        {
            "code": "sit",
            "name": "Sino-Tibetan languages"
        },
        {
            "code": "sla",
            "name": "Slavic languages"
        },
        {
            "code": "slo",
            "name": "Slovak"
        },
        {
            "code": "slv",
            "name": "Slovenian"
        },
        {
            "code": "sma",
            "name": "Southern Sami"
        },
        {
            "code": "sme",
            "name": "Northern Sami"
        },
        {
            "code": "smi",
            "name": "Sami languages"
        },
        {
            "code": "smj",
            "name": "Lule Sami"
        },
        {
            "code": "smn",
            "name": "Inari Sami"
        },
        {
            "code": "smo",
            "name": "Samoan"
        },
        {
            "code": "sms",
            "name": "Skolt Sami"
        },
        {
            "code": "sna",
            "name": "Shona"
        },
        {
            "code": "snd",
            "name": "Sindhi"
        },
        {
            "code": "snk",
            "name": "Soninke"
        },
        {
            "code": "sog",
            "name": "Sogdian"
        },
        {
            "code": "som",
            "name": "Somali"
        },
        {
            "code": "son",
            "name": "Songhai languages"
        },
        {
            "code": "sot",
            "name": "Sotho, Southern"
        },
        {
            "code": "spa",
            "name": "Spanish"
        },
        {
            "code": "srd",
            "name": "Sardinian"
        },
        {
            "code": "srn",
            "name": "Sranan Tongo"
        },
        {
            "code": "srp",
            "name": "Serbian"
        },
        {
            "code": "srr",
            "name": "Serer"
        },
        {
            "code": "ssa",
            "name": "Nilo-Saharan languages"
        },
        {
            "code": "ssw",
            "name": "Swati"
        },
        {
            "code": "suk",
            "name": "Sukuma"
        },
        {
            "code": "sun",
            "name": "Sundanese"
        },
        {
            "code": "sus",
            "name": "Susu"
        },
        {
            "code": "sux",
            "name": "Sumerian"
        },
        {
            "code": "swa",
            "name": "Swahili"
        },
        {
            "code": "swe",
            "name": "Swedish"
        },
        {
            "code": "syc",
            "name": "Classical Syriac"
        },
        {
            "code": "syr",
            "name": "Syriac"
        },
        {
            "code": "tah",
            "name": "Tahitian"
        },
        {
            "code": "tai",
            "name": "Tai languages"
        },
        {
            "code": "tam",
            "name": "Tamil"
        },
        {
            "code": "tat",
            "name": "Tatar"
        },
        {
            "code": "tel",
            "name": "Telugu"
        },
        {
            "code": "tem",
            "name": "Timne"
        },
        {
            "code": "ter",
            "name": "Tereno"
        },
        {
            "code": "tet",
            "name": "Tetum"
        },
        {
            "code": "tgk",
            "name": "Tajik"
        },
        {
            "code": "tgl",
            "name": "Tagalog"
        },
        {
            "code": "tha",
            "name": "Thai"
        },
        {
            "code": "tib",
            "name": "Tibetan"
        },
        {
            "code": "tig",
            "name": "Tigre"
        },
        {
            "code": "tir",
            "name": "Tigrinya"
        },
        {
            "code": "tiv",
            "name": "Tiv"
        },
        {
            "code": "tkl",
            "name": "Tokelau"
        },
        {
            "code": "tlh",
            "name": "Klingon"
        },
        {
            "code": "tli",
            "name": "Tlingit"
        },
        {
            "code": "tmh",
            "name": "Tamashek"
        },
        {
            "code": "tog",
            "name": "Tonga (Nyasa)"
        },
        {
            "code": "ton",
            "name": "Tonga (Tonga Islands)"
        },
        {
            "code": "tpi",
            "name": "Tok Pisin"
        },
        {
            "code": "tsi",
            "name": "Tsimshian"
        },
        {
            "code": "tsn",
            "name": "Tswana"
        },
        {
            "code": "tso",
            "name": "Tsonga"
        },
        {
            "code": "tuk",
            "name": "Turkmen"
        },
        {
            "code": "tum",
            "name": "Tumbuka"
        },
        {
            "code": "tup",
            "name": "Tupi languages"
        },
        {
            "code": "tur",
            "name": "Turkish"
        },
        {
            "code": "tut",
            "name": "Altaic languages"
        },
        {
            "code": "tvl",
            "name": "Tuvalu"
        },
        {
            "code": "twi",
            "name": "Twi"
        },
        {
            "code": "tyv",
            "name": "Tuvinian"
        },
        {
            "code": "udm",
            "name": "Udmurt"
        },
        {
            "code": "uga",
            "name": "Ugaritic"
        },
        {
            "code": "uig",
            "name": "Uighur"
        },
        {
            "code": "ukr",
            "name": "Ukrainian"
        },
        {
            "code": "umb",
            "name": "Umbundu"
        },
        {
            "code": "und",
            "name": "Undetermined"
        },
        {
            "code": "urd",
            "name": "Urdu"
        },
        {
            "code": "uzb",
            "name": "Uzbek"
        },
        {
            "code": "vai",
            "name": "Vai"
        },
        {
            "code": "ven",
            "name": "Venda"
        },
        {
            "code": "vie",
            "name": "Vietnamese"
        },
        {
            "code": "vol",
            "name": "Volapük"
        },
        {
            "code": "vot",
            "name": "Votic"
        },
        {
            "code": "wak",
            "name": "Wakashan languages"
        },
        {
            "code": "wal",
            "name": "Walamo"
        },
        {
            "code": "war",
            "name": "Waray"
        },
        {
            "code": "was",
            "name": "Washo"
        },
        {
            "code": "wel",
            "name": "Welsh"
        },
        {
            "code": "wen",
            "name": "Sorbian languages"
        },
        {
            "code": "wln",
            "name": "Walloon"
        },
        {
            "code": "wol",
            "name": "Wolof"
        },
        {
            "code": "xal",
            "name": "Kalmyk"
        },
        {
            "code": "xho",
            "name": "Xhosa"
        },
        {
            "code": "yao",
            "name": "Yao"
        },
        {
            "code": "yap",
            "name": "Yapese"
        },
        {
            "code": "yid",
            "name": "Yiddish"
        },
        {
            "code": "yor",
            "name": "Yoruba"
        },
        {
            "code": "ypk",
            "name": "Yupik languages"
        },
        {
            "code": "zap",
            "name": "Zapotec"
        },
        {
            "code": "zbl",
            "name": "Blissymbols"
        },
        {
            "code": "zen",
            "name": "Zenaga"
        },
        {
            "code": "zgh",
            "name": "Standard Moroccan Tamazight"
        },
        {
            "code": "zha",
            "name": "Zhuang"
        },
        {
            "code": "znd",
            "name": "Zande languages"
        },
        {
            "code": "zul",
            "name": "Zulu"
        },
        {
            "code": "zun",
            "name": "Zuni"
        },
        {
            "code": "zxx",
            "name": "No linguistic content"
        },
        {
            "code": "zza",
            "name": "Zaza"
        }
    ],

    constructor: function() {
        this.callParent(arguments);
        // Replace names with the translated ones
        this.each(function(r) {
            var translatedName = Locale.getString('languages')[r.get('code')];
            if (translatedName) r.set('name', translatedName);
        });
    }
});
