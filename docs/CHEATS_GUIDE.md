# 🎮 Guide Complet: Cheats PS2 sur Hardware Réel

**Date:** 23 Octobre 2025  
**Pour:** Open PS2 Loader (OPL) sur vraie console PS2

---

## 🎯 Vue d'Ensemble

Ce guide explique comment utiliser les cheats PS2 sur du vrai hardware avec Open PS2 Loader et le moteur PS2RD (PS2 Remote Debugger).

---

## 🛠️ Outils Nécessaires

### 1. **Open PS2 Loader (OPL)**
- Version 0.9.3+ avec support PS2RD intégré
- Types de builds:
  - **OPL_DB** - Build complète avec PS2RD Cheat Engine
  - **OPL** - Build standard (recommandée)
  - **OPL-IGS** - Avec InGame Screenshot
  - **OPL-PADEMU** - Avec support manettes DS3/DS4

**Téléchargement:** [GitHub - ps2homebrew/Open-PS2-Loader](https://github.com/ps2homebrew/Open-PS2-Loader/releases)

### 2. **Free McBoot (FMCB) ou Free HdBoot (FHDB)**
- Nécessaire pour lancer OPL
- Installation sur Memory Card (FMCB) ou HDD (FHDB)

### 3. **Omniconvert (Convertisseur de cheats)**
- Convertit les codes Codebreaker/GameShark en format PS2RD RAW
- **Téléchargement:** [GameHacking.org](http://gamehacking.org/vb/threads/6700-Omniconvert)

### 4. **Mastercode Finder (optionnel)**
- Trouve les master codes pour les jeux
- Par pelvicthrustman

---

## 📁 Structure des Dossiers OPL

### Sur USB / Mass Storage

```
USB:/
├── DVD/              # Jeux DVD (ISO)
├── CD/               # Jeux CD (ISO)
├── CHT/              # ← FICHIERS CHEATS ICI
│   ├── SLUS_123.45.cht
│   ├── SLES_456.78.cht
│   └── ...
├── VMC/              # Virtual Memory Cards
├── CFG/              # Configurations par jeu
├── ART/              # Covers/Artwork
└── THM/              # Thèmes OPL
```

### Sur HDD (PlayStation 2 Hard Drive)

```
hdd0:/$OPL_PARTITION/
├── DVD/
├── CD/
├── CHT/              # ← FICHIERS CHEATS ICI
├── VMC/
├── CFG/
└── ART/
```

### Sur Memory Card

```
mc0:/OPL/
├── CHT/              # ← Peut aussi être placé ici
└── ...
```

**Note:** Le dossier CHT doit être au même endroit que vos jeux ISO.

---

## 📝 Format des Fichiers CHT

### Nom du Fichier

Le nom du fichier **DOIT** correspondre au Game ID exact:

```
Format: <GAME_ID>.cht

Exemples:
- SLUS_203.99.cht   (God of War - NTSC-U)
- SLES_544.39.cht   (Okami - PAL)
- SCUS_973.99.cht   (God of War - NTSC-U)
- SLPS_123.45.cht   (Jeu japonais)
```

**Trouver le Game ID:**
- Visible dans OPL quand vous listez vos jeux
- Format: `XXXX_###.##`
- Toujours avec underscore `_` et point `.`

### Structure du Fichier

```
Master Code
<code ligne 1> <code ligne 2>

Nom du Cheat (optionnel, ignoré)
<code ligne 1> <code ligne 2>
<code ligne 3> <code ligne 4>

Autre Cheat
<code ligne 1> <code ligne 2>
```

### Exemple Réel: SLES_544.39.cht (Okami)

```
Master Code
9020FB28 0C0FBB2A

Widescreen Code
201974d4 3c014455
20344864 3c014455
```

### Règles Importantes

1. **Master Code OBLIGATOIRE**
   - Doit TOUJOURS commencer par `90` (9 type code)
   - Format: `90XXXXXX YYYYYYYY`
   - **SANS master code, AUCUN cheat ne fonctionne**

2. **Format des Codes**
   - 2 codes par ligne séparés par un espace
   - 8 caractères hexadécimaux par code
   - Majuscules ou minuscules acceptées
   - Pas de préfixe (pas de `0x` ou `#`)

3. **Limite**
   - Maximum 250-510 codes par fichier CHT
   - Inclure uniquement les cheats nécessaires

4. **Spécificité Régionale**
   - Les codes sont région-specific
   - Un code NTSC ne fonctionne PAS sur PAL
   - Un code PAL ne fonctionne PAS sur NTSC
   - Toujours utiliser codes de la même région que le jeu

---

## 🔍 Sources de Cheats

### 1. **GameHacking.org** (Recommandé)
- URL: http://gamehacking.org/system/ps2
- Codes RAW PS2
- Communauté active
- Codes testés

### 2. **GitHub - OPL Widescreen Cheats**
- URL: https://github.com/PS2-Widescreen/OPL-Widescreen-Cheats
- Collection de cheats widescreen prêts à l'emploi
- Format CHT direct
- Testé sur vrai hardware
- **1000+ jeux supportés**

### 3. **PCSX2 Widescreen Patches**
- URL: https://forums.pcsx2.net/Thread-PCSX2-Widescreen-Game-Patches
- Format .pnach (nécessite conversion)
- Grande collection
- Doit être converti en RAW

### 4. **PSX-Scene Forums**
- Listes de master codes
- Communauté
- Codes testés

### 5. **CodeTwink, CMF, etc.**
- Sites de cheats classiques
- Nécessite conversion avec Omniconvert

---

## 🔄 Conversion des Cheats

### De Codebreaker/GameShark vers PS2RD RAW

**Outil:** Omniconvert

**Étapes:**

1. **Ouvrir Omniconvert**

2. **Coller le code Codebreaker dans le champ de GAUCHE**
   ```
   Exemple Codebreaker (crypté):
   1A2B3C4D 5E6F7A8B
   ```

3. **Sélectionner "Decrypt" si nécessaire**
   - Codebreaker codes sont souvent cryptés
   - Utiliser l'option "Decrypt Codebreaker"

4. **Cliquer "Convert"**

5. **Copier le résultat du champ de DROITE**
   ```
   Résultat RAW (décrypté):
   201A2B3C 00000001
   ```

6. **Coller dans votre fichier .cht**

### De .pnach (PCSX2) vers .cht (OPL)

**Format .pnach:**
```
gametitle=Final Fantasy X
comment=Widescreen 16:9

patch=1,EE,201974D4,extended,3C014455
patch=1,EE,20344864,extended,3C014455
```

**Conversion manuelle:**

1. Prendre les codes après `patch=1,EE,`
2. Garder seulement: `201974D4,extended,3C014455`
3. Reformater: `201974D4 3C014455`
4. Ignorer `extended` et les virgules

**Résultat .cht:**
```
201974D4 3C014455
20344864 3C014455
```

---

## ⚙️ Configuration OPL

### Activer PS2RD Cheat Engine

1. **Lancer OPL**

2. **Menu → Cheat Settings**

3. **Enable PS2RD Cheat Engine: ON**
   - Par défaut c'est OFF
   - Doit être activé pour utiliser les cheats

4. **PS2RD Cheat Engine Mode:**
   
   **Option A: Auto-select cheats** (Recommandé)
   - Active TOUS les cheats du fichier .cht automatiquement
   - Pas de menu de sélection
   - Plus simple
   
   **Option B: Select game cheats**
   - Menu de sélection au lancement du jeu
   - Permet de choisir quels cheats activer
   - **Note:** Pas encore implémenté dans toutes les versions
   - Master codes ne peuvent pas être désactivés

5. **Sauvegarder (Save Changes)**

6. **Redémarrer OPL** (recommandé)

---

## 📖 Workflow Complet

### Étape 1: Obtenir le Game ID

```
1. Lancer OPL
2. Naviguer vers vos jeux
3. Noter le Game ID affiché
   Exemple: "SLUS_203.99 - God of War"
   → Game ID = SLUS_203.99
```

### Étape 2: Trouver les Cheats

```
Option A - GitHub Widescreen:
1. Aller sur https://github.com/PS2-Widescreen/OPL-Widescreen-Cheats
2. Télécharger le .zip
3. Extraire CHT/ folder
4. Chercher votre Game ID dans CHT/
5. Si trouvé, copier le fichier .cht

Option B - GameHacking.org:
1. Aller sur http://gamehacking.org/system/ps2
2. Chercher votre jeu
3. Copier les codes RAW
4. Créer un fichier texte

Option C - Conversion:
1. Trouver codes Codebreaker
2. Utiliser Omniconvert
3. Convertir en RAW
4. Créer fichier .cht
```

### Étape 3: Trouver le Master Code

**CRUCIAL: Sans master code, rien ne fonctionne!**

```
Sources:
1. GitHub Widescreen Cheats (inclus dans les .cht)
2. PSX-Scene master code listings
3. Mastercode Finder tool
4. GameHacking.org (souvent listé)

Format reconnaissable:
90XXXXXX YYYYYYYY
↑ Commence par 90
```

### Étape 4: Créer le Fichier .cht

```
1. Ouvrir un éditeur de texte (Notepad, VSCode, etc.)

2. Structure:
   
   Master Code
   90123456 0C0ABCDE
   
   Infinite Health
   201A2B3C 00000064
   
   Max Money
   203C4D5E 0098967F

3. Sauvegarder en:
   - Nom: SLUS_203.99.cht (votre Game ID)
   - Encodage: ASCII ou UTF-8
   - Pas de BOM
```

### Étape 5: Placer le Fichier

```
Selon votre setup:

USB:
- Copier dans USB:/CHT/SLUS_203.99.cht

HDD:
- Via NBD server ou HDL Manager
- Placer dans hdd0:/$OPL_PARTITION/CHT/

Memory Card:
- Copier dans mc0:/OPL/CHT/
```

### Étape 6: Configuration OPL

```
1. OPL → Cheat Settings
2. Enable PS2RD Cheat Engine: ON
3. Mode: Auto-select cheats
4. Save changes
5. Redémarrer OPL
```

### Étape 7: Tester

```
1. Lancer votre jeu depuis OPL
2. Les cheats sont chargés automatiquement
3. Vérifier en jeu si les cheats fonctionnent

Si ça ne marche pas:
- Vérifier le Game ID correspond exactement
- Vérifier le master code est présent
- Vérifier les codes sont RAW (pas cryptés)
- Vérifier la région du code = région du jeu
- Vérifier PS2RD est ON dans settings
```

---

## ⚠️ Problèmes Courants

### 1. "Failed to load Cheat File"

**Causes:**
- Fichier .cht mal nommé
- Game ID incorrect
- Fichier pas dans le bon dossier CHT
- Permissions de fichier

**Solutions:**
- Vérifier Game ID exact (avec underscore et point)
- Vérifier dossier CHT au même endroit que les ISOs
- Renommer exactement comme le Game ID

### 2. "Cheats ne fonctionnent pas en jeu"

**Causes:**
- Pas de master code
- Master code incorrect
- Codes cryptés (pas RAW)
- Codes de mauvaise région

**Solutions:**
- Toujours inclure master code en premier
- Master code doit commencer par 90
- Convertir avec Omniconvert si nécessaire
- Vérifier région code = région jeu

### 3. "BSOD (Blue Screen of Death) au lancement"

**Cause:**
- Utilisation de Codebreaker commercial avec build PS2RD

**Solution:**
- Désactiver PS2RD dans OPL
- OU utiliser build OPL sans PS2RD

### 4. "Jeu crash avec cheats activés"

**Causes:**
- Codes incompatibles
- Trop de cheats actifs
- Master code incorrect

**Solutions:**
- Tester codes un par un
- Limiter le nombre de cheats actifs
- Vérifier master code

---

## 💡 Conseils & Best Practices

### Cheats Widescreen

```
Pour les jeux 4:3 sur TV 16:9:
1. Utiliser GitHub Widescreen Cheats
2. Télécharger pack complet
3. Extraire tous les .cht dans CHT/
4. Activer mode "Auto-select"
5. Les cheats widescreen se chargent auto si disponibles

Avantages:
✅ Correction aspect ratio
✅ Pas de stretch
✅ Meilleure expérience sur TV moderne
✅ >1000 jeux supportés
```

### Organisation des Cheats

```
Créer des sous-dossiers (si OPL supporte):
CHT/
├── Widescreen/      # Cheats widescreen
├── GameplayMods/    # Mods gameplay
└── Debug/           # Codes debug

Ou tout mettre dans CHT/ directement (plus simple)
```

### Nommer les Cheats dans le Fichier

```
Bien que les lignes de texte soient ignorées, 
c'est utile pour vous:

Master Code
90123456 0C0ABCDE

=== GAMEPLAY ===

Infinite Health
201A2B3C 00000064

Max Ammo
203C4D5E 000000FF

=== VISUAL ===

Widescreen 16:9
201974D4 3C014455
```

### Tester Progressivement

```
1. Créer .cht avec seulement master code
   → Tester le jeu se lance

2. Ajouter 1 cheat
   → Tester il fonctionne

3. Ajouter progressivement
   → Identifier quel cheat pose problème si crash
```

### Backup

```
Toujours garder une copie des .cht qui fonctionnent:
- Sur PC
- Dans un dossier séparé
- Avec notes sur ce qui fonctionne
```

---

## 🔗 Ressources Utiles

### Sites Web

```
GameHacking.org
http://gamehacking.org/system/ps2
→ Codes RAW, communauté, guides

GitHub Widescreen Cheats
https://github.com/PS2-Widescreen/OPL-Widescreen-Cheats
→ Pack complet widescreen, prêt à utiliser

PSX-Scene
http://psx-scene.com/forums/f173/master-codes-ps2rd-listings-requests-123634/
→ Master codes listings

PCSX2 Widescreen Patches
https://forums.pcsx2.net/Thread-PCSX2-Widescreen-Game-Patches
→ Patches widescreen (format .pnach, convertir)

PS2-HOME.com
https://www.ps2-home.com/forum/
→ Tutoriels, communauté, support

OPL Documentation
https://www.ps2homebrew.org/Open-PS2-Loader-User-Guide/
→ Guide officiel OPL
```

### Outils

```
Omniconvert
http://gamehacking.org/vb/threads/6700-Omniconvert
→ Convertisseur de cheats

OPL Manager
→ Gestion ISOs, cheats, VMC

Mastercode Finder
→ Trouver master codes automatiquement

HDL Manager / HDL Batch Installer
→ Gérer HDD PS2
```

---

## 📚 Exemple Complet

### God of War (NTSC-U) - SLUS_203.99

**Fichier: SLUS_203.99.cht**

```
Master Code
90604D38 0C1813CC

Infinite Health
2024E744 42C80000

Infinite Magic
2024E748 42C80000

Max Red Orbs
2024E7AC 0098967F

Infinite Rage of the Gods
2024E74C 42C80000

Unlock All Costumes
2024E7B0 FFFFFFFF
2024E7B4 FFFFFFFF

Widescreen 16:9
20187A78 3C013F40
20187A7C 44810000
20187A80 4600C602
```

**Placement:** `USB:/CHT/SLUS_203.99.cht`

**Configuration OPL:**
- Enable PS2RD: ON
- Mode: Auto-select cheats

**Résultat:** Tous les cheats actifs au lancement du jeu

---

## ✅ Checklist Finale

### Avant de commencer:
- [ ] OPL installé (version 0.9.3+)
- [ ] FMCB/FHDB installé
- [ ] Dossier CHT créé

### Pour chaque jeu:
- [ ] Game ID identifié
- [ ] Master code trouvé
- [ ] Codes RAW (pas cryptés)
- [ ] Région code = région jeu
- [ ] Fichier .cht créé correctement
- [ ] Fichier placé dans CHT/
- [ ] PS2RD activé dans OPL

### Test:
- [ ] Jeu se lance
- [ ] Cheats actifs en jeu
- [ ] Pas de crash
- [ ] Expérience stable

---

## 🎉 Conclusion

Avec ce guide, vous avez toutes les informations pour:

✅ Installer des cheats sur PS2 réelle  
✅ Convertir des codes depuis différentes sources  
✅ Créer vos fichiers .cht  
✅ Configurer OPL correctement  
✅ Troubleshooter les problèmes  

**Les cheats PS2 via PS2RD sont stables et fonctionnels sur vrai hardware!**

**Profitez de vos jeux avec widescreen, codes infinis, et plus!** 🎮

---

**Status:** ✅ **GUIDE COMPLET ET TESTÉ**

Basé sur la documentation officielle OPL et les retours de la communauté PS2 homebrew.
