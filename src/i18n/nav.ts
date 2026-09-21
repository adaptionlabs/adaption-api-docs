/**
 * Translations for chrome that lives in `astro.config.ts` rather than in a
 * content file: sidebar group labels and social links.
 *
 * Starlight keys sidebar `translations` by the locale's BCP-47 `lang`, not by
 * its URL prefix, so these maps use `zh-CN` / `pt-BR`. English is not listed —
 * it is the `label` on the entry itself.
 *
 * Only Starlight may read these. Anything this repo renders itself belongs in
 * `ui.ts`, which is keyed by locale short code and typed per locale: mixing
 * the two schemes is what once left `/zh` and `/pt` with blank header
 * buttons.
 *
 * Product names (Adaption, Adaptive Data, AutoScientist, Blueprint, Forge) are
 * deliberately left in English in every language: they are proper nouns in the
 * app UI and the API, and translating them would send readers looking for a
 * control that does not exist.
 */

type Translated = Record<string, string>;

export const SIDEBAR_GROUPS = {
  introduction: {
    "zh-CN": "简介",
    ja: "はじめに",
    "pt-BR": "Introdução",
    es: "Introducción",
    ar: "مقدمة",
  },
  adaptiveData: {
    "zh-CN": "Adaptive Data",
    ja: "Adaptive Data",
    "pt-BR": "Adaptive Data",
    es: "Adaptive Data",
    ar: "Adaptive Data",
  },
  autoscientist: {
    "zh-CN": "AutoScientist",
    ja: "AutoScientist",
    "pt-BR": "AutoScientist",
    es: "AutoScientist",
    ar: "AutoScientist",
  },
  tutorials: {
    "zh-CN": "教程",
    ja: "チュートリアル",
    "pt-BR": "Tutoriais",
    es: "Tutoriales",
    ar: "الدروس التعليمية",
  },
  resources: {
    "zh-CN": "资源",
    ja: "リソース",
    "pt-BR": "Recursos",
    es: "Recursos",
    ar: "الموارد",
  },
  reference: {
    "zh-CN": "参考",
    ja: "リファレンス",
    "pt-BR": "Referência",
    es: "Referencia",
    ar: "المرجع",
  },
} satisfies Record<string, Translated>;

export const SIDEBAR_LINKS = {
  discord: {
    "zh-CN": "加入 Discord",
    ja: "Discord に参加",
    "pt-BR": "Entrar no Discord",
    es: "Únete a Discord",
    ar: "انضم إلى Discord",
  },
  x: {
    "zh-CN": "在 X 上关注",
    ja: "X でフォロー",
    "pt-BR": "Seguir no X",
    es: "Síguenos en X",
    ar: "تابعنا على X",
  },
  linkedin: {
    "zh-CN": "LinkedIn",
    ja: "LinkedIn",
    "pt-BR": "LinkedIn",
    es: "LinkedIn",
    ar: "LinkedIn",
  },
  blog: {
    "zh-CN": "博客",
    ja: "ブログ",
    "pt-BR": "Blog",
    es: "Blog",
    ar: "المدونة",
  },
} satisfies Record<string, Translated>;
