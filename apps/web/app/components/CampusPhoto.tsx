'use client';
import { useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { Camera } from 'lucide-react';
import { CAMPUS_PHOTOS, CampusSlot } from '../lib/campus-photos';

// A calm photo band: settles in once, drifts a few percent while scrolling, never carries text on top of it.
export function CampusPhoto({ slot }: { slot: CampusSlot }) {
  const photo = CAMPUS_PHOTOS[slot];
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [missing, setMissing] = useState(false);
  const [ready, setReady] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-5%', '5%']);

  if (missing) return null;
  return (
    <motion.figure
      ref={ref}
      className={`campus-photo campus-photo-${slot}`}
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: ready ? 1 : 0.001, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 0.8, 0.24, 1] }}
    >
      <motion.img
        src={photo.src}
        alt={photo.alt}
        loading="lazy"
        decoding="async"
        draggable={false}
        style={reduce ? undefined : { y }}
        onLoad={() => setReady(true)}
        onError={() => setMissing(true)}
      />
      {photo.credit && (
        <figcaption>
          <Camera size={12} aria-hidden="true" /> {photo.credit}
          {photo.licence ? `, ${photo.licence}` : ''}
        </figcaption>
      )}
    </motion.figure>
  );
}
