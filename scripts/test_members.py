import asyncio
import httpx
import time

async def test_members():
    # Token from previous test (hardcoded for quick check)
    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NzA5OTIyNDcsInN1YiI6ImFkbWluQGNhcmRpZ2kuY29tIn0.poM_4M_AzDWQ9Iq-Z8lDflweoVW9gE8GclHsN2c95O4"
    url = "http://127.0.0.1:8000/api/v1/members/"
    headers = {"Authorization": f"Bearer {token}"}
    
    print(f"Connecting to {url}...")
    start = time.time()
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(url, headers=headers)
            print(f"Status: {response.status_code}")
            print(f"Body: {response.text[:200]}...")
    except Exception as e:
        print(f"Error: {e}")
    print(f"Duration: {time.time() - start:.2f}s")

if __name__ == "__main__":
    asyncio.run(test_members())
