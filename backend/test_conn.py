import asyncio, asyncpg

async def t():
    conn = await asyncpg.connect(host='127.0.0.1', port=5440, user='postgres', password='postgres', database='chatbot_db', ssl=False)
    print(await conn.fetchval('SELECT 1'))
    await conn.close()

asyncio.run(t())
