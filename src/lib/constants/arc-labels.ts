export const arcTypeLabels: Record<string, string> = {
    transfer: "Transfert",
    rivalry: "Rivalite",
    technical: "Technique",
    sponsor: "Sponsor",
    entry_exit: "Entree/Sortie",
    drama: "Drame",
    regulation: "Reglementation",
    other: "Autre",
};

export const arcTypeBadgeColor: Record<
    string,
    "blue" | "orange" | "purple" | "brand" | "indigo" | "pink" | "warning" | "gray"
> = {
    transfer: "blue",
    rivalry: "orange",
    technical: "purple",
    sponsor: "brand",
    entry_exit: "indigo",
    drama: "pink",
    regulation: "warning",
    other: "gray",
};

export const arcStatusLabels: Record<string, string> = {
    signal: "Signal",
    developing: "En cours",
    confirmed: "Confirme",
    resolved: "Resolu",
};

export const arcStatusColor: Record<string, "gray" | "warning" | "brand" | "success"> = {
    signal: "gray",
    developing: "warning",
    confirmed: "brand",
    resolved: "success",
};

export const newsTypeLabels: Record<string, string> = {
    transfer: "Transfert",
    technical: "Technique",
    sponsor: "Sponsor",
    regulation: "Reglementation",
    injury: "Blessure",
    retirement: "Retraite",
    other: "Autre",
};

export const newsTypeBadgeColor: Record<
    string,
    "blue" | "purple" | "brand" | "warning" | "orange" | "gray"
> = {
    transfer: "blue",
    technical: "purple",
    sponsor: "brand",
    regulation: "warning",
    injury: "orange",
    retirement: "gray",
    other: "gray",
};
