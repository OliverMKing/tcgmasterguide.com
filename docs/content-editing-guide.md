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
3. At the bottom left, enter a summary of your changes (e.g., "Update Grimmsnarl matchup section")
4. Click **Commit to main**
5. Click **Push origin** at the top
6. Click **Create Pull Request**
7. This opens GitHub in your browser
8. Click **Create pull request**
9. Since you're a code owner for content, click **Merge pull request**
10. Click **Confirm merge**

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
---
```

**Metadata fields:**

| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | The display name of the deck (e.g., "Charizard / Pidgeot") |
| `pokemon` | Yes | Array of Pokédex numbers for the Pokemon representing the deck |
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

## Need Help?

If you run into issues, reach out to Oliver for technical help.
