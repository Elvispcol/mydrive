# Cómo subir MyDrive a GitHub

Sigue estos pasos desde la carpeta del proyecto. Son comandos de copiar y pegar.

## 1. Crear el repositorio en GitHub

1. Entra a github.com y haz clic en **New repository**.
2. Nombre: `mydrive`.
3. Déjalo **privado** (es software propietario).
4. **No** marques "Add a README" (ya tenemos uno).
5. Crea el repositorio y copia la URL que te da (algo como
   `https://github.com/tu-usuario/mydrive.git`).

## 2. Inicializar y subir desde tu máquina

Abre una terminal en la carpeta `mydrive/` y ejecuta:

```bash
git init
git add .
git commit -m "feat: arquitectura base, modelo de datos y seguridad RLS"
git branch -M main
git remote add origin https://github.com/tu-usuario/mydrive.git
git push -u origin main
```

Reemplaza la URL del `remote add` por la tuya.

## 3. Crear la rama de desarrollo

```bash
git checkout -b dev
git push -u origin dev
```

A partir de aquí, el trabajo nuevo va en ramas `feat/...` que salen de `dev`.

## 4. Siguiente paso: Claude Code

Una vez en GitHub, abre la carpeta del proyecto con **Claude Code**. Desde ahí podrás:
- Aplicar las migraciones a tu proyecto de Supabase.
- Crear las Edge Functions (generar novedades, enviar correos).
- Iterar el backend con commits directos.

El frontend lo generas con v0 en una carpeta/repo hermana, consumiendo este backend.

---

¿Dudas con algún paso? Cualquier error que te salga en la terminal, cópialo y te
ayudo a resolverlo.
