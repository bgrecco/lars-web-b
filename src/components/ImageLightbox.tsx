import { useEffect, useRef, useState, type MouseEvent, type TouchEvent } from "react";
import {
  getVideoMimeType,
  getYouTubeEmbedSrc,
  isYouTubeShortsSrc,
  isYouTubeVideoSrc,
  shouldUsePortraitVideoFrame,
} from "../utils/videoMedia";

export type LightboxImage = {
  mediaType?: "image" | "video";
  image: string;
  thumbImage?: string;
  alt: string;
  objectPosition?: string;
  videoSrc?: string;
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
      <path d={props.direction === "left" ? "m15 18-6-6 6-6" : "m9 6 6 6-6 6"} />
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

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8.25 5.75v12.5L18.25 12 8.25 5.75Z" />
    </svg>
  );
}

function isVideoMedia(image: LightboxImage) {
  return image.mediaType === "video" || Boolean(image.videoSrc);
}

type LightboxVideoProps = {
  image: LightboxImage;
  title: string;
  className: string;
  dragOffset: number;
  isDragging: boolean;
};

function LightboxVideo(props: LightboxVideoProps) {
  const { image, title, className, dragOffset, isDragging } = props;
  const videoSrc = image.videoSrc;

  if (!videoSrc) {
    return null;
  }

  const isYouTubeVideo = isYouTubeVideoSrc(videoSrc);
  const orientationClassName = shouldUsePortraitVideoFrame(videoSrc) ? "is-portrait" : "is-landscape";
  const sourceClassName = isYouTubeShortsSrc(videoSrc) ? "is-shorts" : "";
  const videoShellClassName = [
    "image-lightbox-video-shell",
    orientationClassName,
    sourceClassName,
    className.trim(),
  ].filter(Boolean).join(" ");
  const videoFrameClassName = [
    "image-lightbox-video-frame",
    orientationClassName,
    sourceClassName,
  ].filter(Boolean).join(" ");

  return (
    <div
      className={videoShellClassName}
      data-lightbox-keep-open
      style={{
        transform: isDragging ? `translate3d(${dragOffset}px, 0, 0)` : undefined,
      }}
    >
      <img
        src={image.image}
        alt=""
        className="image-lightbox-video-backdrop"
        aria-hidden="true"
        loading="eager"
        decoding="async"
        style={{ objectPosition: image.objectPosition ?? "center center" }}
      />

      <div className={videoFrameClassName}>
        {isYouTubeVideo ? (
          <iframe
            src={getYouTubeEmbedSrc(videoSrc)}
            title={`${title} video`}
            className="image-lightbox-video-iframe"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <video
            className="image-lightbox-video-player"
            controls
            playsInline
            preload="metadata"
            poster={image.image}
          >
            <source src={videoSrc} type={getVideoMimeType(videoSrc)} />
          </video>
        )}
      </div>
    </div>
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
  const activeMediaClassName = `${transitionDirection ? ` image-lightbox-image-slide-${transitionDirection}` : ""}${isDragging ? " is-dragging" : ""}`;
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
  const handleStageClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target;

    if (!(target instanceof Element) || target.closest("[data-lightbox-keep-open]")) {
      return;
    }

    onClose();
  };

  return (
    <div className="image-lightbox" role="dialog" aria-modal="true" aria-label={`Galería de ${title}`}>
      <button type="button" className="image-lightbox-backdrop" onClick={onClose} aria-label="Cerrar galería" />

      <div
        className="image-lightbox-stage"
        onClick={handleStageClick}
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
          data-lightbox-keep-open
        >
          <CloseIcon />
        </button>

        {showNavigation ? (
          <button
            type="button"
            className="image-lightbox-button image-lightbox-arrow image-lightbox-arrow-left"
            onClick={() => onIndexChange(getWrappedIndex(safeIndex - 1, images.length))}
            aria-label="Ver imagen anterior"
            data-lightbox-keep-open
          >
            <LightboxArrowIcon direction="left" />
          </button>
        ) : null}

        {isVideoMedia(activeImage) ? (
          <LightboxVideo
            key={`${safeIndex}-${transitionDirection ?? "initial"}`}
            image={activeImage}
            title={title}
            className={activeMediaClassName}
            dragOffset={dragOffset}
            isDragging={isDragging}
          />
        ) : (
          <img
            key={`${safeIndex}-${transitionDirection ?? "initial"}`}
            src={activeImage.image}
            alt={activeImage.alt}
            className={`image-lightbox-image${activeMediaClassName}`}
            data-lightbox-keep-open
            style={{
              objectPosition: activeImage.objectPosition ?? "center center",
              transform: isDragging ? `translate3d(${dragOffset}px, 0, 0)` : undefined,
            }}
          />
        )}

        {showNavigation ? (
          <button
            type="button"
            className="image-lightbox-button image-lightbox-arrow image-lightbox-arrow-right"
            onClick={() => onIndexChange(getWrappedIndex(safeIndex + 1, images.length))}
            aria-label="Ver imagen siguiente"
            data-lightbox-keep-open
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
                className={[
                  "image-lightbox-thumb",
                  index === safeIndex ? "is-active" : "",
                  isVideoMedia(image) ? "is-video" : "",
                  isYouTubeShortsSrc(image.videoSrc) ? "is-shorts" : "",
                ].filter(Boolean).join(" ")}
                onClick={() => onIndexChange(index)}
                aria-label={isVideoMedia(image) ? `Abrir video ${index + 1}` : `Abrir imagen ${index + 1}`}
                aria-pressed={index === safeIndex}
                data-lightbox-keep-open
              >
                <img
                  src={image.thumbImage ?? image.image}
                  alt=""
                  className="image-lightbox-thumb-image"
                  loading="lazy"
                  decoding="async"
                  style={{ objectPosition: image.objectPosition ?? "center center" }}
                />
                {isVideoMedia(image) ? (
                  <span className="image-lightbox-thumb-play" aria-hidden="true">
                    <PlayIcon />
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
