import { ReactNode } from "react";
import { SWRConfig } from "swr";

export const SWRProvider = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <SWRConfig
        value={{
          // Базовый URL для всех запросов
          fetcher: (resource, init) =>
            fetch(`https://api.rltorg.ru${resource}`, init).then((res) =>
              res.json()
            ),

          // Количество повторных попыток при ошибках
          errorRetryCount: 3,

          // Интервал между повторными попытками
          errorRetryInterval: 5000,

          // Автоматически повторять запрос при фокусе окна
          revalidateOnFocus: true,

          // Автоматически повторять запрос при восстановлении сети
          revalidateOnReconnect: true,

          // Опции обновления данных
          refreshInterval: 0, // отключено по умолчанию

          // Дедупликация запросов в течение этого времени (мс)
          dedupingInterval: 2000,

          // Таймаут запроса по умолчанию
          loadingTimeout: 3000,

          // Обработчик ошибок
          onError: (error, key) => {
            console.error("SWR Error:", error, "Key:", key);
            // Здесь можно добавить отправку ошибок в мониторинг
          },

          // Сравниватель для глубокого сравнения объектов
          compare: (a, b) => JSON.stringify(a) === JSON.stringify(b),

          // Настройки кэша
          provider: () => new Map(),
        }}
      >
        {children}
      </SWRConfig>
    </>
  );
};
