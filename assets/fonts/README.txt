LOCAL FONTS (installed)
=======================

These self-hosted variable fonts are bundled and loaded locally only
(no CDN, no Google Fonts import at runtime). The stylesheet declares
matching @font-face rules:

  - Inter-Variable.woff2          (family: "Inter")          ~48 KB
  - SpaceGrotesk-Variable.woff2   (family: "Space Grotesk")  ~22 KB
  - JetBrainsMono-Variable.woff2  (family: "JetBrains Mono")  ~40 KB

They are latin-subset variable fonts (weight axis), sourced from the
fonts' open-source releases. If a file is ever removed, the site falls
back automatically to the system font stack defined in styles.css.
