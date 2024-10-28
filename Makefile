install:
		- npm run setup && npm run build

start:

		- npm run start

docker-start:
		- cd backend && docker-compose up -d 
