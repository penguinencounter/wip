import json
import os
import base64


class ServerMeta:
    def __init__(self, id: int, name: str):
        self.id = id
        self.name = name
        self.player_count = 0


class User:
    def __init__(self, name: str, hash: str):
        self.name = name
        self.hash = hash
        self.tokens = []

    def add_token(self, token: str):
        self.tokens.append(token)

    def gen_token(self):
        t = str(base64.b64encode(os.urandom(24)), encoding='utf-8')
        print(f'New token for {self.name}: {t[:8]}...')
        self.add_token(t)
        return t

    @classmethod
    def load(cls, json: dict):
        u = User(json["name"], json["hash"])
        return u

    def dump(self):
        return {
            "name": self.name,
            "hash": self.hash
        }


users = {}


def dump_users():
    global users
    conv_users = {}
    print('Dump user data')
    for k, v in users.items():
        conv_users[k] = v.dump()
    with open('storage/users.json', 'w') as f:
        json.dump(conv_users, f, indent=4)
        return True

def load_users():
    global users
    print('Load user data')
    users = {}
    if not os.path.exists('storage/users.json'):
        print('No user data')
        return False
    with open('storage/users.json', 'r') as f:
        conv_users = json.load(f)
        print(f'Loaded {len(conv_users)} users')
    for k, v in conv_users.items():
        users[k] = User.load(v)
