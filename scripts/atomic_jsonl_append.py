#!/usr/bin/env python3
import json
import sys
import os
import fcntl

def atomic_append(jsonl_path, obj):
    """Atomically append a JSON object as a line to a JSONL file with file locking."""
    # Ensure directory exists
    os.makedirs(os.path.dirname(jsonl_path), exist_ok=True)
    
    # Open with append mode, lock, write, flush, unlock
    with open(jsonl_path, 'a', encoding='utf-8') as f:
        fcntl.flock(f.fileno(), fcntl.LOCK_EX)
        try:
            f.write(json.dumps(obj, ensure_ascii=False) + '\n')
            f.flush()
            os.fsync(f.fileno())
        finally:
            fcntl.flock(f.fileno(), fcntl.LOCK_UN)

def main():
    if len(sys.argv) < 4:
        print(f"Usage: {sys.argv[0]} --file <jsonl_path> --json-file <input_json>")
        print(f"       {sys.argv[0]} --file <jsonl_path> --json '<json_string>'")
        sys.exit(1)
    
    jsonl_path = None
    json_obj = None
    
    i = 1
    while i < len(sys.argv):
        if sys.argv[i] == '--file':
            jsonl_path = sys.argv[i+1]
            i += 2
        elif sys.argv[i] == '--json-file':
            with open(sys.argv[i+1], 'r', encoding='utf-8') as f:
                json_obj = json.load(f)
            i += 2
        elif sys.argv[i] == '--json':
            json_obj = json.loads(sys.argv[i+1])
            i += 2
        else:
            i += 1
    
    if not jsonl_path or json_obj is None:
        print("Error: --file and (--json-file or --json) are required")
        sys.exit(1)
    
    atomic_append(jsonl_path, json_obj)
    print(f"Appended to {jsonl_path}")

if __name__ == '__main__':
    main()