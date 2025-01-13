# Используем образ линукс Alpine
FROM node:19.5.0-alpine

# Указываем нашу рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем оставшееся приложение в контейнер
COPY . .

# Установливаем Prisma
RUN npm install -g prisma

# Генерируем prisma-client
RUN prisma generate

# Копируем нашу схему для Prisma
COPY prisma/schema.prisma ./prisma/

# Создаём бидд
RUN npm run build

# Открыть порт в нашем контейнере
EXPOSE 3000

# Запускаем наш сервер
CMD ["npm", "run", "start:prod"]