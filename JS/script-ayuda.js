// 1. Esperamos a que todo el HTML esté cargado antes de tocar el DOM
document.addEventListener("DOMContentLoaded", function () {

    // 2. Buscamos los elementos que nos interesan por su id/clase
    const formulario = document.getElementById("buscador");
    const input = document.getElementById("buscar");
    const tarjetas = document.querySelectorAll(".carta");

    // 3. Escuchamos el evento "submit" del formulario (cuando das clic en la lupa o Enter)
    formulario.addEventListener("submit", function (evento) {
        
        // Evita que la página se recargue (comportamiento normal de los forms)
        evento.preventDefault();

        // Tomamos el texto escrito, quitamos espacios extra y lo pasamos a minúsculas
        const textoBuscado = input.value.trim().toLowerCase();

        // 4. Recorremos cada tarjeta para comparar su contenido
        tarjetas.forEach(function (tarjeta) {
            const titulo = tarjeta.querySelector("h4").textContent.toLowerCase();
            const descripcion = tarjeta.querySelector("p").textContent.toLowerCase();

            // Si el texto buscado está en el título o la descripción, se muestra; si no, se oculta
            if (titulo.includes(textoBuscado) || descripcion.includes(textoBuscado)) {
                tarjeta.style.display = "flex"; // o "block", según cómo lo tengas en tu CSS
            } else {
                tarjeta.style.display = "none";
            }
        });
    });

    // 5. Bonus: si el usuario borra el texto, mostramos todo otra vez automáticamente
    input.addEventListener("input", function () {
        if (input.value.trim() === "") {
            tarjetas.forEach(t => t.style.display = "flex");
        }
    });

});