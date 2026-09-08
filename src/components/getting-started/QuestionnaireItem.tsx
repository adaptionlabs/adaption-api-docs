import { Button, Text } from '@/shared/ui/kit';

type QuestionnaireItemProps = {
  title: string;
  description: string;
  image: string;
  imageAlt?: string;
  href: string;
};

export function QuestionnaireItem({
  title,
  description,
  image,
  imageAlt = '',
  href,
}: QuestionnaireItemProps) {
  return (
    <div
      className={
        'flex h-full flex-col gap-8 rounded-[24px] border-[0.5px] border-stroke-secondary bg-background-secondary p-8'
      }
    >
      <img
        className="mx-auto h-[260px] max-h-[260px] w-full max-w-full object-contain"
        src={image}
        alt={imageAlt}
      />
      <div className="flex flex-col gap-[24px]">
        <div className="flex flex-col gap-[8px]">
          <Text variant="h3">{title}</Text>
          <Text color="secondary" className="line-clamp-2 min-h-[2.4em]">
            {description}
          </Text>
        </div>
        <Button
          asChild
          variant="secondary"
          size="44"
          className="mt-auto self-start"
        >
          <a href={href}>Quick start</a>
        </Button>
      </div>
    </div>
  );
}
