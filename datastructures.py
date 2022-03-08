import json
import os


class ServerMeta:
    def __init__(self, id: int, name: str):
        self.id = id
        self.name = name
        self.player_count = 0


users = {}


def dump_users():
    global users
    print('Dump user data')
    with open('storage/users.json', 'w') as f:
        json.dump(users, f, indent=4)
        return True

def load_users():
    global users
    print('Load user data')
    if not os.path.exists('storage/users.json'):
        return False
    with open('storage/users.json', 'r') as f:
        users = json.load(f)
