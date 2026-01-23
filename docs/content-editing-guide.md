# Content Editing Guide

This guide explains how to edit and add deck content to TCG Master Guide.

## Prerequisites

1. A GitHub account with access to the repository
2. [GitHub Desktop](https://desktop.github.com/) installed on your computer
3. A text editor (we recommend [VS Code](https://code.visualstudio.com/))

## Initial Setup (One Time Only)

### 1. Clone the Repository

1. Open GitHub Desktop
2. Click **File** → **Clone Repository**
3. Select the **URL** tab
4. Paste: `https://github.com/olivermking/tcgmasterguide.com`
5. Choose where to save it on your computer
6. Click **Clone**

## Editing Existing Deck Content

### 1. Get the Latest Changes

Before making any edits, always pull the latest changes:

1. Open GitHub Desktop
2. Make sure `tcgmasterguide.com` is selected as the current repository
3. Click **Fetch origin** at the top
4. If there are changes, click **Pull origin**

### 2. Open and Edit the File

1. In GitHub Desktop, click **Repository** → **Open in Visual Studio Code** (or your preferred editor)
2. Navigate to `content/decks/`
3. Open the `.md` file you want to edit (e.g., `grimmsnarl.md`)
4. Make your changes
5. Save the file (Ctrl+S or Cmd+S)

If you need to add images, see [Adding Images](#5-adding-images) below.

### 3. Create a Pull Request

1. Go back to GitHub Desktop
2. You'll see your changes listed on the left side
3. Click on the **Current Branch** dropdown at the top
4. Click **New Branch**
5. Name your branch (e.g., `update-grimmsnarl`) and click **Create Branch**
6. Bring your changes over (or make your changes to the code now)
7. At the bottom left, enter a summary of your changes (e.g., "Update Grimmsnarl matchup section")
8. Click **Commit to [your-branch-name]**
9. Click **Publish branch** at the top
10. Click **Create Pull Request**
11. This opens GitHub in your browser
12. Click **Create pull request**
13. Since you're a code owner for content, click **Merge pull request**
14. Click **Confirm merge**

### 4. Updating Local Main

After your PR is merged, you need to update your local main branch for next time:

1. In GitHub Desktop, switch back to the **main** branch
2. Click **Fetch origin**
3. Click **Pull origin** to get your merged changes

Your changes are now live! The site will automatically rebuild.

## Adding a New Deck

### 1. Create a New File

1. In your text editor, navigate to `content/decks/`
2. Create a new file with the deck name in lowercase, using hyphens for spaces
   - Example: `charizard-pidgeot.md` or `gholdengo.md`

### 2. Add the Required Metadata

Every deck file must start with metadata between `---` marks:

```markdown
---
title: "Deck Name Here"
pokemon: [25, 6]
tier: 1
---
```

**Metadata fields:**

| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | The display name of the deck (e.g., "Charizard / Pidgeot") |
| `pokemon` | Yes | Array of Pokédex numbers for the Pokemon representing the deck |
| `tier` | Yes | Tier ranking (1, 2, or 3). Tier 1 = top meta decks, Tier 2 = competitive, Tier 3 = viable |
| `lastEdited` | No | **Do not add this** - it's automatically generated |

### 3. Find Pokemon Numbers

The `pokemon` array uses National Pokédex numbers. You can find these at [pokemon.com/pokedex](https://www.pokemon.com/us/pokedex) or search "Pokemon [name] pokedex number".

Common examples:
- Charizard: 6
- Pikachu: 25
- Pidgeot: 18
- Grimmsnarl: 861
- Dragapult: 887
- Dusknoir: 477

### 4. Write the Deck Content

Write your deck guide using [Markdown](https://www.markdownguide.org/basic-syntax/).

### 5. Adding Images

To add images (like decklists):

1. Create a folder in `content/decks/images/` with your deck name (e.g., `my-new-deck/`)
2. Add your images to that folder
3. Reference them in your markdown as: `![Description](./images/my-new-deck/filename.png)`

### 6. Preview Your Markdown (Optional)

If you're doing something complex like adding images, you can preview your markdown in VS Code before committing:

1. Open your `.md` file in VS Code
2. Press **Ctrl+Shift+V** (Windows) or **Cmd+Shift+V** (Mac) to open the preview
3. Or click the **Preview** icon in the top right corner of the editor (it looks like a split screen with a magnifying glass)
4. The preview will show your formatted content side-by-side with your markdown

**Note:** Images with relative paths (like `./images/...`) won't display in the VS Code preview, but they will work correctly on the website.

### 7. Commit and Create Pull Request

Follow the same steps as editing (see "Create a Pull Request" above).

## Adding a Deck List

You can add an expandable, copyable deck list to any deck guide using the special `decklist` code block:

````markdown
```decklist
Pokémon: 18
4 Absol SV10 94
2 Mega Kangaskhan ex SV10 89
2 Kangaskhan SV10 88
...

Trainer: 32
4 Arven SV3 166
3 Iono SV2 80
...

Energy: 10
5 Darkness Energy SVE 7
3 Mist Energy SV9 161
...
```
````

This will render as a collapsible "Deck List" button. When expanded, it shows the full list with a **Copy** button that copies the entire decklist to the clipboard.

## Embedding YouTube Videos

You can embed YouTube videos in your deck guides using the special `youtube` code block:

````markdown
```youtube
id: dQw4w9WgXcQ
title: Example Video Title
```
````

**Fields:**

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | The YouTube video ID (the part after `v=` in the URL) |
| `title` | No | Accessible title for the video (defaults to "YouTube video") |

**Finding the video ID:**

From a YouTube URL like `https://www.youtube.com/watch?v=dQw4w9WgXcQ`, the video ID is `dQw4w9WgXcQ` (everything after `v=`).

This will render as a responsive, embedded YouTube player with rounded corners that matches the site's design.

## Embedding Twitch Videos

You can embed Twitch VODs (past broadcasts) in your deck guides using the special `twitch` code block:

````markdown
```twitch
id: 2675808573
title: Charizard / Noctowl vs Gholdengo
```
````

**Fields:**

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | The Twitch video ID (the number at the end of the VOD URL) |
| `title` | No | Accessible title for the video (defaults to "Twitch video") |

**Finding the video ID:**

From a Twitch VOD URL like `https://www.twitch.tv/videos/2675808573`, the video ID is `2675808573` (the number after `/videos/`).

This will render as a responsive, embedded Twitch player with rounded corners that matches the site's design.

## Markdown Quick Reference

| What you type | What you get |
|--------------|--------------|
| `## Heading` | Section heading |
| `### Subheading` | Subsection heading |
| `**bold text**` | **bold text** |
| `*italic text*` | *italic text* |
| `- item` | Bullet point |
| `1. item` | Numbered list |
| `[link text](url)` | Clickable link |
| `![alt text](image.png)` | Image |
| ` ```decklist ` | Expandable deck list (see above) |
| ` ```youtube ` | Embedded YouTube video (see above) |
| ` ```twitch ` | Embedded Twitch VOD (see above) |

## Need Help?

If you run into issues, reach out to Oliver for technical help.
