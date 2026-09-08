import { Button, Text } from '@/shared/ui/kit';
import { QuestionnaireItem } from './QuestionnaireItem';
import './getting-started-page.css';

const products = [
  {
    title: 'Adaptive Data',
    description:
      "Analyzes your data's structure and learns how to adapt and optimize it.",
    href: '/adaptive-data-quickstart',
    image: '/getting-started/adapt-data.png',
  },
  {
    title: 'AutoScientist',
    description:
      'Co-optimizes your data and model training recipe automatically',
    href: '/autoscientist-quickstart',
    image: '/getting-started/autoscientist.png',
  },
];

export default function GettingStartedPage() {
  return (
    <div className="getting-started-page not-content stl-ui-not-prose flex w-full flex-col gap-[80px]">
      <section className="flex flex-col gap-[24px] max-w-[464px]">
        <div className="flex max-w-3xl flex-col gap-[8px]">
          <Text as="h1" variant="h1">
            Adaption documentation
          </Text>
          <Text variant="body" color="secondary">
            Adaption is a platform that brings data-optimization and training
            techniques, typically reserved for frontier labs, to everyday teams.{' '}
            <br />
            <br /> Both Adaptive Data and AutoScientist are accessible through
            our API today.
          </Text>
        </div>
        <Button asChild variant="black" size="44" className="self-start">
          <a href="/introduction/getting-started">Getting started</a>
        </Button>
      </section>

      <section className="flex flex-col gap-6">
        <Text variant="h2">Start adapting</Text>
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
        <Text variant="h2">Explore reference</Text>
        <div className="flex items-center justify-between gap-4 rounded-[24px] border-[0.5px] border-stroke-secondary bg-background-secondary p-4">
          <div className="flex flex-row items-center gap-4">
            <img
              className="size-20 shrink-0"
              src="/getting-started/reference.png"
              alt=""
            />
            <Text as="span" variant="h3">
              API &amp; SDK reference
            </Text>
          </div>
          <Button asChild variant="secondary" size="44">
            <a href="/api/python">Read reference</a>
          </Button>
        </div>
      </section>
    </div>
  );
}
