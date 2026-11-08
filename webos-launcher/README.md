# Launcher webOS (LG TV 2022)

Launcher ligero que detecta tus apps instaladas y abre apps y entradas HDMI.
Se instala en el TV con el **Modo Desarrollador** de LG.

## 1. Preparar el TV
1. Crea una cuenta en https://webostv.developer.lge.com y verifica el correo.
2. En el TV: LG Content Store -> instala **Developer Mode**.
3. Abre la app, inicia sesion, activa **Dev Mode Status = ON** y **Key Server = ON**. El TV se reinicia.
4. Reabre la app y anota la **IP del TV** y la **passphrase** (key server). El modo caduca cada 50 h: pulsa "Extend" o reinstala.

## 2. Preparar la PC (misma red que el TV)
```bash
npm install -g @webos-tools/cli
ares-setup-device --add tv --info "{'host':'IP_DEL_TV','port':'9922','username':'prisoner'}"
ares-novacom --device tv --getkey      # pide la passphrase del TV
ares-device-info -d tv                 # prueba de conexion
```

## 3. Instalar y ejecutar
```bash
cd webos-launcher/..
ares-package webos-launcher            # genera com.mega.launcher_1.0.0_all.ipk
ares-install --device tv com.mega.launcher_1.0.0_all.ipk
ares-launch  --device tv com.mega.launcher
ares-inspect --device tv --app com.mega.launcher --open   # depurar (DevTools)
```

## Uso
Flechas: navegar - OK: abrir - Amarillo: fijar/quitar favorito - Atras: salir.

## Limitaciones (honestas)
- Modo Desarrollador NO reemplaza el menu Inicio de LG: el launcher es una app mas, la abres desde "Mis apps". 
  Puedes ponerla primera en la barra del Inicio y/o asignarla a un boton numerico del Magic Remote.
- Si `launch` falla por permisos en tu firmware, el estado inferior muestra el error; mandamelo y se ajusta.
- Para sustituir de verdad la interfaz hace falta root (https://webosbrew.org), que es otro nivel de riesgo.
