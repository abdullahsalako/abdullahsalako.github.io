---
title: How I'd Use DaVinci Resolve 21's AI Face Tools Without Losing the Skin
slug: davinci-resolve-21-ai-face-tools
status: draft
date: 2026-10-05
tag: AI Tools
seoTitle: "DaVinci Resolve 21 AI Face Tools: A Colourist's Guide"
description: How I fold DaVinci Resolve 21's AI Blemish Removal, Face Reshaper and CineFocus into a skin-tone node tree without losing texture.
section: ''
dek: Where the new face tools belong in the node tree, and where to stop
excerpt: ''
cover: ''
coverPosition: ''
footnote: See how I approach skin on a finished piece in the [Red Eye Effect colour study](https://aderemisalako.me/work/red-eye-effect/), or read about my [colour grading services](https://aderemisalako.me/services#colour-grading).
readTime: ''
sourceUrl: ''
updated: ''
---

DaVinci Resolve 21 added a set of AI tools aimed squarely at faces: Blemish Removal, Face Reshaper, Face Age Transformer and CineFocus, a synthetic depth-of-field effect. They are impressive in a demo. On a real grade, they are also the fastest way I know to make a person stop looking like themselves.

So this isn't a tour of every new feature. It's how I'd fold the face tools into an existing skin-tone node tree, where each one belongs, and where I'd stop.

## What you need first

All of the new AI tools in Resolve 21 sit in the Studio version, the one-time $295 licence, not the free version. They run on Resolve's Neural Engine on your own machine, so your GPU matters more here than anywhere else in the app. At 4K, VRAM is usually what runs out first.

They are applied as Resolve FX on the Color page, which means they live on nodes like everything else. That's the important part. You don't have to treat them as a separate step. You treat them as nodes with a job, and you decide where in the tree that job happens.

## Where each tool sits in the tree

My base tree for faces is four nodes: primary exposure balance, the LOG transform into a working colour space, a parallel HSL node isolating skin, and a soft grain overlay at the end. I wrote about it in detail [here](https://aderemisalako.me/blog/node-workflow/).

The AI tools slot in between the colour work and the grain:

1. **Exposure balance**
2. **LOG transform**
3. **Parallel HSL skin isolation**
4. **Face Reshaper** (only if it's needed)
5. **Blemish Removal**
6. **CineFocus**
7. **Grain**

The reasoning is simple. Colour decisions should be made on the real face, before anything is moved or smoothed. And grain has to come last. Both Blemish Removal and CineFocus soften the image in their own way, and if grain sits before them, they eat it. Put grain at the end and it lays an even texture over everything, which is exactly what sells a retouched face as untouched.

## Blemish Removal: one slider, used lightly

Blemish Removal has essentially one control: **Strength**. That simplicity is the trap. It's tempting to push it until the skin looks clean, and by then it's gone past clean into plastic.

What I look for instead:

- **Pores survive.** If I zoom to 200% on a cheek and can't see texture, it's too strong.
- **Highlights keep their shape.** A forehead sheen should still have a gradient, not a flat patch.
- **It holds in motion.** Play the shot. Something that looks fine on a still can shimmer once the head turns.
- **It matches the shots around it.** A retouched close-up next to an untouched wide reads as two different people.

> Retouching is only finished when nobody can tell where it started.

My rule is to find the strength where the blemish disappears, then back off. If a single mark survives at that lower setting, I'd rather deal with it on its own than raise the effect across the whole face.

On a personal portrait last month, there was one spot on the cheek, right where the light fell. I raised Strength until it vanished, which was around the halfway mark. By then the skin around it had gone flat, and the highlight on that cheek had lost its gradient. I backed off to roughly a third of the way up. The spot was faint but still there, so I masked the node to that one area and left the rest of the face untouched. That's the version where I could zoom to 200% and still see pores.

## Face Reshaper: the tool I'd use least

Face Reshaper tracks the face for you. There's a **Detect Faces in Frame** button and the usual **Track Forward** and **Track Reverse** controls, then sliders for face shape, eyes, mouth and eyebrows: size, width, position, chin, jaw, even smile.

It works. That's the problem. Small changes to someone's jaw or eyes are noticed by the person themselves before anyone else, and they're rarely noticed kindly. I'd only reach for it with the subject's or client's clear approval, and only to correct something the lens did, such as wide-angle distortion on a close-up, not to change what a person looks like.

If you do use it:

- Turn on **Show Overlay** and check the track on every shot, not just the first.
- Test profiles and expressions. A face turning away or laughing is where reshaping breaks.
- Keep every move small enough that you'd have to toggle the node to see it.

The same applies, more strongly, to Face Age Transformer. It has real uses in narrative work. In a portrait or a brand film, I'd leave it alone.

## CineFocus: depth after the fact

CineFocus builds a depth map from the image and lets you set **Focus Distance**, **Aperture Size** and **Depth of Field** after the shot is done. **Track Focus to Point** lets the focus follow a subject, and **Focus Peaking** shows you what's sharp.

Two settings matter more than the rest for faces:

- **Remove Grain** and **Replace Grain After Defocus.** Blurring a grainy image smears the grain into mush. CineFocus can strip it first and put it back after, which keeps the background from looking painted.
- **The depth map edges.** Hair, glasses and shoulders are where synthetic depth gives itself away. Check those edges at full resolution before you commit.

Used gently, it's a good rescue for a talking head shot at f/8 against a busy wall. Used heavily, it looks like a phone's portrait mode, and viewers know that look now.

## Keep it fast

These nodes are heavy. Once a node is settled, right-click it and turn on the node cache so playback doesn't fight you. If the timeline still struggles, I work on the colour with the AI nodes disabled and switch them back on for review.

## The short version

The colour still does the real work. The AI tools come after it, each on its own node, each turned down further than feels necessary, with grain laid over the top to tie it together. If you can't tell the node is on, it's probably set right.
