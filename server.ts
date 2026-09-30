import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

const CATALOG_DESCRIPTIONS = `
- resp-caja: Respiración en caja (4-4-4-4). Bajar pulsaciones y serenar el sistema nervioso.
- resp-suspiro: Suspiro fisiológico. Doble inhalación y exhalación larga para frenar el estrés rápido.
- resp-478: Respiración 4-7-8 abreviada. Exhalaciones prolongadas para calmar el ritmo cardíaco.
- resp-46: Respiración 4-6 calmante. Inhalar en 4 y exhalar en 6 para descanso y vagotonía.
- resp-diafragma: Respiración diafragmática profunda. Llevar oxígeno al vientre para reducir tensión torácica.
- resp-336: Respiración 3-3-6 descompresiva. Inhalar corto y exhalar el doble para bajar pulsaciones.
- est-cuello: Cuello y trapecios. Alivio rápido para nuca cargada por concentración.
- est-hombros: Hombros y omóplatos. Liberar peso y tensión acumulada en parte alta.
- est-manos: Muñecas y antebrazos. Manos que canalizan, digitan notas o empujan camillas.
- est-espalda: Espalda baja y columna de pie. Descomprimir zona lumbar tras rondas de pie.
- est-pectoral: Apertura pectoral y omóplatos. Contrarrestar postura encorvada sobre camillas y escritorios.
- est-lateral: Estiramiento lateral de columna. Liberar flancos para respirar más hondo.
- sol-mandibula: Mandíbula, entrecejo y manos. Desapretar dientes, ceño y puños.
- sol-gravedad: Descarga de peso a la tierra. Dejar que el piso sostenga tu peso por 60s.
- sol-escaneo: Escaneo corporal exprés. Recorrer el cuerpo de pies a cabeza soltando el control.
- sol-descarga: Vaciado mental y pausa cero. Soltar lista de pendientes por 60 segundos.
- sol-bata: Soltar el peso de la bata y hombros. Desprenderse de la armadura invisible del turno.
- sol-rostro: Descompresión facial y sienes. Liberar la máscara de tensión y preocupación.
- ojo-2020: Regla 20-20-20 hospitalaria. Descanso de monitores, historias clínicas y tubos de luz.
- ojo-palmeo: Palmeo ocular tibio. Calor de tus manos para relajar músculos oculares.
- ojo-gimnasia: Movimiento visual consciente. Estirar músculos ópticos fijados en pantallas.
- ojo-enfoque: Enfoque alternado cerca y lejos. Recalibrar cristalino tras visión de cerca.
- ojo-cardinales: Puntos cardinales oculares suaves. Estiramiento en cruz y diagonales para descansar la mirada.
- ojo-parpadeo: Parpadeo e hidratación consciente. Combatir resequedad ocular del aire del hospital.
`;

const VALID_IDS = [
  'resp-caja', 'resp-suspiro', 'resp-478', 'resp-46', 'resp-diafragma', 'resp-336',
  'est-cuello', 'est-hombros', 'est-manos', 'est-espalda', 'est-pectoral', 'est-lateral',
  'sol-mandibula', 'sol-gravedad', 'sol-escaneo', 'sol-descarga', 'sol-bata', 'sol-rostro',
  'ojo-2020', 'ojo-palmeo', 'ojo-gimnasia', 'ojo-enfoque', 'ojo-cardinales', 'ojo-parpadeo'
];

app.post('/api/recommend-pause', async (req, res) => {
  try {
    const chips: string[] = req.body?.chips;
    if (!Array.isArray(chips) || chips.length === 0) {
      return res.status(400).json({ error: 'Debes enviar al menos un chip' });
    }

    if (!ai) {
      // Graceful fallback signal if no API key is available
      return res.json({ fallback: true, reason: 'no_api_key' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Chips seleccionados por el trabajador del hospital: ${chips.join(', ')}`,
      config: {
        systemInstruction: `Eres un acompañante breve y cálido para personal de salud. Elige la pausa más adecuada de esta lista de IDs:\n${CATALOG_DESCRIPTIONS}\ny escribe una frase de invitación de máximo 20 palabras. No diagnostiques, no evalúes, no des consejos médicos. Responde en JSON: { id, frase }.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: {
              type: Type.STRING,
              description: 'El ID de la pausa seleccionada del catálogo',
            },
            frase: {
              type: Type.STRING,
              description: 'Frase breve y cálida de invitación de máximo 20 palabras',
            },
          },
          required: ['id', 'frase'],
        },
      },
    });

    const text = response.text?.trim() || '{}';
    const parsed = JSON.parse(text);

    if (parsed.id && VALID_IDS.includes(parsed.id)) {
      return res.json({
        id: parsed.id,
        frase: parsed.frase || 'Toma este minuto con calma.',
      });
    }

    // If ID returned was unexpected, trigger graceful fallback
    return res.json({ fallback: true, reason: 'invalid_id' });
  } catch (error) {
    // Return graceful fallback without error disclosure
    return res.json({ fallback: true, reason: 'error' });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
