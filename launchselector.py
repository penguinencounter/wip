import sys
import os


# Launch selector
configs = {
    'Start server': f'{sys.executable} app.py',
    'Build static website': f'{sys.executable} app.py -s'
}

print("+" + "="*73 + "+")
print("|" + f"Launch configurations ({len(configs)})".center(73) + "|")
print("|" + " "*73 + "|")
for i, key in enumerate(configs.keys()):
    print("|" + f" {i}: {key}".ljust(73) + "|")
print("+" + "="*73 + "+")
while True:
    print(f"Select a configuration (0-{len(configs)-1}):")
    selection = input("?> ")

    if selection.isdigit():
        selection = int(selection)
    else:
        print("Invalid selection: not a number")
        continue
    if selection < 0 or selection >= len(configs):
        print("Invalid selection: out of range")
        continue
    break
print("Selected: " + list(configs.keys())[selection])
print("Runs    : " + list(configs.values())[selection])
os.system(list(configs.values())[selection])
