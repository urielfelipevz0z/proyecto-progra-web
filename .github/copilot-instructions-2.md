---

## 📝 Prompt para separar archivos Vue (.vue)

**Objetivo:**
Separar todos los archivos `.vue` que actualmente contienen `<template>`, `<script>` y `<style>` en un único archivo, en archivos individuales manteniendo intacta toda la lógica, estilos y estructura original. No añadir, modificar o eliminar ninguna funcionalidad ni estilo.

### 🗃️ **Estructura Final Deseada**

```
/src
  /components o views
    /NombreComponente o views
      - NombreComponente.vue (solo importa archivos externos)
      - NombreComponente.html (template)
      - NombreComponente.js (script)
      - NombreComponente.css (estilos, opcionalmente .scss o .less si se utiliza preprocesador)
```

### 🛠️ **Requisitos de la separación**

* **Archivo `.vue` principal** (`NombreComponente.vue`):

  * Contendrá únicamente las etiquetas `<template>`, `<script>` y `<style>` con referencias externas.
  * Ejemplo:

    ```html
    <template src="./NombreComponente.html"></template>
    <script src="./NombreComponente.js"></script>
    <style src="./NombreComponente.css"></style>
    ```

* **Archivo HTML** (`NombreComponente.html`):

  * Incluirá solamente el código original dentro de la etiqueta `<template>` sin modificar.

* **Archivo JavaScript** (`NombreComponente.js`):

  * Contendrá únicamente el código original dentro de la etiqueta `<script>` sin alterar nada.

* **Archivo CSS** (`NombreComponente.css`):

  * Incluirá únicamente los estilos originales de la etiqueta `<style>` sin añadir ni modificar estilos.

### 🚫 **Restricciones claras (No hacer)**

* NO modificar lógica, funciones o importaciones del script original.
* NO cambiar estructura o clases del HTML original.
* NO modificar o agregar estilos CSS nuevos.
* NO incluir código adicional más allá del que ya existe en los componentes originales.

---