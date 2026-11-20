# Prompt : Skill `video-production-manager` (série « Kill the Stereotype »)

À coller dans Claude Code, à la racine du dépôt OpenMontage.

---

## Mission

Construis le Skill orchestrateur `.claude/skills/video-production-manager/SKILL.md`. À partir d'une simple idée (« Crée un reel sur le stéréotype X »), il produit un reel MP4 9:16 prêt à publier sur Facebook Reels, avec son dossier de livraison complet et ses hashtags. Construis le système réellement. Ne te contente pas de le décrire.

Exemple d'entrée : « Reel de 50 secondes sur le stéréotype : les Français ne se lavent pas. »

## Contexte d'infrastructure (à respecter, ne rien réinstaller)

- Rien ne se rend sur l'hôte. La production tourne sur la VM Ubuntu décrite dans `vm.conf`. Pilote-la uniquement avec `scripts/vm` (`reel-push`, `reel-narrate`, `reel-still`, `reel-render`, `reel-pull`, `reel-build`, `run`, `status`).
- Création d'un reel : `scripts/new-reel.sh NNN-slug "Titre" --vm`, qui copie `reels/_template/`.
- Moteur de rendu : Remotion (`reels/NNN-slug/project/`, composition id dans `reel.conf`). Voix : Piper sur la VM, via `narration.json` et `scripts/remote/`.
- Règles de la série : `reels/STYLE-GUIDE.md` fait foi (ton documentaire, 45 à 60 s, aucune personne ni personnage généré, palette limitée, sous-titres en tiers inférieur dans la zone de sécurité, intro et outro partagés, carte « Sources », voix `fr_FR-siwis-medium` à `length_scale` 1.05). Ne les contredis jamais.
- Suivi : `reels/TRACKER.md`, `reels/BACKLOG.csv`, `status.md` de chaque reel.
- Skills installés dans `.agents/skills/` (pack `scrollmark/social-skills`). Ils ne sont pas dans l'outil Skill. Lis leur `SKILL.md` et applique-les.

## Étape 0 : audit (obligatoire, avant toute modification)

1. Lance `scripts/vm status`. Vérifie sur la VM : Node 22, Remotion, Piper et le modèle de voix, FFmpeg, musique disponible, espace disque.
2. Vérifie sur l'hôte : `ffmpeg`, `node`, `python3`.
3. Liste les Skills de `.agents/skills/` et associe chacun à une étape du workflow.
4. Produis un tableau « capacité vérifiée / manquante / limitation ». Ne déclare jamais une capacité sans l'avoir testée (commande exécutée, sortie lue).
5. Ne génère aucune image ni vidéo par IA. La charte l'interdit pour les personnes et privilégie typographie, données, compteurs et diagrammes. N'utilise aucun service payant.

## Workflow que le Skill doit orchestrer

| # | Étape | Outils et Skills |
|---|-------|------------------|
| 1 | Angle et public : angle original, public cible, potentiel du sujet | `trend-radar`, `platform-fluency`, `reels/BACKLOG.csv` |
| 2 | Sources : 2 à 4 faits vérifiables dans `source.json` (institution, titre, année) | règle « pas d'affirmation sans source » |
| 3 | Accroche inversée (cold open 0 à 2 s) : écrire 3 variantes, noter chacune avec les 3 questions de `hook-anatomy`, garder la meilleure. Voir section « Accroche inversée ». | `hook-anatomy` (+ `references/platforms/instagram.md`), `platform-fluency` |
| 4 | Script : naturel, non robotique, pause 0,5 à 0,8 s entre phrases et 1 s avant le verdict, structure Cold open / Hook / Preuve / Verdict / Outro commun, boucles ouvertes et relances (voir section dédiée) | `video-formats` (format Explainer), `voice-matching`, `script.md` |
| 5 | Direction artistique : un seul « signature device » | `brand-kit`, `art-direction.md` |
| 6 | Voix : Piper via `scripts/vm reel-narrate` | `audio-acquisition` |
| 7 | Composition Remotion : animations, sous-titres synchronisés (max 2 lignes de 42 caractères), carte Sources d'au moins 5 s | `editor-captions`, `editor-motion-graphics` |
| 8 | Musique : une seule nappe ambiante, -22 dB sous la voix, libre de droits vérifiée. Sans piste libre confirmée, ne mets pas de musique. | `editor-soundtrack` |
| 9 | Rendu : still de contrôle, puis brouillon `--scale=0.5`, puis rendu final | `scripts/vm reel-still`, `reel-render`, `reel-pull` |
| 10 | Contrôle qualité automatique | voir section suivante |
| 11 | Livraison et suivi | voir section suivante |

## Accroche inversée et rétention (priorité haute)

Problème : la majorité des spectateurs partent dans la première seconde (`platform-fluency` / Instagram : « environ 1 seconde avant le swipe », le taux de complétion pèse plus que les vues). Une intro lente ou un fondu depuis le noir perd donc l'audience avant le premier mot.

**Principe : on montre la fin d'abord, on retient l'explication.** Le spectateur voit le résultat surprenant dès la première image, puis doit rester pour comprendre comment on y arrive.

1. **Cold open, 0 à 2 s (nouveau bloc, avant le Hook de la charte).**
   - Première image entièrement composée : pas de noir, pas de fondu d'entrée, pas de logo, pas d'intro de série.
   - Contenu : le fait contre-intuitif ou le chiffre le plus fort, tiré de `source.json` (ex. « 1 Français sur 2 ... » + sa conséquence), sans la raison ni la source. Jamais le tampon FAUX/VRAI (il reste l'unique moment rouge du verdict).
   - Texte à l'écran dès la frame 0, gros (hors règle des petits sous-titres, qui ne vaut que pour la narration) et phrase parlée qui démarre à 0,0 à 0,2 s.
   - Pattern interrupt ou curiosity gap (`hook-anatomy`). Contrainte : la phrase de 2 s doit laisser une question ouverte (« Alors pourquoi tout le monde y croit ? »).
2. **Boucle ouverte annoncée** juste après : une phrase de promesse (« Réponse dans 40 secondes. », « Et le plus surprenant arrive à la fin. »). Le Hook de la charte (stéréotype cité puis typographie animée) suit ensuite. Ne ferme la boucle qu'au Verdict, en rappelant le cold open mot pour mot ou chiffre pour chiffre.
3. **Relances toutes les 8 à 10 s** : chaque beat de Preuve se termine par une mini-question ou un chiffre retenu (« Mais ce n'est pas tout. »). Ce sont des changements d'information, pas des effets flash.
4. **Fin bouclée** : la dernière image (carte Sources, puis ligne dorée) doit se raccorder visuellement à la première image pour encourager le replay. Pas de silence ni d'écran mort à la fin.
5. **Honnêteté** : le cold open doit être vrai et rester dans le reel (règle « aucune affirmation hors source »). Pas de clickbait : si le Verdict ne ferme pas la boucle, réécris le cold open.

**Compatibilité avec la charte.** Le ton reste documentaire, calme, sans flashs. Pour que le Cold open soit légitime, ajoute à `reels/STYLE-GUIDE.md` un addendum minimal (section 3, nouvelle ligne « Cold open 0 à 2 s » dans le tableau de structure ; durée totale toujours 45 à 60 s). C'est la seule modification de la charte autorisée. Le Hook de 3 à 10 s, l'outro et la palette restent inchangés. Le rythme lent s'applique après les 2 premières secondes.

**Test à faire sur chaque reel** : applique les 3 questions d'évaluation de `hook-anatomy` au cold open et écris les réponses dans `status.md` (« ouvre une boucle ? / peut-on scroller ? / payoff implicite ? »). Trois « oui » exigés avant le rendu final.

## Contrôle qualité (scripté, avec preuves)

Écris un script réutilisable, par exemple `scripts/qa-reel.sh`, qui s'appuie sur `ffprobe` et `ffmpeg`. Il vérifie :

- Durée entre 45 et 60 s.
- Format 1080x1920, 9:16, codec H.264 + AAC, 30 fps.
- Audio : loudness autour de -16 LUFS (`loudnorm`), pas de clipping, voix intelligible au-dessus de la musique.
- Sous-titres : chaque cue tombe dans la fenêtre de sa phrase dans `durations.json`, aucun chevauchement, zone de sécurité respectée.
- Cold open : extrais les frames 0, 15 et 30 (`ffmpeg -vf select`) et vérifie qu'elles ne sont pas noires (luminance moyenne via `signalstats`) et que du texte est visible dès la frame 0. Vérifie que le premier mot parlé démarre avant 0,3 s (`silencedetect` sur `narration.wav` / piste finale).
- Pas de fondu d'entrée vidéo ni audio dans les 2 premières secondes.
- Retour de boucle : la phrase ou le chiffre du cold open réapparaît dans le Verdict (`script.md`).
- Checklist pré-rendu du STYLE-GUIDE (section 10), point par point.

Le script écrit un rapport `qa-report.md` avec réussite ou échec par critère. Un échec bloque la livraison. Corrige, puis relance (3 itérations maximum, puis signale le blocage).

## Livrables par reel (dans `reels/NNN-slug/`)

- `renders/video.mp4` (final)
- `script.md`
- `narration.wav`
- `subtitles.srt` (génère-le depuis `durations.json` / `narration.json`)
- `description.md` (basé sur `reels/_template/description.md`) avec ces ajouts :
  - **Plateforme cible : Facebook Reels** (en plus des plateformes déjà prévues par le gabarit).
  - **Hashtags**, section obligatoire :
    - 1 hashtag principal de série : `#tuonslestéréotype`.
    - 4 à 5 hashtags fixes de la série : `#stéréotypes #préjugés #faitsvsmythes #culturegénérale`.
    - 3 à 5 hashtags spécifiques au sujet, courts et recherchés (ex. `#France #Français #hygiène`). Pas de hashtag inventé ni trompeur.
    - Total 8 à 12, aligné sur le STYLE-GUIDE. Ligne prête à copier-coller en fin de légende.
  - Titre, légende (hook en première ligne, faits issus de `source.json` uniquement, source, question de commentaire, ligne « Ensemble, tuons les stéréotypes. »), mots-clés, texte de couverture.
- `qa-report.md`
- `status.md` mis à jour, ligne ajoutée dans `reels/TRACKER.md`

## Apprentissage

Après chaque reel, ajoute dans `status.md` ce qui a marché ou non (hook, rythme, rendu). Si des statistiques de rétention sont fournies (courbe de rétention, taux de complétion, % de départ à 1 s), analyse-les avec `content-autopsy` et ajuste le cold open des reels suivants. Mets à jour `reels/BACKLOG.csv` (statut) et propose 3 prochains sujets avec accroche et verdict probable. Applique `content-autopsy` seulement quand des chiffres de performance sont fournis.

## Autonomie et limites

- Ne demande pas de validation entre les étapes. Prends les décisions techniques et créatives dans le cadre du STYLE-GUIDE.
- Privilégie les outils déjà présents. Aucun service payant, aucune clé API nouvelle sans mon accord.
- N'invente aucune capacité ni API. Si un outil manque, dis-le, propose l'alternative gratuite la plus proche et continue.
- **Ne publie rien** sur Facebook ni ailleurs sans mon autorisation explicite, donnée pour ce reel précis.
- Ne commite rien sans demande explicite.

## Définition de fini

Le Skill est livré quand : `SKILL.md` existe et référence les scripts réels ; l'audit est documenté ; un reel de test a été produit de bout en bout (idée -> MP4) avec `qa-report.md` entièrement vert ; `description.md` contient les hashtags ; le workflow est documenté dans `README.md`. Termine par un résumé court : ce qui a été testé, ce qui ne l'a pas été, les limitations.
