export const nationalityItems = [
    { id: "GBR", label: "Grande-Bretagne" },
    { id: "GER", label: "Allemagne" },
    { id: "FRA", label: "France" },
    { id: "ITA", label: "Italie" },
    { id: "ESP", label: "Espagne" },
    { id: "NED", label: "Pays-Bas" },
    { id: "AUS", label: "Australie" },
    { id: "AUT", label: "Autriche" },
    { id: "BRA", label: "Bresil" },
    { id: "CAN", label: "Canada" },
    { id: "FIN", label: "Finlande" },
    { id: "JPN", label: "Japon" },
    { id: "MEX", label: "Mexique" },
    { id: "MON", label: "Monaco" },
    { id: "NZL", label: "Nouvelle-Zelande" },
    { id: "POL", label: "Pologne" },
    { id: "RUS", label: "Russie" },
    { id: "SUI", label: "Suisse" },
    { id: "THA", label: "Thailande" },
    { id: "USA", label: "Etats-Unis" },
    { id: "CHN", label: "Chine" },
    { id: "IND", label: "Inde" },
    { id: "DEN", label: "Danemark" },
    { id: "BEL", label: "Belgique" },
    { id: "SWE", label: "Suede" },
    { id: "ARG", label: "Argentine" },
    { id: "COL", label: "Colombie" },
    { id: "NOR", label: "Norvege" },
    { id: "POR", label: "Portugal" },
    { id: "ISR", label: "Israel" },
    { id: "KOR", label: "Coree du Sud" },
    { id: "RSA", label: "Afrique du Sud" },
    { id: "VEN", label: "Venezuela" },
];

export const validNationalityCodes = nationalityItems.map((n) => n.id);

/** Mapping code F1 (3 lettres) → code ISO 3166-1 alpha-2 (pour emoji drapeau) */
const isoAlpha2: Record<string, string> = {
    GBR: "GB", GER: "DE", FRA: "FR", ITA: "IT", ESP: "ES",
    NED: "NL", AUS: "AU", AUT: "AT", BRA: "BR", CAN: "CA",
    FIN: "FI", JPN: "JP", MEX: "MX", MON: "MC", NZL: "NZ",
    POL: "PL", RUS: "RU", SUI: "CH", THA: "TH", USA: "US",
    CHN: "CN", IND: "IN", DEN: "DK", BEL: "BE", SWE: "SE",
    ARG: "AR", COL: "CO", NOR: "NO", POR: "PT", ISR: "IL", KOR: "KR", RSA: "ZA", VEN: "VE",
};

/** Convertit un code pays F1 (ex: "GBR") en emoji drapeau (ex: "🇬🇧") */
export function nationalityToFlag(code: string | null | undefined): string | null {
    if (!code) return null;
    const alpha2 = isoAlpha2[code];
    if (!alpha2) return null;
    return String.fromCodePoint(
        ...alpha2.split("").map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
    );
}

export const importanceItems = [
    { id: "1", label: "1 - Mineur" },
    { id: "2", label: "2 - Faible" },
    { id: "3", label: "3 - Moyen" },
    { id: "4", label: "4 - Important" },
    { id: "5", label: "5 - Majeur" },
];
