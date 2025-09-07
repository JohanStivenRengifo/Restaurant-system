# 🚀 Despliegue en Railway - Rama de Pruebas

Esta rama contiene la configuración necesaria para desplegar la aplicación del sistema de restaurante en Railway.

## 📋 Archivos de Configuración

### Archivos Creados/Modificados:
- `requirements.txt` - Dependencias con versiones específicas
- `Procfile` - Comando de inicio para Railway
- `runtime.txt` - Versión de Python (3.11.6)
- `railway.json` - Configuración específica de Railway
- `Dockerfile` - Alternativa usando Docker
- `.env.example` - Plantilla de variables de entorno
- `main.py` - Actualizado para puerto dinámico
- `config.py` - Valores por defecto para producción

## 🔧 Configuración en Railway

### 1. Variables de Entorno Requeridas

Configura estas variables en el panel de Railway:

```bash
# Supabase (OBLIGATORIAS)
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase_aqui

# JWT (OBLIGATORIA)
SECRET_KEY=tu-clave-secreta-super-segura-aqui

# Aplicación (Opcionales)
DEBUG=false
HOST=0.0.0.0
PORT=8000
TIMEZONE=America/Bogota
```

### 2. Pasos de Despliegue

1. **Conecta el repositorio** a Railway
2. **Selecciona la rama** `railway-deployment`
3. **Configura las variables** de entorno
4. **Railway detectará automáticamente** la configuración Python
5. **El despliegue se iniciará** automáticamente

### 3. Verificación Post-Despliegue

Una vez desplegado, verifica:

- ✅ **Health Check**: `https://tu-app.railway.app/health`
- ✅ **API Docs**: `https://tu-app.railway.app/docs`
- ✅ **Dashboard**: `https://tu-app.railway.app/dashboard`

## 🐛 Solución de Problemas

### Error: `ModuleNotFoundError: No module named 'pydantic_settings'`
- ✅ **Solucionado**: Agregado `pydantic-settings==2.1.0` a requirements.txt

### Error: Puerto no disponible
- ✅ **Solucionado**: Configurado puerto dinámico con `os.environ.get("PORT")`

### Error: Variables de entorno faltantes
- ✅ **Solucionado**: Valores por defecto en config.py

## 🔄 Flujo de Trabajo

1. **Desarrollo** → Rama `main`
2. **Pruebas** → Rama `railway-deployment`
3. **Producción** → Merge a `main` después de pruebas exitosas

## 📝 Notas Importantes

- Esta es una **rama de pruebas** - no afecta la producción
- Los cambios están aislados en `railway-deployment`
- Después de pruebas exitosas, hacer merge a `main`
- Mantener variables de entorno seguras

## 🚀 Comandos Git

```bash
# Cambiar a rama de pruebas
git checkout railway-deployment

# Volver a main
git checkout main

# Merge después de pruebas exitosas
git checkout main
git merge railway-deployment
git push origin main
```

---
*Configuración creada para despliegue seguro en Railway* 🚀
