import { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import type { ChatMessage } from './types';
import { MOCK_CHAT_MESSAGES } from './constants';

interface ChatContextType {
  messages: ChatMessage[];
  sendMessage: (text: string, images?: string[]) => void;
  isLoading: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Моковые ответы ассистента
const generateAssistantResponse = (userMessage: string): string => {
  const lowerMessage = userMessage.toLowerCase();
  
  // Сценарии обрабатываются через состояние, не через проверку сообщений
  // Эта функция используется только для стандартных ответов
  
  // Простые правила для генерации ответов
  if (lowerMessage.includes('привет') || lowerMessage.includes('здравствуй')) {
    return 'Привет! Чем могу помочь с планировкой?';
  }
  
  if (lowerMessage.includes('помощь') || lowerMessage.includes('помоги')) {
    return 'Конечно! Я помогу вам с планировкой квартиры. Вы можете создавать стены, зоны, добавлять двери и окна. Что именно вас интересует?';
  }
  
  if (lowerMessage.includes('стена') || lowerMessage.includes('стены')) {
    return 'Для работы со стенами: кликните на стену, чтобы выбрать её, затем используйте правую кнопку мыши для редактирования. Вы можете изменить толщину, длину и другие параметры.';
  }
  
  if (lowerMessage.includes('зона') || lowerMessage.includes('комната')) {
    return 'Зоны (комнаты) создаются автоматически при добавлении стен. Вы можете изменить цвет и текстуру зоны через панель свойств.';
  }
  
  if (lowerMessage.includes('дверь') || lowerMessage.includes('двери')) {
    return 'Двери добавляются на стены. Выберите стену и используйте инструмент "Добавить дверь" в панели инструментов.';
  }
  
  if (lowerMessage.includes('окно') || lowerMessage.includes('окна')) {
    return 'Окна добавляются аналогично дверям. Выберите стену и используйте инструмент "Добавить окно".';
  }
  
  if (lowerMessage.includes('спасибо') || lowerMessage.includes('благодарю')) {
    return 'Пожалуйста! Если возникнут ещё вопросы, обращайтесь.';
  }
  
  if (lowerMessage.includes('план') || lowerMessage.includes('планировка')) {
    return 'Я могу помочь вам создать план квартиры. Начните с добавления стен, затем система автоматически создаст зоны. Вы можете редактировать размеры и расположение элементов.';
  }
  
  // Общий ответ по умолчанию
  return 'Понял ваш вопрос. Я помогу вам с планировкой квартиры. Можете задать более конкретный вопрос о стенах, зонах, дверях или окнах.';
};

// Очередь ответов для сценария
const SCENARIO_RESPONSES = [
  `Обнаружена несущая стена. Снос запрещен! ❌

Юридические последствия:

• Статья 29 ЖК РФ: самовольное переустройство влечет обязанность привести помещение обратно за свой счет

• Статья 7.21 КоАП РФ: штраф до 2500 руб. для физических лиц

• При причинении ущерба: гражданско-правовая ответственность с возмещением в полном объеме

• При опасности для здания: возможно уголовное преследование по статье 168 УК РФ

Риски для собственника:

- Квартира может быть признана непригодной для проживания

- Невозможность продажи, дарения, залога до устранения нарушений

- Обязанность оплатить восстановительные работы всем пострадавшим собственникам

Что рекомендую:

- Рассмотреть альтернативные варианты - создание арки или декоративного проема (с согласованием)

- Обратиться к нашему сертифицированному инженеру для консультации

- Использовать визуальное зонирование вместо сноса`,
  'Конечно! Отправьте мне ваш профиль для планировки квартиры (рост, семья, профессия, увлечения)',
  `Профиль для планировки квартиры:

*   Рост: 182 см

*   Семья: женат, двое детей (2 и 5 лет), собака

*   Профессия: архитектор (иногда работаю из дома)

*   Увлечения: игра на гитаре, пауэрлифтинг, коллекционирование винила`,
];

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_CHAT_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);
  const scenarioResponseIndexRef = useRef<number>(-1);
  const isProcessingRef = useRef<boolean>(false);
  const scenarioCompletedRef = useRef<boolean>(false);

  const sendMessage = useCallback((text: string, images?: string[]) => {
    if (!text.trim() && (!images || images.length === 0)) {
      return;
    }

    // Защита от двойной отправки
    if (isProcessingRef.current) {
      return;
    }
    isProcessingRef.current = true;

    const chatId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
    const orderId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
    const userId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

    // Создаем сообщение пользователя
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      chatId,
      orderId,
      senderId: userId,
      senderType: 'user',
      messageText: text.trim() || '',
      images: images && images.length > 0 ? images : undefined,
      meta: {},
      createdAt: new Date().toISOString(),
    };

    // Добавляем сообщение пользователя
    setMessages((prev) => [...prev, userMessage]);
    
    // Генерируем ответ ассистента только если есть текст
    if (text.trim()) {
      // Определяем следующий индекс ответа
      let nextIndex = scenarioResponseIndexRef.current;
      
      // Если сценарий еще не начат, начинаем с первого ответа
      if (scenarioResponseIndexRef.current === -1) {
        nextIndex = 0;
        scenarioResponseIndexRef.current = 0;
      } else {
        // Продолжаем сценарий - переходим к следующему ответу
        nextIndex = scenarioResponseIndexRef.current + 1;
        scenarioResponseIndexRef.current = nextIndex;
      }
      
      // Если сценарий уже завершен, показываем загрузку 60 секунд и ошибку сети
      if (scenarioCompletedRef.current) {
        sendNetworkError();
      }
      // Если есть ответ в сценарии, отправляем его
      else if (nextIndex >= 0 && nextIndex < SCENARIO_RESPONSES.length) {
        sendScenarioResponse(SCENARIO_RESPONSES[nextIndex]);
        // Проверяем, завершен ли сценарий после отправки последнего ответа
        if (nextIndex === SCENARIO_RESPONSES.length - 1) {
          scenarioCompletedRef.current = true;
        }
      } else if (nextIndex >= SCENARIO_RESPONSES.length) {
        // Сценарий завершен, сбрасываем индекс
        scenarioResponseIndexRef.current = -1;
        scenarioCompletedRef.current = true;
        // После завершения сценария не отправляем стандартный ответ
      } else {
        // Сценарий не активен, отправляем стандартный ответ
        sendStandardResponse(text);
      }
    }
    
    // Сбрасываем флаг обработки после небольшой задержки
    setTimeout(() => {
      isProcessingRef.current = false;
    }, 100);
  }, []);

  // Функция для отправки ответа из сценария
  const sendScenarioResponse = useCallback((responseText: string) => {
    const chatId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
    const orderId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
    
    setIsLoading(true);
    const timeoutId = setTimeout(() => {
      setMessages((prev) => {
        // Проверяем, нет ли уже такого сообщения (защита от дубликатов)
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.messageText === responseText && lastMessage.senderType === 'assistant') {
          setIsLoading(false);
          return prev;
        }

        const assistantResponse: ChatMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          chatId,
          orderId,
          senderId: 'assistant-1',
          senderType: 'assistant',
          messageText: responseText,
          meta: {},
          createdAt: new Date().toISOString(),
        };

        setIsLoading(false);
        return [...prev, assistantResponse];
      });
    }, 1000 + Math.random() * 4000);
    
    return () => clearTimeout(timeoutId);
  }, []);

  // Функция для отправки стандартного ответа
  const sendStandardResponse = useCallback((userText: string) => {
    const chatId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
    const orderId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
    
    setIsLoading(true);
    const timeoutId = setTimeout(() => {
      setMessages((prev) => {
        const responseText = generateAssistantResponse(userText);
        // Проверяем, нет ли уже такого сообщения (защита от дубликатов)
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.messageText === responseText && lastMessage.senderType === 'assistant') {
          setIsLoading(false);
          return prev;
        }

        const assistantResponse: ChatMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          chatId,
          orderId,
          senderId: 'assistant-1',
          senderType: 'assistant',
          messageText: responseText,
          meta: {},
          createdAt: new Date().toISOString(),
        };

        setIsLoading(false);
        return [...prev, assistantResponse];
      });
    }, 1000 + Math.random() * 4000);
    
    return () => clearTimeout(timeoutId);
  }, []);

  // Функция для отправки ошибки сети после 60 секунд загрузки
  const sendNetworkError = useCallback(() => {
    const chatId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
    const orderId = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
    
    setIsLoading(true);
    const timeoutId = setTimeout(() => {
      setMessages((prev) => {
        const errorMessage: ChatMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          chatId,
          orderId,
          senderId: 'assistant-1',
          senderType: 'assistant',
          messageText: 'Ошибка сети',
          meta: {},
          createdAt: new Date().toISOString(),
        };

        setIsLoading(false);
        return [...prev, errorMessage];
      });
    }, 60000); // 60 секунд
    
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <ChatContext.Provider value={{ messages, sendMessage, isLoading }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

