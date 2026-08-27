import { cn } from '@/lib/utils';
import Reveal from '../motion/Reveal';
import Eyebrow from './Eyebrow';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtext?: string;
  /** 'center' (default) or 'left' — left aligns with an editorial feel (plan §72: avoid every section centered). */
  align?: 'center' | 'left';
  className?: string;
  eyebrowClassName?: string;
  as?: 'h2' | 'h3';
}

export default function SectionHeading({
  eyebrow,
  title,
  subtext,
  align = 'center',
  className,
  eyebrowClassName,
  as: Heading = 'h2',
}: SectionHeadingProps) {
  const centered = align === 'center';

  return (
    <Reveal
      className={cn(
        'max-w-3xl mb-12 md:mb-16',
        centered ? 'text-center mx-auto' : 'text-left',
        className
      )}
    >
      {eyebrow && (
        <Eyebrow className={cn('text-ec-teal mb-4', eyebrowClassName)}>{eyebrow}</Eyebrow>
      )}
      <Heading
        className={cn(
          'type-heading-l text-ec-ink dark:text-white text-balance',
          centered && 'mx-auto'
        )}
      >
        {title}
      </Heading>
      {subtext && (
        <p
          className={cn(
            'mt-4 type-body-m text-ec-slate text-pretty max-w-2xl',
            centered && 'mx-auto'
          )}
        >
          {subtext}
        </p>
      )}
    </Reveal>
  );
}
