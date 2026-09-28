import { Button, Text } from '@/shared/ui/kit';
import { QuestionnaireItem } from './QuestionnaireItem';
import { t } from '@/i18n/ui';
import { localizePath, type TranslationKey } from '@/i18n/locales';
import './getting-started-page.css';

type Props = {
  /**
   * Which locale's copy to render. Each locale's `index.mdx` passes its own,
   * because this is a client island: it cannot read `Astro.currentLocale` the
   * way the `.astro` components do.
   */
  lang?: TranslationKey;
};

export default function GettingStartedPage({ lang = 'en' }: Props) {
  const products = [
    {
      title: 'Adaptive Data',
      description: t('homeAdaptiveDataDesc', lang),
      href: localizePath('/adaptive-data-quickstart', lang),
      image: '/getting-started/adapt-data.png',
    },
    {
      title: 'AutoScientist',
      description: t('homeAutoScientistDesc', lang),
      href: localizePath('/autoscientist-quickstart', lang),
      image: '/getting-started/autoscientist.png',
    },
  ];

  return (
    <div className="getting-started-page not-content stl-ui-not-prose flex w-full flex-col gap-[80px]">
      <section className="flex flex-col gap-[24px] max-w-[464px]">
        <div className="flex max-w-3xl flex-col gap-[8px]">
          <Text as="h1" variant="h1">
            {t('homeTitle', lang)}
          </Text>
          <Text variant="body" color="secondary">
            {t('homeIntro', lang)}
            <br />
            <br /> {t('homeIntroApi', lang)}
          </Text>
        </div>
        <Button asChild variant="black" size="44" className="self-start">
          <a href={localizePath('/introduction/getting-started', lang)}>
            {t('homeGettingStarted', lang)}
          </a>
        </Button>
      </section>

      <section className="flex flex-col gap-6">
        <Text variant="h2">{t('homeStartAdapting', lang)}</Text>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {products.map((product) => (
            <QuestionnaireItem
              key={product.title}
              title={product.title}
              description={product.description}
              image={product.image}
              href={product.href}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <Text variant="h2">{t('homeExploreReference', lang)}</Text>
        <div className="flex items-center justify-between gap-4 rounded-[24px] border-[0.5px] border-stroke-secondary bg-background-secondary p-4">
          <div className="flex flex-row items-center gap-4">
            <img
              className="size-20 shrink-0"
              src="/getting-started/reference.png"
              alt=""
            />
            <Text as="span" variant="h3">
              {t('homeReferenceCard', lang)}
            </Text>
          </div>
          <Button asChild variant="secondary" size="44">
            <a href="/api/python">{t('homeReadReference', lang)}</a>
          </Button>
        </div>
      </section>
    </div>
  );
}
