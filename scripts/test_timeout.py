import asyncio
import httpx
import time

async def test_login():
    url = "http://127.0.0.1:8000/api/v1/auth/login"
    data = {
        "username": "admin@cardigi.com",
        "password": "Password123!"
    }
    print(f"Connecting to {url}...")
    start = time.time()
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(url, data=data)
            print(f"Status: {response.status_code}")
            print(f"Body: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
    print(f"Duration: {time.time() - start:.2f}s")

if __name__ == "__main__":
    asyncio.run(test_login())
