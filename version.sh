#!/usr/bin/env bash
# Versionierung, Changelog-Update, Commit, Tag & Push
# Nutzung: ./version.sh [patch|minor|major] ["Changelog-Nachricht"]
# Beispiel: ./version.sh minor "Baum-Visualisierung hinzugefügt"

set -e

VERSION_FILE="VERSION"
CHANGELOG_FILE="CHANGELOG.md"
BUMP="${1:-patch}"
CHANGELOG_MSG="${2:-}"

if [[ ! -f "$VERSION_FILE" ]]; then
  echo "❌ $VERSION_FILE nicht gefunden."
  exit 1
fi

current=$(cat "$VERSION_FILE" | tr -d ' \n')
if [[ ! "$current" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "❌ Ungültiges Versionsformat in $VERSION_FILE: $current"
  exit 1
fi

major=$(echo "$current" | cut -d. -f1)
minor=$(echo "$current" | cut -d. -f2)
patch=$(echo "$current" | cut -d. -f3)

case "$BUMP" in
  major) major=$((major + 1)); minor=0; patch=0 ;;
  minor) minor=$((minor + 1)); patch=0 ;;
  patch) patch=$((patch + 1)) ;;
  *)
    echo "❌ Unbekanntes Bump: $BUMP (erlaubt: patch, minor, major)"
    exit 1
    ;;
esac

new_version="${major}.${minor}.${patch}"
echo "📌 Version: $current → $new_version ($BUMP)"

echo "$new_version" > "$VERSION_FILE"

today=$(date +%Y-%m-%d)
if [[ -z "$CHANGELOG_MSG" ]]; then
  read -p "Changelog-Eintrag für diese Version: " CHANGELOG_MSG
fi
[[ -z "$CHANGELOG_MSG" ]] && CHANGELOG_MSG="Release $new_version"

# CHANGELOG.md: neuen Release-Block einfügen, Links anpassen
python3 - "$CHANGELOG_FILE" "$current" "$new_version" "$today" "$CHANGELOG_MSG" << 'PYTHON'
import sys, re
_, changelog_file, current, new_version, today, msg = sys.argv
with open(changelog_file, "r", encoding="utf-8") as f:
    content = f.read()
new_block = f"""## [{new_version}] – {today}

### Hinzugefügt
- {msg}

---

"""
pattern = re.compile(r'\n(## \[\d+\.\d+\.\d+\] – )')
m = pattern.search(content)
if m:
    pos = m.start()
    content = content[:pos] + "\n" + new_block.strip() + "\n" + content[pos:]
else:
    content = content.rstrip() + "\n\n" + new_block
base = "https://github.com/bastian-fluegel/epistulae"
content = re.sub(r'\[Unreleased\]: [^\n]+', f"[Unreleased]: {base}/compare/v{new_version}...HEAD", content, count=1)
new_line = f"[{new_version}]: {base}/compare/v{current}...v{new_version}\n"
content = re.sub(r'(\[Unreleased\]: [^\n]+\n)', r'\1' + new_line, content, count=1)
with open(changelog_file, "w", encoding="utf-8") as f:
    f.write(content)
PYTHON

echo "✅ $VERSION_FILE und $CHANGELOG_FILE aktualisiert."

git add "$VERSION_FILE" "$CHANGELOG_FILE"
git status
echo ""
read -p "Commit und Tag erstellen? (j/n) " confirm
if [[ "$confirm" != "j" && "$confirm" != "J" && "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "Abgebrochen. Manuell: git add $VERSION_FILE $CHANGELOG_FILE && git commit -m 'Release v$new_version' && git tag v$new_version"
  exit 0
fi

git commit -m "Release v$new_version"
git tag "v$new_version"
echo "✅ Commit und Tag v$new_version erstellt."
echo ""
read -p "Push inkl. Tags? (j/n) " push_confirm
if [[ "$push_confirm" == "j" || "$push_confirm" == "J" || "$push_confirm" == "y" || "$push_confirm" == "Y" ]]; then
  git push && git push --tags
  echo "✅ Gepusht."
else
  echo "Später: git push && git push --tags"
fi
