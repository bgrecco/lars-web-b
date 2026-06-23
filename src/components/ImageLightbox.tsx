import { useEffect, useRef, useState, type TouchEvent } from "react";

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
  const touchStartXRef = useRef<number | null>(null);
  const previousIndexRef = useRef<number | null>(null);
  const isOpen = activeIndex !== null && images.length > 0;
  const safeIndex = isOpen ? getWrappedIndex(activeIndex, images.length) : 0;
  const activeImage = images[safeIndex];
  const [transitionDirection, setTransitionDirection] = useState<"left" | "right" | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

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

  useEffect(() => {
    if (!isOpen) {
      previousIndexRef.current = null;
      setTransitionDirection(null);
      setDragOffset(0);
      setIsDragging(false);
      return;
    }

    const previousIndex = previousIndexRef.current;

    if (previousIndex === null || images.length <= 1) {
      previousIndexRef.current = safeIndex;
      setTransitionDirection(null);
      return;
    }

    const forwardDistance = (safeIndex - previousIndex + images.length) % images.length;
    const backwardDistance = (previousIndex - safeIndex + images.length) % images.length;

    setTransitionDirection(forwardDistance <= backwardDistance ? "right" : "left");
    previousIndexRef.current = safeIndex;
  }, [images.length, isOpen, safeIndex]);

  if (!isOpen || !activeImage) {
    return null;
  }

  const showNavigation = images.length > 1;
  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = event.changedTouches[0]?.clientX ?? null;
    setIsDragging(true);
    setDragOffset(0);
  };
  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    const touchStartX = touchStartXRef.current;
    const touchCurrentX = event.changedTouches[0]?.clientX ?? null;

    if (touchStartX === null || touchCurrentX === null) {
      return;
    }

    const deltaX = touchCurrentX - touchStartX;
    const clampedDeltaX = Math.max(Math.min(deltaX, 120), -120);
    setDragOffset(clampedDeltaX);
  };
  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const touchStartX = touchStartXRef.current;
    const touchEndX = event.changedTouches[0]?.clientX ?? null;

    touchStartXRef.current = null;
    setIsDragging(false);
    setDragOffset(0);

    if (touchStartX === null || touchEndX === null) {
      return;
    }

    const deltaX = touchEndX - touchStartX;

    if (Math.abs(deltaX) < 48) {
      return;
    }

    if (deltaX > 0) {
      onIndexChange(getWrappedIndex(safeIndex - 1, images.length));
      return;
    }

    onIndexChange(getWrappedIndex(safeIndex + 1, images.length));
  };

  return (
    <div className="image-lightbox" role="dialog" aria-modal="true" aria-label={`Galería de ${title}`}>
      <button type="button" className="image-lightbox-backdrop" onClick={onClose} aria-label="Cerrar galería" />

      <div
        className="image-lightbox-stage"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
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
          key={`${safeIndex}-${transitionDirection ?? "initial"}`}
          src={activeImage.image}
          alt={activeImage.alt}
          className={`image-lightbox-image${transitionDirection ? ` image-lightbox-image-slide-${transitionDirection}` : ""}${isDragging ? " is-dragging" : ""}`}
          style={{
            objectPosition: activeImage.objectPosition ?? "center center",
            transform: isDragging ? `translate3d(${dragOffset}px, 0, 0)` : undefined,
          }}
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

        {showNavigation ? (
          <div className="image-lightbox-thumb-rail" aria-label={`Miniaturas de ${title}`}>
            {images.map((image, index) => (
              <button
                key={`${image.image}-${index}`}
                type="button"
                className={`image-lightbox-thumb${index === safeIndex ? " is-active" : ""}`}
                onClick={() => onIndexChange(index)}
                aria-label={`Abrir imagen ${index + 1}`}
                aria-pressed={index === safeIndex}
              >
                <img
                  src={image.image}
                  alt=""
                  className="image-lightbox-thumb-image"
                  loading="lazy"
                  decoding="async"
                  style={{ objectPosition: image.objectPosition ?? "center center" }}
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
