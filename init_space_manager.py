import os
import subprocess

project_name = "space-manager"

folders = [
    f"{project_name}/src/main",
    f"{project_name}/src/preload",
    f"{project_name}/src/renderer/modules-ui",
    f"{project_name}/src/modules",
    f"{project_name}/public",
    f"{project_name}/data/logs",
    f"{project_name}/data/cache",
    f"{project_name}/data/config"
]

# 1. Crear estructura
for folder in folders:
    os.makedirs(folder, exist_ok=True)

# 2. Comandos npm
def run_npm(cmd, cwd=project_name):
    subprocess.run(["npm", *cmd], cwd=cwd, shell=os.name == "nt")

print("🔧 Inicializando proyecto y paquetes...")

run_npm(["init", "-y"])
run_npm(["install", "react", "react-dom"])
run_npm(["install", "-D",
    "typescript", "vite", "tailwindcss", "postcss", "autoprefixer",
    "@vitejs/plugin-react", "electron", "electron-vite",
    "@types/node", "concurrently", "wait-on"
])
subprocess.run(["npx", "tsc", "--init"], cwd=project_name, shell=os.name == "nt")
subprocess.run(["npx", "tailwindcss", "init", "-p"], cwd=project_name, shell=os.name == "nt")

print("✅ Proyecto base creado en ./space-manager")

