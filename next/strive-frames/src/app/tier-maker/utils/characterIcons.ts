const characterNameMap: Record<string, string> = {
  "A.B.A": "A.B.A",
  "Anji Mito": "Anji_Mito",
  "Asuka R": "Asuka_R",
  "Axl Low": "Axl_Low",
  Baiken: "Baiken",
  Bedman: "Bedman",
  Bridget: "Bridget",
  "Chipp Zanuff": "Chipp_Zanuff",
  "Elphelt Valentine": "Elphelt_Valentine",
  Faust: "Faust",
  Giovanna: "Giovanna",
  "Goldlewis Dickinson": "Goldlewis_Dickinson",
  "Happy Chaos": "Happy_Chaos",
  "I-No": "I-No",
  "Jack-O": "Jack-O'",
  Johnny: "Johnny",
  "Ky Kiske": "Ky_Kiske",
  "Leo Whitefang": "Leo_Whitefang",
  May: "May",
  "Millia Rage": "Millia_Rage",
  Nagoriyuki: "Nagoriyuki",
  Potemkin: "Potemkin",
  "Queen Dizzy": "Queen_Dizzy",
  "Ramlethal Valentine": "Ramlethal_Valentine",
  "Sin Kiske": "Sin_Kiske",
  Slayer: "Slayer",
  "Sol Badguy": "Sol_Badguy",
  Testament: "Testament",
  "Zato-1": "Zato-1",
};

export const getCharacterIconUrl = (name: string): string => {
  const formattedName = characterNameMap[name] || name;
  return `/icons/170px-GGST_${formattedName}_Icon.png`;
};
