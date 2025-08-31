import asyncio
import json
import os
from fastapi import FastAPI, WebSocket, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title='MLflow Orchestrator API')
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RunRequest(BaseModel):
    flow: dict

@app.get('/api/steps')
async def get_steps():
    # In a real app this might be dynamic or read from a registry
    return [
        {"id":"ingest","name":"Data Ingest","description":"Load data from source"},
        {"id":"split","name":"Split","description":"Train/validation split"},
        {"id":"train","name":"Train","description":"Train model"},
        {"id":"evaluate","name":"Evaluate","description":"Evaluate model"}
    ]

@app.post('/api/run')
async def run_pipeline(req: RunRequest, background_tasks: BackgroundTasks):
    flow = req.flow
    # persist flow to file for record
    os.makedirs('runs', exist_ok=True)
    run_file = os.path.join('runs', 'last_flow.json')
    with open(run_file, 'w') as f: json.dump(flow, f, indent=2)

    # launch background runner
    background_tasks.add_task(execute_flow, run_file)
    return {"status":"started"}

# Simple pub-sub for logs: store active websocket
log_clients = set()

@app.websocket('/ws/logs')
async def websocket_logs(ws: WebSocket):
    await ws.accept()
    log_clients.add(ws)
    try:
        while True:
            # keep connection alive
            await ws.receive_text()
    except Exception:
        pass
    finally:
        log_clients.remove(ws)

async def broadcast(line: str):
    to_remove = []
    for ws in list(log_clients):
        try:
            await ws.send_text(line)
        except Exception:
            to_remove.append(ws)
    for ws in to_remove:
        if ws in log_clients:
            log_clients.remove(ws)

async def execute_flow(run_file_path: str):
    # This function tries to run `mlflow run` if available; otherwise it simulates progress.
    await broadcast('Starting pipeline run...')
    try:
        cmd = ['mlflow', 'run', '.']
        proc = await asyncio.create_subprocess_exec(*cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.STDOUT)
        while True:
            line = await proc.stdout.readline()
            if not line:
                break
            text = line.decode('utf-8', errors='replace').rstrip()
            await broadcast(text)
        rc = await proc.wait()
        await broadcast(f'Process exited with code {rc}')
    except FileNotFoundError:
        # mlflow not installed; simulate
        for i in range(1,6):
            await broadcast(f'[sim] step {i}/5 running...')
            await asyncio.sleep(1)
        await broadcast('[sim] pipeline completed')
    except Exception as e:
        await broadcast(f'Error running pipeline: {e}')

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)
