# Skim Tool

The Skim Tool in effect looks like this:

<img src="assets/demo.png" width="600">

It is a browser extension that modulates text opacity to highlight only semantically important words in HTML web pages. It uses a local BERT-style (RoBERTa) model, so no "AI-summarization" crap. The content is there, it just becomes easier to skim.

## Installation (Firefox)
1. Open Firefox and navigate to about:debugging#/runtime/this-firefox.
2. Click "Load Temporary Add-on".
3. Select manifest.json in the Skim Tool folder.
4. The Skim Tool icon appears in the toolbar.

## Run the Scoring Server
- `pip install flask flask-cors torch transformers`
- `python source/server.py`
- Keep it running while using the extension.

## Usage
1. Open a text-heavy web page.
2. Click the Skim Tool toolbar icon.
3. In the popup:
   - Set Mode to "server" for BERT-based highlights. Heuristic mode does NOT require a server, it uses simple/silly text heuristics, so it is not very good.
   - Click "Apply" to highlight text.
4. Click "Clear" to remove highlights.

## TODOs
I would be happy to review pull requests, but you may also fork the repo and publish an improved version yourself. 
1. Support PDF files.
2. Support Chrome and Chromium-based browsers.

## Disclaimer
This extension was vibe-coded since I am not proficient in JavaScript. But since AI output is not trustworthy, please use this (and other browser extensions) with caution.

All credits to the following paper and the relevant talk by Prof. Kummerfeld at UMD:

Gu, Ziwei, Ian Arawjo, Kenneth Li, Jonathan K. Kummerfeld, and Elena L. Glassman. "An AI-resilient text rendering technique for reading and skimming documents." In Proceedings of the 2024 CHI Conference on Human Factors in Computing Systems, pp. 1-22. 2024.

Here is the paper's [code](https://github.com/ZiweiGu/GP-TSM?tab=readme-ov-file). The authors used GPT so their results are better in terms of readability, but their live demo was not available when I tried it.
