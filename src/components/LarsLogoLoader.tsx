type LarsLogoLoaderProps = {
  size?: number;
  className?: string;
};

export default function LarsLogoLoader({
  size = 112,
  className = "",
}: LarsLogoLoaderProps) {
  const logoLayers = [
    "M77.7868 10.8546L119.558 36.6147V35.2771L78.1297 0L77.8886 0.1548L0 49.5599V50.8824L77.7868 10.8546Z",
    "M0 57.5235V58.7997L77.3653 34.6361L119.558 47.5518V46.322L77.7163 23.3268L0 57.5235Z",
    "M77.6021 46.1197L0 66.0111V67.246L77.3657 57.3522L119.558 62.9012V61.7231L77.7166 46.0898L77.6021 46.1197Z",
    "M77.5252 67.8483L77.4752 67.8641L0 76.1022V77.3095L77.2371 78H77.2525L119.558 75.2764V74.1254L77.5252 67.8483Z",
  ];

  return (
    <div className={`lars-logo-loader ${className}`}>
      <div
        className="lars-logo-loader-mark"
        style={{ width: size * 1.54, height: size }}
        aria-label="Cargando"
        role="status"
      >
        <svg
          viewBox="0 0 120 78"
          className="lars-logo-loader-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="larsGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {logoLayers.map((path, index) => (
            <path
              key={path}
              d={path}
              fill="white"
              filter="url(#larsGlow)"
              className="lars-logo-loader-layer"
              style={{
                animationDelay: `${index * 0.14}s`,
                transformBox: "fill-box",
              }}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
