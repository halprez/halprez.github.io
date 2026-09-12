# Especificación: tarjeta de negocios física + vCard + Apple Wallet

## Objetivo

Implementar una tarjeta de negocios minimalista para Alejandro Pérez que funcione de la misma forma en tres soportes:

1. **Tarjeta física impresa** con un QR.
2. **Tarjeta digital en Apple Wallet** para uso personal, mostrando el mismo QR.
3. **Página web de contacto** en `alexperez.dev/card`, desde la que cualquier persona pueda descargar el contacto en formato vCard (`.vcf`).

El objetivo es que **el QR sea permanente** y nunca tenga que regenerarse si cambian el teléfono, email, URLs u otros datos. Para ello, el QR debe apuntar siempre a una URL estable de la web, no directamente a un fichero `.vcf` versionado.

---

## Identidad y contenido visible

### Tarjeta física

Formato recomendado: **85 × 55 mm**, horizontal, una sola cara.

Contenido:

```text
Alejandro Pérez
Ingeniero de software
autarqui.co · +34 663 822 594

                                  [ QR ]
```

Características visuales:

- Fondo blanco o blanco roto.
- Texto negro / gris oscuro.
- Sin iconos adicionales.
- Sin marcos, sombras o degradados en el arte final de impresión.
- Mucho espacio en blanco.
- Nombre como elemento principal.
- `Ingeniero de software` con menor peso visual.
- `autarqui.co · +34 663 822 594` en una sola línea y tamaño inferior.
- QR en el extremo derecho.
- El QR integra en el centro el **logo real de Autarqui**.

No añadir GitHub, LinkedIn, email, lista de tecnologías, slogans ni otros elementos en la tarjeta física.

---

## Arquitectura de URLs

Usar estas rutas públicas:

```text
https://alexperez.dev/card
https://alexperez.dev/contact/alex-perez.vcf
https://alexperez.dev/wallet/alex-perez.pkpass
```

### Flujo principal

```text
Tarjeta física
      ↓
QR ────────────────────┐
                       ↓
Apple Wallet → QR → alexperez.dev/card
                       ↓
                Guardar contacto
                       ↓
                  .vcf / vCard
```

El QR de la tarjeta impresa y el del pass de Wallet deben contener **exactamente la misma URL**:

```text
https://alexperez.dev/card
```

No codificar directamente el teléfono, la vCard completa ni la URL del `.vcf` en el QR.

---

# 1. Página `/card`

Crear una página especialmente ligera y optimizada para móvil.

## Contenido mínimo

```text
Alejandro Pérez
Ingeniero de software

autarqui.co
alexperez.dev

[ Guardar contacto ]
```

Puede incluir teléfono y email, pero la prioridad visual debe ser el botón para guardar el contacto.

### CTA principal

```text
Guardar contacto
```

El botón descarga/abre:

```text
/contact/alex-perez.vcf
```

### CTA secundaria opcional

```text
Visitar autarqui.co
```

### Requisitos UX

- Mobile-first.
- Sin navegación general del portfolio si distrae del objetivo.
- Carga prácticamente instantánea.
- Sin dependencias JavaScript si no son necesarias.
- Debe funcionar correctamente desde Safari iOS y Chrome/Android.
- Área táctil del botón principal ≥ 44 px.
- No exigir login ni aplicación externa.

### Metadata recomendada

```html
<title>Alejandro Pérez — Contacto</title>
<meta name="description" content="Contacto de Alejandro Pérez, Ingeniero de software">
<meta name="robots" content="index,follow">
```

---

# 2. vCard

Usar **vCard 4.0**, estándar RFC 6350.

Ruta:

```text
/contact/alex-perez.vcf
```

Content-Type:

```http
Content-Type: text/vcard; charset=utf-8
Content-Disposition: attachment; filename="alejandro-perez.vcf"
```

Ejemplo base:

```vcf
BEGIN:VCARD
VERSION:4.0
FN:Alejandro Pérez
N:Pérez;Alejandro;;;
TITLE:Ingeniero de software
TEL;TYPE=cell;VALUE=uri:tel:+34663822594
URL:https://alexperez.dev
URL:https://autarqui.co
END:VCARD
```

Añadir el email real cuando se confirme el que se quiere hacer público.

Opcionalmente añadir:

```vcf
EMAIL:<email público>
NOTE:autarqui.co
```

No incluir información privada que no se quiera distribuir públicamente, ya que cualquier persona que escanee la tarjeta podrá descargar este fichero.

### Requisitos

- UTF-8.
- Saltos de línea CRLF si se genera dinámicamente.
- Probar importación en:
  - iOS Contacts.
  - macOS Contacts.
  - Android Contacts / Google Contacts.

---

# 3. QR definitivo

## Contenido

El QR debe codificar únicamente:

```text
https://alexperez.dev/card
```

## Logo central

Usar el **logo real de Autarqui**, obtenido de los assets del proyecto/web `autarqui.co`.

No redibujar, reinterpretar o inventar una variante del logo.

### Generación

Generar el QR como **SVG** para el arte final y, opcionalmente, PNG para previews.

Recomendación:

- Error correction: **H**.
- Quiet zone: mínimo 4 módulos.
- Módulos negros sobre fondo blanco.
- Evitar módulos excesivamente redondeados si empeoran la lectura.
- Logo centrado.
- Crear una pequeña zona blanca bajo el logo para mantener contraste.
- El área ocupada por el logo debería mantenerse aproximadamente por debajo del **20 % del área útil del QR**.

El nivel H proporciona margen para ocultar parte del QR mediante el logo, pero **la legibilidad debe comprobarse físicamente**; no asumir que un QR válido matemáticamente seguirá siendo fiable tras impresión.

### Tamaño impreso

Objetivo aproximado:

```text
24–28 mm
```

para la tarjeta 85 × 55 mm.

No bajar de ~20 mm sin realizar pruebas de lectura reales.

### Pruebas obligatorias

Escanear el PDF final y una muestra impresa con:

- iPhone usando Cámara.
- iPhone desde Control Center → Code Scanner.
- Android reciente.
- Luz intensa.
- Luz interior moderada.
- Distancias aproximadas de 15–50 cm.

---

# 4. Arte final de la tarjeta

## Dimensiones

Tamaño terminado:

```text
85 × 55 mm
```

Sangrado recomendado para imprenta:

```text
3 mm por lado
```

Documento con sangrado:

```text
91 × 61 mm
```

Mantener texto y QR dentro de una zona segura de al menos 4–5 mm respecto del corte final.

## Entregables

Generar:

```text
business-card.svg
business-card-print.pdf
business-card-preview.png
contact-qr.svg
contact-qr.png
```

### PDF

- Vectorial siempre que sea posible.
- Fuentes incrustadas o convertidas a contornos según requisitos de imprenta.
- PDF/X-4 si la imprenta lo recomienda.
- Para impresión profesional, convertir al perfil CMYK proporcionado por la imprenta en la fase final.

No rasterizar el QR innecesariamente.

---

# 5. Apple Wallet Pass

El pass es **solo para Alejandro**. No es el mecanismo mediante el que otras personas guardan el contacto.

Su única función es tener la tarjeta disponible rápidamente desde Wallet y enseñar el QR para que otra persona lo escanee.

## Tipo de pass

Usar un **Generic Pass** de Apple Wallet.

No usar un payment pass ni intentar representar una tarjeta bancaria.

## Contenido visible sugerido

Mantenerlo extremadamente simple:

```text
Alejandro Pérez
Ingeniero de software
autarqui.co

[ QR ]
```

El QR contiene:

```text
https://alexperez.dev/card
```

### Diseño

- Fondo blanco o coherente con la identidad real de Autarqui.
- Texto oscuro.
- Logo real de Autarqui como `logo.png` / assets del pass.
- Evitar saturar los campos de PassKit.
- No mostrar datos que no aporten nada al uso del pass.

---

# 6. Estructura del `.pkpass`

Un `.pkpass` es un paquete ZIP firmado que Apple Wallet valida antes de importarlo.

Estructura conceptual:

```text
pass/
├── pass.json
├── icon.png
├── icon@2x.png
├── icon@3x.png
├── logo.png
├── logo@2x.png
├── logo@3x.png
├── manifest.json
└── signature
```

Según necesidades visuales pueden añadirse otros assets soportados por el tipo de pass.

---

# 7. `pass.json`

Ejemplo orientativo:

```json
{
  "formatVersion": 1,
  "passTypeIdentifier": "pass.dev.alexperez.businesscard",
  "serialNumber": "alejandro-perez-business-card-v1",
  "teamIdentifier": "APPLE_TEAM_ID",
  "organizationName": "Alejandro Pérez",
  "description": "Tarjeta de negocios de Alejandro Pérez",
  "logoText": "Alejandro Pérez",
  "foregroundColor": "rgb(20, 20, 20)",
  "backgroundColor": "rgb(250, 250, 250)",
  "labelColor": "rgb(90, 90, 90)",

  "generic": {
    "primaryFields": [
      {
        "key": "name",
        "label": "",
        "value": "Alejandro Pérez"
      }
    ],
    "secondaryFields": [
      {
        "key": "role",
        "label": "",
        "value": "Ingeniero de software"
      }
    ],
    "auxiliaryFields": [
      {
        "key": "website",
        "label": "",
        "value": "autarqui.co"
      }
    ]
  },

  "barcodes": [
    {
      "format": "PKBarcodeFormatQR",
      "message": "https://alexperez.dev/card",
      "messageEncoding": "iso-8859-1",
      "altText": "alexperez.dev/card"
    }
  ]
}
```

Nota: Apple controla la representación final del QR dentro de Wallet. El QR nativo definido mediante `barcodes` **no permite incrustar arbitrariamente el logo de Autarqui dentro del propio código** como en la tarjeta impresa. Priorizar la legibilidad del QR nativo de Wallet y mostrar el logo por separado mediante los assets del pass.

---

# 8. Firma del Wallet Pass

Para crear un `.pkpass` válido se necesita una cuenta Apple Developer y un certificado asociado a un **Pass Type ID**.

Proceso:

1. Crear en Apple Developer un Pass Type ID, por ejemplo:

```text
pass.dev.alexperez.businesscard
```

2. Crear el certificado para ese Pass Type ID.
3. Descargar el certificado y disponer de su clave privada.
4. Construir todos los assets y `pass.json`.
5. Calcular SHA de cada fichero y construir `manifest.json`.
6. Firmar el manifest mediante una firma **PKCS #7 detached** usando el certificado del Pass Type ID y su clave privada.
7. Añadir el fichero `signature`.
8. Crear un ZIP con los ficheros en la raíz, sin directorio contenedor.
9. Renombrarlo a:

```text
alex-perez.pkpass
```

Apple documenta este proceso como manifest → firma PKCS #7 → ZIP → `.pkpass`.

### Seguridad

**Nunca** guardar en el repositorio:

```text
*.p12
*.pem
*.key
pass-certificates/
```

La clave privada y certificados de firma deben almacenarse como secrets del entorno de build/deploy.

---

# 9. Endpoint de Wallet

Ruta:

```text
/wallet/alex-perez.pkpass
```

Headers:

```http
Content-Type: application/vnd.apple.pkpass
Content-Disposition: attachment; filename="alejandro-perez.pkpass"
```

Puede ser un fichero estático ya firmado si los datos del pass no cambian.

No es necesario montar el Web Service de actualizaciones push de PassKit para esta primera versión.

Si cambia el diseño o el QR, generar una nueva versión del pass manualmente.

---

# 10. Instalación personal en iPhone

Añadir en `/card`, preferiblemente solo cuando se quiera usar personalmente, un enlace:

```text
Añadir a Apple Wallet
```

que apunte a:

```text
/wallet/alex-perez.pkpass
```

Alternativamente mantener esa URL sin enlace público y abrirla directamente desde el propio iPhone.

El pass no necesita ser un producto público ni formar parte de la experiencia habitual del visitante.

---

# 11. QR en Wallet frente a QR impreso

Ambos deben resolver a la misma URL:

```text
https://alexperez.dev/card
```

Pero la implementación gráfica será diferente:

### Tarjeta impresa

```text
QR personalizado + logo Autarqui integrado
```

### Apple Wallet

```text
QR nativo de PassKit + logo Autarqui mostrado por el pass
```

No sustituir el QR nativo de Wallet por una imagen de QR salvo que exista una razón muy clara: el barcode nativo de PassKit es la opción más robusta para escaneo.

---

# 12. Organización sugerida del repositorio

Ejemplo genérico:

```text
public/
├── contact/
│   └── alex-perez.vcf
├── qr/
│   ├── contact-qr.svg
│   └── contact-qr.png
├── wallet/
│   └── alex-perez.pkpass
└── assets/
    └── autarqui-logo.svg

src/
└── pages/
    └── card.*

scripts/
├── generate-vcard.*
├── generate-qr.*
└── generate-wallet-pass.*
```

Adaptar las rutas a Astro, Next.js, Hugo, Jekyll o el framework real de `alexperez.dev`.

---

# 13. Generación del QR

La implementación exacta depende del stack.

Pseudocódigo:

```text
url = "https://alexperez.dev/card"
logo = load("autarqui-logo")

qr = QRCode(
    content=url,
    errorCorrection="H",
    margin=4
)

render SVG
reserve white area in center
place real Autarqui logo centered
export contact-qr.svg
export high-resolution PNG preview
```

No añadir tracking parameters a la URL del QR. Si se quieren estadísticas, hacerlo server-side en `/card` para mantener permanente y limpia la URL codificada.

---

# 14. Accesibilidad y privacidad

- Usar contraste WCAG adecuado en `/card`.
- El enlace de descarga debe tener texto visible, no depender solo de un icono.
- El teléfono será público tanto en la tarjeta como en la vCard.
- Considerar spam/scraping antes de incluir un email personal directo.
- Evitar meter información innecesaria en el `.vcf`.

---

# 15. Criterios de aceptación

La implementación estará terminada cuando se cumpla todo lo siguiente:

- [ ] `alexperez.dev/card` carga correctamente en iPhone y Android.
- [ ] El botón **Guardar contacto** abre/importa una vCard válida.
- [ ] La vCard contiene nombre, cargo, teléfono, `alexperez.dev` y `autarqui.co`.
- [ ] El QR codifica únicamente `https://alexperez.dev/card`.
- [ ] El QR impreso usa el logo real de Autarqui.
- [ ] El QR puede leerse desde el PDF final.
- [ ] El QR puede leerse desde una tarjeta impresa real.
- [ ] La tarjeta física mide 85 × 55 mm más el sangrado requerido por la imprenta.
- [ ] Existe arte final vectorial.
- [ ] Existe un `.pkpass` firmado correctamente.
- [ ] El pass se puede añadir a Apple Wallet desde un iPhone.
- [ ] El pass muestra nombre, cargo y Autarqui sin elementos innecesarios.
- [ ] El QR del pass abre exactamente la misma `/card` que el QR físico.
- [ ] Ninguna clave o certificado privado está versionado en Git.

---

# 16. Decisiones de diseño definitivas

**Tarjeta:** una sola cara.

**Texto visible:**

```text
Alejandro Pérez
Ingeniero de software
autarqui.co · +34 663 822 594
```

**QR:** extremo derecho, con logo real de Autarqui integrado.

**Destino QR:**

```text
https://alexperez.dev/card
```

**Destino del usuario:** página simple → guardar `.vcf`.

**Apple Wallet:** tarjeta personal para mostrar el mismo contacto mediante QR; los receptores no necesitan Wallet ni ninguna app específica.

**Principio general:** mantener la interfaz y la tarjeta visualmente mínimas; la información completa vive en la vCard y en la web.

---

## Referencias técnicas

- Apple Wallet / PassKit: documentación oficial de Apple sobre construcción y firma de passes.
- vCard: RFC 6350 (`text/vcard`, extensiones `.vcf` / `.vcard`).
