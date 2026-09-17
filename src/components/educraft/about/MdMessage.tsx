import Image from 'next/image';

/**
 * About — "A word from the Director".
 *
 * Content is owner-supplied (2026-09-18): the biography, the name, the title
 * and the tagline are reproduced from that text, lightly structured into
 * paragraphs. The portrait is the supplied photograph
 * (public/banani-roy-chowdhury.jpg, 413×531 — a higher-resolution original
 * would render better on 2× displays).
 *
 * Nothing here is invented: every claim below comes from the supplied
 * biography. Edit this block to update the section.
 */
const DIRECTOR = {
  name: 'Banani Roy Chowdhury',
  role: 'Director',
  tagline: 'Transforming Language Learning through Communication, Innovation, and Technology.',
  bio: [
    'Banani Roy Chowdhury is an experienced English language educator, trainer, and researcher with over three decades of teaching and training experience across India, Oman, and the UAE.',
    'She holds an MA and B.Ed., along with internationally recognised CELTA and DELTA qualifications from Cambridge, and is currently pursuing doctoral research in Education in Malaysia.',
    'Her professional experience includes service with the Ministry of Education, Sultanate of Oman, and the Abu Dhabi Vocational Education and Training Institute (ADVETI), UAE, as well as educational institutions in India, giving her extensive experience across diverse educational settings.',
    'Her expertise spans English language development, IELTS and TOEFL preparation, communication skills, academic writing, curriculum design, neuro-education (brain-based teaching), and professional training. She also integrates educational technology and AI-supported approaches into teaching, learning, assessment, and academic writing.',
    'An invited guest lecturer, workshop facilitator, and international conference presenter, she brings together extensive classroom experience, teacher training, and research-informed practice. At Educraft, she leads and contributes to initiatives in language education, training, programme development, and technology-enhanced learning.',
  ],
};

export default function MdMessage() {
  const { name, role, tagline, bio } = DIRECTOR;

  return (
    <div className='grid grid-cols-1 lg:grid-cols-[minmax(0,19rem)_1fr] items-start gap-10 lg:gap-16'>
      <div className='w-full max-w-xs lg:max-w-none'>
        <div className='card-surface relative aspect-[7/9] w-full overflow-hidden'>
          <Image
            src='/banani-roy-chowdhury.jpg'
            alt={`${name}, ${role}`}
            fill
            sizes='(min-width: 1024px) 19rem, 20rem'
            className='object-cover'
          />
        </div>
        <p className='mt-4'>
          <span className='block type-heading-s text-ec-indigo dark:text-white'>{name}</span>
          <span className='block type-body-s text-ec-slate mt-1'>{role}</span>
        </p>
      </div>

      <div>
        <p className='type-heading-m text-ec-indigo dark:text-white text-pretty'>{tagline}</p>
        <div className='mt-6 space-y-4 border-t border-ec-hairline pt-6'>
          {bio.map((paragraph) => (
            <p key={paragraph} className='type-body-m text-ec-slate text-pretty'>
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
