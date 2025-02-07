# GDG HACK 2025 API  

This project is a backend solution built with **Moleculer** and MongoDB for real-time mentorship management and Discord bot interaction.  

## Features Implemented  

- **Backend API with Moleculer Framework:**  
  - Service-based architecture for handling user management, questions, skills, and mentorship sessions.  

- **MongoDB Collections:**  
  - User data  
  - Question records  
  - Skills  
  - Mentorship sessions  

- **Discord Bot Integration:**  
  - Commands implemented:  
    - `/ask`: Submit a question  
    - `/collab`: Start a mentorship session  

- **Command Loader:**  
  - Automated loading for Discord commands using an ASCII Table for better organization.  

## How to Run  

1. Clone the project and navigate to the directory:  
   ```bash
   git clone https://github.com/bens1001/gdg-hack-2025-api
   cd gdg-hack-2025-api
   ```

2. Install dependencies:  
   ```bash
   pnpm install
   ```

3. Add environment variables to `.env`:  
   ```
   DISCORD_BOT_TOKEN=your_discord_bot_token
   MONGO_URI=mongodb://localhost:27017/gdg-hack-2025-api
   ```

4. Start the services:  
   ```bash
   pnpm run dev
   ``` 

## Summary  
- Microservices architecture for mentorship management  
- Real-time interaction using Discord commands  
- Scalable backend design using Moleculer and MongoDB
