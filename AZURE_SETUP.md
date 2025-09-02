# 🔐 Azure OpenAI Setup Instructions

## ⚠️ **IMPORTANTE: Configuración de Variables de Entorno**

Para que Nova Voice funcione con GPT-4o Realtime API, necesitas configurar tu API key de Azure OpenAI.

### **Opción 1: Variables de Entorno (Recomendado)**

Crea un archivo `.env` en la raíz del proyecto:

```bash
# Archivo: .env
VITE_AZURE_OPENAI_API_KEY=tu_api_key_aqui
```

### **Opción 2: Modificación Directa**

Si no puedes usar variables de entorno, modifica directamente:

**Archivo: `src/utils/GPT4oRealtimeClient.js`**
```javascript
// Línea 23, reemplaza:
this.API_KEY = import.meta.env.VITE_AZURE_OPENAI_API_KEY || "YOUR_API_KEY_HERE"

// Por tu API key real:
this.API_KEY = "TU_API_KEY_AZURE_OPENAI_AQUI"
```

## 🔑 **Configuración Azure OpenAI**

```
Resource: aiass-mezvze9t-eastus2.cognitiveservices.azure.com
Region: eastus2  
Deployment: gpt-4o-realtime-preview
API Key: [OBTENER_DE_AZURE_PORTAL]
```

⚠️ **Para obtener tu API Key**: Azure Portal → Tu recurso OpenAI → Keys and Endpoint

## 🚀 **Testing Local**

```bash
# 1. Configurar API key (elegir una opción de arriba)
# 2. Instalar dependencias
npm install

# 3. Correr en desarrollo
npm run dev

# 4. Abrir http://localhost:5173
# 5. Click en círculo neumórfico → Debe conectar GPT-4o
```

## ⚡ **Deployment Azure**

Para Azure Static Web Apps, configura la variable de entorno:

1. **Azure Portal** → Tu Static Web App
2. **Configuration** → **Application Settings** 
3. **Add**: `VITE_AZURE_OPENAI_API_KEY` = `tu_api_key`
4. **Save** y redeploy

## 🔒 **Seguridad**

- ✅ **Nunca** commitear API keys al repositorio
- ✅ **Usar** variables de entorno para producción  
- ✅ **Regenerar** keys si se exponen accidentalmente
- ✅ **El archivo `.env`** está en `.gitignore` automáticamente

---

**🎯 Una vez configurado, el círculo neumórfico funcionará con GPT-4o real.**
