# Alliander node.js package template

Dit template kan als basis worden gebruikt voor het aanmaken van een nieuwe Alliander package. Bij het aanmaken van een nieuw project in Github kun je dit project als template kiezen.

## Features

- Package naamgeving met @alliander namespace
- Typescript:
  - bronbestanden in `src/` worden gecompileerd naar `dist/`
- ESlint voor linting
- Prettier voor formatting
- Jest unit-test setup
- Settings voor Visual Studio Code:
  - Automatisch formatten bij het opslaan van een bestand
  - Run en debug configuration voor het runnen van unit-tests
- Github Actions
  - automatische test en check of versie is verhoogd bij aanmaken (en commits op) een Pull Request
  - automatische publish naar de Alliander Github Package repository bij mergen van een Pull Request naar de master-branch

## Aanbevolen VS code extensions

Voor de beste ontwikkel-ervaring installeer je de volgende plugins in Visual Studio Code:

- Prettier (esbenp.prettier-vscode)
- ESLint (dbaeumer.vscode-eslint)
- Jest (orta.vscode-jest)
- Markdown All in One (yzhang.markdown-all-in-one)

## Automatisch formatten

Wellicht dat automatisch formatten out-of-the-box met prettier nog niet lekker werkt. Probeer eens dit:

- Rechtermuisklik op een stuk code
- Kies "Format Document With..."
- Kies "Configure Default Formatter..."
- Kies "Prettier - code formatter" als default formatter

Je kunt ook je code automatisch laten _fixen_ door ESLint. Het verschil tussen formatten en fixen is dat formatten alleen gaat over de opmaak van je code, maar het fixen daadwerkelijk je syntax wijzigt.

Voor het auto-fixen met ESLint voeg je dit toe aan `.vscode/settings.json`:

```
"editor.codeActionsOnSave": {
  "source.fixAll.eslint": true
}
```

## Simpeler alternatief

Mocht je een simpele variant van deze template willen bekijken (zonder typescript, eslint en prettier), [kijk dan in deze branch](https://github.com/Alliander/template-node-package/tree/simple) voor een voorbeeld. Deze variant kun je bijvoorbeeld gebruiken wanneer je een nieuwe package op bestaande code baseert (en je het dus niet nodig acht om typescript te gebruiken).

Let wel, het grote voordeel van typescript is dat je automatisch **typings** genereert in je package. De gebruiker van je package zal je er dankbaar voor zijn! (Je kunt overigens ook handmatig typings toevoegen, zie de [typescript docs](https://www.typescriptlang.org/) voor meer informatie.)

## Stappen na aanmaken project

- Vervang in de `package.json` `template-node-package` met de gekozen repository-naam.
- Maak de master-branch 'protected' en dwing af dat de `build-and-test` 'status check' moet slagen vóórdat een PR gemerged mag worden (hiervoor moet de test wel één keer hebben gedraaid, dus eerst een PR aanmaken)

# Best practice: 'exports' property

In `package.json` wordt de `exports` property gebruikt om standaard alléén de index.js file te exposen. Alle andere bestanden kunnen daarmee niet worden ge-required (in recente node.js versies).

```
  // package.json
  "main": "dist/index.js",
  "exports": "./dist/index.js",
```

Dit kun je daarmee dus niet meer doen:

```
require('@alliander/voorbeeld-package/dist/otherFile.js')
```

Het voordeel hiervan is dat je als package-ontwikkelaar zeker weet dat dat soort 'interne' bestanden veilig
aangepast kunnen worden zonder dat andere applicaties daar gebruik van maken.

## Ontwikkel-tip: gebruik `npm link`

Met `npm link` kun je makkelijk ontwikkelen aan een package terwijl je deze in een project gebruikt om te testen. De wijzigingen worden direct doorgevoerd in de dependency van het project. Zie ook [dit artikel](https://medium.com/@alexishevia/the-magic-behind-npm-link-d94dcb3a81af) voor een uitleg.

## FAQ

### Wat zijn die `ALL_PACKAGE_TOKEN` en `GITHUB_TOKEN` secrets in de `.github/workflows` files?

GITHUB_TOKEN is een secret dat standaard beschikbaar is binnen Github actions, maar heeft als scope alleen de repository zelf. Om van andere @alliander packages gebruik te maken in je dependencies moet je de `ALL_PACKAGE_TOKEN` gebruiken. Standaard kun je namelijk niet bij packages die buiten deze repository staan. `ALL_PACKAGE_TOKEN` is ingesteld op ons organisatie-niveau en heeft als scope de hele organisatie.
