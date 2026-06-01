import { useEffect, useRef } from "react";

export type LightboxImage = {
  image: string;
  alt: string;
  objectPosition?: string;
};

type ImageLightboxProps = {
  images: LightboxImage[];
  activeIndex: number | null;
  title: string;
  onClose: () => void;
  onIndexChange: (index: number) => void;
};

function getWrappedIndex(index: number, length: number) {
  return ((index % length) + length) % length;
}

function LightboxArrowIcon(props: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {props.direction === "left" ? (
        <>
          <path d="M15 5 8 12l7 7" />
          <path d="M9 12h11" />
        </>
      ) : (
        <>
          <path d="m9 5 7 7-7 7" />
          <path d="M4 12h11" />
        </>
      )}
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 6 12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

export default function ImageLightbox(props: ImageLightboxProps) {
  const { images, activeIndex, title, onClose, onIndexChange } = props;
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const isOpen = activeIndex !== null && images.length > 0;
  const safeIndex = isOpen ? getWrappedIndex(activeIndex, images.length) : 0;
  const activeImage = images[safeIndex];

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key === "ArrowLeft") {
        onIndexChange(getWrappedIndex(safeIndex - 1, images.length));
        return;
      }

      if (event.key === "ArrowRight") {
        onIndexChange(getWrappedIndex(safeIndex + 1, images.length));
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [images.length, isOpen, onClose, onIndexChange, safeIndex]);

  if (!isOpen || !activeImage) {
    return null;
  }

  const showNavigation = images.length > 1;

  return (
    <div className="image-lightbox" role="dialog" aria-modal="true" aria-label={`Galería de ${title}`}>
      <button type="button" className="image-lightbox-backdrop" onClick={onClose} aria-label="Cerrar galería" />

      <div className="image-lightbox-stage">
        <button
          ref={closeButtonRef}
          type="button"
          className="image-lightbox-button image-lightbox-close"
          onClick={onClose}
          aria-label="Cerrar galería"
        >
          <CloseIcon />
        </button>

        {showNavigation ? (
          <button
            type="button"
            className="image-lightbox-button image-lightbox-arrow image-lightbox-arrow-left"
            onClick={() => onIndexChange(getWrappedIndex(safeIndex - 1, images.length))}
            aria-label="Ver imagen anterior"
          >
            <LightboxArrowIcon direction="left" />
          </button>
        ) : null}

        <img
          src={activeImage.image}
          alt={activeImage.alt}
          className="image-lightbox-image"
          style={{ objectPosition: activeImage.objectPosition ?? "center center" }}
        />

        {showNavigation ? (
          <button
            type="button"
            className="image-lightbox-button image-lightbox-arrow image-lightbox-arrow-right"
            onClick={() => onIndexChange(getWrappedIndex(safeIndex + 1, images.length))}
            aria-label="Ver imagen siguiente"
          >
            <LightboxArrowIcon direction="right" />
          </button>
        ) : null}

        <div className="image-lightbox-counter" aria-live="polite">
          {safeIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
}
