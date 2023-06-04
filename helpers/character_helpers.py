import json

def get_character(file_path, key):
    f = open(file_path, encoding="utf8")
    characters = json.load(f)

    for c in characters:
        if c['key'] == key:
            character = c
            break

    return character

def get_all_characters(file_path):
    f = open(file_path, encoding="utf8")

    return json.load(f)