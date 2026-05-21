# The Doll Studio — Guide de mise à jour

Bienvenue ! Ce fichier explique à Claude Code ou Windsurf comment ce site
est organisé, pour que tu puisses le modifier toi-même facilement.

---

## Structure du dossier

```
index.html   → Tout le contenu : textes, horaires, services
style.css    → Tout le design : couleurs, polices, mise en page
script.js    → Les interactions : formulaire, animations, photos
CLAUDE.md    → Ce fichier
```

---

## Choses à faire régulièrement

### Mettre à jour les disponibilités de la semaine

Dans `index.html`, cherche le commentaire `⚡ À METTRE À JOUR CHAQUE SEMAINE ⚡`.

**Exemple de message à envoyer à Claude :**
> "Change les disponibilités : semaine du 2 juin.
> Lundi : 10h et 14h. Mercredi : rien. Jeudi : 17h30. Samedi : 9h et 11h."

---

## Autres modifications possibles

### Ajouter ou changer un prix
> "Ajoute le prix 45€ pour le renforcement et 55€ pour la pose américaine"

### Changer la description d'un service
> "Reformule la description du renforcement pour qu'elle soit plus courte"

### Ajouter une nouvelle teinte
> "Ajoute la teinte Bordeaux dans la section teintes, avec la couleur #6B0020"

### Modifier le texte de la section 'Avant ton rendez-vous'
> "Ajoute une étape 5 : Venir avec les ongles propres et sans vernis"

---

## Connecter le formulaire à ton email (recommandé)

Par défaut, le formulaire affiche une belle confirmation mais n'envoie
aucun email. Pour recevoir les demandes de rendez-vous par email,
suis ces étapes (c'est gratuit) :

1. Va sur **https://formspree.io** et crée un compte avec ton email
2. Crée un nouveau formulaire ("New Form"), donne-lui un nom
3. Copie l'ID qui s'affiche (exemple : `xpzgkwbn`)
4. Dis à Claude : **"Connecte le formulaire à Formspree avec l'ID xpzgkwbn"**

Claude décommentera automatiquement le code correspondant dans `script.js`.

---

## Mettre le site en ligne gratuitement

### Option 1 — Netlify Drop (le plus simple, 2 minutes)

1. Va sur **https://app.netlify.com/drop**
2. Glisse-dépose le dossier complet `Site Lucie - the_doll_studio` sur la page
3. Le site est en ligne immédiatement avec une adresse type `random-name.netlify.app`
4. Tu peux ensuite changer cette adresse pour quelque chose comme `thedollstudio.netlify.app`
5. Pour mettre à jour : re-glisse le dossier sur ton site dans Netlify

### Option 2 — Avec un nom de domaine personnalisé
> Dis à Claude : "Comment connecter un nom de domaine à mon site Netlify ?"

---

## Palette de couleurs

| Usage               | Code couleur |
|---------------------|-------------|
| Rouge principal     | `#A8000C`   |
| Rouge au survol     | `#CC0010`   |
| Rouge sombre        | `#5A0008`   |
| Fond noir           | `#07030A`   |
| Texte crème         | `#F2E8E9`   |
| Texte crème pâle    | `#D4C0C3`   |

Pour changer une couleur :
> "Rends le rouge un peu plus foncé" ou "Change le fond pour un noir plus chaud"

---

## Polices utilisées

- **Pinyon Script** → Grands titres (le nom du studio, les sections)
- **Cormorant Garamond** → Texte élégant, chiffres, descriptions
- **Raleway** → Texte d'interface, boutons, labels

Pour changer une police :
> "Remplace Pinyon Script par Parisienne pour les titres"

---

## En cas de problème

Si quelque chose ne s'affiche pas correctement :
1. Ouvre le site dans Chrome ou Safari
2. Fais un clic droit → "Inspecter" → regarde les erreurs en rouge dans la Console
3. Montre le message d'erreur à Claude

---

*Site créé avec Claude Code — Mai 2025*
