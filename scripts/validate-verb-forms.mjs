#!/usr/bin/env node
// Content-integrity check for src/data/{n5,n4}/verb-forms.json, mirroring
// validate-grammar.mjs's role for grammar data. VerbForms.tsx renders every
// *Ruby field via <Ruby text html> which -- per handoff.md -- ignores
// `text` entirely whenever `html` is set. That means a typo'd or
// out-of-sync *Ruby field is invisible to tsc/oxlint and silently wins over
// the correct plain-text field at render time. This script strips every
// <ruby>/<rt>/<rp> annotation back down to plain text and asserts it
// exactly equals the sibling plain field, for every field pair in both
// data files.
import fs from "node:fs"

function stripRuby(html) {
  return html.replace(/<rp>.*?<\/rp>/g, "").replace(/<rt>.*?<\/rt>/g, "").replace(/<\/?ruby>/g, "")
}

function checkPair(plain, ruby, path, errors) {
  if (ruby === undefined || ruby === null || plain === undefined || plain === null) return
  const stripped = stripRuby(ruby)
  if (stripped !== plain) errors.push(`${path}: ruby-stripped "${stripped}" !== plain "${plain}"`)
}

// {vi,en} plain field vs. {vi,en} ruby field.
function checkBilingual(plainObj, rubyObj, path, errors) {
  if (!plainObj || !rubyObj) return
  for (const lang of ["vi", "en"]) {
    if (plainObj[lang] && rubyObj[lang]) checkPair(plainObj[lang], rubyObj[lang], `${path}.${lang}`, errors)
  }
}

function checkForm(form, path, errors) {
  checkPair(form.titleJa, form.titleJaRuby, `${path}.titleJa`, errors)
  for (const [i, r] of form.rules.entries()) {
    checkBilingual(r.rule, r.ruleRuby, `${path}.rules[${i}].rule`, errors)
    checkBilingual(r.note, r.noteRuby, `${path}.rules[${i}].note`, errors)
  }
  for (const [i, e] of (form.group1Endings || []).entries()) {
    checkPair(e.endings, e.endingsRuby, `${path}.group1Endings[${i}].endings`, errors)
    checkPair(e.result, e.resultRuby, `${path}.group1Endings[${i}].result`, errors)
    checkPair(e.example, e.exampleRuby, `${path}.group1Endings[${i}].example`, errors)
  }
  for (const [i, e] of form.examples.entries()) {
    checkPair(e.masu, e.masuRuby, `${path}.examples[${i}].masu`, errors)
    checkPair(e.result, e.resultRuby, `${path}.examples[${i}].result`, errors)
    if (e.resultNeg) checkPair(e.resultNeg, e.resultNegRuby, `${path}.examples[${i}].resultNeg`, errors)
  }
  for (const [i, s] of form.sentenceExamples.entries()) {
    checkPair(s.ja, s.jaRuby, `${path}.sentenceExamples[${i}].ja`, errors)
  }
  for (const [i, exc] of form.exceptions.entries()) {
    checkBilingual(exc, form.exceptionsRuby?.[i], `${path}.exceptions[${i}]`, errors)
  }
}

function checkTable(cheatSheet, path, errors) {
  if (!cheatSheet) return
  for (const [i, row] of cheatSheet.rows.entries()) {
    for (const [j, cell] of row.entries()) {
      checkBilingual(cell, cheatSheet.rowsRuby?.[i]?.[j], `${path}.rows[${i}][${j}]`, errors)
    }
  }
}

const errors = []

const n5 = JSON.parse(fs.readFileSync("src/data/n5/verb-forms.json", "utf8"))
for (const [i, g] of n5.groups.entries()) {
  for (const [j, s] of g.sample.entries()) checkPair(s.masu, s.masuRuby, `n5.groups[${i}].sample[${j}].masu`, errors)
}
for (const [i, f] of n5.forms.entries()) checkForm(f, `n5.forms[${i}](${f.id})`, errors)
checkTable(n5.cheatSheet, "n5.cheatSheet", errors)
for (const [i, exc] of n5.keyExceptions.entries()) checkBilingual(exc, n5.keyExceptionsRuby?.[i], `n5.keyExceptions[${i}]`, errors)

const n4 = JSON.parse(fs.readFileSync("src/data/n4/verb-forms.json", "utf8"))
for (const [i, f] of n4.forms.entries()) checkForm(f, `n4.forms[${i}](${f.id})`, errors)
checkTable(n4.cheatSheet, "n4.cheatSheet", errors)
for (const [i, exc] of (n4.keyExceptions || []).entries()) checkBilingual(exc, n4.keyExceptionsRuby?.[i], `n4.keyExceptions[${i}]`, errors)

// n4/verb-forms.json's form ids should never collide with n5's (they're
// concatenated together for the "all" level in the getVerbForms selector).
const n5Ids = new Set(n5.forms.map(f => f.id))
for (const f of n4.forms) {
  if (n5Ids.has(f.id)) errors.push(`n4 form id "${f.id}" collides with an n5 form id`)
}

if (errors.length) {
  console.error(`${errors.length} verb-forms validation error(s):`)
  for (const e of errors) console.error(" - " + e)
  process.exit(1)
}
console.log(`OK -- n5: ${n5.forms.length} forms, n4: ${n4.forms.length} forms. Every *Ruby field matches its plain-text sibling.`)
