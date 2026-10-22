const COLORS: Record<string, string> = {
    prata: '#c0c0c0',
    preto: '#1c1c1e',
    branco: '#f2f2f7',
    cinza: '#8e8e93',
    azul: '#0a84ff',
    vermelho: '#ff453a',
    verde: '#30d158',
    amarelo: '#ffd60a',
    laranja: '#ff9f0a',
    marrom: '#8b5a2b',
    bege: '#d9c7a3',
};

export const colorDot = (name: string) =>
    COLORS[name.trim().toLowerCase()] ?? '#8e8e93';

export const maskChassis = (chassis: string) =>
    chassis.length <= 7
    ? chassis
    : `${chassis.slice(0, 3)}${'•'.repeat(chassis.length - 7)}${chassis.slice(-4)}`;

export const getInitials = (first: string, last?: string) =>
    `${first[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase();

export const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    });

export const memberSince = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
    });