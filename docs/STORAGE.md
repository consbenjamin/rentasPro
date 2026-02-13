# Storage (Supabase)

En el Dashboard de Supabase > Storage, crear los siguientes buckets para el MVP:

| Bucket           | Público | Uso                                      |
|------------------|--------|------------------------------------------|
| `fotos-propiedades` | No     | Fotos de propiedades                     |
| `documentos`     | No     | Documentos de inquilinos / garantes      |
| `comprobantes`   | No     | Comprobantes de pago (imágenes/PDFs)     |
| `pdfs`           | No     | PDFs generados (recibos, liquidaciones)  |

Políticas sugeridas (RLS en Storage):

- **Authenticated** puede leer/escribir en su contexto (por ejemplo, solo admin/operador suben a `comprobantes` y `fotos-propiedades`).
- Para MVP se puede permitir `authenticated` con rol admin/operador (comprobado vía tabla `profiles`) para INSERT en estos buckets y SELECT para todos los autenticados.

Las URLs de comprobantes se guardan en `pagos.comprobante_url`; los PDFs se pueden servir desde la API (`/api/pdf/recibo`, `/api/pdf/liquidacion`) sin necesidad de subirlos a Storage en el MVP.
