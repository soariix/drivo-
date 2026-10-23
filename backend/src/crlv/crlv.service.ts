import {
  BadGatewayException,
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

const PROMPT = `Você recebe um CRLV (Certificado de Registro e Licenciamento de Veículo) brasileiro.
Extraia os dados e responda SOMENTE com um JSON com estas chaves:
plate (placa, sem hífen, maiúscula),
renavam (apenas números),
chassis (chassi, 17 caracteres),
brand (marca; se vier como "MARCA/MODELO", separe a marca),
model (modelo/versão; se vier como "MARCA/MODELO", separe o modelo),
manufactureYear (ano de fabricação, número),
modelYear (ano do modelo, número),
color (cor, primeira letra maiúscula),
fuel (combustível, ex: Gasolina, Etanol, Flex, Diesel, Híbrido, Elétrico, GNV),
type ("Automóvel" ou "Moto").
Se não encontrar algum campo, use null. Não escreva nada além do JSON.`;

const RETRYABLE_STATUS = [429, 500, 503];
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function detectMimeType(buffer: Buffer, fallback: string): string {
  if (buffer.subarray(0, 4).toString('latin1') === '%PDF') {
    return 'application/pdf';
  }
  if (buffer.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]))) {
    return 'image/png';
  }
  if (buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) {
    return 'image/jpeg';
  }
  return fallback;
}

@Injectable()
export class CrlvService {
  private readonly logger = new Logger(CrlvService.name);
  private ai: GoogleGenAI;
  private model: string;

  constructor(config: ConfigService) {
    this.ai = new GoogleGenAI({
      apiKey: config.getOrThrow<string>('GEMINI_API_KEY'),
    });
    this.model = config.get<string>('GEMINI_MODEL') ?? 'gemini-3.5-flash';
  }

  async scan(file: Express.Multer.File) {
    const mimeType = detectMimeType(file.buffer, file.mimetype);
    let text: string | undefined;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await this.ai.models.generateContent({
          model: this.model,
          contents: [
            {
              inlineData: {
                mimeType,
                data: file.buffer.toString('base64'),
              },
            },
            { text: PROMPT },
          ],
          config: { responseMimeType: 'application/json' },
        });
        text = response.text;
        break;
      } catch (err) {
        const status = (err as { status?: number }).status;
        this.logger.error(
          `Gemini falhou (modelo ${this.model}, tipo ${mimeType}, tentativa ${attempt}, status ${status ?? 'sem status'})`,
          err,
        );
        if (attempt === 3 || !RETRYABLE_STATUS.includes(status ?? 0)) {
          throw new BadGatewayException(
            'Falha ao consultar o Gemini. Tente novamente.',
          );
        }
        await sleep(1500 * attempt);
      }
    }

    try {
      return JSON.parse(text ?? '');
    } catch {
      this.logger.error('Resposta do Gemini não é um JSON válido', text);
      throw new UnprocessableEntityException(
        'Não foi possível ler os dados do documento.',
      );
    }
  }
}