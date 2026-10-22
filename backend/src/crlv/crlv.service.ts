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
    let text: string | undefined;
    try {
        const response = await this.ai.models.generateContent({
        model: this.model,
        contents: [
            {
            inlineData: {
                mimeType: file.mimetype,
                data: file.buffer.toString('base64'),
            },
            },
            { text: PROMPT },
        ],
        config: { responseMimeType: 'application/json' },
        });
        text = response.text;
    } catch (err) {
        this.logger.error(`Erro ao chamar o Gemini (modelo: ${this.model})`, err);
        throw new BadGatewayException(
        'Falha ao consultar o Gemini. Tente novamente.',
        );
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