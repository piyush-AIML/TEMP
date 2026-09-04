import { Download, FileText, Link2, MessageSquareText, StickyNote, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { formatBytes, formatShortDate } from '@/lib/dashboard/format';
import type { MaterialDTO } from '@/lib/dashboard/materials';

/**
 * Read-only materials & remarks feed for one course (Stage 1, FILE rows
 * Stage 2). FILE rows carry a short-lived signed download URL resolved
 * server-side (downloadUrl) with honest copy when it is unavailable.
 * Literal type→label/icon map; one neutral chip style throughout.
 */
const TYPE_META: Record<MaterialDTO['type'], { label: string; icon: LucideIcon }> = {
  NOTE: { label: 'Note', icon: StickyNote },
  REMARK: { label: 'Remark', icon: MessageSquareText },
  FILE: { label: 'File', icon: FileText },
  LINK: { label: 'Link', icon: Link2 },
};

export function MaterialFeed({ materials }: { materials: MaterialDTO[] }) {
  return (
    <ol className='divide-y divide-ec-sky dark:divide-ec-canvas-deep'>
      {materials.map((material) => {
        const meta = TYPE_META[material.type];
        const Icon = meta.icon;
        return (
          <li key={material.id} className='py-5 first:pt-0 last:pb-0'>
            <div className='flex items-start gap-3'>
              <div className='mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-ec-sky text-ec-indigo dark:bg-ec-canvas-deep dark:text-white'>
                <Icon className='size-4' aria-hidden='true' />
              </div>
              <div className='min-w-0 flex-1'>
                <div className='flex flex-wrap items-center gap-x-2 gap-y-1'>
                  <span className='rounded-full bg-ec-sky/70 px-2.5 py-0.5 text-[11px] font-semibold text-ec-indigo dark:bg-ec-canvas-deep dark:text-white'>
                    {meta.label}
                  </span>
                  <p className='font-semibold leading-snug'>{material.title}</p>
                </div>

                {material.body && (
                  <p className='mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/75'>
                    {material.body}
                  </p>
                )}

                {material.type === 'LINK' && material.fileUrl && (
                  <MaterialLink url={material.fileUrl} title={material.title} />
                )}

                {material.type === 'FILE' && material.fileMeta && material.downloadUrl && (
                  <a
                    href={material.downloadUrl}
                    download
                    className='mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-ec-indigo underline-offset-2 hover:underline dark:text-white'
                  >
                    <Download className='size-3.5' aria-hidden='true' />
                    Download {material.fileMeta.name} · {formatBytes(material.fileMeta.size)}
                  </a>
                )}
                {material.type === 'FILE' && material.fileMeta && !material.downloadUrl && (
                  <p className='mt-2 text-xs text-foreground/50'>
                    {material.fileMeta.name} · {formatBytes(material.fileMeta.size)} — download link
                    unavailable right now; refresh the page to try again.
                  </p>
                )}

                <p className='mt-2 text-xs text-foreground/50'>
                  By {material.uploadedByName} · {formatShortDate(material.createdAt)}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** LINK rows: internal URLs route through next/link, external open in a tab. */
function MaterialLink({ url, title }: { url: string; title: string }) {
  const classes =
    'mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-ec-indigo underline-offset-2 hover:underline dark:text-white';
  const label = url.startsWith('/') ? 'Open resource' : 'Open link';
  if (url.startsWith('/')) {
    return (
      <Link href={url} className={classes}>
        <Link2 className='size-3.5' aria-hidden='true' />
        {label}
        <span className='sr-only'>: {title}</span>
      </Link>
    );
  }
  return (
    <a href={url} target='_blank' rel='noopener noreferrer' className={classes}>
      <Link2 className='size-3.5' aria-hidden='true' />
      {label}
      <span className='sr-only'>: {title}</span>
    </a>
  );
}
