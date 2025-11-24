# PS2 Anniversary Tribute

![PS2 blocks](public/images/ps2 w_blocks.png)

Ce dépôt contient un projet hommage à la PlayStation 2. L'objectif est de recréer l'ambiance visuelle et sonore du menu de la PS2.

<p align="center">
	<img src="public/favicon/logo-ps.png" alt="PS2 logo" width="96" height="96">
</p>

## Overview

Ce projet est essentiellement front-end mais il utilise quelques outils pour la compilation des ressources avec Sass et Pug.

## TechStack

La partie front-end est écrite en JavaScript vanilla sans framework front. Quelques bibliothèques peuvent être utilisées ponctuellement (ex. pour des animations), mais l'architecture favorise la simplicité en utilisant : 

- Sass/Scss
- Pug
- JavaScript

## Getting Started

### Prérequis

- Node.js (optionnel si vous n'utilisez pas les scripts de build de Sass et de Pug).
- Python (optionnel, pour tester rapidement le dossier `public` via `python3 -m http.server`) ou utiliser l'extension LiveServer sur VsCode.

1. Cloner le dépôt :

```bash
git clone https://github.com/Squid-Nayth/ps2-anniversary-tribute.git
cd ps2-anniversary-tribute
```

2. Installer Sass et Pug

Si vous souhaitez compiler les fichiers Sass localement pour contribuer au projet, installez `sass` globalement :

```bash
npm install -g sass
```

Pour utiliser `pug`, installez le paquet :

```bash
npm install pug
```

Remarque : certains workflows utilisent `npx` pour exécuter `sass` sans installation globale (ex. `npx sass ...`).

3. Lancer localement

Avec Node.js / serve :

```bash
npx serve public -l 8000
```

Ou utiliser l'extension LiveServer pour VsCode.


## Credits

Ce projet a été réalisé par Nathan Michel (2025) comme un hommage personnel à la PlayStation 2. Mon intention est de partager une base visuelle et sonore, explicative et modifiable.

Inspirations et remerciements : projets open-source et tutoriels publics qui m'ont aidé durant l'apprentissage.

---

## Licence

Ce projet est sous licence MIT.

