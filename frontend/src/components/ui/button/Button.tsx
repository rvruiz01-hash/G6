  import React, { useMemo } from "react";

  // --- Definiciones de Tipos y Temas ---

  type ButtonThemeKey =
    | "save"
    | "search"
    | "update"
    | "delete"
    | "clear"
    | "close"
    | "edit"
    | "upload"
    | "download"
    | "login"
    | "add";

  interface HSLColor {
    h: number;
    s: number;
    l: number;
  }

  interface ButtonProps {
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    text?: string;
    theme?: ButtonThemeKey;
    baseColor?: HSLColor;
    size?: string;
    loading?: boolean;
    disabled?: boolean;
    loadingText?: string;
  }

  // --- Iconos SVG ---

  const IconContainer: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => (
    <svg
      className="sparkle"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {children}
    </svg>
  );

  // ✅ Spinner SVG
  const SpinnerIcon = () => (
    <svg
      className="sparkle spinner-icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
        opacity="0.25"
        fill="currentColor"
      />
      <path
        d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z"
        fill="currentColor"
      />
    </svg>
  );

  const SparkleIcon = () => (
    <IconContainer>
      <path
        d="M14.187 8.096L15 5.25L15.813 8.096C16.0231 8.83114 16.4171 9.50062 16.9577 10.0413C17.4984 10.5819 18.1679 10.9759 18.903 11.186L21.75 12L18.904 12.813C18.1689 13.0231 17.4994 13.4171 16.9587 13.9577C16.4181 14.4984 16.0241 15.1679 15.814 15.903L15 18.75L14.187 15.904C13.9769 15.1689 13.5829 14.4994 13.0423 13.9587C12.5016 13.4181 11.8321 13.0241 11.097 12.814L8.25 12L11.096 11.187C11.8311 10.9769 12.5006 10.5829 13.0413 10.0423C13.5819 9.50162 13.9759 8.83214 14.186 8.097L14.187 8.096Z"
        fill="currentColor"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 14.25L5.741 15.285C5.59267 15.8785 5.28579 16.4206 4.85319 16.8532C4.42059 17.2858 3.87853 17.5927 3.285 17.741L2.25 18L3.285 18.259C3.87853 18.4073 4.42059 18.7142 4.85319 19.1468C5.28579 19.5794 5.59267 20.1215 5.741 20.715L6 21.75L6.259 20.715C6.40725 20.1216 6.71398 19.5796 7.14639 19.147C7.5788 18.7144 8.12065 18.4075 8.714 18.259L9.75 18L8.714 17.741C8.12065 17.5925 7.5788 17.2856 7.14639 16.853C6.71398 16.4204 6.40725 15.8784 6.259 15.285L6 14.25Z"
        fill="currentColor"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 4L6.303 4.5915C6.24777 4.75718 6.15472 4.90774 6.03123 5.03123C5.90774 5.15472 5.75718 5.24777 5.5915 5.303L5 5.5L5.5915 5.697C5.75718 5.75223 5.90774 5.84528 6.03123 5.96877C6.15472 6.09226 6.24777 6.24282 6.303 6.4085L6.5 7L6.697 6.4085C6.75223 6.24282 6.84528 6.09226 6.96877 5.96877C7.09226 5.84528 7.24282 5.75223 7.4085 5.697L8 5.5L7.4085 5.303C7.24282 5.24777 7.09226 5.15472 6.96877 5.03123C6.84528 4.90774 6.75223 4.75718 6.697 4.5915L6.5 4Z"
        fill="currentColor"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconContainer>
  );

  const SearchIcon = () => (
    <IconContainer>
      <path
        d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z"
        fill="currentColor"
      />
    </IconContainer>
  );

  const SaveIcon = () => (
    <IconContainer>
      <path
        d="M17 3H5C3.89 3 3.01 3.9 3.01 5L3 19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V7L17 3ZM12 19C9.79 19 8 17.21 8 15C8 12.79 9.79 11 12 11C14.21 11 16 12.79 16 15C16 17.21 14.21 19 12 19ZM15 9H5V5H15V9Z"
        fill="currentColor"
      />
    </IconContainer>
  );

  const UpdateIcon = () => (
    <IconContainer>
      <path
        d="M12 6V3L7 8L12 13V10C15.31 10 18 12.69 18 16C18 17.55 17.39 18.9 16.35 19.92L17.76 21.33C19.26 19.83 20 17.98 20 16C20 11.58 16.42 8 12 8V6Z"
        fill="currentColor"
      />
      <path
        d="M6 16C6 14.45 6.61 13.1 7.65 12.08L6.24 10.67C4.74 12.17 4 14.02 4 16C4 20.42 7.58 24 12 24V22C8.69 22 6 19.31 6 16Z"
        fill="currentColor"
      />
    </IconContainer>
  );

  const DeleteIcon = () => (
    <IconContainer>
      <path
        d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z"
        fill="currentColor"
      />
    </IconContainer>
  );

  const CloseIcon = () => (
    <IconContainer>
      <path
        d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
        fill="currentColor"
      />
    </IconContainer>
  );

  const EditIcon = () => (
    <IconContainer>
      <path
        d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z"
        fill="currentColor"
      />
    </IconContainer>
  );

  const UploadIcon = () => (
    <IconContainer>
      <path
        d="M9 16H15V10H19L12 3L5 10H9V16ZM5 18H19V20H5V18Z"
        fill="currentColor"
      />
    </IconContainer>
  );

  const DownloadIcon = () => (
    <IconContainer>
      <path
        d="M19 9H15V3H9V9H5L12 16L19 9ZM5 18V20H19V18H5Z"
        fill="currentColor"
      />
    </IconContainer>
  );

  const AddIcon = () => (
    <IconContainer>
      <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor" />
    </IconContainer>
  );

  const LoginIcon = () => (
    <IconContainer>
      <path
        d="M10 2C12.21 2 14 3.79 14 6C14 8.21 12.21 10 10 10C7.79 10 6 8.21 6 6C6 3.79 7.79 2 10 2ZM10 12C7.33 12 2 13.34 2 16V18H12V16C12 13.34 8.67 12 10 12ZM17 10V7L22 12L17 17V14H13V10H17Z"
        fill="currentColor"
      />
    </IconContainer>
  );

  const BUTTON_THEMES: Record<
    ButtonThemeKey,
    { color: HSLColor; icon: React.ReactNode }
  > = {
    save: { color: { h: 140, s: 70, l: 45 }, icon: <SaveIcon /> },
    search: { color: { h: 210, s: 90, l: 55 }, icon: <SearchIcon /> },
    update: { color: { h: 140, s: 70, l: 45 }, icon: <UpdateIcon /> },
    delete: { color: { h: 0, s: 80, l: 55 }, icon: <DeleteIcon /> },
    clear: { color: { h: 0, s: 80, l: 55 }, icon: <SparkleIcon /> },
    close: { color: { h: 0, s: 80, l: 55 }, icon: <CloseIcon /> },
    edit: { color: { h: 45, s: 90, l: 55 }, icon: <EditIcon /> },
    upload: { color: { h: 140, s: 70, l: 45 }, icon: <UploadIcon /> },
    download: { color: { h: 220, s: 85, l: 50 }, icon: <DownloadIcon /> },
    login: { color: { h: 210, s: 90, l: 55 }, icon: <LoginIcon /> },
    add: { color: { h: 140, s: 70, l: 45 }, icon: <AddIcon /> },
  };
  // --- Componente Principal ---

  const Button: React.FC<ButtonProps> = ({
    onClick,
    text,
    theme = "save",
    baseColor,
    size = "clamp(0.85rem, 2.5vw, 1.2rem)", // ✅ Tamaño responsivo por defecto
    loading = false,
    disabled = false,
    loadingText,
  }) => {
    const selectedTheme = BUTTON_THEMES.hasOwnProperty(theme)
      ? BUTTON_THEMES[theme as ButtonThemeKey]
      : BUTTON_THEMES["save"];
    const finalColor = baseColor || selectedTheme.color;
    const finalIcon = loading ? <SpinnerIcon /> : selectedTheme.icon;

    const defaultText = useMemo(() => {
      switch (theme) {
        case "save":
          return "Guardar";
        case "search":
          return "Buscar";
        case "update":
          return "Actualizar";
        case "delete":
          return "Eliminar";
        case "clear":
          return "Limpiar";
        case "close":
          return "Cerrar";
        case "edit":
          return "Editar";
        case "upload":
          return "Cargar Archivo";
        case "download":
          return "Descargar";
        case "add":
          return "Agregar";
        case "login":
          return "Iniciar Sesión";
        default:
          return "Acción";
      }
    }, [theme]);

    const defaultLoadingText = useMemo(() => {
      switch (theme) {
        case "save":
          return "Guardando...";
        case "search":
          return "Buscando...";
        case "update":
          return "Actualizando...";
        case "delete":
          return "Eliminando...";
        case "upload":
          return "Cargando...";
        case "download":
          return "Descargando...";
        case "add":
          return "Agregando...";
        case "login":
          return "Iniciando sesión...";
        default:
          return "Procesando...";
      }
    }, [theme]);

    const buttonText = loading
      ? loadingText || defaultLoadingText
      : text || defaultText;

    const isDisabled = disabled || loading;

    const buttonStyle = {
      "--h": finalColor.h.toString(),
      "--s": `${finalColor.s}%`,
      "--l": `${finalColor.l}%`,
      "--btn-fs": size,
    } as React.CSSProperties;

    const generateParticleStyle = () => {
      return {
        "--size": (Math.random() * 0.5 + 0.2).toFixed(2),
        "--x": (Math.random() * 100).toFixed(2),
        "--y": (Math.random() * 100).toFixed(2),
        "--alpha": (Math.random() * 0.5 + 0.5).toFixed(2),
        "--duration": (Math.random() * 3 + 1).toFixed(2),
        "--delay": (Math.random() * 5).toFixed(2),
        "--origin-x": `${(Math.random() * 1000).toFixed(0)}%`,
        "--origin-y": `${(Math.random() * 1000).toFixed(0)}%`,
      } as React.CSSProperties;
    };

    return (
      <div className="flex justify-center items-center p-1 sm:p-2">
        <style>{`
          .sparkle-button-custom {
              --active: 0;
              --cut: 0.1em;
              --transition: 0.25s;
              --spark: 1.2s;

              --bg-color: hsl(var(--h) var(--s) var(--l));
              --bg-active-light: hsl(var(--h) calc(var(--active) * var(--s)) 72% / var(--active));
              --bg-active-dark: hsl(var(--h) calc(var(--active) * var(--s)) 70% / var(--active));
              --bg-base-glow: hsl(var(--h) var(--s) calc((var(--active) * 25%) + var(--l)));

              --bg: radial-gradient(
                  40% 50% at center 100%,
                  var(--bg-active-light),
                  transparent
              ),
              radial-gradient(
                  80% 100% at center 120%,
                  var(--bg-active-dark),
                  transparent
              ),
              var(--bg-base-glow);

              background: var(--bg);
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
              font-size: var(--btn-fs, 1.2rem);
              font-weight: 600;
              color: white;
              border: 0;
              cursor: pointer;
              /* ✅ Padding responsivo */
              padding: clamp(0.7em, 1.5vw, 1em) clamp(1em, 3vw, 1.5em);
              display: flex;
              align-items: center;
              /* ✅ Gap responsivo */
              gap: clamp(0.3em, 1vw, 0.5em);
              white-space: nowrap;
              border-radius: 100px;
              position: relative;
              /* ✅ Ancho mínimo para evitar botones muy pequeños */
              min-width: fit-content;
            
              box-shadow:
                  0 0 calc(var(--active) * 3em) calc(var(--active) * 1em) hsl(var(--h) 97% 61% / 0.75),
                  0 0em 0 0 hsl(var(--h) calc(var(--active) * 97%) calc((var(--active) * 50%) + 30%)) inset,
                  0 -0.05em 0 0 hsl(var(--h) calc(var(--active) * 97%) calc(var(--active) * 60%)) inset;

              transition: box-shadow var(--transition), scale var(--transition), background var(--transition);
              scale: calc(1 + (var(--active) * 0.1));
              z-index: 10;
          }

          /* ✅ Estilos cuando está deshabilitado */
          .sparkle-button-custom:disabled {
              opacity: 0.6;
              cursor: not-allowed;
              --active: 0 !important;
          }

          .sparkle-button-custom:active:not(:disabled) {
              scale: 1;
              transition: .3s;
          }

          /* ✅ Animación del spinner */
          .spinner-icon {
              animation: spin 1s linear infinite;
          }

          @keyframes spin {
              from {
                  transform: rotate(0deg);
              }
              to {
                  transform: rotate(360deg);
              }
          }

          .sparkle-button-custom .sparkle path {
              color: hsl(0 0% calc((var(--active, 0) * 70%) + var(--base)));
              transform-box: fill-box;
              transform-origin: center;
              fill: currentColor;
              stroke: currentColor;
              animation-delay: calc((var(--transition) * 1.5) + (var(--delay) * 1s));
              animation-duration: 0.6s;
              transition: color var(--transition);
          }

          .sparkle-button-custom:is(:hover, :focus-visible):not(:disabled) .sparkle path {
              animation-name: bounce;
          }

          @keyframes bounce {
              35%, 65% {
                  scale: var(--scale);
              }
          }

          .sparkle-button-custom .sparkle path:nth-of-type(1) { --scale: 0.5; --delay: 0.1; --base: 40%; }
          .sparkle-button-custom .sparkle path:nth-of-type(2) { --scale: 1.5; --delay: 0.2; --base: 20%; }
          .sparkle-button-custom .sparkle path:nth-of-type(3) { --scale: 2.5; --delay: 0.35; --base: 30%; }

          .sparkle-button-custom:before {
              content: "";
              position: absolute;
              inset: -0.2em;
              z-index: -1;
              border: 0.25em solid hsl(var(--h) var(--s) 50% / 0.5);
              border-radius: 100px;
              opacity: var(--active, 0);
              transition: opacity var(--transition);
          }

          .spark-custom {
              position: absolute;
              inset: 0;
              border-radius: 100px;
              rotate: 0deg;
              overflow: hidden;
              mask: linear-gradient(white, transparent 50%);
              animation: flip calc(var(--spark) * 2) infinite steps(2, end);
          }

          @keyframes flip {
              to {
                  rotate: 360deg;
              }
          }

          .spark-custom:before {
              content: "";
              position: absolute;
              width: 200%;
              aspect-ratio: 1;
              top: 0%;
              left: 50%;
              z-index: -1;
              translate: -50% -15%;
              rotate: 0;
              transform: rotate(-90deg);
              opacity: calc((var(--active) * 0.9) + 0.9);
              background: conic-gradient(
                  from 0deg,
                  transparent 0 340deg,
                  white 360deg
              );
              transition: opacity var(--transition);
              animation: rotate var(--spark) linear infinite both;
          }

          .spark-custom:after {
              content: "";
              position: absolute;
              inset: var(--cut);
              border-radius: 100px;
              background: var(--bg);
          }

          .backdrop-custom { display: none; }

          @keyframes rotate {
              to {
                  transform: rotate(90deg);
              }
          }

          .sparkle-button-custom:is(:hover, :focus-visible):not(:disabled) {
              --active: 1;
              --play-state: running;
          }
        
          .sp-custom { position: relative; }

          .particle-pen-custom {
              position: absolute;
              width: 10%;
              aspect-ratio: 1;
              top: 0%;
              left:20%;
              translate: -30% -30%;
              -webkit-mask: radial-gradient(white, transparent75%);
              z-index: -1;
              opacity: var(--active, 0);
              transition: opacity var(--transition);
          }

          .particle-custom {
              color: hsl(var(--h) var(--s) 70%);
              width: calc(var(--size, 0.25) * 1rem);
              aspect-ratio: 1;
              position: absolute;
              top: calc(var(--y) * 1%);
              left: calc(var(--x) * 1%);
              opacity: var(--alpha, 1);
              animation: float-out calc(var(--duration, 1) * 1s) calc(var(--delay) * -1s) infinite linear;
              transform-origin: var(--origin-x, 1000%) var(--origin-y, 1000%);
              z-index: -1;
          }

          .particle-custom path {
            fill: currentColor;
            stroke: none;
        }

          .particle-custom:nth-of-type(even) { animation-direction: reverse; }

          @keyframes float-out { to { rotate: 360deg; } }

          .text-custom {
              background: linear-gradient(90deg, hsl(0 0% calc((var(--active) * 100%) + 5%)), hsl(0 0% calc((var(--active) * 100%) + 100%)));
              -webkit-background-clip: text;
              background-clip: text;
              color: transparent;
              transition: background var(--transition);
          }

          .sparkle-button-custom .sparkle {
              /* ✅ Tamaño de ícono responsivo */
              inline-size: clamp(1em, 2.5vw, 1.25em);
              translate: 0% 0%;
              min-width: clamp(1em, 2.5vw, 1.25em);
          }

          .sparkle-button-custom:is(:hover, :focus-visible):not(:disabled) ~ .particle-pen-custom {
              --active: 1;
              --play-state: running;
          }

          /* ✅ Ajustes específicos para pantallas pequeñas */
          @media (max-width: 640px) {
              .sparkle-button-custom {
                  /* Reducir efectos visuales en móviles para mejor rendimiento */
                  box-shadow:
                      0 0 calc(var(--active) * 2em) calc(var(--active) * 0.5em) hsl(var(--h) 97% 61% / 0.5),
                      0 0em 0 0 hsl(var(--h) calc(var(--active) * 97%) calc((var(--active) * 50%) + 30%)) inset,
                      0 -0.05em 0 0 hsl(var(--h) calc(var(--active) * 97%) calc(var(--active) * 60%)) inset;
              }
              
              /* Reducir número de partículas en móviles */
              .particle-custom:nth-child(n+60) {
                  display: none;
              }
          }

          /* ✅ Ajustes para tablets */
          @media (min-width: 641px) and (max-width: 1024px) {
              .particle-custom:nth-child(n+90) {
                  display: none;
              }
          }
        `}</style>

        <div className="sp-custom">
          <button
            className="sparkle-button-custom"
            onClick={onClick}
            style={buttonStyle}
            disabled={isDisabled}
          >
            <span className="spark-custom"></span>
            <span className="backdrop-custom"></span>
            {finalIcon}
            <span className="text-custom">{buttonText}</span>
          </button>

          <span aria-hidden="true" className="particle-pen-custom">
            {[...Array(120)].map((_, i) => (
              <svg
                key={i}
                className="particle-custom"
                viewBox="2.2 5 2 2"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={generateParticleStyle()}
              >
                <path
                  d="M6.937 3.846L7.75 1L8.563 3.846C8.77313 4.58114 9.1671 5.25062 9.70774 5.79126C10.2484 6.3319 10.9179 6.72587 11.653 6.936L14.5 7.75L11.654 8.563C10.9189 8.77313 10.2494 9.1671 9.70874 9.70774C9.1681 10.2484 8.77413 10.9179 8.564 11.653L7.75 14.5L6.937 11.654C6.72687 10.9189 6.3329 10.2494 5.79226 9.70874C5.25162 9.1681 4.58214 8.77413 3.847 8.564L1 7.75L3.846 6.937C4.58114 6.72687 5.25062 6.3329 5.79126 5.79226C6.3319 5.25162 6.72587 4.58214 6.936 3.847L6.937 3.846Z"
                  fill="currentColor"
                />
              </svg>
            ))}
          </span>
        </div>
      </div>
    );
  };

  export default Button;
