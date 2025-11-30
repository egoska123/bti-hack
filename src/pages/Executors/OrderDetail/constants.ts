export interface OrderDetailData {
  id: string;
  description: string[];
  visitDates: string[];
  model2DUrl?: string;
  model3DUrl?: string;
  documents: Array<{
    id: string;
    name: string;
    previewUrl: string;
  }>;
}

// Моковые данные для демонстрации
// В реальном приложении эти данные будут приходить из API
// Изображения будут загружаться с сервера или из локальных ассетов
export const ORDER_DETAILS_MOCK: Record<string, OrderDetailData> = {
  '1': {
    id: '1',
    description: [
      'Снос стен: 1,2',
      'Перепланировка комнат',
    ],
    visitDates: [
      '12.12.2025 12:00-16:00',
      '13.12.2025 12:00-16:00',
      '14.12.2025 12:00-16:00',
    ],
    // В реальном приложении URL будут приходить из API
    model2DUrl: 'https://www.figma.com/api/mcp/asset/a6e07590-5470-4e0e-8244-601cd233c177',
    model3DUrl: 'https://www.figma.com/api/mcp/asset/4eb81544-470d-48cb-934a-b3c2f7dc3bf9',
    documents: [
      { id: '1', name: 'Документ 1', previewUrl: 'https://www.figma.com/api/mcp/asset/bf39b440-1f8e-4835-8d02-d1882a1b3382' },
      { id: '2', name: 'Документ 2', previewUrl: 'https://www.figma.com/api/mcp/asset/bf39b440-1f8e-4835-8d02-d1882a1b3382' },
      { id: '3', name: 'Документ 3', previewUrl: 'https://www.figma.com/api/mcp/asset/bf39b440-1f8e-4835-8d02-d1882a1b3382' },
      { id: '4', name: 'Документ 4', previewUrl: 'https://www.figma.com/api/mcp/asset/bf39b440-1f8e-4835-8d02-d1882a1b3382' },
    ],
  },
};

