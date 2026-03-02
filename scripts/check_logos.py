import csv
import os
import re
import unicodedata


ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CSV_PATH = os.path.join(ROOT, "EAFC26-Men.csv")
ANALYZER_PATH = os.path.join(ROOT, "js", "analyzer.js")


def norm(s: str) -> str:
    s = (s or "").lower().strip()
    s = unicodedata.normalize("NFD", s)
    s = "".join(ch for ch in s if unicodedata.category(ch) != "Mn")
    s = re.sub(r"[^a-z0-9]+", " ", s).strip()
    s = re.sub(r"\s+", " ", s)
    return s


def load_logo_aliases():
    text = open(ANALYZER_PATH, encoding="utf-8").read()
    # Allow escaped apostrophes inside JS strings, e.g. "De l\'Ouest"
    # Key/value patterns: '...': '...svg'
    pairs = re.findall(r"'((?:\\'|[^'])+)'\s*:\s*'((?:\\'|[^'])+\.svg)'", text)
    # Unescape \' sequences so file existence checks work
    pairs = [(k.replace("\\'", "'"), v.replace("\\'", "'")) for k, v in pairs]
    normalized_map = {norm(k): v for k, v in pairs}
    keys_desc = sorted(normalized_map.keys(), key=len, reverse=True)
    return normalized_map, keys_desc


def resolve_logo(team_name: str, normalized_map: dict, keys_desc: list) -> str | None:
    search = norm(team_name)
    fn = normalized_map.get(search)
    if fn:
        return fn
    padded = f" {search} "
    for k in keys_desc:
        if len(k) < 4:
            continue
        if f" {k} " in padded:
            return normalized_map[k]
    return None


LEAGUE_NORM = {
    "LALIGA EA SPORTS": "La Liga",
    "Premier League": "Premier League",
    "Bundesliga": "Bundesliga",
    "Serie A Enilive": "Serie A",
    "Serie A": "Serie A",
    "Ligue 1 McDonald's": "Ligue 1",
}

LEAGUE_FOLDERS = {
    "La Liga": os.path.join(ROOT, "Espana", "Primera División de España"),
    "Premier League": os.path.join(ROOT, "United Kindom", "Premier League"),
    "Bundesliga": os.path.join(ROOT, "Alemania", "Bundesliga"),
    "Serie A": os.path.join(ROOT, "Italia", "Serie A"),
    "Ligue 1": os.path.join(ROOT, "Francia", "Ligue 1"),
}


def main():
    normalized_map, keys_desc = load_logo_aliases()

    teams_by_league = {k: set() for k in LEAGUE_FOLDERS.keys()}
    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        r = csv.reader(f)
        next(r, None)
        for row in r:
            if len(row) < 51:
                continue
            raw_league = row[49]
            if raw_league not in LEAGUE_NORM:
                continue
            league = LEAGUE_NORM[raw_league]
            if league in teams_by_league:
                teams_by_league[league].add(row[50])

    print("=== Unique teams from CSV (major leagues) ===")
    for league in ["La Liga", "Premier League", "Bundesliga", "Serie A", "Ligue 1"]:
        print(f"{league}: {len(teams_by_league[league])}")

    missing = []
    badfile = []
    for league, teams in teams_by_league.items():
        folder = LEAGUE_FOLDERS[league]
        for team_name in sorted(teams):
            fn = resolve_logo(team_name, normalized_map, keys_desc)
            if not fn:
                missing.append((league, team_name))
            else:
                p = os.path.join(folder, fn)
                if not os.path.exists(p):
                    badfile.append((league, team_name, fn))

    print("\n=== Missing logo mapping (CSV name not resolvable) ===")
    print("count:", len(missing))
    for league, name in missing:
        print(f"- {league}: {name}")

    print("\n=== Mapping resolves but SVG file missing on disk ===")
    print("count:", len(badfile))
    for league, name, fn in badfile:
        print(f"- {league}: {name} -> {fn}")

    if not missing and not badfile:
        print("\n✅ All major league teams from CSV resolve to an existing local SVG.")


if __name__ == "__main__":
    main()


