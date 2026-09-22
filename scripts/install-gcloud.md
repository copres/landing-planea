# Instalar Google Cloud SDK (gcloud CLI)

## Windows

### Opción 1: Instalador oficial (Recomendado)

1. Descarga el instalador desde: https://cloud.google.com/sdk/docs/install
2. Ejecuta el instalador
3. Sigue las instrucciones del instalador
4. Reinicia tu terminal/PowerShell

### Opción 2: Usando Chocolatey

```powershell
choco install gcloudsdk
```

### Opción 3: Usando Scoop

```powershell
scoop install gcloud
```

## Después de instalar

1. Abre una nueva terminal/PowerShell
2. Ejecuta:
```bash
gcloud init
```

3. Sigue las instrucciones para:
   - Iniciar sesión con tu cuenta de Google
   - Seleccionar o crear un proyecto
   - Habilitar las APIs necesarias

4. Autentica para aplicaciones:
```bash
gcloud auth application-default login
```

5. Configura el proyecto:
```bash
gcloud config set project TU-PROJECT-ID
```

6. Habilita la API de Translation:
```bash
gcloud services enable translate.googleapis.com
```

## Verificar instalación

```bash
gcloud --version
```
