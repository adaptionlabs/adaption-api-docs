/**
 * Strings that live in this repo's own components rather than in a content
 * file. Starlight ships translations for its built-in chrome (search, "On this
 * page", pagination arrows, the 404) in
 * `@astrojs/starlight/translations/{ar,es,ja,pt,zh-CN}.json`, so only what we
 * wrote ourselves needs a table here.
 *
 * Indexed by the short keys from `locales.ts` (`en`, `zh`, `ja`, `pt`, `es`,
 * `ar`), not by BCP-47 tags — use `toTranslationKey()` to get one.
 */
import type { TranslationKey } from "./locales";

type Table = Record<TranslationKey, string>;

export const UI = {
  /** PageTitle: the link out to the source file on GitHub. */
  editOnGitHub: {
    en: "Edit on GitHub",
    zh: "在 GitHub 上编辑",
    ja: "GitHub で編集",
    pt: "Editar no GitHub",
    es: "Editar en GitHub",
    ar: "التعديل على GitHub",
  },

  /** Landing page (`index.mdx` -> GettingStartedPage). */
  homeTitle: {
    en: "Adaption documentation",
    zh: "Adaption 文档",
    ja: "Adaption ドキュメント",
    pt: "Documentação da Adaption",
    es: "Documentación de Adaption",
    ar: "توثيق Adaption",
  },
  homeIntro: {
    en: "Adaption is a platform that brings data-optimization and training techniques, typically reserved for frontier labs, to everyday teams.",
    zh: "Adaption 是一个平台，把通常只有前沿实验室才用得上的数据优化与训练技术，带给日常团队。",
    ja: "Adaption は、通常はフロンティアラボに限られているデータ最適化と学習の技術を、日常的なチームにも届けるプラットフォームです。",
    pt: "A Adaption é uma plataforma que leva técnicas de otimização de dados e de treinamento, normalmente restritas a laboratórios de fronteira, para equipes do dia a dia.",
    es: "Adaption es una plataforma que acerca a los equipos de cada día las técnicas de optimización de datos y entrenamiento que suelen quedar reservadas a los laboratorios de frontera.",
    ar: "‏Adaption منصّة تُتيح للفرق اليومية تقنيات تحسين البيانات والتدريب التي عادةً ما تقتصر على المختبرات الرائدة.",
  },
  homeIntroApi: {
    en: "Both Adaptive Data and AutoScientist are accessible through our API today.",
    zh: "Adaptive Data 和 AutoScientist 现在都可以通过我们的 API 使用。",
    ja: "Adaptive Data と AutoScientist は、どちらも現在 API から利用できます。",
    pt: "Tanto o Adaptive Data quanto o AutoScientist já estão acessíveis pela nossa API.",
    es: "Tanto Adaptive Data como AutoScientist ya están disponibles a través de nuestra API.",
    ar: "كلٌّ من Adaptive Data وAutoScientist متاح اليوم عبر واجهة برمجة التطبيقات الخاصة بنا.",
  },
  homeGettingStarted: {
    en: "Getting started",
    zh: "快速上手",
    ja: "はじめる",
    pt: "Primeiros passos",
    es: "Primeros pasos",
    ar: "البداية",
  },
  homeStartAdapting: {
    en: "Start adapting",
    zh: "开始适配",
    ja: "アダプトを始める",
    pt: "Comece a adaptar",
    es: "Empieza a adaptar",
    ar: "ابدأ التكييف",
  },
  homeExploreReference: {
    en: "Explore reference",
    zh: "浏览参考文档",
    ja: "リファレンスを見る",
    pt: "Explorar a referência",
    es: "Explorar la referencia",
    ar: "استكشف المرجع",
  },
  homeReferenceCard: {
    en: "API & SDK reference",
    zh: "API 与 SDK 参考",
    ja: "API / SDK リファレンス",
    pt: "Referência da API e do SDK",
    es: "Referencia de la API y el SDK",
    ar: "مرجع واجهة برمجة التطبيقات وحزمة SDK",
  },
  homeReadReference: {
    en: "Read reference",
    zh: "阅读参考文档",
    ja: "リファレンスを読む",
    pt: "Ler a referência",
    es: "Leer la referencia",
    ar: "اقرأ المرجع",
  },

  /** The two product cards on the landing page. */
  homeAdaptiveDataDesc: {
    en: "Analyzes your data's structure and learns how to adapt and optimize it.",
    zh: "分析你的数据结构，并学会如何对其进行适配与优化。",
    ja: "データの構造を分析し、それをどう適応・最適化するかを学習します。",
    pt: "Analisa a estrutura dos seus dados e aprende a adaptá-los e otimizá-los.",
    es: "Analiza la estructura de tus datos y aprende a adaptarlos y optimizarlos.",
    ar: "يحلّل بنية بياناتك ويتعلّم كيفية تكييفها وتحسينها.",
  },
  homeAutoScientistDesc: {
    en: "Co-optimizes your data and model training recipe automatically",
    zh: "自动协同优化你的数据与模型训练配方",
    ja: "データとモデルの学習レシピを自動で同時に最適化します",
    pt: "Otimiza em conjunto, e automaticamente, seus dados e a receita de treinamento do modelo",
    es: "Optimiza de forma conjunta y automática tus datos y la receta de entrenamiento del modelo",
    ar: "يُحسِّن بياناتك ووصفة تدريب النموذج معًا وبشكل تلقائي",
  },

  /**
   * Shown on a translated page whose English source has since moved ahead.
   * Not wired to anything yet; see README "Translations".
   */
  translationNotice: {
    en: "",
    zh: "本页为英文文档的翻译版本，可能不是最新内容。",
    ja: "このページは英語版の翻訳です。最新の内容と異なる場合があります。",
    pt: "Esta página é uma tradução da versão em inglês e pode estar desatualizada.",
    es: "Esta página es una traducción de la versión en inglés y puede estar desactualizada.",
    ar: "هذه الصفحة ترجمة للنسخة الإنجليزية وقد لا تكون محدَّثة.",
  },
} satisfies Record<string, Table>;

export type UIKey = keyof typeof UI;

/** `t("editOnGitHub", "ja")` -> `"GitHub で編集"`. Falls back to English. */
export function t(key: UIKey, lang: TranslationKey): string {
  return UI[key][lang] || UI[key].en;
}
